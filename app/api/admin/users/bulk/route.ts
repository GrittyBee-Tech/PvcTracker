import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  try {
    const { authorized, response, session } = await checkPermission(request, "manage:users");
    if (!authorized && response) return response;

    const { userIds, action } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: "No user IDs provided" }, { status: 400 });
    }

    if (!["restrict", "activate", "delete"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    let updateData: any = {};
    let auditAction = "";
    
    if (action === "restrict") {
      updateData = { status: "restricted" };
      auditAction = "BULK_RESTRICT_USERS";
    } else if (action === "activate") {
      updateData = { status: "active" };
      auditAction = "BULK_ACTIVATE_USERS";
    } else if (action === "delete") {
      updateData = { status: "deleted" };
      auditAction = "BULK_DELETE_USERS";
    }

    const result = await UserModel.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    // Create Audit Log
    await AuditLogModel.create({
      adminId: session!.user.id,
      action: auditAction,
      details: `${action.charAt(0).toUpperCase() + action.slice(1)}d ${result.modifiedCount} users`,
      metadata: {
        userIds,
        count: result.modifiedCount,
      },
    });

    return NextResponse.json(
      { message: `Bulk ${action} completed successfully`, count: result.modifiedCount },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error performing bulk action", error);
    return NextResponse.json(
      { message: error.message || "Failed to perform bulk action" },
      { status: 500 },
    );
  }
});
