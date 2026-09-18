"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  BadgeCheck,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  IdCard,
  Phone,
} from "lucide-react";
import Link from "next/link";
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
import { PERMISSIONS } from "@/types";
import { User } from "better-auth";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  refresh: () => void;
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRestrictOpen, setIsRestrictOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isElevateOpen, setIsElevateOpen] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [copiedNin, setCopiedNin] = useState(false);
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

          {/* <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/admin/verification-sessions?userId=${user.id}&openLatest=true`}
              className="flex items-center gap-2 text-emerald-700 cursor-pointer"
            >
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>View verification session</span>
              <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
            </Link>
          </DropdownMenuItem> */}

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
        title="User Profile Details"
        size="xl"
        className="max-w-2xl sm:max-w-2xl"
        actions={
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <Link
              href={`/dashboard/admin/verification-sessions?userId=${user.id}&openLatest=true`}
              onClick={() => setIsProfileOpen(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>Inspect Verification Session</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileOpen(false)}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-5 text-slate-800">
          {/* User Header Profile Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-200 flex items-center justify-center text-base font-bold select-none shrink-0 shadow-xs">
                {user.firstName?.[0]?.toUpperCase() || "U"}
                {user.lastName?.[0]?.toUpperCase() || "N"}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="truncate">{user.email || "No email provided"}</span>
                  {user.emailVerified ? (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                      Verified
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="font-mono text-[11px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded truncate max-w-[180px]">
                    ID: {user.id}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.id);
                      setCopiedUserId(true);
                      setTimeout(() => setCopiedUserId(false), 2000);
                      Swal.fire({
                        icon: "success",
                        position: "top",
                        text: "User ID copied",
                        toast: true,
                        showConfirmButton: false,
                        timer: 2000,
                      });
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                    title="Copy User ID"
                  >
                    {copiedUserId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-primary/10 text-primary border border-primary/20">
                {user.role || "user"}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  user.status === "restricted"
                    ? "bg-yellow-100 text-yellow-800"
                    : user.status === "deleted"
                      ? "bg-red-100 text-red-800"
                      : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {user.status || "active"}
              </span>
            </div>
          </div>

          {/* Quick Verification Gateway Strip */}
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  Verification Status & Discrepancies
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  View raw provider responses, verification logs, and field mismatches.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/admin/verification-sessions?userId=${user.id}&openLatest=true`}
              onClick={() => setIsProfileOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shrink-0 shadow-2xs"
            >
              <span>View Modal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Identity & Voter Status Card */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Identity & Voter Details</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">NIN</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-medium text-slate-900">
                    {user.nin || "—"}
                  </span>
                  {user.nin && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.nin);
                        setCopiedNin(true);
                        setTimeout(() => setCopiedNin(false), 2000);
                        Swal.fire({
                          icon: "success",
                          position: "top",
                          text: "NIN copied",
                          toast: true,
                          showConfirmButton: false,
                          timer: 2000,
                        });
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title="Copy NIN"
                    >
                      {copiedNin ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">NIN Status</p>
                <span
                  className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    ninStatusStyles[user.ninStatus] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {user.ninStatus || "pending"}
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs">PVC Status</p>
                <span
                  className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    pvcStatusStyles[user.pvcStatus] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {(user.pvcStatus || "not_collected").replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs">VIN</p>
                <p className="font-mono font-medium text-slate-900 mt-0.5 truncate">
                  {user.vin || "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Gender</p>
                <p className="font-medium text-slate-900 mt-0.5 capitalize">
                  {user.gender || "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Disability</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {user.isDisabled ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Date of Birth</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">PVC Collected Date</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {user.datePvcCollected
                    ? new Date(user.datePvcCollected).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Location & Polling Info Card */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Location & Polling Information</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">State & LGA of Origin</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {user.stateOfOrigin
                    ? `${user.stateOfOrigin} / ${user.lgaOfOrigin || "—"}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Voting State & LGA</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {user.votingState
                    ? `${user.votingState} / ${user.votingLga || "—"}`
                    : "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 text-xs">Home Address</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {user.homeAddress || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Registration Card */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Contact & Account Meta</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Phone Number</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {user.phoneNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Joined Date</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Last Updated</p>
                <p className="font-medium text-slate-900 mt-0.5">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
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

export const columns = (refresh: () => void): ColumnDef<User>[] => [
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
    accessorKey: "isDisabled",
    header: "Disability",
    cell: ({ row }) => {
      const isDisabled = row.getValue("isDisabled") as boolean;
      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isDisabled
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {isDisabled ? "Yes" : "No"}
        </span>
      );
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
