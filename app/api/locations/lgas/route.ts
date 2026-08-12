import { NextResponse } from "next/server";
import data from "@/data/inec-centres.json";

type Office = {
  officeName: string;
  address: string;
  pdfPage: string | number;
};

type LgaResponse = {
  name: string;
  value: string;
  offices: Office[];
};

export const GET = (request: Request) => {
  const url = new URL(request.url);
  const stateName = url.searchParams.get("state");

  if (!stateName) {
    return NextResponse.json(
      { error: "Missing state query parameter" },
      { status: 400 },
    );
  }

  const formattedStateName = stateName.split("_").join(" ").toUpperCase();
  const stateEntries = Array.isArray(data)
    ? data.filter((item) => item["State/FCT"] === formattedStateName)
    : [];

  if (stateEntries.length === 0) {
    return NextResponse.json(
      { error: `State '${stateName}' not found` },
      { status: 404 },
    );
  }

  const lgaMap = new Map<string, LgaResponse>();

  for (const item of stateEntries) {
    const lgaName = item["LGA/Area Council"];
    const lgaKey = lgaName.toLowerCase().split(" ").join("_");
    const office: Office = {
      officeName: item["Office Name"],
      address: item["Published Address"],
      pdfPage: item["PDF Page"],
    };

    if (lgaMap.has(lgaName)) {
      lgaMap.get(lgaName)?.offices.push(office);
      continue;
    }

    lgaMap.set(lgaName, {
      name: lgaName,
      value: lgaKey,
      offices: [office],
    });
  }

  return NextResponse.json({ data: Array.from(lgaMap.values()) });
};
