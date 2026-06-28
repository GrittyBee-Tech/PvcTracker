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
import { useState, useMemo } from "react";
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
    action: string;
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

  const actionOptions = [
    { name: "All Actions", value: "all" },
    { name: "Batch Upload", value: "BATCH_UPLOAD_VOLUNTEERS" },
    { name: "Approve Volunteer", value: "APPROVE_VOLUNTEER" },
    { name: "Reject Volunteer", value: "REJECT_VOLUNTEER" },
    { name: "Delete User", value: "DELETE_USER" },
    { name: "Restrict User", value: "RESTRICT_USER" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-64">
            <ScrollableSelect
              id="action-filter"
              name="action"
              placeholder="Filter by action..."
              options={actionOptions}
              value={filters.action || "all"}
              onValueChange={(value) => {
                onFiltersChange({ ...filters, action: value });
              }}
              selectClassName="h-10 mt-0 py-2 border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-white">
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
                  {loading ? "Loading logs..." : "No logs found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-gray-500">
          Total {pagination.total} logs | Page {pagination.page} of {pagination.totalPages}
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
