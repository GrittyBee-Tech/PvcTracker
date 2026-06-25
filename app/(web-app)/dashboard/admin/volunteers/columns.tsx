"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
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
import { Volunteer } from "@/lib/sample-db";
import Swal from "sweetalert2";

const VolunteerActionsCell = ({ volunteer }: { volunteer: Volunteer }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [note, setNote] = useState("");

  const handleAction = (action: "Approve" | "Reject") => {
    Swal.fire({
      icon: "success",
      position: "top",
      text: `Volunteer ${action}d successfully`,
      toast: true,
      showConfirmButton: false,
      padding: "10",
      timer: 3000,
    });
    setIsApproveOpen(false);
    setIsRejectOpen(false);
    setNote("");
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
              navigator.clipboard.writeText(volunteer.id);
              Swal.fire({
                icon: "success",
                position: "top",
                text: "Copied Successfully",
                toast: true,
                showConfirmButton: false,
                padding: "10",
                timer: 3000,
              });
            }}
          >
            Copy volunteer ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            View volunteer profile
          </DropdownMenuItem>
          
          {volunteer.status === "Pending" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-green-600" onClick={() => setIsApproveOpen(true)}>
                Approve application
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => setIsRejectOpen(true)}>
                Reject application
              </DropdownMenuItem>
            </>
          )}

          {volunteer.status === "Active" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-yellow-600">
                Revoke volunteer status
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete account
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Profile Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Volunteer Profile"
        size="lg"
      >
        <div className="space-y-6 text-black">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="font-medium text-gray-900">{volunteer.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="font-medium text-gray-900">{volunteer.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-900">{volunteer.phoneNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium text-gray-900 capitalize">{volunteer.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State of Origin</p>
              <p className="font-medium text-gray-900">{volunteer.stateOfOrigin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">LGA of Origin</p>
              <p className="font-medium text-gray-900">{volunteer.lgaOfOrigin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Application Date</p>
              <p className="font-medium text-gray-900">{volunteer.applicationDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Registered Users (Outreach)</p>
              <p className="font-medium text-gray-900">{volunteer.registeredUsers}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Application Status</p>
              <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                volunteer.status === "Active" ? "bg-green-100 text-green-800" :
                volunteer.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {volunteer.status}
              </span>
            </div>
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
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
            <Button className="bg-green-700 hover:bg-green-800 text-white" onClick={() => handleAction("Approve")}>Confirm Approval</Button>
          </>
        }
      >
        <div className="space-y-4 text-black">
          <p>Are you sure you want to approve <strong>{volunteer.firstName} {volunteer.lastName}</strong> as a volunteer?</p>
          <div className="space-y-2">
            <label htmlFor="approve-note" className="text-sm font-medium text-gray-700">Approval Note (Optional)</label>
            <textarea
              id="approve-note"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add an internal note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
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
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleAction("Reject")}>Confirm Rejection</Button>
          </>
        }
      >
        <div className="space-y-4 text-black">
          <p>Are you sure you want to reject <strong>{volunteer.firstName} {volunteer.lastName}</strong>'s volunteer application?</p>
          <div className="space-y-2">
            <label htmlFor="reject-note" className="text-sm font-medium text-gray-700">Rejection Reason (Optional)</label>
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

export const columns: ColumnDef<Volunteer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate" as any)}
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
    accessorKey: "stateOfOrigin",
    header: "State",
  },
  {
    accessorKey: "lgaOfOrigin",
    header: "LGA",
  },
  {
    accessorKey: "registeredUsers",
    header: "Users Registered",
    cell: ({ row }) => {
      return <div className="font-medium text-center">{row.getValue("registeredUsers")}</div>;
    }
  },
  {
    accessorKey: "status",
    header: "Application Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusStyles: Record<string, string> = {
        Active: "bg-green-100 text-green-800",
        Pending: "bg-yellow-100 text-yellow-800",
        Rejected: "bg-red-100 text-red-800",
      };
      
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}>
          {status}
        </span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <VolunteerActionsCell volunteer={row.original} />,
  },
];
