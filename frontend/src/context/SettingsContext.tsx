"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { UnitSystem } from "@/lib/units";

export type TimeFormat = "12h" | "24h";

interface SettingsContextValue {
  unitSystem: UnitSystem;
  setUnitSystem: (u: UnitSystem) => void;
  timeFormat: TimeFormat;
  setTimeFormat: (t: TimeFormat) => void;
  backgroundEnabled: boolean;
  setBackgroundEnabled: (b: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);

  return (
    <SettingsContext.Provider
      value={{ unitSystem, setUnitSystem, timeFormat, setTimeFormat, backgroundEnabled, setBackgroundEnabled }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/** Any component can call this to read/update settings — no prop drilling. */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}