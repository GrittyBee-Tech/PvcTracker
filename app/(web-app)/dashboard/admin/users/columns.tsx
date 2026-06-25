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
import { User } from "@/lib/sample-db";
import Swal from "sweetalert2";

const UserActionsCell = ({ user }: { user: User }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
          <DropdownMenuItem className="text-yellow-600">
            Restrict account
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
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
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-medium text-gray-900">{user.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-medium text-gray-900">{user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-900">
                {user.phoneNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium text-gray-900 capitalize">
                {user.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State of Origin</p>
              <p className="font-medium text-gray-900">{user.stateOfOrigin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">LGA of Origin</p>
              <p className="font-medium text-gray-900">{user.lgaOfOrigin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">NIN</p>
              <p className="font-medium text-gray-900">{user.nin || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">VIN</p>
              <p className="font-medium text-gray-900">{user.vin || "N/A"}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">Home Address</p>
            <p className="font-medium text-gray-900">
              {user.homeAddress || "N/A"}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">NIN Status</p>
              <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {user.ninStatus}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">PVC Status</p>
              <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                {user.pvcStatus}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const columns: ColumnDef<User>[] = [
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
        Confirmed: "bg-green-100 text-green-800",
        Pending: "bg-yellow-100 text-yellow-800",
        Rejected: "bg-red-100 text-red-800",
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
        Collected: "bg-green-100 text-green-800",
        Pending: "bg-yellow-100 text-yellow-800",
        "Not Collected": "bg-red-100 text-red-800",
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
    accessorKey: "registrationDate",
    header: "Registration Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActionsCell user={row.original} />,
  },
];
