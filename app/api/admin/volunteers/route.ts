import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import VolunteerModel from "@/models/volunteerApplication";
import { NextResponse } from "next/server";

export const GET = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const state = searchParams.get("state");
    const status = searchParams.get("status"); // 'approved', 'pending', 'all'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (state) query.stateOfResidence = state;
    if (status === "approved") query.isApproved = true;
    if (status === "pending") query.isApproved = false;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      VolunteerModel.find(query)
        .populate("userId", "firstName lastName phoneNumber email gender")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VolunteerModel.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        message: "Volunteer applications fetched successfully",
        applications,
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
    console.error("Error fetching volunteers", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 },
    );
  }
});
