import { GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSettingsContext } from '../context/SettingsContext';

const PARTICLE_COUNT = 60;

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useRef<Float32Array>(null!);
  if (!positions.current) {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    positions.current = arr;
  }

  useFrame(({ clock }) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const elapsed = clock.getElapsedTime();
    const pos = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 1] += Math.sin(elapsed + i) * 0.0005;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    (pts.material as THREE.PointsMaterial).opacity = 0.3 + Math.sin(elapsed * 0.5) * 0.15;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial color={0x319795} size={0.02} transparent opacity={0.5} />
    </points>
  );
}

export function SceneHelpers() {
  const { showAxes, showGrid, showParticles } = useSettingsContext();

  return (
    <>
      {showAxes && (
        <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
          <GizmoViewport
            axisColors={['#E53E3E', '#38A169', '#3182CE']}
            labelColor="white"
            labels={['X', 'Y', 'Z']}
          />
        </GizmoHelper>
      )}
      {showGrid && (
        <gridHelper
          args={[12, 24, '#1a2744', '#0f1a2e']}
          position={[0, -2, 0]}
          ref={(grid) => {
            if (grid) {
              const mat = grid.material as THREE.Material;
              mat.opacity = 0.3;
              mat.transparent = true;
            }
          }}
        />
      )}
      {showParticles && <Particles />}
    </>
  );
}
