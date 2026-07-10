// src/tabs/MetaAds.tsx
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { TrendChart } from "../components/TrendChart";
import { CaveatBanner } from "../components/CaveatBanner";
import { fmtCurrency, fmtInt, fmtPct, fmtRoas } from "../lib/format";
import type { PerfData } from "../lib/data";

interface MetaAdsProps {
  data: PerfData;
}

const CAVEAT =
  "Many GAF sales close offline via phone or in-store. ROAS figures are directional only – not a performance verdict.";

// ---- Column definitions ----

type CampaignRow = Record<string, unknown>;
type AdSetRow = Record<string, unknown>;
type AdRow = Record<string, unknown>;

const CAMPAIGN_COLS = [
  { key: "name",       label: "Campaign",   align: "left"  as const },
  { key: "spend",      label: "Spend",      align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions",label: "Impressions",align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",     label: "Clicks",     align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",        label: "CTR",        align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "conversions",label: "Conv.",      align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "roas",       label: "ROAS",       align: "right" as const, format: (v: unknown) => fmtRoas(Number(v ?? 0)) },
];

const ADSET_COLS = [
  { key: "name",       label: "Ad Set",     align: "left"  as const },
  { key: "spend",      label: "Spend",      align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions",label: "Impressions",align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",     label: "Clicks",     align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",        label: "CTR",        align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "conversions",label: "Conv.",      align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
];

const AD_COLS = [
  { key: "name",       label: "Ad",         align: "left"  as const },
  { key: "spend",      label: "Spend",      align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions",label: "Impressions",align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",     label: "Clicks",     align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",        label: "CTR",        align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
];

// ---- Component ----

export function MetaAds({ data }: MetaAdsProps) {
  const { window } = useDateRange();

  const metaWin = data.meta?.[window];

  if (!metaWin) {
    return (
      <div className="p-6 text-gray-500 text-sm">
        No Meta Ads data available for this window.
      </div>
    );
  }

  const kpis      = metaWin.kpis      ?? {};
  const deltas    = metaWin.deltas    ?? {};
  const campaigns = (metaWin.campaigns ?? []) as CampaignRow[];
  const adsets    = (metaWin.adsets   ?? []) as AdSetRow[];
  const ads       = (metaWin.ads      ?? []) as AdRow[];
  const daily     = metaWin.daily     ?? [];

  return (
    <div className="p-6 space-y-8">
      {/* KPI row */}
      <section aria-label="Meta Ads key metrics">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <KpiCard
            label="Spend"
            value={fmtCurrency(kpis.spend ?? 0)}
            delta={deltas.spend ?? null}
          />
          <KpiCard
            label="Impressions"
            value={fmtInt(kpis.impressions ?? 0)}
            delta={deltas.impressions ?? null}
          />
          <KpiCard
            label="Clicks"
            value={fmtInt(kpis.clicks ?? 0)}
            delta={deltas.clicks ?? null}
          />
          <KpiCard
            label="CTR"
            value={fmtPct(kpis.ctr ?? 0)}
            delta={deltas.ctr ?? null}
          />
          <KpiCard
            label="Conversions"
            value={fmtInt(kpis.conversions ?? 0)}
            delta={deltas.conversions ?? null}
          />
          <KpiCard
            label="Conv Value"
            value={fmtCurrency(kpis.convValue ?? 0)}
            delta={deltas.convValue ?? null}
          />
          <KpiCard
            label="ROAS"
            value={fmtRoas(kpis.roas ?? 0)}
            delta={deltas.roas ?? null}
          />
          <KpiCard
            label="CPM"
            value={fmtCurrency(kpis.cpm ?? 0)}
            delta={deltas.cpm ?? null}
          />
        </div>
      </section>

      {/* Daily spend trend */}
      {daily.length > 0 && (
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

      {/* Campaigns table */}
      <section aria-label="Campaigns">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Campaigns
        </h3>
        <DataTable<CampaignRow>
          columns={CAMPAIGN_COLS}
          rows={campaigns}
          sortable
        />
      </section>

      {/* Ad Sets table */}
      {adsets.length > 0 && (
        <section aria-label="Ad Sets">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Ad Sets
          </h3>
          <DataTable<AdSetRow>
            columns={ADSET_COLS}
            rows={adsets}
            sortable
          />
        </section>
      )}

      {/* Ads table */}
      {ads.length > 0 && (
        <section aria-label="Ads">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Ads
          </h3>
          <DataTable<AdRow>
            columns={AD_COLS}
            rows={ads}
            sortable
          />
        </section>
      )}

      <CaveatBanner text={CAVEAT} />
    </div>
  );
}
