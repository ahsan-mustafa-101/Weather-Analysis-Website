import { useEffect, useState } from "react";

/**
 * Returns whether animation-heavy effects (canvas particle loops,
 * anything driven by requestAnimationFrame rather than a CSS
 * transition) should currently run. CSS-only effects get
 * prefers-reduced-motion handling for free via the global rule in
 * globals.css; this hook exists for the canvas effects, which need
 * to check it in JS to actually stop their rAF loop rather than just
 * not animating visually.
 *
 * Also pauses when the tab is hidden, since a rain/snow particle
 * loop running in a background tab is pure wasted CPU/battery.
 */
export function useAnimationGate(): boolean {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function update() {
      setActive(!reducedMotionQuery.matches && document.visibilityState === "visible");
    }

    update();
    reducedMotionQuery.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      reducedMotionQuery.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return active;
}