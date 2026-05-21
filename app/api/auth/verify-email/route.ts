import { NextResponse } from "next/server";
import { withDb } from "@/lib/withDb";
import AuthTokenModel from "@/models/authTokens";
import User from "@/models/users";
import crypto from "crypto";

export const GET = withDb(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const incomingRawToken = searchParams.get("token");

  if (!incomingRawToken) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 });
  }

  // Hash the incoming token to match what is stored in the database
  const targetHash = crypto
    .createHash("sha256")
    .update(incomingRawToken)
    .digest("hex");

  // Search using the hash
  const tokenDoc = await AuthTokenModel.findOne({
    token: targetHash,
    context: "email-verification",
    status: "active",
  });

  if (!tokenDoc) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  // 3. Check if the token has expired
  if (new Date() > tokenDoc.expiresAt) {
    tokenDoc.status = "expired";
    await tokenDoc.save();
    return NextResponse.json(
      { error: "This verification token has expired" },
      { status: 400 },
    );
  }

  // 4. Locate and update the associated User
  const user = await User.findById(tokenDoc.user_id);
  if (!user) {
    return NextResponse.json(
      { error: "Associated user account not found" },
      { status: 404 },
    );
  }

  if (user.isEmailVerified) {
    // If they clicked it twice, don't crash, just let them pass
    tokenDoc.status = "used";
    await tokenDoc.save();
    return NextResponse.json(
      { message: "Email already verified" },
      { status: 200 },
    );
  }

  // Mark user verified
  user.isEmailVerified = true;
  await user.save();

  // 5. Burn the token so it can't be used again (Atomic integrity)
  tokenDoc.status = "used";
  await tokenDoc.save();

  return NextResponse.json(
    { message: "Email verified successfully!" },
    { status: 200 },
  );
});
