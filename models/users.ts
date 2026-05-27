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
  nin?: string; // National Identification Number
  vin?: string; // Voter Identification Number
  ninVerified: boolean;
  pvcStatus: "collected" | "not_collected";
  pvcStatusUpdatedAt: Date;
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
    nin: { type: String, unique: true, sparse: true }, // Optional and unique if provided
    vin: { type: String, unique: true, sparse: true }, // Optional and unique if provided
    ninVerified: { type: Boolean, default: false },
    pvcStatus: {
      type: String,
      enum: ["collected", "not_collected"],
      default: "not_collected",
    },
    pvcStatusUpdatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true },
);

// 3. Export the model, preventing duplicate compilation errors during Next.js hot-reloads
const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
