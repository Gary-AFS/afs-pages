// src/tabs/Axon.tsx
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { TrendChart } from "../components/TrendChart";
import { CaveatBanner } from "../components/CaveatBanner";
import { fmtCurrency, fmtCurrencyCompact, fmtCpc, fmtInt, fmtPct, fmtRoas } from "../lib/format";
import type { PerfData } from "../lib/data";

interface AxonProps {
  data: PerfData;
}

const LEARNING_CAVEAT =
  "Axon (AppLovin) launched 10 Jul 2026 and is in its 3 to 5 day learning phase; early data is thin and noisy. " +
  "Many GAF sales close offline via phone or in-store – ROAS figures are directional only.";

// ---- Column definitions ----
// Feed rows key on `campaign` / `creativeSet` (NOT `name`).

type CampaignRow    = Record<string, unknown>;
type CreativeSetRow = Record<string, unknown>;

const CAMPAIGN_COLS = [
  { key: "campaign",    label: "Campaign",     align: "left"  as const },
  { key: "spend",       label: "Spend",        align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions", label: "Impressions",  align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",      label: "Clicks",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",         label: "CTR",          align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "cpc",         label: "CPC",          align: "right" as const, format: (v: unknown) => (Number(v ?? 0) > 0 ? fmtCpc(Number(v)) : "–") },
  { key: "cpm",         label: "CPM",          align: "right" as const, format: (v: unknown) => (Number(v ?? 0) > 0 ? fmtCpc(Number(v)) : "–") },
  { key: "conversions", label: "Conv.",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "sales",       label: "Sales",        align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "roas",        label: "ROAS",         align: "right" as const, format: (v: unknown) => (Number(v ?? 0) > 0 ? fmtRoas(Number(v)) : "–") },
  { key: "cpa",         label: "CPA",          align: "right" as const, format: (v: unknown) => (Number(v ?? 0) > 0 ? fmtCpc(Number(v)) : "–") },
];

const CREATIVE_SET_COLS = [
  { key: "creativeSet", label: "Creative Set", align: "left"  as const },
  { key: "spend",       label: "Spend",        align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions", label: "Impressions",  align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",      label: "Clicks",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",         label: "CTR",          align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "cpc",         label: "CPC",          align: "right" as const, format: (v: unknown) => (Number(v ?? 0) > 0 ? fmtCpc(Number(v)) : "–") },
  { key: "cpm",         label: "CPM",          align: "right" as const, format: (v: unknown) => (Number(v ?? 0) > 0 ? fmtCpc(Number(v)) : "–") },
  { key: "conversions", label: "Conv.",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
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

export function Axon({ data }: AxonProps) {
  const { window } = useDateRange();

  const axonWin = data.axon?.[window];

  if (!axonWin) {
    return (
      <div className="space-y-4 fade-in">
        <div className="dash-card p-8 text-center text-sm" style={{ color: "var(--gaf-text-muted)" }}>
          No Axon data available for this window.
        </div>
        <CaveatBanner text={LEARNING_CAVEAT} />
      </div>
    );
  }

  const kpis         = axonWin.kpis        ?? {};
  const deltas       = axonWin.deltas      ?? {};
  const campaigns    = (axonWin.campaigns    ?? []) as CampaignRow[];
  const creativeSets = (axonWin.creativeSets ?? []) as CreativeSetRow[];
  const daily        = axonWin.daily        ?? [];

  const hasConversions = Number(kpis.conversions ?? 0) > 0;

  return (
    <div className="space-y-6 fade-in">
      {/* KPI row */}
      <section aria-label="Axon key metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-10 gap-3 stagger">
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
            label="CPC"
            value={fmtCpc(kpis.cpc ?? 0)}
            delta={deltas.cpc ?? null}
            invertDelta
            tooltip="Spend ÷ clicks. Lower is better."
          />
          <KpiCard
            label="CPM"
            value={fmtCpc(kpis.cpm ?? 0)}
            delta={deltas.cpm ?? null}
            invertDelta
            tooltip="Cost per 1,000 impressions. Lower is better."
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
            value={hasConversions ? fmtRoas(kpis.roas ?? 0) : "–"}
            delta={hasConversions ? deltas.roas ?? null : null}
          />
          <KpiCard
            label="CPA"
            value={hasConversions ? fmtCpc(kpis.cpa ?? 0) : "–"}
            delta={hasConversions ? deltas.cpa ?? null : null}
            invertDelta
          />
        </div>
      </section>

      {/* Daily spend trend */}
      {daily.length > 0 && (
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

      {/* Campaigns table */}
      <section aria-label="Campaigns">
        <SectionTitle>Campaigns</SectionTitle>
        <DataTable<CampaignRow>
          columns={CAMPAIGN_COLS}
          rows={campaigns}
          sortable
        />
      </section>

      {/* Creative Sets table */}
      <section aria-label="Creative Sets">
        <SectionTitle>Creative Sets</SectionTitle>
        {creativeSets.length > 0 ? (
          <DataTable<CreativeSetRow>
            columns={CREATIVE_SET_COLS}
            rows={creativeSets}
            sortable
          />
        ) : (
          <p
            className="text-xs italic rounded-lg px-3 py-2"
            style={{ color: "var(--gaf-text-muted)", background: "#f9fafb", border: "1px solid var(--gaf-row-border)" }}
          >
            Creative set data is not yet available. Campaign Management API access is pending – creative-level reporting will appear here once enabled.
          </p>
        )}
      </section>

      <CaveatBanner text={LEARNING_CAVEAT} />
    </div>
  );
}
