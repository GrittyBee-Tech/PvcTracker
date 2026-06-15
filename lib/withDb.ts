import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

type NextHandler = (
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any,
) => Promise<Response> | Response;

export function withDb(handler: NextHandler): NextHandler {
  return async (request: Request, context: any) => {
    try {
      await connectDB();

      return await handler(request, context);
    } catch (error: any) {
      console.error("Database connection or route error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
