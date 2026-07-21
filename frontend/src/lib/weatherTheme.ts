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
  /**
   * Key into the custom icon set — see src/components/WeatherIcon.tsx
   * for the full name -> PNG asset map. Kept as a plain string here
   * (not the asset type) so this file has no dependency on the icon
   * implementation or image imports.
   */
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
  // Thunderstorm with hail — icy precipitation, so the "thunder +
  // snow/ice" asset fits better than a plain storm icon.
  if (weatherCode >= 96) {
    return {
      scene: "storm",
      accent: "accent-storm",
      icon: "thundering-with-snow",
      effects: ["lightning", "rain"],
      label: "Thunderstorm with hail",
    };
  }

  // Thunderstorm
  if (weatherCode >= 95) {
    return {
      scene: "storm",
      accent: "accent-storm",
      icon: isDay ? "sun-with-thunder" : "moon-with-thundering",
      effects: ["lightning", "rain"],
      label: "Thunderstorm",
    };
  }

  // Snow showers
  if (weatherCode === 85 || weatherCode === 86) {
    return {
      scene: "snow",
      accent: "accent-ice",
      icon: isDay ? "snowing" : "moon-with-snow",
      effects: ["snow"],
      label: "Snow showers",
    };
  }

  // Rain showers
  if (weatherCode >= 80 && weatherCode <= 82) {
    return {
      scene: "rain",
      accent: "accent-cool",
      icon: isDay ? "sun-with-rain" : "moon-with-rain",
      effects: ["rain"],
      label: "Rain showers",
    };
  }

  // Snow fall / snow grains
  if ((weatherCode >= 71 && weatherCode <= 75) || weatherCode === 77) {
    return {
      scene: "snow",
      accent: "accent-ice",
      icon: "snowing",
      effects: ["snow"],
      label: weatherCode === 77 ? "Snow grains" : "Snowfall",
    };
  }

  // Freezing rain — icy, same "rain + snow" asset as freezing drizzle
  if (weatherCode >= 66 && weatherCode <= 67) {
    return {
      scene: "rain",
      accent: "accent-cool",
      icon: "snow-with-rain",
      effects: ["rain"],
      label: "Freezing rain",
    };
  }

  // Rain
  if (weatherCode >= 61 && weatherCode <= 65) {
    return {
      scene: "rain",
      accent: "accent-cool",
      icon: "raining-with-wind",
      effects: ["rain"],
      label: "Rain",
    };
  }

  // Freezing drizzle
  if (weatherCode >= 56 && weatherCode <= 57) {
    return {
      scene: "rain",
      accent: "accent-cool",
      icon: "snow-with-rain",
      effects: ["rain"],
      label: "Freezing drizzle",
    };
  }

  // Drizzle
  if (weatherCode >= 51 && weatherCode <= 55) {
    return {
      scene: "rain",
      accent: "accent-cool",
      icon: "raining",
      effects: ["rain"],
      label: "Drizzle",
    };
  }

  // Fog — sky fully obscured, so no sun/moon/star accent either way
  if (weatherCode === 45 || weatherCode === 48) {
    return {
      scene: "fog",
      accent: "accent-mist",
      icon: "cloud",
      effects: ["fog-layers"],
      label: weatherCode === 48 ? "Depositing rime fog" : "Fog",
    };
  }

  // Overcast — same reasoning as fog: nothing celestial is visible
  if (weatherCode === 3) {
    return {
      scene: "cloudy",
      accent: "accent-mist",
      icon: "cloud",
      effects: ["drifting-clouds"],
      label: "Overcast",
    };
  }

  // Partly cloudy
  if (weatherCode === 2) {
    return {
      scene: isDay ? "clear-day" : "clear-night",
      accent: isDay ? "accent-gold" : "accent-aurora",
      icon: isDay ? "sun-with-clouds" : "moon-with-clouds",
      effects: isDay
        ? ["sun-rays", "drifting-clouds"]
        : ["aurora", "drifting-clouds"],
      label: "Partly cloudy",
    };
  }

  // Mainly clear
  if (weatherCode === 1) {
    return {
      scene: isDay ? "clear-day" : "clear-night",
      accent: isDay ? "accent-gold" : "accent-aurora",
      icon: isDay ? "sun-with-wind" : "moon-with-stars-and-wind",
      effects: isDay
        ? ["sun-rays", "drifting-clouds"]
        : ["aurora", "drifting-clouds"],
      label: "Mainly clear",
    };
  }

  // Clear sky (0), and fallback for any unmapped code
  return {
    scene: isDay ? "clear-day" : "clear-night",
    accent: isDay ? "accent-gold" : "accent-aurora",
    icon: isDay ? "sun" : "moon-with-stars",
    effects: isDay ? ["sun-rays"] : ["aurora"],
    label: "Clear sky",
  };
}