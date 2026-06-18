import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import TransactionModel from "@/models/transaction";
import VerificationSessionModel from "@/models/verificationSession";

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
  // if
  // if (existingTransaction && existingTransaction.user_id !==) {
  if (existingTransaction && existingTransaction.status === "success") {
    return true;
  }
  return false;
}

async function triggerIdVerificationService(userId: string): Promise<void> {
  // Fire off your external NIN validation logic here

  await VerificationSessionModel.create({
    user_id: userId,
  });
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

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      const transaction = await TransactionModel.find({ reference }).lean();
      if (transaction && transaction?.user_id !== metadata.userId) {
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

        //       await TransactionModel.updateOne(
        //   {
        //     user_id: ,
        //     purpose: "NIN Verification",
        //   },
        //   {
        //     status: "success",
        //   },
        // );
        await triggerIdVerificationService(metadata.userId);
      }
    }

    // Paystack requires a 200 OK within 2 seconds
    return new NextResponse("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    // Return a 400 or 500 so Paystack knows to retry later if your internal system crashed
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
