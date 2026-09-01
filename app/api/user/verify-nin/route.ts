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
  )}) does not match your official NIN record.`;

  if (mismatchFields.length > 0) {
    await VerificationSessionModel.updateOne(
      { _id: sessionId },
      {
        mismatches: detailedMismatches,
        status: "rejected",
        status_reason: mismatchMessage,
      },
    );
    return { mismatchMessage, detailedMismatches, mismatchFields };
  }
  await VerificationSessionModel.updateOne(
    { _id: sessionId },
    {
      mismatches: [],
      status: "verified",
      status_reason: "Your profile information matches your NIN",
    },
  );

  return {
    mismatchMessage: "Your profile information matches your NIN",
    detailedMismatches: [],
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
    console.log("Received NIN verification request:", {
      nin,
      firstName,
      lastName,
    });

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

    if (firstName || lastName || nin) {
      console.log("Updating user profile fields before NIN verification");
      const updateFields: Record<string, string> = {};

      if (typeof firstName === "string") {
        const trimmedFirstName = firstName.trim();
        if (trimmedFirstName && trimmedFirstName !== user.firstName) {
          updateFields.firstName = trimmedFirstName;
          updateFields.name =
            `${trimmedFirstName} ${updateFields?.lastName || user.lastName}`.trim();
        }
      }

      if (typeof lastName === "string") {
        const trimmedLastName = lastName.trim();
        if (trimmedLastName && trimmedLastName !== user.lastName) {
          updateFields.lastName = trimmedLastName;
          updateFields.name =
            `${updateFields?.firstName || user.firstName} ${trimmedLastName}`.trim();
        }
      }

      if (typeof nin === "string") {
        const trimmedNin = nin.trim();
        if (trimmedNin && trimmedNin !== user.nin) {
          updateFields.nin = trimmedNin;
        }
      }

      if (Object.keys(updateFields).length > 0) {
        await UserModel.updateOne({ _id: user._id }, updateFields);
      }
    }

    const activeSession = await VerificationSessionModel.findOne({
      user_id: session.user.id,
    });

    if (!activeSession?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please pay for NIN verification",
        },
        { status: 403 },
      );
    }

    let statusReason;
    let status;
    if (activeSession?.status === "rejected") {
      return NextResponse.json(
        {
          success: false,
          message: activeSession?.status_reason || "NIN Verification rejected",
        },
        { status: 403 },
      );
    } else if (activeSession.status === "pending") {
      const data = await verifyNIN(nin);

      if (!data.success || !data.summary?.verified) {
        statusReason = data?.message || "NIN verification was unsuccessful";
        status = "rejected";
        await UserModel.updateOne({ _id: user._id }, { ninStatus: "rejected" });

        return NextResponse.json(
          {
            success: false,
            message: statusReason,
            code: data.code,
          },
          { status: 400 },
        );
      } else if (data.success && data.summary?.verified) {
        statusReason = "NIN verified successfully";
        status = "verified";
      }

      await VerificationSessionModel.updateOne(
        { _id: activeSession._id },
        {
          status,
          status_reason: statusReason,
          provider_response: data,
        },
      );

      // Compare database info against official NIN record
      const { detailedMismatches, mismatchFields, mismatchMessage } =
        await compareNinInfoToDbInfo(
          data.data,
          user,
          activeSession._id.toString(),
        );

      if (mismatchFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: mismatchMessage,
            mismatches: detailedMismatches,
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        success: status === "verified",
        message: statusReason || "NIN verification completed",
      },
      { status: status === "verified" ? 200 : 400 },
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
