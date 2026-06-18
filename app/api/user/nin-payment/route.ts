import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import TransactionModel from "@/models/transaction";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const email = session?.user.email;
    const { LUMIID_VERIFICATION_AMOUNT, PAYSTACK_SECRET_KEY } = process.env;

    const existingTransaction = await TransactionModel.findOne({
      user_id: session?.user.id,
      purpose: "NIN Verification",
    });

    if (existingTransaction?.status === "success") {
      // Run the Lumiid verification process here
      return NextResponse.json(
        {
          message: "Payment already completed for NIN verification.",
          access_code: existingTransaction.access_code,
        },
        { status: 200 },
      );
    } else if (existingTransaction?.status === "pending") {
      return NextResponse.json(
        {
          message: "Payment is still pending for NIN verification.",
          access_code: existingTransaction.access_code,
        },
        { status: 201 },
      );
    }

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email,
        amount: Number(LUMIID_VERIFICATION_AMOUNT),
        currency: "NGN",
        metadata: {
          userId: session?.user.id,
          purpose: "id_verification",
        },
      }),
    });
    const data = await res.json();

    if (data.status !== true) {
      console.error("Paystack Initialization Error:", data);
      return NextResponse.json(
        { error: "Failed to initialize NIN payment" },
        { status: 500 },
      );
    }

    await TransactionModel.create({
      user_id: session?.user.id,
      reference: data.data.reference,
      access_code: data.data.access_code,
      purpose: "NIN Verification",
      amount: Number(LUMIID_VERIFICATION_AMOUNT),
      status: "pending",
    });

    return NextResponse.json(
      { message: data.message, access_code: data.data.access_code },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error initializing NIN payment", error);
    return NextResponse.json(
      { error: "Failed to initialize NIN payment" },
      { status: 500 },
    );
  }
});
