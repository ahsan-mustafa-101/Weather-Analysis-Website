import { SceneCategory } from "@/lib/weatherTheme";
import { getSceneBackgroundStyle } from "@/lib/sceneStyles";
import MountainSilhouette from "./MountainSilhouette";
import NoiseOverlay from "./NoiseOverlay";

interface SceneLayerProps {
  scene: SceneCategory;
  /** Controls the crossfade: layers mount at opacity 0 and are pushed to 1 by the parent on the next frame. */
  opacity: number;
}

export default function SceneLayer({ scene, opacity }: SceneLayerProps) {
  return (
    <div
      className="absolute inset-0 transition-opacity ease-linear"
      style={{ ...getSceneBackgroundStyle(scene), opacity, transitionDuration: "3000ms" }}
    >
      <MountainSilhouette />
      <NoiseOverlay />
    </div>
  );
}