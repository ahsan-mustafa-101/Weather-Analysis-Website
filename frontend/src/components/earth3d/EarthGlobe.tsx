"use client";

import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useAnimationGate } from "@/lib/useAnimationGate";

const IDLE_SPIN_SPEED = 0.063; // rad/sec, ~ one full turn every ~100s
const CLOUDS_EXTRA_SPIN = 0.012; // rad/sec, drifts slightly faster than the surface
const ROTATE_DAMPING = 3; // higher = snappier arrival when rotating to a searched city
const TILT_DAMPING = 5;
const GLOBE_SCALE = 1.6; // overall size bump — was reading too small in the hero
const HIT_AREA_RADIUS = 2.4; // invisible sphere for a generous hover/click target beyond the visible surface

interface EarthGlobeProps {
  targetLongitude: number | null;
}

export default function EarthGlobe({ targetLongitude }: EarthGlobeProps) {
  const spinGroupRef = useRef<THREE.Group>(null);
  const tiltGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const targetRotationRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);

  const active = useAnimationGate();
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const { day, normal, specular, clouds, lights } = useTexture(
    {
      day: "/textures/earth/earth_atmos_2048.jpg",
      normal: "/textures/earth/earth_normal_2048.jpg",
      specular: "/textures/earth/earth_specular_2048.jpg",
      clouds: "/textures/earth/earth_clouds_1024.png",
      lights: "/textures/earth/earth_lights_2048.png",
    },
    // drei's TS types claim onLoad receives the keyed {day, normal, ...}
    // object the hook itself returns, but at runtime (see
    // node_modules/@react-three/drei/core/Texture.js) it actually
    // passes the raw texture array in Object.values() order of the
    // input above — confirmed by a runtime crash when treating it as
    // the keyed shape. Casting to the real runtime type here rather
    // than trusting the (incorrect) declared one.
    ((loaded: THREE.Texture[]) => {
      const [loadedDay, , , loadedClouds, loadedLights] = loaded;
      // Color-managed textures need explicit sRGB; normal/specular
      // are data maps, not colors, and should stay linear (default).
      loadedDay.colorSpace = THREE.SRGBColorSpace;
      loadedClouds.colorSpace = THREE.SRGBColorSpace;
      loadedLights.colorSpace = THREE.SRGBColorSpace;
      loadedDay.anisotropy = 8;
    }) as unknown as (texture: Record<"day" | "normal" | "specular" | "clouds" | "lights", THREE.Texture>) => void
  );

  // Rotate toward the searched city's longitude. Nudges the

  // Rotate toward the searched city's longitude. Nudges the
  // accumulating target by the shortest angular path rather than
  // snapping to an absolute value, so idle spin can resume smoothly
  // from wherever it lands rather than resetting.
  useEffect(() => {
    if (targetLongitude === null) return;
    const desired = (-targetLongitude * Math.PI) / 180;
    const current = targetRotationRef.current;
    const currentMod = current % (Math.PI * 2);
    let delta = desired - currentMod;
    delta = ((delta + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    targetRotationRef.current = current + delta;
  }, [targetLongitude]);

  useFrame((state, delta) => {
    if (!activeRef.current) return;

    if (!isHoveredRef.current && !isDraggingRef.current) {
      targetRotationRef.current += IDLE_SPIN_SPEED * delta;
    }

    if (spinGroupRef.current) {
      spinGroupRef.current.rotation.y = THREE.MathUtils.damp(
        spinGroupRef.current.rotation.y,
        targetRotationRef.current,
        ROTATE_DAMPING,
        delta
      );
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += CLOUDS_EXTRA_SPIN * delta;
    }

    if (tiltGroupRef.current) {
      const targetTiltX = isHoveredRef.current ? -state.pointer.y * 0.4 : 0;
      const targetTiltZ = isHoveredRef.current ? state.pointer.x * 0.3 : 0;
      tiltGroupRef.current.rotation.x = THREE.MathUtils.damp(
        tiltGroupRef.current.rotation.x,
        targetTiltX,
        TILT_DAMPING,
        delta
      );
      tiltGroupRef.current.rotation.z = THREE.MathUtils.damp(
        tiltGroupRef.current.rotation.z,
        targetTiltZ,
        TILT_DAMPING,
        delta
      );

    }
  });

  function handlePointerEnter() {
    isHoveredRef.current = true;
    document.body.style.cursor = "pointer";
  }
  function handlePointerLeave() {
    isHoveredRef.current = false;
    document.body.style.cursor = "auto";
  }
  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    isDraggingRef.current = true;
    lastPointerXRef.current = e.clientX;
    (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
  }

  function handlePointerUp() {
    isDraggingRef.current = false;
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastPointerXRef.current;
    lastPointerXRef.current = e.clientX;
    targetRotationRef.current += deltaX * 0.012;
  }
  

  return (
    <group ref={spinGroupRef} scale={GLOBE_SCALE}>
      <group
        ref={tiltGroupRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        {/* Invisible, larger-than-visible-surface hit target: hover/click
            now respond within this radius rather than only when the
            cursor is precisely over the rendered sphere. Placed first
            but has zero visual effect (fully transparent, no depth
            write) — it exists purely for raycasting. */}
        <mesh>
          <sphereGeometry args={[HIT_AREA_RADIUS, 24, 24]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
        </mesh>

        {/* Surface */}
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial
            map={day}
            normalMap={normal}
            specularMap={specular}
            specular="#333344"
            shininess={9}
          />
        </mesh>

        {/* Night-side city lights, low-intensity additive accent rather than a physically exact day/night blend */}
        <mesh scale={1.001}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial
            map={lights}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Clouds, drifting slightly faster than the surface */}
        <mesh ref={cloudsRef} scale={1.015}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshLambertMaterial map={clouds} transparent opacity={0.85} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
