"use client";

import InputGroup from "@/components/ui/InputGroup";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SetupForm = () => {
  const router = useRouter();
  const [setupDetails, setSetupDetails] = useState({
    password: "",
    confirmPassword: "",
    nin: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (field: string, value: string) => {
    setSetupDetails({
      ...setupDetails,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupDetails.password !== setupDetails.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (setupDetails.nin.length !== 11) {
      setErrorMsg("NIN must be exactly 11 digits");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      // Simulate API call to set password and verify NIN
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");

      // Usually we would redirect to dashboard or login
      setTimeout(() => {
        router.push("/users/auth"); // Redirect to login
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg("Failed to verify NIN. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-[#10200e] font-Montserrat">
          Setup Complete!
        </h3>
        <p className="text-gray-600">
          Your NIN is being verified. You can now log in.
        </p>
        <p className="text-sm text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="w-full text-black">
        <h2 className="text-2xl font-semibold font-Montserrat text-[#10200e]">
          Complete Your Registration
        </h2>
        <p className="text-black mt-2 text-sm leading-relaxed">
          Set a secure password and provide your National Identification Number
          (NIN) to verify your identity.
        </p>
      </header>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form className="flex flex-col gap-y-5" onSubmit={handleSubmit}>
        <InputGroup
          label="National Identification Number (NIN)"
          name="nin"
          onChange={handleChange}
          placeholder="Enter your 11-digit NIN"
          type="text"
          value={setupDetails.nin}
        />
        <InputGroup
          label="Password"
          name="password"
          onChange={handleChange}
          placeholder="Create a strong password"
          type="password"
          value={setupDetails.password}
        />
        <InputGroup
          label="Confirm Password"
          name="confirmPassword"
          onChange={handleChange}
          placeholder="Confirm your password"
          type="password"
          value={setupDetails.confirmPassword}
        />

        <button
          disabled={status === "loading"}
          className="w-full bg-[#10200e] text-white py-3 rounded-lg mt-2 font-medium hover:bg-[#1a3317] transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
        >
          {status === "loading" ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Verifying NIN...
            </>
          ) : (
            "Complete Setup"
          )}
        </button>
      </form>
    </section>
  );
};

export default SetupForm;
