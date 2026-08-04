"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
}

export default function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleClick() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRefreshing}
      aria-label="Refresh weather data"
      className="rounded-full p-2 text-fog transition-all duration-150 hover:bg-white/[0.06] hover:text-mist active:scale-90 disabled:opacity-50 cursor-pointer"
    >
      <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} strokeWidth={1.5} />
    </button>
  );
}