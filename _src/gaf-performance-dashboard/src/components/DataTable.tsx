// src/components/DataTable.tsx
import { useState } from "react";

type Align = "left" | "right" | "center";

interface Column<T extends Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  format?: (value: T[keyof T & string]) => string;
  align?: Align;
  /** Mark this column as the primary name/label column — bolder, darker text */
  isName?: boolean;
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

    const firstVal = rows.find(r => r[key] !== null && r[key] !== undefined)?.[key];
    if (typeof firstVal !== "number") return;

    if (sortKey === key) {
      const next: SortDir = sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc";
      setSortDir(next);
      if (next === null) setSortKey(null);
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
    <div
      className="dash-card overflow-hidden"
      style={{ padding: 0 }}
    >
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse" style={{ fontFamily: "var(--font-body)" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              {columns.map(col => {
                const isActiveSort = sortKey === col.key;
                const isNumericSortable =
                  sortable &&
                  typeof (rows.find(r => r[col.key] !== null && r[col.key] !== undefined)?.[col.key]) === "number";

                return (
                  <th
                    key={col.key}
                    className={[
                      "py-2.5 px-3 text-[11px] uppercase tracking-wide font-semibold whitespace-nowrap select-none",
                      alignClass(col.align),
                      isNumericSortable ? "cursor-pointer" : "",
                    ].join(" ")}
                    style={{
                      color: isActiveSort ? "var(--gaf-primary)" : "var(--gaf-text-muted)",
                    }}
                    onClick={() => handleHeaderClick(col.key)}
                    onMouseEnter={e => {
                      if (isNumericSortable && !isActiveSort) {
                        (e.currentTarget as HTMLElement).style.color = "#374151";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActiveSort) {
                        (e.currentTarget as HTMLElement).style.color = "var(--gaf-text-muted)";
                      }
                    }}
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
                className="transition-colors last:border-0"
                style={{ borderBottom: "1px solid var(--gaf-row-border)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
              >
                {columns.map((col, colIdx) => {
                  const raw = row[col.key];
                  const cell = col.format ? col.format(raw) : String(raw ?? "");
                  const isName = col.isName ?? colIdx === 0;
                  return (
                    <td
                      key={col.key}
                      className={["py-2.5 px-3 text-sm", alignClass(col.align)].join(" ")}
                      style={{
                        color: isName ? "#111827" : "var(--gaf-text-secondary)",
                        fontWeight: isName ? 500 : 400,
                        fontVariantNumeric: col.align === "right" ? "tabular-nums" : undefined,
                      }}
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
                  className="py-8 text-center text-sm"
                  style={{ color: "var(--gaf-text-muted)" }}
                >
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
