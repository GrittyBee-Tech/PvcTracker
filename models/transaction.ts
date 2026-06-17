import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  user_id: string;
  reference: string;
  purpose: string;
  access_code: string;
  amount: number;
  status: "pending" | "success" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    user_id: { type: String, required: true },
    reference: { type: String, required: true },
    access_code: { type: String, required: true },
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
