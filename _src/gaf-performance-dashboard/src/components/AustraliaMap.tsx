// src/components/AustraliaMap.tsx
import { useState } from "react";
import { AU_STATES } from "../assets/au-states";

interface GeoEntry {
  region: string;
  sessions: number;
}

interface AustraliaMapProps {
  geo: GeoEntry[];
}

/** Interpolate GAF orange intensity by session share (0..1) */
function sessionColour(share: number): string {
  // From dark grey (no sessions) to GAF orange (#F97316)
  const minL = 25;
  const maxL = 65;
  const l = Math.round(minL + share * (maxL - minL));
  // Hue 24 = orange, saturation drops at low share
  const s = Math.round(30 + share * 65);
  return `hsl(24,${s}%,${l}%)`;
}

export function AustraliaMap({ geo }: AustraliaMapProps) {
  const [tooltip, setTooltip] = useState<{ region: string; sessions: number; x: number; y: number } | null>(null);

  // Build lookup: region name -> sessions
  const sessionMap: Record<string, number> = {};
  let totalSessions = 0;
  for (const entry of geo) {
    sessionMap[entry.region] = (sessionMap[entry.region] ?? 0) + entry.sessions;
    totalSessions += entry.sessions;
  }

  if (geo.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        No geographic data available.
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      <svg
        viewBox="0 0 500 500"
        className="w-full h-auto"
        aria-label="Australia sessions choropleth map"
        role="img"
      >
        {Object.entries(AU_STATES).map(([regionName, shape]) => {
          const sessions = sessionMap[regionName] ?? 0;
          const share = totalSessions > 0 ? sessions / totalSessions : 0;
          const fill = sessionColour(share);

          return (
            <g key={regionName}>
              <path
                d={shape.d}
                fill={fill}
                stroke="#1F2937"
                strokeWidth={1.5}
                style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
                  setTooltip({
                    region: regionName,
                    sessions,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
                onMouseMove={(e) => {
                  const rect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
                  setTooltip((prev) =>
                    prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null
                  );
                }}
                onMouseLeave={() => setTooltip(null)}
              />
              <text
                x={shape.cx}
                y={shape.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontFamily="sans-serif"
                fill="#E5E7EB"
                pointerEvents="none"
              >
                {shape.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 shadow-lg"
          style={{ left: tooltip.x + 8, top: tooltip.y - 28 }}
        >
          <span className="font-semibold">{tooltip.region}</span>
          {" — "}
          {tooltip.sessions.toLocaleString("en-AU")} sessions
        </div>
      )}

      {/* Colour scale legend */}
      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
        <span>Fewer sessions</span>
        <div
          className="h-2 w-24 rounded"
          style={{
            background: "linear-gradient(to right, hsl(24,30%,25%), hsl(24,95%,65%))",
          }}
        />
        <span>More sessions</span>
      </div>
    </div>
  );
}
