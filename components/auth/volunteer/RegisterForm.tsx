import InputGroup from "@/components/ui/InputGroup";
import Select from "@/components/ui/Select";
import { useState } from "react";

const RegisterForm = () => {
  const [signupDetails, setSignupDetails] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "2000-04-20",
    gender: "",
    email: "",
    phoneNumber: "",
  });

  const handleChange = (field: string, value: string) => {
    const newObject = { ...signupDetails, [field]: value };
    console.log(newObject);
    setSignupDetails({
      ...signupDetails,
      [field]: value,
    });
  };

  return (
    <section className="space-y-4">
      <header className="w-full text-black">
        <h2 className="text-2xl font-semibold font-Montserrat text-[#10200e]">
          Register to PVC Waka as a Volunteer
        </h2>
        <p>
          Lorem ipsum dolor sit amet consectetur. Sagittis ullaper ante metus
          amet nec donec sit. Orci.
        </p>
      </header>
      <form className="grid md:grid-cols-2 gap-x-4 gap-y-5">
        <InputGroup
          label="First Name"
          name="firstName"
          onChange={handleChange}
          placeholder="Enter your first name"
          type="text"
          value={signupDetails.firstName}
        />
        <InputGroup
          label="Last Name"
          name="lastName"
          onChange={handleChange}
          placeholder="Enter your last name"
          type="text"
          value={signupDetails.lastName}
        />
        <InputGroup
          label="Date of Birth"
          name="dateOfBirth"
          onChange={handleChange}
          placeholder="Enter your date of birth"
          type="date"
          value={signupDetails.dateOfBirth}
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
        />
        <InputGroup
          label="Phone Number"
          name="phoneNumber"
          onChange={handleChange}
          placeholder="Enter your Phone Number "
          type="tel"
          value={signupDetails.phoneNumber}
        />
        <InputGroup
          label="Email Address"
          name="email"
          onChange={handleChange}
          placeholder="Enter your email address"
          type="email"
          value={signupDetails.email}
        />
        <div className="col-span-2 flex">
          <button className="bg-[#10200e] text-white py-2 rounded mt-4 w-1/2 mx-auto font-medium cursor-pointer">
            Create Account
          </button>
        </div>
      </form>
    </section>
  );
};

export default RegisterForm;
