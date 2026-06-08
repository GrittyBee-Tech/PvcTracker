"use client";

import InputGroup from "@/components/ui/InputGroup";
import { SpinnerLoader } from "@/components/ui/Loader";
import Modal from "@/components/ui/modal";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { ForgotPasswordForm } from "./ForgotPassword";

export default function Login() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      Swal.fire({
        text: "Please fill in all fields.",
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setIsLoading(false);
      return;
    }

    const callbackURL = searchParams?.get("callbackUrl") ?? undefined;
    await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
        rememberMe: true,
        callbackURL,
      },
      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          Swal.fire({
            title: "Login successful!",
            icon: "success",
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          router.push("/dashboard/user");
        },
        onError: (ctx) => {
          console.log(ctx.error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: ctx.error.message || "Login failed.",
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          setIsLoading(false);
        },
      },
    );
    // signIn will redirect the browser; if it doesn't, stop loading.
    setIsLoading(false);
  };

  return (
    <section className="space-y-4">
      <Modal
        isOpen={showModal}
        title="Forgot Password"
        onClose={() => setShowModal(false)}
        closeButton={true}
      >
        <ForgotPasswordForm />
      </Modal>
      <header className="w-full text-white">
        <h2 className="text-2xl font-semibold font-dm-sans text-[#4B6F52]">
          Login to PVC Waka
        </h2>
        <p className="text-[#0A140F] font-dm-sans">
          Enter your credentials to access your account.
        </p>
      </header>
      <form className="flex flex-col gap-x-4 gap-y-5" onSubmit={handleSubmit}>
        <InputGroup
          label="Email Address"
          name="email"
          onChange={handleChange}
          placeholder="Enter your email address"
          type="email"
          value={formData.email}
        />
        <div className="relative">
          <InputGroup
            label="Password"
            name="password"
            onChange={handleChange}
            placeholder={showPassword ? "Enter password" : "*********"}
            type={showPassword ? "text" : "password"}
            value={formData.password}
          />
          {showPassword ? (
            <EyeOff
              className="text-primary absolute right-4 bottom-2"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <Eye
              className="text-primary absolute right-4 bottom-2"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>
        <div className="text-end text-[#0A140F]">
          Forgot your password?
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-primary font-medium ml-1 hover:underline"
          >
            Reset it here.
          </button>
        </div>
        <button
          className="bg-primary text-white py-3 rounded-lg mt-4 font-dm-sans font-bold hover:bg-green-900 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 w-5/6 sm:w-1/2 mx-auto"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <SpinnerLoader text="Logging in..." /> : "Login"}
        </button>
        {error && (
          <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
        )}
      </form>
    </section>
  );
}
