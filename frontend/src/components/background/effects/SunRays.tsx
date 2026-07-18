import { seededRandom } from "@/lib/seededRandom";

const rand = seededRandom(42);
const DUST_MOTES = Array.from({ length: 14 }, (_, i) => ({
  left: `${rand() * 100}%`,
  bottom: `${rand() * 30}%`,
  size: 2 + rand() * 3,
  duration: 14 + rand() * 10,
  delay: -i * 2.1,
  driftX: `${(rand() - 0.5) * 60}px`,
}));

/**
 * Warm rotating rays (conic gradient, masked to a soft radial so it
 * fades at the edges) anchored near the sun's position in the
 * clear-day gradient, plus a handful of dust motes drifting slowly
 * upward. Rays are a single slowly-rotating element — cheap, GPU-
 * transform only.
 */
export default function SunRays() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -right-[15%] -top-[15%] h-[70%] w-[70%] animate-[sun-ray-spin_140s_linear_infinite]"
        style={{
          backgroundImage:
            "conic-gradient(from 0deg, rgba(232,184,101,0.16) 0deg, transparent 12deg, transparent 28deg, rgba(232,184,101,0.12) 40deg, transparent 55deg, transparent 80deg, rgba(232,184,101,0.14) 92deg, transparent 108deg, transparent 200deg, rgba(232,184,101,0.10) 212deg, transparent 230deg, transparent 360deg)",
          maskImage: "radial-gradient(closest-side, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(closest-side, black 30%, transparent 75%)",
        }}
      />
      {DUST_MOTES.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-accent-gold/40 animate-[dust-float_ease-in_infinite]"
          style={
            {
              left: d.left,
              bottom: d.bottom,
              width: d.size,
              height: d.size,
              animationDuration: `${d.duration}s`,
              animationDelay: `${d.delay}s`,
              "--dust-x": d.driftX,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}