import { Float, Html } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LiveDashboard } from '../../components/dashboard/LiveDashboard';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ThemeName } from '../../types';

interface PhoneMeshProps {
  themeName: ThemeName;
  onToggleTheme: () => void;
}

const PHONE_W = 1.44;
const PHONE_H = 3.0;
const PHONE_D = 0.16;
const CORNER = 0.18;
const BEVEL_T = 0.015;
// The ExtrudeGeometry bevel pushes the visible front surface of the body
// from PHONE_D/2 out to PHONE_D/2 + BEVEL_T. Anything screen-side must sit
// in front of FRONT_Z or it is hidden inside the titanium frame.
const FRONT_Z = PHONE_D / 2 + BEVEL_T;

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
  const bodyRef = useRef<THREE.Mesh>(null);
  const backRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();

  const bodyGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(roundedRect(PHONE_W, PHONE_H, CORNER), {
      depth: PHONE_D,
      bevelEnabled: true,
      bevelThickness: BEVEL_T,
      bevelSize: 0.012,
      bevelSegments: 6,
      curveSegments: 32,
    });
    geo.center();
    return geo;
  }, []);

  const backGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(
      roundedRect(PHONE_W - 0.03, PHONE_H - 0.03, CORNER - 0.015),
      {
        depth: 0.004,
        bevelEnabled: false,
        curveSegments: 24,
      },
    );
    geo.center();
    return geo;
  }, []);

  const bezelGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(
      roundedRect(PHONE_W - 0.02, PHONE_H - 0.02, CORNER - 0.01),
      {
        depth: 0.005,
        bevelEnabled: false,
        curveSegments: 24,
      },
    );
    geo.center();
    return geo;
  }, []);

  const lensGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);

  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.08, 0.012, 12, 24), []);

  // Free the GPU buffers for the memoized geometries when this demo is
  // unmounted (e.g. user tabs to a different demo).
  useEffect(() => {
    return () => {
      bodyGeo.dispose();
      backGeo.dispose();
      bezelGeo.dispose();
      lensGeo.dispose();
      ringGeo.dispose();
    };
  }, [bodyGeo, backGeo, bezelGeo, lensGeo, ringGeo]);

  const lensPositions: [number, number][] = [
    [-PHONE_W / 2 + 0.22, PHONE_H / 2 - 0.22],
    [-PHONE_W / 2 + 0.46, PHONE_H / 2 - 0.22],
    [-PHONE_W / 2 + 0.22, PHONE_H / 2 - 0.46],
  ];

  return (
    <Float
      speed={reducedMotion ? 0 : 1.5}
      rotationIntensity={reducedMotion ? 0 : 0.1}
      floatIntensity={reducedMotion ? 0 : 0.3}
    >
      <group>
        {/* Titanium frame — MeshPhysicalMaterial + clearcoat so the
            <Environment> IBL paints a sharp highlight along the bevel.
            Mirrors the pure-Three.js demo's material for cross-demo
            consistency. */}
        <mesh ref={bodyRef} geometry={bodyGeo}>
          <meshPhysicalMaterial
            color="#3a3a44"
            metalness={1.0}
            roughness={0.22}
            clearcoat={0.5}
            clearcoatRoughness={0.15}
            envMapIntensity={1.15}
          />
        </mesh>

        {/* Black glass bezel behind the screen — opaque so Html occlusion
            can latch onto it and so the back never peeks through the front.
            Sits in front of the body's beveled front face. */}
        <mesh geometry={bezelGeo} position={[0, 0, FRONT_Z + 0.003]}>
          <meshStandardMaterial color="#050508" metalness={0.1} roughness={0.6} />
        </mesh>

        {/* Dynamic island */}
        <mesh position={[0, 1.32, FRONT_Z + 0.009]}>
          <planeGeometry args={[0.42, 0.12]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Side buttons — polished titanium */}
        <mesh position={[PHONE_W / 2 + 0.01, 0.4, 0]}>
          <boxGeometry args={[0.02, 0.28, 0.04]} />
          <meshPhysicalMaterial
            color="#4a4a54"
            metalness={1.0}
            roughness={0.18}
            envMapIntensity={1.2}
          />
        </mesh>
        <mesh position={[-PHONE_W / 2 - 0.01, 0.55, 0]}>
          <boxGeometry args={[0.02, 0.18, 0.04]} />
          <meshPhysicalMaterial
            color="#4a4a54"
            metalness={1.0}
            roughness={0.18}
            envMapIntensity={1.2}
          />
        </mesh>
        <mesh position={[-PHONE_W / 2 - 0.01, 0.28, 0]}>
          <boxGeometry args={[0.02, 0.18, 0.04]} />
          <meshPhysicalMaterial
            color="#4a4a54"
            metalness={1.0}
            roughness={0.18}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Camera module */}
        <mesh position={[-PHONE_W / 2 + 0.34, PHONE_H / 2 - 0.34, -PHONE_D / 2 - 0.02]}>
          <boxGeometry args={[0.48, 0.48, 0.04]} />
          <meshPhysicalMaterial
            color="#3a3a44"
            metalness={1.0}
            roughness={0.25}
            envMapIntensity={1.1}
          />
        </mesh>
        {lensPositions.map(([x, y], i) => (
          <group key={i}>
            <mesh position={[x, y, -PHONE_D / 2 - 0.035]} geometry={lensGeo}>
              <meshPhysicalMaterial
                color="#080810"
                metalness={0.3}
                roughness={0.08}
                clearcoat={1.0}
                clearcoatRoughness={0.05}
                envMapIntensity={1.4}
              />
            </mesh>
            <mesh position={[x, y, -PHONE_D / 2 - 0.04]} geometry={ringGeo}>
              <meshPhysicalMaterial
                color="#5a5a65"
                metalness={1.0}
                roughness={0.12}
                envMapIntensity={1.4}
              />
            </mesh>
          </group>
        ))}

        {/* Back glass — a thin rounded slab, not a plane, so it's a real
            occluder with a proper back-facing surface from every angle. */}
        <mesh ref={backRef} geometry={backGeo} position={[0, 0, -PHONE_D / 2 - 0.002]}>
          <meshPhysicalMaterial
            color="#1c1c24"
            metalness={0.2}
            roughness={0.45}
            clearcoat={0.3}
            clearcoatRoughness={0.3}
            envMapIntensity={0.9}
          />
        </mesh>

        {/* Live interactive screen via drei Html (transform).
            `occlude` raycasts against the body + back so the DOM element is
            hidden whenever the phone is between the camera and the screen;
            `backfaceVisibility: hidden` also hides the mirrored DOM when you
            orbit past 90° — together they stop the dashboard bleeding through
            the back of the phone. */}
        <Html
          transform
          occlude={[bodyRef, backRef]}
          position={[0, 0, FRONT_Z + 0.02]}
          distanceFactor={1.35}
          style={{
            width: 393,
            height: 852,
            borderRadius: 34,
            overflow: 'hidden',
            clipPath: 'inset(0 round 34px)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <LiveDashboard themeName={themeName} onToggleTheme={onToggleTheme} />
        </Html>
      </group>
    </Float>
  );
}
