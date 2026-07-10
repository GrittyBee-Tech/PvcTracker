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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Modal from "@/components/ui/modal";
import { UserType } from "@/types";

type AdminRow = UserType & {
  permissions?: string[];
  adminStatus?: string;
};

const AdminActionsCell = ({ admin }: { admin: AdminRow }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open admin actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            View more
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Admin Details"
        size="lg"
      >
        <div className="space-y-6 text-black">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Full name</p>
              <p className="font-medium">
                {admin.firstName} {admin.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{admin.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{admin.phoneNumber || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{admin.adminStatus || "active"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">NIN</p>
              <p className="font-medium">{admin.nin || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">VIN</p>
              <p className="font-medium">{admin.vin || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State of origin</p>
              <p className="font-medium">{admin.stateOfOrigin || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Home address</p>
              <p className="font-medium">{admin.homeAddress || "—"}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Permissions
            </h4>
            {admin.permissions && admin.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {admin.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No permissions assigned.</p>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Date added</p>
            <p className="font-medium">
              {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const columns: ColumnDef<AdminRow>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = (row.getValue("permissions") as string[] | undefined) || [];
      if (permissions.length === 0) {
        return <span className="text-sm text-gray-400">No specific permissions</span>;
      }
      return (
        <div className="flex max-w-62.5 flex-wrap gap-1">
          {permissions.slice(0, 3).map((p) => (
            <span
              key={p}
              className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700"
            >
              {p}
            </span>
          ))}
          {permissions.length > 3 && (
            <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              +{permissions.length - 3} more
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date Added",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | Date | undefined;
      return <span>{date ? new Date(date).toLocaleDateString() : "—"}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <AdminActionsCell admin={row.original} />,
  },
];
