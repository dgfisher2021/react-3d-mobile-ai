/**
 * Single source of truth for ALL shared values across the 4 demos.
 * Every demo imports from here — no hardcoded duplicates.
 */

/** Camera / viewport */
export const CAMERA = {
  fov: 35,
  z: 5.5,
  minDistance: 3,
  maxDistance: 8,
  minPolarAngle: Math.PI / 6, // 30°
  maxPolarAngle: Math.PI / 1.5, // 120°
  dampingFactor: 0.05,
} as const;

/**
 * Auto-rotate speed, expressed in each system's native units.
 * All produce ~9 deg/sec at 60fps.
 *
 *   OrbitControls: speed 1.5 → 2π/60 * 1.5 = 0.157 rad/s
 *   Imperative Three.js: 0.00262 rad/frame * 60fps = 0.157 rad/s
 *   CSS degrees: 0.15 deg/frame * 60fps = 9 deg/s = 0.157 rad/s
 */
export const AUTO_ROTATE = {
  orbitControlsSpeed: 1.5,
  imperativeRadPerFrame: 0.00262,
  cssDegPerFrame: 0.15,
} as const;

/** drei Float parameters — used by R3F and GLB demos */
export const FLOAT = {
  speed: 1.5,
  rotationIntensity: 0.1,
  floatIntensity: 0.3,
} as const;

/**
 * View presets in every coordinate system.
 * - `rad`: rotation applied directly to the mesh (Three.js Canvas demo)
 * - `orbit`: azimuthal + polar angles for OrbitControls (R3F, GLB)
 * - `cssDeg`: rotateX/rotateY degrees (CSS 3D)
 *
 * The radian values are canonical; orbit and CSS are derived to produce
 * the same visual result from their respective camera models.
 */
export const VIEW_PRESETS = [
  {
    label: 'Front',
    rad: { x: 0, y: 0 },
    orbit: { azimuth: 0, polar: Math.PI / 2 },
    cssDeg: { x: 0, y: 0 },
  },
  {
    label: 'Angle',
    rad: { x: -0.14, y: 0.38 },
    orbit: { azimuth: 0.38, polar: Math.PI / 2 - 0.14 },
    cssDeg: { x: -8, y: 22 },
  },
  {
    label: 'Back',
    rad: { x: -0.105, y: Math.PI },
    orbit: { azimuth: Math.PI, polar: Math.PI / 2 - 0.105 },
    cssDeg: { x: -6, y: 180 },
  },
] as const;

/** The starting/auto-reset position (slightly angled, like "Angle" but softer). */
export const AUTO_RESET = {
  rad: { x: -0.14, y: 0.38 },
  orbit: { azimuth: 0.38, polar: Math.PI / 2 - 0.14 },
  cssDeg: { x: -8, y: 22 },
} as const;

/** Screen display constants shared across all demos */
export const SCREEN = {
  width: 393,
  height: 852,
  cornerRadius: 42,
  distanceFactor: 1.35,
} as const;

/** Background gradient used by all demos */
export const BG_GRADIENT = 'linear-gradient(160deg, #080c18, #0d1b2e, #0a1628)';
