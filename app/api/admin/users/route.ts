import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export const GET = withDb(async (request: Request) => {
  try {
    const { authorized, response } = await checkPermission(request, "view:users");
    if (!authorized && response) return response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const state = searchParams.get("state");
    const lga = searchParams.get("lga");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { 
      role: "user",
      status: { $ne: "deleted" }
    };

    if (state) query.stateOfOrigin = state;
    if (lga) query.lgaOfOrigin = lga;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        users,
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
    console.error("Error fetching users", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
});
