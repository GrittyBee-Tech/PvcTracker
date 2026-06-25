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

    // const data = await verifyNIN(nin);
    // const apiKey = process.env.LUMIID_SECRET_KEY;
    // const response = await fetch("https://api.lumiid.com/v1/ng/nin-basic/", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${apiKey}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ nin }),
    // });
    // const data = await response.json();
    // console.log(data);

    // if (!data.success) {
    //   return Response.json(
    //     {
    //       success: false,
    //       message: data.message,
    //       code: data.code,
    //     },
    //     { status: 400 },
    //   );
    // }

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
