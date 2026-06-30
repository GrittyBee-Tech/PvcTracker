import mongoose, { Schema, Document, Model } from "mongoose";
import { Permission, PERMISSIONS } from "@/types";

export interface IAdminProfile extends Document {
  userId: mongoose.Types.ObjectId;
  permissions: Permission[];
  assignedBy?: mongoose.Types.ObjectId;
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const AdminProfileSchema: Schema<IAdminProfile> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    permissions: {
      type: [String],
      enum: PERMISSIONS,
      default: [],
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

const AdminProfileModel: Model<IAdminProfile> =
  mongoose.models.AdminProfile || mongoose.model<IAdminProfile>("AdminProfile", AdminProfileSchema);

export default AdminProfileModel;
