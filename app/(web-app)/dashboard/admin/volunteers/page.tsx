"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import BatchUploadModal from "@/components/dashboard/BatchUploadModal";

export default function VolunteersPage() {
  const [applications, setApplications] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Triggers for fetching
  const [currentPage, setCurrentPage] = useState(1);
  // const [limit, setLimit] = useState(10);
  const limit = 10;
  const [filters, setFilters] = useState({
    state: "",
    status: "all", // all, approved, pending
  });

  // Results from API
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pagination = useMemo(
    () => ({
      page: currentPage,
      limit: limit,
      total: totalCount,
      totalPages: totalPages,
    }),
    [currentPage, limit, totalCount, totalPages],
  );

  

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(filters.state && { state: filters.state }),
        ...(filters.status !== "all" && { status: filters.status }),
      });

      const response = await fetch(
        `/api/admin/volunteers?${queryParams.toString()}`,
      );
      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications);
        setTotalCount(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, filters.state, filters.status]);

  return (
    <div className="text-black space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Volunteers</h1>
          <p className="text-gray-600">
            Here you can view, filter, and manage all the volunteer applications
            on the platform.
          </p>
        </div>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Batch Upload
        </Button>
      </div>
      <DataTable
        columns={columns(fetchVolunteers)}
        data={applications}
        loading={loading}
        pagination={pagination}
        onPageChange={setCurrentPage}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <BatchUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchVolunteers}
      />
    </div>
  );
}
