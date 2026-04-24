import { Float, Html, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { LiveDashboard } from '../../components/dashboard/LiveDashboard';
import { FLOAT } from '../../constants/demoSettings';
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
  const [screenCenter, setScreenCenter] = useState<THREE.Vector3 | null>(null);
  const [screenWorldSize, setScreenWorldSize] = useState<THREE.Vector3 | null>(null);

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

      const df = Math.max(size.x, size.y) * (config.portrait ? 1.15 : 1.6);
      onModelInfo?.({
        boundingBox: bbox,
        normalizeScale,
        screenCenter: [center.x, center.y, center.z],
        screenSize: { w: size.x, h: size.y },
        distanceFactor: df,
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

  // Auto-compute distanceFactor from the screen's world size
  const computedDistanceFactor = screenWorldSize
    ? Math.max(screenWorldSize.x, screenWorldSize.y) * (config.portrait ? 1.15 : 1.6)
    : config.distanceFactor;

  const appliedScale = normalizeScale * (overrides?.scale ?? 1);
  const pos = overrides?.position ?? [0, 0, 0];
  const rot = overrides?.rotation ?? [0, 0, 0];
  const screenOff = overrides?.screenOffset ?? config.htmlPosition;

  return (
    <Float
      speed={reducedMotion ? 0 : FLOAT.speed}
      rotationIntensity={reducedMotion ? 0 : FLOAT.rotationIntensity}
      floatIntensity={reducedMotion ? 0 : FLOAT.floatIntensity}
    >
      <group position={pos} rotation={[rot[0] * DEG2RAD, rot[1] * DEG2RAD, rot[2] * DEG2RAD]}>
        <group ref={groupRef} scale={appliedScale}>
          <primitive object={scene} />
        </group>
      </group>

      {showScreen && screenCenter && (
        <Html
          transform
          position={[
            screenCenter.x + screenOff[0],
            screenCenter.y + screenOff[1],
            screenCenter.z + screenOff[2],
          ]}
          rotation={config.htmlRotation}
          distanceFactor={computedDistanceFactor}
          style={{
            width: config.htmlSize.width,
            height: config.htmlSize.height,
            borderRadius: config.portrait ? 42 : 8,
            overflow: 'hidden',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div onPointerDown={(e) => e.stopPropagation()} style={{ width: '100%', height: '100%' }}>
            <LiveDashboard themeName={themeName} onToggleTheme={onToggleTheme} />
          </div>
        </Html>
      )}
    </Float>
  );
}
