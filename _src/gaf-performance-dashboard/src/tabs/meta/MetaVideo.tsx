// src/tabs/meta/MetaVideo.tsx
import { useState, useMemo } from "react";
import { fmtCurrency, fmtInt, fmtPct } from "../../lib/format";
import { DataTable } from "../../components/DataTable";
import type { MetaWindow, MetaVideoRow } from "../../lib/data";

interface Props {
  metaWin: MetaWindow;
}

type SortVideoKey = "spend" | "thumbStopRate" | "p100Rate" | "videoPlays" | "avgWatchTime";
type ViewMode = "cards" | "table";

const SORT_OPTIONS: { key: SortVideoKey; label: string }[] = [
  { key: "spend",         label: "Spend" },
  { key: "thumbStopRate", label: "Thumb Stop %" },
  { key: "p100Rate",      label: "Completion %" },
  { key: "videoPlays",    label: "Plays" },
  { key: "avgWatchTime",  label: "Avg Watch Time" },
];

// Retention colour: >=50% green, >=25% amber, else red (per spec).
function retentionColor(pct: number): string {
  if (pct >= 50) return "var(--gaf-delta-pos)";
  if (pct >= 25) return "#d97706"; // amber-600
  return "var(--gaf-delta-neg)";
}

function RetentionBar({ label, pct }: { label: string; pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = retentionColor(pct);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] w-16 shrink-0" style={{ color: "var(--gaf-text-muted)" }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--gaf-row-border)" }}>
        <div className="h-full rounded-full" style={{ width: `${clamped}%`, background: color }} />
      </div>
      <span className="text-[10px] w-10 text-right tabular-nums font-semibold" style={{ color: "var(--gaf-text-primary)" }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function KpiPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="dash-card p-3 flex flex-col min-w-0">
      <span className="text-[9px] uppercase tracking-wider truncate" style={{ color: "var(--gaf-text-muted)" }}>
        {label}
      </span>
      <span
        className="text-lg font-bold tabular-nums truncate"
        style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
      >
        {value}
      </span>
    </div>
  );
}

const TABLE_COLS = [
  { key: "adName",       label: "Ad Name",        align: "left" as const },
  { key: "campaign",     label: "Campaign",        align: "left" as const },
  { key: "spend",        label: "Spend",           align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "videoPlays",   label: "Plays",           align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "thruPlays",    label: "ThruPlays",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "thumbStopRate",label: "Thumb Stop %",    align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "p100Rate",     label: "Completion %",    align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "avgWatchTime", label: "Avg Watch (s)",   align: "right" as const, format: (v: unknown) => `${Number(v ?? 0).toFixed(1)}s` },
  { key: "impressions",  label: "Impr.",           align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "atc",          label: "ATC",             align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "engagements",  label: "Engagements",     align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
];

export function MetaVideo({ metaWin }: Props) {
  const [sortKey, setSortKey] = useState<SortVideoKey>("spend");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const video = (metaWin.video ?? []) as MetaVideoRow[];
  const withPlays = video.filter((v) => Number(v.videoPlays ?? 0) > 0);

  const sorted = useMemo(() => {
    return [...withPlays].sort((a, b) => Number(b[sortKey] ?? 0) - Number(a[sortKey] ?? 0));
  }, [withPlays, sortKey]);

  // Summary KPIs
  const totalSpend = withPlays.reduce((s, v) => s + Number(v.spend ?? 0), 0);
  const thumbStops = withPlays.map(v => Number(v.thumbStopRate ?? 0)).filter(x => x > 0);
  const avgThumbStop = thumbStops.length ? thumbStops.reduce((a, b) => a + b, 0) / thumbStops.length : 0;
  const completions = withPlays.map(v => Number(v.p100Rate ?? 0)).filter(x => x > 0);
  const avgCompletion = completions.length ? completions.reduce((a, b) => a + b, 0) / completions.length : 0;
  const watchTimes = withPlays.map(v => Number(v.avgWatchTime ?? 0)).filter(x => x > 0);
  const avgWatch = watchTimes.length ? watchTimes.reduce((a, b) => a + b, 0) / watchTimes.length : 0;

  if (sorted.length === 0) {
    return (
      <div className="fade-in dash-card p-8 text-center text-sm" style={{ color: "var(--gaf-text-muted)" }}>
        No video retention data available for this window.
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      {/* Summary KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiPill label="Total Video Spend" value={fmtCurrency(totalSpend)} />
        <KpiPill label="Avg Thumb Stop %" value={fmtPct(avgThumbStop)} />
        <KpiPill label="Avg Completion %" value={fmtPct(avgCompletion)} />
        <KpiPill label="Avg Watch Time" value={`${avgWatch.toFixed(1)}s`} />
      </div>

      {/* Header + controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <h3
            className="text-lg font-bold"
            style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
          >
            Video Performance
          </h3>
          <span className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>
            {sorted.length} video ad{sorted.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Sort by */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>Sort:</span>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortVideoKey)}
              className="text-xs rounded border px-2 py-1"
              style={{
                borderColor: "var(--gaf-card-border)",
                color: "var(--gaf-text-primary)",
                background: "var(--gaf-card-bg)",
              }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1">
            {(["cards", "table"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors capitalize"
                style={{
                  background: viewMode === v ? "var(--gaf-primary)" : "var(--gaf-primary-light)",
                  color: viewMode === v ? "#fff" : "var(--gaf-primary)",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video preview note */}
      <p className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>
        Video preview unavailable via Ads API – the feed does not contain video source URLs.
      </p>

      {/* Cards view */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {sorted.map((v, i) => (
            <div key={v.adId ?? i} className="dash-card p-4 flex flex-col gap-3 min-w-0">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold leading-snug line-clamp-1"
                    style={{ color: "var(--gaf-text-primary)" }}
                    title={String(v.adName ?? "")}
                  >
                    {String(v.adName ?? "Untitled ad")}
                  </p>
                  {v.campaign && (
                    <p className="text-[11px] truncate" style={{ color: "var(--gaf-text-muted)" }} title={String(v.campaign)}>
                      {String(v.campaign)}
                    </p>
                  )}
                </div>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shrink-0"
                  style={{ background: "var(--gaf-primary)" }}
                >
                  #{i + 1}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--gaf-text-muted)" }}>Spend</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}>{fmtCurrency(Number(v.spend ?? 0))}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--gaf-text-muted)" }}>Plays</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}>{fmtInt(Number(v.videoPlays ?? 0))}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--gaf-text-muted)" }}>ThruPlays</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}>{fmtInt(Number(v.thruPlays ?? 0))}</span>
                </div>
              </div>

              {/* Extra metrics row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--gaf-text-muted)" }}>Thumb Stop</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}>{fmtPct(Number(v.thumbStopRate ?? 0))}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--gaf-text-muted)" }}>Avg Watch</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}>{Number(v.avgWatchTime ?? 0).toFixed(1)}s</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--gaf-text-muted)" }}>Impr.</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}>{fmtInt(Number(v.impressions ?? 0))}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--gaf-text-muted)" }}>ATC</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}>{fmtInt(Number(v.atc ?? 0))}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--gaf-text-muted)" }}>Engagements</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}>{fmtInt(Number(v.engagements ?? 0))}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <RetentionBar label="25%" pct={Number(v.p25Rate ?? 0)} />
                <RetentionBar label="50%" pct={Number(v.p50Rate ?? 0)} />
                <RetentionBar label="75%" pct={Number(v.p75Rate ?? 0)} />
                <RetentionBar label="Completion" pct={Number(v.p100Rate ?? 0)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <DataTable<Record<string, unknown>>
          columns={TABLE_COLS}
          rows={sorted as unknown as Record<string, unknown>[]}
          sortable
        />
      )}

      <p className="text-[11px]" style={{ color: "var(--gaf-text-muted)" }}>
        Retention rates are the percentage of video plays reaching each quartile.{" "}
        <span style={{ color: "var(--gaf-delta-pos)" }}>Green</span> &ge;50%,{" "}
        <span style={{ color: "#d97706" }}>amber</span> &ge;25%,{" "}
        <span style={{ color: "var(--gaf-delta-neg)" }}>red</span> &lt;25%.
      </p>
    </div>
  );
}
