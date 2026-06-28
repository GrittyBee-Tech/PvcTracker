import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import VolunteerModel from "@/models/volunteerApplication";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export const GET = withDb(async (request: Request) => {
  try {
    const { authorized, response } = await checkPermission(request, "view:analytics");
    if (!authorized && response) return response;

    // Run aggregations concurrently for performance
    const [
      totalUsers,
      totalVolunteers,
      pendingVolunteers,
      totalAdmins,
      pvcStatusData,
      ninStatusData,
      stateData,
    ] = await Promise.all([
      // 1. KPIs
      UserModel.countDocuments({ role: "user", status: { $ne: "deleted" } }),
      VolunteerModel.countDocuments({ status: "approved" }),
      VolunteerModel.countDocuments({ status: "pending" }),
      UserModel.countDocuments({ role: "admin", status: { $ne: "deleted" } }),

      // 2. PVC Status Distribution
      UserModel.aggregate([
        { $match: { role: "user", status: { $ne: "deleted" } } },
        { $group: { _id: "$pvcStatus", value: { $sum: 1 } } },
        { $project: { name: "$_id", value: 1, _id: 0 } }
      ]),

      // 3. NIN Status Distribution
      UserModel.aggregate([
        { $match: { role: "user", status: { $ne: "deleted" } } },
        { $group: { _id: "$ninStatus", value: { $sum: 1 } } },
        { $project: { name: "$_id", value: 1, _id: 0 } }
      ]),

      // 4. Top States
      UserModel.aggregate([
        { $match: { role: "user", status: { $ne: "deleted" } } },
        { $group: { _id: "$stateOfOrigin", users: { $sum: 1 } } },
        { $sort: { users: -1 } },
        { $limit: 10 },
        { $project: { state: "$_id", users: 1, _id: 0 } }
      ]),
    ]);

    // Format chart data
    const formatStatusName = (name: string) => {
      if (!name) return "Unknown";
      return name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    const formattedPvcData = pvcStatusData.map(d => ({
      name: formatStatusName(d.name),
      value: d.value
    }));

    const formattedNinData = ninStatusData.map(d => ({
      name: formatStatusName(d.name),
      value: d.value
    }));

    const formattedStateData = stateData.map(d => ({
      state: d.state || "Unknown",
      users: d.users
    }));

    return NextResponse.json(
      {
        kpis: {
          totalUsers,
          totalVolunteers,
          pendingVolunteers,
          totalAdmins,
        },
        charts: {
          pvcStatus: formattedPvcData,
          ninStatus: formattedNinData,
          stateDistribution: formattedStateData,
        }
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching analytics", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
});
