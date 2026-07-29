"use client";

import { Wind, Gauge, Droplets, Eye, Thermometer, Sun } from "lucide-react";
import GlassPanel from "./GlassPanel";
import { ForecastEntry } from "@/lib/types";
import { getCompassDirection, getUvCategory } from "@/lib/weatherTheme";
import { formatValue, UnitSystem } from "@/lib/units";

interface WeatherInsightsProps {
  current: ForecastEntry;
  /** Defaults to metric; wired up once the settings unit-toggle exists. */
  unitSystem?: UnitSystem;
}

interface InsightCard {
  key: string;
  label: string;
  icon: typeof Wind;
  value: string;
}

export default function WeatherInsights({ current, unitSystem = "metric" }: WeatherInsightsProps) {
  const insights: InsightCard[] = [
    {
      key: "wind",
      label: "Wind",
      icon: Wind,
      value: `${Math.round(formatValue(current.wind, unitSystem))} km/h ${getCompassDirection(current.wind_direction)}`,
    },
    {
      key: "pressure",
      label: "Pressure",
      icon: Gauge,
      value: `${Math.round(formatValue(current.pressure, unitSystem))} mb/hPa`,
    },
    {
      key: "humidity",
      label: "Humidity",
      icon: Droplets,
      value: `${Math.round(formatValue(current.humidity, unitSystem))}%`,
    },
    {
      key: "visibility",
      label: "Visibility",
      icon: Eye,
      value: `${formatValue(current.visibility / 1000, unitSystem).toFixed(2)} km`,
    },
    {
      key: "dew_point",
      label: "Dew Point",
      icon: Thermometer,
      value: `${Math.round(formatValue(current.dew_point, unitSystem))}°C`,
    },
    {
      key: "uv_index",
      label: "UV Index",
      icon: Sun,
      value: `${Math.round(current.uvindex)} (${getUvCategory(current.uvindex)})`,
    },
  ];

  return (
    <div className="w-full">
      <h2 className="mb-4 px-1 text-sm font-light uppercase tracking-[0.2em] text-fog">
        Weather Insights
      </h2>
      <div className="themed-scrollbar flex w-full gap-4 overflow-x-auto py-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [scrollbar-color:var(--color-slate)_transparent]">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <GlassPanel
              key={item.key}
              shimmer={false}
              className="flex shrink-0 flex-col items-center gap-2 px-5 py-6 text-center"
              style={{ minWidth: "140px" }}
            >
              <span className="font-mono text-xs uppercase tracking-wide text-fog">
                {item.label}
              </span>
              <Icon className="h-6 w-6 text-mist" strokeWidth={1.5} />
              <span className="text-lg font-light text-mist">{item.value}</span>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}