"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import EarthGlobe from "./EarthGlobe";

interface EarthCanvasProps {
  targetLongitude: number | null;
}

/**
 * Transparent canvas (alpha: true, no scene background set) so the
 * Earth sits directly on the glass hero panel rather than in its own
 * boxed-in space — consistent with how the rest of the app avoids
 * hard-edged decorative panels.
 */
export default function EarthCanvas({ targetLongitude }: EarthCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.1], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
    >
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#8fb8ff", "#3a2a1a", 0.4]} />
      <directionalLight position={[4, 2, 3]} intensity={1.6} color="#fff4e0" />
      <Suspense fallback={null}>
        <EarthGlobe targetLongitude={targetLongitude} />
      </Suspense>
    </Canvas>
  );
}