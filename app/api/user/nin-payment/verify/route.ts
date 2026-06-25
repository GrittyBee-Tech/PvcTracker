import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import TransactionModel from "@/models/transaction";
import VerificationSessionModel from "@/models/verificationSession";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const { reference } = await request.json();
    const existingTransaction = await TransactionModel.findOne({
      reference,
      user_id: session?.user.id.toString(),
    });
    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found. Please pay first" },
        { status: 404 },
      );
    }
    if (existingTransaction.status === "success") {
      return NextResponse.json(
        { message: "Payment verified for NIN verification." },
        { status: 200 },
      );
    } else {
      const res = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );
      const data = await res.json();
      if (data.status === true && data.data.status === "success") {
        existingTransaction.status = "success";
        await existingTransaction.save();

        await VerificationSessionModel.create({
          user_id: session?.user.id,
          transaction_id: existingTransaction._id.toString(),
          status: "pending",
        });

        return NextResponse.json(
          { message: "Payment verified successfully." },
          { status: 200 },
        );
      } else {
        return NextResponse.json(
          { error: "Payment verification failed at provider" },
          { status: 400 },
        );
      }
    }
  } catch (error) {
    console.error("Error verifying NIN payment", error);
    return NextResponse.json(
      { error: "Failed to verify NIN payment" },
      { status: 500 },
    );
  }
});
