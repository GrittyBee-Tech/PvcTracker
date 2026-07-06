import { auth } from "@/lib/auth";
import AdminProfileModel from "@/models/adminProfile";
import { Permission, PERMISSIONS } from "@/types";
import { NextResponse } from "next/server";

export async function checkPermission(request: Request, requiredPermission?: Permission) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session || !session.user || session.user.role !== "admin") {
    return {
      authorized: false,
      response: NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 }),
    };
  }

  let adminProfile = await AdminProfileModel.findOne({ userId: session.user.id });
  
  // Auto-migrate the root/first admin to have all permissions if they don't have a profile yet
  if (!adminProfile) {
    adminProfile = await AdminProfileModel.create({
      userId: session.user.id,
      permissions: Object.values(PERMISSIONS),
      status: "active"
    });
  }

  if (adminProfile.status !== "active") {
    return {
      authorized: false,
      response: NextResponse.json({ message: "Forbidden: Admin profile is suspended" }, { status: 403 }),
    };
  }

  if (requiredPermission && !adminProfile.permissions.includes(requiredPermission)) {
    return {
      authorized: false,
      response: NextResponse.json({ message: `Forbidden: Missing required permission (${requiredPermission})` }, { status: 403 }),
    };
  }

  return { authorized: true, session, adminProfile };
}
