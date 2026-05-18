import { withDb } from "@/lib/withDb";
import { createUser } from "@/services/userService";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  const rawBody = await request.json();
  const newUser = await createUser(rawBody);

  return NextResponse.json(newUser, { status: 201 });
});
