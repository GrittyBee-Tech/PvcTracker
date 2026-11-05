import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import VolunteerModel from "@/models/volunteerApplication";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

const GEOPOLITICAL_ZONES = {
  "North Central": [
    "Benue", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau", "FCT",
    "Abuja", "Federal Capital Territory",
  ],
  "North East": [
    "Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe",
  ],
  "North West": [
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara",
  ],
  "South East": [
    "Abia", "Anambra", "Ebonyi", "Enugu", "Imo",
  ],
  "South South": [
    "Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers",
  ],
  "South West": [
    "Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo",
  ],
} as const;

const AGE_RANGES = [
  "Under 18",
  "18–24",
  "25–34",
  "35–44",
  "45–54",
  "55–64",
  "65+",
  "Unknown",
] as const;

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
      zoneStateData,
      genderData,
      ageData,
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

      // 5. All states for geopolitical zone totals
      UserModel.aggregate([
        { $match: { role: "user", status: { $ne: "deleted" } } },
        { $group: { _id: "$stateOfOrigin", users: { $sum: 1 } } },
      ]),

      // 6. Gender Distribution
      UserModel.aggregate([
        { $match: { role: "user", status: { $ne: "deleted" } } },
        {
          $group: {
            _id: { $toLower: { $ifNull: ["$gender", ""] } },
            value: { $sum: 1 },
          },
        },
      ]),

      // 7. Age Range Distribution
      UserModel.aggregate([
        { $match: { role: "user", status: { $ne: "deleted" } } },
        {
          $addFields: {
            age: {
              $cond: [
                { $eq: [{ $type: "$dateOfBirth" }, "date"] },
                {
                  $subtract: [
                    { $dateDiff: { startDate: "$dateOfBirth", endDate: "$$NOW", unit: "year" } },
                    {
                      $cond: [
                        {
                          $lt: [
                            { $dateToString: { format: "%m%d", date: "$$NOW" } },
                            { $dateToString: { format: "%m%d", date: "$dateOfBirth" } },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  ],
                },
                null,
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $eq: ["$age", null] }, then: "Unknown" },
                  { case: { $lt: ["$age", 0] }, then: "Unknown" },
                  { case: { $lt: ["$age", 18] }, then: "Under 18" },
                  { case: { $lt: ["$age", 25] }, then: "18–24" },
                  { case: { $lt: ["$age", 35] }, then: "25–34" },
                  { case: { $lt: ["$age", 45] }, then: "35–44" },
                  { case: { $lt: ["$age", 55] }, then: "45–54" },
                  { case: { $lt: ["$age", 65] }, then: "55–64" },
                ],
                default: "65+",
              },
            },
            value: { $sum: 1 },
          },
        },
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

    const genderCounts = new Map(
      genderData.map((item) => [item._id, item.value] as const),
    );
    const formattedGenderData = [
      { name: "Male", value: genderCounts.get("male") ?? 0 },
      { name: "Female", value: genderCounts.get("female") ?? 0 },
      {
        name: "Unknown",
        value: genderData
          .filter((item) => item._id !== "male" && item._id !== "female")
          .reduce((total, item) => total + item.value, 0),
      },
    ];

    const zoneCounts = new Map<string, number>();
    for (const zone of Object.keys(GEOPOLITICAL_ZONES)) {
      zoneCounts.set(zone, 0);
    }

    const stateZoneMap = new Map<string, string>();
    for (const [zone, states] of Object.entries(GEOPOLITICAL_ZONES)) {
      for (const state of states) {
        stateZoneMap.set(state.toLowerCase(), zone);
      }
    }

    for (const item of zoneStateData) {
      const stateName = typeof item._id === "string" ? item._id.trim().toLowerCase() : "";
      const zone = stateZoneMap.get(stateName);
      if (zone) {
        zoneCounts.set(zone, (zoneCounts.get(zone) ?? 0) + item.users);
      }
    }

    const formattedZoneData = Object.keys(GEOPOLITICAL_ZONES).map((name) => ({
      name,
      value: zoneCounts.get(name) ?? 0,
    }));

    const ageCounts = new Map(ageData.map((item) => [item._id, item.value] as const));
    const formattedAgeData = AGE_RANGES.map((name) => ({
      name,
      value: ageCounts.get(name) ?? 0,
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
          genderDistribution: formattedGenderData,
          geopoliticalZones: formattedZoneData,
          ageRanges: formattedAgeData,
        }
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Error fetching analytics", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch analytics data",
      },
      { status: 500 },
    );
  }
});
