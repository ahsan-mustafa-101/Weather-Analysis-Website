"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimationGate } from "@/lib/useAnimationGate";

/**
 * A full-screen flash overlay whose opacity is toggled on an
 * irregular JS-scheduled timer, rather than a repeating CSS
 * animation — real lightning doesn't flash on a metronome, so a
 * fixed-period keyframe would read as fake. Occasionally does a
 * quick double-flash for variety. Stops scheduling entirely when
 * the tab is hidden or prefers-reduced-motion is set (via
 * useAnimationGate) rather than just skipping the visual.
 */
export default function Lightning() {
  const [flash, setFlash] = useState(0); // 0 = off, otherwise opacity
  const active = useAnimationGate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const off = setTimeout(() => setFlash(0), 0);
      return () => clearTimeout(off);
    }

    function scheduleNext() {
      const delay = 4000 + Math.random() * 9000;
      timerRef.current = setTimeout(() => {
        doFlash();
        scheduleNext();
      }, delay);
    }

    function doFlash() {
      setFlash(0.5 + Math.random() * 0.3);
      setTimeout(() => setFlash(0), 90);
      if (Math.random() < 0.35) {
        setTimeout(() => {
          setFlash(0.3 + Math.random() * 0.2);
          setTimeout(() => setFlash(0), 70);
        }, 160);
      }
    }

    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-75"
      style={{ opacity: flash }}
    />
  );
}