import VolunteerModel, { IVolunteer, VolunteerApplicationInput } from "@/models/volunteerApplication";

export async function createVolunteerApplication(
  data: VolunteerApplicationInput
): Promise<IVolunteer> {
  const volunteerApplication = new VolunteerModel({
    ...data,
    isApproved: false, // New applications are not approved by default
  });
  await volunteerApplication.save();
  return volunteerApplication;
}