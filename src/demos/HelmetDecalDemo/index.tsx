import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ColorScheme } from '../../components/svgs';
import { DemoOverlay } from '../../components/DemoOverlay';
import { BG_GRADIENT } from '../../constants/demoSettings';
import { DecalPicker } from './DecalPicker';
import { HelmetScene, type HelmetColor } from './HelmetModel';
import { SVG_ENTRIES } from './svgEntries';
import { useSvgTexture } from './useSvgTexture';

export default function HelmetDecalDemo() {
  const [selectedId, setSelectedId] = useState('hard-hat');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('yellow');
  const [decalScale, setDecalScale] = useState(1.2);
  const [helmetColor, setHelmetColor] = useState<HelmetColor>('yellow');
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const entry = SVG_ENTRIES.find((e) => e.id === selectedId) ?? SVG_ENTRIES[0];
  const SvgComponent = entry.Component;

  // Convert the rendered SVG to a Three.js texture
  const texture = useSvgTexture(svgContainerRef, [selectedId, colorScheme]);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleColor = useCallback((c: ColorScheme) => setColorScheme(c), []);
  const handleScale = useCallback((s: number) => setDecalScale(s), []);
  const handleHelmetColor = useCallback((c: HelmetColor) => setHelmetColor(c), []);

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
        camera={{ position: [0, 0.5, 6], fov: 35 }}
        dpr={[1, 2]}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <Suspense fallback={null}>
          <HelmetScene texture={texture} decalScale={decalScale} helmetColor={helmetColor} />
        </Suspense>
      </Canvas>

      <DemoOverlay
        subtitle="Helmet Decal"
        hint="Pick an icon from the sidebar to apply it as a decal"
        badges={[
          { label: 'GLB Model', color: '#319795' },
          { label: 'SVG → Texture', color: '#3182CE' },
          { label: 'drei Decal', color: '#805AD5' },
        ]}
      />

      <DecalPicker
        selectedId={selectedId}
        colorScheme={colorScheme}
        decalScale={decalScale}
        helmetColor={helmetColor}
        onSelect={handleSelect}
        onColorChange={handleColor}
        onScaleChange={handleScale}
        onHelmetColorChange={handleHelmetColor}
      />

      {/* Hidden SVG renderer — useSvgTexture reads from here */}
      <div
        ref={svgContainerRef}
        style={{ position: 'absolute', left: -9999, top: -9999, width: 512, height: 512 }}
      >
        <SvgComponent size={512} colorScheme={colorScheme} />
      </div>
    </div>
  );
}
