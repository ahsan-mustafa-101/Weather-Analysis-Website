import { CSSProperties } from "react";
import { SceneCategory } from "./weatherTheme";

/**
 * One gradient "look" per scene category. These are full CSSProperties
 * objects, not Tailwind classes — a 3-4 stop radial/linear gradient
 * has too much unique per-scene arithmetic to encode as arbitrary
 * Tailwind values without it becoming unreadable, and it wouldn't
 * gain us anything since these are only ever used in one place
 * (SceneLayer). Colors intentionally reference the same hex values
 * as the palette in globals.css / accentClasses.ts, just written out
 * since CSS custom properties can't be used inside gradient stops
 * defined ahead-of-time here without duplicating the var() calls
 * anyway.
 *
 * Each scene is built from the same recipe so they read as one
 * consistent world rather than seven unrelated backgrounds:
 *   1. a base sky gradient (navy -> charcoal, vertical)
 *   2. a horizon glow (radial, positioned low, tinted per condition)
 *   3. a secondary accent glow (sun/moon position, upper area)
 */
export function getSceneBackgroundStyle(scene: SceneCategory): CSSProperties {
  switch (scene) {
    case "clear-day":
      return {
        backgroundImage: `
          radial-gradient(60% 45% at 78% 18%, rgba(232,184,101,0.35) 0%, rgba(232,184,101,0) 70%),
          radial-gradient(90% 55% at 50% 100%, rgba(232,184,101,0.16) 0%, rgba(59,74,107,0) 60%),
          linear-gradient(180deg, #0e1729 0%, #182238 45%, #1b2740 100%)
        `,
      };
    case "clear-night":
      return {
        backgroundImage: `
          radial-gradient(50% 40% at 25% 15%, rgba(245,247,250,0.14) 0%, rgba(245,247,250,0) 70%),
          radial-gradient(100% 60% at 50% 100%, rgba(94,234,212,0.14) 0%, rgba(94,234,212,0) 65%),
          linear-gradient(180deg, #060a14 0%, #0b1220 45%, #101a2c 100%)
        `,
      };
    case "cloudy":
      return {
        backgroundImage: `
          radial-gradient(80% 50% at 50% 0%, rgba(154,165,184,0.10) 0%, rgba(154,165,184,0) 70%),
          radial-gradient(90% 55% at 50% 100%, rgba(59,74,107,0.25) 0%, rgba(59,74,107,0) 65%),
          linear-gradient(180deg, #131826 0%, #1a2030 50%, #1c2333 100%)
        `,
      };
    case "fog":
      return {
        backgroundImage: `
          radial-gradient(100% 60% at 50% 40%, rgba(154,165,184,0.22) 0%, rgba(154,165,184,0) 70%),
          radial-gradient(90% 50% at 50% 100%, rgba(154,165,184,0.14) 0%, rgba(154,165,184,0) 65%),
          linear-gradient(180deg, #171c28 0%, #1e2432 50%, #232a3a 100%)
        `,
      };
    case "rain":
      return {
        backgroundImage: `
          radial-gradient(70% 45% at 50% 10%, rgba(111,168,220,0.14) 0%, rgba(111,168,220,0) 70%),
          radial-gradient(90% 55% at 50% 100%, rgba(111,168,220,0.20) 0%, rgba(111,168,220,0) 65%),
          linear-gradient(180deg, #0a0e18 0%, #101827 45%, #131d2e 100%)
        `,
      };
    case "snow":
      return {
        backgroundImage: `
          radial-gradient(70% 45% at 35% 12%, rgba(168,216,236,0.22) 0%, rgba(168,216,236,0) 70%),
          radial-gradient(100% 60% at 50% 100%, rgba(168,216,236,0.20) 0%, rgba(168,216,236,0) 65%),
          linear-gradient(180deg, #131c2c 0%, #1c2c40 50%, #223047 100%)
        `,
      };
    case "storm":
      return {
        backgroundImage: `
          radial-gradient(80% 50% at 50% 0%, rgba(139,123,199,0.16) 0%, rgba(139,123,199,0) 70%),
          radial-gradient(90% 55% at 50% 100%, rgba(139,123,199,0.14) 0%, rgba(139,123,199,0) 65%),
          linear-gradient(180deg, #05060a 0%, #0c0e17 50%, #10121e 100%)
        `,
      };
  }
}