"use client";

import { MapPin } from "lucide-react";
import GlassPanel from "./GlassPanel";

interface LocationPromptProps {
  onAllow: () => void;
  onDeny: () => void;
  isLoading: boolean;
}

export default function LocationPrompt({ onAllow, onDeny, isLoading }: LocationPromptProps) {
  return (
    <GlassPanel
      elevated
      className="flex w-full max-w-lg flex-col items-center gap-5 px-8 py-12 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <MapPin className="h-5 w-5 text-fog" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-lg font-light text-mist">WeatherDrop would like to access your location</p>
        <p className="max-w-sm font-light text-fog">
          This lets us show current conditions and a forecast for exactly where you are.
        </p>
      </div>

      <div className="mt-2 flex w-full max-w-xs items-center gap-3">
        <button
          type="button"
          onClick={onDeny}
          disabled={isLoading}
          className="flex-1 cursor-pointer rounded-full border border-white/10 px-5 py-2.5 text-sm font-light text-fog transition-colors duration-150 hover:border-white/20 hover:text-mist disabled:opacity-50"
        >
          Not Allow
        </button>
        <button
          type="button"
          onClick={onAllow}
          disabled={isLoading}
          className="flex-1 cursor-pointer rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-light text-mist transition-colors duration-150 hover:bg-white/[0.15] disabled:opacity-50"
        >
          {isLoading ? "Locating..." : "Allow"}
        </button>
      </div>
    </GlassPanel>
  );
}