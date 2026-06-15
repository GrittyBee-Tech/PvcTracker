"use client";

import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/InputGroup";
import Select from "@/components/ui/Select";
import { authClient } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import ChangePasswordSection from "./ChangePassword";
import Swal from "sweetalert2";
import { formatToInputDate } from "@/lib/utils";
import { StateOption } from "../find-centre/FindCentreClient";
import { showToast } from "@/utils/constants/toast";

type UpdateProfileFormType = {
  pvcStatus: "collected" | "not_collected";
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  stateOfOrigin: string;
  lgaOfOrigin: string;
  homeAddress: string;
};

interface UserProfileFormProps {
  user: {
    firstName?: string;
    lastName?: string;
    pvcStatus?: "collected" | "not_collected";
    dateOfBirth?: string | Date;
    phoneNumber?: string;
    stateOfOrigin?: string;
    lgaOfOrigin?: string;
    homeAddress?: string;
    vin?: string;
  };
}

export default function UserProfileForm({ user }: UserProfileFormProps) {
  // 1. Initialize states directly from the validated user prop context
  const [updateProfileData, setUpdateProfileData] =
    useState<UpdateProfileFormType>({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      pvcStatus: user.pvcStatus || "not_collected",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
      phoneNumber: user.phoneNumber || "",
      stateOfOrigin: user.stateOfOrigin || "",
      lgaOfOrigin: user.lgaOfOrigin || "",
      homeAddress: user.homeAddress || "",
    });

  // Separate isolated state tracked independently for form 2
  const [vin, setVin] = useState(user.vin || "");

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [states, setStates] = useState<StateOption[]>([]);
  const [lgas, setLgas] = useState<{ name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 2. Clear out the bad JSON stringify evaluations with explicit checks
  const isFormUnchanged =
    updateProfileData.firstName === (user.firstName || "") &&
    updateProfileData.lastName === (user.lastName || "") &&
    updateProfileData.pvcStatus === (user.pvcStatus || "not_collected") &&
    updateProfileData.phoneNumber === (user.phoneNumber || "") &&
    updateProfileData.stateOfOrigin === (user.stateOfOrigin || "") &&
    updateProfileData.lgaOfOrigin === (user.lgaOfOrigin || "") &&
    updateProfileData.homeAddress === (user.homeAddress || "");

  const handleChange = (field: keyof UpdateProfileFormType, value: string) => {
    setUpdateProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProfileAPICall = async (data: UpdateProfileFormType) => {
    await authClient.updateUser(
      {
        ...data,
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
      },
      {
        onSuccess() {
          showToast("success", "Profile updated successfully");
        },
        onError(ctx) {
          showToast("error", ctx.error?.message || "Failed to update profile");
        },
      },
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
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

  const handleSubmitVIN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vin || vin === user.vin) return;

    await authClient.updateUser(
      { vin },
      {
        onSuccess() {
          showToast("success", "VIN saved successfully");
        },
        onError(ctx) {
          showToast("error", ctx.error?.message || "Failed to save VIN");
        },
      },
    );
  };

  // Toast notifications for error side-effects
  useEffect(() => {
    if (error) {
      showToast("error", error);
    }
  }, [error]);

  // Load States once upon initialization
  useEffect(() => {
    async function loadStates() {
      setLoadingStates(true);
      try {
        const response = await fetch("/api/locations/states");
        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || "Failed to load states");
        }
        const payload = await response.json();
        setStates(payload?.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load states");
      } finally {
        setLoadingStates(false);
      }
    }
    loadStates();
  }, []);

  // Synchronize LGAs when state selection alters
  useEffect(() => {
    if (!updateProfileData.stateOfOrigin) {
      setLgas([]);
      return;
    }

    async function loadLgas() {
      setLoadingLgas(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/locations/lgas?state=${encodeURIComponent(updateProfileData.stateOfOrigin)}`,
        );
        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || "Failed to load LGAs");
        }
        const payload = await response.json();
        setLgas(payload?.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load LGAs");
      } finally {
        setLoadingLgas(false);
      }
    }
    loadLgas();
  }, [updateProfileData.stateOfOrigin]);

  const lgaOptions = lgas.map((lga) => ({ name: lga.name, value: lga.name }));

  return (
    <div className="space-y-4 md:px-8 py-4 xl:pr-12">
      <div>
        <h1 className="text-2xl font-bold text-primary">User Profile</h1>
        <p className="text-black -mt-2 text-lg">
          Manage your personal information and PVC details here.
        </p>
      </div>
      <hr className="text-gray-600 font-semibold my-6" />

      <section>
        <h2 className="text-xl font-semibold text-primary">
          Personal Information
        </h2>
        <form
          className="w-full grid grid-cols-4 items-center gap-6 mt-4"
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
              label="Account Baseline VIN"
              name="baselineVin"
              onChange={() => {}}
              disabled={true}
              placeholder="No primary VIN saved"
              type="text"
              value={user.vin || ""}
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
              disabled={!!user.dateOfBirth}
              placeholder="Change your date of birth"
              type="date"
              value={formatToInputDate(updateProfileData.dateOfBirth)}
            />
          </div>

          <div className="col-span-4 md:col-span-2">
            <Select
              name="stateOfOrigin"
              label="State of Origin"
              options={states}
              value={updateProfileData.stateOfOrigin}
              onChange={handleChange}
              placeholder={
                loadingStates ? "Loading states..." : "Select a state"
              }
            />
          </div>

          <div className="col-span-4 md:col-span-2">
            <Select
              name="lgaOfOrigin"
              label="Local Government Area of Origin"
              options={lgaOptions}
              value={updateProfileData.lgaOfOrigin}
              disabled={loadingLgas || !updateProfileData.stateOfOrigin}
              onChange={handleChange}
              placeholder={
                updateProfileData.stateOfOrigin
                  ? "Select an LGA"
                  : "Select a state first"
              }
              selectClassName={
                !updateProfileData.stateOfOrigin ? "opacity-60" : ""
              }
            />
          </div>

          <div className="col-span-4">
            <InputGroup
              label="Home Address"
              name="homeAddress"
              onChange={handleChange}
              placeholder="Change your home address"
              type="text"
              value={updateProfileData.homeAddress}
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
          Voter&apos;s Identification
        </h2>
        <form
          className="grid grid-cols-4 items-end gap-4"
          onSubmit={handleSubmitVIN}
        >
          <div className="col-span-4 sm:col-span-3 md:col-span-2">
            <InputGroup
              name="vin"
              label="Input your VIN"
              placeholder="VIN here"
              disabled={!!user.vin}
              value={vin}
              onChange={(_, val) => setVin(val)}
            />
          </div>
          <div className="col-span-4 sm:col-span-1 ml-auto">
            <Button
              type="submit"
              disabled={!!user.vin || !vin || vin === user.vin}
            >
              Save VIN
            </Button>
          </div>
        </form>
      </section>

      <hr className="text-gray-600 font-semibold my-6" />
      <ChangePasswordSection />
    </div>
  );
}
