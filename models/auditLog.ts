import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string; // e.g., "DELETE_USER", "APPROVE_VOLUNTEER", "BATCH_UPLOAD"
  targetId?: string; // ID of the user/volunteer/centre being acted upon
  targetModel?: string; // "User", "Volunteer", "Centre"
  details: string; // Human readable description
  metadata?: any; // Any additional data (IP address, previous state, etc.)
  createdAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetId: {
      type: String,
    },
    targetModel: {
      type: String,
    },
    details: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLogModel;
