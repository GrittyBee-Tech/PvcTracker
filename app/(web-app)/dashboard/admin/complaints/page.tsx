"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Complaint = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  complaintType: string;
  message: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: string;
};

const statusStyles: Record<Complaint["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  "in-progress": "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
};

function formatComplaintType(type: string) {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<"doc" | "pdf" | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/complaints");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to fetch complaints");
      }

      setComplaints(data.complaints);
    } catch (fetchError) {
      console.error("Failed to fetch complaints:", fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch complaints",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchComplaints();
  }, [fetchComplaints]);

  const handleExport = async (format: "doc" | "pdf") => {
    setExporting(format);

    try {
      const fileDate = new Date().toISOString().slice(0, 10);
      const rows = complaints.map((complaint) => ({
        name: complaint.name,
        email: complaint.email,
        phone: complaint.phone || "",
        type: formatComplaintType(complaint.complaintType),
        message: complaint.message,
        status: complaint.status.replace("-", " "),
        submitted: new Date(complaint.createdAt).toLocaleString(),
      }));

      if (format === "doc") {
        const tableRows = rows
          .map(
            (complaint) => `
              <tr>
                <td>${escapeHtml(complaint.name)}</td>
                <td>${escapeHtml(complaint.email)}<br>${escapeHtml(complaint.phone)}</td>
                <td>${escapeHtml(complaint.type)}</td>
                <td>${escapeHtml(complaint.message).replace(/\n/g, "<br>")}</td>
                <td>${escapeHtml(complaint.status)}</td>
                <td>${escapeHtml(complaint.submitted)}</td>
              </tr>`,
          )
          .join("");
        const documentContent = `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><title>Complaints</title></head>
            <body>
              <h1>Complaints</h1>
              <p>${rows.length} ${rows.length === 1 ? "complaint" : "complaints"}</p>
              <table border="1" cellspacing="0" cellpadding="6">
                <thead>
                  <tr><th>Name</th><th>Email / Phone</th><th>Type</th><th>Complaint</th><th>Status</th><th>Submitted</th></tr>
                </thead>
                <tbody>${tableRows}</tbody>
              </table>
            </body>
          </html>`;
        const blob = new Blob(["\ufeff", documentContent], {
          type: "application/msword;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `complaints-${fileDate}.doc`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
          import("jspdf"),
          import("jspdf-autotable"),
        ]);
        const pdf = new jsPDF({ orientation: "landscape", format: "a4" });
        pdf.setFontSize(16);
        pdf.text("Complaints", 14, 15);
        pdf.setFontSize(9);
        pdf.text(`Records: ${rows.length}`, 14, 21);
        autoTable(pdf, {
          head: [["Name", "Email / Phone", "Type", "Complaint", "Status", "Submitted"]],
          body: rows.map((complaint) => [
            complaint.name,
            [complaint.email, complaint.phone].filter(Boolean).join("\n"),
            complaint.type,
            complaint.message,
            complaint.status,
            complaint.submitted,
          ]),
          startY: 26,
          styles: { fontSize: 7, cellPadding: 2, overflow: "linebreak" },
          headStyles: { fillColor: [31, 41, 55] },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 40 },
            2: { cellWidth: 30 },
            3: { cellWidth: 100 },
            4: { cellWidth: 24 },
            5: { cellWidth: 32 },
          },
        });
        pdf.save(`complaints-${fileDate}.pdf`);
      }
    } catch (exportError) {
      console.error("Failed to export complaints:", exportError);
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Failed to export complaints",
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 text-black">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Complaints</h1>
          <p className="text-gray-600">
            View complaints submitted by users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={loading || exporting !== null}>
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                {exporting ? "Exporting..." : "Export"}
                <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void handleExport("doc")}>
                Export as DOC
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => void fetchComplaints()}
            disabled={loading}
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border bg-white shadow-xs">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b-2 border-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Complaint type</th>
              <th className="px-4 py-3 font-semibold">Complaint</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  className="h-24 px-4 text-center text-gray-500"
                  colSpan={5}
                >
                  Loading complaints...
                </td>
              </tr>
            ) : complaints.length ? (
              complaints.map((complaint) => (
                <tr
                  key={complaint._id}
                  className="border-b border-gray-100 align-top last:border-0"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{complaint.name}</p>
                    <a
                      className="text-primary hover:underline"
                      href={`mailto:${complaint.email}`}
                    >
                      {complaint.email}
                    </a>
                    {complaint.phone && (
                      <p className="mt-1 text-gray-500">{complaint.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-700">
                    {formatComplaintType(complaint.complaintType)}
                  </td>
                  <td className="max-w-xl whitespace-pre-wrap px-4 py-4 text-gray-600">
                    {complaint.message}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[complaint.status]}`}
                    >
                      {complaint.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                    <time dateTime={complaint.createdAt}>
                      {new Date(complaint.createdAt).toLocaleString()}
                    </time>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="h-24 px-4 text-center text-gray-500"
                  colSpan={5}
                >
                  No complaints have been submitted.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">
        {complaints.length} {complaints.length === 1 ? "complaint" : "complaints"}
      </p>
    </div>
  );
}
