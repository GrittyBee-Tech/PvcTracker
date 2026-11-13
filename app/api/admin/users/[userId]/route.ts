import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import AdminProfileModel from "@/models/adminProfile";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";
import { requestUserDeletion } from "@/lib/userDeletion";

// Update user status (e.g., restrict/active)
export const PATCH = withDb(
  async (
    request: Request,
    { params }: { params: Promise<{ userId: string }> },
  ) => {
    try {
      const { authorized, response, session } = await checkPermission(request, "manage:users");
      if (!authorized && response) return response;

      const { status, role, permissions = [] } = await request.json();
      const { userId } = await params;

      const user = await UserModel.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }

      // Deleted users can only come back through the deletion log's restore.
      if (user.status === "deleted") {
        return NextResponse.json(
          { message: "This user is deleted. Restore them from the deletion log." },
          { status: 409 },
        );
      }

      if (role === "admin") {
        // Promoting to admin grants permissions, so it needs manage:admins on
        // top of manage:users.
        const adminCheck = await checkPermission(request, "manage:admins");
        if (!adminCheck.authorized && adminCheck.response) {
          return adminCheck.response;
        }

        user.role = "admin";
        await user.save();

        await AdminProfileModel.findOneAndUpdate(
          { userId: user._id },
          { 
            permissions,
            assignedBy: session!.user.id,
            status: "active" 
          },
          { upsert: true, new: true }
        );

        await AuditLogModel.create({
          adminId: session!.user.id,
          action: "ELEVATE_ADMIN",
          targetId: userId,
          targetModel: "User",
          details: `Elevated user to admin: ${user.firstName} ${user.lastName} (${user.email}) with permissions: ${permissions.join(", ")}`,
        });

        return NextResponse.json(
          { message: "User elevated to admin", user },
          { status: 200 },
        );
      }

      if (status) {
        if (!["active", "restricted"].includes(status)) {
          return NextResponse.json(
            { message: "Invalid status" },
            { status: 400 },
          );
        }

        const oldStatus = user.status;
        user.status = status;
        await user.save();

        // Create Audit Log
        await AuditLogModel.create({
          adminId: session!.user.id,
          action: status === "restricted" ? "RESTRICT_USER" : "ACTIVATE_USER",
          targetId: userId,
          targetModel: "User",
          details: `${status === "restricted" ? "Restricted" : "Activated"} user: ${user.firstName} ${user.lastName} (${user.email})`,
          metadata: {
            oldStatus,
            newStatus: status,
          },
        });

        return NextResponse.json(
          { message: `User status updated to ${status}`, user },
          { status: 200 },
        );
      }

      return NextResponse.json({ message: "No valid fields provided for update" }, { status: 400 });
    } catch (error: any) {
      console.error("Error updating user", error);
      return NextResponse.json(
        { message: error.message || "Failed to update user" },
        { status: 500 },
      );
    }
  },
);

// Delete user: soft delete now, anonymized after DELETION_RETENTION_DAYS.
export const DELETE = withDb(
  async (
    request: Request,
    { params }: { params: Promise<{ userId: string }> },
  ) => {
    try {
      const { authorized, response, session } = await checkPermission(request, "manage:users");
      if (!authorized && response) return response;

      const { userId } = await params;
      const body = await request.json().catch(() => ({}));
      const reason = typeof body?.reason === "string" ? body.reason : undefined;

      const target = await UserModel.findById(userId).select("role");
      if (target?.role === "admin") {
        // Removing an admin is an admin-management action.
        const adminCheck = await checkPermission(request, "manage:admins");
        if (!adminCheck.authorized && adminCheck.response) {
          return adminCheck.response;
        }
      }

      const result = await requestUserDeletion({
        userId,
        adminId: session!.user.id,
        reason,
      });

      if (!result.ok) {
        return NextResponse.json(
          { message: result.message },
          { status: result.status },
        );
      }

      return NextResponse.json(
        {
          message: "User deleted. Their data will be anonymized on the scheduled date.",
          reference: result.value.reference,
          scheduledFor: result.value.scheduledFor,
        },
        { status: 200 },
      );
    } catch (error: any) {
      console.error("Error deleting user", error);
      return NextResponse.json(
        { message: "Failed to delete user" },
        { status: 500 },
      );
    }
  },
);
