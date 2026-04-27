import { lazy, Suspense, useState } from 'react';
import { DemoTabs, type DemoTab } from './components/DemoTabs';
import { BG_GRADIENT } from './constants/demoSettings';
import { DemoProvider } from './context/DemoContext';
import { SettingsProvider } from './context/SettingsContext';

const ThreeJsCanvasDemo = lazy(() => import('./demos/ThreeJsCanvasDemo'));
const CSS3DDemo = lazy(() => import('./demos/CSS3DDemo'));
const R3FDemo = lazy(() => import('./demos/R3FDemo'));
const GLBModelDemo = lazy(() => import('./demos/GLBModelDemo'));
const TubesCursorDemo = lazy(() => import('./demos/TubesCursorDemo'));

const TABS: DemoTab[] = [
  {
    id: 'threejs',
    label: 'Three.js · Canvas',
    blurb: 'Pure THREE.js with a static dashboard rendered as a CanvasTexture.',
  },
  {
    id: 'css3d',
    label: 'CSS 3D · Live',
    blurb: 'CSS 3D transforms wrapping the interactive React dashboard.',
  },
  {
    id: 'r3f',
    label: 'R3F + drei · Live',
    blurb: 'react-three-fiber with drei <Html transform> portaling the live app.',
  },
  {
    id: 'iphone',
    label: 'iPhone 13 Pro',
    blurb: 'GLB model with auto-sized screen overlay and retina rendering.',
  },
  {
    id: 'macbook',
    label: 'MacBook Pro',
    blurb: 'GLB laptop model with tilted screen and auto-rotation.',
  },
  {
    id: 'glb-other',
    label: 'More Devices',
    blurb: 'iMac, iPad Pro, and Office Monitor GLB models.',
  },
  {
    id: 'tubes',
    label: 'Tubes Cursor',
    blurb: 'Interactive 3D tube cursor effect from threejs-components.',
  },
];

export default function App() {
  const [active, setActive] = useState<string>('iphone');

  return (
    <DemoProvider>
      <SettingsProvider>
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
          <Suspense fallback={<LoadingView />}>
            {active === 'threejs' && <ThreeJsCanvasDemo />}
            {active === 'css3d' && <CSS3DDemo />}
            {active === 'r3f' && <R3FDemo />}
            {active === 'iphone' && <GLBModelDemo key="iphone" defaultDevice="iphone" />}
            {active === 'macbook' && <GLBModelDemo key="macbook" defaultDevice="macbook" />}
            {active === 'glb-other' && <GLBModelDemo key="other" />}
            {active === 'tubes' && <TubesCursorDemo />}
          </Suspense>
          <DemoTabs tabs={TABS} activeId={active} onChange={setActive} />
        </div>
      </SettingsProvider>
    </DemoProvider>
  );
}

function LoadingView() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BG_GRADIENT,
        color: '#718096',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        letterSpacing: '0.5px',
      }}
    >
      LOADING DEMO…
    </div>
  );
}
