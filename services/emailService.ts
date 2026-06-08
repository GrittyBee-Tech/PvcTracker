// services/emailService.ts
import { Resend } from "resend";
import WelcomeEmail from "@/emails/WelcomeEmail";
import React from "react";
import "server-only";
import { ResetPasswordEmail } from "@/emails/ResetPasswordEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  verificationUrl: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "PVC WAKA <onboarding@pvc-waka.izzyman.space>",
      to: [email],
      subject: "Welcome to PVC WAKA!",
      react: WelcomeEmail({ firstName, verificationUrl }) as React.ReactElement,
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

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetUrl: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "PVC WAKA <onboarding@pvc-waka.izzyman.space>",
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
