// src/tabs/meta/MetaVideo.tsx
import { fmtCurrency, fmtInt, fmtPct } from "../../lib/format";
import type { MetaWindow, MetaVideoRow } from "../../lib/data";

interface Props {
  metaWin: MetaWindow;
}

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

export function MetaVideo({ metaWin }: Props) {
  const video = (metaWin.video ?? []) as MetaVideoRow[];

  // Only show ads with actual video activity; sort by spend desc.
  const withPlays = video.filter((v) => Number(v.videoPlays ?? 0) > 0);
  const sorted = [...withPlays].sort(
    (a, b) => Number(b.spend ?? 0) - Number(a.spend ?? 0)
  );

  if (sorted.length === 0) {
    return (
      <div className="fade-in dash-card p-8 text-center text-sm" style={{ color: "var(--gaf-text-muted)" }}>
        No video retention data available for this window.
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
          Video Performance
        </h3>
        <span className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>
          {sorted.length} video ad{sorted.length === 1 ? "" : "s"} · sorted by spend
        </span>
      </div>

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

            <div className="flex flex-col gap-1.5 mt-1">
              <RetentionBar label="25%" pct={Number(v.p25Rate ?? 0)} />
              <RetentionBar label="50%" pct={Number(v.p50Rate ?? 0)} />
              <RetentionBar label="75%" pct={Number(v.p75Rate ?? 0)} />
              <RetentionBar label="100%" pct={Number(v.p100Rate ?? 0)} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px]" style={{ color: "var(--gaf-text-muted)" }}>
        Retention rates are the percentage of video plays reaching each quartile.{" "}
        <span style={{ color: "var(--gaf-delta-pos)" }}>Green</span> ≥50%,{" "}
        <span style={{ color: "#d97706" }}>amber</span> ≥25%,{" "}
        <span style={{ color: "var(--gaf-delta-neg)" }}>red</span> &lt;25%.
      </p>
    </div>
  );
}
