// src/tabs/meta/MetaBreakdowns.tsx
import { useState } from "react";
import { DataTable } from "../../components/DataTable";
import { META_BREAKDOWN_COLS } from "./columns";
import type { MetaWindow, MetaBreakdownRow, MetaBreakdowns as MetaBreakdownsData } from "../../lib/data";

interface Props {
  metaWin: MetaWindow;
}

type Row = Record<string, unknown>;

type Dim = keyof MetaBreakdownsData;

const DIMS: { key: Dim; label: string }[] = [
  { key: "platform",  label: "Platform" },
  { key: "placement", label: "Placement" },
  { key: "age",       label: "Age" },
  { key: "gender",    label: "Gender" },
  { key: "region",    label: "Region" },
];

// Region shows a privacy note (Meta withholds conversions at region level).
const REGION_NOTE =
  "Meta withholds conversion data at region level (privacy threshold), so purchases, revenue and ROAS show as n/a. Spend, impressions and clicks are accurate.";

export function MetaBreakdowns({ metaWin }: Props) {
  const breakdowns = metaWin.breakdowns ?? {};
  const [active, setActive] = useState<Dim>("platform");

  const rows = (breakdowns[active] ?? []) as MetaBreakdownRow[] as Row[];

  return (
    <div className="space-y-4 fade-in">
      <h3
        className="text-lg font-bold"
        style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
      >
        Breakdowns
      </h3>

      {/* Dimension sub-tab pills */}
      <div
        className="inline-flex flex-wrap gap-1 p-1 rounded-xl"
        style={{ background: "var(--gaf-card-bg)", border: "1px solid var(--gaf-card-border)" }}
        role="tablist"
        aria-label="Breakdown dimension"
      >
        {DIMS.map((d) => {
          const isActive = active === d.key;
          const count = (breakdowns[d.key] ?? []).length;
          return (
            <button
              key={d.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(d.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: isActive ? "var(--gaf-primary)" : "transparent",
                color: isActive ? "#fff" : "var(--gaf-text-secondary)",
              }}
            >
              {d.label}
              {count > 0 && (
                <span className="ml-1 opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {active === "region" && rows.length > 0 && (
        <p className="text-[11px]" style={{ color: "var(--gaf-text-muted)" }}>
          {REGION_NOTE}
        </p>
      )}

      <DataTable<Row> columns={META_BREAKDOWN_COLS} rows={rows} sortable />
    </div>
  );
}
