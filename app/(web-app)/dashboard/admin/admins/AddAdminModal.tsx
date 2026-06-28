"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Swal from "sweetalert2";
import { PERMISSIONS } from "@/models/adminProfile";

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAdminModal({
  isOpen,
  onClose,
  onSuccess,
}: AddAdminModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nin: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        onClose();
        setFormData({ firstName: "", lastName: "", email: "", phoneNumber: "", nin: "" });
        setSelectedPermissions([]);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Admin"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-black">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <input
              required
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <input
              required
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-xs text-gray-500">If the user already exists, they will be elevated to an admin.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input
              required
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">NIN</label>
            <input
              required
              name="nin"
              value={formData.nin}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="text-sm font-medium text-gray-700">Assign Permissions</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PERMISSIONS.map((permission) => (
              <label key={permission} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-2 rounded border border-gray-100 transition-colors">
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

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
            {loading ? "Saving..." : "Save Admin"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
