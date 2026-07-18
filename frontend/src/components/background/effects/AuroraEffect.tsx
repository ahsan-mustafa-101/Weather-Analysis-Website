import { seededRandom } from "@/lib/seededRandom";

const rand = seededRandom(7);
const STARS = Array.from({ length: 60 }, () => ({
  left: `${rand() * 100}%`,
  top: `${rand() * 60}%`,
  size: 1 + rand() * 1.5,
  duration: 2.5 + rand() * 3.5,
  delay: -rand() * 5,
}));

const BANDS = [
  { left: "5%", width: "50%", hue: "rgba(94,234,212,0.18)", duration: 16 },
  { left: "35%", width: "45%", hue: "rgba(139,123,199,0.14)", duration: 20 },
  { left: "55%", width: "48%", hue: "rgba(94,234,212,0.12)", duration: 18 },
];

/**
 * Twinkling star field (fixed positions, seeded so SSR/client match)
 * plus a few soft vertical aurora bands that sway via the
 * aurora-wave keyframe. Both are pure CSS, no canvas needed since
 * neither requires per-frame physics.
 */
export default function AuroraEffect() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {STARS.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-mist animate-[twinkle_ease-in-out_infinite]"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      {BANDS.map((band, i) => (
        <div
          key={i}
          className="absolute top-0 h-[55%] origin-bottom blur-2xl animate-[aurora-wave_ease-in-out_infinite]"
          style={{
            left: band.left,
            width: band.width,
            background: `linear-gradient(180deg, ${band.hue}, transparent 80%)`,
            animationDuration: `${band.duration}s`,
            animationDelay: `${i * -6}s`,
          }}
        />
      ))}
    </div>
  );
}