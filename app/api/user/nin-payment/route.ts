import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import TransactionModel from "@/models/transaction";
import VerificationSessionModel from "@/models/verificationSession";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const email = session?.user.email;
    const { LUMIID_VERIFICATION_AMOUNT, PAYSTACK_SECRET_KEY } = process.env;

    const existingTransaction = await TransactionModel.findOne({
      user_id: session?.user.id,
      purpose: "NIN Verification",
      status: "success",
    });

    if (existingTransaction) {
      const usedSession = await VerificationSessionModel.findOne({
        transaction_id: existingTransaction._id.toString(),
        status: { $in: ["verified", "rejected"] },
      });

      if (!usedSession) {
        return NextResponse.json(
          {
            message: "Payment already completed for NIN verification.",
            access_code: existingTransaction.access_code,
            payment_status: "success",
          },
          { status: 200 },
        );
      }
    }

    const pendingTransaction = await TransactionModel.findOne({
      user_id: session?.user.id,
      purpose: "NIN Verification",
      status: "pending",
    });

    if (pendingTransaction) {
      return NextResponse.json(
        {
          message: "Payment initialization resumed.",
          access_code: pendingTransaction.access_code,
          paymnt_status: "pending",
        },
        { status: 200 },
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

    const initializeData = await res.json();

    if (initializeData.status !== true) {
      console.error("Paystack Initialization Error:", initializeData);
      return NextResponse.json(
        { error: "Failed to initialize NIN payment" },
        { status: 500 },
      );
    }

    await TransactionModel.create({
      user_id: session?.user.id,
      reference: initializeData.data.reference,
      access_code: initializeData.data.access_code,
      purpose: "NIN Verification",
      amount: Number(LUMIID_VERIFICATION_AMOUNT),
      status: "pending",
    });

    return NextResponse.json(
      {
        message: initializeData.message,
        payment_status: "pending",
        access_code: initializeData.data.access_code,
      },
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
