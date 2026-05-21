"use client";

import InputGroup from "@/components/ui/InputGroup";
import { useState } from "react";

export default function Login() {
  const [loginDetails, setloginDetails] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setloginDetails({
      ...loginDetails,
      [field]: value,
    });
  };
  return (
    <section className="space-y-4">
      <header className="w-full text-white">
        <h2 className="text-2xl font-semibold font-playfair-display text-green-400">
          Login to PVC Waka
        </h2>
        <p className="text-white/70">
          Enter your credentials to access your account.
        </p>
      </header>
      <form className="flex flex-col gap-x-4 gap-y-5">
        <InputGroup
          label="Email Address"
          name="email"
          onChange={handleChange}
          placeholder="Enter your email address"
          type="email"
          value={loginDetails.email}
          labelClassName="text-white/80"
          inputClassName="bg-white/10 border-green-500/30 text-white placeholder:text-white/50 focus:border-green-500"
        />
        <InputGroup
          label="Password"
          name="password"
          onChange={handleChange}
          placeholder="********"
          type="password"
          value={loginDetails.password}
          labelClassName="text-white/80"
          inputClassName="bg-white/10 border-green-500/30 text-white placeholder:text-white/50 focus:border-green-500"
        />
        <button className="w-full bg-green-600 text-white py-3 rounded-lg mt-4 font-medium hover:bg-green-700 transition-colors">
          Login
        </button>
      </form>
    </section>
  );
}
