"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const EarthCanvas = dynamic(() => import("./earth3d/EarthCanvas"), { ssr: false });

interface Earth3DProps {
  /** Rotates the Earth toward this longitude when it changes. Null = nothing searched yet. */
  targetLongitude: number | null;
}

/**
 * Defers mounting the actual WebGL canvas until after the rest of
 * the page has had a chance to paint (search bar / hero text /
 * forecast strip shouldn't wait on Three.js + texture downloads),
 * and until the browser is idle — same reasoning as the Spline
 * version this replaces: a 3D scene is GPU/bandwidth-heavy and needs
 * to coexist with the canvas-based weather particle effects without
 * hurting the 60fps target.
 */
export default function Earth3D({ targetLongitude }: Earth3DProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setShouldLoad(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setShouldLoad(true), 400);
    return () => clearTimeout(id);
  }, []);

  if (!shouldLoad) {
    return (
      <div className="h-full w-full rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent" />
    );
  }

  return (
    <div className="h-full w-full">
      <EarthCanvas targetLongitude={targetLongitude} />
    </div>
  );
}