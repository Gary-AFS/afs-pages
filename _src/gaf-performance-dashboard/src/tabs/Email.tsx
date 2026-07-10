// src/tabs/Email.tsx
import { useDateRange } from "../state/DateRangeContext";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { fmtInt, fmtPct } from "../lib/format";
import type { PerfData } from "../lib/data";

interface EmailProps {
  data: PerfData;
}

type SendRow = Record<string, unknown>;

const SENDS_COLS = [
  { key: "name",        label: "Name",        align: "left"  as const },
  { key: "sendDate",    label: "Send Date",   align: "left"  as const },
  { key: "sends",       label: "Sends",       align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "delivered",   label: "Delivered",   align: "right" as const, format: (v: unknown) => fmtInt(Number(v ?? 0)) },
  { key: "openRate",    label: "Open Rate",   align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "clickRate",   label: "Click Rate",  align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "unsubRate",   label: "Unsub Rate",  align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
  { key: "bounceRate",  label: "Bounce Rate", align: "right" as const, format: (v: unknown) => fmtPct(Number(v ?? 0)) },
];

export function Email({ data }: EmailProps) {
  const { window } = useDateRange();

  const hubspotWin = (data as any).hubspot?.[window];

  if (!hubspotWin) {
    return (
      <div className="p-6 text-gray-500 text-sm">
        No HubSpot email data available for this window.
      </div>
    );
  }

  const kpis  = hubspotWin.kpis  ?? {};
  const sends = ((hubspotWin.sends ?? []) as SendRow[]).slice().sort((a, b) => {
    const da = String(a.sendDate ?? "");
    const db = String(b.sendDate ?? "");
    return db.localeCompare(da);
  });

  return (
    <div className="p-6 space-y-8">
      {/* KPI row */}
      <section aria-label="Email key metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <KpiCard
            label="Total Sends"
            value={fmtInt(kpis.totalSends ?? 0)}
          />
          <KpiCard
            label="Avg Open Rate"
            value={fmtPct(kpis.avgOpenRate ?? 0)}
          />
          <KpiCard
            label="Avg CTR"
            value={fmtPct(kpis.avgCtr ?? 0)}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Revenue not tracked in HubSpot for this portal.
        </p>
      </section>

      {/* Sends table */}
      <section aria-label="Email sends">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Sends
        </h3>
        <DataTable<SendRow>
          columns={SENDS_COLS}
          rows={sends}
          sortable
        />
      </section>
    </div>
  );
}
