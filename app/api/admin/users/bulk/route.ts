import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { requestUserDeletion } from "@/lib/userDeletion";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const MAX_BULK = 100;

export const POST = withDb(async (request: Request) => {
  try {
    const { authorized, response, session } = await checkPermission(request, "manage:users");
    if (!authorized && response) return response;

    const { userIds, action } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: "No user IDs provided" }, { status: 400 });
    }
    if (userIds.length > MAX_BULK) {
      return NextResponse.json(
        { message: `You can update at most ${MAX_BULK} users at once` },
        { status: 400 },
      );
    }
    if (!userIds.every((id) => typeof id === "string" && mongoose.isValidObjectId(id))) {
      return NextResponse.json({ message: "Invalid user IDs" }, { status: 400 });
    }

    if (!["restrict", "activate", "delete"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const adminId = session!.user.id;

    if (action === "delete") {
      const targets = await UserModel.find({ _id: { $in: userIds } }).select("role");
      if (targets.some((user) => user.role === "admin")) {
        const adminCheck = await checkPermission(request, "manage:admins");
        if (!adminCheck.authorized && adminCheck.response) {
          return adminCheck.response;
        }
      }

      // One request (and reference number) per user.
      const deleted: { userId: string; reference: string }[] = [];
      const skipped: { userId: string; reason: string }[] = [];
      for (const userId of userIds as string[]) {
        const result = await requestUserDeletion({ userId, adminId });
        if (result.ok) {
          deleted.push({ userId, reference: result.value.reference });
        } else {
          skipped.push({ userId, reason: result.message });
        }
      }

      return NextResponse.json(
        {
          message: `Deleted ${deleted.length} user(s)${skipped.length ? `, skipped ${skipped.length}` : ""}`,
          count: deleted.length,
          deleted,
          skipped,
        },
        { status: 200 },
      );
    }

    const newStatus = action === "restrict" ? "restricted" : "active";
    const auditAction = action === "restrict" ? "BULK_RESTRICT_USERS" : "BULK_ACTIVATE_USERS";

    // Deleted users can only be brought back through the deletion log.
    const result = await UserModel.updateMany(
      { _id: { $in: userIds }, status: { $ne: "deleted" } },
      { $set: { status: newStatus } },
    );

    await AuditLogModel.create({
      adminId,
      action: auditAction,
      details: `${action === "restrict" ? "Restricted" : "Activated"} ${result.modifiedCount} users`,
      metadata: {
        userIds,
        count: result.modifiedCount,
      },
    });

    return NextResponse.json(
      { message: `Bulk ${action} completed successfully`, count: result.modifiedCount },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error performing bulk action", error);
    return NextResponse.json(
      { message: "Failed to perform bulk action" },
      { status: 500 },
    );
  }
});
