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
import Image from "next/image";

const VolunteerActionsCell = ({
  application,
  refresh,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  application: Record<string, any>;
  refresh: () => void;
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const user = application.userId;

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/volunteers/${application._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          position: "top",
          text: `Volunteer application ${action}d successfully`,
          toast: true,
          showConfirmButton: false,
          padding: "10",
          timer: 3000,
        });
        refresh();
        setIsApproveOpen(false);
        setIsRejectOpen(false);
        setNote("");
      } else {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${action} volunteer`);
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
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(application._id);
              Swal.fire({
                icon: "success",
                position: "top",
                text: "ID Copied",
                toast: true,
                showConfirmButton: false,
                padding: "10",
                timer: 2000,
              });
            }}
          >
            Copy application ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            View full application
          </DropdownMenuItem>

          {!application.status || application.status === "pending" ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-green-600"
                onClick={() => setIsApproveOpen(true)}
              >
                Approve application
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setIsRejectOpen(true)}
              >
                Reject application
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Profile Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Volunteer Application Details"
        size="lg"
      >
        <div className="space-y-6 text-black">
          <div className="flex items-center gap-4 border-b pb-4">
            {application.PhotoUrl && (
              <Image
                src={application.PhotoUrl}
                width={80}
                height={80}
                alt="Volunteer"
                className="rounded-full object-cover border-2 border-primary/20"
              />
            )}
            <div>
              <h3 className="text-lg font-bold text-primary">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">{user?.phoneNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-sm text-gray-500">Marital Status</p>
              <p className="font-medium capitalize">
                {application?.maritalStatus}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State of Residence</p>
              <p className="font-medium">{application?.stateOfResidence}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Home Address</p>
              <p className="font-medium">{application?.homeAddress}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">
              Next of Kin
            </h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{application?.nextOfKin?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Relationship</p>
                <p className="font-medium capitalize">
                  {application?.nextOfKin?.relationship}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{application?.nextOfKin?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="font-medium">{application?.nextOfKin?.state}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{application?.nextOfKin?.address}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Application Status</p>
              <span
                className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  application.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : application.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {application.status || "pending"}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Applied on: {new Date(application?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        title="Approve Volunteer"
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800 text-white"
              onClick={() => handleAction("approve")}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Approval"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-black">
          <p>
            Are you sure you want to approve{" "}
            <strong>
              {user?.firstName} {user?.lastName}
            </strong>{" "}
            as a volunteer?
          </p>
          <p className="text-sm text-gray-500">
            This will grant them access to the volunteer dashboard and allow
            them to register other users.
          </p>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Reject Volunteer Application"
        size="md"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction("reject")}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm Rejection"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-black">
          <p>
            Are you sure you want to reject{" "}
            <strong>
              {user?.firstName} {user?.lastName}
            </strong>
            &apos;s volunteer application?
          </p>
          <div className="space-y-2">
            <label
              htmlFor="reject-note"
              className="text-sm font-medium text-gray-700"
            >
              Rejection Reason (Optional)
            </label>
            <textarea
              id="reject-note"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add reason for rejection..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns = (refresh: () => void): ColumnDef<any>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        checked={
          table.getIsAllPageRowsSelected() ||
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
    accessorKey: "userId.firstName",
    header: "First Name",
    cell: ({ row }) => row.original.userId?.firstName,
  },
  {
    accessorKey: "userId.lastName",
    header: "Last Name",
    cell: ({ row }) => row.original.userId?.lastName,
  },
  {
    accessorKey: "userId.phoneNumber",
    header: "Phone",
    cell: ({ row }) => row.original.userId?.phoneNumber,
  },
  {
    accessorKey: "stateOfResidence",
    header: "Residence State",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string) || "pending";
      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
            status === "approved"
              ? "bg-green-100 text-green-800"
              : status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Applied On",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <VolunteerActionsCell application={row.original} refresh={refresh} />
    ),
  },
];
