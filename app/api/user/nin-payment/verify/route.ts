import { auth } from "@/lib/auth";
import {
  verifyFlutterwavePayment,
  verifyPaystackPayment,
} from "@/lib/paymentHelpers";
import { withDb } from "@/lib/withDb";
import TransactionModel from "@/models/transaction";
import UserModel from "@/models/users";
import VerificationSessionModel from "@/models/verificationSession";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference, txRef } = await request.json();

    // The client-supplied values are only used to *find* one of this user's
    // own transactions. Verification below always uses the stored reference.
    const lookups = [reference, txRef]
      .filter((value): value is string => typeof value === "string" && !!value)
      .flatMap((value) => [{ reference: value }, { provider_reference: value }]);

    if (lookups.length === 0) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 },
      );
    }

    const existingTransaction = await TransactionModel.findOne({
      user_id: session.user.id,
      $or: lookups,
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found. Please pay first" },
        { status: 404 },
      );
    }

    if (existingTransaction.status === "success") {
      return NextResponse.json(
        { message: "Payment verified for NIN verification" },
        { status: 200 },
      );
    }

    const storedReference = existingTransaction.reference;
    const verificationResult =
      existingTransaction.provider === "flutterwave"
        ? await verifyFlutterwavePayment(storedReference, session.user.id)
        : await verifyPaystackPayment(storedReference, session.user.id);

    if (!verificationResult.ok) {
      if (verificationResult.error) {
        console.warn(
          `NIN payment verify rejected for transaction ${existingTransaction._id}: ${verificationResult.error}`,
        );
      }
      return NextResponse.json(
        { error: "Payment verification failed at provider" },
        { status: 400 },
      );
    }

    existingTransaction.status = "success";
    existingTransaction.provider_reference =
      existingTransaction.provider === "flutterwave" &&
      verificationResult.raw?.data?.id
        ? String(verificationResult.raw.data.id)
        : storedReference;
    await existingTransaction.save();

    await VerificationSessionModel.findOneAndUpdate(
      { transaction_id: existingTransaction._id.toString() },
      {
        user_id: session.user.id,
        transaction_id: existingTransaction._id.toString(),
        status: "pending",
        status_reason: "payment_verified",
      },
      { upsert: true, returnDocument: "after" },
    );

    await UserModel.updateOne(
      { _id: session.user.id },
      { ninStatus: "pending" },
    );

    return NextResponse.json(
      { message: "Payment verified successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying NIN payment", error);
    return NextResponse.json(
      { error: "Failed to verify NIN payment" },
      { status: 500 },
    );
  }
});
