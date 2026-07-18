const LAYERS = [
  { top: "55%", height: 90, opacity: 0.10, duration: 55 },
  { top: "68%", height: 120, opacity: 0.14, duration: 75 },
  { top: "80%", height: 100, opacity: 0.12, duration: 65 },
];

/**
 * Soft translucent bands drifting horizontally near the horizon,
 * layered at different heights/speeds/opacities for a bit of depth.
 * Pure CSS (drift-fog keyframe), no JS.
 */
export default function FogLayers() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          className="absolute left-[-15%] w-[130%] blur-2xl animate-[drift-fog_linear_infinite_alternate]"
          style={{
            top: layer.top,
            height: layer.height,
            background: `linear-gradient(90deg, transparent, rgba(154,165,184,${layer.opacity}) 30%, rgba(154,165,184,${layer.opacity}) 70%, transparent)`,
            animationDuration: `${layer.duration}s`,
            animationDelay: `${i * -18}s`,
          }}
        />
      ))}
    </div>
  );
}