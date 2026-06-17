import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerificationSession extends Document {
  user_id: string;
  transaction_id: string;
  status: "pending" | "verified" | "rejected";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider_response: Record<string, any>;
  status_reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSessionSchema: Schema<IVerificationSession> = new Schema(
  {
    user_id: { type: String, required: true },
    transaction_id: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    provider_response: {
      type: Object,
      required: true,
      default: {},
    },
    status_reason: { type: String, default: "" },
  },
  { timestamps: true },
);

const VerificationSessionModel: Model<IVerificationSession> =
  mongoose.models.VerificationSession ||
  mongoose.model<IVerificationSession>(
    "VerificationSession",
    VerificationSessionSchema,
  );

export default VerificationSessionModel;
