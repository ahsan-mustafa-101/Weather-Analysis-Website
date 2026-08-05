"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, Image as ImageIcon } from "lucide-react";
import GlassPanel from "./GlassPanel";
import { useSettings } from "@/context/SettingsContext";
import { UnitSystem } from "@/lib/units";

const UNIT_OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: "metric", label: "Metric" },
  { value: "imperial", label: "Imperial" },
  { value: "hybrid", label: "Hybrid" },
];

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { unitSystem, setUnitSystem, timeFormat, setTimeFormat, backgroundEnabled, setBackgroundEnabled } =
    useSettings();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Settings"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-full p-2 text-fog transition-all duration-150 hover:bg-white/[0.06] hover:text-mist active:scale-90 cursor-pointer"
      >
        <Settings className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-3 w-72">
          <GlassPanel elevated className="p-5">
            <div className="mb-5">
              <p className="mb-2 font-mono text-xs uppercase tracking-wide text-fog">Units</p>
              <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-1">
                {UNIT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setUnitSystem(opt.value)}
                    className={`flex-1 rounded-full px-3 py-1.5 text-xs font-light transition-colors duration-150 cursor-pointer ${
                      unitSystem === opt.value ? "bg-white/10 text-mist" : "text-fog hover:text-mist"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-2 font-mono text-xs uppercase tracking-wide text-fog">Time format</p>
              <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-1">
                {(["24h", "12h"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTimeFormat(opt)}
                    className={`flex-1 rounded-full px-3 py-1.5 text-xs font-light transition-colors duration-150 cursor-pointer ${
                      timeFormat === opt ? "bg-white/10 text-mist" : "text-fog hover:text-mist"
                    }`}
                  >
                    {opt === "24h" ? "24 hours" : "12 hours"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-fog">
                <ImageIcon className="h-4 w-4" strokeWidth={1.5} />
                <p className="font-mono text-xs uppercase tracking-wide">Background</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={backgroundEnabled}
                onClick={() => setBackgroundEnabled(!backgroundEnabled)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 cursor-pointer ${
                  backgroundEnabled ? "bg-[var(--color-accent-cool)]" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-mist transition-transform duration-200 ${
                              backgroundEnabled ? "translate-x-0" : "-translate-x-5"
                  }`} 
                />
              </button>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}