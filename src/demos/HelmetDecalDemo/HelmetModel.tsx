import {
  ContactShadows,
  Decal,
  Environment,
  Float,
  OrbitControls,
  useGLTF,
} from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AUTO_ROTATE, FLOAT } from '../../constants/demoSettings';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const base = import.meta.env.BASE_URL;
const GLB_PATH = `${base}construction_helmet.glb`;

export type HelmetColor = 'yellow' | 'white';

// GLB has two helmets side by side:
//   Object_2 (white/crem) at X≈5, Object_3 (yellow) at X≈0
//   Both share Y[-2.14, 2.64] and Z[3.53, 6.20]
const HELMET_NODES: Record<HelmetColor, string> = {
  white: 'Object_2',
  yellow: 'Object_3',
};

// Target size in world units — keeps helmet comfortably in view
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

function HelmetModel({ texture, decalScale, helmetColor }: HelmetSceneProps) {
  const { scene } = useGLTF(GLB_PATH);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const reducedMotion = useReducedMotion();

  const [ready, setReady] = useState(false);
  const [centerOffset, setCenterOffset] = useState<[number, number, number]>([0, 0, 0]);
  const [scale, setScale] = useState(1);
  const [decalPos, setDecalPos] = useState<[number, number, number]>([0, 0, 0]);

  const activeNode = HELMET_NODES[helmetColor];

  // Show only the selected helmet, compute centering offset + scale + decal position
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.updateMatrixWorld(true);

    let targetMesh: THREE.Mesh | null = null;
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        if (child.name === activeNode) {
          child.visible = true;
          targetMesh = child as THREE.Mesh;
        } else {
          child.visible = false;
        }
      }
    });

    if (targetMesh) {
      meshRef.current = targetMesh;

      const box = new THREE.Box3().setFromObject(targetMesh);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);

      // Negate center to shift the visible helmet to the origin
      setCenterOffset([-center.x, -center.y, -center.z]);

      // Scale so the largest dimension fits TARGET_SIZE
      const maxDim = Math.max(size.x, size.y, size.z);
      setScale(maxDim > 0 ? TARGET_SIZE / maxDim : 1);

      // Decal goes on the front face (max Z), slightly above center Y
      setDecalPos([center.x, center.y + 0.3, box.max.z]);

      setReady(true);
    }
  }, [scene, activeNode]);

  return (
    <Float
      speed={reducedMotion ? 0 : FLOAT.speed}
      rotationIntensity={reducedMotion ? 0 : FLOAT.rotationIntensity}
      floatIntensity={reducedMotion ? 0 : FLOAT.floatIntensity}
    >
      <group scale={scale}>
        <group ref={groupRef} position={centerOffset}>
          <primitive object={scene} />

          {ready && meshRef.current && texture && (
            <Decal
              mesh={meshRef as React.MutableRefObject<THREE.Mesh>}
              position={decalPos}
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
        </group>
      </group>
    </Float>
  );
}

useGLTF.preload(GLB_PATH);
