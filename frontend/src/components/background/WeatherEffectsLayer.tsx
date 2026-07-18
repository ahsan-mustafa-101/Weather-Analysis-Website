import { AnimationEffect } from "@/lib/weatherTheme";
import SunRays from "./effects/SunRays";
import DriftingClouds from "./effects/DriftingClouds";
import FogLayers from "./effects/FogLayers";
import AuroraEffect from "./effects/AuroraEffect";
import Lightning from "./effects/Lightning";
import ParticleField from "./effects/ParticleField";

interface WeatherEffectsLayerProps {
  effects: AnimationEffect[];
}

/**
 * Renders one component per entry in the current weather theme's
 * `effects` array (see lib/weatherTheme.ts) — e.g. storm resolves to
 * ["lightning", "rain"], so both Lightning and a rain ParticleField
 * render together. This is the only place that maps an
 * AnimationEffect name to an actual component.
 */
export default function WeatherEffectsLayer({ effects }: WeatherEffectsLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {effects.map((effect) => {
        switch (effect) {
          case "sun-rays":
            return <SunRays key={effect} />;
          case "drifting-clouds":
            return <DriftingClouds key={effect} />;
          case "fog-layers":
            return <FogLayers key={effect} />;
          case "aurora":
            return <AuroraEffect key={effect} />;
          case "lightning":
            return <Lightning key={effect} />;
          case "rain":
            return <ParticleField key={effect} kind="rain" />;
          case "snow":
            return <ParticleField key={effect} kind="snow" />;
          case "none":
          default:
            return null;
        }
      })}
    </div>
  );
}