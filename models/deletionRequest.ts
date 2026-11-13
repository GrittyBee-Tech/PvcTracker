import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Deletion log. One document per admin-initiated account deletion.
 *
 * Holds no personal data (only IDs), so it survives the user's anonymization
 * and can be kept as the permanent record of the request.
 */
export type DeletionRequestStatus =
  | "pending" // soft-deleted, waiting for the retention period to end
  | "cancelled" // restored by an admin before anonymization
  | "processing" // claimed by a cron run
  | "completed" // personal data anonymized
  | "failed"; // anonymization errored; retried on the next cron run

export interface IDeletionRequest extends Document {
  reference: string;
  userId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  requestedAt: Date;
  scheduledFor: Date;
  completedAt?: Date;
  status: DeletionRequestStatus;
  reason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  attempts: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeletionRequestSchema: Schema<IDeletionRequest> = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestedAt: { type: Date, required: true },
    scheduledFor: { type: Date, required: true },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "processing", "cancelled", "completed", "failed"],
      default: "pending",
      required: true,
    },
    reason: { type: String, maxlength: 500 },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
    cancelledAt: { type: Date },
    attempts: { type: Number, default: 0 },
    lastError: { type: String },
  },
  { timestamps: true },
);

DeletionRequestSchema.index({ status: 1, scheduledFor: 1 });
DeletionRequestSchema.index({ userId: 1, status: 1 });

const DeletionRequestModel: Model<IDeletionRequest> =
  mongoose.models.DeletionRequest ||
  mongoose.model<IDeletionRequest>("DeletionRequest", DeletionRequestSchema);

export default DeletionRequestModel;
