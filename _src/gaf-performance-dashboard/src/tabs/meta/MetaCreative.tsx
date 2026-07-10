// src/tabs/meta/MetaCreative.tsx
import { useState, useMemo } from "react";
import { fmtCurrency, fmtPct, fmtInt, fmtRoas } from "../../lib/format";
import { DataTable } from "../../components/DataTable";
import { MetaCreativeModal } from "./MetaCreativeModal";
import type { MetaWindow, MetaCreativeRow } from "../../lib/data";

interface Props {
  metaWin: MetaWindow;
}

type TypeFilter = "All" | "Video" | "Image";
type ViewMode = "cards" | "table";

// Rank-by options — lower-is-better metrics sort ascending (reference parity).
const SORT_OPTIONS: { key: string; label: string; lowerBetter?: boolean }[] = [
  { key: "spend",           label: "Spend" },
  { key: "roas",            label: "ROAS" },
  { key: "purchaseValue",   label: "Revenue" },
  { key: "purchases",       label: "Purchases" },
  { key: "cpa",             label: "CPA (low is better)", lowerBetter: true },
  { key: "addToCart",       label: "Add to Cart" },
  { key: "atcRate",         label: "ATC Rate" },
  { key: "engagements",     label: "Engagements" },
  { key: "engagementRate",  label: "Engagement Rate" },
  { key: "ctr",             label: "CTR" },
  { key: "cpc",             label: "CPC (low is better)", lowerBetter: true },
  { key: "cpm",             label: "CPM (low is better)", lowerBetter: true },
  { key: "impressions",     label: "Impressions" },
  { key: "reach",           label: "Reach" },
  { key: "clicks",          label: "Clicks" },
];

// Small labelled stat used in the card footer grid.
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col min-w-0">
      <span
        className="text-[9px] uppercase tracking-wider truncate"
        style={{ color: "var(--gaf-text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-bold tabular-nums truncate"
        style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
      >
        {value}
      </span>
    </div>
  );
}

function Thumbnail({ url, alt }: { url?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div
        className="w-full aspect-square flex items-center justify-center text-xs"
        style={{ background: "var(--gaf-primary-light)", color: "var(--gaf-text-muted)" }}
      >
        No preview
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full aspect-square object-cover"
    />
  );
}

const TABLE_COLS = [
  { key: "adName",         label: "Ad Name",     align: "left" as const },
  { key: "_type",          label: "Type",         align: "left" as const },
  { key: "spend",          label: "Spend",        align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "roas",           label: "ROAS",         align: "right" as const, format: (v: unknown) => fmtRoas(Number(v ?? 0)) },
  { key: "ctr",            label: "CTR",          align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "purchases",      label: "Purchases",    align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "impressions",    label: "Impr.",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "reach",          label: "Reach",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "engagements",    label: "Engagements",  align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "engagementRate", label: "Eng Rate",     align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
];

export function MetaCreative({ metaWin }: Props) {
  const [selectedCreative, setSelectedCreative] = useState<MetaCreativeRow | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [campaignFilter, setCampaignFilter] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("spend");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const creative = (metaWin.creative ?? []) as MetaCreativeRow[];

  const campaignNames = useMemo(
    () => Array.from(new Set(creative.map(c => String(c.campaign ?? "")).filter(Boolean))).sort(),
    [creative]
  );

  const filtered = useMemo(() => {
    let rows = [...creative];
    if (typeFilter === "Video") rows = rows.filter(c => Boolean(c.videoId));
    if (typeFilter === "Image") rows = rows.filter(c => !Boolean(c.videoId));
    if (campaignFilter) rows = rows.filter(c => String(c.campaign ?? "") === campaignFilter);
    const lowerBetter = SORT_OPTIONS.find(o => o.key === sortKey)?.lowerBetter ?? false;
    rows.sort((a, b) => {
      const av = Number(a[sortKey] ?? 0);
      const bv = Number(b[sortKey] ?? 0);
      return lowerBetter ? av - bv : bv - av;
    });
    return rows;
  }, [creative, typeFilter, campaignFilter, sortKey]);

  const tableRows = useMemo(
    () => filtered.map(c => ({ ...c, _type: c.videoId ? "Video" : "Image" })),
    [filtered]
  );

  if (creative.length === 0) {
    return (
      <div className="fade-in dash-card p-8 text-center text-sm" style={{ color: "var(--gaf-text-muted)" }}>
        No creative data available for this window.
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      {/* Header + controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3
          className="text-lg font-bold"
          style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
        >
          Creative Performance
        </h3>
        <span className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>
          {filtered.length} of {creative.length} ad{creative.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Filter / sort / view controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Type filter */}
        <div className="flex items-center gap-1">
          {(["All", "Video", "Image"] as TypeFilter[]).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: typeFilter === t ? "var(--gaf-primary)" : "var(--gaf-primary-light)",
                color: typeFilter === t ? "#fff" : "var(--gaf-primary)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Campaign filter */}
        {campaignNames.length > 0 && (
          <select
            value={campaignFilter}
            onChange={e => setCampaignFilter(e.target.value)}
            className="text-xs rounded border px-2 py-1 max-w-[240px]"
            style={{
              borderColor: "var(--gaf-input-border)",
              color: "var(--gaf-text-primary)",
              background: "var(--gaf-card-bg)",
            }}
            aria-label="Filter by campaign"
          >
            <option value="">All Campaigns</option>
            {campaignNames.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Sort by */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>Rank by:</span>
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            className="text-xs rounded border px-2 py-1"
            style={{
              borderColor: "var(--gaf-card-border)",
              color: "var(--gaf-text-primary)",
              background: "var(--gaf-card-bg)",
            }}
          >
            {SORT_OPTIONS.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 ml-auto">
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

      {/* Cards view */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filtered.map((c, i) => {
            const isVideo = Boolean(c.videoId);
            const name = c.adName ?? c.title ?? "Untitled ad";
            return (
              <div
                key={c.adId ?? i}
                className="dash-card overflow-hidden flex flex-col cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setSelectedCreative(c)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelectedCreative(c); }}
                aria-label={`View details for ${name}`}
              >
                <div className="relative">
                  <Thumbnail url={c.thumbnailUrl || c.imageUrl} alt={String(name)} />
                  <span
                    className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ background: "var(--gaf-primary)" }}
                  >
                    #{i + 1}
                  </span>
                  <span
                    className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{
                      background: isVideo ? "#f3e8ff" : "#dbeafe",
                      color: isVideo ? "#7e22ce" : "#2563eb",
                    }}
                  >
                    {isVideo ? "Video" : "Image"}
                  </span>
                </div>

                <div className="p-3 flex flex-col gap-2 min-w-0">
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold leading-snug line-clamp-2"
                      style={{ color: "var(--gaf-text-primary)" }}
                      title={String(name)}
                    >
                      {String(name)}
                    </p>
                    {Boolean(c.campaign) && (
                      <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--gaf-text-muted)" }} title={String(c.campaign)}>
                        {String(c.campaign)}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <Stat label="Spend" value={fmtCurrency(Number(c.spend ?? 0))} />
                    <Stat label="ROAS" value={fmtRoas(Number(c.roas ?? 0))} />
                    <Stat label="CTR" value={fmtPct(Number(c.ctr ?? 0))} />
                    <Stat label="Purchases" value={fmtInt(Number(c.purchases ?? 0))} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <DataTable<Record<string, unknown>>
          columns={TABLE_COLS}
          rows={tableRows as Record<string, unknown>[]}
          sortable
        />
      )}

      <p className="text-[11px]" style={{ color: "var(--gaf-text-muted)" }}>
        ROAS shown for reference only. Many GAF sales close offline via phone or in-store.
      </p>

      {/* Modal */}
      <MetaCreativeModal
        creative={selectedCreative}
        onClose={() => setSelectedCreative(null)}
      />
    </div>
  );
}
