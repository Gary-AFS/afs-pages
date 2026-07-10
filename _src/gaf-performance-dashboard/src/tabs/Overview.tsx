// src/tabs/Overview.tsx
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { TrendChart } from "../components/TrendChart";
import { CaveatBanner } from "../components/CaveatBanner";
import { fmtCurrency, fmtCurrencyCompact, fmtInt, fmtRoas } from "../lib/format";
import type { PerfData, Anomaly } from "../lib/data";

interface OverviewProps {
  data: PerfData;
}

const CAVEAT =
  "Blended MER uses total Shopify revenue against total ad spend. " +
  "Many GAF sales close offline by phone, so treat channel-level ROAS as directional, not a verdict.";

function SeverityDot({ severity }: { severity: Anomaly["severity"] }) {
  const colour =
    severity === "high"
      ? "bg-red-500"
      : severity === "medium"
      ? "bg-amber-500"
      : "bg-gray-400";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${colour}`}
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-lg font-bold mb-3"
      style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
    >
      {children}
    </h3>
  );
}

const SPLIT_COLOURS: Record<string, string> = {
  meta: "#1877F2",              // Meta blue
  google: "#34A853",            // Google green
  axon: "var(--gaf-primary)",   // brand orange
};

function SpendSplitBar({
  meta,
  google,
  axon,
}: {
  meta: number;
  google: number;
  axon: number;
}) {
  const total = meta + google + axon;
  if (total === 0) return null;

  const entries = [
    { key: "meta", label: "Meta", value: meta },
    { key: "google", label: "Google", value: google },
    { key: "axon", label: "Axon", value: axon },
  ].filter(e => e.value > 0);

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-3" style={{ background: "var(--gaf-row-border)" }}>
        {entries.map(e => (
          <div
            key={e.key}
            style={{ width: `${(e.value / total) * 100}%`, background: SPLIT_COLOURS[e.key] }}
            title={`${e.label} ${fmtCurrency(e.value)}`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ color: "var(--gaf-text-secondary)" }}>
        {entries.map(e => (
          <span key={e.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: SPLIT_COLOURS[e.key] }} />
            {e.label}{" "}
            <span className="font-semibold tabular-nums" style={{ color: "var(--gaf-text-primary)" }}>
              {fmtCurrency(e.value)}
            </span>
            <span style={{ color: "var(--gaf-text-muted)" }}>({((e.value / total) * 100).toFixed(0)}%)</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Overview({ data }: OverviewProps) {
  const { window } = useDateRange();

  const ov = data.overview?.[window];
  const anomalies = data.anomalies?.[window] ?? [];
  const narrative = data.narrative?.[window] ?? null;

  if (!ov) {
    return (
      <div className="dash-card p-8 text-center text-sm" style={{ color: "var(--gaf-text-muted)" }}>
        No overview data available for this window.
      </div>
    );
  }

  const { kpis, deltas = {}, spendSplit, daily } = ov;

  // Spend trend series
  const hasDailyData = daily && daily.length > 0;

  return (
    <div className="space-y-6 fade-in">
      {/* KPI row */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
          <KpiCard
            label="Ad Spend"
            value={fmtCurrency(kpis.adSpend ?? 0)}
            delta={deltas.adSpend ?? null}
            tooltip="Meta + Google + Axon spend for the selected window."
          />
          <KpiCard
            label="Revenue"
            value={fmtCurrency(kpis.revenue ?? 0)}
            delta={deltas.revenue ?? null}
            tooltip="Total Shopify revenue — includes offline/phone orders GA4 misses."
          />
          <KpiCard
            label="Blended MER"
            value={fmtRoas(kpis.blendedMer ?? 0)}
            delta={deltas.blendedMer ?? null}
            tooltip="Marketing efficiency ratio — total Shopify revenue ÷ total ad spend."
          />
          <KpiCard
            label="Sessions"
            value={fmtInt(kpis.sessions ?? 0)}
            delta={deltas.sessions ?? null}
            tooltip="GA4 website sessions."
          />
          {kpis.onlineRevenue != null && kpis.onlineRevenue > 0 && (
            <KpiCard
              label="Online Revenue"
              value={fmtCurrency(kpis.onlineRevenue)}
              delta={deltas.onlineRevenue ?? null}
              tooltip="GA4 online-attributed revenue, shown for reference against total Shopify revenue."
            />
          )}
        </div>
      </section>

      {/* Channel spend split */}
      {spendSplit && (
        <section className="dash-card p-5" aria-label="Channel spend split">
          <SectionTitle>Channel Spend Split</SectionTitle>
          <SpendSplitBar
            meta={spendSplit.meta ?? 0}
            google={spendSplit.google ?? 0}
            axon={spendSplit.axon ?? 0}
          />
        </section>
      )}

      {/* Daily spend trend */}
      {hasDailyData && (
        <section className="dash-card p-5" aria-label="Daily spend trend">
          <SectionTitle>Daily Spend Trend</SectionTitle>
          <TrendChart
            data={daily}
            series={{
              areas: [{ key: "spend", color: "var(--gaf-primary)", label: "Ad Spend", format: fmtCurrencyCompact }],
            }}
          />
        </section>
      )}

      {/* Anomaly section */}
      {(anomalies.length > 0 || narrative) && (
        <section className="dash-card p-5 space-y-3" aria-label="Anomalies and insights">
          <SectionTitle>Anomalies &amp; Insights</SectionTitle>

          {narrative && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--gaf-text-secondary)" }}>
              {narrative}
            </p>
          )}

          {anomalies.length > 0 && (
            <ul className="space-y-2">
              {anomalies.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <SeverityDot severity={a.severity} />
                  <span
                    className="text-sm"
                    style={{
                      color:
                        a.severity === "high"
                          ? "#b91c1c"
                          : a.severity === "medium"
                          ? "#b45309"
                          : "var(--gaf-text-secondary)",
                    }}
                  >
                    {a.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Caveat banner */}
      <CaveatBanner text={CAVEAT} />
    </div>
  );
}
