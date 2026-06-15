"use client";

import { useAuth } from "@/hooks/useAuth";
import UserProfileForm from "./UserProfileForm";

export default function UserProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-gray-500 animate-pulse">
          Loading profile context...
        </p>
      </div>
    );
  }

  // The key property acts as an automatic constructor trigger.
  // When 'user.email' shifts, React scraps old instance memory states
  // and re-binds form values accurately without any layout cascades.
  return <UserProfileForm key={user.email} user={user} />;
}
