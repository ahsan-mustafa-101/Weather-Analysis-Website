import { AccentToken } from "./weatherTheme";

/**
 * Tailwind's compiler only includes classes it can find as literal
 * strings in source. Building a class name at runtime — e.g.
 * `text-${theme.accent}` — will not work, because that exact string
 * never appears anywhere for Tailwind to scan. This lookup exists so
 * every accent-colored class is spelled out literally once, here,
 * and components just index into it.
 */
export interface AccentClasses {
  text: string;
  border: string;
  glow: string; // box-shadow-based soft glow, applied directly
  /** Same border color, pre-composed with the hover: variant for hover-only states. */
  hoverBorder: string;
  /** Same glow, pre-composed with the hover: variant for hover-only states. */
  hoverGlow: string;
}

export const ACCENT_CLASSES: Record<AccentToken, AccentClasses> = {
  "accent-gold": {
    text: "text-accent-gold",
    border: "border-accent-gold/30",
    glow: "shadow-[0_0_32px_rgba(232,184,101,0.25)]",
    hoverBorder: "hover:border-accent-gold/30",
    hoverGlow: "hover:shadow-[0_0_32px_rgba(232,184,101,0.25)]",
  },
  "accent-ice": {
    text: "text-accent-ice",
    border: "border-accent-ice/30",
    glow: "shadow-[0_0_32px_rgba(168,216,236,0.25)]",
    hoverBorder: "hover:border-accent-ice/30",
    hoverGlow: "hover:shadow-[0_0_32px_rgba(168,216,236,0.25)]",
  },
  "accent-cool": {
    text: "text-accent-cool",
    border: "border-accent-cool/30",
    glow: "shadow-[0_0_32px_rgba(111,168,220,0.25)]",
    hoverBorder: "hover:border-accent-cool/30",
    hoverGlow: "hover:shadow-[0_0_32px_rgba(111,168,220,0.25)]",
  },
  "accent-storm": {
    text: "text-accent-storm",
    border: "border-accent-storm/30",
    glow: "shadow-[0_0_32px_rgba(139,123,199,0.25)]",
    hoverBorder: "hover:border-accent-storm/30",
    hoverGlow: "hover:shadow-[0_0_32px_rgba(139,123,199,0.25)]",
  },
  "accent-aurora": {
    text: "text-accent-aurora",
    border: "border-accent-aurora/30",
    glow: "shadow-[0_0_32px_rgba(94,234,212,0.25)]",
    hoverBorder: "hover:border-accent-aurora/30",
    hoverGlow: "hover:shadow-[0_0_32px_rgba(94,234,212,0.25)]",
  },
  "accent-mist": {
    text: "text-accent-mist",
    border: "border-accent-mist/30",
    glow: "shadow-[0_0_32px_rgba(154,165,184,0.2)]",
    hoverBorder: "hover:border-accent-mist/30",
    hoverGlow: "hover:shadow-[0_0_32px_rgba(154,165,184,0.2)]",
  },
};