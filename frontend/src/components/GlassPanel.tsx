import { HTMLAttributes } from "react";
import clsx from "clsx";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Renders a slightly stronger blur/border for surfaces that float above other glass (e.g. dropdowns). */
  elevated?: boolean;
}

/**
 * The one place that defines "what glass looks like" on this site.
 * Every frosted surface (hero card, search dropdown, forecast cards,
 * and any future panel — chatbot widget, analytics cards) should
 * compose this rather than re-declaring backdrop-blur/border/shadow
 * inline, so the material stays consistent if we ever tune it.
 */
export default function GlassPanel({
  elevated = false,
  className,
  children,
  ...rest
}: GlassPanelProps) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
        elevated && "border-white/15 bg-white/[0.09] shadow-[0_16px_48px_rgba(0,0,0,0.35)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}