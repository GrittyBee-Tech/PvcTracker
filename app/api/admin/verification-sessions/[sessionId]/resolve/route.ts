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

      if (action !== "reset") {
        return NextResponse.json(
          { message: "Invalid resolution action. Only reset is allowed" },
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
        adminId: new mongoose.Types.ObjectId(adminSession!.user.id),
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
          message:
            "Verification session reset to pending. User can now retry verification without paying again",
          session,
          user,
        },
        { status: 200 },
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
