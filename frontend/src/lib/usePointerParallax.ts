import { useEffect, useRef, useState } from "react";

/**
 * Returns a small {x, y} pixel offset (capped by `range`) that
 * follows the pointer, rAF-throttled. Used for the "background moves
 * slightly with cursor" micro-interaction. Disabled entirely for
 * touch-primary devices (no meaningful pointer to follow) and when
 * prefers-reduced-motion is set.
 */
export function usePointerParallax(range = 14) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return;

    function handlePointerMove(e: PointerEvent) {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRef.current = { x: nx * range, y: ny * range };
    }

    function tick() {
      setOffset((prev) => ({
        x: prev.x + (targetRef.current.x - prev.x) * 0.06,
        y: prev.y + (targetRef.current.y - prev.y) * 0.06,
      }));
      rafRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", handlePointerMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [range]);

  return offset;
}