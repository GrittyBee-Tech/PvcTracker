import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export const POST = withDb(
  async (
    request: Request,
    { params }: { params: Promise<{ userId: string }> | { userId: string } }
  ) => {
    try {
      const { authorized, response, session } = await checkPermission(
        request,
        "view:users"
      );
      if (!authorized && response) return response;

      const { identifier, reason } = await request.json();
      const resolvedParams = await params;
      const { userId } = resolvedParams;

      if (!identifier || !["nin", "vin"].includes(identifier)) {
        return NextResponse.json(
          { message: "Invalid identifier. Expected 'nin' or 'vin'." },
          { status: 400 }
        );
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      const { nin, vin } = user.getDecryptedIdentifiers();
      const plainValue = identifier === "nin" ? nin : vin;

      if (!plainValue) {
        return NextResponse.json(
          {
            message: `User does not have a registered ${identifier.toUpperCase()}.`,
            value: null,
          },
          { status: 200 }
        );
      }

      // Record audit log
      const adminName = session!.user.name || session!.user.email || "Admin";
      const userName =
        user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();

      await AuditLogModel.create({
        adminId: session!.user.id,
        action: `REVEAL_${identifier.toUpperCase()}`,
        targetId: userId,
        targetModel: "User",
        details: `Admin ${adminName} revealed ${identifier.toUpperCase()} for user ${userName} (${user.email})`,
        metadata: {
          reason: reason?.trim() || "Administrative review in dashboard",
          ip:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });

      return NextResponse.json(
        {
          success: true,
          identifier,
          value: plainValue,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error revealing identifier:", error);
      return NextResponse.json(
        { message: error?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }
);
