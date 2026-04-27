import {
  ContactShadows,
  Decal,
  Environment,
  Float,
  OrbitControls,
  useGLTF,
} from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { AUTO_ROTATE, FLOAT } from '../../constants/demoSettings';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const base = import.meta.env.BASE_URL;
const GLB_PATH = `${base}construction_helmet.glb`;

export type HelmetColor = 'yellow' | 'white';

// GLB has two helmets — Object_2 (white) and Object_3 (yellow)
const HELMET_NODES: Record<HelmetColor, string> = {
  white: 'Object_2',
  yellow: 'Object_3',
};

const TARGET_SIZE = 2.5;

interface HelmetSceneProps {
  texture: THREE.CanvasTexture | null;
  decalScale: number;
  helmetColor: HelmetColor;
}

export function HelmetScene({ texture, decalScale, helmetColor }: HelmetSceneProps) {
  return (
    <>
      <Environment preset="studio" />
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <directionalLight position={[-3, 2, 4]} intensity={0.5} color="#8ecdf7" />
      <directionalLight position={[-2, -1, -3]} intensity={0.9} color="#5eead4" />
      <pointLight position={[0, 4, 2]} intensity={0.4} color={0xfff0e0} />
      <pointLight position={[-3, 0, 1]} intensity={0.3} color={0x3182ce} />
      <pointLight position={[3, -1, 1]} intensity={0.25} color={0x9f7aea} />

      <HelmetModel texture={texture} decalScale={decalScale} helmetColor={helmetColor} />

      <ContactShadows position={[0, -1.6, 0]} opacity={0.35} scale={8} blur={2.5} />
      <OrbitControls
        enablePan={false}
        autoRotate
        autoRotateSpeed={AUTO_ROTATE.orbitControlsSpeed}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        dampingFactor={0.05}
        enableDamping
      />
    </>
  );
}

interface BakedMesh {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  center: THREE.Vector3;
  scale: number;
  decalPos: [number, number, number];
}

function HelmetModel({ texture, decalScale, helmetColor }: HelmetSceneProps) {
  const { scene } = useGLTF(GLB_PATH);
  const helmetRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();

  const activeNode = HELMET_NODES[helmetColor];

  // Clone the visible mesh with all ancestor transforms baked into the geometry.
  // This puts everything in world space so <Decal> (as a child) works correctly.
  const baked = useMemo<BakedMesh | null>(() => {
    scene.updateMatrixWorld(true);

    let targetMesh: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.name === activeNode) {
        targetMesh = child as THREE.Mesh;
      }
    });
    if (!targetMesh) return null;
    const mesh = targetMesh as THREE.Mesh;

    // Clone geometry and bake the full world transform into vertices
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);

    // Compute bounds in the baked (world) space
    geo.computeBoundingBox();
    const box = geo.boundingBox!;
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Center the geometry at the origin
    geo.translate(-center.x, -center.y, -center.z);
    geo.computeBoundingBox();
    const centeredBox = geo.boundingBox!;

    // Scale factor to fit TARGET_SIZE
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? TARGET_SIZE / maxDim : 1;

    // Decal position: front face of the centered geometry, slightly above middle
    // After the Y↔Z root transform, the "front" is max Z in world space
    const decalPos: [number, number, number] = [
      0,
      (centeredBox.max.y + centeredBox.min.y) / 2 + size.y * 0.08,
      centeredBox.max.z,
    ];

    return {
      geometry: geo,
      material: mesh.material,
      center,
      scale: s,
      decalPos,
    };
  }, [scene, activeNode]);

  if (!baked) return null;

  return (
    <Float
      speed={reducedMotion ? 0 : FLOAT.speed}
      rotationIntensity={reducedMotion ? 0 : FLOAT.rotationIntensity}
      floatIntensity={reducedMotion ? 0 : FLOAT.floatIntensity}
    >
      <group scale={baked.scale}>
        <mesh ref={helmetRef} geometry={baked.geometry} material={baked.material}>
          {texture && (
            <Decal
              position={baked.decalPos}
              rotation={[0, 0, 0]}
              scale={decalScale * 2}
            >
              <meshStandardMaterial
                map={texture}
                transparent
                depthTest
                polygonOffset
                polygonOffsetFactor={-10}
              />
            </Decal>
          )}
        </mesh>
      </group>
    </Float>
  );
}

useGLTF.preload(GLB_PATH);
