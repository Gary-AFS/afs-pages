// src/tabs/meta/MetaCreative.tsx
import { useState } from "react";
import { fmtCurrency, fmtPct, fmtInt, fmtRoas } from "../../lib/format";
import type { MetaWindow, MetaCreativeRow } from "../../lib/data";

interface Props {
  metaWin: MetaWindow;
}

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

export function MetaCreative({ metaWin }: Props) {
  const creative = (metaWin.creative ?? []) as MetaCreativeRow[];

  // Sort by spend desc.
  const sorted = [...creative].sort(
    (a, b) => (Number(b.spend ?? 0)) - (Number(a.spend ?? 0))
  );

  if (sorted.length === 0) {
    return (
      <div className="fade-in dash-card p-8 text-center text-sm" style={{ color: "var(--gaf-text-muted)" }}>
        No creative data available for this window.
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3
          className="text-lg font-bold"
          style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
        >
          Creative Performance
        </h3>
        <span className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>
          {sorted.length} ad{sorted.length === 1 ? "" : "s"} · sorted by spend
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {sorted.map((c, i) => {
          const isVideo = Boolean(c.videoId);
          const name = c.adName ?? c.title ?? "Untitled ad";
          return (
            <div key={c.adId ?? i} className="dash-card overflow-hidden flex flex-col">
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
                <p
                  className="text-xs font-semibold leading-snug line-clamp-2"
                  style={{ color: "var(--gaf-text-primary)" }}
                  title={String(name)}
                >
                  {String(name)}
                </p>
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

      <p className="text-[11px]" style={{ color: "var(--gaf-text-muted)" }}>
        ROAS shown for reference only. Many GAF sales close offline via phone or in-store.
      </p>
    </div>
  );
}
