import GlassPanel from "./GlassPanel";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";
import CountUpNumber from "./CountUpNumber";
import { ForecastEntry, SavedLocation } from "@/lib/types";
import { getWeatherTheme } from "@/lib/weatherTheme";
import { ACCENT_CLASSES } from "@/lib/accentClasses";
import { formatLocationDate, formatLocationTime, formatTemp } from "@/lib/format";

interface CurrentWeatherHeroProps {
  location: SavedLocation;
  current: ForecastEntry;
  /**
   * Reserved slot for the Spline Earth (added in Stage 4). Keeping it
   * as a named slot now means the hero's own layout doesn't need to
   * change when the Earth is wired in — it just renders here.
   */
  earthSlot?: React.ReactNode;
}

export default function CurrentWeatherHero({
  location,
  current,
  earthSlot,
}: CurrentWeatherHeroProps) {
  const theme = getWeatherTheme(current.weather_code, current.is_day);

  return (
    <GlassPanel
      elevated
      className="grid w-full grid-cols-1 items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:p-16"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-sm font-light tracking-wide text-fog">
          <span>{location.name}</span>
          <span className="text-fog/40">•</span>
          <span className="font-mono text-xs">{formatLocationTime(current.timestamp)}</span>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fog/70">
          {formatLocationDate(current.timestamp)}
        </p>

        <div className="flex items-end gap-4">
          <CountUpNumber
            value={current.temperature}
            format={formatTemp}
            className="text-[clamp(4.5rem,10vw,8rem)] font-thin leading-none tracking-tight text-mist"
          />
          <AnimatedWeatherIcon
            name={theme.icon}
            className={`mb-3 h-14 w-14 shrink-0 ${ACCENT_CLASSES[theme.accent].text}`}
            strokeWidth={1}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xl font-light text-mist">{theme.label}</p>
          <p className="text-sm font-light text-fog">
            Feels like <CountUpNumber value={current.feels_like} format={formatTemp} />
          </p>
        </div>
      </div>

      <div className="relative flex min-h-[280px] items-center justify-center lg:min-h-[380px]">
        {earthSlot ?? (
          <div className="h-full w-full rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent" />
        )}
      </div>
    </GlassPanel>
  );
}