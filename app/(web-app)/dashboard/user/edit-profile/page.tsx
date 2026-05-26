"use client";

import InputGroup from "@/components/ui/InputGroup";
import Select from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

type UpdateProfileFormType = {
  pvcStatus: "collected" | "not_collected";
  vin: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
};

export default function UserProfilePage() {
  const [updateProfileData, setUpdateProfileData] =
    useState<UpdateProfileFormType>({
      pvcStatus: "not_collected",
      vin: "",
      firstName: "",
      lastName: "",
      dateOfBirth: new Date(),
    });

  const handleChange = (field: string, value: string) => {
    setUpdateProfileData({
      ...updateProfileData,
      [field]: value,
    });

    // setFieldErrors((prev) => prev.filter((err) => err.field !== field));
  };
  const { user } = useAuth();
  console.log({ user });
  useEffect(() => {
    if (user == null) return;
    setUpdateProfileData(user);
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">User Profile</h1>
      <p className="text-black -mt-4">
        Manage your personal information and PVC details here.
      </p>
      <section>
        <h2 className="text-xl font-semibold text-primary">
          Personal Information
        </h2>
        <form className="grid grid-cols-2 gap-6 mt-4">
          <div className="col-span-2">
            <Select
              label="PVC Collection Status"
              name="pvcStatus"
              onChange={handleChange}
              options={[
                { name: "Not Collected", value: "not_collected" },
                { name: "Collected", value: "collected" },
              ]}
              value={updateProfileData.pvcStatus}
              placeholder="Update your PVC Status"
            />
            <p className="text-primary font-semibold mt-1">
              Set the status of your PVC. This status can only be changed once
              every 24 hours
            </p>
          </div>
          <InputGroup
            label="First Name"
            name="firstName"
            onChange={handleChange}
            placeholder="Enter your first name"
            type="text"
            value={updateProfileData.firstName}
          />
          <InputGroup
            label="Last Name"
            name="firstName"
            onChange={handleChange}
            placeholder="Enter your last name"
            type="text"
            value={updateProfileData.firstName}
          />
        </form>
      </section>
      {/* Profile form and details will go here */}
    </div>
  );
}
