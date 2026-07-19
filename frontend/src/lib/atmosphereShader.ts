/**
 * Classic Fresnel-based atmosphere glow: intensity increases toward
 * the silhouette edge of the sphere (where the surface normal is
 * near-perpendicular to the view direction), producing a soft rim
 * light. Rendered on a slightly-larger, back-face sphere with
 * additive blending in EarthGlobe.tsx. This is a well-established
 * technique (used across most public three.js Earth demos), chosen
 * over something more novel specifically because it's a known-good
 * pattern — this project's sandbox has no way to visually render
 * WebGL output to double-check a custom shader by eye.
 */
export const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
    gl_FragColor = vec4(glowColor, 1.0) * intensity;
  }
`;