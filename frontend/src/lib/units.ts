export type UnitSystem = "metric" | "imperial" | "hybrid";

interface UnitDisplay {
  value: number;
  label: string;
}

/**
 * Per-field conversions, since different fields convert differently
 * — a single generic formatValue() can't know units without knowing
 * the field. "Hybrid" here follows a common real-world convention
 * (UK-style): Celsius temperatures, but wind speed in mph. Everything
 * else stays metric. There's no single universal definition of
 * "hybrid" — this is a deliberate, documented choice.
 */

export function convertTemperature(celsius: number, system: UnitSystem): UnitDisplay {
  if (system === "imperial") {
    return { value: (celsius * 9) / 5 + 32, label: "°F" };
  }
  return { value: celsius, label: "°C" }; // metric and hybrid both stay Celsius
}

export function convertWind(kmh: number, system: UnitSystem): UnitDisplay {
  if (system === "imperial" || system === "hybrid") {
    return { value: kmh * 0.621371, label: "mph" };
  }
  return { value: kmh, label: "km/h" };
}

export function convertPressure(mb: number, system: UnitSystem): UnitDisplay {
  if (system === "imperial") {
    return { value: mb * 0.02953, label: "inHg" };
  }
  return { value: mb, label: "mb/hPa" };
}

export function convertVisibility(km: number, system: UnitSystem): UnitDisplay {
  if (system === "imperial") {
    return { value: km * 0.621371, label: "mi" };
  }
  return { value: km, label: "km" };
}