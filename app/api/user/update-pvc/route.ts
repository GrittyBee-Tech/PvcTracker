import { auth } from "@/lib/auth";
import { withDb } from "@/lib/withDb";
import UserModel from "@/models/users";
import { NextResponse } from "next/server";
import { z } from "zod";

export const updatePVCSchema = z.object({
  pvcStatus: z.enum(["not_collected", "collected"]),
});

export type updatePVCData = z.infer<typeof updatePVCSchema>;

export const POST = withDb(async (request: Request) => {
  const body = await request.json();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found", id: userId },
        { status: 400 },
      );
    }
    const now = Date.now()
    console.log(now);
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    const pvcStatusLastUpdated = new Date(user.pvcStatusUpdatedAt).getTime();

    if (now - pvcStatusLastUpdated < twentyFourHoursInMs) {
      return NextResponse.json(
        { message: "You cannot update PVC less than 24 hours after" },
        { status: 400 },
      );
    }
    await UserModel.updateOne(
      { _id: userId },
      { pvcStatus: body.pvcStatus, pvcStatusUpdatedAt: now },
    );

    return NextResponse.json(
      { message: "User PVC updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user PVC:", error);
    return NextResponse.json(
      { error: "Failed to submit PVC" },
      { status: 500 },
    );
  }
});
