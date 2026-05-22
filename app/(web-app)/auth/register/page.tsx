"use client";

import InputGroup from "@/components/ui/InputGroup";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Select from "@/components/ui/Select";
import Swal from "sweetalert2";
import { SpinnerLoader } from "@/components/ui/Loader";

interface ValidationErrorDetail {
  field: string;
  message: string;
}

export default function Register() {
  const [signupDetails, setSignupDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    nin: "",
    gender: "",
    password: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrorDetail[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setSignupDetails({
      ...signupDetails,
      [field]: value,
    });

    setFieldErrors((prev) => prev.filter((err) => err.field !== field));
  };

  const getFieldError = (fieldName: string) => {
    return fieldErrors.find((err) => err.field === fieldName)?.message;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupDetails),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        // Catch structured Zod validation errors from your backend
        if (data.details && Array.isArray(data.details)) {
          setFieldErrors(data.details);
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Please correct the highlighted fields.",
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          setGlobalError(data.error || "Registration failed.");
          Swal.fire({
            icon: "error",
            title: "Error",
            text: globalError || "Registration failed.",
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
        return;
      }

      setStatus("success");
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "Check your email for verification link.",
      });
    } catch (error) {
      setStatus("error");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        toast: true,
        position: "top-end",
        timer: 200,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <section className="space-y-4">
      <header className="w-full text-white">
        <h2 className="text-2xl font-semibold font-space-grotesk text-primary">
          Register to PVC Waka as a User
        </h2>
        <p className="text-gray-600 font-dm-sans">
          Join the movement and register for your Permanent Voter Card.
        </p>
      </header>
      <form
        className="sm:grid not-sm:space-y-5 sm:grid-cols-2 gap-x-4 gap-y-5"
        onSubmit={handleSubmit}
      >
        <div>
          <InputGroup
            label="First Name"
            name="firstName"
            onChange={handleChange}
            placeholder="Enter your first name"
            type="text"
            value={signupDetails.firstName}
          />
          {getFieldError("firstName") && (
            <p className="text-red-400 text-xs mt-1">
              {getFieldError("firstName")}
            </p>
          )}
        </div>

        <div>
          <InputGroup
            label="Last Name"
            name="lastName"
            onChange={handleChange}
            placeholder="Enter your last name"
            type="text"
            value={signupDetails.lastName}
          />
          {getFieldError("lastName") && (
            <p className="text-red-400 text-xs mt-1">
              {getFieldError("lastName")}
            </p>
          )}
        </div>

        <div>
          <InputGroup
            label="Email Address"
            name="email"
            onChange={handleChange}
            placeholder="Enter your email address"
            type="email"
            value={signupDetails.email}
          />
          {getFieldError("email") && (
            <p className="text-red-400 text-xs mt-1">
              {getFieldError("email")}
            </p>
          )}
        </div>

        <div>
          <InputGroup
            label="Phone Number"
            name="phoneNumber"
            onChange={handleChange}
            placeholder="Enter your Phone Number"
            type="tel"
            value={signupDetails.phoneNumber}
          />
          {getFieldError("phoneNumber") && (
            <p className="text-red-400 text-xs mt-1">
              {getFieldError("phoneNumber")}
            </p>
          )}
        </div>

        <InputGroup
          label="National Identification Number (NIN)"
          name="nin"
          onChange={handleChange}
          placeholder="Enter your NIN"
          type="text"
          value={signupDetails.nin}
        />

        <div>
          <InputGroup
            label="Date of Birth"
            name="dateOfBirth"
            onChange={handleChange}
            placeholder="Date of Birth"
            type="date"
            value={signupDetails.dateOfBirth}
          />
          {getFieldError("dateOfBirth") && (
            <p className="text-red-400 text-xs mt-1">
              {getFieldError("dateOfBirth")}
            </p>
          )}
        </div>
        <Select
          label="Gender"
          name="gender"
          onChange={handleChange}
          options={[
            { name: "Male", value: "male" },
            { name: "Female", value: "female" },
          ]}
          value={signupDetails.gender}
          placeholder="Gender"
        />

        <div>
          <div className="relative">
            <InputGroup
              label="Password"
              name="password"
              onChange={handleChange}
              placeholder={showPassword ? "Enter password" : "*********"}
              type={showPassword ? "text" : "password"}
              value={signupDetails.password}
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
          {getFieldError("password") && (
            <p className="text-red-400 text-xs mt-1">
              {getFieldError("password")}
            </p>
          )}
        </div>
        <div className="col-span-2 flex">
          <button
            disabled={status === "loading"}
            className={`bg-primary text-white font-bold font-dm-sans py-3 rounded-lg mt-4 w-5/6 sm:w-1/2 mx-auto transition-colors disabled:opacity-70 flex justify-center items-center gap-2 ${status === "loading" ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {status === "loading" ? (
              <SpinnerLoader text="Creating account..." />
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
