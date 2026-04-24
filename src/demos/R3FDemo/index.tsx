import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { DemoOverlay } from '../../components/DemoOverlay';
import { SettingsPanel } from '../../components/SettingsPanel';
import { ViewPresets } from '../../components/ViewPresets';
import {
  AUTO_RESET,
  BG_GRADIENT,
  CAMERA,
  AUTO_ROTATE,
  VIEW_PRESETS,
} from '../../constants/demoSettings';
import { SceneHelpers } from '../../components/SceneHelpers';
import { useDemoContext } from '../../context/DemoContext';
import { PhoneMesh } from './PhoneMesh';

export default function R3FDemo() {
  const { themeName, toggleTheme, autoRotate, setAutoRotate } = useDemoContext();
  const controlsRef = useRef<any>(null);

  const applyPreset = useCallback(
    (index: number) => {
      const c = controlsRef.current;
      if (!c) return;
      setAutoRotate(false);
      const p = VIEW_PRESETS[index];
      c.setAzimuthalAngle(p.orbit.azimuth);
      c.setPolarAngle(p.orbit.polar);
    },
    [setAutoRotate],
  );

  const resetView = useCallback(() => {
    const c = controlsRef.current;
    if (!c) return;
    setAutoRotate(true);
    c.setAzimuthalAngle(AUTO_RESET.orbit.azimuth);
    c.setPolarAngle(AUTO_RESET.orbit.polar);
  }, [setAutoRotate]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: BG_GRADIENT,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, CAMERA.z], fov: CAMERA.fov }}
        dpr={[1, 2]}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <Environment preset="studio" />
        <ambientLight intensity={0.15} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <directionalLight position={[-3, 2, 4]} intensity={0.5} color="#8ecdf7" />
        <directionalLight position={[-2, -1, -3]} intensity={0.9} color="#5eead4" />
        <PhoneMesh themeName={themeName} onToggleTheme={toggleTheme} />
        <SceneHelpers />
        <ContactShadows position={[0, -2, 0]} opacity={0.35} scale={8} blur={2.5} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={AUTO_ROTATE.orbitControlsSpeed}
          minDistance={CAMERA.minDistance}
          maxDistance={CAMERA.maxDistance}
          minPolarAngle={CAMERA.minPolarAngle}
          maxPolarAngle={CAMERA.maxPolarAngle}
          dampingFactor={CAMERA.dampingFactor}
          enableDamping
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>

      <DemoOverlay
        subtitle="R3F + drei"
        hint="Orbit to rotate • App is fully interactive"
        badges={[
          { label: '@react-three/fiber', color: '#319795' },
          { label: 'iPhone 15 Pro', color: '#718096' },
          { label: 'Live React App', color: '#48BB78' },
        ]}
      />

      <ViewPresets autoRotate={autoRotate} onPreset={applyPreset} onAuto={resetView} />
      <SettingsPanel />
    </div>
  );
}
