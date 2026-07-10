// src/tabs/meta/MetaCampaigns.tsx
import { DataTable } from "../../components/DataTable";
import { META_CAMPAIGN_COLS } from "./columns";
import type { MetaWindow, MetaEntityRow } from "../../lib/data";

type Row = Record<string, unknown>;

interface Props {
  metaWin: MetaWindow;
}

export function MetaCampaigns({ metaWin }: Props) {
  const campaigns = (metaWin.campaigns ?? []) as MetaEntityRow[] as Row[];

  return (
    <div className="space-y-4 fade-in">
      <h3
        className="text-lg font-bold"
        style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
      >
        Campaign Performance
      </h3>
      <DataTable<Row> columns={META_CAMPAIGN_COLS} rows={campaigns} sortable />
    </div>
  );
}
