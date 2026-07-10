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

type AuditLogAdmin = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

type AuditLogRecord = {
  action?: string;
  adminId?: AuditLogAdmin;
  targetModel?: string;
  targetId?: string;
  details?: string;
  metadata?: unknown;
  createdAt?: string | Date;
};

const AuditLogActionsCell = ({ log }: { log: AuditLogRecord }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open log actions</span>
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
        title="Audit Log Details"
        size="lg"
      >
        <div className="space-y-6 text-black">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Action</p>
              <p className="font-medium">
                {String(log.action || "").replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Performed by</p>
              <p className="font-medium">
                {log.adminId?.firstName} {log.adminId?.lastName}
              </p>
              <p className="text-sm text-gray-500">{log.adminId?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Target</p>
              <p className="font-medium">{log.targetModel || "—"}</p>
              <p className="text-sm text-gray-500">{log.targetId || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timestamp</p>
              <p className="font-medium">
                {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              Details
            </h4>
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {log.details || "No details available."}
            </p>
          </div>

          {log.metadata ? (
            <div className="border-t pt-4">
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                Metadata
              </h4>
              <pre className="max-h-80 overflow-auto rounded-md bg-gray-50 p-3 text-xs whitespace-pre-wrap wrap-break-word">
                {formatValue(log.metadata)}
              </pre>
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
};

export const columns: ColumnDef<AuditLogRecord>[] = [
  {
    accessorKey: "adminId",
    header: "Admin",
    cell: ({ row }) => {
      const admin = row.original.adminId;
      return (
        <div>
          <p className="font-medium">
            {admin?.firstName ?? ""} {admin?.lastName ?? ""}
          </p>
          <p className="text-xs text-gray-500">{admin?.email ?? "—"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = (row.getValue("action") as string | undefined) ?? "";
      return (
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {action.replace(/_/g, " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <p
        className="max-w-md truncate"
        title={String(row.getValue("details") ?? "")}
      >
        {String(row.getValue("details") ?? "")}
      </p>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string | Date | undefined;
      const date = createdAt ? new Date(createdAt) : new Date();
      return (
        <div>
          <p className="text-sm">{date.toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{date.toLocaleTimeString()}</p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <AuditLogActionsCell log={row.original} />,
  },
];
