import { checkPermission } from "@/lib/permissions";
import { withDb } from "@/lib/withDb";
import { getComplaints } from "@/services/complaintService";
import { NextResponse } from "next/server";

export const GET = withDb(async (request: Request) => {
  try {
    const { authorized, response } = await checkPermission(
      request,
      "view:complaints",
    );
    if (!authorized && response) return response;

    const complaints = await getComplaints();

    return NextResponse.json(
      { message: "Complaints fetched successfully", complaints },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 },
    );
  }
});
