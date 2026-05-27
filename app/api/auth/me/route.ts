import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";

export const GET = withDb(async (request: Request) => {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const query = session.user.id
    ? { _id: session.user.id }
    : session.user.email
      ? { email: session.user.email }
      : null;

  if (!query) {
    return NextResponse.json(
      { error: "Unable to determine user identity" },
      { status: 400 },
    );
  }

  const user = await UserModel.findOne(query).select("-password -__v").lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...user,
      id: user._id?.toString(),
    },
  });
});
