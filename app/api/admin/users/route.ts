import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";
import {
  generateBlindIndex,
  maskNin,
  maskVin,
  normalizeIdentifier,
} from "@/lib/crypto";

export const GET = withDb(async (request: Request) => {
  try {
    const { authorized, response } = await checkPermission(
      request,
      "view:users"
    );
    if (!authorized && response) return response;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const state = searchParams.get("state");
    const lga = searchParams.get("lga");
    const search = searchParams.get("search");
    const ninStatus = searchParams.get("ninStatus");
    const pvcStatus = searchParams.get("pvcStatus");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {
      role: "user",
      status: { $ne: "deleted" },
    };

    if (state && state !== "all") query.stateOfOrigin = state;
    if (lga && lga !== "all") query.lgaOfOrigin = lga;
    if (ninStatus && ninStatus !== "all") query.ninStatus = ninStatus;
    if (pvcStatus && pvcStatus !== "all") query.pvcStatus = pvcStatus;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { nin: { $regex: search, $options: "i" } },
        { stateOfOrigin: { $regex: search, $options: "i" } },
        { lgaOfOrigin: { $regex: search, $options: "i" } },
      ];

      // Exact match via blind index for full NIN or VIN query
      if (trimmedSearch.length >= 10) {
        try {
          const normalized = normalizeIdentifier(trimmedSearch);
          const blindIndex = generateBlindIndex(normalized);
          searchOr.push({ ninHash: blindIndex });
          searchOr.push({ vinHash: blindIndex });
        } catch {
          // ignore normalization error if search string is invalid
        }
      }

      query.$or = searchOr;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(query),
    ]);

    // Mask sensitive identifiers strictly for admin table view
    const sanitizedUsers = users.map((u) => {
      const userObj: Record<string, any> = u.toObject ? u.toObject() : { ...u };
      const plainNin = userObj.nin;
      const plainVin = userObj.vin;

      const hasNin = Boolean(userObj.ninEncrypted || plainNin);
      const hasVin = Boolean(userObj.vinEncrypted || plainVin);

      userObj.hasNin = hasNin;
      userObj.hasVin = hasVin;
      userObj.nin = plainNin
        ? maskNin(plainNin)
        : userObj.ninEncrypted
        ? "•••••••••••"
        : null;
      userObj.vin = plainVin
        ? maskVin(plainVin)
        : userObj.vinEncrypted
        ? "•••••••••••••••••••"
        : null;

      delete userObj.ninEncrypted;
      delete userObj.vinEncrypted;
      delete userObj.ninHash;
      delete userObj.vinHash;

      return userObj;
    });

    return NextResponse.json(
      {
        message: "Users fetched successfully",
        users: sanitizedUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
});
