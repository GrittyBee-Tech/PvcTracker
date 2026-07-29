import { auth } from "@/lib/auth";
import {
  verifyFlutterwavePayment,
  verifyPaystackPayment,
} from "@/lib/paymentHelpers";
import { withDb } from "@/lib/withDb";
import TransactionModel from "@/models/transaction";
import VerificationSessionModel from "@/models/verificationSession";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference, txRef, provider } = await request.json();
    console.log("Verifying payment with reference:", {
      reference,
      txRef,
      provider,
    });
    const existingTransaction = await TransactionModel.findOne({
      user_id: session.user.id,
      $or: [
        { reference },
        { provider_reference: reference },
        { reference: txRef },
      ],
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
    }

    const paymentProvider =
      provider || existingTransaction.provider || "paystack";

    if (paymentProvider === "flutterwave") {
      const verificationResult = await verifyFlutterwavePayment(reference);

      if (verificationResult.ok) {
        existingTransaction.status = "success";
        existingTransaction.provider_reference = reference;
        await existingTransaction.save();

        await VerificationSessionModel.create({
          user_id: session.user.id,
          transaction_id: existingTransaction._id.toString(),
          status: "pending",
        });

        return NextResponse.json(
          { message: "Payment verified successfully." },
          { status: 200 },
        );
      }

      return NextResponse.json(
        { error: "Payment verification failed at provider" },
        { status: 400 },
      );
    }

    const verificationResult = await verifyPaystackPayment(reference);

    if (verificationResult.ok) {
      existingTransaction.status = "success";
      existingTransaction.provider_reference = reference;
      await existingTransaction.save();

      await VerificationSessionModel.create({
        user_id: session.user.id,
        transaction_id: existingTransaction._id.toString(),
        status: "pending",
      });

      return NextResponse.json(
        { message: "Payment verified successfully." },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { error: "Payment verification failed at provider" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error verifying NIN payment", error);
    return NextResponse.json(
      { error: "Failed to verify NIN payment" },
      { status: 500 },
    );
  }
});
