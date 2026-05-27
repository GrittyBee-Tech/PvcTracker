import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserType {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber: string;
  emailVerified: boolean;
  role: "user" | "admin" | "volunteer"; // Example roles
  nin: string; // National Identification Number
  vin?: string; // Voter Identification Number
  ninStatus: "pending" | "rejected" | "verified";
  pvcStatus: "collected" | "not_collected";
  createdAt: Date;
  updatedAt: Date;
}
export interface IUser extends UserType, Document {}

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
    vin: { type: String, unique: true, sparse: true }, // Optional and unique if provided
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
  },
  { timestamps: true },
);

// 3. Export the model, preventing duplicate compilation errors during Next.js hot-reloads
const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
