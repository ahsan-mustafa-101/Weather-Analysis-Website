/**
 * Minimal requestAnimationFrame-based value tween. Shared by:
 *  - CountUpNumber (animating displayed temperature values)
 *  - SplineEarth (rotating toward a searched city, click pulse)
 * rather than each rolling its own animation loop.
 */

export type Easing = (t: number) => number;

export const easeOutCubic: Easing = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutQuad: Easing = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

interface TweenOptions {
  from: number;
  to: number;
  durationMs: number;
  easing?: Easing;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

/** Returns a cancel function. */
export function tweenValue({
  from,
  to,
  durationMs,
  easing = easeOutCubic,
  onUpdate,
  onComplete,
}: TweenOptions): () => void {
  if (durationMs <= 0) {
    onUpdate(to);
    onComplete?.();
    return () => {};
  }

  let raf: number;
  const start = performance.now();

  function step(now: number) {
    const elapsed = now - start;
    const t = Math.min(elapsed / durationMs, 1);
    onUpdate(from + (to - from) * easing(t));
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}