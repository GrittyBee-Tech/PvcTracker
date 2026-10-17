import { withDb } from "@/lib/withDb";
import AdminProfileModel from "@/models/adminProfile";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

import mongoose from "mongoose";

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
      if (!adminId || adminId === "undefined" || !mongoose.Types.ObjectId.isValid(adminId)) {
        return NextResponse.json(
          { message: "Invalid or missing admin ID" },
          { status: 400 },
        );
      }

      const body = await request.json();
      const { permissions } = body;

      if (!permissions || !Array.isArray(permissions)) {
        return NextResponse.json(
          { message: "Permissions array is required" },
          { status: 400 },
        );
      }

      const adminProfile = await AdminProfileModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(adminId) },
        { 
          permissions,
          assignedBy: mongoose.Types.ObjectId.isValid(session!.user.id)
            ? new mongoose.Types.ObjectId(session!.user.id)
            : undefined,
          status: "active",
        },
        { new: true, upsert: true },
      );

      const auditAdminId = mongoose.Types.ObjectId.isValid(session!.user.id)
        ? new mongoose.Types.ObjectId(session!.user.id)
        : undefined;

      if (auditAdminId) {
        await AuditLogModel.create({
          adminId: auditAdminId,
          action: "UPDATE_ADMIN_PERMISSIONS",
          targetId: adminId,
          targetModel: "User",
          details: `Updated admin permissions to: ${permissions.join(", ")}`,
        });
      }

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
