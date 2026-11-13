import "server-only";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { destroyCloudinaryImage } from "@/lib/cloudinary";
import UserModel from "@/models/users";
import AdminProfileModel from "@/models/adminProfile";
import AuditLogModel from "@/models/auditLog";
import AuthTokenModel from "@/models/authTokens";
import TransactionModel from "@/models/transaction";
import VerificationSessionModel from "@/models/verificationSession";
import VolunteerModel from "@/models/volunteerApplication";
import DeletionRequestModel, {
  type IDeletionRequest,
} from "@/models/deletionRequest";
import { nextSequence } from "@/models/counter";

/** Days between an admin deleting an account and its anonymization. */
export const DELETION_RETENTION_DAYS = 30;

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; status: number; message: string };

async function generateReference(now: Date): Promise<string> {
  const year = now.getUTCFullYear();
  const seq = await nextSequence(`deletion_request:${year}`);
  return `DEL-${year}-${String(seq).padStart(6, "0")}`;
}

/** Signs the user out everywhere (Better Auth sessions live in their own collection). */
export async function revokeUserSessions(userId: string) {
  const ctx = await auth.$context;
  await ctx.internalAdapter.deleteUserSessions(userId);
}

/**
 * Soft-deletes a user: marks them deleted, signs them out, suspends any admin
 * profile and opens a deletion request that the cron anonymizes after
 * DELETION_RETENTION_DAYS. Permission checks are the caller's job.
 */
export async function requestUserDeletion({
  userId,
  adminId,
  reason,
}: {
  userId: string;
  adminId: string;
  reason?: string;
}): Promise<Result<IDeletionRequest>> {
  if (!mongoose.isValidObjectId(userId)) {
    return { ok: false, status: 400, message: "Invalid user ID" };
  }
  if (userId === adminId) {
    return { ok: false, status: 400, message: "You cannot delete your own account" };
  }

  const now = new Date();

  // Atomic transition so two admins can't open two requests for one user.
  const user = await UserModel.findOneAndUpdate(
    { _id: userId, status: { $ne: "deleted" } },
    { $set: { status: "deleted", deletedAt: now } },
    { returnDocument: "before" },
  );

  if (!user) {
    const exists = await UserModel.exists({ _id: userId });
    return exists
      ? { ok: false, status: 409, message: "User is already deleted" }
      : { ok: false, status: 404, message: "User not found" };
  }

  let request: IDeletionRequest;
  try {
    const scheduledFor = new Date(now);
    scheduledFor.setUTCDate(scheduledFor.getUTCDate() + DELETION_RETENTION_DAYS);

    request = await DeletionRequestModel.create({
      reference: await generateReference(now),
      userId,
      requestedBy: adminId,
      requestedAt: now,
      scheduledFor,
      status: "pending",
      reason: reason?.trim() || undefined,
    });
  } catch (error) {
    // Roll the user back so we never have a deleted user without a request.
    await UserModel.updateOne(
      { _id: userId },
      { $set: { status: user.status }, $unset: { deletedAt: "" } },
    );
    throw error;
  }

  await revokeUserSessions(userId);
  await AdminProfileModel.updateOne({ userId }, { status: "suspended" });

  await AuditLogModel.create({
    adminId,
    action: "DELETE_USER",
    targetId: userId,
    targetModel: "User",
    details: `Scheduled deletion ${request.reference} for user ${userId}; anonymization on ${request.scheduledFor.toISOString().slice(0, 10)}`,
    metadata: {
      reference: request.reference,
      previousStatus: user.status,
      wasAdmin: user.role === "admin",
    },
  });

  return { ok: true, value: request };
}

/**
 * Cancels a pending deletion and reactivates the user. A restored admin's
 * profile stays suspended until someone with manage:admins reactivates it.
 */
export async function restoreUserDeletion({
  requestId,
  adminId,
}: {
  requestId: string;
  adminId: string;
}): Promise<Result<IDeletionRequest>> {
  if (!mongoose.isValidObjectId(requestId)) {
    return { ok: false, status: 400, message: "Invalid request ID" };
  }

  // Only pending requests can be restored. A failed request may already have
  // removed some data (e.g. the volunteer application), so it isn't offered.
  const request = await DeletionRequestModel.findOneAndUpdate(
    { _id: requestId, status: "pending" },
    {
      $set: { status: "cancelled", cancelledBy: adminId, cancelledAt: new Date() },
    },
    { returnDocument: "after" },
  );

  if (!request) {
    const existing = await DeletionRequestModel.findById(requestId);
    if (!existing) {
      return { ok: false, status: 404, message: "Deletion request not found" };
    }
    const messages: Record<string, string> = {
      completed: "This account has already been anonymized and can't be restored",
      failed: "Anonymization has already started for this account, so it can't be restored",
      cancelled: "This deletion request was already cancelled",
    };
    return { ok: false, status: 409, message: messages[existing.status] };
  }

  await UserModel.updateOne(
    { _id: request.userId },
    { $set: { status: "active" }, $unset: { deletedAt: "" } },
  );

  await AuditLogModel.create({
    adminId,
    action: "RESTORE_USER",
    targetId: String(request.userId),
    targetModel: "User",
    details: `Cancelled deletion ${request.reference} and restored user ${request.userId}`,
    metadata: { reference: request.reference },
  });

  return { ok: true, value: request };
}

const ANONYMIZED_AUDIT_DETAILS =
  "Details redacted after the user's account was anonymized";

/**
 * Removes the personal data of a user whose deletion request is due.
 * Every step is idempotent, so a failed run can simply be retried.
 */
export async function anonymizeUser(request: IDeletionRequest): Promise<void> {
  const userId = String(request.userId);
  const user = await UserModel.findById(userId);

  if (user && user.status !== "deleted") {
    throw new Error(`User ${userId} is no longer marked deleted`);
  }

  if (user) {
    // Volunteer application: photo, address and next-of-kin details.
    const volunteer = await VolunteerModel.findOne({ userId });
    if (volunteer?.PhotoUrl) {
      await destroyCloudinaryImage(volunteer.PhotoUrl);
    }
    await VolunteerModel.deleteOne({ userId });

    // Payments are kept as financial records; strip customer details.
    await TransactionModel.updateMany(
      { user_id: userId },
      { $unset: { "meta.customer": "", "meta.email": "" } },
    );

    // Verification results contain NIN data returned by the provider.
    await VerificationSessionModel.updateMany(
      { user_id: userId },
      { $set: { provider_response: {}, mismatches: [] } },
    );

    // Older audit entries named the user in free text. Entries written by the
    // deletion flow carry a reference and only IDs, so they're kept as-is.
    await AuditLogModel.updateMany(
      { targetId: userId, "metadata.reference": { $exists: false } },
      { $set: { details: ANONYMIZED_AUDIT_DETAILS } },
    );

    await AdminProfileModel.deleteOne({ userId });
    await AuthTokenModel.deleteMany({ user_id: userId });

    // Sessions and the password hash (Better Auth "account" rows).
    const ctx = await auth.$context;
    await ctx.internalAdapter.deleteUserSessions(userId);
    await ctx.internalAdapter.deleteAccounts(userId);

    // Keep the row and its ID so payments and logs still resolve.
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          name: "Deleted User",
          firstName: "Deleted",
          lastName: "User",
          email: `deleted-${userId}@deleted.invalid`,
          emailVerified: false,
          anonymizedAt: new Date(),
        },
        $unset: {
          phoneNumber: "",
          dateOfBirth: "",
          gender: "",
          image: "",
          nin: "",
          vin: "",
          ninEncrypted: "",
          vinEncrypted: "",
          ninHash: "",
          vinHash: "",
          migrationError: "",
          homeAddress: "",
          stateOfOrigin: "",
          lgaOfOrigin: "",
          votingState: "",
          votingLga: "",
          datePvcCollected: "",
          isDisabled: "",
        },
      },
      { strict: false },
    );
  }

  await DeletionRequestModel.updateOne(
    { _id: request._id },
    {
      $set: { status: "completed", completedAt: new Date() },
      $unset: { lastError: "" },
    },
  );
}

/** A "processing" claim older than this is assumed to have crashed. */
const STALE_CLAIM_MS = 15 * 60 * 1000;

/**
 * Anonymizes every deletion request that is due, one at a time, until the
 * batch or time budget runs out. Called by the Vercel cron.
 */
export async function processDueDeletions({
  maxBatch = 25,
  timeBudgetMs = 45_000,
}: { maxBatch?: number; timeBudgetMs?: number } = {}) {
  const startedAt = Date.now();
  const summary = { completed: [] as string[], failed: [] as string[] };

  while (
    summary.completed.length + summary.failed.length < maxBatch &&
    Date.now() - startedAt < timeBudgetMs
  ) {
    const now = new Date();

    // Claim one due request atomically, so a restore or an overlapping run
    // can't act on it at the same time.
    const request = await DeletionRequestModel.findOneAndUpdate(
      {
        scheduledFor: { $lte: now },
        $or: [
          { status: "pending" },
          { status: "failed", updatedAt: { $lte: new Date(now.getTime() - 60 * 60 * 1000) } },
          { status: "processing", updatedAt: { $lte: new Date(now.getTime() - STALE_CLAIM_MS) } },
        ],
      },
      { $set: { status: "processing" }, $inc: { attempts: 1 } },
      { sort: { scheduledFor: 1 }, returnDocument: "after" },
    );

    if (!request) break;

    try {
      await anonymizeUser(request);
      summary.completed.push(request.reference);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Anonymization failed for ${request.reference}:`, error);
      await DeletionRequestModel.updateOne(
        { _id: request._id },
        { $set: { status: "failed", lastError: message.slice(0, 1000) } },
      );
      summary.failed.push(request.reference);
    }
  }

  return summary;
}
