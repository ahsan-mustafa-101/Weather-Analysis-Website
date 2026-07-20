"use client";

import { useEffect, useRef } from "react";
import { useAnimationGate } from "@/lib/useAnimationGate";

interface ParticleFieldProps {
  kind: "rain" | "snow";
}

interface Particle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  length: number; // rain streak length / snow radius
  opacity: number;
  swayPhase: number; // snow only
}

const RAIN_COLOR = "168, 216, 236"; // accent-cool-ish, cool blue streak
const SNOW_COLOR = "245, 247, 250"; // mist white

/**
 * Renders drifting rain or snow as a fixed full-screen canvas.
 * requestAnimationFrame-driven, capped particle count, delta-time
 * normalized so speed doesn't change with frame rate. Pauses (via
 * useAnimationGate) when the tab is hidden or the user has
 * prefers-reduced-motion set, rather than tearing down the canvas.
 */
export default function ParticleField({ kind }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const active = useAnimationGate();
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedParticles(window.innerWidth, window.innerHeight);
    }

    function seedParticles(width: number, height: number) {
      // Mobile devices generally pair smaller screens with weaker
      // GPUs — fewer particles still reads as "raining"/"snowing"
      // at that size, and it's meaningfully cheaper per frame.
      const isMobileViewport = width < 640;
      const mobileScale = isMobileViewport ? 0.55 : 1;

      const density = (kind === "rain" ? 0.00016 : 0.00009) * mobileScale;
      const cap = Math.round((kind === "rain" ? 220 : 140) * mobileScale);
      const count = Math.min(Math.round(width * height * density), cap);

      particlesRef.current = Array.from({ length: count }, () =>
        kind === "rain"
          ? {
              x: Math.random() * width,
              y: Math.random() * height,
              vy: 780 + Math.random() * 420,
              vx: -60 - Math.random() * 40,
              length: 14 + Math.random() * 12,
              opacity: 0.15 + Math.random() * 0.25,
              swayPhase: 0,
            }
          : {
              x: Math.random() * width,
              y: Math.random() * height,
              vy: 30 + Math.random() * 50,
              vx: 0,
              length: 1.2 + Math.random() * 2.2,
              opacity: 0.35 + Math.random() * 0.5,
              swayPhase: Math.random() * Math.PI * 2,
            }
      );
    }

    resize();
    window.addEventListener("resize", resize);

    function draw(time: number) {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (!activeRef.current) {
        lastTimeRef.current = time;
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const dt = lastTimeRef.current ? Math.min((time - lastTimeRef.current) / 1000, 0.05) : 0;
      lastTimeRef.current = time;

      ctx!.clearRect(0, 0, width, height);

      for (const p of particlesRef.current) {
        p.y += p.vy * dt;
        p.x += p.vx * dt;

        if (kind === "snow") {
          p.swayPhase += dt * 1.2;
          p.x += Math.sin(p.swayPhase) * 8 * dt;
        }

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        if (kind === "rain") {
          ctx!.strokeStyle = `rgba(${RAIN_COLOR}, ${p.opacity})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x + p.vx * 0.02, p.y + p.length);
          ctx!.stroke();
        } else {
          ctx!.fillStyle = `rgba(${SNOW_COLOR}, ${p.opacity})`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.length, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [kind]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}