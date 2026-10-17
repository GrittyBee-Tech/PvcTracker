"use client";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollableSelect } from "@/components/ui/scrollable-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  filters: {
    ninStatus: string;
    pvcStatus: string;
    search: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFiltersChange: (filters: any) => void;
  refresh: () => void;
  onExport: (format: "excel" | "pdf") => void;
  exporting: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  filters,
  onFiltersChange,
  refresh,
  onExport,
  exporting,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkAction = async (action: "restrict" | "activate" | "delete") => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    setBulkLoading(true);
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedIds, action }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: `Bulk ${action} Successful`,
          text: `${selectedIds.length} users have been ${action}d.`,
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
        });
        setRowSelection({});
        refresh();
      } else {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${action} users`);
      }
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Bulk Action Failed", text: error.message });
    } finally {
      setBulkLoading(false);
    }
  };

  const options = useMemo(
    () => ({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      onRowSelectionChange: setRowSelection,
      getRowId: (row: any) => row.id,
      state: {
        sorting,
        rowSelection,
      },
      manualPagination: true,
      manualFiltering: true,
    }),
    [data, columns, sorting, rowSelection],
  );

  const table = useReactTable(options);

  const ninStatusOptions = [
    { name: "All NIN Statuses", value: "all" },
    { name: "Verified", value: "verified" },
    { name: "Pending", value: "pending" },
    { name: "Rejected", value: "rejected" },
  ];

  const pvcStatusOptions = [
    { name: "All PVC Statuses", value: "all" },
    { name: "Collected", value: "collected" },
    { name: "Not Collected", value: "not_collected" },
  ];

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.ninStatus !== "all" ||
    filters.pvcStatus !== "all";
  const selectedCount = Object.keys(rowSelection).length;
  const firstResult =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const lastResult = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="space-y-4 border-b border-gray-100 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              aria-label="Search users"
              placeholder="Search name, email, phone, or NIN"
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
            {filters.search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onFiltersChange({ ...filters, search: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex">
            <div className="min-w-0 sm:min-w-[190px]">
              <ScrollableSelect
                id="nin-status-filter"
                name="ninStatus"
                placeholder="Filter by NIN status..."
                options={ninStatusOptions}
                value={filters.ninStatus || "all"}
                onValueChange={(value) => {
                  onFiltersChange({ ...filters, ninStatus: value });
                }}
                selectClassName="h-10 mt-0 rounded-lg border-gray-200 bg-gray-50"
              />
            </div>
            <div className="min-w-0 sm:min-w-[190px]">
              <ScrollableSelect
                id="pvc-status-filter"
                name="pvcStatus"
                placeholder="Filter by PVC status..."
                options={pvcStatusOptions}
                value={filters.pvcStatus || "all"}
                onValueChange={(value) => {
                  onFiltersChange({ ...filters, pvcStatus: value });
                }}
                selectClassName="h-10 mt-0 rounded-lg border-gray-200 bg-gray-50"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                className="h-10 text-gray-500 hover:text-gray-900"
                onClick={() =>
                  onFiltersChange({
                    search: "",
                    ninStatus: "all",
                    pvcStatus: "all",
                  })
                }
              >
                Clear filters
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={loading || exporting || pagination.total === 0}
                  className="h-10 flex-1 border-gray-200 sm:flex-none"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {exporting ? "Preparing…" : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export filtered users</DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={exporting}
                  onSelect={() => onExport("excel")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={exporting}
                  onSelect={() => onExport("pdf")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border border-primary/15 bg-primary/[0.04] p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-gray-700" aria-live="polite">
              <span className="text-primary">{selectedCount}</span>{" "}
              {selectedCount === 1 ? "user" : "users"} selected
            </p>
            <div className="grid grid-cols-1 gap-2 sm:flex">
              <Button
                variant="outline"
                className="h-9 border-green-200 bg-white text-green-700 hover:bg-green-50"
                onClick={() => handleBulkAction("activate")}
                disabled={bulkLoading}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                className="h-9 border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-50"
                onClick={() => handleBulkAction("restrict")}
                disabled={bulkLoading}
              >
                Restrict
              </Button>
              <Button
                variant="outline"
                className="h-9 border-red-200 bg-white text-red-700 hover:bg-red-50"
                onClick={() => handleBulkAction("delete")}
                disabled={bulkLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="relative overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-gray-100 bg-gray-50/70"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-3 font-semibold text-gray-600"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50/70 data-[state=selected]:bg-primary/[0.04]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-3.5 text-gray-600"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-gray-500">
                      <Search
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-gray-700">
                        No users found
                      </span>
                      <span className="text-sm">
                        Try changing your search or clearing the filters.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[1px]"
            role="status"
            aria-label="Loading users"
          >
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 shadow-sm">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
              Loading users…
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-gray-500" aria-live="polite">
          Showing{" "}
          <span className="font-medium text-gray-700">{firstResult}</span>
          {"–"}
          <span className="font-medium text-gray-700">{lastResult}</span>
          {" of "}
          <span className="font-medium text-gray-700">
            {pagination.total.toLocaleString()}
          </span>
          {" users"}
        </p>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <span className="mr-2 text-sm text-gray-500">
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-gray-200"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-gray-200"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
