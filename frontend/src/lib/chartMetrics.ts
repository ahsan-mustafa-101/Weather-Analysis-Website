export type ChartMetricKey = "humidity" | "pressure" | "wind" | "uvindex" | "dew_point";

export interface ChartMetric {
  key: ChartMetricKey;
  label: string;
  unit: string;
  accent: string;
}

export const CHART_METRICS: ChartMetric[] = [
  { key: "humidity", label: "Humidity", unit: "%", accent: "var(--color-accent-cool)" },
  { key: "pressure", label: "Pressure", unit: "mb", accent: "var(--color-accent-mist)" },
  { key: "wind", label: "Wind", unit: "km/h", accent: "var(--color-accent-ice)" },
  { key: "uvindex", label: "UV Index", unit: "", accent: "var(--color-accent-aurora)"},
  { key: "dew_point", label: "Dew Point", unit: "°C", accent: "var(--color-accent-storm)" },
];