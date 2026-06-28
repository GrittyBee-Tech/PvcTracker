"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Modal from "@/components/ui/modal";
import Swal from "sweetalert2";
import { UserType, PERMISSIONS } from "@/types";

const ninStatusStyles: Record<string, string> = {
  verified: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

const pvcStatusStyles: Record<string, string> = {
  collected: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  not_collected: "bg-red-100 text-red-800",
};

const UserActionsCell = ({
  user,
  refresh,
}: {
  user: UserType;
  refresh: () => void;
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRestrictOpen, setIsRestrictOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isElevateOpen, setIsElevateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleRoleUpdate = async (newRole: "admin") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, permissions: selectedPermissions }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "User Elevated",
          text: `${user.firstName} is now an admin.`,
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
        });
        refresh();
        setIsElevateOpen(false);
        setSelectedPermissions([]);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Action Failed", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: "active" | "restricted") => {
    setLoading(true);
    console.log(user);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: `User ${newStatus === "restricted" ? "Restricted" : "Activated"}`,
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
        });
        refresh();
        setIsRestrictOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status");
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Action Failed", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "User Deleted",
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
        });
        refresh();
        setIsDeleteOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Action Failed", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="shadow-md shadow-primary/50 border-0"
          align="end"
        >
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(user.id);
              Swal.fire({
                icon: "success",
                position: "top",
                text: "Copied Successfully",
                toast: true,
                showConfirmButton: false,
                customClass: {
                  icon: "text-sm",
                  popup: "",
                },
                padding: "10",
              });
            }}
          >
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            View user profile
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="text-blue-600" 
            onClick={() => setIsElevateOpen(true)}
          >
            Make an Admin
          </DropdownMenuItem>
          
          {user.status === "restricted" ? (
            <DropdownMenuItem className="text-green-600" onClick={() => handleStatusUpdate("active")}>
              Activate account
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-yellow-600"
              onClick={() => setIsRestrictOpen(true)}
            >
              Restrict account
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="User Profile"
        size="lg"
      >
        <div className="space-y-6 text-black">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-gray-500 text-sm">First Name</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.firstName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Last Name</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone Number</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.phoneNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Gender</p>
              <p className="font-medium text-gray-900 text-lg capitalize">
                {user.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">State of Origin</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.stateOfOrigin}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">LGA of Origin</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.lgaOfOrigin}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">NIN</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.nin || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">VIN</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.vin || "N/A"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-500 text-sm">Home Address</p>
            <p className="font-medium text-gray-900 text-lg">
              {user.homeAddress || "N/A"}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">NIN Status</p>
              <span
                className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full font-medium text-lg capitalize ${ninStatusStyles[user.ninStatus]}`}
              >
                {user.ninStatus}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">PVC Status</p>
              <span
                className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full font-medium text-lg capitalize ${pvcStatusStyles[user.pvcStatus]}`}
              >
                {user.pvcStatus}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Restrict Modal */}
      <Modal
        isOpen={isRestrictOpen}
        onClose={() => setIsRestrictOpen(false)}
        title="Restrict Account"
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsRestrictOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => handleStatusUpdate("restricted")}
              disabled={loading}
            >
              {loading ? "Processing..." : "Restrict User"}
            </Button>
          </>
        }
      >
        <p className="text-black">
          Are you sure you want to restrict{" "}
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          ? They will be unable to perform any actions on the platform.
        </p>
      </Modal>

      {/* Elevate Modal */}
      <Modal
        isOpen={isElevateOpen}
        onClose={() => setIsElevateOpen(false)}
        title="Elevate to Admin"
        size="lg"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsElevateOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleRoleUpdate("admin")} disabled={loading || selectedPermissions.length === 0}>
              {loading ? "Processing..." : "Confirm Elevation"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-black">
          <p>You are about to make <strong>{user.firstName} {user.lastName}</strong> an administrator. Please select their permissions below:</p>
          
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
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
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Account"
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </>
        }
      >
        <p className="text-black">
          Are you sure you want to delete{" "}
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          ? This action will mark the user as deleted and hide them from normal
          views.
        </p>
      </Modal>
    </>
  );
};

export const columns = (refresh: () => void): ColumnDef<UserType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        checked={
          table.getIsAllPageRowsSelected() ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (table.getIsSomePageRowsSelected() && ("indeterminate" as any))
        }
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string;
      return <span className="capitalize">{gender}</span>;
    },
  },
  {
    accessorKey: "stateOfOrigin",
    header: "State",
  },
  {
    accessorKey: "lgaOfOrigin",
    header: "LGA",
  },
  {
    accessorKey: "ninStatus",
    header: "NIN Status",
    cell: ({ row }) => {
      const status = row.getValue("ninStatus") as string;
      const statusStyles: Record<string, string> = {
        verified: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        rejected: "bg-red-100 text-red-800",
      };

      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "pvcStatus",
    header: "PVC Status",
    cell: ({ row }) => {
      const status = row.getValue("pvcStatus") as string;
      const statusStyles: Record<string, string> = {
        collected: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        not_collected: "bg-red-100 text-red-800",
      };

      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Registration Date",
    cell: ({ row }) => {
      const registrationDate = row.getValue("createdAt") as string;
      return (
        <span className="capitalize">
          {new Date(registrationDate).toDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <UserActionsCell user={row.original} refresh={refresh} />
    ),
  },
];
