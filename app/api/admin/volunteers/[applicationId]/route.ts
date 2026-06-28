import { withDb } from "@/lib/withDb";
import VolunteerModel from "@/models/volunteerApplication";
import UserModel from "@/models/users";
import AuditLogModel from "@/models/auditLog";
import { checkPermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

export const PATCH = withDb(async (request: Request, { params }: { params: { applicationId: string } }) => {
  try {
    const { authorized, response, session } = await checkPermission(request, "manage:volunteers");
    if (!authorized && response) return response;

    const { action, note } = await request.json();
    const { applicationId } = params;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const application = await VolunteerModel.findById(applicationId).populate("userId");
    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 });
    }

    const user = application.userId as any;

    if (action === "approve") {
      application.status = "approved";
      // You could store the approval note here if you extend the schema
      await application.save();

      // Update user role to volunteer
      if (user.role !== "volunteer") {
        await UserModel.findByIdAndUpdate(user._id, { role: "volunteer" });
      }
    } else if (action === "reject") {
      application.status = "rejected";
      await application.save();
    }

    // Create Audit Log
    await AuditLogModel.create({
      adminId: session!.user.id,
      action: action === "approve" ? "APPROVE_VOLUNTEER" : "REJECT_VOLUNTEER",
      targetId: user._id.toString(),
      targetModel: "User",
      details: `${action === "approve" ? "Approved" : "Rejected"} volunteer application for ${user.firstName} ${user.lastName}`,
      metadata: {
        note,
        applicationId,
      },
    });

    return NextResponse.json(
      { message: `Application ${action}d successfully` },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error processing application", error);
    return NextResponse.json(
      { message: error.message || "Failed to process application" },
      { status: 500 },
    );
  }
});
