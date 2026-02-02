import React, { useState } from "react";

interface Column {
  key: string;
  label: string;
  type?: "text" | "badge" | "currency" | "date";
}

interface TableProps {
  data: any[];
  columns: Column[];
  selectable?: boolean;
  onRowClick?: (row: any) => void;
  pageSize?: number;
}

export default function Table({
  data,
  columns,
  selectable = false,
  onRowClick,
  pageSize = 10,
}: TableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginated = data.slice(startIndex, startIndex + pageSize);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === paginated.length) {
      setSelected([]);
    } else {
      setSelected(paginated.map((row) => row.id));
    }
  };

  const formatValue = (value: any, type?: string) => {
    if (type === "currency") return `₹${Number(value).toLocaleString()}`;
    if (type === "badge")
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
          {value}
        </span>
      );
    if (type === "date")
      return new Date(value).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    return value;
  };

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">

      {/* TABLE */}
      <table className="w-full border-collapse">
        <thead className="bg-slate-100">
          <tr>
            {selectable && (
              <th className="p-3 border">
                <input
                  type="checkbox"
                  checked={
                    selected.length === paginated.length && paginated.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
            )}

            {columns.map((col) => (
              <th key={col.key} className="p-3 border text-left font-semibold">
                {col.label}
              </th>
            ))}

            {onRowClick && (
              <th className="p-3 border text-left font-semibold">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {paginated.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (onRowClick ? 1 : 0)}
                className="text-center p-6 text-gray-500"
              >
                No records found
              </td>
            </tr>
          )}

          {paginated.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 cursor-pointer transition"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {selectable && (
                <td
                  className="p-3 border"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                  />
                </td>
              )}

              {columns.map((col) => (
                <td key={col.key} className="p-3 border">
                  {formatValue(row[col.key], col.type)}
                </td>
              ))}

              {onRowClick && (
                <td
                  className="p-3 border text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View →
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex justify-between items-center p-4 bg-slate-50 border-t">
        <button
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <p className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </p>

        <button
          className="px-3 py-1 bg-slate-200 rounded disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
