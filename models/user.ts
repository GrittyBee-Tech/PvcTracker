import mongoose, { Schema, Document, Model } from "mongoose";

// // 1. Define the TypeScript interface representing the User document
export interface IUser extends Document {
  //   externalAuthId?: string; // For third-party auth (Clerk, Auth0, NextAuth)
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  gender: string;
  phone_number: string;
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
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ["male", "female"] },
    phone_number: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "volunteer"],
      default: "user",
    },
    nin: { type: String, unique: true },
    emailVerified: { type: Boolean, default: false },
    ninVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
); // Automatically manage createdAt and updatedAt fields

// 3. Export the model, preventing duplicate compilation errors during Next.js hot-reloads
const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
