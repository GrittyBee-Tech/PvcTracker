"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useMemo, useState } from "react";
import { UserType } from "@/models/users";

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  // Triggers for fetching
  const [currentPage, setCurrentPage] = useState(1);
  // const [limit, setLimit] = useState(10);
  const limit = 10;
  const [filters, setFilters] = useState({
    state: "",
    lga: "",
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
        ...(filters.state && { state: filters.state }),
        ...(filters.lga && { lga: filters.lga }),
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

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, filters.state, filters.lga]);

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
      />
    </div>
  );
}
