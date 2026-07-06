"use client";

import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "adminId",
    header: "Admin",
    cell: ({ row }) => {
      const admin = row.original.adminId;
      return (
        <div>
          <p className="font-medium">{admin?.firstName} {admin?.lastName}</p>
          <p className="text-xs text-gray-500">{admin?.email}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {action.replace(/_/g, " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <p className="max-w-md truncate" title={row.getValue("details")}>
        {row.getValue("details")}
      </p>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div>
          <p className="text-sm">{date.toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{date.toLocaleTimeString()}</p>
        </div>
      );
    },
  },
];
