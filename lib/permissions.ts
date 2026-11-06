import { auth } from "@/lib/auth";
import AdminProfileModel from "@/models/adminProfile";
import { Permission } from "@/types";
import { User } from "better-auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function checkPermission(
  request: Request,
  requiredPermission?: Permission,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 403 }),
    };
  }
  const user = session?.user as typeof session.user & Partial<User>;
  if (!user || user?.role !== "admin") {
    return {
      authorized: false,
      response: NextResponse.json(
        { message: "Forbidden: Admin access required", success: false },
        { status: 403 },
      ),
    };
  }

  let adminProfile = await AdminProfileModel.findOne({
    userId: session.user.id,
  });

  // Admins without a profile get read-only access; further permissions must be
  // granted explicitly by an admin with manage:admins.
  if (!adminProfile) {
    adminProfile = await AdminProfileModel.create({
      userId: session.user.id,
      permissions: ["view:users"] satisfies Permission[],
      status: "active",
    });
  }

  if (adminProfile.status !== "active") {
    return {
      authorized: false,
      response: NextResponse.json(
        { message: "Forbidden: Admin profile is suspended" },
        { status: 403 },
      ),
    };
  }

  if (
    requiredPermission &&
    !adminProfile.permissions.includes(requiredPermission)
  ) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          message: `Forbidden: Missing required permission (${requiredPermission})`,
          success: false,
        },
        { status: 403 },
      ),
    };
  }

  return { authorized: true, session, adminProfile };
}
