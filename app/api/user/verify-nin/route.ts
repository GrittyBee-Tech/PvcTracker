import { withDb } from "@/lib/withDb";
import { verifyNIN } from "@/services/ninService";

export const POST = withDb(async (request: Request) => {
  try {
    const body = await request.json();
    const { id_number } = body;

    if (!id_number || typeof id_number !== "string") {
      return Response.json(
        { success: false, message: "Valid ID number is required" },
        { status: 400 }
      );
    }

    const data = await verifyNIN(id_number);

    if (!data.success) {
      return Response.json(
        {
          success: false,
          message: data.message,
          code: data.code,
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        data: data.data,
        summary: data.summary,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("NIN verification error:", error);

    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
});
