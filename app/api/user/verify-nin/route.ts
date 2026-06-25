import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import { verifyNIN } from "@/services/ninService";

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const body = await request.json();
    const { nin } = body;

    if (!nin || typeof nin !== "string") {
      return Response.json(
        { success: false, message: "Valid ID number is required" },
        { status: 400 },
      );
    }

     const data = await verifyNIN(nin);
    console.log(data);

    if (!data.success) {
      return Response.json(
        {
          success: false,
          message: data.message,
          code: data.code,
        },
        { status: 400 },
      );
    }
    if(!data.summary.verified){

       await UserModel.updateOne(
      { _id: session?.user.id },
      { ninStatus: "rejected" },
    );
    return Response.json(
      {
        success: false,
        summary: { verified: false, verification_type: "NIN" },
        data: { success: false, message: "Verification unsuccessful" },
      },
      { status: 200 },
    );
    }

    await UserModel.updateOne(
      { _id: session?.user.id },
      { ninStatus: "verified" },
    );

    return Response.json(
      {
        success: true,
        summary: { verified: true, verification_type: "NIN" },
        data: { success: true, message: "Verification successful" },
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
