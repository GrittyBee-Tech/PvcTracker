import { withDb } from "@/lib/withDb";
import { checkPermission } from "@/lib/permissions";
import { restoreUserDeletion } from "@/lib/userDeletion";
import { NextResponse } from "next/server";

export const POST = withDb(
  async (
    request: Request,
    { params }: { params: Promise<{ requestId: string }> },
  ) => {
    try {
      const { authorized, response, session } = await checkPermission(request, "manage:users");
      if (!authorized && response) return response;

      const { requestId } = await params;
      const result = await restoreUserDeletion({
        requestId,
        adminId: session!.user.id,
      });

      if (!result.ok) {
        return NextResponse.json({ message: result.message }, { status: result.status });
      }

      return NextResponse.json(
        { message: "User restored", reference: result.value.reference },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error restoring user", error);
      return NextResponse.json({ message: "Failed to restore user" }, { status: 500 });
    }
  },
);
