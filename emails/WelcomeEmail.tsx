import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerifyEmailProps {
  firstName: string;
  verificationUrl: string;
  logoUrl?: string;
}

export const VerifyEmail = ({
  firstName,
  verificationUrl,
  logoUrl,
}: VerifyEmailProps) => {
  const previewText =
    "Welcome to PVC WAKA! Please verify your email address to complete registration.";

  // Determine logo source: custom logoUrl prop -> BETTER_AUTH_URL (if not localhost) -> fallback
  const resolvedLogoUrl =
    logoUrl ||
    (process.env.BETTER_AUTH_URL &&
    !process.env.BETTER_AUTH_URL.includes("localhost")
      ? `${process.env.BETTER_AUTH_URL}/favicon.png`
      : undefined);

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
          {/* Header / Brand Logo & Badge */}
          <Section style={{ textAlign: "center", marginBottom: "28px" }}>
            {resolvedLogoUrl && (
              <Img
                src={resolvedLogoUrl}
                width="48"
                height="48"
                alt="PVC WAKA Logo"
                style={{
                  margin: "0 auto 12px auto",
                  borderRadius: "50%",
                  display: "block",
                }}
              />
            )}
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
            Welcome to the Movement, {firstName}! 🎉
          </Heading>

          <Text
            style={{
              color: "#334155",
              fontSize: "15px",
              lineHeight: "24px",
              margin: "0 0 16px 0",
            }}
          >
            Thank you for signing up for <strong>PVC WAKA</strong>. We&apos;re
            dedicated to helping citizens track their Permanent Voter Card
            (PVC), locate pickup centers, and make their voice count.
          </Text>

          <Text
            style={{
              color: "#334155",
              fontSize: "15px",
              lineHeight: "24px",
              margin: "0 0 24px 0",
            }}
          >
            To activate your account and access your voter dashboard, please
            confirm your email address by clicking the button below:
          </Text>

          {/* CTA Button */}
          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Link
              href={verificationUrl}
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
              Verify Email Address →
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
            ⏱️ This link will expire in 24 hours.
          </Text>

          {/* Feature Highlights Card */}
          <Section
            style={{
              backgroundColor: "#f8faf8",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px 20px",
              margin: "24px 0",
            }}
          >
            <Text
              style={{
                color: "#0f172a",
                fontSize: "14px",
                fontWeight: "bold",
                margin: "0 0 8px 0",
              }}
            >
              What you can do next:
            </Text>
            <Text
              style={{
                color: "#334155",
                fontSize: "13px",
                lineHeight: "22px",
                margin: "0 0 4px 0",
              }}
            >
              ✅ Complete your NIN verification
            </Text>
            <Text
              style={{
                color: "#334155",
                fontSize: "13px",
                lineHeight: "22px",
                margin: "0 0 4px 0",
              }}
            >
              📍 Find your nearest PVC pickup centre
            </Text>
            <Text
              style={{
                color: "#334155",
                fontSize: "13px",
                lineHeight: "22px",
                margin: 0,
              }}
            >
              📊 Track your collection progress in real time
            </Text>
          </Section>

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
            <Link href={verificationUrl} style={{ color: "#15803d" }}>
              {verificationUrl}
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
                margin: 0,
              }}
            >
              You received this email because an account was registered with PVC
              WAKA using this address. If you didn&apos;t create this account,
              please ignore this email.
            </Text>
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

export default VerifyEmail;
