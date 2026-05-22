import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuthToken extends Document {
  user_id: string; // Reference to the User document
  context: "email-verification" | "password-reset";
  token: string;
  status: "active" | "used" | "expired";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuthToken: Schema<IAuthToken> = new Schema(
  {
    user_id: { type: String, required: true },
    context: {
      type: String,
      required: true,
      enum: ["email-verification", "password-reset"],
    },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "used", "expired"],
      default: "active",
    },
  },
  { timestamps: true },
);

const AuthTokenModel: Model<IAuthToken> =
  mongoose.models.AuthToken ||
  mongoose.model<IAuthToken>("AuthToken", AuthToken);

export default AuthTokenModel;
