import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import TransactionModel from "@/models/transaction"
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    // const 

    return NextResponse.json({ message: "Message here" }, { status: 201 });
  } catch (error) {
    console.error("Error initializing NIN payment", error);
    return NextResponse.json(
      { error: "Failed to initialize NIN payment" },
      { status: 500 },
    );
  }
});
