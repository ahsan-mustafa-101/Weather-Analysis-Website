"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, Sparkles } from "lucide-react";
import GlassPanel from "./GlassPanel";

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        className="rounded-full p-2 text-fog transition-all duration-150 hover:bg-white/[0.06] hover:text-mist active:scale-90"
      >
        <Settings className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-3 w-64">
          <GlassPanel elevated className="p-5 text-center">
            <Sparkles className="mx-auto mb-3 h-5 w-5 text-fog" strokeWidth={1.5} />
            <p className="text-sm font-light text-mist">Settings coming soon</p>
            <p className="mt-1 text-xs font-light text-fog">
              Units, theme, and more will live here.
            </p>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}