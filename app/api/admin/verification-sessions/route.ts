import { withDb } from "@/lib/withDb";
import VerificationSessionModel from "@/models/verificationSession";
import UserModel from "@/models/users";
import TransactionModel from "@/models/transaction";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const GET = withDb(async (request: Request) => {
  try {
    const { authorized, response, adminProfile } = await checkPermission(request);
    if (!authorized && response) return response;

    // Check either view:verification_sessions or view:users for backward compatibility
    const hasPermission =
      adminProfile?.permissions?.includes("view:verification_sessions") ||
      adminProfile?.permissions?.includes("view:users");

    if (!hasPermission) {
      return NextResponse.json(
        {
          message:
            "Forbidden: Missing required permission (view:verification_sessions)",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();
    const userId = searchParams.get("userId")?.trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (userId) {
      query.user_id = userId;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      // Find matching users
      const matchingUsers = await UserModel.find(
        {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
            { nin: { $regex: search, $options: "i" } },
          ],
        },
        "_id",
      ).lean();

      const matchingUserIds = matchingUsers.map((u) => u._id.toString());

      // Find matching transactions
      const matchingTransactions = await TransactionModel.find(
        {
          $or: [
            { reference: { $regex: search, $options: "i" } },
            { provider_reference: { $regex: search, $options: "i" } },
          ],
        },
        "_id",
      ).lean();

      const matchingTxIds = matchingTransactions.map((t) => t._id.toString());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orConditions: any[] = [
        { user_id: { $in: matchingUserIds } },
        { transaction_id: { $in: matchingTxIds } },
        { user_id: { $regex: search, $options: "i" } },
        { transaction_id: { $regex: search, $options: "i" } },
        { status_reason: { $regex: search, $options: "i" } },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(search) });
      }

      query.$or = orConditions;
    }

    const skip = (page - 1) * limit;

    const [sessions, totalFiltered, totalAll, verifiedCount, pendingCount, rejectedCount] =
      await Promise.all([
        VerificationSessionModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        VerificationSessionModel.countDocuments(query),
        VerificationSessionModel.countDocuments({}),
        VerificationSessionModel.countDocuments({ status: "verified" }),
        VerificationSessionModel.countDocuments({ status: "pending" }),
        VerificationSessionModel.countDocuments({ status: "rejected" }),
      ]);

    // Gather user IDs and transaction IDs for enrichment
    const userIds = Array.from(
      new Set(
        sessions
          .map((s) => s.user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const txIds = Array.from(
      new Set(
        sessions
          .map((s) => s.transaction_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const userObjectIds = userIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const users = await UserModel.find(
      {
        $or: [
          { _id: { $in: userObjectIds } },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { _id: { $in: userIds as any[] } },
        ],
      },
      "firstName lastName email phoneNumber nin ninStatus stateOfOrigin lgaOfOrigin",
    ).lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const txObjectIds = txIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const transactions = await TransactionModel.find(
      {
        $or: [
          { _id: { $in: txObjectIds } },
          { reference: { $in: txIds } },
        ],
      },
      "reference provider amount status purpose",
    ).lean();

    const txMap = new Map(transactions.map((t) => [t._id.toString(), t]));

    const enrichedSessions = sessions.map((session) => {
      const user = userMap.get(session.user_id?.toString()) || null;
      const transaction =
        txMap.get(session.transaction_id?.toString()) || null;
      return {
        ...session,
        _id: session._id.toString(),
        user,
        transaction,
      };
    });

    return NextResponse.json(
      {
        message: "Verification sessions fetched successfully",
        sessions: enrichedSessions,
        stats: {
          total: totalAll,
          verified: verifiedCount,
          pending: pendingCount,
          rejected: rejectedCount,
        },
        pagination: {
          total: totalFiltered,
          page,
          limit,
          totalPages: Math.ceil(totalFiltered / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching verification sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification sessions" },
      { status: 500 },
    );
  }
});
