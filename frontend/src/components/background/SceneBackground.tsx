import { AnimationEffect, SceneCategory } from "@/lib/weatherTheme";
import SceneStack from "./SceneStack";
import WeatherEffectsLayer from "./WeatherEffectsLayer";

interface SceneBackgroundProps {
  scene: SceneCategory;
  effects: AnimationEffect[];
  /** Wallpaper toggle state, owned by the page. */
  enabled: boolean;
}

/**
 * Sits fixed behind all page content. When `enabled` is false, the
 * scene + effects dissolve (fade + blur out) and a flat dark
 * gradient takes over — per the brief's background toggle spec.
 * Weather effects are unmounted (not just hidden) while disabled so
 * the rain/snow canvases and rAF loops aren't running for nothing.
 */
export default function SceneBackground({ scene, effects, enabled }: SceneBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-navy">
      <div
        className="absolute inset-0 transition-[opacity,filter] duration-[1200ms] ease-out"
        style={{
          opacity: enabled ? 1 : 0,
          filter: enabled ? "blur(0px)" : "blur(28px)",
        }}
      >
        <SceneStack scene={scene} />
        <WeatherEffectsLayer effects={enabled ? effects : []} />
      </div>

      {/* Premium dark gradient revealed when the wallpaper is disabled. */}
      <div
        className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
        style={{
          opacity: enabled ? 0 : 1,
          backgroundImage:
            "linear-gradient(160deg, #0b1220 0%, #0e1524 45%, #10182a 100%)",
        }}
      />

      {/* Always-on subtle vignette so content stays legible over any scene. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/45" />
    </div>
  );
}