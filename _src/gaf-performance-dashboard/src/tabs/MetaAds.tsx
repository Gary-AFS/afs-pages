// src/tabs/MetaAds.tsx
import { useState, useCallback } from "react";
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { TrendChart } from "../components/TrendChart";
import { CaveatBanner } from "../components/CaveatBanner";
import { fmtCurrency, fmtInt, fmtPct, fmtRoas } from "../lib/format";
import { refreshMeta } from "../lib/meta-live";
import type { MetaLiveKpis } from "../lib/meta-live";
import type { PerfData } from "../lib/data";

interface MetaAdsProps {
  data: PerfData;
}

const CAVEAT =
  "Many GAF sales close offline via phone or in-store. ROAS figures are directional only - not a performance verdict.";

// ---- Column definitions ----

type CampaignRow = Record<string, unknown>;
type AdSetRow = Record<string, unknown>;
type AdRow = Record<string, unknown>;

const CAMPAIGN_COLS = [
  { key: "name",        label: "Campaign",    align: "left"  as const },
  { key: "spend",       label: "Spend",       align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions", label: "Impressions", align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",      label: "Clicks",      align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",         label: "CTR",         align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "conversions", label: "Conv.",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "roas",        label: "ROAS",        align: "right" as const, format: (v: unknown) => fmtRoas(Number(v ?? 0)) },
];

const ADSET_COLS = [
  { key: "name",        label: "Ad Set",      align: "left"  as const },
  { key: "spend",       label: "Spend",       align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions", label: "Impressions", align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",      label: "Clicks",      align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",         label: "CTR",         align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "conversions", label: "Conv.",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
];

const AD_COLS = [
  { key: "name",        label: "Ad",          align: "left"  as const },
  { key: "spend",       label: "Spend",       align: "right" as const, format: (v: unknown) => fmtCurrency(Number(v ?? 0)) },
  { key: "impressions", label: "Impressions", align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "clicks",      label: "Clicks",      align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "ctr",         label: "CTR",         align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
];

// ---- Live refresh state ----

type LiveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "live"; kpis: MetaLiveKpis; fetchedAt: string }
  | { status: "error"; message: string };

// ---- Helpers ----

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ---- Component ----

export function MetaAds({ data }: MetaAdsProps) {
  const { window } = useDateRange();
  const [liveState, setLiveState] = useState<LiveState>({ status: "idle" });

  const handleRefresh = useCallback(async () => {
    setLiveState({ status: "loading" });
    try {
      const result = await refreshMeta(window);
      setLiveState({ status: "live", kpis: result.kpis, fetchedAt: result.fetchedAt });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Live refresh failed. Showing snapshot.";
      setLiveState({ status: "error", message });
    }
  }, [window]);

  const metaWin = data.meta?.[window];

  if (!metaWin) {
    return (
      <div className="p-6 text-gray-500 text-sm">
        No Meta Ads data available for this window.
      </div>
    );
  }

  // Snapshot values (fallback)
  const snapKpis   = metaWin.kpis      ?? {};
  const deltas     = metaWin.deltas    ?? {};
  const campaigns  = (metaWin.campaigns ?? []) as CampaignRow[];
  const adsets     = (metaWin.adsets   ?? []) as AdSetRow[];
  const ads        = (metaWin.ads      ?? []) as AdRow[];
  const daily      = metaWin.daily     ?? [];

  // Use live KPIs when available, otherwise fall back to snapshot
  const kpis: Record<string, number> =
    liveState.status === "live" ? (liveState.kpis as unknown as Record<string, number>) : snapKpis;

  const isLive     = liveState.status === "live";
  const isLoading  = liveState.status === "loading";

  return (
    <div className="p-6 space-y-8">
      {/* Tab header: title + Refresh live button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Meta Ads
          </h2>
          {isLive && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/25"
              aria-label={`Live data as of ${fmtTime(liveState.fetchedAt)}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" aria-hidden="true" />
              Live as of {fmtTime(liveState.fetchedAt)}
            </span>
          )}
          {liveState.status === "error" && (
            <span className="text-xs text-red-400 truncate max-w-xs" role="alert">
              {liveState.message.length > 80
                ? liveState.message.slice(0, 77) + "..."
                : liveState.message}
            </span>
          )}
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label={isLoading ? "Refreshing live Meta data..." : "Refresh live Meta data"}
          className={[
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold",
            "border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500/50",
            isLoading
              ? "border-gray-700 bg-gray-800/40 text-gray-500 cursor-not-allowed"
              : "border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/60 cursor-pointer",
          ].join(" ")}
        >
          {isLoading ? (
            <>
              <svg
                className="w-3 h-3 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg
                className="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh live
            </>
          )}
        </button>
      </div>

      {/* KPI row */}
      <section aria-label="Meta Ads key metrics">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <KpiCard
            label="Spend"
            value={fmtCurrency(kpis.spend ?? 0)}
            delta={isLive ? null : (deltas.spend ?? null)}
          />
          <KpiCard
            label="Impressions"
            value={fmtInt(kpis.impressions ?? 0)}
            delta={isLive ? null : (deltas.impressions ?? null)}
          />
          <KpiCard
            label="Clicks"
            value={fmtInt(kpis.clicks ?? 0)}
            delta={isLive ? null : (deltas.clicks ?? null)}
          />
          <KpiCard
            label="CTR"
            value={fmtPct(kpis.ctr ?? 0)}
            delta={isLive ? null : (deltas.ctr ?? null)}
          />
          <KpiCard
            label="Conversions"
            value={fmtInt(kpis.conversions ?? 0)}
            delta={isLive ? null : (deltas.conversions ?? null)}
          />
          <KpiCard
            label="Conv Value"
            value={fmtCurrency(kpis.convValue ?? 0)}
            delta={isLive ? null : (deltas.convValue ?? null)}
          />
          <KpiCard
            label="ROAS"
            value={fmtRoas(kpis.roas ?? 0)}
            delta={isLive ? null : (deltas.roas ?? null)}
          />
          <KpiCard
            label="CPM"
            value={fmtCurrency(kpis.cpm ?? 0)}
            delta={isLive ? null : (deltas.cpm ?? null)}
          />
        </div>
      </section>

      {/* Daily spend trend (snapshot -- not swapped on live refresh) */}
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

      {/* Campaigns table (snapshot) */}
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

      {/* Ad Sets table (snapshot) */}
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

      {/* Ads table (snapshot) */}
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
