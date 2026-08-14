import { NextResponse } from "next/server";
// import full from "@/data/full.json";
import data from "@/data/inec-centres.json";

export const GET = () => {
  const stateArray = data.map((item) => item["State/FCT"]);
  const uniqueStates = Array.from(new Set(stateArray));

  const myStates = uniqueStates.map((item) => ({
    name: item,
    value: item.toLowerCase().split(" ").join("_"),
  }));

  return NextResponse.json({ data: myStates });
};
