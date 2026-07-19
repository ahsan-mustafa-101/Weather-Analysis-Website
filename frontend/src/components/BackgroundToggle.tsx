"use client";

import { Image as ImageIcon, ImageOff } from "lucide-react";

interface BackgroundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function BackgroundToggle({ enabled, onToggle }: BackgroundToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={enabled ? "Disable wallpaper" : "Enable wallpaper"}
      aria-pressed={enabled}
      className="rounded-full p-2 text-fog transition-all duration-150 hover:bg-white/[0.06] hover:text-mist active:scale-90"
    >
      {enabled ? (
        <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
      ) : (
        <ImageOff className="h-5 w-5" strokeWidth={1.5} />
      )}
    </button>
  );
}