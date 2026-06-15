// components/ResetPasswordForm.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AuthClientError } from "../login/ForgotPassword";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  // const userId = searchParams.get("userId");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus({
        loading: false,
        error: "Missing token or user id parameters.",
        success: false,
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        loading: false,
        error: "Passwords do not match.",
        success: false,
      });
      return;
    }

    setStatus({ loading: true, error: "", success: false });

    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      });

      setStatus({ loading: false, error: "", success: true });
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: AuthClientError) {
      console.error("password-change-error", err);
      setStatus({ loading: false, error: err.message, success: false });
    }
  };

  if (!token) {
    return (
      <div className="text-red-500 max-w-md mx-auto mt-10">
        Invalid or malformed password reset link.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Choose a new password</h2>
      {status.success ? (
        <p className="text-green-600 font-medium">
          Password updated! Redirecting to login...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm New Password
              <input
                type="password"
                id="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </label>
          </div>
          {status.error && (
            <p className="text-red-600 text-sm">{status.error}</p>
          )}
          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-green-600 text-white p-2 rounded disabled:bg-green-300"
          >
            {status.loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}
