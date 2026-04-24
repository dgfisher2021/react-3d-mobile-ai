import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { DemoOverlay } from '../../components/DemoOverlay';
import { SettingsPanel } from '../../components/SettingsPanel';
import { SidebarButton, ViewPresets } from '../../components/ViewPresets';
import {
  AUTO_RESET,
  AUTO_ROTATE,
  BG_GRADIENT,
  CAMERA,
  VIEW_PRESETS,
} from '../../constants/demoSettings';
import { SceneHelpers } from '../../components/SceneHelpers';
import { useDemoContext } from '../../context/DemoContext';
import { DeviceModel, type ModelInfo } from './DeviceModel';
import { DEVICES, getDefaultOverrides, type ModelOverrides } from './deviceConfigs';

export default function GLBModelDemo() {
  const { themeName, toggleTheme, autoRotate, setAutoRotate, showScreen } = useDemoContext();
  const [deviceId, setDeviceId] = useState('iphone');
  const [overrides, setOverrides] = useState<Record<string, ModelOverrides>>({});
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const controlsRef = useRef<any>(null);

  const config = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];
  const currentOverrides = overrides[config.id] ?? getDefaultOverrides(config);

  const handleOverridesChange = useCallback(
    (o: ModelOverrides) => {
      setOverrides((prev) => ({ ...prev, [config.id]: o }));
    },
    [config.id],
  );

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

  // Preload all models
  for (const d of DEVICES) {
    useGLTF.preload(d.glbPath);
  }

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
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <Environment preset="studio" />
        <ambientLight intensity={0.15} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <directionalLight position={[-3, 2, 4]} intensity={0.5} color="#8ecdf7" />
        <directionalLight position={[-2, -1, -3]} intensity={0.9} color="#5eead4" />
        <pointLight position={[0, 4, 2]} intensity={0.4} color={0xfff0e0} />
        <pointLight position={[-3, 0, 1]} intensity={0.3} color={0x3182ce} />
        <pointLight position={[3, -1, 1]} intensity={0.25} color={0x9f7aea} />

        <Suspense fallback={null}>
          <DeviceModel
            key={config.id}
            config={config}
            themeName={themeName}
            onToggleTheme={toggleTheme}
            showScreen={showScreen}
            overrides={currentOverrides}
            onModelInfo={setModelInfo}
          />
        </Suspense>

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
        subtitle="3D Models"
        hint="Orbit to rotate • Toggle Screen to overlay the app"
        badges={[
          { label: 'GLB Models', color: '#319795' },
          { label: config.label, color: '#718096' },
          { label: 'Live React App', color: '#48BB78' },
        ]}
      />

      <ViewPresets autoRotate={autoRotate} onPreset={applyPreset} onAuto={resetView}>
        {DEVICES.map((d) => (
          <SidebarButton
            key={d.id}
            label={d.label}
            active={d.id === deviceId}
            onClick={() => setDeviceId(d.id)}
          />
        ))}
      </ViewPresets>

      <SettingsPanel
        modelInfo={modelInfo}
        overrides={currentOverrides}
        onOverridesChange={handleOverridesChange}
      />
    </div>
  );
}
