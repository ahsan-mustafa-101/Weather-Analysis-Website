/**
 * A handful of large, softly blurred radial-gradient blobs that
 * drift horizontally at different speeds — reads as clouds without
 * needing actual cloud artwork. Pure CSS animation (see
 * drift-clouds keyframe in globals.css), so it's free on the main
 * thread and automatically respects prefers-reduced-motion via the
 * global override.
 */
const CLOUDS = [
  { top: "8%", left: "-10%", size: 420, duration: 70, opacity: 0.10 },
  { top: "18%", left: "40%", size: 340, duration: 90, opacity: 0.07 },
  { top: "4%", left: "70%", size: 380, duration: 80, opacity: 0.09 },
];

export default function DriftingClouds() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {CLOUDS.map((cloud, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl animate-[drift-clouds_linear_infinite_alternate]"
          style={{
            top: cloud.top,
            left: cloud.left,
            width: cloud.size,
            height: cloud.size * 0.5,
            background: `radial-gradient(closest-side, rgba(245,247,250,${cloud.opacity}), transparent)`,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${i * -12}s`,
          }}
        />
      ))}
    </div>
  );
}