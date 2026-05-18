import InputGroup from "@/components/ui/InputGroup";
import Select from "@/components/ui/Select";
import { useState } from "react";
import Link from "next/link";

const RegisterForm = ({ role }: { role: string }) => {
  const [signupDetails, setSignupDetails] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "2000-04-20",
    gender: "",
    email: "",
    phoneNumber: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChange = (field: string, value: string) => {
    setSignupDetails({
      ...signupDetails,
      [field]: value,
    });
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

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center space-y-4 py-12 px-4">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-green-400 font-Montserrat">
          Check your email
        </h3>
        <p className="text-white/70">
          We've sent a verification link to{" "}
          <span className="font-semibold text-green-400">
            {signupDetails.email}
          </span>
          . Please check your inbox and click the link to set your password and
          verify your NIN.
        </p>
        <div className="pt-6">
          <Link
            href="/users/verify-nin"
            className="text-green-400 hover:underline font-medium"
          >
            (Demo: Click here to simulate email link)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="w-full text-white">
        <h2 className="text-2xl font-semibold font-Montserrat text-green-400">
          Register to PVC Waka as a{" "}
          {role === "volunteer" ? "Volunteer" : "User"}
        </h2>
        <p className="text-white/70">
          Join the movement and register for your Permanent Voter Card.
        </p>
      </header>
      <form
        className="grid md:grid-cols-2 gap-x-4 gap-y-5"
        onSubmit={handleSubmit}
      >
        <InputGroup
          label="First Name"
          name="firstName"
          onChange={handleChange}
          placeholder="Enter your first name"
          type="text"
          value={signupDetails.firstName}
          labelClassName="text-white/80"
          inputClassName="bg-white/10 border-green-500/30 text-white placeholder:text-white/50 focus:border-green-500"
        />
        <InputGroup
          label="Last Name"
          name="lastName"
          onChange={handleChange}
          placeholder="Enter your last name"
          type="text"
          value={signupDetails.lastName}
          labelClassName="text-white/80"
          inputClassName="bg-white/10 border-green-500/30 text-white placeholder:text-white/50 focus:border-green-500"
        />
        <InputGroup
          label="Date of Birth"
          name="dateOfBirth"
          onChange={handleChange}
          placeholder="Enter your date of birth"
          type="date"
          value={signupDetails.dateOfBirth}
          labelClassName="text-white/80"
          inputClassName="bg-white/10 border-green-500/30 text-white placeholder:text-white/50 focus:border-green-500"
        />
        <Select
          name="gender"
          label="Gender"
          onChange={handleChange}
          options={[
            { name: "Male", value: "male" },
            { name: "Female", value: "female" },
          ]}
          value={signupDetails.gender}
          placeholder="Choose your gender"
          labelClassName="text-white/80"
          selectClassName="bg-white/10 border-green-500/30 text-white placeholder:text-white/50 focus:border-green-500"
        />
        <InputGroup
          label="Phone Number"
          name="phoneNumber"
          onChange={handleChange}
          placeholder="Enter your Phone Number "
          type="tel"
          value={signupDetails.phoneNumber}
          labelClassName="text-white/80"
          inputClassName="bg-white/10 border-green-500/30 text-white placeholder:text-white/50 focus:border-green-500"
        />
        <InputGroup
          label="Email Address"
          name="email"
          onChange={handleChange}
          placeholder="Enter your email address"
          type="email"
          value={signupDetails.email}
          labelClassName="text-white/80"
          inputClassName="bg-white/10 border-green-500/30 text-white placeholder:text-white/50 focus:border-green-500"
        />
        <div className="col-span-2 flex">
          <button
            disabled={status === "loading"}
            className="bg-green-600 text-white py-3 rounded-lg mt-4 w-1/2 mx-auto font-medium hover:bg-green-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {status === "loading" ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default RegisterForm;
