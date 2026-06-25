"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const options = useMemo(
    () => ({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        columnFilters,
        rowSelection,
      },
    }),
    [data, columns, sorting, columnFilters, rowSelection],
  );

  const table = useReactTable(options);

  // Extract unique states from the data
  const uniqueStates = useMemo(() => {
    const states = Array.from(new Set(data.map((item: any) => item.stateOfOrigin as string).filter(Boolean)));
    return [{ name: "All States", value: "all" }, ...states.map(state => ({ name: state, value: state }))];
  }, [data]);

  const uniqueStatuses = [
    { name: "All Statuses", value: "all" },
    { name: "Active", value: "Active" },
    { name: "Pending", value: "Pending" },
    { name: "Rejected", value: "Rejected" },
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
              options={uniqueStates}
              value={(table.getColumn("stateOfOrigin")?.getFilterValue() as string) || "all"}
              onValueChange={(value) => {
                table.getColumn("stateOfOrigin")?.setFilterValue(value === "all" ? "" : value);
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
              value={(table.getColumn("status")?.getFilterValue() as string) || "all"}
              onValueChange={(value) => {
                table.getColumn("status")?.setFilterValue(value === "all" ? "" : value);
              }}
              selectClassName="h-10 mt-0 py-2 border-gray-300"
            />
          </div>
        </div>
        
        {Object.keys(rowSelection).length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" className="text-yellow-600 border-yellow-600 hover:bg-yellow-50">
              Restrict Selected
            </Button>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              Delete Selected
            </Button>
          </div>
        )}
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-gray-500">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
