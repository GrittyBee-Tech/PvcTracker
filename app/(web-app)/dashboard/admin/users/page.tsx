"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState, useMemo } from "react";
import { User } from "better-auth";
import Swal from "sweetalert2";

type ExportFormat = "excel" | "pdf";

type ExportUser = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  isDisabled?: boolean;
  stateOfOrigin?: string;
  lgaOfOrigin?: string;
  ninStatus?: string;
  pvcStatus?: string;
  createdAt?: string | Date;
};

type UsersApiResponse = {
  users: ExportUser[];
  pagination: {
    totalPages: number;
  };
};

const exportHeaders = [
  "First Name",
  "Last Name",
  "Email",
  "Phone",
  "Gender",
  "Disability",
  "State",
  "LGA",
  "NIN Status",
  "PVC Status",
  "Registration Date",
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Triggers for fetching
  const [currentPage, setCurrentPage] = useState(1);
  // const [limit, setLimit] = useState(10);
  const limit = 10;
  const [filters, setFilters] = useState({
    ninStatus: "all",
    pvcStatus: "all",
    search: "",
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(filters.ninStatus &&
          filters.ninStatus !== "all" && { ninStatus: filters.ninStatus }),
        ...(filters.pvcStatus &&
          filters.pvcStatus !== "all" && { pvcStatus: filters.pvcStatus }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(
        `/api/admin/users?${queryParams.toString()}`,
      );
      const data = await response.json();

      if (response.ok) {
        const transformedUser = data.users.map((us: Record<string, any>) => ({
          ...us,
          id: us._id,
        }));
        setUsers(transformedUser);
        setTotalCount(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);
    try {
      const fetchPage = async (page: number) => {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "500",
          ...(filters.ninStatus !== "all" && { ninStatus: filters.ninStatus }),
          ...(filters.pvcStatus !== "all" && { pvcStatus: filters.pvcStatus }),
          ...(filters.search && { search: filters.search }),
        });
        const response = await fetch(`/api/admin/users?${queryParams}`);

        if (!response.ok) {
          const error = (await response.json()) as {
            error?: string;
            message?: string;
          };
          throw new Error(error.message || error.error || "Failed to fetch users.");
        }

        return (await response.json()) as UsersApiResponse;
      };

      const firstPage = await fetchPage(1);
      if (!Array.isArray(firstPage.users) || !firstPage.pagination) {
        throw new Error("The server returned an invalid users response.");
      }

      const exportUsers = [...firstPage.users];
      for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
        const pageData = await fetchPage(page);
        if (!Array.isArray(pageData.users)) {
          throw new Error("The server returned an invalid users response.");
        }
        exportUsers.push(...pageData.users);
      }

      const rows = exportUsers.map((user) => [
        user.firstName || "",
        user.lastName || "",
        user.email || "",
        user.phoneNumber || "",
        user.gender || "",
        user.isDisabled ? "Yes" : "No",
        user.stateOfOrigin || "",
        user.lgaOfOrigin || "",
        user.ninStatus || "",
        user.pvcStatus || "",
        user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "",
      ]);
      const fileDate = new Date().toISOString().slice(0, 10);

      if (format === "excel") {
        const XLSX = await import("xlsx");
        const worksheet = XLSX.utils.aoa_to_sheet([exportHeaders, ...rows]);
        worksheet["!cols"] = exportHeaders.map((header) => ({
          wch: Math.max(header.length, 16),
        }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, `users-${fileDate}.xlsx`);
      } else {
        const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
          import("jspdf"),
          import("jspdf-autotable"),
        ]);
        const pdf = new jsPDF({ orientation: "landscape", format: "a3" });
        pdf.setFontSize(16);
        pdf.text("User Records", 14, 15);
        pdf.setFontSize(9);
        pdf.text(`Records: ${exportUsers.length}`, 14, 21);
        autoTable(pdf, {
          head: [exportHeaders],
          body: rows,
          startY: 26,
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [31, 41, 55] },
        });
        pdf.save(`users-${fileDate}.pdf`);
      }

      Swal.fire({
        icon: "success",
        title: "Export ready",
        text: `${exportUsers.length} users exported.`,
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export failed",
        text:
          error instanceof Error ? error.message : "Failed to export users.",
      });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, filters.ninStatus, filters.pvcStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  return (
    <div className="text-black space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-gray-600">
          Here you can view, filter, and manage all the users on the platform.
        </p>
      </div>
      <DataTable
        columns={columns(fetchUsers)}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={setCurrentPage}
        filters={filters}
        onFiltersChange={setFilters}
        refresh={fetchUsers}
        onExport={handleExport}
        exporting={exporting}
      />
    </div>
  );
}
