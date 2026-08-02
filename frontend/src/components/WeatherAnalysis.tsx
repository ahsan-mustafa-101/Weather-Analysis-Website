"use client";

import GlassPanel from "./GlassPanel";
import TemperatureChart from "./charts/TemperatureChart";
import MetricToggleChart from "./charts/MetricToggleChart";
import { ForecastEntry } from "@/lib/types";

interface WeatherAnalysisProps {
  history: ForecastEntry[];
}

export default function WeatherAnalysis({ history }: WeatherAnalysisProps) {
  return (
    <div className="w-full">
      <h2 className="mb-4 px-1 text-sm font-light uppercase tracking-[0.2em] text-fog">
        Weather Analysis
      </h2>
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassPanel shimmer={false} className="p-6">
          <p className="mb-1 text-sm font-light text-mist">Temperature</p>
          <p className="mb-4 font-mono text-xs text-fog">Past 3 days</p>
          <TemperatureChart data={history} />
        </GlassPanel>
        <GlassPanel shimmer={false} className="p-6">
          <p className="mb-1 text-sm font-light text-mist">Conditions</p>
          <p className="mb-4 font-mono text-xs text-fog">Past 3 days</p>
          <MetricToggleChart data={history} />
        </GlassPanel>
      </div>
    </div>
  );
}