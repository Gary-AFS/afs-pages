// src/components/KpiCard.tsx
import { Delta } from "./Delta";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number | null;
}

export function KpiCard({ label, value, delta }: KpiCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex flex-col gap-1 min-w-0">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider truncate">
        {label}
      </span>
      <span className="text-2xl font-bold text-gray-50 leading-tight">
        {value}
      </span>
      {delta !== undefined && delta !== null && (
        <div className="mt-0.5">
          <Delta pct={delta} />
        </div>
      )}
    </div>
  );
}
