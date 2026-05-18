import "server-only";

import UserModel from "@/models/user";
import { createUserSchema } from "@/schemas/userSchema";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type CreateUserRequestData = {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
};

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

    const user = await UserModel.create(validatedData);
    return { message: "User created successfully", user };
  } catch (error) {
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
