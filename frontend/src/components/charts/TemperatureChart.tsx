"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ForecastEntry } from "@/lib/types";
import { formatHourLabel } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

interface TemperatureChartProps {
  data: ForecastEntry[];
}

export default function TemperatureChart({ data }: TemperatureChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
                dataKey="timestamp"
                tickFormatter={formatHourLabel}
                stroke="var(--color-fog)"
                tick={{ fontSize: 11, fontFamily: "var(--font-mono)", dy: 2 }}
                axisLine={false}
                tickLine={false}
                height={10}
                interval="preserveStartEnd"
                minTickGap={40}
            />
          <YAxis
            stroke="var(--color-fog)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => `${v}°`}
          />
          <Tooltip content={<ChartTooltip unit="°C" />} />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="var(--color-accent-ice)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}