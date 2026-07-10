// src/tabs/meta/MetaDecisionPanels.tsx
import { fmtCurrency, fmtInt, fmtPct, fmtRoas } from "../../lib/format";
import type { MetaEntityRow, MetaKpis } from "../../lib/data";

// ---- Objective/Tier logic (matches meta-ads-dashboard.html) ----

const OBJECTIVE_MAP: Record<string, string> = {
  OUTCOME_SALES: 'conversion', CONVERSIONS: 'conversion', CATALOG_SALES: 'conversion',
  PRODUCT_CATALOG_SALES: 'conversion',
  OUTCOME_TRAFFIC: 'traffic', LINK_CLICKS: 'traffic',
  OUTCOME_AWARENESS: 'awareness', REACH: 'awareness', BRAND_AWARENESS: 'awareness',
  OUTCOME_ENGAGEMENT: 'engagement', POST_ENGAGEMENT: 'engagement', VIDEO_VIEWS: 'engagement',
  OUTCOME_LEADS: 'leads', LEAD_GENERATION: 'leads',
};

type Tier = 'win' | 'watch' | 'waste';

interface CampaignClassification {
  tier: Tier;
  metric: string;
  val: number;
  lowerBetter: boolean;
}

function classifyCampaign(c: MetaEntityRow, avgRoas: number, avgCtr: number, avgCpm: number): CampaignClassification {
  const goal = OBJECTIVE_MAP[c.objective ?? ''] ?? null;
  let metric = 'CTR';
  let val = 0;
  let avg = 0;
  let lowerBetter = false;

  if (goal === 'conversion' || goal === 'leads') {
    metric = 'ROAS'; val = Number(c.roas ?? 0); avg = avgRoas;
  } else if (goal === 'traffic' || goal === 'engagement') {
    metric = 'CTR'; val = Number(c.ctr ?? 0); avg = avgCtr;
  } else if (goal === 'awareness') {
    metric = 'CPM'; val = Number(c.cpm ?? 0); avg = avgCpm; lowerBetter = true;
  } else if (Number(c.conversions ?? 0) > 0) {
    metric = 'ROAS'; val = Number(c.roas ?? 0); avg = avgRoas;
  } else {
    metric = 'CTR'; val = Number(c.ctr ?? 0); avg = avgCtr;
  }

  let tier: Tier = 'watch';
  const spend = Number(c.spend ?? 0);
  if (spend < 50) {
    tier = 'watch';
  } else if (lowerBetter) {
    if (val <= avg * 0.6) tier = 'win';
    else if (val <= avg * 1.5) tier = 'watch';
    else tier = 'waste';
  } else {
    if (val >= avg * 1.0) tier = 'win';
    else if (val >= avg * 0.5) tier = 'watch';
    else tier = 'waste';
  }

  return { tier, metric, val, lowerBetter };
}

// ---- CampaignTierPanel ----

interface TierGroup {
  tier: Tier;
  label: string;
  color: string;
  bg: string;
  campaigns: MetaEntityRow[];
}

export function CampaignTierPanel({ campaigns }: { campaigns: MetaEntityRow[] }) {
  if (!campaigns.length) return null;

  const spend = campaigns.map(c => Number(c.spend ?? 0));
  const totalSpend = spend.reduce((a, b) => a + b, 0);
  const roas = campaigns.map(c => Number(c.roas ?? 0));
  const avgRoas = roas.length ? roas.reduce((a, b) => a + b, 0) / roas.length : 0;
  const ctr = campaigns.map(c => Number(c.ctr ?? 0));
  const avgCtr = ctr.length ? ctr.reduce((a, b) => a + b, 0) / ctr.length : 0;
  const cpm = campaigns.map(c => Number(c.cpm ?? 0)).filter(v => v > 0);
  const avgCpm = cpm.length ? cpm.reduce((a, b) => a + b, 0) / cpm.length : 0;

  const classified = campaigns.map(c => ({
    campaign: c,
    cl: classifyCampaign(c, avgRoas, avgCtr, avgCpm),
  }));

  const groups: TierGroup[] = [
    {
      tier: 'win',
      label: 'Win',
      color: 'var(--gaf-delta-pos)',
      bg: '#f0fdf4',
      campaigns: classified.filter(x => x.cl.tier === 'win').map(x => x.campaign),
    },
    {
      tier: 'watch',
      label: 'Watch',
      color: '#d97706',
      bg: '#fffbeb',
      campaigns: classified.filter(x => x.cl.tier === 'watch').map(x => x.campaign),
    },
    {
      tier: 'waste',
      label: 'Waste',
      color: 'var(--gaf-delta-neg)',
      bg: '#fff1f2',
      campaigns: classified.filter(x => x.cl.tier === 'waste').map(x => x.campaign),
    },
  ];

  return (
    <section className="dash-card p-4 sm:p-5" aria-label="Campaign tier breakdown">
      <h4
        className="text-sm font-bold mb-3"
        style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
      >
        Campaign Tiers
      </h4>
      <div className="flex flex-col gap-3">
        {groups.map(g => {
          const groupSpend = g.campaigns.reduce((a, c) => a + Number(c.spend ?? 0), 0);
          const pct = totalSpend > 0 ? (groupSpend / totalSpend) * 100 : 0;
          return (
            <div key={g.tier} className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: g.color }}
                aria-hidden="true"
              />
              <span
                className="text-xs font-semibold w-12 shrink-0"
                style={{ color: g.color }}
              >
                {g.label}
              </span>
              <span
                className="text-xs w-6 shrink-0"
                style={{ color: "var(--gaf-text-muted)" }}
              >
                {g.campaigns.length}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--gaf-row-border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, background: g.color }}
                />
              </div>
              <span
                className="text-xs tabular-nums w-20 text-right shrink-0"
                style={{ color: "var(--gaf-text-secondary)" }}
              >
                {fmtCurrency(groupSpend)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---- BudgetAtRiskPanel ----

export function BudgetAtRiskPanel({ campaigns }: { campaigns: MetaEntityRow[] }) {
  if (!campaigns.length) return null;

  const roas = campaigns.map(c => Number(c.roas ?? 0));
  const avgRoas = roas.length ? roas.reduce((a, b) => a + b, 0) / roas.length : 0;
  const ctrs = campaigns.map(c => Number(c.ctr ?? 0));
  const avgCtr = ctrs.length ? ctrs.reduce((a, b) => a + b, 0) / ctrs.length : 0;
  const cpms = campaigns.map(c => Number(c.cpm ?? 0)).filter(v => v > 0);
  const avgCpm = cpms.length ? cpms.reduce((a, b) => a + b, 0) / cpms.length : 0;

  const wasteCampaigns = campaigns.filter(c =>
    classifyCampaign(c, avgRoas, avgCtr, avgCpm).tier === 'waste'
  );
  const wasteSpend = wasteCampaigns.reduce((a, c) => a + Number(c.spend ?? 0), 0);

  if (wasteSpend <= 0) return null;

  return (
    <section
      className="dash-card p-4 sm:p-5"
      style={{ borderLeft: "4px solid var(--gaf-delta-neg)" }}
      aria-label="Budget at risk"
    >
      <p
        className="text-sm font-semibold"
        style={{ color: "var(--gaf-delta-neg)", fontFamily: "var(--font-display)" }}
      >
        Budget at risk: {fmtCurrency(wasteSpend)} – {wasteCampaigns.length} campaign{wasteCampaigns.length === 1 ? "" : "s"} underperforming
      </p>
      {wasteCampaigns.length > 0 && (
        <ul className="mt-2 space-y-1">
          {wasteCampaigns.map((c, i) => (
            <li key={c.campaignId ?? i} className="text-xs" style={{ color: "var(--gaf-text-muted)" }}>
              {String(c.campaign ?? "Unnamed")} – {fmtCurrency(Number(c.spend ?? 0))} spend
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---- ScaleWinnersPanel ----

interface ScaleWinnersPanelProps {
  adsets: MetaEntityRow[];
  kpis: MetaKpis;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[9px] uppercase tracking-wider" style={{ color: "var(--gaf-text-muted)" }}>
        {label}
      </span>
      <span
        className="text-xs font-bold tabular-nums"
        style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
      >
        {value}
      </span>
    </div>
  );
}

export function ScaleWinnersPanel({ adsets, kpis }: ScaleWinnersPanelProps) {
  const accountAvgRoas = Number(kpis.roas ?? 0);

  const winners = (adsets ?? [])
    .filter(a =>
      Number(a.roas ?? 0) > accountAvgRoas &&
      Number(a.conversions ?? 0) >= 2 &&
      Number(a.spend ?? 0) >= 200
    )
    .sort((a, b) => Number(b.roas ?? 0) - Number(a.roas ?? 0))
    .slice(0, 5);

  if (!winners.length) return null;

  return (
    <section className="dash-card p-4 sm:p-5" aria-label="Scale winners ad sets">
      <h4
        className="text-sm font-bold mb-3"
        style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
      >
        Scale Winners
      </h4>
      <p className="text-xs mb-3" style={{ color: "var(--gaf-text-muted)" }}>
        Ad sets with ROAS above account average, 2+ conversions, and $200+ spend
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {winners.map((a, i) => (
          <div
            key={a.adsetId ?? i}
            className="rounded-lg p-3 border"
            style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
          >
            <p
              className="text-xs font-semibold leading-snug line-clamp-2 mb-2"
              style={{ color: "#14532d" }}
              title={String(a.adset ?? "")}
            >
              {String(a.adset ?? "Unnamed Ad Set")}
            </p>
            <p
              className="text-2xl font-bold tabular-nums mb-2"
              style={{ color: "var(--gaf-delta-pos)", fontFamily: "var(--font-display)" }}
            >
              {fmtRoas(Number(a.roas ?? 0))}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <MiniStat label="Spend" value={fmtCurrency(Number(a.spend ?? 0))} />
              <MiniStat label="Conv." value={fmtInt(Number(a.conversions ?? 0))} />
              <MiniStat label="Revenue" value={fmtCurrency(Number(a.convValue ?? 0))} />
              <MiniStat label="CTR" value={fmtPct(Number(a.ctr ?? 0))} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
