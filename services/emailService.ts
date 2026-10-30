// services/emailService.ts
import { Resend } from "resend";
import WelcomeEmail from "@/emails/WelcomeEmail";
import React from "react";
import "server-only";
import { ResetPasswordEmail } from "@/emails/ResetPasswordEmail";
import type { IComplaint } from "@/models/complaint";

function getResendInstance() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing API key. Pass it to the constructor `new Resend("re_123")` or set RESEND_API_KEY.',
    );
  }
  return new Resend(apiKey);
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  verificationUrl: string,
) {
  try {
    const resend = getResendInstance();
    const { data, error } = await resend.emails.send({
      from: "PVC WAKA <onboarding@support.pvctracker.org>",
      to: [email],
      subject: "Welcome to PVC WAKA!",
      react: WelcomeEmail({ firstName, verificationUrl }) as React.ReactElement,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Failed to dispatch email execution path:", err);
    return { success: false, error: err };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetUrl: string,
) {
  try {
    const resend = getResendInstance();
    const { data, error } = await resend.emails.send({
      from: "PVC WAKA <onboarding@support.pvctracker.org>",
      to: [email],
      subject: "Password Reset Request",
      react: ResetPasswordEmail({
        firstName,
        resetUrl,
        email,
      }) as React.ReactElement,
    });
    console.log({ data, error });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Failed to dispatch email execution path:", err);
    return { success: false, error: err };
  }
}

export async function sendComplaintNotification(
  complaint: Pick<
    IComplaint,
    "name" | "email" | "phone" | "complaintType" | "message" | "createdAt"
  >,
) {
  const recipients = process.env.COMPLAINTS_EMAIL_TO?.split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!recipients?.length) {
    console.error("Complaint notification not sent: COMPLAINTS_EMAIL_TO is not configured.");
    return { success: false };
  }

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character];
    });
  const complaintType = complaint.complaintType
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  try {
    const resend = getResendInstance();
    const { data, error } = await resend.emails.send({
      from: "PVC WAKA <onboarding@support.pvctracker.org>",
      to: recipients,
      replyTo: complaint.email,
      subject: `New PVC WAKA complaint: ${complaintType}`,
      text: [
        `Name: ${complaint.name}`,
        `Email: ${complaint.email}`,
        `Phone: ${complaint.phone || "Not provided"}`,
        `Type: ${complaintType}`,
        `Submitted: ${complaint.createdAt.toISOString()}`,
        "",
        "Complaint:",
        complaint.message,
      ].join("\n"),
      html: `
        <h2>New PVC WAKA complaint</h2>
        <p><strong>Name:</strong> ${escapeHtml(complaint.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(complaint.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(complaint.phone || "Not provided")}</p>
        <p><strong>Type:</strong> ${escapeHtml(complaintType)}</p>
        <p><strong>Submitted:</strong> ${escapeHtml(complaint.createdAt.toISOString())}</p>
        <p><strong>Complaint:</strong></p>
        <p>${escapeHtml(complaint.message).replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      console.error("Resend complaint notification error:", error);
      return { success: false };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Failed to send complaint notification:", error);
    return { success: false };
  }
}
