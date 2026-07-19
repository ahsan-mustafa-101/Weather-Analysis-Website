"use client";

import { useEffect, useRef, useState } from "react";
import { tweenValue } from "@/lib/tween";

interface CountUpNumberProps {
  /** Raw numeric value (e.g. a temperature) — formatting happens via `format`. */
  value: number;
  format: (n: number) => string;
  durationMs?: number;
  className?: string;
}

/**
 * Displays `format(value)`, animating the number counting up/down
 * whenever `value` changes after the initial mount ("Numbers count
 * upward when weather changes" in the brief). The very first render
 * shows the target value immediately — there's nothing to count up
 * from yet.
 */
export default function CountUpNumber({
  value,
  format,
  durationMs = 900,
  className,
}: CountUpNumberProps) {
  const [displayed, setDisplayed] = useState(value);
  const isFirstRender = useRef(true);
  const cancelRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayed(value);
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    cancelRef.current();
    cancelRef.current = tweenValue({
      from: displayed,
      to: value,
      durationMs: reduceMotion ? 0 : durationMs,
      onUpdate: setDisplayed,
    });

    return () => cancelRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return <span className={className}>{format(displayed)}</span>;
}