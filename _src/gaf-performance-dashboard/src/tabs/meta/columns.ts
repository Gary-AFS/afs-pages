// src/tabs/meta/columns.ts
// Shared full-column definitions for Meta Campaigns / Ad Sets DataTables.
import { fmtCurrency, fmtInt, fmtPct, fmtRoas } from "../../lib/format";

type Align = "left" | "right";
interface Col {
  key: string;
  label: string;
  align: Align;
  format?: (v: unknown) => string;
}

const cur = (v: unknown) => fmtCurrency(Number(v ?? 0));
const int = (v: unknown) => fmtInt(Number(v ?? 0));
const pct = (v: unknown) => fmtPct(Number(v ?? 0));
const roas = (v: unknown) => fmtRoas(Number(v ?? 0));

// Campaigns — full column set per spec (name + objective + 18 metrics).
export const META_CAMPAIGN_COLS: Col[] = [
  { key: "campaign",         label: "Campaign",     align: "left" },
  { key: "objective",        label: "Objective",    align: "left" },
  { key: "spend",            label: "Spend",        align: "right", format: cur },
  { key: "impressions",      label: "Impr.",        align: "right", format: int },
  { key: "reach",            label: "Reach",        align: "right", format: int },
  { key: "clicks",           label: "Clicks",       align: "right", format: int },
  { key: "ctr",              label: "CTR",          align: "right", format: pct },
  { key: "cpc",              label: "CPC",          align: "right", format: cur },
  { key: "cpm",              label: "CPM",          align: "right", format: cur },
  { key: "outboundClicks",   label: "Outbound",     align: "right", format: int },
  { key: "outboundCtr",      label: "OB CTR",       align: "right", format: pct },
  { key: "landingPageViews", label: "LPV",          align: "right", format: int },
  { key: "addToCart",        label: "ATC",          align: "right", format: int },
  { key: "atcRate",          label: "ATC Rate",     align: "right", format: pct },
  { key: "costPerAtc",       label: "Cost/ATC",     align: "right", format: cur },
  { key: "conversions",      label: "Conv.",        align: "right", format: int },
  { key: "cpa",              label: "CPA",          align: "right", format: cur },
  { key: "convValue",        label: "Revenue",      align: "right", format: cur },
  { key: "roas",             label: "ROAS",         align: "right", format: roas },
];

// Ad Sets — full column set per spec.
export const META_ADSET_COLS: Col[] = [
  { key: "adset",            label: "Ad Set",       align: "left" },
  { key: "campaign",         label: "Campaign",     align: "left" },
  { key: "spend",            label: "Spend",        align: "right", format: cur },
  { key: "impressions",      label: "Impr.",        align: "right", format: int },
  { key: "reach",            label: "Reach",        align: "right", format: int },
  { key: "clicks",           label: "Clicks",       align: "right", format: int },
  { key: "ctr",              label: "CTR",          align: "right", format: pct },
  { key: "cpc",              label: "CPC",          align: "right", format: cur },
  { key: "outboundClicks",   label: "Outbound",     align: "right", format: int },
  { key: "outboundCtr",      label: "OB CTR",       align: "right", format: pct },
  { key: "landingPageViews", label: "LPV",          align: "right", format: int },
  { key: "addToCart",        label: "ATC",          align: "right", format: int },
  { key: "atcRate",          label: "ATC Rate",     align: "right", format: pct },
  { key: "costPerAtc",       label: "Cost/ATC",     align: "right", format: cur },
  { key: "conversions",      label: "Conv.",        align: "right", format: int },
  { key: "cpa",              label: "CPA",          align: "right", format: cur },
  { key: "roas",             label: "ROAS",         align: "right", format: roas },
];

// Breakdown table — dimension + metrics per spec.
export const META_BREAKDOWN_COLS: Col[] = [
  { key: "segment",          label: "Segment",      align: "left" },
  { key: "spend",            label: "Spend",        align: "right", format: cur },
  { key: "impressions",      label: "Impr.",        align: "right", format: int },
  { key: "clicks",           label: "Clicks",       align: "right", format: int },
  { key: "ctr",              label: "CTR",          align: "right", format: pct },
  { key: "cpc",              label: "CPC",          align: "right", format: cur },
  { key: "cpm",              label: "CPM",          align: "right", format: cur },
  { key: "outboundClicks",   label: "Outbound",     align: "right", format: int },
  { key: "landingPageViews", label: "LPV",          align: "right", format: int },
  { key: "addToCart",        label: "ATC",          align: "right", format: int },
  { key: "costPerAtc",       label: "Cost/ATC",     align: "right", format: cur },
  { key: "conversions",      label: "Conv.",        align: "right", format: int },
  { key: "cpa",              label: "CPA",          align: "right", format: cur },
  { key: "purchaseValue",    label: "Revenue",      align: "right", format: cur },
  { key: "roas",             label: "ROAS",         align: "right", format: roas },
];
