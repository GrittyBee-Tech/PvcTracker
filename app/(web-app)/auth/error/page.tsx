import { redirect } from "next/navigation";

interface SearchParams {
  error?: string;
  callbackUrl?: string;
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const err = searchParams?.error;
  const callback = searchParams?.callbackUrl;

  // Map auth error codes to friendly destinations
  switch (err) {
    case "EmailNotFound":
    case "PasswordIncorrect":
    case "InvalidInput":
    case "CredentialsSignin":
      // send back to the login page with the same error param
      return redirect(`/auth/login?error=${encodeURIComponent(err)}`);
    case "EmailNotVerified":
      // encourage user to verify their email
      return redirect(`/verify-email?error=${encodeURIComponent(err)}`);
    case "Configuration":
      // generic auth failure
      return redirect(`/auth/login?error=${encodeURIComponent(err)}`);
    default:
      // Unknown errors -> login with raw error preserved
      return redirect(
        `/auth/login?error=${encodeURIComponent(err ?? "CredentialsSignin")}`,
      );
  }
}
