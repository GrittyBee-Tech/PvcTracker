"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  FileCode2,
} from "lucide-react";
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
import Swal from "sweetalert2";
import { VerificationSessionRecord } from "@/types";

const statusConfig: Record<
  string,
  { bg: string; text: string; border: string; icon: React.ElementType }
> = {
  verified: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
  },
  rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle,
  },
};

export const SessionDetailsModal = ({
  session,
  isOpen,
  onClose,
}: {
  session: VerificationSessionRecord;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const statusInfo = statusConfig[session.status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  const copyToClipboard = (text: string, type: "id" | "json") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
    Swal.fire({
      icon: "success",
      title: "Copied to clipboard",
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verification Session Details"
      size="xl"
    >
      <div className="space-y-6 text-black">
        {/* Header Summary Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Session ID
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-sm font-semibold text-slate-800">
                {session._id}
              </span>
              <button
                onClick={() => copyToClipboard(session._id, "id")}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                title="Copy Session ID"
              >
                {copiedId ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span className="capitalize">{session.status}</span>
            </span>
          </div>
        </div>

        {/* Status Message / Reason */}
        {session.status_reason && (
          <div
            className={`p-3.5 rounded-lg border text-sm flex items-start gap-2.5 ${
              session.status === "rejected"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : session.status === "verified"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            {session.status === "rejected" && (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-xs uppercase tracking-wide opacity-80">
                Status Reason
              </p>
              <p className="mt-0.5 font-medium">{session.status_reason}</p>
            </div>
          </div>
        )}

        {/* User Information */}
        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            User Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Full Name</p>
              <p className="font-medium text-slate-900 mt-0.5">
                {session.user
                  ? `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() ||
                    session.user.name ||
                    "—"
                  : "Unknown User"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Email Address</p>
              <p className="font-medium text-slate-900 mt-0.5">
                {session.user?.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Phone Number</p>
              <p className="font-medium text-slate-900 mt-0.5">
                {session.user?.phoneNumber || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">NIN (User Profile)</p>
              <p className="font-medium font-mono text-slate-900 mt-0.5">
                {session.user?.nin || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Origin State / LGA</p>
              <p className="font-medium text-slate-900 mt-0.5">
                {session.user?.stateOfOrigin
                  ? `${session.user.stateOfOrigin} / ${session.user.lgaOfOrigin || "—"}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">User ID</p>
              <p className="font-mono text-xs text-slate-600 truncate mt-0.5">
                {session.user_id}
              </p>
            </div>
          </div>
        </div>

        {/* Mismatches Breakdown (if any) */}
        {session.mismatches && session.mismatches.length > 0 && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Data Mismatch Discrepancies ({session.mismatches.length})
              </h3>
            </div>
            <div className="overflow-x-auto rounded-md border border-rose-200 bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-rose-50 text-rose-900 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Field</th>
                    <th className="py-2.5 px-3">User Profile (DB)</th>
                    <th className="py-2.5 px-3">Official NIN Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {session.mismatches.map((mismatch, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/40">
                      <td className="py-2 px-3 font-semibold text-slate-700 capitalize">
                        {mismatch.field}
                      </td>
                      <td className="py-2 px-3 text-slate-800">
                        {mismatch.dbValue || <span className="text-slate-400">empty</span>}
                      </td>
                      <td className="py-2 px-3 font-medium text-rose-700">
                        {mismatch.ninValue || <span className="text-slate-400">empty</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment / Transaction Details */}
        <div className="rounded-lg border border-slate-200 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Payment Transaction Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Transaction ID</p>
              <p className="font-mono text-xs font-medium text-slate-900 mt-0.5 truncate">
                {session.transaction_id || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Payment Reference</p>
              <p className="font-mono text-xs font-medium text-slate-900 mt-0.5 truncate">
                {session.transaction?.reference || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Provider</p>
              <p className="font-medium text-slate-900 mt-0.5 capitalize">
                {session.transaction?.provider || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Amount</p>
              <p className="font-medium text-slate-900 mt-0.5">
                {session.transaction?.amount
                  ? `₦${session.transaction.amount.toLocaleString()}`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 border-t border-slate-200 pt-3">
          <div>
            <span className="font-medium text-slate-600">Created: </span>
            {new Date(session.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="font-medium text-slate-600">Last Updated: </span>
            {new Date(session.updatedAt).toLocaleString()}
          </div>
        </div>

        {/* Raw Provider Response */}
        {session.provider_response && Object.keys(session.provider_response).length > 0 && (
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <FileCode2 className="w-4 h-4 text-slate-500" />
                <span>Provider Response (LumiID / External)</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(session.provider_response, null, 2),
                    "json",
                  )
                }
              >
                {copiedJson ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
              </Button>
            </div>
            <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-3.5 text-slate-100 text-xs font-mono leading-relaxed">
              {JSON.stringify(session.provider_response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
};

const SessionActionsCell = ({
  session,
}: {
  session: VerificationSessionRecord;
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(session._id);
              Swal.fire({
                icon: "success",
                text: "Session ID copied",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 2000,
              });
            }}
          >
            Copy session ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(session.user_id);
              Swal.fire({
                icon: "success",
                text: "User ID copied",
                toast: true,
                position: "top",
                showConfirmButton: false,
                timer: 2000,
              });
            }}
          >
            Copy user ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SessionDetailsModal
        session={session}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
};

export const columns: ColumnDef<VerificationSessionRecord>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user;
      const userName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Unknown"
        : "Unknown User";

      return (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 text-sm">{userName}</span>
          <span className="text-xs text-slate-500">{user?.email || "No email"}</span>
          {user?.phoneNumber && (
            <span className="text-xs text-slate-400">{user.phoneNumber}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "user_id",
    header: "User / NIN",
    cell: ({ row }) => {
      const nin = row.original.user?.nin;
      const userId = row.original.user_id;
      return (
        <div className="flex flex-col font-mono text-xs">
          {nin ? (
            <span className="font-semibold text-slate-800">NIN: {nin}</span>
          ) : (
            <span className="text-slate-400">NIN: —</span>
          )}
          <span
            className="text-[11px] text-slate-400 truncate max-w-[120px]"
            title={userId}
          >
            ID: {userId}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const config = statusConfig[status] || statusConfig.pending;
      const Icon = config.icon;

      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="capitalize">{status}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "status_reason",
    header: "Status Reason",
    cell: ({ row }) => {
      const reason = row.original.status_reason || "—";
      const hasMismatches =
        row.original.mismatches && row.original.mismatches.length > 0;

      return (
        <div className="max-w-xs">
          <p className="text-xs text-slate-700 truncate" title={reason}>
            {reason}
          </p>
          {hasMismatches && (
            <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-semibold mt-0.5">
              <AlertTriangle className="w-3 h-3" />
              {row.original.mismatches?.length} mismatch(es) detected
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "transaction_id",
    header: "Transaction",
    cell: ({ row }) => {
      const tx = row.original.transaction;
      const txId = row.original.transaction_id;

      return (
        <div className="flex flex-col text-xs font-mono">
          <span className="text-slate-800 font-medium capitalize">
            {tx?.provider ? `${tx.provider}` : "Transaction"}
          </span>
          <span
            className="text-[11px] text-slate-400 truncate max-w-[120px]"
            title={tx?.reference || txId}
          >
            {tx?.reference || txId || "—"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="flex flex-col text-xs text-slate-600">
          <span className="font-medium">{date.toLocaleDateString()}</span>
          <span className="text-slate-400">{date.toLocaleTimeString()}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SessionActionsCell session={row.original} />,
  },
];
