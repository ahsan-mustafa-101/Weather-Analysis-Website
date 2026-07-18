import { Droplets } from "lucide-react";
import GlassPanel from "./GlassPanel";
import WeatherIcon from "./WeatherIcon";
import { ForecastEntry } from "@/lib/types";
import { getWeatherTheme } from "@/lib/weatherTheme";
import { ACCENT_CLASSES } from "@/lib/accentClasses";
import { formatHourLabel, formatTemp } from "@/lib/format";

interface ForecastStripProps {
  /** Hourly entries EXCLUDING the "now" entry (that's the hero's job). */
  entries: ForecastEntry[];
}

export default function ForecastStrip({ entries }: ForecastStripProps) {
  if (entries.length === 0) return null;

  return (
    <div className="w-full">
      <h2 className="mb-4 px-1 text-sm font-light uppercase tracking-[0.2em] text-fog">
        24-Hour Forecast
      </h2>
      <div className="flex w-full gap-4 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
        {entries.map((entry) => {
          const theme = getWeatherTheme(entry.weather_code, entry.is_day);
          const accent = ACCENT_CLASSES[theme.accent];
          return (
            <GlassPanel
              key={entry.timestamp}
              className={`group flex shrink-0 flex-col items-center gap-3 px-5 py-6 transition-all duration-300 ease-out hover:-translate-y-1.5 ${accent.hoverBorder} ${accent.hoverGlow}`}
              style={{ minWidth: "104px" }}
            >
              <span className="font-mono text-xs text-fog">
                {formatHourLabel(entry.timestamp)}
              </span>
              <WeatherIcon
                name={theme.icon}
                className={`h-8 w-8 transition-transform duration-300 group-hover:scale-110 ${accent.text}`}
                strokeWidth={1.25}
              />
              <span className="text-2xl font-light text-mist">
                {formatTemp(entry.temperature)}
              </span>
              <div className="flex items-center gap-1 text-xs font-light text-fog">
                <Droplets className="h-3 w-3" strokeWidth={1.5} />
                <span>{entry.precipitation_probability}%</span>
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}