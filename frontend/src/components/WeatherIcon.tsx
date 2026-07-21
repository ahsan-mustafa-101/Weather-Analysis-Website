import Image from "next/image";
import cloudWithStars from "./icons/cloud-with-stars.png";
import cloud from "./icons/cloud.png";
import moonWithClouds from "./icons/moon-with-clouds.png";
import moonWithRain from "./icons/moon-with-rain.png";
import moonWithSnow from "./icons/moon-with-snow.png";
import moonWithStarsAndWind from "./icons/moon-with-stars-and-wind.png";
import moonWithStars from "./icons/moon-with-stars.png";
import moonWithThundering from "./icons/moon-with-thundering.png";
import moonWithWindAndRain from "./icons/moon-with-wind-and-rain.png";
import moonWithWind from "./icons/moon-with-wind.png";
import moon from "./icons/moon.png";
import rainingWithWind from "./icons/raining-with-wind.png";
import raining from "./icons/raining.png";
import snowWithRain from "./icons/snow-with-rain.png";
import snowing from "./icons/snowing.png";
import sunWithClouds from "./icons/sun-with-clouds.png";
import sunWithRain from "./icons/sun-with-rain.png";
import sunWithThunder from "./icons/sun-with-thunder.png";
import sunWithWind from "./icons/sun-with-wind.png";
import sun from "./icons/sun.png";
import thunderingWithRain from "./icons/thundering-with-rain.png";
import thunderingWithSnow from "./icons/thundering-with-snow.png";
import thunderingWithWind from "./icons/thundering-with-wind.png";
import thundering from "./icons/thundering.png";
import thunderstorm from "./icons/thunderstorm.png";
import yellowMoonWithClouds from "./icons/yellow-moon-with-clouds.png";

/**
 * getWeatherTheme() (lib/weatherTheme.ts) returns an icon name as a
 * plain string so that file stays framework-agnostic. This component
 * is the only place that resolves that string to an actual asset —
 * swapping icon sets again later only touches this file.
 *
 * Custom PNG set (src/components/icons/*.png) replacing the earlier
 * Lucide vector icons. Note the tradeoff this brings: PNGs have their
 * own baked-in colors and can't be recolored via CSS (unlike the old
 * Lucide icons, which used `currentColor` and picked up the weather
 * accent color via a `text-*` class). Callers no longer need to pass
 * an accent text-color class to this component — it won't do
 * anything — the color now comes from the asset itself.
 *
 * Every key here matches a getWeatherTheme() icon value. A handful of
 * assets (thunderstorm, thundering, thundering-with-wind, moon,
 * moon-with-wind, moon-with-wind-and-rain) aren't currently assigned
 * to any weather_code — they're available as spares if you'd rather
 * swap one in for a slot above.
 */
const ICON_MAP = {
  "cloud-with-stars": cloudWithStars,
  cloud,
  "moon-with-clouds": moonWithClouds,
  "moon-with-rain": moonWithRain,
  "moon-with-snow": moonWithSnow,
  "moon-with-stars-and-wind": moonWithStarsAndWind,
  "moon-with-stars": moonWithStars,
  "moon-with-thundering": moonWithThundering,
  "moon-with-wind-and-rain": moonWithWindAndRain,
  "moon-with-wind": moonWithWind,
  moon,
  "raining-with-wind": rainingWithWind,
  raining,
  "snow-with-rain": snowWithRain,
  snowing,
  "sun-with-clouds": sunWithClouds,
  "sun-with-rain": sunWithRain,
  "sun-with-thunder": sunWithThunder,
  "sun-with-wind": sunWithWind,
  sun,
  "thundering-with-rain": thunderingWithRain,
  "thundering-with-snow": thunderingWithSnow,
  "thundering-with-wind": thunderingWithWind,
  thundering,
  thunderstorm,
  "yellow-moon-with-clouds": yellowMoonWithClouds,
} as const;

export type WeatherIconName = keyof typeof ICON_MAP;

interface WeatherIconProps {
  name: string;
  className?: string;
}

export default function WeatherIcon({ name, className }: WeatherIconProps) {
  const icon = ICON_MAP[name as WeatherIconName] ?? cloud;
  return (
  <Image
    src={icon.src}
    alt=""
    width={48}
    height={48}
    className={className}
  />
);
}