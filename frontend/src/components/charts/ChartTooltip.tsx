"use client";

import GlassPanel from "../GlassPanel";
import { formatLocationTime } from "@/lib/format";

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string | number;
  unit?: string;
}

export default function ChartTooltip({ active, payload, label, unit = "" }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <GlassPanel elevated shimmer={false} className="px-4 py-2.5">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-fog">
        {formatLocationTime(String(label))}
      </p>
      <p className="text-sm font-light text-mist">
        {payload[0].value}
        {unit}
      </p>
    </GlassPanel>
  );
}