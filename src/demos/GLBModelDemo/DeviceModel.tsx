import { Float, Html, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { LiveDashboard } from '../../components/dashboard/LiveDashboard';
import { FLOAT } from '../../constants/demoSettings';
import { PHONE } from '../ThreeJsCanvasDemo/phoneConstants';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ThemeName } from '../../types';
import type { DeviceConfig } from './deviceConfigs';

/** Target height in world units — matches the procedural phone in the other demos. */
const TARGET_H = PHONE.h; // 3.0

interface DeviceModelProps {
  config: DeviceConfig;
  themeName: ThemeName;
  onToggleTheme: () => void;
  showScreen: boolean;
}

export function DeviceModel({ config, themeName, onToggleTheme, showScreen }: DeviceModelProps) {
  const { scene } = useGLTF(config.glbPath);
  const groupRef = useRef<THREE.Group>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const reducedMotion = useReducedMotion();
  const [screenCenter, setScreenCenter] = useState<THREE.Vector3 | null>(null);
  const [screenWorldSize, setScreenWorldSize] = useState<THREE.Vector3 | null>(null);

  // Compute scale factor: normalize model height to TARGET_H (3.0)
  const normalizeScale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return 1;
    return TARGET_H / maxDim;
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
      console.log(`[GLB] ${config.id} normalizeScale: ${normalizeScale}`);
      console.log(`[GLB] ${config.id} screen center:`, center);
      console.log(`[GLB] ${config.id} screen size:`, size);
      setScreenCenter(center.clone());
      setScreenWorldSize(size.clone());
    } else {
      console.warn(`[GLB] Screen node "${config.screenNode}" not found`);
      groupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          console.log(`[GLB]   mesh: "${child.name}"`);
        }
      });
    }
  }, [config.id, config.screenNode, normalizeScale]);

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

  return (
    <Float
      speed={reducedMotion ? 0 : FLOAT.speed}
      rotationIntensity={reducedMotion ? 0 : FLOAT.rotationIntensity}
      floatIntensity={reducedMotion ? 0 : FLOAT.floatIntensity}
    >
      <group ref={groupRef} scale={normalizeScale}>
        <primitive object={scene} />
      </group>

      {showScreen && screenCenter && (
        <Html
          transform
          position={[
            screenCenter.x + config.htmlPosition[0],
            screenCenter.y + config.htmlPosition[1],
            screenCenter.z + config.htmlPosition[2],
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
