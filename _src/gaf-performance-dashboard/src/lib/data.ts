import { useState, useEffect } from "react";

export type Window = "yesterday" | "7d" | "30d" | "90d";

const FEED_URL =
  "https://gaf-perf-dashboard.pages.dev/gaf-performance-data.json";

// ----- KPI shapes -----

export interface OverviewKpis {
  adSpend: number;
  revenue: number;
  blendedMer: number;
  sessions: number;
  onlineRevenue: number;
}

export interface SpendSplit {
  meta: number;
  google: number;
  axon: number;
}

export interface DailyPoint {
  date: string;
  [key: string]: number | string;
}

export interface OverviewWindow {
  kpis: OverviewKpis;
  deltas: Record<string, number | null>;
  spendSplit: SpendSplit;
  daily: DailyPoint[];
}

export interface Ga4Kpis {
  sessions: number;
  activeUsers: number;
  newUsers: number;
  engagementRate: number;
  avgEngagementTime: number;
  conversions: number;
  totalRevenue: number;
}

export interface Ga4Window {
  kpis: Ga4Kpis;
  deltas: Record<string, number | null>;
  channels: Record<string, any>;
  topPages: Record<string, any>[];
  geo: Record<string, any>[];
  itemAtc: Record<string, any>[];
  daily: DailyPoint[];
}

export interface HubspotKpis {
  totalSends: number;
  avgOpenRate: number;
  avgCtr: number;
  totalRevenue: number;
}

export interface HubspotWindow {
  kpis: HubspotKpis;
  sends: Record<string, any>[];
}

export interface ShopifyKpis {
  orders: number;
  units: number;
  revenue: number;
}

export interface ShopifyWindow {
  kpis: ShopifyKpis;
  products: Record<string, any>[];
}

export interface ProductRow {
  handle: string;
  title: string;
  sessions: number;
  atc: number;
  orders: number;
  revenue: number;
  cvr: number;
}

export interface Anomaly {
  metric: string;
  channel: string;
  direction: "up" | "down";
  magnitudePct: number;
  severity: "low" | "medium" | "high";
  label: string;
}

// ----- Meta Ads shapes (per shape doc 2026-07-11) -----

/** 19-key KPI set for a Meta window. All fields optional/guarded. */
export interface MetaKpis {
  spend?: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  conversions?: number;
  convValue?: number;
  purchases?: number;
  purchaseValue?: number;
  roas?: number;
  outboundClicks?: number;
  outboundCtr?: number;
  landingPageViews?: number;
  addToCart?: number;
  atcRate?: number;
  cpa?: number;
  costPerAtc?: number;
}

/** Row in campaigns / adsets / ads arrays — all KPI fields plus identity. */
export interface MetaEntityRow extends MetaKpis {
  campaignId?: string;
  campaign?: string;
  objective?: string;
  adsetId?: string;
  adset?: string;
  adId?: string;
  ad?: string;
  [key: string]: unknown;
}

export interface MetaDailyPoint {
  date: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  convValue?: number;
  [key: string]: number | string | undefined;
}

export interface MetaCreativeRow {
  adId?: string;
  adName?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  videoId?: string;
  body?: string;
  title?: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  purchases?: number;
  purchaseValue?: number;
  roas?: number;
  outboundClicks?: number;
  addToCart?: number;
  atcRate?: number;
  landingPageViews?: number;
  cpa?: number;
  [key: string]: unknown;
}

export interface MetaVideoRow {
  adId?: string;
  adName?: string;
  campaign?: string;
  spend?: number;
  videoPlays?: number;
  thruPlays?: number;
  p25Rate?: number;
  p50Rate?: number;
  p75Rate?: number;
  p100Rate?: number;
  [key: string]: unknown;
}

export interface MetaBreakdownRow extends MetaKpis {
  segment?: string;
  [key: string]: unknown;
}

export interface MetaBreakdowns {
  platform?: MetaBreakdownRow[];
  placement?: MetaBreakdownRow[];
  age?: MetaBreakdownRow[];
  gender?: MetaBreakdownRow[];
  region?: MetaBreakdownRow[];
}

export interface MetaWindow {
  kpis?: MetaKpis;
  deltas?: Record<string, number | null>;
  campaigns?: MetaEntityRow[];
  adsets?: MetaEntityRow[];
  ads?: MetaEntityRow[];
  daily?: MetaDailyPoint[];
  creative?: MetaCreativeRow[];
  video?: MetaVideoRow[];
  breakdowns?: MetaBreakdowns;
}

// ----- Organic (top-level, NOT window-keyed; 30d snapshot) -----

export interface OrganicPost {
  id?: string;
  thumbnail?: string;
  caption?: string;
  mediaType?: string; // IMAGE | VIDEO | CAROUSEL_ALBUM
  timestamp?: string;
  likes?: number;
  comments?: number;
  permalink?: string;
}

export interface OrganicIg {
  reach?: number;
  accountsEngaged?: number;
  totalInteractions?: number;
  views?: number;
  followerCount?: number;
  posts?: OrganicPost[];
}

export interface OrganicFbPage {
  fanCount?: number;
  talkingAbout?: number;
}

export interface OrganicData {
  ig?: OrganicIg;
  fbPage?: OrganicFbPage;
}

// ----- Full feed type -----

type WindowedRecord<T> = {
  [W in Window]?: T;
};

export interface PerfData {
  generated_at: string;
  windows: Window[];
  // Per-channel paid media
  meta: WindowedRecord<MetaWindow>;
  google: WindowedRecord<Record<string, any>>;
  axon: WindowedRecord<Record<string, any>>;
  // Organic social — top-level, not window-keyed (30d snapshot)
  organic?: OrganicData;
  // Typed sections used by dashboard tabs
  ga4: WindowedRecord<Ga4Window>;
  hubspot: WindowedRecord<HubspotWindow>;
  shopify: WindowedRecord<ShopifyWindow>;
  products: WindowedRecord<ProductRow[]>;
  overview: WindowedRecord<OverviewWindow>;
  anomalies: WindowedRecord<Anomaly[]>;
  narrative: WindowedRecord<string | null>;
}

// ----- Hook -----

export interface UseDataResult {
  data: PerfData | null;
  loading: boolean;
  error: unknown;
}

export function useData(): UseDataResult {
  const [data, setData] = useState<PerfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(FEED_URL);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const json: PerfData = await res.json();
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
