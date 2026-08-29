import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import VerificationSessionModel from "@/models/verificationSession";
import { verifyNIN } from "@/services/ninService";

const normalizeName = (name?: string) => (name || "").trim().toLowerCase();

const normalizeGender = (gender?: string): "male" | "female" | "" => {
  if (!gender) return "";
  const g = gender.trim().toLowerCase();
  if (g === "m" || g === "male") return "male";
  if (g === "f" || g === "female") return "female";
  return "";
};

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nin } = body;

    if (!nin || typeof nin !== "string") {
      return Response.json(
        { success: false, message: "Valid ID number is required" },
        { status: 400 },
      );
    }

    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const activeSession = await VerificationSessionModel.findOne({
      user_id: session.user.id,
      status: "pending",
    });

    if (!activeSession) {
      return Response.json(
        {
          success: false,
          message: "No active verification session found. Please pay first.",
        },
        { status: 403 },
      );
    }

    const data = await verifyNIN(nin);

    if (!data.success || !data.summary?.verified) {
      const failureReason = data.message || "NIN verification was unsuccessful";

      await VerificationSessionModel.updateOne(
        { _id: activeSession._id },
        {
          status: "rejected",
          provider_response: data,
          status_reason: failureReason,
        },
      );

      await UserModel.updateOne(
        { _id: user._id },
        { ninStatus: "rejected" },
      );

      return Response.json(
        {
          success: false,
          message: failureReason,
          code: data.code,
        },
        { status: 400 },
      );
    }

    // Compare database info against official NIN record
    const ninData = data.data;
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

    if (detailedMismatches.length > 0) {
      const mismatchMessage = `Your profile information (${mismatchFields.join(
        ", ",
      )}) does not match your official NIN record.`;

      await VerificationSessionModel.updateOne(
        { _id: activeSession._id },
        {
          status: "rejected",
          provider_response: data,
          status_reason: mismatchMessage,
          mismatches: detailedMismatches,
        },
      );

      await UserModel.updateOne(
        { _id: user._id },
        { ninStatus: "rejected" },
      );

      return Response.json(
        {
          success: false,
          message: mismatchMessage,
          mismatches: detailedMismatches,
        },
        { status: 400 },
      );
    }

    // Everything matches and is verified
    await VerificationSessionModel.updateOne(
      { _id: activeSession._id },
      {
        status: "verified",
        provider_response: data,
        status_reason: "NIN verification and profile match successful",
      },
    );

    await UserModel.updateOne(
      { _id: user._id },
      {
        ninStatus: "verified",
        nin: nin.trim(),
      },
    );

    return Response.json(
      {
        success: true,
        summary: { verified: true, verification_type: "NIN" },
        data: { success: true, message: "NIN and profile verified successfully" },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("NIN verification error:", error);

    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
});

