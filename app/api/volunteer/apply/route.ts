import { NextResponse } from "next/server";
import { withDb } from "@/lib/withDb";
import { createVolunteerApplication } from "@/services/volunteerService";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import VolunteerModel from "@/models/volunteerApplication";



export const POST = withDb(async (request: Request) => {
  try {
    const formData = await request.formData();

    const session = await auth.api.getSession(request);
    const userId = new Types.ObjectId(session?.user.id as string);
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
    console.log({
     userId,
     stateOfResidence,
     homeAddress,
     maritalStatus,
    nextOfKin,
});


    const PhotoUrl = formData.get("PhotoUrl") as string;

    console.log({ userId, stateOfResidence, homeAddress, maritalStatus, PhotoUrl });
    if (!userId || !stateOfResidence || !homeAddress || !maritalStatus || !PhotoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const volunteerApplication = await createVolunteerApplication({
      userId,
      PhotoUrl,
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
  console.error("FULL ERROR:", error);

  return NextResponse.json(
    {
      error: "Failed to submit volunteer application",
      details: error instanceof Error ? error.message : error,
    },
    { status: 500 }
  );
}
});


export const GET = withDb(async (request: Request) => {
  try {
    const session = await auth.api.getSession(request);
    const userId = new Types.ObjectId(session?.user.id as string);
    const Application = await VolunteerModel.findOne({
      userId,
    });
    return NextResponse.json({ message: "Volunteer application fetched successfully", application: Application   });
    
  } catch (error) {
    console.error("Error in GET /api/volunteer/apply:", error);
    return NextResponse.json(
      { error: "Failed to handle GET request" },
      { status: 500 }
    );
  }
});