"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState, useMemo } from "react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [filters, setFilters] = useState({
    action: "all",
  });

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pagination = useMemo(
    () => ({
      page: currentPage,
      limit,
      total: totalCount,
      totalPages,
    }),
    [currentPage, totalCount, totalPages]
  );

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(filters.action !== "all" && { action: filters.action }),
      });

      const response = await fetch(`/api/admin/audit-logs?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs);
        setTotalCount(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters.action]);

  return (
    <div className="text-black space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-gray-600">
          Track platform actions for non-repudiation and security monitoring.
        </p>
      </div>
      
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={setCurrentPage}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
}
