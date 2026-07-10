// src/components/KpiCard.tsx
import { Delta } from "./Delta";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number | null;
  /** Set true for lower-is-better metrics (CPC, CPM, CPA) — inverts delta colour logic */
  invertDelta?: boolean;
  subLabel?: string;
}

export function KpiCard({ label, value, delta, invertDelta, subLabel }: KpiCardProps) {
  return (
    <div
      className="dash-card flex flex-col gap-1 min-w-0 p-3 sm:p-5"
    >
      {/* LABEL — 10px uppercase tracking-wider, gray-400 */}
      <span
        className="text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate"
        style={{ color: "var(--gaf-text-muted)" }}
      >
        {label}
      </span>

      {/* KPI NUMBER + DELTA on same row */}
      <div className="flex items-baseline justify-between gap-2 mt-0.5">
        <span
          className="text-lg sm:text-2xl font-bold font-display leading-tight tabular-nums"
          style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
        >
          {value}
        </span>
        {delta !== undefined && delta !== null && (
          <Delta pct={delta} invert={invertDelta} />
        )}
      </div>

      {/* Optional sub-label */}
      {subLabel && (
        <span
          className="text-[10px] mt-0.5"
          style={{ color: "var(--gaf-text-muted)" }}
        >
          {subLabel}
        </span>
      )}
    </div>
  );
}
