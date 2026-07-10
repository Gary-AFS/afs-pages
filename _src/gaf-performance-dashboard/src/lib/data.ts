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

// ----- Full feed type -----

type WindowedRecord<T> = {
  [W in Window]?: T;
};

export interface PerfData {
  generated_at: string;
  windows: Window[];
  // Per-channel paid media (deep tables — permissive)
  meta: WindowedRecord<Record<string, any>>;
  google: WindowedRecord<Record<string, any>>;
  axon: WindowedRecord<Record<string, any>>;
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
