import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  firstName: string;
  email: string;
  resetUrl: string;
}

export const ResetPasswordEmail = ({
  firstName,
  email,
  resetUrl,
}: ResetPasswordEmailProps) => {
  const previewText = "Reset your PVC WAKA account password";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: "#f4f7f4",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            maxWidth: "540px",
            margin: "0 auto",
            padding: "36px 32px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Header / Brand Badge */}
          <Section style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "#f0f9f1",
                border: "1px solid #d1fae5",
                borderRadius: "24px",
                padding: "8px 20px",
              }}
            >
              <Text
                style={{
                  color: "#166534",
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: 0,
                  letterSpacing: "0.5px",
                }}
              >
                👣 PVC WAKA 🇳🇬
              </Text>
            </div>
          </Section>

          {/* Title & Greeting */}
          <Heading
            style={{
              color: "#0f172a",
              fontSize: "22px",
              fontWeight: "bold",
              textAlign: "center",
              margin: "0 0 16px 0",
              lineHeight: "30px",
            }}
          >
            Password Reset Request
          </Heading>

          <Text
            style={{
              color: "#334155",
              fontSize: "15px",
              lineHeight: "24px",
              margin: "0 0 16px 0",
            }}
          >
            Hello, {firstName}!
          </Text>

          <Text
            style={{
              color: "#334155",
              fontSize: "15px",
              lineHeight: "24px",
              margin: "0 0 24px 0",
            }}
          >
            We received a request to reset the password for your account
            associated with <strong>{email}</strong>. Click the button below to
            set a new password:
          </Text>

          {/* CTA Button */}
          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Link
              href={resetUrl}
              style={{
                backgroundColor: "#15803d",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "bold",
                textDecoration: "none",
                padding: "14px 32px",
                borderRadius: "8px",
                display: "inline-block",
                boxShadow: "0 3px 6px rgba(21, 128, 61, 0.2)",
              }}
            >
              Reset Password →
            </Link>
          </Section>

          <Text
            style={{
              color: "#64748b",
              fontSize: "13px",
              textAlign: "center",
              margin: "0 0 24px 0",
            }}
          >
            ⏱️ This link will expire in 15 minutes.
          </Text>

          <Text
            style={{
              color: "#64748b",
              fontSize: "13px",
              lineHeight: "20px",
              margin: "0 0 24px 0",
            }}
          >
            If you didn&apos;t request a password reset, you can safely ignore
            this email. Your password will remain unchanged.
          </Text>

          <Hr
            style={{
              borderColor: "#e2e8f0",
              margin: "24px 0",
              borderStyle: "solid",
            }}
          />

          {/* Direct Link / Fallback */}
          <Text
            style={{
              color: "#64748b",
              fontSize: "12px",
              lineHeight: "18px",
              margin: "0 0 6px 0",
            }}
          >
            If the button above doesn&apos;t work, copy and paste this URL into
            your web browser:
          </Text>
          <Text
            style={{
              color: "#15803d",
              fontSize: "12px",
              lineHeight: "18px",
              wordBreak: "break-all",
              margin: "0 0 24px 0",
              fontFamily: "monospace",
            }}
          >
            <Link href={resetUrl} style={{ color: "#15803d" }}>
              {resetUrl}
            </Link>
          </Text>

          <Hr
            style={{
              borderColor: "#e2e8f0",
              margin: "24px 0",
              borderStyle: "solid",
            }}
          />

          {/* Footer */}
          <Section style={{ textAlign: "center" }}>
            <Text
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                lineHeight: "18px",
                margin: "8px 0 0 0",
                fontWeight: "500",
              }}
            >
              © {new Date().getFullYear()} PVC WAKA. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;
