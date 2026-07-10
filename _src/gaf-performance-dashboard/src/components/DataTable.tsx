// src/components/DataTable.tsx
import { useState } from "react";

type Align = "left" | "right" | "center";

interface Column<T extends Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  format?: (value: T[keyof T & string]) => string;
  align?: Align;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  sortable?: boolean;
}

type SortDir = "asc" | "desc" | null;

function alignClass(align?: Align): string {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  sortable = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleHeaderClick(key: string) {
    if (!sortable) return;

    // Determine if column is numeric (check first non-null value)
    const firstVal = rows.find(r => r[key] !== null && r[key] !== undefined)?.[key];
    if (typeof firstVal !== "number") return;

    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedRows = [...rows];
  if (sortable && sortKey && sortDir) {
    sortedRows.sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm text-gray-300 border-collapse">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-950">
            {columns.map(col => {
              const isActiveSort = sortKey === col.key;
              const isNumericSortable =
                sortable &&
                typeof (rows.find(r => r[col.key] !== null && r[col.key] !== undefined)?.[col.key]) === "number";

              return (
                <th
                  key={col.key}
                  className={[
                    "px-4 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap",
                    alignClass(col.align),
                    isNumericSortable ? "cursor-pointer select-none hover:text-orange-400" : "",
                    isActiveSort ? "text-orange-400" : "",
                  ].join(" ")}
                  onClick={() => handleHeaderClick(col.key)}
                >
                  {col.label}
                  {isActiveSort && sortDir === "asc" && (
                    <span className="ml-1" aria-hidden="true">&#9650;</span>
                  )}
                  {isActiveSort && sortDir === "desc" && (
                    <span className="ml-1" aria-hidden="true">&#9660;</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition-colors"
            >
              {columns.map(col => {
                const raw = row[col.key];
                const cell = col.format ? col.format(raw) : String(raw ?? "");
                return (
                  <td
                    key={col.key}
                    className={["px-4 py-3", alignClass(col.align)].join(" ")}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
          {sortedRows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-gray-500 italic"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
