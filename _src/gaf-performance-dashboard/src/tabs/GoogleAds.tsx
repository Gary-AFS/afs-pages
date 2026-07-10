// src/tabs/GoogleAds.tsx
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { TrendChart } from "../components/TrendChart";
import { CaveatBanner } from "../components/CaveatBanner";
import { fmtCurrency, fmtInt, fmtPct, fmtRoas } from "../lib/format";
import type { PerfData } from "../lib/data";

interface GoogleAdsProps {
  data: PerfData;
}

const CAVEAT =
  "Many GAF sales close offline via phone or in-store. ROAS and conversion figures are directional only – not a performance verdict.";

// ---- Column definitions ----

type CampaignRow  = Record<string, unknown>;
type AdGroupRow   = Record<string, unknown>;
type KeywordRow   = Record<string, unknown>;
type SearchTermRow = Record<string, unknown>;
type AdRow        = Record<string, unknown>;

const CAMPAIGN_COLS = [
  { key: "name",          label: "Campaign",      align: "left"  as const },
  { key: "spend",         label: "Spend",         align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions",   label: "Impressions",   align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",        label: "Clicks",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",           label: "CTR",           align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "avgCpc",        label: "Avg CPC",       align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "conversions",   label: "Conv.",         align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "roas",          label: "ROAS",          align: "right" as const, format: (v: unknown) => fmtRoas(Number(v ?? 0)) },
];

const ADGROUP_COLS = [
  { key: "name",          label: "Ad Group",      align: "left"  as const },
  { key: "spend",         label: "Spend",         align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions",   label: "Impressions",   align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",        label: "Clicks",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",           label: "CTR",           align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "conversions",   label: "Conv.",         align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
];

const KEYWORD_COLS = [
  { key: "keyword",       label: "Keyword",       align: "left"  as const },
  { key: "matchType",     label: "Match",         align: "left"  as const },
  { key: "spend",         label: "Spend",         align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions",   label: "Impressions",   align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",        label: "Clicks",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",           label: "CTR",           align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "conversions",   label: "Conv.",         align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
];

const SEARCH_TERM_COLS = [
  { key: "searchTerm",    label: "Search Term",   align: "left"  as const },
  { key: "impressions",   label: "Impressions",   align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",        label: "Clicks",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",           label: "CTR",           align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "conversions",   label: "Conv.",         align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
];

const AD_COLS = [
  { key: "name",          label: "Ad",            align: "left"  as const },
  { key: "spend",         label: "Spend",         align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions",   label: "Impressions",   align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",        label: "Clicks",        align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",           label: "CTR",           align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
];

// ---- Component ----

export function GoogleAds({ data }: GoogleAdsProps) {
  const { window } = useDateRange();

  const googleWin = data.google?.[window];

  if (!googleWin) {
    return (
      <div className="p-6 text-gray-500 text-sm">
        No Google Ads data available for this window.
      </div>
    );
  }

  const kpis        = googleWin.kpis        ?? {};
  const deltas      = googleWin.deltas      ?? {};
  const campaigns   = (googleWin.campaigns  ?? []) as CampaignRow[];
  const adGroups    = (googleWin.adGroups   ?? []) as AdGroupRow[];
  const keywords    = (googleWin.keywords   ?? []) as KeywordRow[];
  const searchTerms = (googleWin.searchTerms ?? []) as SearchTermRow[];
  const ads         = (googleWin.ads        ?? []) as AdRow[];
  const daily       = googleWin.daily       ?? [];

  return (
    <div className="p-6 space-y-8">
      {/* KPI row */}
      <section aria-label="Google Ads key metrics">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
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
            label="Avg CPC"
            value={fmtCurrency(kpis.avgCpc ?? 0)}
            delta={deltas.avgCpc ?? null}
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
            label="CPA"
            value={fmtCurrency(kpis.cpa ?? 0)}
            delta={deltas.cpa ?? null}
          />
          <KpiCard
            label="Add to Cart"
            value={fmtInt(kpis.atc ?? 0)}
            delta={deltas.atc ?? null}
          />
          <KpiCard
            label="ATC Rate"
            value={fmtPct(kpis.atcRate ?? 0)}
            delta={deltas.atcRate ?? null}
          />
          <KpiCard
            label="Search Impr Share"
            value={fmtPct(kpis.searchImprShare ?? 0)}
            delta={deltas.searchImprShare ?? null}
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

      {/* Ad Groups table */}
      {adGroups.length > 0 && (
        <section aria-label="Ad Groups">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Ad Groups
          </h3>
          <DataTable<AdGroupRow>
            columns={ADGROUP_COLS}
            rows={adGroups}
            sortable
          />
        </section>
      )}

      {/* Keywords table */}
      {keywords.length > 0 && (
        <section aria-label="Keywords">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Keywords
          </h3>
          <DataTable<KeywordRow>
            columns={KEYWORD_COLS}
            rows={keywords}
            sortable
          />
        </section>
      )}

      {/* Search Terms table */}
      {searchTerms.length > 0 && (
        <section aria-label="Search Terms">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Search Terms
          </h3>
          <DataTable<SearchTermRow>
            columns={SEARCH_TERM_COLS}
            rows={searchTerms}
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
