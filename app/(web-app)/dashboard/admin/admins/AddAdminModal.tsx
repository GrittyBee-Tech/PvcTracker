"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Swal from "sweetalert2";
import { PERMISSIONS } from "@/types";
import InputGroup from "@/components/ui/InputGroup";
import Select from "@/components/ui/Select";
import { UserPlus, Search, ArrowLeft, Check } from "lucide-react";

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AddAdminFormType = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nin: string;
  gender: string;
  dateOfBirth: string;
};

type Mode = null | "existing" | "new";

type ExistingUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export default function AddAdminModal({
  isOpen,
  onClose,
  onSuccess,
}: AddAdminModalProps) {
  const [mode, setMode] = useState<Mode>(null);
  const [loading, setLoading] = useState(false);

  // Create new user state
  const [formData, setFormData] = useState<AddAdminFormType>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nin: "",
    gender: "",
    dateOfBirth: "",
  });

  // Add existing user state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExistingUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExistingUser | null>(null);

  // Shared state
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const resetState = useCallback(() => {
    setMode(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nin: "",
      gender: "",
      dateOfBirth: "",
    });
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedPermissions([]);
    setLoading(false);
    setSearching(false);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const handleChange = (field: keyof AddAdminFormType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value.trim() }));
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  // Search existing users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `/api/admin/users?search=${encodeURIComponent(searchQuery.trim())}&limit=10`,
      );
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error("Failed to search users:", error);
    } finally {
      setSearching(false);
    }
  };

  // Submit for creating a new admin
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, permissions: selectedPermissions }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Admin Added",
          text: data.message,
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
        });
        onSuccess();
        handleClose();
      } else {
        throw new Error(data.message || "Failed to add admin");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit for elevating existing user to admin
  const handleExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          email: selectedUser.email,
          phoneNumber: selectedUser.phoneNumber,
          nin: "existing-user",
          permissions: selectedPermissions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Admin Added",
          text: data.message,
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
        });
        onSuccess();
        handleClose();
      } else {
        throw new Error(data.message || "Failed to add admin");
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const modalTitle =
    mode === null
      ? "Add Admin"
      : mode === "existing"
        ? "Add Existing User as Admin"
        : "Create New Admin";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      containerClassName="fixed top-16 right-0 bottom-0 left-0 md:left-60 z-20"
      title={modalTitle}
      size="lg"
    >
      {/* Mode Selection */}
      {mode === null && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            How would you like to add an admin?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setMode("existing")}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">
                  Add Existing User
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Search for a user and elevate them to admin
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode("new")}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">Create New User</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Create a new account with admin privileges
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Add Existing User Form */}
      {mode === "existing" && (
        <form onSubmit={handleExistingSubmit} className="space-y-4 text-black">
          <button
            type="button"
            onClick={() => {
              setMode(null);
              setSearchQuery("");
              setSearchResults([]);
              setSelectedUser(null);
              setSelectedPermissions([]);
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <InputGroup
                label="Email Address"
                type="email"
                name="search"
                value={searchQuery}
                onChange={(_field: string, value: string) =>
                  setSearchQuery(value)
                }
                placeholder="Enter user's email address"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="bg-primary hover:bg-primary/90 text-white self-end"
            >
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <label className="text-sm font-medium text-gray-700">
                Select a User
              </label>
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                    selectedUser?._id === user._id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {selectedUser?._id === user._id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery.trim() && !searching && (
            <p className="text-sm text-gray-500 text-center py-4">
              No users found. Try a different search term.
            </p>
          )}

          {/* Permissions - show when user is selected */}
          {selectedUser && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-700">
                Assign Permissions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {PERMISSIONS.map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-2 rounded border border-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => handlePermissionToggle(permission)}
                      className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>{permission}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !selectedUser || selectedPermissions.length === 0
              }
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? "Saving..." : "Make Admin"}
            </Button>
          </div>
        </form>
      )}

      {/* Create New User Form */}
      {mode === "new" && (
        <form
          onSubmit={handleCreateSubmit}
          className="grid grid-cols-2 gap-3 md:gap-5 text-black"
        >
          <div className="col-span-2">
            <button
              type="button"
              onClick={() => {
                setMode(null);
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phoneNumber: "",
                  nin: "",
                  gender: "",
                  dateOfBirth: "",
                });
                setSelectedPermissions([]);
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <InputGroup
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="Enter first name"
          />
          <InputGroup
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            placeholder="Enter last name"
          />
          <InputGroup
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter email address"
          />
          <InputGroup
            label="NIN"
            type="text"
            name="nin"
            value={formData.nin}
            onChange={handleChange}
            required
            placeholder="Enter NIN"
          />

          <Select
            label="Gender"
            name="gender"
            onChange={handleChange}
            options={[
              { name: "Male", value: "male" },
              { name: "Female", value: "female" },
            ]}
            value={formData.gender}
          />

          <InputGroup
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            placeholder="Enter date of birth"
          />

          <div className="space-y-3 col-start-1 col-span-2 pt-2 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700">
              Assign Permissions
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {PERMISSIONS.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-2 rounded border border-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                    className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                  />
                  <span>{permission}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? "Saving..." : "Save Admin"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
