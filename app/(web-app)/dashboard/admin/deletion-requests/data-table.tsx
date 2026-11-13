"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollableSelect } from "@/components/ui/scrollable-select";

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
    status: string;
    reference: string;
  };
  onFiltersChange: (filters: { status: string; reference: string }) => void;
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
  const options = useMemo(
    () => ({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      manualPagination: true,
    }),
    [data, columns],
  );

  const table = useReactTable(options);

  const statusOptions = [
    { name: "All Statuses", value: "all" },
    { name: "Pending", value: "pending" },
    { name: "Processing", value: "processing" },
    { name: "Completed", value: "completed" },
    { name: "Restored", value: "cancelled" },
    { name: "Failed", value: "failed" },
  ];
  const [referenceInput, setReferenceInput] = useState(filters.reference);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <ScrollableSelect
              id="status-filter"
              name="status"
              placeholder="Filter by status..."
              options={statusOptions}
              value={filters.status || "all"}
              onValueChange={(value) => {
                onFiltersChange({ ...filters, status: value });
              }}
              selectClassName="h-10 mt-0 py-2 border-gray-300"
            />
          </div>
          <form
            className="flex w-full sm:w-auto gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              onFiltersChange({ ...filters, reference: referenceInput });
            }}
          >
            <input
              type="search"
              placeholder="Reference, e.g. DEL-2026-000001"
              value={referenceInput}
              onChange={(event) => setReferenceInput(event.target.value)}
              className="h-10 w-full sm:w-64 rounded-md border border-gray-300 px-3 text-sm"
            />
            <Button type="submit" variant="outline" className="h-10">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="rounded-md border bg-white relative overflow-x-auto w-full shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-2 border-gray-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-700 font-semibold py-3">
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
                  className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-600 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  {loading ? "Loading deletion requests..." : "No deletion requests found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-gray-500">
          Total {pagination.total} requests | Page {pagination.page} of {pagination.totalPages}
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
