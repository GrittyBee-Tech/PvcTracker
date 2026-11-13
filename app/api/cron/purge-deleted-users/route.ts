import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { withDb } from "@/lib/withDb";
import { processDueDeletions } from "@/lib/userDeletion";

// Scheduled in vercel.json. Vercel sends `Authorization: Bearer $CRON_SECRET`.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || !header) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export const GET = withDb(async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not set; refusing to run deletion purge");
    return NextResponse.json({ message: "Not configured" }, { status: 500 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const summary = await processDueDeletions();
  console.info("Deletion purge finished", summary);

  return NextResponse.json(
    {
      completed: summary.completed.length,
      failed: summary.failed.length,
      references: summary,
    },
    { status: summary.failed.length ? 207 : 200 },
  );
});
