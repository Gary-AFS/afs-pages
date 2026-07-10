// src/tabs/WebsiteTraffic.tsx
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { TrendChart } from "../components/TrendChart";
import { AustraliaMap } from "../components/AustraliaMap";
import { fmtCompact, fmtInt, fmtPct, fmtCurrency } from "../lib/format";
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
  // Feed sends bounceRate as a FRACTION (0.0683) — display as 6.8%, not 0.1%
  { key: "bounceRate",         label: "Bounce Rate",    align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0) * 100) },
];

const PRODUCT_COLS = [
  { key: "title",    label: "Product",       align: "left"  as const },
  { key: "sessions", label: "Sessions",      align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "atc",      label: "Add-to-Carts",  align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "orders",   label: "Orders",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "revenue",  label: "Revenue",       align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  // null CVR = GA4 has no session data for the page — show a dash, not 0.0%
  { key: "cvr",      label: "CVR",           align: "right" as const, format: (v: unknown) => (v == null ? "–" : `${Number(v).toFixed(1)}%`) },
];

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

// ---- Component ----

export function WebsiteTraffic({ data }: WebsiteTrafficProps) {
  const { window } = useDateRange();

  const ga4Win = data.ga4?.[window];
  const products = (data.products?.[window] ?? []) as unknown as ProductRow[];

  if (!ga4Win) {
    return (
      <div className="dash-card p-8 text-center text-sm" style={{ color: "var(--gaf-text-muted)" }}>
        No website traffic data available for this window.
      </div>
    );
  }

  const { kpis, deltas = {}, channels = [], topPages = [], geo: geoRaw = [], daily = [] } = ga4Win;
  const geo = geoRaw as unknown as Array<{ region: string; sessions: number }>;

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
    <div className="space-y-6 fade-in">
      {/* GA4 KPI row */}
      <section aria-label="Website traffic key metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger">
          <KpiCard
            label="Sessions"
            value={fmtInt(kpis?.sessions ?? 0)}
            delta={deltas.sessions ?? null}
            tooltip="GA4 sessions in the selected window."
          />
          <KpiCard
            label="Active Users"
            value={fmtInt(kpis?.activeUsers ?? 0)}
            delta={deltas.activeUsers ?? null}
            tooltip="Users with an engaged session."
          />
          <KpiCard
            label="New Users"
            value={fmtInt(kpis?.newUsers ?? 0)}
            delta={deltas.newUsers ?? null}
            tooltip="First-time visitors."
          />
          <KpiCard
            label="Engagement Rate"
            value={fmtPct((kpis?.engagementRate ?? 0) * 100)}
            delta={deltas.engagementRate ?? null}
            tooltip="Engaged sessions ÷ total sessions."
          />
          <KpiCard
            label="Avg. Engagement"
            value={engTimeLabel}
            delta={deltas.avgEngagementTime ?? null}
            tooltip="Average session duration."
          />
          <KpiCard
            label="Conversions"
            value={fmtInt(kpis?.conversions ?? 0)}
            delta={deltas.conversions ?? null}
            tooltip="GA4 key events (conversions) in the window."
          />
        </div>
      </section>

      {/* Daily sessions trend */}
      {hasDailyData && (
        <section className="dash-card p-5" aria-label="Daily sessions trend">
          <SectionTitle>Daily Sessions</SectionTitle>
          <TrendChart
            data={daily}
            series={{
              areas: [{ key: "sessions", color: "var(--gaf-primary)", label: "Sessions", format: fmtCompact }],
            }}
          />
        </section>
      )}

      {/* Source / Channel table */}
      <section aria-label="Traffic channels">
        <SectionTitle>Source / Channel</SectionTitle>
        <DataTable<ChannelRow>
          columns={CHANNEL_COLS}
          rows={channelRows}
          sortable
        />
      </section>

      {/* Top Pages table */}
      <section aria-label="Top pages">
        <SectionTitle>Top Pages</SectionTitle>
        <DataTable<PageRow>
          columns={PAGE_COLS}
          rows={pageRows}
          sortable
        />
      </section>

      {/* Australia geo map */}
      <section className="dash-card p-5" aria-label="Sessions by Australian state">
        <SectionTitle>Sessions by State</SectionTitle>
        <AustraliaMap geo={geo} />
      </section>

      {/* Top Products funnel */}
      <section aria-label="Top products funnel">
        <SectionTitle>Top Products (Sessions &rarr; ATC &rarr; Orders)</SectionTitle>
        <DataTable<ProductRow>
          columns={PRODUCT_COLS}
          rows={products}
          sortable
        />
        <p className="text-xs mt-2" style={{ color: "var(--gaf-text-muted)" }}>
          Sessions and add-to-carts join from GA4's top pages; a dash means GA4 recorded no page-level data for that product in this window.
        </p>
      </section>
    </div>
  );
}
