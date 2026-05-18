import ComplaintModel, { IComplaint } from "@/models/complaint";

export async function createComplaint(
  data: Omit<IComplaint, "_id" | "createdAt" | "updatedAt" | "status">
): Promise<IComplaint> {
  const complaint = new ComplaintModel({
    ...data,
    status: "pending",
  });

  await complaint.save();
  return complaint;
}

export async function getComplaints(): Promise<IComplaint[]> {
  return ComplaintModel.find().sort({ createdAt: -1 });
}

export async function getComplaintById(id: string): Promise<IComplaint | null> {
  return ComplaintModel.findById(id);
}

export async function updateComplaintStatus(
  id: string,
  status: "pending" | "in-progress" | "resolved"
): Promise<IComplaint | null> {
  return ComplaintModel.findByIdAndUpdate(id, { status }, { new: true });
}
