import mongoose, { Schema, Document, Model } from "mongoose";
import { UserType } from "@/types";

export interface IUser extends UserType, Document {
  pvcStatusUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ["male", "female"] },
    phoneNumber: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "volunteer"],
      default: "user",
    },
    emailVerified: { type: Boolean, default: false },
    nin: { type: String, unique: true, required: true },
    vin: { type: String, unique: true, sparse: true, length: 19 }, // Optional and unique if provided
    ninStatus: {
      type: String,
      enum: ["pending", "rejected", "verified"],
      default: "pending",
      required: true,
    },
    pvcStatus: {
      type: String,
      enum: ["collected", "not_collected"],
      default: "not_collected",
      required: true,
    },
    pvcStatusUpdatedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    stateOfOrigin: {
      type: String,
      required: false,
    },
    lgaOfOrigin: {
      type: String,
      required: false,
    },
    votingState: {
      type: String,
      required: false,
    },
    votingLga: {
      type: String,
      required: false,
    },
    homeAddress: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "restricted", "deleted"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true },
);

// 3. Export the model, preventing duplicate compilation errors during Next.js hot-reloads
const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
