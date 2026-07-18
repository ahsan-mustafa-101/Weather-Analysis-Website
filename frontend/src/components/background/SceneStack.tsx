"use client";

import { useEffect, useRef, useState } from "react";
import { SceneCategory } from "@/lib/weatherTheme";
import SceneLayer from "./SceneLayer";

interface Layer {
  key: number;
  scene: SceneCategory;
}

const TRANSITION_MS = 3000;

/**
 * Crossfades between scene backgrounds over ~3s, per the brief
 * ("never abruptly change scenes"). Technique: each scene change
 * pushes a new, fully-opaque-eligible layer on top of the stack.
 * It starts at opacity 0, gets nudged to opacity 1 on the next
 * frame (so the browser actually animates the transition instead of
 * skipping straight to the end state), and visually "wipes" over
 * whatever was beneath it. Once the fade finishes, older layers are
 * discarded — they're fully hidden underneath by then, so this is a
 * pure cleanup step to stop the DOM from growing on repeated
 * changes.
 */
export default function SceneStack({ scene }: { scene: SceneCategory }) {
  const [layers, setLayers] = useState<Layer[]>([{ key: 0, scene }]);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set([0]));
  const nextKey = useRef(1);
  const cleanupTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    setLayers((prev) => {
      const top = prev[prev.length - 1];
      if (top && top.scene === scene) return prev;
      const key = nextKey.current++;
      const next = [...prev, { key, scene }];

      // Trigger the fade-in on the next paint.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisibleKeys((v) => new Set(v).add(key));
        });
      });

      // Drop everything below the new top layer once its fade completes.
      const timer = setTimeout(() => {
        setLayers((current) => current.filter((l) => l.key === key));
        setVisibleKeys(new Set([key]));
        cleanupTimers.current.delete(timer);
      }, TRANSITION_MS + 200);
      cleanupTimers.current.add(timer);

      return next;
    });
  }, [scene]);

  useEffect(() => {
    const timers = cleanupTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <>
      {layers.map((layer) => (
        <SceneLayer
          key={layer.key}
          scene={layer.scene}
          opacity={visibleKeys.has(layer.key) ? 1 : 0}
        />
      ))}
    </>
  );
}