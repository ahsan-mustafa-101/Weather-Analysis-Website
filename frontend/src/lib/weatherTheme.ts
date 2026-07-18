/**
 * Central mapping from the backend's raw `weather_code` (WMO codes,
 * per Open-Meteo) + `is_day` to everything the UI needs to render a
 * condition: which background scene to show, which accent color to
 * use, which icon to render, and which particle/animation effect to
 * run. This is the ONE place that interprets weather_code — no
 * component should switch on the raw number itself. Future features
 * (e.g. an analytics view with weather icons) import from here too.
 */

export type SceneCategory =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

/** Named accent tokens, defined alongside the base palette in globals.css. */
export type AccentToken =
  | "accent-gold" // sunny / clear-day
  | "accent-ice" // snow
  | "accent-cool" // rain
  | "accent-storm" // storm
  | "accent-aurora" // clear-night
  | "accent-mist"; // cloudy / fog (neutral)

/** Which canvas/CSS particle effect (built in Stage 3) should run for this scene. */
export type AnimationEffect =
  | "sun-rays"
  | "drifting-clouds"
  | "rain"
  | "snow"
  | "fog-layers"
  | "lightning"
  | "aurora"
  | "none";

export interface WeatherTheme {
  scene: SceneCategory;
  accent: AccentToken;
  /** Lucide icon name (Stage 2 will map this to the actual <Icon />). */
  icon: string;
  effects: AnimationEffect[];
  /** Human label for the weather description line in the hero. */
  label: string;
}

/**
 * Resolve a WMO weather_code (+ is_day) to its full visual theme.
 * This is the only function components should call to go from raw
 * API data to something renderable.
 */
export function getWeatherTheme(
  weatherCode: number,
  isDay: boolean
): WeatherTheme {
  // Thunderstorm
  if (weatherCode >= 95) {
    return {
      scene: "storm",
      accent: "accent-storm",
      icon: "CloudLightning",
      effects: ["lightning", "rain"],
      label: weatherCode >= 96 ? "Thunderstorm with hail" : "Thunderstorm",
    };
  }

  // Snow showers
  if (weatherCode === 85 || weatherCode === 86) {
    return {
      scene: "snow",
      accent: "accent-ice",
      icon: "CloudSnow",
      effects: ["snow"],
      label: "Snow showers",
    };
  }

  // Rain showers
  if (weatherCode >= 80 && weatherCode <= 82) {
    return {
      scene: "rain",
      accent: "accent-cool",
      icon: "CloudRainWind",
      effects: ["rain"],
      label: "Rain showers",
    };
  }

  // Snow fall / snow grains
  if ((weatherCode >= 71 && weatherCode <= 75) || weatherCode === 77) {
    return {
      scene: "snow",
      accent: "accent-ice",
      icon: "CloudSnow",
      effects: ["snow"],
      label: weatherCode === 77 ? "Snow grains" : "Snowfall",
    };
  }

  // Rain / freezing rain
  if (weatherCode >= 61 && weatherCode <= 67) {
    return {
      scene: "rain",
      accent: "accent-cool",
      icon: "CloudRain",
      effects: ["rain"],
      label: weatherCode >= 66 ? "Freezing rain" : "Rain",
    };
  }

  // Drizzle / freezing drizzle
  if (weatherCode >= 51 && weatherCode <= 57) {
    return {
      scene: "rain",
      accent: "accent-cool",
      icon: "CloudDrizzle",
      effects: ["rain"],
      label: weatherCode >= 56 ? "Freezing drizzle" : "Drizzle",
    };
  }

  // Fog
  if (weatherCode === 45 || weatherCode === 48) {
    return {
      scene: "fog",
      accent: "accent-mist",
      icon: "CloudFog",
      effects: ["fog-layers"],
      label: weatherCode === 48 ? "Depositing rime fog" : "Fog",
    };
  }

  // Overcast
  if (weatherCode === 3) {
    return {
      scene: "cloudy",
      accent: "accent-mist",
      icon: "Cloud",
      effects: ["drifting-clouds"],
      label: "Overcast",
    };
  }

  // Partly cloudy / mainly clear
  if (weatherCode === 1 || weatherCode === 2) {
    return {
      scene: isDay ? "clear-day" : "clear-night",
      accent: isDay ? "accent-gold" : "accent-aurora",
      icon: isDay ? "CloudSun" : "CloudMoon",
      effects: isDay
        ? ["sun-rays", "drifting-clouds"]
        : ["aurora", "drifting-clouds"],
      label: weatherCode === 1 ? "Mainly clear" : "Partly cloudy",
    };
  }

  // Clear sky (0), and fallback for any unmapped code
  return {
    scene: isDay ? "clear-day" : "clear-night",
    accent: isDay ? "accent-gold" : "accent-aurora",
    icon: isDay ? "Sun" : "Moon",
    effects: isDay ? ["sun-rays"] : ["aurora"],
    label: "Clear sky",
  };
}
