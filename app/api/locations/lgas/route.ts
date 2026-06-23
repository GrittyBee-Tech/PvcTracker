import { NextResponse } from "next/server";
import full from "@/data/full.json";

export const GET = (request: Request) => {
  const url = new URL(request.url);
  const stateName = url.searchParams.get("state");

  if (!stateName) {
    return NextResponse.json(
      // { error: "Missing state query parameter" },
      { status: 400 },
    );
  }

  const stateEntry = Array.isArray(full)
    ? full.find((item) => item.state === stateName)
    : undefined;

  if (!stateEntry) {
    return NextResponse.json(
      { error: `State '${stateName}' not found` },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: stateEntry.lgas ?? [] });
};
