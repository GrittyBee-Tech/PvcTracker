"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";

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

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-6 text-black">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Complaints</h1>
          <p className="text-gray-600">
            View complaints submitted by users.
          </p>
        </div>
        <Button
          onClick={() => void fetchComplaints()}
          disabled={loading}
          variant="outline"
        >
          Refresh
        </Button>
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
