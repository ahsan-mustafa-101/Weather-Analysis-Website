"use client";

import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ForecastEntry } from "@/lib/types";
import { formatHourLabel } from "@/lib/format";
import { CHART_METRICS } from "@/lib/chartMetrics";
import { convertWind, convertPressure, convertTemperature } from "@/lib/units";
import { useSettings } from "@/context/SettingsContext";
import ChartTooltip from "./ChartTooltip";

interface MetricToggleChartProps {
  data: ForecastEntry[];
}

export default function MetricToggleChart({ data }: MetricToggleChartProps) {
  const [activeKey, setActiveKey] = useState(CHART_METRICS[0].key);
  const { unitSystem, timeFormat } = useSettings();
  const active = CHART_METRICS.find((m) => m.key === activeKey)!;

  const { chartData, unitLabel } = useMemo(() => {
    if (active.key === "wind") {
      return {
        chartData: data.map((d) => ({ ...d, wind: convertWind(d.wind, unitSystem).value })),
        unitLabel: convertWind(0, unitSystem).label,
      };
    }
    if (active.key === "pressure") {
      return {
        chartData: data.map((d) => ({ ...d, pressure: convertPressure(d.pressure, unitSystem).value })),
        unitLabel: convertPressure(0, unitSystem).label,
      };
    }
    if (active.key === "dew_point") {
      return {
        chartData: data.map((d) => ({ ...d, dew_point: convertTemperature(d.dew_point, unitSystem).value })),
        unitLabel: convertTemperature(0, unitSystem).label,
      };
    }
    return { chartData: data, unitLabel: active.unit }; // humidity, uvindex: no unit system
  }, [data, unitSystem, active.key, active.unit]);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        {CHART_METRICS.map((metric) => (
          <button
            key={metric.key}
            type="button"
            onClick={() => setActiveKey(metric.key)}
            className={`rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors duration-150 ${
              metric.key === activeKey
                ? "border-white/20 bg-white/10 text-mist"
                : "border-white/5 text-fog hover:border-white/10 hover:text-mist"
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 17, left: -12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(t) => formatHourLabel(t, timeFormat)}
              stroke="var(--color-fog)"
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", dy: 8 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              stroke="var(--color-fog)"
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={(props) => <ChartTooltip {...props} unit={unitLabel} />} />
            <Line
              type="monotone"
              dataKey={active.key}
              stroke={active.accent}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}