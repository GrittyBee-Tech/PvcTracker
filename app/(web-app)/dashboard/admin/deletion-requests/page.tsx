"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { columns, type DeletionRequestRecord } from "./columns";
import { DataTable } from "./data-table";

export default function DeletionRequestsPage() {
  const [requests, setRequests] = useState<DeletionRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ status: "all", reference: "" });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  const pagination = useMemo(
    () => ({ page: currentPage, limit, total: totalCount, totalPages }),
    [currentPage, totalCount, totalPages],
  );

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.reference.trim() && { reference: filters.reference.trim() }),
      });
      const response = await fetch(`/api/admin/deletion-requests?${queryParams}`);
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests);
        setTotalCount(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch deletion requests:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters.status, filters.reference]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const tableColumns = useMemo(() => columns(fetchRequests), [fetchRequests]);

  return (
    <div className="text-black space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Deletion Log</h1>
        <p className="text-gray-600">
          Deleted accounts are anonymized 30 days after the request. Pending
          requests can be restored until then.
        </p>
      </div>

      <DataTable
        columns={tableColumns}
        data={requests}
        loading={loading}
        pagination={pagination}
        onPageChange={setCurrentPage}
        filters={filters}
        onFiltersChange={(next) => {
          setCurrentPage(1);
          setFilters(next);
        }}
      />
    </div>
  );
}
