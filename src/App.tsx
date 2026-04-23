import { lazy, Suspense, useState } from 'react';
import { DemoTabs, type DemoTab } from './components/DemoTabs';

const ThreeJsCanvasDemo = lazy(() => import('./demos/ThreeJsCanvasDemo'));
const CSS3DDemo = lazy(() => import('./demos/CSS3DDemo'));
const R3FDemo = lazy(() => import('./demos/R3FDemo'));

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
];

export default function App() {
  const [active, setActive] = useState<string>('r3f');

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Suspense fallback={<LoadingView />}>
        {active === 'threejs' && <ThreeJsCanvasDemo />}
        {active === 'css3d' && <CSS3DDemo />}
        {active === 'r3f' && <R3FDemo />}
      </Suspense>
      <DemoTabs tabs={TABS} activeId={active} onChange={setActive} />
    </div>
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
        background: 'linear-gradient(160deg, #080c18, #0d1b2e, #0a1628)',
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
