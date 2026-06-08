import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerifyEmailProps {
  firstName: string;
  verificationUrl: string;
}

export const VerifyEmail = ({
  firstName,
  verificationUrl,
}: VerifyEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your PVC WAKA account</Preview>
    <Body
      style={{
        backgroundColor: "#d1f2d7",
        fontFamily: "sans-serif",
        padding: "40px 0",
      }}
    >
      <Container
        style={{
          backgroundColor: "#ffffff",
          margin: "0 auto",
          padding: "32px",
          borderRadius: "8px",
          maxWidth: "560px",
        }}
      >
        <Heading
          style={{
            color: "#d1f2d7",
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Welcome, {firstName}! 🇳🇬
        </Heading>
        <Text
          style={{
            color: "#333333",
            fontSize: "16px",
            lineHeight: "24px",
            marginBottom: "30px",
          }}
        >
          Thank you for signing up for PVC WAKA. To complete your registration
          and activate your account, please click the verification button below.
          This link will expire in 24 hours.
        </Text>
        <Link
          href={verificationUrl}
          style={{
            backgroundColor: "#eab308",
            color: "#0a0a0a",
            padding: "12px 24px",
            borderRadius: "4px",
            textDecoration: "none",
            fontWeight: "bold",
            display: "inline-block",
          }}
        >
          Verify Email Address
        </Link>
      </Container>
    </Body>
  </Html>
);

export default VerifyEmail;
