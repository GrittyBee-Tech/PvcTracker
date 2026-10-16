import { NextResponse } from "next/server";
import { withDb } from "@/lib/withDb";
import TransactionModel from "@/models/transaction";
import VerificationSessionModel from "@/models/verificationSession";
import {
  verifyFlutterwavePayment,
  verifyFlutterwaveSignature,
} from "@/lib/paymentHelpers";

// Types for Flutterwave Webhook Payload
interface FlutterwaveWebhookPayload {
  event: string;
  "event.type"?: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref?: string;
    device_fingerprint?: string;
    amount: number;
    currency: string;
    charged_amount?: number;
    status: "successful" | "failed" | string;
    payment_type?: string;
    customer?: {
      id?: number;
      name?: string;
      email?: string;
      phone_number?: string | null;
    };
    meta?: {
      userId?: string;
      purpose?: string;
      [key: string]: unknown;
    };
  };
}

export const POST = withDb(async (request: Request) => {
  try {
    const signature = request.headers.get("verif-hash");

    // 1. Verify Flutterwave signature header
    if (!verifyFlutterwaveSignature(signature)) {
      console.warn(
        "Flutterwave webhook rejected: invalid or missing verif-hash",
      );
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 },
      );
    }

    // Read body ONCE (Request stream can only be read once)
    const payload = (await request.json().catch((e) => {
      console.error("Error parsing Flutterwave webhook payload:", e);
      return null;
    })) as FlutterwaveWebhookPayload | null;

    if (!payload || !payload.data) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    console.log("Flutterwave webhook received:", {
      event: payload.event,
      id: payload.data.id,
      tx_ref: payload.data.tx_ref,
      status: payload.data.status,
    });

    // 2. Only process charge.completed events
    if (payload.event !== "charge.completed") {
      return NextResponse.json(
        { message: `Event ${payload.event} acknowledged` },
        { status: 200 },
      );
    }

    const { id, flw_ref, status } = payload.data;
    // Flutterwave sends tx_ref, but allow reference fallback for testing
    const tx_ref =
      payload.data.tx_ref || (payload.data as Record<string, any>).reference;

    // 3. Find matching transaction in database
    const transaction = await TransactionModel.findOne({
      $or: [
        { reference: tx_ref },
        ...(id ? [{ provider_reference: String(id) }] : []),
      ],
    });

    if (!transaction) {
      console.warn(
        `Flutterwave webhook: Transaction not found for tx_ref: ${tx_ref}, ID: ${id}`,
      );
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 },
      );
    }

    // 4. Idempotency: acknowledge immediately if already successfully processed
    if (transaction.status === "success") {
      return NextResponse.json(
        { message: "Transaction already processed" },
        { status: 200 },
      );
    }

    if (status === "successful") {
      // 5. Security best practice: re-query Flutterwave's verify API
      const verification = id
        ? await verifyFlutterwavePayment(String(tx_ref))
        : { ok: false, status: 400, raw: null };

      if (!verification.ok) {
        console.error(
          `Flutterwave webhook: API verification failed for ref ${tx_ref}`,
          verification.raw,
        );
        return NextResponse.json(
          { message: "Transaction verification failed at provider" },
          { status: 400 },
        );
      }

      // Mark transaction as successful
      transaction.status = "success";
      transaction.provider_reference = String(id);
      transaction.meta = {
        ...transaction.meta,
        ...(flw_ref ? { flw_ref } : {}),
        webhook_event: payload.event,
        verified_at: new Date(),
      };
      await transaction.save();

      // Create or update verification session idempotently with verified data
      await VerificationSessionModel.findOneAndUpdate(
        { transaction_id: transaction._id.toString() },
        {
          user_id: transaction.user_id,
          transaction_id: transaction._id.toString(),
          status: "pending",
          status_reason: "payment_verified",
        },
        { upsert: true, returnDocument: "after" },
      );

      return NextResponse.json(
        { message: "Payment verified and session activated" },
        { status: 200 },
      );
    }

    if (status === "failed") {
      transaction.status = "failed";
      transaction.provider_reference = String(id);
      await transaction.save();

      return NextResponse.json(
        { message: "Transaction recorded as failed" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: `Transaction status '${status}' recorded` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Flutterwave Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
});
