import mongoose, { Schema, Document, Model } from "mongoose";

// // 1. Define the TypeScript interface representing the User document
export interface IUser extends Document {
  //   externalAuthId?: string; // For third-party auth (Clerk, Auth0, NextAuth)
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  phoneNumber: string;
  role: "user" | "admin" | "volunteer"; // Example roles
  nin?: string; // National Identification Number
  emailVerified: boolean;
  ninVerified: boolean;
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
    nin: { type: String, unique: true, sparse: true }, // Optional and unique if provided
    emailVerified: { type: Boolean, default: false },
    ninVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
); // Automatically manage createdAt and updatedAt fields

// 3. Export the model, preventing duplicate compilation errors during Next.js hot-reloads
const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
