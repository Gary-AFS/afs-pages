// src/tabs/meta/MetaAdSets.tsx
import { DataTable } from "../../components/DataTable";
import { META_ADSET_COLS } from "./columns";
import type { MetaWindow, MetaEntityRow } from "../../lib/data";

type Row = Record<string, unknown>;

interface Props {
  metaWin: MetaWindow;
}

export function MetaAdSets({ metaWin }: Props) {
  const adsets = (metaWin.adsets ?? []) as MetaEntityRow[] as Row[];

  return (
    <div className="space-y-4 fade-in">
      <h3
        className="text-lg font-bold"
        style={{ color: "var(--gaf-text-primary)", fontFamily: "var(--font-display)" }}
      >
        Ad Set Performance
      </h3>
      <DataTable<Row> columns={META_ADSET_COLS} rows={adsets} sortable />
    </div>
  );
}
