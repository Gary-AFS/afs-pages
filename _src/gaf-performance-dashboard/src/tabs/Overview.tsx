// src/tabs/Overview.tsx
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { TrendChart } from "../components/TrendChart";
import { CaveatBanner } from "../components/CaveatBanner";
import { fmtCurrency, fmtInt, fmtRoas } from "../lib/format";
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
      ? "bg-amber-400"
      : "bg-gray-500";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 mt-1 ${colour}`}
    />
  );
}

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

  const metaPct = (meta / total) * 100;
  const googlePct = (google / total) * 100;
  const axonPct = (axon / total) * 100;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Channel Spend Split
      </h3>
      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-3">
        {meta > 0 && (
          <div
            className="bg-blue-500"
            style={{ width: `${metaPct}%` }}
            title={`Meta ${fmtCurrency(meta)}`}
          />
        )}
        {google > 0 && (
          <div
            className="bg-emerald-500"
            style={{ width: `${googlePct}%` }}
            title={`Google ${fmtCurrency(google)}`}
          />
        )}
        {axon > 0 && (
          <div
            className="bg-orange-500"
            style={{ width: `${axonPct}%` }}
            title={`Axon ${fmtCurrency(axon)}`}
          />
        )}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
        {meta > 0 && (
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />
            Meta {fmtCurrency(meta)} ({metaPct.toFixed(0)}%)
          </span>
        )}
        {google > 0 && (
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
            Google {fmtCurrency(google)} ({googlePct.toFixed(0)}%)
          </span>
        )}
        {axon > 0 && (
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" />
            Axon {fmtCurrency(axon)} ({axonPct.toFixed(0)}%)
          </span>
        )}
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
      <div className="p-6 text-gray-500 text-sm">
        No overview data available for this window.
      </div>
    );
  }

  const { kpis, deltas = {}, spendSplit, daily } = ov;

  // Spend trend series
  const hasDailyData = daily && daily.length > 0;

  return (
    <div className="p-6 space-y-8">
      {/* KPI row */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Ad Spend"
            value={fmtCurrency(kpis.adSpend ?? 0)}
            delta={deltas.adSpend ?? null}
          />
          <KpiCard
            label="Revenue"
            value={fmtCurrency(kpis.revenue ?? 0)}
            delta={deltas.revenue ?? null}
          />
          <KpiCard
            label="Blended MER"
            value={fmtRoas(kpis.blendedMer ?? 0)}
            delta={deltas.blendedMer ?? null}
          />
          <KpiCard
            label="Sessions"
            value={fmtInt(kpis.sessions ?? 0)}
            delta={deltas.sessions ?? null}
          />
          {kpis.onlineRevenue != null && kpis.onlineRevenue > 0 && (
            <KpiCard
              label="Online Revenue"
              value={fmtCurrency(kpis.onlineRevenue)}
              delta={deltas.onlineRevenue ?? null}
            />
          )}
        </div>
      </section>

      {/* Channel spend split */}
      {spendSplit && (
        <section
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
          aria-label="Channel spend split"
        >
          <SpendSplitBar
            meta={spendSplit.meta ?? 0}
            google={spendSplit.google ?? 0}
            axon={spendSplit.axon ?? 0}
          />
        </section>
      )}

      {/* Daily spend trend */}
      {hasDailyData && (
        <section
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
          aria-label="Daily spend trend"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Daily Spend Trend
          </h3>
          <TrendChart
            data={daily}
            series={{
              areas: [{ key: "spend", color: "#F97316", label: "Ad Spend" }],
            }}
          />
        </section>
      )}

      {/* Anomaly section */}
      {(anomalies.length > 0 || narrative) && (
        <section
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3"
          aria-label="Anomalies and insights"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Anomalies &amp; Insights
          </h3>

          {narrative && (
            <p className="text-sm text-gray-300 leading-relaxed">{narrative}</p>
          )}

          {anomalies.length > 0 && (
            <ul className="space-y-2">
              {anomalies.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <SeverityDot severity={a.severity} />
                  <span
                    className={`text-sm ${
                      a.severity === "high"
                        ? "text-red-300"
                        : a.severity === "medium"
                        ? "text-amber-300"
                        : "text-gray-400"
                    }`}
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
