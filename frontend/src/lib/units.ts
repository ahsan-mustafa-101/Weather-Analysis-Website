/**
 * Centralized unit-conversion seam. Every displayed numeric value in
 * WeatherInsights (and eventually elsewhere) should pass through
 * here rather than being interpolated directly into JSX. Right now
 * this is a pure passthrough (metric only, matching what the backend
 * already sends) — when a unit-system toggle is added (see
 * SettingsMenu's placeholder text), the imperial/hybrid conversion
 * math plugs in here, and no component needs to change.
 */

export type UnitSystem = "metric" | "imperial" | "hybrid";

export function formatValue(value: number, unitSystem: UnitSystem = "metric"): number {
  // Placeholder. Metric passthrough only, since the backend currently
  // only sends metric values. Imperial/hybrid conversion logic
  // (km/h -> mph, hPa -> inHg, °C -> °F, km -> mi, etc.) goes here.
  return value;
}