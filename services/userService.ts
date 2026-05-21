import "server-only";

import UserModel from "@/models/users";
import { CreateUserRequestData, createUserSchema } from "@/schemas/userSchema";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendWelcomeEmail } from "./emailService";
import AuthTokenModel from "@/models/authTokens";

export async function createUser(userData: CreateUserRequestData) {
  try {
    const validatedData = createUserSchema.parse(userData);
    const existingUser = await UserModel.findOne({
      email: validatedData.email,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const newUser = await UserModel.create({
      ...validatedData,
      password: hashedPassword,
    });

    const frontendOrigin =
      process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    const verificationUrl = `${frontendOrigin}/verify-email?token=${verificationToken}`;

    await Promise.all([
      sendWelcomeEmail(
        validatedData.email,
        validatedData.firstName,
        verificationUrl,
      ).catch((err) => {
        console.error("Asynchronous background email dispatch failed:", err);
      }),
      AuthTokenModel.create({
        user: newUser._id,
        context: "email-verification",
        token: hashedToken,
        expiresAt: tokenExpiry,
      }),
    ]);

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 },
    );
  } catch (error) {
    console.log({ error });
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function setPassword(userId: string, password: string) {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.password = password;
    await user.save();
  } catch (error) {}
}
