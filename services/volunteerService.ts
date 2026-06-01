import VolunteerModel, { IVolunteer, VolunteerApplicationInput } from "@/models/volunteerApplication";

export async function createVolunteerApplication(
 
  data: VolunteerApplicationInput

): Promise<IVolunteer> {
    await VolunteerModel.findOne({ userId: data.userId }).then((existingApplication) => {
    if (existingApplication) {
      throw new Error("User has already applied to be a volunteer");
    }
  });
  const volunteerApplication = new VolunteerModel({
    ...data,
    isApproved: false, // New applications are not approved by default
  });
  await volunteerApplication.save();
  return volunteerApplication;
}