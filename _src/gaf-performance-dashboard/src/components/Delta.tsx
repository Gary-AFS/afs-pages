// src/components/Delta.tsx
import { fmtDelta } from "../lib/format";

interface DeltaProps {
  pct: number | null | undefined;
}

export function Delta({ pct }: DeltaProps) {
  const { text, dir } = fmtDelta(pct);

  if (dir === "flat") {
    return (
      <span className="text-gray-400 text-sm font-medium">{text}</span>
    );
  }

  if (dir === "up") {
    return (
      <span className="text-green-400 text-sm font-medium flex items-center gap-0.5">
        <span aria-hidden="true">&#9650;</span>
        {text}
      </span>
    );
  }

  // down
  return (
    <span className="text-red-400 text-sm font-medium flex items-center gap-0.5">
      <span aria-hidden="true">&#9660;</span>
      {text}
    </span>
  );
}
