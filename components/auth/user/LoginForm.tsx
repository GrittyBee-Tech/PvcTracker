import InputGroup from "@/components/ui/InputGroup";
import { useState } from "react";

function LoginForm() {
  const [loginDetails, setloginDetails] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    const newObject = { ...loginDetails, [field]: value };
    console.log(newObject);
    setloginDetails({
      ...loginDetails,
      [field]: value,
    });
  };
  return (
    <section className="space-y-4">
      <header className="w-full text-black">
        <h2 className="text-2xl font-semibold font-playfair-display text-[#10200e]">
          Login to PVC Waka
        </h2>
        <p>
          Lorem ipsum dolor sit amet consectetur. Sagittis ullaper ante metus
          amet nec donec sit. Orci.
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
        />
        <InputGroup
          label="Password"
          name="password"
          onChange={handleChange}
          placeholder="********"
          type="password"
          value={loginDetails.password}
        />
        <button className="w-full bg-[#10200e] text-white py-2 rounded mt-4">
          Login
        </button>
      </form>
    </section>
  );
}

export default LoginForm;
