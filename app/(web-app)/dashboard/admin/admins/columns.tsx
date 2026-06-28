"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserType } from "@/types";

export const columns: ColumnDef<UserType>[] = [
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
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
        {row.getValue("role")}
      </span>
    ),
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[] || [];
      if (permissions.length === 0) {
        return <span className="text-gray-400 text-sm">No specific permissions</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 max-w-[250px]">
          {permissions.slice(0, 3).map((p) => (
            <span key={p} className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
              {p}
            </span>
          ))}
          {permissions.length > 3 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200">
              +{permissions.length - 3} more
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: "Date Added",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return <span>{new Date(date).toLocaleDateString()}</span>;
    },
  },
];
