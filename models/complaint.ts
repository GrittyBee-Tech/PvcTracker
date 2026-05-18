import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComplaint extends Document {
  name: string;
  email: string;
  phone?: string;
  complaintType: "technical" | "registration" | "pvc-collection" | "user-experience" | "other";
  message: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema<IComplaint> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    complaintType: {
      type: String,
      enum: ["technical", "registration", "pvc-collection", "user-experience", "other"],
      required: true,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ComplaintModel: Model<IComplaint> =
  mongoose.models.Complaint || mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default ComplaintModel;
