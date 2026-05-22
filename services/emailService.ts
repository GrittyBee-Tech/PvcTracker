// services/emailService.ts
import { Resend } from "resend";
import WelcomeEmail from "@/emails/WelcomeEmail";
import React from "react";
import "server-only";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  verificationUrl: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "PVC WAKA <onboarding@pvc-waka.izzyman.space",
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
