"use client";

import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ForecastEntry } from "@/lib/types";
import { formatHourLabel } from "@/lib/format";
import { convertTemperature } from "@/lib/units";
import { useSettings } from "@/context/SettingsContext";
import ChartTooltip from "./ChartTooltip";


interface TemperatureChartProps {
  data: ForecastEntry[];
}

export default function TemperatureChart({ data }: TemperatureChartProps) {
  const { unitSystem, timeFormat } = useSettings();

  const converted = useMemo(
    () => data.map((d) => ({ ...d, temperature: convertTemperature(d.temperature, unitSystem).value })),
    [data, unitSystem]
  );
  const unitLabel = convertTemperature(0, unitSystem).label;

  return (
    <div className="pt-9 h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={converted} margin={{ top: 12, right: 17, left: -12, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(t) => formatHourLabel(t, timeFormat)}
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
            tickFormatter={(v) => `${Math.round(v)}°`}
          />
          <Tooltip content={(props) => <ChartTooltip {...props} unit={unitLabel} />} />
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