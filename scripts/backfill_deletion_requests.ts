import mongoose from "mongoose";
import UserModel from "../models/users.ts";
import AuditLogModel from "../models/auditLog.ts";
import DeletionRequestModel from "../models/deletionRequest.ts";
import { nextSequence } from "../models/counter.ts";

/**
 * Creates deletion-log entries for users that were soft-deleted before the
 * deletion log existed (status "deleted" but no deletion request).
 *
 * - Request date and "processed by" come from the user's DELETE_USER /
 *   BULK_DELETE_USERS audit entry when one exists; otherwise today and the
 *   admin passed with --admin-id.
 * - By default each user is scheduled for anonymization 30 days from TODAY,
 *   so nobody is anonymized the night this runs. Pass --from-original-date to
 *   schedule 30 days from the original request date instead (users deleted
 *   more than 30 days ago are then anonymized on the next cron run).
 *
 * Dry run (default):
 *   node --env-file=.env --experimental-strip-types scripts/backfill_deletion_requests.ts --admin-id <id>
 * Apply:
 *   node --env-file=.env --experimental-strip-types scripts/backfill_deletion_requests.ts --admin-id <id> --execute
 */

const RETENTION_DAYS = 30;
const MONGODB_URI = process.env.MONGODB_URI;

const args = process.argv.slice(2);
const isDryRun = !args.includes("--execute");
const fromOriginalDate = args.includes("--from-original-date");

function argValue(name: string): string {
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.split("=")[1].trim();
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1].trim() : "";
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export async function backfillDeletionRequests() {
  console.log("=================================================");
  console.log("Backfill: deletion log for already-deleted users");
  console.log(`Mode: ${isDryRun ? "DRY RUN (no changes)" : "EXECUTE"}`);
  console.log(
    `Schedule: ${fromOriginalDate ? "30 days from original request" : "30 days from today"}`,
  );
  console.log("=================================================");

  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  const fallbackAdminId = process.env.ADMIN_USER_ID || argValue("--admin-id");
  if (fallbackAdminId && !mongoose.isValidObjectId(fallbackAdminId)) {
    console.error(`Invalid --admin-id: ${fallbackAdminId}`);
    process.exit(1);
  }

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGODB_URI);
  }

  const deletedUsers = await UserModel.find({ status: "deleted" })
    .select("_id deletedAt")
    .lean();

  const now = new Date();
  let created = 0;
  let skipped = 0;
  let missingAdmin = 0;

  for (const user of deletedUsers) {
    const userId = String(user._id);

    const hasRequest = await DeletionRequestModel.exists({
      userId,
      status: { $in: ["pending", "processing", "completed", "failed"] },
    });
    if (hasRequest) {
      skipped++;
      continue;
    }

    const auditEntry = await AuditLogModel.findOne({
      $or: [
        { action: "DELETE_USER", targetId: userId },
        { action: "BULK_DELETE_USERS", "metadata.userIds": userId },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const requestedAt =
      (auditEntry?.createdAt as Date | undefined) ??
      (user.deletedAt as Date | undefined) ??
      now;
    const requestedBy = auditEntry?.adminId
      ? String(auditEntry.adminId)
      : fallbackAdminId;

    if (!requestedBy) {
      console.warn(`- ${userId}: no audit entry and no --admin-id; skipped`);
      missingAdmin++;
      continue;
    }

    const scheduledFor = fromOriginalDate
      ? addDays(requestedAt, RETENTION_DAYS)
      : addDays(now, RETENTION_DAYS);

    console.log(
      `- ${userId}: requested ${requestedAt.toISOString().slice(0, 10)} by ${requestedBy}` +
        `${auditEntry ? "" : " (fallback admin)"}, anonymize on ${scheduledFor.toISOString().slice(0, 10)}`,
    );

    if (isDryRun) {
      created++;
      continue;
    }

    const year = requestedAt.getUTCFullYear();
    const seq = await nextSequence(`deletion_request:${year}`);
    const reference = `DEL-${year}-${String(seq).padStart(6, "0")}`;

    await DeletionRequestModel.create({
      reference,
      userId,
      requestedBy,
      requestedAt,
      scheduledFor,
      status: "pending",
      reason: "Backfilled: deleted before the deletion log existed",
    });
    if (!user.deletedAt) {
      await UserModel.updateOne({ _id: userId }, { $set: { deletedAt: requestedAt } });
    }
    created++;
    console.log(`  created ${reference}`);
  }

  console.log("-------------------------------------------------");
  console.log(`Deleted users found:      ${deletedUsers.length}`);
  console.log(`${isDryRun ? "Would create" : "Created"}:             ${created}`);
  console.log(`Already had a request:    ${skipped}`);
  console.log(`Skipped (no admin known): ${missingAdmin}`);
  if (isDryRun) console.log("\nRe-run with --execute to apply.");
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("backfill_deletion_requests.ts")
) {
  backfillDeletionRequests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\nFatal error:", err);
      process.exit(1);
    });
}
