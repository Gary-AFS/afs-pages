// src/tabs/Axon.tsx
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { TrendChart } from "../components/TrendChart";
import { CaveatBanner } from "../components/CaveatBanner";
import { fmtCurrency, fmtInt, fmtPct, fmtRoas } from "../lib/format";
import type { PerfData } from "../lib/data";

interface AxonProps {
  data: PerfData;
}

const LEARNING_CAVEAT =
  "Axon (AppLovin) launched 10 Jul 2026 and is in its 3 to 5 day learning phase; early data is thin and noisy. The 90 day view is limited by AppLovin's data retention. Many GAF sales close offline via phone or in-store – ROAS figures are directional only.";

// ---- Column definitions ----

type CampaignRow   = Record<string, unknown>;
type CreativeSetRow = Record<string, unknown>;

const CAMPAIGN_COLS = [
  { key: "name",        label: "Campaign",     align: "left"  as const },
  { key: "spend",       label: "Spend",        align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions", label: "Impressions",  align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",      label: "Clicks",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",         label: "CTR",          align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "conversions", label: "Conv.",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "sales",       label: "Sales",        align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "roas",        label: "ROAS",         align: "right" as const, format: (v: unknown) => fmtRoas(Number(v ?? 0)) },
  { key: "cpa",         label: "CPA",          align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
];

const CREATIVE_SET_COLS = [
  { key: "name",        label: "Creative Set", align: "left"  as const },
  { key: "spend",       label: "Spend",        align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions", label: "Impressions",  align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",      label: "Clicks",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",         label: "CTR",          align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "conversions", label: "Conv.",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
];

// ---- Component ----

export function Axon({ data }: AxonProps) {
  const { window } = useDateRange();

  const axonWin = data.axon?.[window];

  if (!axonWin) {
    return (
      <div className="p-6 space-y-4">
        <div className="p-4 text-gray-500 text-sm bg-gray-800/50 border border-gray-700 rounded-xl">
          No Axon data available for this window. Axon (AppLovin) launched 10 Jul 2026 – the 90 day window is outside AppLovin's data retention period.
        </div>
        <CaveatBanner text={LEARNING_CAVEAT} />
      </div>
    );
  }

  const kpis        = axonWin.kpis        ?? {};
  const deltas      = axonWin.deltas      ?? {};
  const campaigns   = (axonWin.campaigns   ?? []) as CampaignRow[];
  const creativeSets = (axonWin.creativeSets ?? []) as CreativeSetRow[];
  const daily       = axonWin.daily        ?? [];

  return (
    <div className="p-6 space-y-8">
      {/* KPI row */}
      <section aria-label="Axon key metrics">
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
            label="Sales"
            value={fmtCurrency(kpis.sales ?? 0)}
            delta={deltas.sales ?? null}
          />
          <KpiCard
            label="ROAS"
            value={fmtRoas(kpis.roas ?? 0)}
            delta={deltas.roas ?? null}
          />
          <KpiCard
            label="CPA"
            value={fmtCurrency(kpis.cpa ?? 0)}
            delta={deltas.cpa ?? null}
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

      {/* Creative Sets table */}
      <section aria-label="Creative Sets">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Creative Sets
        </h3>
        {creativeSets.length > 0 ? (
          <DataTable<CreativeSetRow>
            columns={CREATIVE_SET_COLS}
            rows={creativeSets}
            sortable
          />
        ) : (
          <p className="text-xs text-gray-500 italic bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
            Creative set data is not yet available. Campaign Management API access is pending – creative-level reporting will appear here once enabled.
          </p>
        )}
      </section>

      <CaveatBanner text={LEARNING_CAVEAT} />
    </div>
  );
}
