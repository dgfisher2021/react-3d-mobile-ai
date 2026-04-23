import { Float, Html } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { LiveDashboard } from '../../components/dashboard/LiveDashboard';
import type { ThemeName } from '../../types';

interface PhoneMeshProps {
  themeName: ThemeName;
  onToggleTheme: () => void;
}

const PHONE_W = 1.44;
const PHONE_H = 3.0;
const PHONE_D = 0.16;
const CORNER = 0.18;

function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/**
 * The R3F-authored phone. Uses drei's Float for idle motion and Html
 * with `transform` to portal the live React dashboard onto the screen
 * plane — so you can interact with the dashboard in 3D space.
 */
export function PhoneMesh({ themeName, onToggleTheme }: PhoneMeshProps) {
  const bodyGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(PHONE_W, PHONE_H, CORNER), {
      depth: PHONE_D,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 4,
      curveSegments: 24,
    });
    geo.center();
    return geo;
  }, []);

  const lensGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);

  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.08, 0.012, 12, 24), []);

  const lensPositions: [number, number][] = [
    [-PHONE_W / 2 + 0.22, PHONE_H / 2 - 0.22],
    [-PHONE_W / 2 + 0.46, PHONE_H / 2 - 0.22],
    [-PHONE_W / 2 + 0.22, PHONE_H / 2 - 0.46],
  ];

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group>
        {/* Body */}
        <mesh geometry={bodyGeo}>
          <meshStandardMaterial color="#2a2a30" metalness={0.85} roughness={0.28} />
        </mesh>

        {/* Dynamic island */}
        <mesh position={[0, 1.32, PHONE_D / 2 + 0.013]}>
          <planeGeometry args={[0.42, 0.12]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Buttons */}
        <mesh position={[PHONE_W / 2 + 0.01, 0.4, 0]}>
          <boxGeometry args={[0.02, 0.28, 0.04]} />
          <meshStandardMaterial color="#3a3a42" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[-PHONE_W / 2 - 0.01, 0.55, 0]}>
          <boxGeometry args={[0.02, 0.18, 0.04]} />
          <meshStandardMaterial color="#3a3a42" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[-PHONE_W / 2 - 0.01, 0.28, 0]}>
          <boxGeometry args={[0.02, 0.18, 0.04]} />
          <meshStandardMaterial color="#3a3a42" metalness={0.9} roughness={0.25} />
        </mesh>

        {/* Camera module */}
        <mesh position={[-PHONE_W / 2 + 0.34, PHONE_H / 2 - 0.34, -PHONE_D / 2 - 0.02]}>
          <boxGeometry args={[0.48, 0.48, 0.04]} />
          <meshStandardMaterial color="#2a2a30" metalness={0.85} roughness={0.3} />
        </mesh>
        {lensPositions.map(([x, y], i) => (
          <group key={i}>
            <mesh position={[x, y, -PHONE_D / 2 - 0.035]} geometry={lensGeo}>
              <meshStandardMaterial color="#111118" metalness={0.4} roughness={0.2} />
            </mesh>
            <mesh position={[x, y, -PHONE_D / 2 - 0.04]} geometry={ringGeo}>
              <meshStandardMaterial color="#444450" metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        ))}

        {/* Back glass */}
        <mesh position={[0, 0, -PHONE_D / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[PHONE_W - 0.03, PHONE_H - 0.03]} />
          <meshStandardMaterial color="#1c1c22" metalness={0.15} roughness={0.55} />
        </mesh>

        {/* Live interactive screen via drei Html (transform) */}
        <Html
          transform
          position={[0, 0, PHONE_D / 2 + 0.03]}
          distanceFactor={1.35}
          style={{
            width: 393,
            height: 852,
            borderRadius: 34,
            overflow: 'hidden',
            clipPath: 'inset(0 round 34px)',
          }}
        >
          <LiveDashboard themeName={themeName} onToggleTheme={onToggleTheme} />
        </Html>
      </group>
    </Float>
  );
}
