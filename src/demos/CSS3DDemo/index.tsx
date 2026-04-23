import { useCallback, useEffect, useRef, useState } from 'react';
import { DemoOverlay } from '../../components/DemoOverlay';
import { LiveDashboard } from '../../components/dashboard/LiveDashboard';
import { THEMES } from '../../constants/themes';
import type { ThemeName } from '../../types';

interface Rotation {
  x: number;
  y: number;
}

const PRESETS: { label: string; rotation: Rotation }[] = [
  { label: 'Front', rotation: { x: 0, y: 0 } },
  { label: 'Angle', rotation: { x: -8, y: 22 } },
  { label: 'Tilt', rotation: { x: -20, y: -15 } },
  { label: 'Flat', rotation: { x: -55, y: 0 } },
];

/**
 * Demo 2: CSS 3D transforms. Rotates a div tree via rotateX/rotateY on
 * `perspective`. The "screen" is the actual <LiveDashboard/> React tree,
 * so every tap/scroll inside the phone is fully interactive.
 */
export default function CSS3DDemo() {
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const [rotation, setRotation] = useState<Rotation>({ x: -8, y: 22 });
  const [isDragging, setIsDragging] = useState(false);
  const [hint, setHint] = useState(true);
  const dragStart = useRef<Rotation & { px: number; py: number }>({ x: 0, y: 0, px: 0, py: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Only drag from the surrounding area, not the phone screen itself
      if ((e.target as HTMLElement).closest('[data-phone-screen]')) return;
      setIsDragging(true);
      dragStart.current = { x: rotation.x, y: rotation.y, px: e.clientX, py: e.clientY };
      setHint(false);
    },
    [rotation],
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStart.current.px;
      const dy = e.clientY - dragStart.current.py;
      setRotation({
        x: Math.max(-40, Math.min(40, dragStart.current.x - dy * 0.3)),
        y: dragStart.current.y + dx * 0.3,
      });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging]);

  const theme = THEMES[themeName];

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #080c18 0%, #0d1b2e 40%, #0a1628 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 700,
          background:
            'radial-gradient(ellipse, rgba(49,130,206,0.08) 0%, rgba(49,151,149,0.04) 40%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />
      {/* Grid floor */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background:
            'repeating-linear-gradient(90deg, rgba(49,130,206,0.03) 0px, rgba(49,130,206,0.03) 1px, transparent 1px, transparent 60px),repeating-linear-gradient(0deg, rgba(49,130,206,0.03) 0px, rgba(49,130,206,0.03) 1px, transparent 1px, transparent 60px)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
          pointerEvents: 'none',
        }}
      />

      <DemoOverlay
        subtitle="CSS 3D — Live App"
        hint="Drag background to rotate • App is fully interactive"
        showHint={hint}
        badges={[
          { label: 'CSS 3D Transforms', color: '#319795' },
          { label: 'iPhone 15 Pro', color: '#718096' },
          { label: 'Live React App', color: '#48BB78' },
        ]}
      />

      {/* Preset buttons */}
      <div
        style={{
          position: 'absolute',
          right: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 10,
          animation: 'slideInRight 0.6s ease 0.6s both',
        }}
      >
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setRotation(p.rotation)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#CBD5E0',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.3px',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 3D phone frame */}
      <div style={{ perspective: 1200, perspectiveOrigin: '50% 50%' }}>
        <div
          style={{
            width: 393,
            height: 852,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
          }}
        >
          {/* Back body layer */}
          <div
            style={{
              position: 'absolute',
              top: -12,
              left: -12,
              right: -12,
              bottom: -12,
              borderRadius: 56,
              background: 'linear-gradient(145deg, #3a3a42, #28282f)',
              transform: 'translateZ(-9px)',
              backfaceVisibility: 'hidden',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset, 0 40px 100px rgba(0,0,0,0.5)',
            }}
          />
          {/* Side layer */}
          <div
            style={{
              position: 'absolute',
              top: -6,
              left: -6,
              right: -6,
              bottom: -6,
              borderRadius: 50,
              background: 'linear-gradient(145deg, #48484f, #2a2a30)',
              transform: 'translateZ(-4px)',
              boxShadow: '0 0 1px rgba(255,255,255,0.15) inset',
            }}
          />
          {/* Screen bezel */}
          <div
            style={{
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: 46,
              background: '#050508',
              transform: 'translateZ(-1px)',
            }}
          />
          {/* Live screen */}
          <div
            data-phone-screen="true"
            style={{
              width: 393,
              height: 852,
              borderRadius: 42,
              overflow: 'hidden',
              position: 'relative',
              background: theme.screenBg,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset',
              transform: 'translateZ(0px)',
            }}
          >
            <LiveDashboard
              themeName={themeName}
              onToggleTheme={() => setThemeName((t) => (t === 'dark' ? 'light' : 'dark'))}
            />
          </div>
          {/* Glass reflection */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 42,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%)',
              pointerEvents: 'none',
              transform: 'translateZ(1px)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
