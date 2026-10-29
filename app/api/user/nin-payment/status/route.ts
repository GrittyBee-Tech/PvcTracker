import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import TransactionModel from "@/models/transaction";
import VerificationSessionModel from "@/models/verificationSession";
import { NextResponse } from "next/server";

export const GET = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Always fetch the latest verification session
    const latestSession = await VerificationSessionModel.findOne({
      user_id: session.user.id,
    }).sort({ createdAt: -1 });

    // Always fetch the latest transaction for NIN Verification
    const latestTransaction = await TransactionModel.findOne({
      user_id: session.user.id,
      purpose: "NIN Verification",
    }).sort({ createdAt: -1 });

    let paymentStatus: "success" | "pending" | "failed" = "pending";
    let ninStatus: "pending" | "verified" | "rejected" = "pending";
    let message = "";

    if (latestSession) {
      if (latestSession.status === "verified") {
        paymentStatus = "success";
        ninStatus = "verified";
        message = "NIN verification completed";
      } else if (latestSession.status === "pending") {
        // Active credit ready to verify
        paymentStatus = "success";
        ninStatus = "pending";
        message =
          latestSession.status_reason ||
          "Payment completed. Please verify your NIN.";
      } else if (latestSession.status === "rejected") {
        // Attempt consumed; user must pay again to start a new session
        ninStatus = "rejected";
        // Check if there is an in-flight pending transaction for a new attempt
        if (
          latestTransaction &&
          latestTransaction.createdAt > latestSession.createdAt &&
          latestTransaction.status === "pending"
        ) {
          paymentStatus = "pending";
          message = "Payment is pending";
        } else {
          paymentStatus = "failed";
          message =
            latestSession.status_reason ||
            "Your profile information does not match your official NIN record. Please pay and verify again.";
        }
      }
    } else {
      // No verification session created yet
      if (latestTransaction?.status === "success") {
        paymentStatus = "success";
        ninStatus = "pending";
        message = "Payment completed. Please verify your NIN.";
      } else if (latestTransaction?.status === "pending") {
        paymentStatus = "pending";
        message = "Payment is pending";
      } else {
        paymentStatus = "failed";
        message = "Payment is required for NIN verification.";
      }
    }

    return NextResponse.json(
      {
        paymentStatus,
        ninStatus,
        message,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking NIN payment status", error);
    return NextResponse.json(
      { error: "Failed to check NIN payment status" },
      { status: 500 },
    );
  }
});
