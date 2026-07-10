// src/components/TrendChart.tsx
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AreaSeries {
  key: string;
  color: string;
  label: string;
}

interface LineSeries {
  key: string;
  color: string;
  label: string;
}

interface TrendChartSeries {
  areas: AreaSeries[];
  line?: LineSeries;
}

interface TrendChartProps {
  data: Array<{ date: string; [key: string]: number | string }>;
  series: TrendChartSeries;
}

export function TrendChart({ data, series }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 4, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#9CA3AF", fontSize: 11 }}
          axisLine={{ stroke: "#374151" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9CA3AF", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #374151",
            borderRadius: "8px",
            color: "#F9FAFB",
            fontSize: "12px",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#9CA3AF", paddingTop: "8px" }}
        />

        {series.areas.map((area, idx) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.label}
            stackId="spend"
            stroke={area.color}
            fill={area.color}
            fillOpacity={idx === series.areas.length - 1 ? 0.35 : 0.25}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}

        {series.line && (
          <Line
            type="monotone"
            dataKey={series.line.key}
            name={series.line.label}
            stroke={series.line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
