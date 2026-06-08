// components/emails/ResetPasswordEmail.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Tailwind,
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
  const previewText = "Reset your account password";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#d1f2d7] my-auto mx-auto font-sans md:py-6 md:px-10 p-6">
          <Container className="border border-solid border-gray-200 rounded my-10 mx-auto p-5 max-w-md bg-white shadow-sm">
            <Section className="mt-6">
              <Text className="text-black text-6 font-bold p-0 my-4 mx-0">
                Password Reset Request
              </Text>
            </Section>

            <Text className="text-gray-700 leading-6">Hello, {firstName}</Text>

            <Text className="text-gray-700 leading-6">
              We received a request to reset the password for the account
              associated with{" "}
              <span className="font-semibold text-black">{email}</span>. This
              link will expire in 15 minutes.
            </Text>

            <Section className="text-center my-8">
              <Button
                className="bg-[#1A5C38] rounded text-white font-medium no-underline text-center px-8 py-3 w-fit block"
                href={resetUrl}
              >
                Reset Password
              </Button>
            </Section>

            <Text className="text-gray-700 leading-6">
              If you didn't request a password reset, you can safely ignore this
              email. Your current password remains entirely secure.
            </Text>

            <Hr className="border border-solid border-gray-200 my-7 mx-0 w-full" />

            <Text className="text-gray-500 text-sm leading-4">
              If you're having trouble clicking the password reset button, copy
              and paste the URL below into your web browser:
            </Text>

            <Text className="text-primary text-sm leading-4 break-all">
              {resetUrl}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;
