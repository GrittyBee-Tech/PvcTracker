import { withDb } from "@/lib/withDb";
import VolunteerModel from "@/models/volunteerApplication";
import UserModel from "@/models/users";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const POST = withDb(async (request: Request) => {
  try {
    const { authorized, response, session } = await checkPermission(request, "manage:volunteers");
    if (!authorized && response) return response;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (data.length === 0) {
      return NextResponse.json(
        { message: "The uploaded file is empty" },
        { status: 400 },
      );
    }

    // Identify columns (case-insensitive)
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    const emailKey = keys.find((k) => k.toLowerCase() === "email");
    const vinKey = keys.find((k) => k.toLowerCase() === "vin");

    if (!emailKey) {
      return NextResponse.json(
        { message: "Invalid file format. Email column is required." },
        { status: 400 },
      );
    }

    let successCount = 0;
    const errors = [];

    for (const row of data) {
      const email = row[emailKey]?.toString().trim();
      const vin = vinKey ? row[vinKey]?.toString().trim() : "";

      if (!email) continue;

      try {
        const user = await UserModel.findOne({
          email: { $regex: new RegExp(`^${email}$`, "i") },
        });

        if (!user) {
          errors.push(`User not found for email: ${email}`);
          continue;
        }

        // Check if already a volunteer
        const existingVolunteer = await VolunteerModel.findOne({
          userId: user._id,
        });
        if (existingVolunteer) {
          if (existingVolunteer.status !== "approved") {
            existingVolunteer.status = "approved";
            await existingVolunteer.save();
          }
        } else {
          // Create new volunteer record with placeholders for required fields
          await VolunteerModel.create({
            userId: user._id,
            status: "approved",
            PhotoUrl: "https://via.placeholder.com/150", // Placeholder
            stateOfResidence: user.stateOfOrigin || "Lagos",
            homeAddress: user.homeAddress || "Address not provided",
            maritalStatus: "single",
            nextOfKin: {
              name: "Not Provided",
              relationship: "other",
              state: "Lagos",
              address: "Not Provided",
              phone: "00000000000",
            },
          });
        }

        // Update user role
        if (user.role !== "volunteer") {
          user.role = "volunteer";
          if (vin) user.vin = vin;
          await user.save();
        }

        successCount++;
      } catch (err: any) {
        errors.push(`Error processing ${email}: ${err.message}`);
      }
    }

    // Create Audit Log
    await AuditLogModel.create({
      adminId: session?.user.id,
      action: "BATCH_UPLOAD_VOLUNTEERS",
      details: `Batch uploaded ${successCount} volunteers from file: ${file.name}`,
      metadata: {
        fileName: file.name,
        successCount,
        errorCount: errors.length,
      },
    });

    return NextResponse.json(
      {
        message: "Batch upload completed",
        count: successCount,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Batch upload error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process batch upload" },
      { status: 500 },
    );
  }
});

