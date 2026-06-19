import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import TransactionModel from "@/models/transaction";

// Type definitions for Paystack Webhook Payload
interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    metadata: {
      userId: string;
      purpose: string;
    };
  };
}

// Simulated database & service functions - Replace with your actual ORM/Services
async function alreadyProcessed(reference: string): Promise<boolean> {
  const existingTransaction = await TransactionModel.findOne({ reference });
  if (existingTransaction && existingTransaction.status !== "pending") {
    return true;
  }
  return false;
}

// 1. Signature Verification Helper (Acts as your localized middleware)
function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  console.log("Computed Hash:", hash);

  return hash === signature;
}

// 2. The Next.js API Route Handler
export async function POST(req: NextRequest) {
  try {
    // Paystack delivers JSON, but we need the raw text string to validate the crypto hash accurately
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 },
      );
    }

    // Parse payload after signature validation passes
    const event = JSON.parse(rawBody) as PaystackEvent;

    const { reference, metadata } = event.data;
    // findOne returns a single transaction document instead of an array
    const transaction = await TransactionModel.findOne({ reference });
    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 },
      );
    }
    if (transaction.user_id !== metadata.userId) {
      return NextResponse.json(
        { message: "User ID mismatch" },
        { status: 400 },
      );
    }

    // Handle edge case where metadata might be missing or malformed
    if (metadata?.purpose === "id_verification") {
      const isDuplicate = await alreadyProcessed(reference);
      if (isDuplicate) {
        return NextResponse.json(
          { message: "Already processed" },
          { status: 200 },
        );
      }

      if (event.event === "charge.success") {
        // mark transaction as successful
        transaction.status = "success";

        // Create a verification session for the user
        // await VerificationSessionModel.create({
        //   user_id: metadata.userId,
        //   transaction_id: transaction._id.toString(),
        //   status: "pending",
        //   provider_response: event.data,
        //   status_reason: "",
        // });
      } else if (event.event === "charge.failed") {
        transaction.status = "failed";
      }
      await transaction.save();
    }

    // Paystack requires a 200 OK within 2 seconds
    return new NextResponse("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    // Return a 400 or 500 so Paystack knows to retry later if your internal system crashed
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
