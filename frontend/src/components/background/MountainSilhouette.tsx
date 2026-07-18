/**
 * A single abstract horizon silhouette (mountain ridge + one small
 * pavilion/lantern shape hinting at the garden) reused across every
 * scene. Deliberately understated — per the brief, "nothing should
 * feel fantasy, everything should feel believable" — so this stays
 * a soft dark silhouette rather than literal illustrated detail.
 * Same shape everywhere; only the gradient behind it (sceneStyles.ts)
 * changes, which is what makes the seven scenes read as one world
 * rather than seven unrelated wallpapers.
 */
export default function MountainSilhouette() {
  return (
    <svg
      className="absolute inset-x-0 bottom-0 h-[38%] w-full"
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <path
        d="M0 400 L0 260 L120 190 L230 250 L340 150 L430 220 L520 120 L640 230 L760 160 L880 240 L980 170 L1090 250 L1200 200 L1200 400 Z"
        fill="rgba(6,10,18,0.55)"
      />
      <path
        d="M0 400 L0 320 L150 280 L280 330 L420 270 L560 320 L700 260 L860 330 L1000 290 L1200 340 L1200 400 Z"
        fill="rgba(6,10,18,0.75)"
      />
      {/* single small pavilion silhouette, garden-side */}
      <g transform="translate(945, 255)" fill="rgba(6,10,18,0.85)">
        <path d="M-26 34 L26 34 L26 20 L0 20 L0 6 L-26 20 Z" />
        <rect x="-3" y="6" width="6" height="28" />
      </g>
    </svg>
  );
}