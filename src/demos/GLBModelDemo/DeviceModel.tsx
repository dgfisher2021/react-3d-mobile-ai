import { Float, Html, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { LiveDashboard } from '../../components/dashboard/LiveDashboard';
import { FLOAT } from '../../constants/demoSettings';
import { useSettingsContext } from '../../context/SettingsContext';
import { PHONE } from '../ThreeJsCanvasDemo/phoneConstants';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ThemeName } from '../../types';
import type { DeviceConfig, ModelOverrides } from './deviceConfigs';

/** Target height in world units — matches the procedural phone in the other demos. */
const TARGET_H = PHONE.h; // 3.0

const DEG2RAD = Math.PI / 180;

export interface ModelInfo {
  boundingBox: { w: number; h: number; d: number };
  normalizeScale: number;
  screenCenter: [number, number, number] | null;
  screenSize: { w: number; h: number } | null;
  distanceFactor: number;
}

interface DeviceModelProps {
  config: DeviceConfig;
  themeName: ThemeName;
  onToggleTheme: () => void;
  showScreen: boolean;
  overrides?: ModelOverrides;
  onModelInfo?: (info: ModelInfo) => void;
}

export function DeviceModel({
  config,
  themeName,
  onToggleTheme,
  showScreen,
  overrides,
  onModelInfo,
}: DeviceModelProps) {
  const { scene } = useGLTF(config.glbPath);
  const groupRef = useRef<THREE.Group>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const reducedMotion = useReducedMotion();
  const { cornerRadius: ctxCornerRadius } = useSettingsContext();
  const [screenCenter, setScreenCenter] = useState<THREE.Vector3 | null>(null);
  const [screenWorldSize, setScreenWorldSize] = useState<THREE.Vector3 | null>(null);
  const [autoScreenDims, setAutoScreenDims] = useState<{
    distanceFactor: number;
    htmlWidth: number;
    htmlHeight: number;
  } | null>(null);

  // Compute scale factor and bounding box info
  const { normalizeScale, bbox } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    return {
      normalizeScale: maxDim === 0 ? 1 : TARGET_H / maxDim,
      bbox: { w: size.x, h: size.y, d: size.z },
    };
  }, [scene]);

  // After mount: find the screen mesh and compute its world-space center
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.updateMatrixWorld(true);

    let screenMesh: THREE.Mesh | null = null;
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name === config.screenNode) {
        screenMesh = child as THREE.Mesh;
      }
    });

    if (screenMesh) {
      screenMeshRef.current = screenMesh;

      const screenBox = new THREE.Box3().setFromObject(screenMesh);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      screenBox.getCenter(center);
      screenBox.getSize(size);
      setScreenCenter(center.clone());
      setScreenWorldSize(size.clone());

      // Auto-compute screen dimensions from mesh geometry.
      // The mesh bounding box has 3 dimensions — the smallest is depth
      // (thickness of the screen quad). The other two are width and height.
      const dims = [size.x, size.y, size.z].sort((a, b) => b - a);
      // dims[0] = largest (height for portrait), dims[1] = second (width), dims[2] = depth
      const screenW = config.portrait ? dims[1] : dims[0];
      const screenH = config.portrait ? dims[0] : dims[1];
      const BASE_CSS_WIDTH = 393;
      const autoDF = screenW;
      const autoHeight = Math.round(BASE_CSS_WIDTH * (screenH / screenW));

      setAutoScreenDims({
        distanceFactor: autoDF,
        htmlWidth: BASE_CSS_WIDTH,
        htmlHeight: autoHeight,
      });

      onModelInfo?.({
        boundingBox: bbox,
        normalizeScale,
        screenCenter: [center.x, center.y, center.z],
        screenSize: { w: screenW, h: screenH },
        distanceFactor: autoDF,
      });
    } else {
      console.warn(`[GLB] Screen node "${config.screenNode}" not found`);
      onModelInfo?.({
        boundingBox: bbox,
        normalizeScale,
        screenCenter: null,
        screenSize: null,
        distanceFactor: config.distanceFactor,
      });
    }
  }, [
    config.id,
    config.screenNode,
    config.portrait,
    config.distanceFactor,
    normalizeScale,
    bbox,
    onModelInfo,
  ]);

  // Toggle screen material transparency
  useEffect(() => {
    const mesh = screenMeshRef.current;
    if (!mesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (showScreen) {
      mat.opacity = 0;
      mat.transparent = true;
    } else {
      mat.opacity = 1;
      mat.transparent = false;
    }
  }, [showScreen]);

  // Screen sizing: use auto-computed values from mesh geometry, fall back to config

  // Convert from actual values to Three.js inputs
  // scale: if overrides.scale is 0 (default/unset), use normalizeScale * 1
  const actualScale = overrides?.scale && overrides.scale > 0 ? overrides.scale : normalizeScale;
  const pos = overrides?.position ?? [0, 0, 0];
  const rot = overrides?.rotation ?? [0, 0, 0];
  const screenPos = overrides?.screenPosition ?? config.htmlPosition;

  return (
    <Float
      speed={reducedMotion ? 0 : FLOAT.speed}
      rotationIntensity={reducedMotion ? 0 : FLOAT.rotationIntensity}
      floatIntensity={reducedMotion ? 0 : FLOAT.floatIntensity}
    >
      <group position={pos} rotation={[rot[0] * DEG2RAD, rot[1] * DEG2RAD, rot[2] * DEG2RAD]}>
        <group ref={groupRef} scale={actualScale} rotation={config.modelRotation}>
          <primitive object={scene} />
        </group>

        {showScreen && screenCenter && (
          <Html
            transform
            occlude="blending"
            position={[
              screenCenter.x + screenPos[0],
              screenCenter.y + screenPos[1],
              screenCenter.z + screenPos[2],
            ]}
            rotation={config.htmlRotation}
            distanceFactor={autoScreenDims?.distanceFactor ?? config.distanceFactor}
            style={{
              width: autoScreenDims?.htmlWidth ?? config.htmlSize.width,
              height: autoScreenDims?.htmlHeight ?? config.htmlSize.height,
              borderRadius: config.portrait ? ctxCornerRadius : 8,
              overflow: 'hidden',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div
              onPointerDown={(e) => e.stopPropagation()}
              style={{ width: '100%', height: '100%' }}
            >
              <LiveDashboard themeName={themeName} onToggleTheme={onToggleTheme} />
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}
