import { NextResponse } from "next/server";
import { withDb } from "@/lib/withDb";
import { createVolunteerApplication } from "@/services/volunteerService";
import { Types } from "mongoose";



export const POST = withDb(async (request: Request) => {
  try {
    const formData = await request.formData();

   const userIdString = formData.get("userId") as string;
   if (!userIdString || !Types.ObjectId.isValid(userIdString)) {
     return NextResponse.json(
       { error: "Invalid or missing userId" },
       { status: 400 }
     );
   }
   const userId = new Types.ObjectId(userIdString);

    const stateOfResidence = formData.get("stateOfResidence") as string;
    const homeAddress = formData.get("homeAddress") as string;
    const maritalStatus = formData.get("maritalStatus") as
      | "single"
      | "married"
      | "divorced"
      | "widowed";

    // ✅ FIX: transform flat inputs into nested object
    const nextOfKin = {
      name: formData.get("nextOfKinName") as string,
      relationship: formData.get("nextOfKinRelationship") as
        | "parent"
        | "sibling"
        | "spouse"
        | "friend"
        | "other",
      state: formData.get("nextOfKinState") as string,
      address: formData.get("nextOfKinAddress") as string,
      phone: formData.get("nextOfKinPhone") as string,
    };

    const file = formData.get("passportPhoto") as File;

    if (!userId || !stateOfResidence || !homeAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: upload file to storage
    const passportPhotoUrl = file ? "UPLOADED_URL_HERE" : "";

    const volunteerApplication = await createVolunteerApplication({
      userId,
      passportPhotoUrl,
      stateOfResidence,
      homeAddress,
      maritalStatus,
      nextOfKin,
    });

    return NextResponse.json(
      {
        message: "Volunteer application submitted successfully",
        volunteerApplication,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit volunteer application" },
      { status: 500 }
    );
  }
});