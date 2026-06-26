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
import { UserType } from "@/models/users";

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

const UserActionsCell = ({ user }: { user: UserType }) => {
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
              <p className="text-gray-500">First Name</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.firstName}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Last Name</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.phoneNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Gender</p>
              <p className="font-medium text-gray-900 text-lg capitalize">
                {user.gender || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">State of Origin</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.stateOfOrigin}
              </p>
            </div>
            <div>
              <p className="text-gray-500">LGA of Origin</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.lgaOfOrigin}
              </p>
            </div>
            <div>
              <p className="text-gray-500">NIN</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.nin || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">VIN</p>
              <p className="font-medium text-gray-900 text-lg">
                {user.vin || "N/A"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-500">Home Address</p>
            <p className="font-medium text-gray-900 text-lg">
              {user.homeAddress || "N/A"}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">NIN Status</p>
              <span
                className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full font-medium text-lg capitalize ${ninStatusStyles[user.ninStatus]}`}
              >
                {user.ninStatus}
              </span>
            </div>
            <div>
              <p className="text-gray-500">PVC Status</p>
              <span
                className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full font-medium text-lg capitalize ${pvcStatusStyles[user.pvcStatus]}`}
              >
                {user.pvcStatus}
              </span>
            </div>
          </div>

          <div className="flex gap-6">
            <Button
              variant="outline"
              className="text-yellow-600 border-yellow-600 hover:bg-yellow-100"
            >
              Restrict Selected
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-100"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const columns: ColumnDef<UserType>[] = [
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
    cell: ({ row }) => <UserActionsCell user={row.original} />,
  },
];
