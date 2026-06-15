import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

type NextHandler = (
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any,
) => Promise<Response> | Response;

export function withDb(handler: NextHandler): NextHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: Request, context: any) => {
    try {
      await connectDB();

      return await handler(request, context);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Database connection or route error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
