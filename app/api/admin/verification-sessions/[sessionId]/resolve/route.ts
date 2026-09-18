import { withDb } from "@/lib/withDb";
import VerificationSessionModel from "@/models/verificationSession";
import UserModel from "@/models/users";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const POST = withDb(
  async (
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
  ) => {
    try {
      const { authorized, response, session: adminSession } =
        await checkPermission(request, "manage:verification_sessions");
      if (!authorized && response) return response;

      const { sessionId } = await params;
      if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
        return NextResponse.json(
          { message: "Invalid session ID" },
          { status: 400 },
        );
      }

      const body = await request.json();
      const { action, reason } = body;

      if (!["sync", "approve", "reset"].includes(action)) {
        return NextResponse.json(
          { message: "Invalid resolution action. Must be sync, approve, or reset" },
          { status: 400 },
        );
      }

      const session = await VerificationSessionModel.findById(sessionId);
      if (!session) {
        return NextResponse.json(
          { message: "Verification session not found" },
          { status: 404 },
        );
      }

      // Find associated user
      const userObjectId = mongoose.Types.ObjectId.isValid(session.user_id)
        ? new mongoose.Types.ObjectId(session.user_id)
        : null;

      const user = await UserModel.findOne({
        $or: [
          ...(userObjectId ? [{ _id: userObjectId }] : []),
          { _id: session.user_id },
        ],
      });

      if (!user) {
        return NextResponse.json(
          { message: "Associated user not found" },
          { status: 404 },
        );
      }

      const previousName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

      if (action === "sync") {
        // Extract official NIN data from provider response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const providerData: Record<string, any> =
          session.provider_response?.data || session.provider_response || {};

        const ninFirstName =
          typeof providerData.firstname === "string" && providerData.firstname.trim()
            ? providerData.firstname.trim()
            : user.firstName;

        const ninLastName =
          typeof providerData.lastname === "string" && providerData.lastname.trim()
            ? providerData.lastname.trim()
            : user.lastName;

        const rawGender =
          typeof providerData.gender === "string"
            ? providerData.gender.trim().toLowerCase()
            : "";

        const normalizedGender =
          rawGender === "m" || rawGender === "male"
            ? "male"
            : rawGender === "f" || rawGender === "female"
              ? "female"
              : user.gender;

        // Update User
        user.firstName = ninFirstName;
        user.lastName = ninLastName;
        user.name = `${ninFirstName} ${ninLastName}`.trim();
        if (normalizedGender) {
          user.gender = normalizedGender;
        }
        user.ninStatus = "verified";
        await user.save();

        // Update Session
        session.status = "verified";
        session.status_reason =
          reason || "Admin resolved: Profile synced with official NIN record";
        session.mismatches = [];
        await session.save();

        // Create Audit Log
        await AuditLogModel.create({
          adminId: adminSession!.user.id,
          action: "SYNC_PROFILE_WITH_NIN",
          targetId: user._id.toString(),
          targetModel: "User",
          details: `Admin synced profile name with NIN record for ${user.firstName} ${user.lastName} (${user.email}). Session ID: ${sessionId}`,
          metadata: {
            sessionId: session._id.toString(),
            previousName,
            syncedName: `${ninFirstName} ${ninLastName}`,
            adminReason: reason || "Profile synced with official NIN record",
          },
        });

        return NextResponse.json(
          {
            message: "User profile successfully synced with NIN record and marked verified",
            session,
            user,
          },
          { status: 200 },
        );
      }

      if (action === "approve") {
        // Manually mark user and session as verified
        user.ninStatus = "verified";
        await user.save();

        session.status = "verified";
        session.status_reason =
          reason
            ? `Admin manual approval: ${reason}`
            : "Manually approved by administrator";
        await session.save();

        await AuditLogModel.create({
          adminId: adminSession!.user.id,
          action: "MANUALLY_APPROVE_VERIFICATION",
          targetId: user._id.toString(),
          targetModel: "User",
          details: `Admin manually approved verification for ${user.firstName} ${user.lastName} (${user.email}). Session ID: ${sessionId}`,
          metadata: {
            sessionId: session._id.toString(),
            reason: reason || "Manual override approved by administrator",
            mismatches: session.mismatches,
          },
        });

        return NextResponse.json(
          {
            message: "Verification session manually approved",
            session,
            user,
          },
          { status: 200 },
        );
      }

      if (action === "reset") {
        // Reset session to pending so user can re-try without re-paying
        session.status = "pending";
        session.status_reason =
          reason
            ? `Admin reset: ${reason}`
            : "Verification session reset by administrator for user retry";
        session.mismatches = [];
        await session.save();

        user.ninStatus = "pending";
        await user.save();

        await AuditLogModel.create({
          adminId: adminSession!.user.id,
          action: "RESET_VERIFICATION_SESSION",
          targetId: user._id.toString(),
          targetModel: "User",
          details: `Admin reset verification session for ${user.firstName} ${user.lastName} (${user.email}) to allow retry. Session ID: ${sessionId}`,
          metadata: {
            sessionId: session._id.toString(),
            reason: reason || "Reset session to pending for retry",
          },
        });

        return NextResponse.json(
          {
            message: "Verification session reset to pending. User can now retry verification without paying again",
            session,
            user,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        { message: "Unhandled resolution action" },
        { status: 400 },
      );
    } catch (error: any) {
      console.error("Error resolving verification session:", error);
      return NextResponse.json(
        { message: error.message || "Failed to resolve verification session" },
        { status: 500 },
      );
    }
  },
);
