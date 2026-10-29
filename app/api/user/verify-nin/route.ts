import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import VerificationSessionModel from "@/models/verificationSession";
import { verifyNIN } from "@/services/ninService";
import { User } from "better-auth/types";
import { NextResponse } from "next/server";

const normalizeName = (name?: string) => (name || "").trim().toLowerCase();

const normalizeGender = (gender?: string): "male" | "female" | "" => {
  if (!gender) return "";
  const g = gender.trim().toLowerCase();
  if (g === "m" || g === "male") return "male";
  if (g === "f" || g === "female") return "female";
  return "";
};

const compareNinInfoToDbInfo = async (
  ninData: Record<string, any>,
  user: User,
  sessionId: string,
  providerResponse: Record<string, any>,
) => {
  const mismatchFields: string[] = [];
  const detailedMismatches: Array<{
    field: string;
    dbValue: string;
    ninValue: string;
  }> = [];

  const dbFirstName = normalizeName(user.firstName);
  const ninFirstName = normalizeName(ninData?.firstname);
  if (dbFirstName && ninFirstName && dbFirstName !== ninFirstName) {
    mismatchFields.push("first name");
    detailedMismatches.push({
      field: "firstName",
      dbValue: user.firstName,
      ninValue: ninData?.firstname || "",
    });
  }

  const dbLastName = normalizeName(user.lastName);
  const ninLastName = normalizeName(ninData?.lastname);
  if (dbLastName && ninLastName && dbLastName !== ninLastName) {
    mismatchFields.push("last name");
    detailedMismatches.push({
      field: "lastName",
      dbValue: user.lastName,
      ninValue: ninData?.lastname || "",
    });
  }

  const dbGender = normalizeGender(user.gender);
  const ninGender = normalizeGender(ninData?.gender);
  if (dbGender && ninGender && dbGender !== ninGender) {
    mismatchFields.push("gender");
    detailedMismatches.push({
      field: "gender",
      dbValue: user.gender,
      ninValue: ninData?.gender || "",
    });
  }

  const mismatchMessage = `Your profile information (${mismatchFields.join(
    ", ",
  )}) does not match your official NIN record. Please pay and verify again.`;

  if (mismatchFields.length > 0) {
    await Promise.all([
      VerificationSessionModel.updateOne(
        { _id: sessionId },
        {
          mismatches: detailedMismatches,
          status: "rejected",
          status_reason: mismatchMessage,
          provider_response: providerResponse,
        },
      ),
      UserModel.updateOne(
        { _id: user._id || user.id },
        { ninStatus: "rejected" },
      ),
    ]);
    return { mismatchMessage, mismatchFields };
  }

  await Promise.all([
    VerificationSessionModel.updateOne(
      { _id: sessionId },
      {
        mismatches: [],
        status: "verified",
        status_reason: "Your profile information matches your NIN",
        provider_response: providerResponse,
      },
    ),
    UserModel.updateOne({ _id: user.id }, { ninStatus: "verified" }),
  ]);

  return {
    mismatchMessage: "Your profile information matches your NIN",
    mismatchFields: [],
  };
};

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nin, firstName, lastName } = body;

    if (!nin || typeof nin !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid ID number is required" },
        { status: 400 },
      );
    }

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Require an active, pending verification session (paid credit)
    const activeSession = await VerificationSessionModel.findOne({
      user_id: session.user.id,
      status: "pending",
    }).sort({ createdAt: -1 });

    if (!activeSession) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No active verification session found. Please complete payment to verify.",
        },
        { status: 402 },
      );
    }

    // Update confirmed profile fields before verification
    if (firstName || lastName || nin) {
      const updateFields: {
        name?: string;
        firstName?: string;
        lastName?: string;
        nin?: string;
      } = {};

      if (typeof firstName === "string") {
        const trimmedFirstName = firstName.trim();
        if (trimmedFirstName && trimmedFirstName !== user.firstName) {
          updateFields.firstName = trimmedFirstName;
        }
      }

      if (typeof lastName === "string") {
        const trimmedLastName = lastName.trim();
        if (trimmedLastName && trimmedLastName !== user.lastName) {
          updateFields.lastName = trimmedLastName;
        }
      }

      const nextName =
        `${updateFields?.firstName || user?.firstName} ${updateFields?.lastName || user.lastName}`.trim();

      if (nextName !== user.name) {
        updateFields.name = nextName;
      }

      if (typeof nin === "string") {
        const trimmedNin = nin.trim();
        const storedNin = user.getDecryptedIdentifiers?.()?.nin || user.nin;
        if (trimmedNin && trimmedNin !== storedNin) {
          updateFields.nin = trimmedNin;
        }
      }

      if (Object.keys(updateFields).length > 0) {
        await auth.api.updateUser({
          body: updateFields,
          headers: request.headers,
        });
      }
    }

    // Call identity verification provider
    const ninResult = await verifyNIN(nin.trim());

    // Case 1: System error (timeout, network outage, provider 5xx/429)
    // Keep session as "pending" with a status reason so the user can retry without paying again
    if (ninResult.isSystemError) {
      await VerificationSessionModel.updateOne(
        { _id: activeSession._id },
        {
          status: "pending",
          status_reason: ninResult.message,
        },
      );

      return NextResponse.json(
        {
          success: false,
          systemError: true,
          message: ninResult.message,
        },
        { status: 503 },
      );
    }

    // Case 2: Definitive failure from provider (NIN not found, invalid format, etc.)
    // Consume session -> Reject session and reject user
    if (!ninResult.success || !ninResult.summary?.verified) {
      const failureReason =
        ninResult.message || "NIN verification was unsuccessful";

      await Promise.all([
        VerificationSessionModel.updateOne(
          { _id: activeSession._id },
          {
            status: "rejected",
            status_reason: failureReason,
            provider_response: ninResult.raw || ninResult,
          },
        ),
        UserModel.updateOne({ _id: user._id }, { ninStatus: "rejected" }),
      ]);

      return NextResponse.json(
        {
          success: false,
          message: `${failureReason}. Please pay and verify again.`,
          code: ninResult.code,
        },
        { status: 400 },
      );
    }

    // Case 3: Valid NIN record returned -> Compare with user profile
    const updatedUser = await UserModel.findById(session.user.id);
    const { mismatchFields, mismatchMessage } = await compareNinInfoToDbInfo(
      ninResult.data || {},
      updatedUser as User,
      activeSession._id.toString(),
      ninResult.raw || ninResult,
    );

    if (mismatchFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: mismatchMessage,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "NIN verified successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("NIN verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
});
