import { withDb } from "@/lib/withDb";
import { createComplaint } from "@/services/complaintService";
import { NextResponse } from "next/server";

export const POST = withDb(async (request: Request) => {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.complaintType || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const complaint = await createComplaint(body);

    return NextResponse.json(
      { message: "Complaint submitted successfully", complaint },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Failed to submit complaint" },
      { status: 500 }
    );
  }
});
