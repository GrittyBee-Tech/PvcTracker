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

    const existingTransaction = await TransactionModel.findOne({
      user_id: session.user.id,
      purpose: "NIN Verification",
    });

    const latestSession = await VerificationSessionModel.findOne({
      user_id: session.user.id,
    });

    const paymentStatus: "success" | "pending" | "failed" =
      existingTransaction?.status || "pending";
    let ninStatus = "pending";

    if (existingTransaction) {
      const usedSession = await VerificationSessionModel.findOne({
        transaction_id: existingTransaction._id.toString(),
        status: { $in: ["verified", "rejected"] },
      });
      if (usedSession?.status) {
        ninStatus = usedSession?.status;
      }
    }
    const reason = latestSession?.status_reason || "";

    return NextResponse.json(
      {
        paymentStatus,
        ninStatus,
        message:
          reason ||
          (paymentStatus === "success"
            ? "Payment completed"
            : paymentStatus === "pending"
              ? "Payment is pending"
              : paymentStatus === "failed"
                ? "Payment failed"
                : "NIN verification pending"),
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
