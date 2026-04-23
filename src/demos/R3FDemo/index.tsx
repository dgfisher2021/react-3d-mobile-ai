import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { DemoOverlay } from '../../components/DemoOverlay';
import type { ThemeName } from '../../types';
import { PhoneMesh } from './PhoneMesh';

/**
 * Demo 3: react-three-fiber + drei. All the declarative benefits of R3F
 * (Float, ContactShadows, OrbitControls) plus a portal of the real React
 * dashboard onto the phone face via drei's <Html transform>.
 */
export default function R3FDemo() {
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const toggleTheme = () => setThemeName((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(160deg, #080c18, #0d1b2e, #0a1628)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Canvas camera={{ position: [0, 0, 5.5], fov: 35 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 4]} intensity={0.9} />
        <directionalLight position={[-3, 2, 4]} intensity={0.4} color="#8ecdf7" />
        <pointLight position={[0, -2, -4]} intensity={0.6} color="#319795" />
        <PhoneMesh themeName={themeName} onToggleTheme={toggleTheme} />
        <ContactShadows position={[0, -2, 0]} opacity={0.3} scale={8} blur={2.5} />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.5}
          dampingFactor={0.05}
          enableDamping
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
    </div>
  );
}
