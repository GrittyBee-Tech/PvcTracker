import { withDb } from "@/lib/withDb";
import { createUser } from "@/services/userService";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  const body = await request.json();
  const newUser = await createUser(body);
  
  return NextResponse.json(newUser, { status: 201 });
});
