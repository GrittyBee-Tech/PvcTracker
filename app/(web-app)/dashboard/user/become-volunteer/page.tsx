"use client";
import { useEffect, useState } from "react";
import InputGroup from "@/components/ui/InputGroup";
import { FaUserTie } from "react-icons/fa";
import VolunteerModal from "@/components/ui/Volunteermodal";
import { SpinnerLoader } from "@/components/ui/Loader";
import { useAuth } from "@/hooks/useAuth";
import { TbLockSquareRoundedFilled } from "react-icons/tb";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/checkbox";
import Swal from "sweetalert2";

export default function VolunteerPage({
  showModal = true,
  modalTitle = "Ensure Your VIN is updated",
  modalContent = " To become a volunteer, you need to have your VIN updated in your profile. Please update your VIN to proceed with the volunteer application.",
  onModalClose,
}: {
  showModal?: boolean;
  modalTitle?: string;
  modalContent?: React.ReactNode;
  onModalClose?: () => void;
}) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(showModal);
  const [terms, setTerms] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [PhotoUrl, setPhotoUrl] = useState<string>("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(false);

  useEffect(() => {
    setIsModalOpen(showModal);
  }, [showModal]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalClose?.();
  };

  const [form, setForm] = useState({
    // vin: "",
    // cvrTraining: "",
    maritalStatus: "",
    stateOfResidence: "",
    homeAddress: "",
    nextOfKinName: "",
    nextOfKinRelationship: "",
    nextOfKinState: "",
    nextOfKinAddress: "",
    nextOfKinPhone: "",
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (
      name === "maritalStatus" ||
      name === "stateOfResidence" ||
      name === "nextOfKinRelationship" ||
      name === "nextOfKinState" ||
      name === "homeAddress" ||
      name === "nextOfKinName" ||
      name === "nextOfKinAddress" ||
      name === "nextOfKinPhone"
    )
      setDisableSubmit(false);
  };
  //file
  const [file, setFile] = useState<File | null>(null);

  // Custom Cloudinary upload handler
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      setPhotoUrl(data.secure_url);
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: "Failed to upload image",
        toast: true,
        position: "top-end",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    // ✅ append form fields
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // ✅ always append PhotoUrl (Cloudinary URL string)
    if (!PhotoUrl) {
      Swal.fire({
        icon: "error",
        text: "Please upload a passport photo before submitting.",
        toast: true,
        position: "top-end",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    console.log("PhotoUrl before submit:", PhotoUrl); // <-- Cloudinary URL should be here
    formData.append("PhotoUrl", PhotoUrl);

    const res = await fetch("/api/volunteer/apply", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      Swal.fire({
        icon: "error",
        text: errorData.error || "Failed to submit application",
        toast: true,
        position: "top-end",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "success",
        text: "Volunteer application submitted successfully!",
        toast: true,
        position: "top-end",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
    const data = await res.json();

    console.log(data);
  };

  useEffect(() => {
    if (!user) return;

    setIsModalOpen(!user.vin);
  }, [user?.vin]);

  useEffect(() => {
    const handleFetchApplication = async () => {
      try {
        const res = await fetch("/api/volunteer/apply", {
          method: "GET",
        });
        const data = await res.json();

        setForm({
          maritalStatus: data.application.maritalStatus,
          stateOfResidence: data.application.stateOfResidence,
          homeAddress: data.application.homeAddress,
          nextOfKinName: data.application.nextOfKin.name,
          nextOfKinRelationship: data.application.nextOfKin.relationship,
          nextOfKinState: data.application.nextOfKin.state,
          nextOfKinAddress: data.application.nextOfKin.address,
          nextOfKinPhone: data.application.nextOfKin.phone,
        });
        setPhotoUrl(data.application.PhotoUrl);
        setDisableSubmit(true);
        setTerms(true);

        console.log("Volunteer application data:", data);
      } catch (error) {
        console.error("Error fetching volunteer application:", error);
      }
    };

    handleFetchApplication();
  }, []);

  return (
    <div className="space-y-4 md:px-8 py-5 xl:pr-12">
      <h1 className="text-primary font-bold text-2xl">Become a Volunteer</h1>

      <p className="text-primary -mt-3  text-lg">
        Join our team of volunteers and make a difference in your community!
      </p>

      <hr className="text-gray-600 font-semibold my-6" />

      <form className="w-full items-center gap-6" onSubmit={handleSubmit}>
        <div>
          <input
            disabled={disableSubmit}
            id="passport-photo-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <div
            className="grid h-20 w-20 justify-center mx-auto items-center rounded-full border border-dotted border-green-900/30 bg-green-50 cursor-pointer"
            onClick={() =>
              document.getElementById("passport-photo-input")?.click()
            }
          >
            {PhotoUrl ? (
              <img
                src={PhotoUrl}
                alt="Passport preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <FaUserTie className="h-10 w-10 text-primary" />
            )}
          </div>
          <div>
            <p
              className="text-sm text-center text-primary font-medium cursor-pointer"
              onClick={() =>
                document.getElementById("passport-photo-input")?.click()
              }
            >
              Click to upload passport photo
            </p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              PNG, JPG up to 2MB
            </p>
            {isUploadingPhoto && (
              <p className="text-xs text-center text-blue-500 mt-1">
                Uploading...
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 ">
          {/* <div className="w-full col-span-4 md:col-span-2">
            <InputGroup
              label="Voter Registration Number"
              name="vin"
              onChange={handleChange}
              placeholder="Enter your VIN"
              type="text"
              value={form.vin}
            />
          </div> */}
          {/* <div className="w-full col-span-4 md:col-span-2">
            <Select
              label="Completed CVR Training"
              name="cvrTraining"
              onChange={handleChange}
              options={[
                { name: "Yes", value: "yes" },
                { name: "No", value: "no" },
              ]}
              value={form.cvrTraining}
              placeholder="Update your Completed CVR Training status"
            />
          </div> */}
          <div className="w-full col-span-4 md:col-span-2">
            <Select
              disabled={disableSubmit}
              label="Marital Status"
              name="maritalStatus"
              onChange={handleChange}
              options={[
                { name: "Single", value: "single" },
                { name: "Married", value: "married" },
              ]}
              value={form.maritalStatus}
              placeholder="Update your Marital Status"
            />
          </div>

          <div className="w-full col-span-4 md:col-span-2">
            <Select
              disabled
              label="State of Residence"
              name="stateOfResidence"
              onChange={handleChange}
              options={[
                { name: "Abia", value: "abia" },
                { name: "Lagos", value: "lagos" },
                { name: "Rivers", value: "rivers" },
                { name: "FCT", value: "fct" },
              ]}
              value={form.stateOfResidence}
              placeholder="Update your State of Residence"
            />
          </div>

          <div className="md:col-start-1 col-span-4 md:col-span-2">
            <InputGroup
              disabled={disableSubmit}
              label="Next of Kin Name"
              name="nextOfKinName"
              onChange={handleChange}
              placeholder="Enter next of kin name"
              type="text"
              value={form.nextOfKinName}
            />
          </div>

          <div className="col-span-4 md:col-span-2">
            <InputGroup
              disabled
              label="Address of Next of Kin"
              name="nextOfKinAddress"
              onChange={handleChange}
              placeholder="Enter address of next of kin"
              type="text"
              value={form.nextOfKinAddress}
            />
          </div>
          <div className="w-full col-span-4 md:col-span-2">
            <Select
              disabled={disableSubmit}
              label="Relationship with Next of Kin"
              name="nextOfKinRelationship"
              onChange={handleChange}
              options={[
                { name: "Parent", value: "parent" },
                { name: "Sibling", value: "sibling" },
                { name: "Spouse", value: "spouse" },
                { name: "Friend", value: "friend" },
              ]}
              value={form.nextOfKinRelationship}
              placeholder="Update your Relationship with Next of Kin"
            />
          </div>
          <div className="w-full col-span-4 md:col-span-2">
            <Select
              disabled={disableSubmit}
              label="State of Residence of Next of Kin"
              name="nextOfKinState"
              onChange={handleChange}
              options={[
                { name: "Abia", value: "abia" },
                { name: "Lagos", value: "lagos" },
                { name: "Rivers", value: "rivers" },
                { name: "FCT", value: "fct" },
              ]}
              value={form.nextOfKinState}
              placeholder="Update State of Residence of Next of Kin"
            />
          </div>
          <div className=" md:col-start-1 col-span-4 md:col-span-2">
            <InputGroup
              disabled={disableSubmit}
              label="Home address"
              name="homeAddress"
              onChange={handleChange}
              placeholder="Enter your home address"
              type="text"
              value={form.homeAddress}
            />
          </div>

          <div className="col-span-4 md:col-span-2 mb-2">
            <InputGroup
              disabled={disableSubmit}
              label=" Next of Kin Phone Number (eg. 23480....)"
              name="nextOfKinPhone"
              onChange={handleChange}
              placeholder="Enter phone number"
              type="text"
              value={form.nextOfKinPhone}
            />
          </div>
        </div>
        <Checkbox
          disabled={disableSubmit}
          checked={terms}
          onChange={setTerms}
          label={
            <>
              I agree to the{" "}
              <a href="#" className="text-green-500 hover:underline">
                terms and conditions
              </a>
            </>
          }
        />
        <button
          disabled={disableSubmit}
          type="submit"
          className="bg-primary w-full text-white py-2 px-4 mt-4 rounded-md hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed font-semibold transition cursor-pointer"
        >
          Submit Application
        </button>
      </form>
      {isModalOpen && (
        <div className="fixed top-0 right-0 bottom-0 z-50 left-12 md:left-64">
          <VolunteerModal
            isOpen={isModalOpen}
            position="absolute"
            title={modalTitle}
            onClose={handleCloseModal}
            closeButton={false}
            actions={<></>}
          >
            <div className="space-y-4">
              <div className=" grid grid-flow-col w-max items-center gap-2 font-bold font-space-grotesk text-primary">
                <p className="text-primary text-lg">
                  {" "}
                  You are almost there, {user?.firstName}!
                </p>
                <TbLockSquareRoundedFilled className="text-4xl" />
              </div>
              <p className="text-primary font-dm-sans ">{modalContent}</p>
            </div>
          </VolunteerModal>
        </div>
      )}
    </div>
  );
}
