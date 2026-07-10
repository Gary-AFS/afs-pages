// src/tabs/WebsiteTraffic.tsx
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { TrendChart } from "../components/TrendChart";
import { AustraliaMap } from "../components/AustraliaMap";
import { fmtInt, fmtPct, fmtCurrency } from "../lib/format";
import type { PerfData } from "../lib/data";

interface WebsiteTrafficProps {
  data: PerfData;
}

// ---- Column definitions ----

type ChannelRow = Record<string, unknown>;
type PageRow = Record<string, unknown>;
type ProductRow = Record<string, unknown>;

const CHANNEL_COLS = [
  { key: "channel",     label: "Source / Channel", align: "left"  as const },
  { key: "sessions",    label: "Sessions",          align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "conversions", label: "Conversions",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
];

const PAGE_COLS = [
  { key: "path",               label: "Page",           align: "left"  as const },
  { key: "sessions",           label: "Sessions",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "views",              label: "Page Views",     align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "avgEngagementTime",  label: "Avg. Time (s)",  align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "bounceRate",         label: "Bounce Rate",    align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
];

const PRODUCT_COLS = [
  { key: "title",    label: "Product",       align: "left"  as const },
  { key: "sessions", label: "Sessions",      align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "atc",      label: "Add-to-Carts",  align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "orders",   label: "Orders",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "revenue",  label: "Revenue",       align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "cvr",      label: "CVR",           align: "right" as const, format: (v: unknown) => `${Number(v ?? 0).toFixed(1)}%` },
];

// ---- Component ----

export function WebsiteTraffic({ data }: WebsiteTrafficProps) {
  const { window } = useDateRange();

  const ga4Win = data.ga4?.[window];
  const products = (data.products?.[window] ?? []) as ProductRow[];

  if (!ga4Win) {
    return (
      <div className="p-6 text-gray-500 text-sm">
        No website traffic data available for this window.
      </div>
    );
  }

  const { kpis, deltas = {}, channels = [], topPages = [], geo = [], daily = [] } = ga4Win;

  const channelRows = (Array.isArray(channels) ? channels : Object.values(channels)) as ChannelRow[];
  const pageRows = topPages as PageRow[];
  const hasDailyData = Array.isArray(daily) && daily.length > 0;

  // Format avg engagement time: seconds -> "1m 23s" style for KPI display
  const avgEngSec = kpis?.avgEngagementTime ?? 0;
  const engTimeLabel =
    avgEngSec >= 60
      ? `${Math.floor(avgEngSec / 60)}m ${Math.round(avgEngSec % 60)}s`
      : `${Math.round(avgEngSec)}s`;

  return (
    <div className="p-6 space-y-8">
      {/* GA4 KPI row */}
      <section aria-label="Website traffic key metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard
            label="Sessions"
            value={fmtInt(kpis?.sessions ?? 0)}
            delta={deltas.sessions ?? null}
          />
          <KpiCard
            label="Active Users"
            value={fmtInt(kpis?.activeUsers ?? 0)}
            delta={deltas.activeUsers ?? null}
          />
          <KpiCard
            label="New Users"
            value={fmtInt(kpis?.newUsers ?? 0)}
            delta={deltas.newUsers ?? null}
          />
          <KpiCard
            label="Engagement Rate"
            value={fmtPct((kpis?.engagementRate ?? 0) * 100)}
            delta={deltas.engagementRate ?? null}
          />
          <KpiCard
            label="Avg. Engagement"
            value={engTimeLabel}
            delta={deltas.avgEngagementTime ?? null}
          />
          <KpiCard
            label="Conversions"
            value={fmtInt(kpis?.conversions ?? 0)}
            delta={deltas.conversions ?? null}
          />
        </div>
      </section>

      {/* Daily sessions trend */}
      {hasDailyData && (
        <section
          className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
          aria-label="Daily sessions trend"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Daily Sessions
          </h3>
          <TrendChart
            data={daily}
            series={{
              areas: [{ key: "sessions", color: "#F97316", label: "Sessions" }],
            }}
          />
        </section>
      )}

      {/* Source / Channel table */}
      <section
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
        aria-label="Traffic channels"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Source / Channel
        </h3>
        <DataTable<ChannelRow>
          columns={CHANNEL_COLS}
          rows={channelRows}
          sortable
        />
      </section>

      {/* Top Pages table */}
      <section
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
        aria-label="Top pages"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Top Pages
        </h3>
        <DataTable<PageRow>
          columns={PAGE_COLS}
          rows={pageRows}
          sortable
        />
      </section>

      {/* Australia geo map */}
      <section
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
        aria-label="Sessions by Australian state"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Sessions by State
        </h3>
        <AustraliaMap geo={geo} />
      </section>

      {/* Top Products funnel */}
      <section
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
        aria-label="Top products funnel"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Top Products (Sessions &rarr; ATC &rarr; Orders)
        </h3>
        <DataTable<ProductRow>
          columns={PRODUCT_COLS}
          rows={products}
          sortable
        />
      </section>
    </div>
  );
}
