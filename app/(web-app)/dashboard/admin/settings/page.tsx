"use client";

import ChangePasswordSection from "../../user/edit-profile/ChangePassword";

export default function SettingsPage() {
  return (
    <div className="text-black space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200">
        <ChangePasswordSection />
      </div>
    </div>
  );
}
