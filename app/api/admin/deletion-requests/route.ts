import { withDb } from "@/lib/withDb";
import { checkPermission } from "@/lib/permissions";
import DeletionRequestModel from "@/models/deletionRequest";
// Registers the User model so populate() can resolve its refs.
import "@/models/users";
import { NextResponse } from "next/server";

const STATUSES = ["pending", "processing", "cancelled", "completed", "failed"];

export const GET = withDb(async (request: Request) => {
  try {
    const { authorized, response } = await checkPermission(request, "manage:users");
    if (!authorized && response) return response;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10") || 10));
    const status = searchParams.get("status");
    const reference = searchParams.get("reference")?.trim();

    const query: Record<string, unknown> = {};
    if (status && STATUSES.includes(status)) query.status = status;
    if (reference) query.reference = reference.toUpperCase();

    const [requests, total] = await Promise.all([
      DeletionRequestModel.find(query)
        .populate("userId", "firstName lastName email anonymizedAt")
        .populate("requestedBy", "firstName lastName email")
        .populate("cancelledBy", "firstName lastName email")
        .sort({ requestedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DeletionRequestModel.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        requests,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching deletion requests", error);
    return NextResponse.json(
      { message: "Failed to fetch deletion requests" },
      { status: 500 },
    );
  }
});
