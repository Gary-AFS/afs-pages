// src/components/Delta.tsx
import { fmtDelta } from "../lib/format";

interface DeltaProps {
  pct: number | null | undefined;
  /** Invert colour logic for lower-is-better metrics (CPC, CPM, CPA) */
  invert?: boolean;
}

export function Delta({ pct, invert }: DeltaProps) {
  const { text, dir } = fmtDelta(pct);

  // Resolve effective visual direction (invert flips up/down colours)
  const effectiveDir = invert && dir !== "flat"
    ? (dir === "up" ? "down" : "up")
    : dir;

  const baseClass = "text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 whitespace-nowrap";

  if (effectiveDir === "flat") {
    return (
      <span className={baseClass} style={{ color: "var(--gaf-delta-flat)" }}>{text}</span>
    );
  }

  if (effectiveDir === "up") {
    return (
      <span className={baseClass} style={{ color: "var(--gaf-delta-pos)" }}>
        <span aria-hidden="true">&#9650;</span>
        {text}
      </span>
    );
  }

  // down
  return (
    <span className={baseClass} style={{ color: "var(--gaf-delta-neg)" }}>
      <span aria-hidden="true">&#9660;</span>
      {text}
    </span>
  );
}
