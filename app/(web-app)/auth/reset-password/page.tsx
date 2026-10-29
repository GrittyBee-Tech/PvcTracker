"use client";

import Logo from "@/components/ui/Logo";
import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError(
        "This reset link is invalid or has expired. Request a new one to continue.",
      );
      setStatus("error");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match. Please check and try again.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        setError(
          resetError.message ||
            "We couldn't update your password. Please try again.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      window.setTimeout(() => router.replace("/auth/login"), 2500);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We couldn't update your password. Please try again.",
      );
      setStatus("error");
    }
  };

  const hasValidLink = Boolean(token);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-accent/50 via-background to-background px-5 py-8 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
      />
      <header className="relative mx-auto w-full max-w-5xl">
        <Logo />
      </header>

      <section className="relative mx-auto my-auto w-full max-w-md py-12">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-primary/5 sm:p-9">
          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
            {status === "success" ? (
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            ) : hasValidLink ? (
              <KeyRound className="h-7 w-7" aria-hidden="true" />
            ) : (
              <TriangleAlert className="h-7 w-7" aria-hidden="true" />
            )}
          </div>

          {status === "success" ? (
            <div aria-live="polite">
              <h1 className="font-dm-sans text-2xl font-bold text-foreground sm:text-3xl">
                Password updated
              </h1>
              <p className="mt-3 leading-6 text-muted-foreground">
                Your password has been changed. You can now sign in with your
                new password.
              </p>
              <p className="mt-6 text-sm text-muted-foreground">
                Taking you to login...
              </p>
              <Link
                href="/auth/login"
                className="mt-4 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Go to login now
              </Link>
            </div>
          ) : !hasValidLink ? (
            <div>
              <h1 className="font-dm-sans text-2xl font-bold text-foreground sm:text-3xl">
                Reset link unavailable
              </h1>
              <p className="mt-3 leading-6 text-muted-foreground">
                This password reset link is invalid or has expired. Request a
                new link to get back into your account.
              </p>
              <Link
                href="/auth/login"
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-5 font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <>
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                  Account recovery
                </p>
                <h1 className="font-dm-sans text-2xl font-bold text-foreground sm:text-3xl">
                  Choose a new password
                </h1>
                <p className="mt-3 leading-6 text-muted-foreground">
                  Create a secure password for your PVC WAKA account. It must
                  be at least 8 characters long.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-semibold text-foreground"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={status === "loading"}
                      placeholder="At least 8 characters"
                      className="h-12 w-full rounded-lg border border-border bg-white px-4 pr-12 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-semibold text-foreground"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      disabled={status === "loading"}
                      placeholder="Enter your password again"
                      className="h-12 w-full rounded-lg border border-border bg-white px-4 pr-12 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmed password"
                          : "Show confirmed password"
                      }
                      aria-pressed={showConfirmPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {status === "error" && (
                  <p
                    role="alert"
                    className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-5 text-destructive"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <>
                      <LoaderCircle
                        className="h-5 w-5 animate-spin"
                        aria-hidden="true"
                      />
                      Updating password...
                    </>
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </section>

      <footer className="relative mx-auto w-full max-w-5xl text-center text-xs text-muted-foreground">
        Secure account recovery for PVC WAKA
      </footer>
    </main>
  );
}
