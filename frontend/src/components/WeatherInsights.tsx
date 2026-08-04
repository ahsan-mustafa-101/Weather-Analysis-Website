"use client";

import { Wind, Gauge, Droplets, Eye, Thermometer} from "lucide-react";
import GlassPanel from "./GlassPanel";
import { ForecastEntry } from "@/lib/types";
import { getCompassDirection} from "@/lib/weatherTheme";
import { convertWind, convertPressure, convertVisibility, convertTemperature } from "@/lib/units";
import { useSettings } from "@/context/SettingsContext";

interface WeatherInsightsProps {
  current: ForecastEntry;
}


interface InsightCard {
  key: string;
  label: string;
  icon: typeof Wind;
  value: string;
}

export default function WeatherInsights({ current }: WeatherInsightsProps) {
  const { unitSystem } = useSettings();
  const wind = convertWind(current.wind, unitSystem);
  const pressure = convertPressure(current.pressure, unitSystem);
  const visibility = convertVisibility(current.visibility / 1000, unitSystem);
  const dewPoint = convertTemperature(current.dew_point, unitSystem);
  const insights: InsightCard[] = [
    {
      key: "wind", label: "Wind", icon: Wind,
      value: `${Math.round(wind.value)} ${wind.label} ${getCompassDirection(current.wind_direction)}`,
    },
    {
      key: "pressure", label: "Pressure", icon: Gauge,
      value: `${Math.round(pressure.value)} ${pressure.label}`,
    },
    {
      key: "humidity", label: "Humidity", icon: Droplets,
      value: `${Math.round(current.humidity)}%`,
    },
    {
      key: "visibility", label: "Visibility", icon: Eye,
      value: `${visibility.value.toFixed(2)} ${visibility.label}`,
    },
    {
      key: "dew_point", label: "Dew Point", icon: Thermometer,
      value: `${Math.round(dewPoint.value)}${dewPoint.label}`,
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