import { NextResponse } from "next/server";
import full from "@/data/full.json";

export const GET = () => {
  const states = Array.isArray(full)
    ? full.map((item) => ({
        name: typeof item.state === "string" ? item.state : "",
        value: typeof item.state === "string" ? item.state : "",
      }))
    : [];

  return NextResponse.json({ data: states });
};
