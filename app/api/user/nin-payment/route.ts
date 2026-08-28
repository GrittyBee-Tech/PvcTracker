import { auth } from "@/lib/auth";
import {
  initializeFlutterwavePayment,
  initializePaystackPayment,
} from "@/lib/paymentHelpers";
import { withDb } from "@/lib/withDb";
import TransactionModel from "@/models/transaction";
import VerificationSessionModel from "@/models/verificationSession";
import { User } from "better-auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const user = session.user as typeof session.user & Partial<User>;
    const email = user.email;
    const amount = Number(process.env.LUMIID_VERIFICATION_AMOUNT || 0);
    const provider = body.provider || process.env.DEFAULT_PAYMENT_PROVIDER;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";
    const redirectUrl = `${appUrl.replace(/\/$/, "")}/dashboard/user/verify-nin`;

    const existingTransaction = await TransactionModel.findOne({
      user_id: user.id,
      purpose: "NIN Verification",
      status: "success",
    });

    if (existingTransaction) {
      // && existingTransaction.provider !== "flutterwave"
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
            provider: existingTransaction.provider,
          },
          { status: 200 },
        );
      }
    }

    const pendingTransaction = await TransactionModel.findOne({
      user_id: user.id,
      purpose: "NIN Verification",
      status: "pending",
    });

    if (pendingTransaction) {
      return NextResponse.json(
        {
          message: "Payment initialization resumed.",
          payment_status: "pending",
          provider: pendingTransaction.provider,
          reference: pendingTransaction.reference,
          amount: pendingTransaction.amount,
          currency: "NGN",
          meta: pendingTransaction.meta || {},
          access_code: pendingTransaction.access_code,
        },
        { status: 200 },
      );
    }

    if (provider === "flutterwave") {
      const customer = {
        email,
        name:
          [user?.firstName, user?.lastName]
            .filter(Boolean)
            .join(" ") || email,
      };

      const initResult = await initializeFlutterwavePayment({
        userId: user.id,
        email,
        amount,
        redirectUrl,
        customer,
      });

      if (!initResult.ok) {
        console.error("Flutterwave Initialization Error:", initResult.raw);
        return NextResponse.json(
          { error: initResult.error || "Failed to initialize NIN payment" },
          { status: initResult.status },
        );
      }

      await TransactionModel.create({
        user_id: user.id,
        reference: initResult.reference,
        provider: "flutterwave",
        access_code: initResult.payment_url,
        purpose: "NIN Verification",
        amount: initResult.amount!,
        status: "pending",
        meta: initResult.meta || {},
      });

      return NextResponse.json(
        {
          message: "Payment initialized successfully",
          payment_status: "pending",
          provider: "flutterwave",
          reference: initResult.reference,
          amount: initResult.amount,
          currency: initResult.currency,
          meta: initResult.meta,
          payment_url: initResult.payment_url,
        },
        { status: 201 },
      );
    }

    const initResult = await initializePaystackPayment({
      userId: user.id,
      email,
      amount,
    });

    if (!initResult.ok) {
      console.error("Paystack Initialization Error:", initResult.raw);
      return NextResponse.json(
        { error: initResult.error || "Failed to initialize NIN payment" },
        { status: initResult.status },
      );
    }

    await TransactionModel.create({
      user_id: user.id,
      reference: initResult.reference!,
      provider: "paystack",
      access_code: initResult.access_code,
      purpose: "NIN Verification",
      amount,
      status: "pending",
    });

    return NextResponse.json(
      {
        message: initResult.message,
        payment_status: "pending",
        provider: "paystack",
        access_code: initResult.access_code,
        reference: initResult.reference,
        amount,
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
