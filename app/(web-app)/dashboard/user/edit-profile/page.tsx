"use client";

import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/InputGroup";
import Select from "@/components/ui/Select";
import { authClient, useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useState } from "react";
import ChangePasswordSection from "./ChangePassword";
import Swal from "sweetalert2";
import { formatToInputDate } from "@/lib/utils";

type UpdateProfileFormType = {
  pvcStatus: "collected" | "not_collected";
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
};

export default function UserProfilePage() {
  const { user } = useAuth();
  const [updateProfileData, setUpdateProfileData] =
    useState<UpdateProfileFormType>({
      pvcStatus: "not_collected",
      firstName: "",
      lastName: "",
      dateOfBirth: new Date(),
      phoneNumber: "",
    });
  const [vin, setVin] = useState("");
  const [status, setStatus] = useState<
    "idle" | "error" | "loading" | "success"
  >("idle");

  const initialData = useMemo(
    () => ({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      pvcStatus: user?.pvcStatus || "not_collected",
      dateOfBirth: new Date(user?.dateOfBirth || ""),
      phoneNumber: user?.phoneNumber || "",
    }),
    [user],
  );

  useEffect(() => {
    if (!user) return;

    setUpdateProfileData(initialData);
    user?.vin && setVin(user?.vin);
  }, [user]);

  const isFormUnchanged =
    JSON.stringify(initialData) === JSON.stringify(updateProfileData);

  const handleChange = (field: keyof UpdateProfileFormType, value: string) => {
    setUpdateProfileData({
      ...updateProfileData,
      [field]: value,
    });
  };

  const handleUpdateProfileAPICall = async (data: UpdateProfileFormType) => {
    await authClient.updateUser(
      {
        ...data,
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
      },
      {
        onRequest() {
          setStatus("loading");
        },
        onSuccess() {
          setStatus("success");
          Swal.fire({
            icon: "success",
            text: "Profile updated successfully",
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        onError(ctx) {
          setStatus("error");
          Swal.fire({
            icon: "error",
            text: ctx.error?.message || "Failed to update profile",
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
      },
    );
  };

  const handleSubmitVIN = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!vin) return;

    await authClient.updateUser(
      { vin },
      {
        onRequest() {
          setStatus("loading");
        },
        onSuccess() {
          setStatus("success");
          Swal.fire({
            icon: "success",
            text: "Profile updated successfully",
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        onError(ctx) {
          setStatus("error");
          Swal.fire({
            icon: "error",
            text: ctx.error?.message || "Failed to update profile",
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
      },
    );
  };

  const handleUpdateProfile = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (isFormUnchanged) return;

    Swal.fire({
      icon: "warning",
      titleText: "Warning",
      text: "You are updating your profile. You can only update once every 24 hours",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonColor: "#1A5C38",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        handleUpdateProfileAPICall(updateProfileData);
      }
    });
  };

  return (
    <div className="space-y-4 md:px-8 py-4 xl:pr-12">
      <h1 className="text-2xl font-bold text-primary">User Profile</h1>
      <p className="text-black -mt-2  text-lg">
        Manage your personal information and PVC details here.
      </p>
      <hr className="text-gray-600 font-semibold my-6" />
      <section>
        <h2 className="text-xl font-semibold text-primary">
          Personal Information
        </h2>
        <form
          className="w-full grid grid-cols-4  items-center gap-6 mt-4"
          onSubmit={handleUpdateProfile}
        >
          <div className="w-full col-span-4 md:col-span-2">
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
          </div>
          <div className="col-span-4 md:col-span-2 -mt-1">
            <InputGroup
              label="VIN"
              name={"vin" as any}
              onChange={handleChange}
              disabled={!!user?.vin}
              placeholder="Change your VIN"
              type="text"
              value={user?.vin || ""}
            />
          </div>
          <div className="md:col-start-1 col-span-4 md:col-span-2">
            <InputGroup
              label="First Name"
              name="firstName"
              onChange={handleChange}
              placeholder="Change your first name"
              type="text"
              value={updateProfileData.firstName}
            />
          </div>
          <div className="col-span-4 md:col-span-2">
            <InputGroup
              label="Last Name"
              name="lastName"
              onChange={handleChange}
              placeholder="Change your last name"
              type="text"
              value={updateProfileData.lastName}
            />
          </div>
          <div className="col-span-4 md:col-span-2">
            <InputGroup
              label="Phone Number (eg. 23480....)"
              name="phoneNumber"
              onChange={handleChange}
              placeholder="Change your phone number"
              type="text"
              value={updateProfileData.phoneNumber}
            />
          </div>
          <div className="col-span-4 md:col-span-2">
            <InputGroup
              label="Date of Birth"
              name="dateOfBirth"
              onChange={handleChange}
              disabled={!!updateProfileData.dateOfBirth}
              placeholder="Change your date of birth"
              type="date"
              value={formatToInputDate(updateProfileData.dateOfBirth)}
            />
          </div>
          <div className="col-span-4 ml-auto">
            <Button disabled={isFormUnchanged} type="submit">
              Update Profile
            </Button>
          </div>
        </form>
      </section>
      <hr className="text-gray-600 font-semibold my-6" />
      <section>
        <h2 className="text-xl font-semibold text-primary mb-3">
          Voter's Identification
        </h2>
        <form className="grid grid-cols-4 items-end" onSubmit={handleSubmitVIN}>
          <div className="col-span-4 sm:col-span-3 md:col-span-2">
            <InputGroup
              name="vin"
              label="Input your VIN"
              placeholder="VIN here"
              value={vin}
              onChange={(_, val) => setVin(val)}
            />
          </div>
          <div className="col-span-2 ml-auto">
            <Button type="submit">Save VIN</Button>
          </div>
        </form>
      </section>
      <hr className="text-gray-600 font-semibold my-6" />

      <ChangePasswordSection />
    </div>
  );
}
