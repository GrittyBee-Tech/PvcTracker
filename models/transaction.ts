import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  user_id: string;
  reference: string;
  provider: "paystack" | "flutterwave";
  provider_reference?: string; // Optional field for provider's reference
  purpose: string;
  access_code?: string;
  amount: number;
  status: "pending" | "success" | "failed";
  createdAt: Date;
  updatedAt: Date;
  meta?: Record<string, any>; // Optional field for additional metadata
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    user_id: { type: String, required: true },
    reference: { type: String, required: true },
    provider: {
      type: String,
      enum: ["paystack", "flutterwave"],
      required: true,
      default: "flutterwave",
    },
    provider_reference: { type: String }, // Optional field for provider's reference
    meta: { type: Schema.Types.Mixed, default: {} },
    access_code: { type: String },
    purpose: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const TransactionModel: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default TransactionModel;
