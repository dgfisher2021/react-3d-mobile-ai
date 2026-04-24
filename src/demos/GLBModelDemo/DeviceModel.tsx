import { Float, Html, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { LiveDashboard } from '../../components/dashboard/LiveDashboard';
import type { MeshLayerMap } from '../../components/MeshLayerTree';
import { FLOAT } from '../../constants/demoSettings';
import { useSettingsContext } from '../../context/SettingsContext';
import { PHONE } from '../ThreeJsCanvasDemo/phoneConstants';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ThemeName } from '../../types';
import type { DeviceConfig, ModelOverrides } from './deviceConfigs';

/** Target height in world units — matches the procedural phone in the other demos. */
const TARGET_H = PHONE.h; // 3.0

const DEG2RAD = Math.PI / 180;
const RENDER_SCALE = 2;

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
  onScene?: (scene: THREE.Object3D) => void;
  meshLayers?: MeshLayerMap;
}

export function DeviceModel({
  config,
  themeName,
  onToggleTheme,
  showScreen,
  overrides,
  onModelInfo,
  onScene,
  meshLayers,
}: DeviceModelProps) {
  const { scene } = useGLTF(config.glbPath);
  const groupRef = useRef<THREE.Group>(null);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const reducedMotion = useReducedMotion();
  const { cornerRadius: ctxCornerRadius } = useSettingsContext();
  const [screenCenter, setScreenCenter] = useState<THREE.Vector3 | null>(null);
  const [autoScreenDims, setAutoScreenDims] = useState<{
    distanceFactor: number;
    htmlWidth: number;
    htmlHeight: number;
  } | null>(null);
  const [measured, setMeasured] = useState(false);

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

  const actualScale = overrides?.scale && overrides.scale > 0 ? overrides.scale : normalizeScale;

  // Find the screen mesh once on mount
  useEffect(() => {
    if (!groupRef.current) return;
    let screenMesh: THREE.Mesh | null = null;
    groupRef.current.updateMatrixWorld(true);
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        if (child.name === config.screenNode) {
          screenMesh = child as THREE.Mesh;
        }
      }
    });
    if (screenMesh) {
      screenMeshRef.current = screenMesh;
      // Set wallpaper to black immediately to avoid blue texture flash on load
      const mat = screenMesh.material as THREE.MeshStandardMaterial;
      mat.color.set(0x000000);
      mat.map = null;
      mat.needsUpdate = true;
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
  }, [config.id, config.screenNode, normalizeScale, bbox, config.distanceFactor, onModelInfo]);

  // Compute screen size ONCE from geometry (stable, unaffected by Float).
  // Use geometry.computeBoundingBox for the local mesh dimensions,
  // then multiply by world scale for world-space size.
  // Compute center in scene-local space so Html (inside the same group) aligns.
  useEffect(() => {
    const mesh = screenMeshRef.current;
    if (!mesh || !groupRef.current) return;
    groupRef.current.updateMatrixWorld(true);

    // Stable size from geometry (doesn't change with Float)
    mesh.geometry.computeBoundingBox();
    const geoSize = new THREE.Vector3();
    mesh.geometry.boundingBox!.getSize(geoSize);
    const worldScale = new THREE.Vector3();
    mesh.getWorldScale(worldScale);
    const worldW = geoSize.x * Math.abs(worldScale.x);
    const worldH = geoSize.y * Math.abs(worldScale.y);

    // Center in scene-local space
    const invMatrix = new THREE.Matrix4().copy(scene.matrixWorld).invert();
    const worldCenter = new THREE.Vector3();
    mesh.getWorldPosition(worldCenter);
    const localCenter = worldCenter.applyMatrix4(invMatrix);

    const BASE_CSS_WIDTH = 393 * RENDER_SCALE;
    const autoHeight = Math.round(BASE_CSS_WIDTH * (worldH / worldW));
    // drei source: CSS matrix element = worldMatrixElement * (DF / 400)
    // For cssWidth pixels to cover worldW world units:
    //   DF = worldW * 400 / (cssWidth * parentScale)
    const localDF = (worldW * 400) / (BASE_CSS_WIDTH * actualScale);

    setScreenCenter(localCenter.clone());
    setAutoScreenDims({
      distanceFactor: localDF,
      htmlWidth: BASE_CSS_WIDTH,
      htmlHeight: autoHeight,
    });
    onModelInfo?.({
      boundingBox: bbox,
      normalizeScale,
      screenCenter: [localCenter.x, localCenter.y, localCenter.z],
      screenSize: { w: worldW, h: worldH },
      distanceFactor: localDF,
    });
    setMeasured(true);
  }, [config.id, config.screenNode, normalizeScale, bbox, actualScale, scene, onModelInfo]);

  // When screen overlay is on, make wallpaper opaque black (not transparent).
  // This keeps depth buffer writes so occlude="blending" can hide the Html
  // when viewing from behind.
  useEffect(() => {
    const mesh = screenMeshRef.current;
    if (!mesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (showScreen) {
      mat.color.set(0x000000);
      mat.map = null;
      mat.needsUpdate = true;
    }
  }, [showScreen]);

  // Expose scene to parent for MeshLayerTree
  useEffect(() => {
    onScene?.(scene);
  }, [scene, onScene]);

  // Apply per-mesh visibility from layer state
  useEffect(() => {
    if (!meshLayers) return;
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const state = meshLayers[obj.uuid];
        if (state !== undefined) {
          obj.visible = state.visible;
        }
      }
    });
  }, [scene, meshLayers]);

  const pos = overrides?.position ?? [0, 0, 0];
  const rot = overrides?.rotation ?? [0, 0, 0];
  const screenPos = overrides?.screenPosition ?? config.htmlPosition;

  return (
    <Float
      speed={!measured || reducedMotion ? 0 : FLOAT.speed}
      rotationIntensity={!measured || reducedMotion ? 0 : FLOAT.rotationIntensity}
      floatIntensity={!measured || reducedMotion ? 0 : FLOAT.floatIntensity}
    >
      <group position={pos} rotation={[rot[0] * DEG2RAD, rot[1] * DEG2RAD, rot[2] * DEG2RAD]}>
        <group ref={groupRef} scale={actualScale} rotation={config.modelRotation}>
          <primitive object={scene} />

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
                clipPath: `inset(0 round ${config.portrait ? ctxCornerRadius : 8}px)`,
                overflow: 'hidden',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <div
                onPointerDown={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  height: '100%',
                  transform: config.modelRotation[1] !== 0 ? 'scaleX(-1)' : undefined,
                }}
              >
                <div
                  style={{
                    width: 393,
                    height: autoScreenDims ? autoScreenDims.htmlHeight / RENDER_SCALE : 852,
                    transform: `scale(${RENDER_SCALE})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <LiveDashboard themeName={themeName} onToggleTheme={onToggleTheme} />
                </div>
              </div>
            </Html>
          )}
        </group>
      </group>
    </Float>
  );
}
