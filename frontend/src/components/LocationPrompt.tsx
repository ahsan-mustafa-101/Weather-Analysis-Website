"use client";

import { MapPin, X } from "lucide-react";
import GlassPanel from "./GlassPanel";

interface LocationPromptProps {
  onAllow: () => void;
  onDismiss: () => void;
  isLoading: boolean;
}

export default function LocationPrompt({ onAllow, onDismiss, isLoading }: LocationPromptProps) {
  return (
    <GlassPanel
      elevated
      shimmer={false}
      className="flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5"
    >
      <div className="flex items-center gap-3">
        <MapPin className="h-4 w-4 shrink-0 text-fog" strokeWidth={1.5} />
        <p className="text-sm font-light text-mist">
          Use your location for local weather?
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onAllow}
          disabled={isLoading}
          className="cursor-pointer rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-light text-mist transition-colors duration-150 hover:bg-white/[0.15] disabled:opacity-50"
        >
          {isLoading ? "Locating..." : "Allow"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={isLoading}
          aria-label="Dismiss"
          className="cursor-pointer rounded-full p-1.5 text-fog transition-colors duration-150 hover:text-mist disabled:opacity-50"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </GlassPanel>
  );
}