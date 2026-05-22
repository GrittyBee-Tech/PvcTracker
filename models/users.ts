import mongoose, { Schema, Document, Model } from "mongoose";

export interface UserType {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  role: "user" | "admin" | "volunteer"; // Example roles
  nin?: string; // National Identification Number
  vin?: string; // Voter Identification Number
  ninVerified: boolean;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};
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
    isEmailVerified: { type: Boolean, default: false },
    nin: { type: String, unique: true, sparse: true }, // Optional and unique if provided
    vin: { type: String, unique: true, sparse: true }, // Optional and unique if provided
    ninVerified: { type: Boolean, default: false },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

// 3. Export the model, preventing duplicate compilation errors during Next.js hot-reloads
const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
