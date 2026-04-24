import { useCallback, useEffect, useRef, useState } from 'react';
import { DemoOverlay } from '../../components/DemoOverlay';
import { ViewPresets } from '../../components/ViewPresets';
import {
  AUTO_RESET,
  AUTO_ROTATE,
  BG_GRADIENT,
  CAMERA,
  VIEW_PRESETS,
} from '../../constants/demoSettings';
import { LiveDashboard } from '../../components/dashboard/LiveDashboard';
import { THEMES } from '../../constants/themes';
import { useDemoContext } from '../../context/DemoContext';

interface Rotation {
  x: number;
  y: number;
}

const PHONE_W = 393;
const PHONE_H = 852;

// Match WebGL: phone occupies 3.0 / (2 * z * tan(fov/2)) of viewport height
const PHONE_VIEWPORT_RATIO = 3.0 / (2 * CAMERA.z * Math.tan(((CAMERA.fov / 2) * Math.PI) / 180));
const FOV_RAD_HALF = ((CAMERA.fov / 2) * Math.PI) / 180;

export default function CSS3DDemo() {
  const { themeName, toggleTheme, autoRotate, setAutoRotate } = useDemoContext();
  const [rotation, setRotation] = useState<Rotation>({
    x: AUTO_RESET.cssDeg.x,
    y: AUTO_RESET.cssDeg.y,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [hint, setHint] = useState(true);
  const [viewportH, setViewportH] = useState(window.innerHeight);
  const dragStart = useRef<Rotation & { px: number; py: number }>({ x: 0, y: 0, px: 0, py: 0 });
  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;

  // Track viewport height for responsive scaling
  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-rotation animation loop
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    let frameId: number;
    const animate = () => {
      setRotation((prev) => ({ ...prev, y: prev.y + AUTO_ROTATE.cssDegPerFrame }));
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [autoRotate, isDragging]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('[data-phone-screen]')) return;
      setIsDragging(true);
      setAutoRotate(false);
      dragStart.current = {
        x: rotationRef.current.x,
        y: rotationRef.current.y,
        px: e.clientX,
        py: e.clientY,
      };
      setHint(false);
    },
    [setAutoRotate],
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
  const phoneScale = (PHONE_VIEWPORT_RATIO * viewportH) / PHONE_H;
  const perspective = viewportH / (2 * Math.tan(FOV_RAD_HALF));

  const applyPreset = useCallback(
    (index: number) => {
      setAutoRotate(false);
      const p = VIEW_PRESETS[index];
      setRotation({ x: p.cssDeg.x, y: p.cssDeg.y });
    },
    [setAutoRotate],
  );

  const resetView = useCallback(() => {
    setAutoRotate(true);
    setRotation({ x: AUTO_RESET.cssDeg.x, y: AUTO_RESET.cssDeg.y });
  }, [setAutoRotate]);

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: BG_GRADIENT,
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

      <ViewPresets autoRotate={autoRotate} onPreset={applyPreset} onAuto={resetView} />

      {/* 3D phone frame — scaled to match WebGL viewport ratio */}
      <div style={{ perspective, perspectiveOrigin: '50% 50%' }}>
        <div
          style={{
            width: PHONE_W,
            height: PHONE_H,
            transformStyle: 'preserve-3d',
            transform: `scale(${phoneScale}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition:
              isDragging || autoRotate ? 'none' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
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
              width: PHONE_W,
              height: PHONE_H,
              borderRadius: 42,
              overflow: 'hidden',
              position: 'relative',
              background: theme.screenBg,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset',
              transform: 'translateZ(0px)',
            }}
          >
            <LiveDashboard themeName={themeName} onToggleTheme={toggleTheme} />
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
