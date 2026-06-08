// components/ForgotPasswordForm.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus({ type: "loading", message: "Sending reset link..." });

    try {
      const { data, error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/auth/reset-password`,
      });

      if (!error) {
        setStatus({
          type: "success",
          message: data.message,
        });
      }
      setEmail("");
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded outline-none"
            disabled={status.type === "loading"}
          />
        </div>
        <button
          type="submit"
          disabled={status.type === "loading"}
          className="w-full bg-primary text-white p-2 rounded disabled:bg-blue-300"
        >
          Submit
        </button>
      </form>
      {status.message && (
        <p
          className={`mt-4 text-sm ${status.type === "error" ? "text-red-600" : "text-green-600"}`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
