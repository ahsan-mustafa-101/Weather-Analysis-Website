import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  LucideProps,
  Moon,
  Sun,
} from "lucide-react";

/**
 * getWeatherTheme() (lib/weatherTheme.ts) returns an icon name as a
 * plain string so that file stays framework-agnostic. This component
 * is the only place that resolves that string to an actual icon
 * component, so swapping icon libraries later only touches this file.
 */
const ICON_MAP = {
  CloudLightning,
  CloudSnow,
  CloudRainWind,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  Cloud,
  CloudSun,
  CloudMoon,
  Sun,
  Moon,
} as const;

export type WeatherIconName = keyof typeof ICON_MAP;

interface WeatherIconProps extends LucideProps {
  name: string;
}

export default function WeatherIcon({ name, ...rest }: WeatherIconProps) {
  const Icon = ICON_MAP[name as WeatherIconName] ?? Cloud;
  return <Icon {...rest} />;
}