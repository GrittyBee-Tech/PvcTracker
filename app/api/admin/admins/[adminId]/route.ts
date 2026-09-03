import { withDb } from "@/lib/withDb";
import AdminProfileModel from "@/models/adminProfile";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

// Update admin permissions
export const PATCH = withDb(
  async (
    request: Request,
    { params }: { params: Promise<{ adminId: string }> },
  ) => {
    try {
      const { authorized, response, session } = await checkPermission(
        request,
        "manage:admins",
      );
      if (!authorized && response) return response;

      const { adminId } = await params;
      const body = await request.json();
      const { permissions } = body;

      if (!permissions || !Array.isArray(permissions)) {
        return NextResponse.json(
          { message: "Permissions array is required" },
          { status: 400 },
        );
      }

      const adminProfile = await AdminProfileModel.findOneAndUpdate(
        { userId: adminId },
        { permissions },
        { new: true },
      );

      if (!adminProfile) {
        return NextResponse.json(
          { message: "Admin profile not found" },
          { status: 404 },
        );
      }

      await AuditLogModel.create({
        adminId: session!.user.id,
        action: "UPDATE_ADMIN_PERMISSIONS",
        targetId: adminId,
        targetModel: "User",
        details: `Updated admin permissions to: ${permissions.join(", ")}`,
      });

      return NextResponse.json(
        {
          message: "Permissions updated successfully",
          adminProfile,
        },
        { status: 200 },
      );
    } catch (error: any) {
      console.error("Error updating admin permissions", error);
      return NextResponse.json(
        { message: error.message || "Failed to update permissions" },
        { status: 500 },
      );
    }
  },
);
