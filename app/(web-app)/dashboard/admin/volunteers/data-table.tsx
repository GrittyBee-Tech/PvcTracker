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
import { Button } from "@/components/ui/button";
import { ScrollableSelect } from "@/components/ui/scrollable-select";
import { useState, useMemo, useEffect } from "react";

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
    state: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  filters,
  onFiltersChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const options = useMemo(
    () => ({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      onRowSelectionChange: setRowSelection,
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

  const [states, setStates] = useState<{ name: string; value: string }[]>([
    { name: "All States", value: "all" },
  ]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/locations/states");
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          const fetchedStates = data.map((state: string) => ({
            name: state,
            value: state,
          }));
          setStates([{ name: "All States", value: "all" }, ...fetchedStates]);
        }
      } catch (error) {
        console.error("Failed to fetch states:", error);
      }
    };
    fetchStates();
  }, []);

  const uniqueStatuses = [
    { name: "All Statuses", value: "all" },
    { name: "Approved", value: "approved" },
    { name: "Pending", value: "pending" },
    { name: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-48">
            <ScrollableSelect
              id="state-filter"
              name="state"
              placeholder="Filter by state..."
              options={states}
              value={filters.state || "all"}
              onValueChange={(value) => {
                onFiltersChange({
                  ...filters,
                  state: value === "all" ? "" : value,
                });
              }}
              selectClassName="h-10 mt-0 py-2 border-gray-300"
            />
          </div>
          <div className="w-48">
            <ScrollableSelect
              id="status-filter"
              name="status"
              placeholder="Filter by status..."
              options={uniqueStatuses}
              value={filters.status || "all"}
              onValueChange={(value) => {
                onFiltersChange({
                  ...filters,
                  status: value,
                });
              }}
              selectClassName="h-10 mt-0 py-2 border-gray-300"
            />
          </div>
        </div>

        {Object.keys(rowSelection).length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-white relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b-2 border-gray-200"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-gray-700 font-semibold py-3"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-600 py-3">
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
                  className="h-24 text-center text-gray-500"
                >
                  {loading ? "Loading..." : "No results found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-gray-500">
          Total {pagination.total} applications | Page {pagination.page} of{" "}
          {pagination.totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1 || loading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
