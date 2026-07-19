"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { atmosphereFragmentShader, atmosphereVertexShader } from "@/lib/atmosphereShader";
import { useAnimationGate } from "@/lib/useAnimationGate";

const IDLE_SPIN_SPEED = 0.063; // rad/sec, ~ one full turn every ~100s
const CLOUDS_EXTRA_SPIN = 0.012; // rad/sec, drifts slightly faster than the surface
const ROTATE_DAMPING = 3; // higher = snappier arrival when rotating to a searched city
const TILT_DAMPING = 4;
const PULSE_DAMPING = 5;
const GLOW_COLOR = "#5eead4"; // matches the app's aurora accent

interface EarthGlobeProps {
  targetLongitude: number | null;
}

export default function EarthGlobe({ targetLongitude }: EarthGlobeProps) {
  const spinGroupRef = useRef<THREE.Group>(null);
  const tiltGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const targetRotationRef = useRef(0); // continuously-accumulating absolute target angle
  const isHoveredRef = useRef(false);
  const pulseRef = useRef(0);

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

  const atmosphereUniforms = useMemo(
    () => ({ glowColor: { value: new THREE.Color(GLOW_COLOR) } }),
    []
  );

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

    if (!isHoveredRef.current) {
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
      const targetTiltX = isHoveredRef.current ? -state.pointer.y * 0.15 : 0;
      const targetTiltZ = isHoveredRef.current ? state.pointer.x * 0.1 : 0;
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

      pulseRef.current = THREE.MathUtils.damp(pulseRef.current, 0, PULSE_DAMPING, delta);
      tiltGroupRef.current.scale.setScalar(1 + pulseRef.current * 0.08);
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
  function handleClick() {
    pulseRef.current = 1;
  }

  return (
    <group ref={spinGroupRef}>
      <group
        ref={tiltGroupRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
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

        {/* Atmosphere glow */}
        <mesh scale={1.12}>
          <sphereGeometry args={[1, 64, 64]} />
          <shaderMaterial
            vertexShader={atmosphereVertexShader}
            fragmentShader={atmosphereFragmentShader}
            uniforms={atmosphereUniforms}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}