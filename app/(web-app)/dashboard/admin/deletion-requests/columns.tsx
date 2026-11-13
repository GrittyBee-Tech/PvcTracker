"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";

type PersonRef = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  anonymizedAt?: string;
} | null;

export type DeletionRequestRecord = {
  _id: string;
  reference: string;
  userId: PersonRef | string;
  requestedBy: PersonRef;
  requestedAt: string;
  scheduledFor: string;
  completedAt?: string;
  status: "pending" | "processing" | "cancelled" | "completed" | "failed";
  reason?: string;
  cancelledBy?: PersonRef;
  cancelledAt?: string;
  lastError?: string;
};

const STATUS_STYLES: Record<DeletionRequestRecord["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  cancelled: "bg-gray-100 text-gray-700",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<DeletionRequestRecord["status"], string> = {
  pending: "Pending",
  processing: "Processing",
  cancelled: "Restored",
  completed: "Completed",
  failed: "Failed",
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "—";

const personName = (person: PersonRef) =>
  person ? `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() || "—" : "—";

const RestoreCell = ({
  request,
  refresh,
}: {
  request: DeletionRequestRecord;
  refresh: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  if (request.status !== "pending") return null;

  const handleRestore = async () => {
    const confirmation = await Swal.fire({
      icon: "question",
      title: `Restore account for ${request.reference}?`,
      text: "The user will be reactivated and can sign in again. If they were an admin, their admin access stays suspended until re-enabled.",
      showCancelButton: true,
      confirmButtonText: "Restore",
    });
    if (!confirmation.isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/deletion-requests/${request._id}/restore`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to restore user");

      Swal.fire({
        icon: "success",
        title: "User Restored",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      });
      refresh();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Restore Failed",
        text: error instanceof Error ? error.message : "Failed to restore user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRestore} disabled={loading}>
      {loading ? "Restoring..." : "Restore"}
    </Button>
  );
};

export const columns = (
  refresh: () => void,
): ColumnDef<DeletionRequestRecord>[] => [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.original.reference}</span>
    ),
  },
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.userId;
      const id = typeof user === "string" ? user : user?._id;
      const anonymized = typeof user === "object" && user?.anonymizedAt;
      return (
        <div>
          <p className="font-medium">
            {anonymized ? "Anonymized" : typeof user === "object" ? personName(user) : "—"}
          </p>
          <p className="font-mono text-xs text-gray-500">{id ?? "—"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "requestedBy",
    header: "Processed by",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{personName(row.original.requestedBy)}</p>
        <p className="text-xs text-gray-500">{row.original.requestedBy?.email ?? ""}</p>
      </div>
    ),
  },
  {
    accessorKey: "requestedAt",
    header: "Requested",
    cell: ({ row }) => formatDate(row.original.requestedAt),
  },
  {
    id: "completion",
    header: "Completion",
    cell: ({ row }) => {
      const { completedAt, scheduledFor, status } = row.original;
      if (completedAt) return formatDate(completedAt);
      if (status === "cancelled") return "—";
      return <span className="text-gray-500">Due {formatDate(scheduledFor)}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { status, cancelledBy, cancelledAt, lastError } = row.original;
      return (
        <div className="space-y-1">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
            title={status === "failed" ? lastError : undefined}
          >
            {STATUS_LABELS[status]}
          </span>
          {status === "cancelled" && (
            <p className="text-xs text-gray-500">
              by {personName(cancelledBy ?? null)} on {formatDate(cancelledAt)}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <RestoreCell request={row.original} refresh={refresh} />,
  },
];
