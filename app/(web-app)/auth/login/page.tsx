"use client";

import InputGroup from "@/components/ui/InputGroup";
import { SpinnerLoader } from "@/components/ui/Loader";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
        title: "Please fill in all fields.",
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
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        switch (result.error) {
          case "CredentialsSignin":
            setError("Invalid email or password.");
            Swal.fire({
              title: error || "Internal Server Error",
              icon: "error",
              toast: true,
              position: "top-end",
              timer: 2500,
              timerProgressBar: true,
              showConfirmButton: false,
            });
            break;
          default:
            setError(result.error || "An unexpected error occurred.");
        }
        setIsLoading(false);
        return;
      }

      Swal.fire({
        title: "Logged in successfully!",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      const sessionResponse = await fetch("/api/auth/session");
      const session = await sessionResponse.json();
      setIsLoading(false);
      console.log({ session });

      const userRole = session?.user?.role;
      setTimeout(() => {
        if (userRole === "volunteer") {
          router.push("/dashboard/volunteer");
        } else if (userRole === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/user");
        }
      }, 2000);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      Swal.fire({
        title:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-4">
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
        <button
          className="bg-primary text-white py-3 rounded-lg mt-4 font-dm-sans font-bold hover:bg-green-900 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 w-5/6 sm:w-1/2 mx-auto"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? <SpinnerLoader text="Logging in..." /> : "Login"}
        </button>
      </form>
    </section>
  );
}
