export interface ModelOverrides {
  position: [number, number, number]; // actual world position
  rotation: [number, number, number]; // actual rotation in degrees
  scale: number; // actual applied scale (normalizeScale * multiplier)
  screenPosition: [number, number, number]; // actual screen world position
  htmlRotation: [number, number, number]; // screen overlay rotation in degrees
}

export function getDefaultOverrides(config: DeviceConfig): ModelOverrides {
  const defaults: ModelOverrides = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 0, // 0 means "use normalizeScale * 1" (computed after mount)
    screenPosition: config.htmlPosition,
    htmlRotation: [
      config.htmlRotation[0] * (180 / Math.PI),
      config.htmlRotation[1] * (180 / Math.PI),
      config.htmlRotation[2] * (180 / Math.PI),
    ],
  };

  if (config.id === 'macbook') {
    defaults.position = [0, -0.5, 0];
    defaults.scale = 0.25;
  }

  return defaults;
}

export interface DeviceConfig {
  id: string;
  label: string;
  glbPath: string;
  /** Node name of the screen mesh inside the GLB (material gets replaced). */
  screenNode: string;
  /** Fine-tune offset for <Html> position relative to the screen mesh center. */
  htmlPosition: [number, number, number];
  /** Rotation of the <Html> element (Euler XYZ). */
  htmlRotation: [number, number, number];
  /** CSS pixel dimensions for the <Html> wrapper. */
  htmlSize: { width: number; height: number };
  /** Fallback distanceFactor if auto-compute fails. */
  distanceFactor: number;
  /** Base rotation to orient the model facing the camera (Euler XYZ in radians). */
  modelRotation: [number, number, number];
  /** Whether the screen is portrait (phone/tablet) vs landscape (laptop/desktop). */
  portrait: boolean;
}

const base = import.meta.env.BASE_URL;

export const DEVICES: DeviceConfig[] = [
  {
    id: 'iphone',
    label: 'iPhone 13 Pro',
    glbPath: `${base}apple_iphone_13_pro_max.glb`,
    screenNode: 'Body_Wallpaper_0',
    htmlPosition: [0, 0, -0.025],
    htmlRotation: [0, 0, 0],
    htmlSize: { width: 393, height: 852 },
    distanceFactor: 1.5,
    modelRotation: [0, Math.PI, 0],
    portrait: true,
  },
  {
    id: 'macbook',
    label: 'MacBook Pro',
    glbPath: `${base}macbook.glb`,
    screenNode: 'Cube008_2',
    htmlPosition: [0, 2, 0.04],
    htmlRotation: [(0.8 * Math.PI) / 180, 0, 0],
    htmlSize: { width: 668, height: 432 },
    distanceFactor: 1.5,
    modelRotation: [0, 0, 0],
    portrait: false,
  },
  {
    id: 'imac',
    label: 'iMac 2021',
    glbPath: `${base}imac_2021.glb`,
    screenNode: 'Screen_Screen_0',
    htmlPosition: [0, 0, 0.01],
    htmlRotation: [0, 0, 0],
    htmlSize: { width: 668, height: 432 },
    distanceFactor: 1.5,
    modelRotation: [0, 0, 0],
    portrait: false,
  },
  {
    id: 'ipad',
    label: 'iPad Pro',
    glbPath: `${base}apple_ipad_pro.glb`,
    screenNode: 'iPad_Pro_2020_screen_0',
    htmlPosition: [0, 0, 0.005],
    htmlRotation: [0, 0, 0],
    htmlSize: { width: 512, height: 683 },
    distanceFactor: 1.5,
    modelRotation: [0, Math.PI, 0],
    portrait: true,
  },
  {
    id: 'monitor',
    label: 'Office Monitor',
    glbPath: `${base}office_monitor__workstation_monitor.glb`,
    screenNode: 'group_0002_layar_0',
    htmlPosition: [0, 0, 0.5],
    htmlRotation: [0, 0, 0],
    htmlSize: { width: 668, height: 432 },
    distanceFactor: 1.5,
    modelRotation: [0, 0, 0],
    portrait: false,
  },
];
