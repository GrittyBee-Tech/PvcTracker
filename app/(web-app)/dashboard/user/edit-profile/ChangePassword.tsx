import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/InputGroup";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import Swal from "sweetalert2";

const ChangePasswordSection = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChangeField = (
    field: keyof typeof passwordData,
    value: string,
  ) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleChangePassword = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        Swal.fire({
          icon: "error",
          text: "Please fill all password fields.",
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        Swal.fire({
          icon: "error",
          text: "New passwords do not match.",
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
      if (passwordData.currentPassword === passwordData.newPassword) {
        Swal.fire({
          icon: "error",
          text: "Can not change to same password",
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
      if (passwordData.newPassword.length < 8) {
        Swal.fire({
          icon: "error",
          text: "New password must be at least 8 characters.",
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }

      //   Making the api call here
      await authClient.changePassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          onRequest() {
            setPwLoading(true);
          },
          onSuccess() {
            Swal.fire({
              icon: "success",
              text: "Password changed successfully",
              toast: true,
              position: "top-end",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          },
          onError(context) {
            console.log(context.error);
            Swal.fire({
              icon: "error",
              text: context.error?.message || "Failed to change password",
              toast: true,
              position: "top-end",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          },
        },
      );
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Failed to change password",
        toast: true,
        position: "top-end",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setPwLoading(false);
    }
  };
  return (
    <section>
      <h2 className="text-2xl font-semibold text-primary">Change Password</h2>
      <p className="text-black -mt-">
        Update your account password. Choose a strong password.
      </p>
      <form
        className="grid grid-cols-4 gap-6 mt-4"
        onSubmit={handleChangePassword as any}
      >
        <div className="col-span-4 md:col-span-2">
          <InputGroup
            label="Current Password"
            name="currentPassword"
            onChange={handlePasswordChangeField}
            placeholder="Enter current password"
            type="password"
            value={passwordData.currentPassword}
          />
        </div>
        <div className="md:col-start-1 col-span-4 md:col-span-2">
          <InputGroup
            label="New Password"
            name="newPassword"
            onChange={handlePasswordChangeField}
            placeholder="Enter new password"
            type="password"
            value={passwordData.newPassword}
          />
        </div>
        <div className="col-span-4 md:col-span-2">
          <InputGroup
            label="Confirm New Password"
            name="confirmPassword"
            onChange={handlePasswordChangeField}
            placeholder="Repeat new password"
            type="password"
            value={passwordData.confirmPassword}
          />
        </div>
        <div className="col-span-4 ml-auto">
          <Button type="submit" disabled={pwLoading}>
            {pwLoading ? "Updating..." : "Change Password"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default ChangePasswordSection;
