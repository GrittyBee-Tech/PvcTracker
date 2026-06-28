import { withDb } from "@/lib/withDb";
import UserModel, { IUser } from "@/models/users";
import AdminProfileModel from "@/models/adminProfile";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export const GET = withDb(async (request: Request) => {
  try {
    const { authorized, response } = await checkPermission(
      request,
      "view:admins",
    );
    if (!authorized && response) return response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: { role: IUser["role"] } = { role: "admin" };
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(query),
    ]);

    // Fetch the linked AdminProfiles to get their permissions
    const userIds = users.map((u) => u._id);
    const adminProfiles = await AdminProfileModel.find({
      userId: { $in: userIds },
    });

    const admins = users.map((user) => {
      const profile = adminProfiles.find(
        (p) => p.userId.toString() === user._id.toString(),
      );
      return {
        ...user.toObject(),
        permissions: profile ? profile.permissions : [],
        adminStatus: profile ? profile.status : "active",
      };
    });

    return NextResponse.json(
      {
        message: "Admins fetched successfully",
        admins,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching admins", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 },
    );
  }
});

// Create new admin
export const POST = withDb(async (request: Request) => {
  try {
    const { authorized, response, session } = await checkPermission(
      request,
      "manage:admins",
    );
    if (!authorized && response) return response;

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      nin,
      permissions = [],
    } = body;

    if (!email || !firstName || !lastName || !phoneNumber || !nin) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      if (existingUser.role === "admin") {
        return NextResponse.json(
          { message: "User is already an admin" },
          { status: 400 },
        );
      }
      // Elevate existing user to admin
      existingUser.role = "admin";
      await existingUser.save();

      await AdminProfileModel.create({
        userId: existingUser._id,
        permissions,
        assignedBy: session!.user.id,
      });

      await AuditLogModel.create({
        adminId: session!.user.id,
        action: "ELEVATE_ADMIN",
        targetId: existingUser._id.toString(),
        targetModel: "User",
        details: `Elevated user to admin with permissions: ${permissions.join(", ")}`,
      });

      return NextResponse.json(
        {
          message: "Existing user elevated to admin successfully",
          admin: existingUser,
        },
        { status: 200 },
      );
    }

    const newAdmin = await UserModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      nin,
      role: "admin",
      dateOfBirth: new Date("1970-01-01"), // Default placeholder
      gender: "male", // Default placeholder
      ninStatus: "verified",
    });

    await AdminProfileModel.create({
      userId: newAdmin._id,
      permissions,
      assignedBy: session!.user.id,
    });

    await AuditLogModel.create({
      adminId: session!.user.id,
      action: "CREATE_ADMIN",
      targetId: newAdmin._id.toString(),
      targetModel: "User",
      details: `Created new admin account with permissions: ${permissions.join(", ")}`,
    });

    return NextResponse.json(
      { message: "Admin created successfully", admin: newAdmin },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating admin", error);
    return NextResponse.json(
      { message: error.message || "Failed to create admin" },
      { status: 500 },
    );
  }
});
