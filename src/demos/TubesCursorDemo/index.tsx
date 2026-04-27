import { useEffect, useRef, useState, useCallback } from 'react';
import { BG_GRADIENT } from '../../constants/demoSettings';

const EFFECTS_BASE = `${import.meta.env.BASE_URL}effects`;

interface EffectEntry {
  id: string;
  label: string;
  category: 'cursor' | 'background';
  file: string;
  config: Record<string, unknown>;
  postInit?: (app: EffectApp, base: string) => void;
  disabled?: boolean;
}

const EFFECTS: EffectEntry[] = [
  {
    id: 'tubes',
    label: 'Tubes',
    category: 'cursor',
    file: 'cursors/tubes1.min.js',
    config: {
      tubes: {
        colors: ['#319795', '#3182CE', '#6B46C1'],
        lights: { intensity: 200, colors: ['#46CDCF', '#3D84A7', '#ABEDD8', '#319795'] },
      },
    },
  },
  {
    id: 'neon-cursor',
    label: 'Neon',
    category: 'cursor',
    file: 'cursors/neon1.cdn.min.js',
    config: {},
  },
  {
    id: 'particles',
    label: 'Particles',
    category: 'cursor',
    file: 'cursors/particles1.cdn.min.js',
    config: {},
  },
  {
    id: 'starfield',
    label: 'Starfield',
    category: 'background',
    file: 'backgrounds/starfield1.cdn.min.js',
    config: {},
  },
  {
    id: 'bokeh',
    label: 'Bokeh',
    category: 'background',
    file: 'backgrounds/bokeh1.cdn.min.js',
    config: {},
    postInit: (app, base) => {
      const loadMap = app.loadMap as ((url: string) => void) | undefined;
      loadMap?.(`${base}/assets/bokeh-particles2.png`);
    },
  },
  {
    id: 'spheres1',
    label: 'Spheres 1',
    category: 'background',
    file: 'backgrounds/spheres1.cdn.min.js',
    config: {},
  },
  {
    id: 'spheres2',
    label: 'Spheres 2',
    category: 'background',
    file: 'backgrounds/spheres2.cdn.min.js',
    config: {},
  },
  {
    id: 'liquid',
    label: 'Liquid',
    category: 'background',
    file: 'backgrounds/liquid1.cdn.min.js',
    config: {},
    disabled: true,
  },
  {
    id: 'grid1',
    label: 'Grid 1',
    category: 'background',
    file: 'backgrounds/grid1.cdn.min.js',
    config: {},
  },
  {
    id: 'grid2',
    label: 'Grid 2',
    category: 'background',
    file: 'backgrounds/grid2.cdn.min.js',
    config: {},
  },
  {
    id: 'neon-bg',
    label: 'Neon BG',
    category: 'background',
    file: 'backgrounds/neon1.cdn.min.js',
    config: {},
  },
];

interface EffectApp {
  dispose?: () => void;
  [key: string]: unknown;
}

function EffectCanvas({ effect }: { effect: EffectEntry }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<EffectApp | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    setStatus('loading');
    setError('');

    (async () => {
      try {
        const url = `${EFFECTS_BASE}/${effect.file}`;
        // Fetch as text and load via blob URL to bypass Vite's module transform
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} loading ${effect.file}`);
        const text = await res.text();
        const blob = new Blob([text], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        const mod = await import(/* @vite-ignore */ blobUrl);
        URL.revokeObjectURL(blobUrl);
        if (disposed) return;

        const Factory = mod.default ?? mod;
        const app: EffectApp = Factory(canvas, effect.config);
        effect.postInit?.(app, EFFECTS_BASE);
        appRef.current = app;
        setStatus('ready');
      } catch (err) {
        if (disposed) return;
        setStatus('error');
        setError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      disposed = true;
      try {
        appRef.current?.dispose?.();
      } catch {
        // some effects don't have dispose
      }
      appRef.current = null;
      // Clean up any leftover Three.js canvases the effect may have appended
      const container = canvas.parentElement;
      if (container) {
        container.querySelectorAll('canvas:not(#effect-canvas)').forEach((c) => c.remove());
      }
    };
  }, [effect]);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="effect-canvas"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#718096',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
          }}
        >
          LOADING {effect.label.toUpperCase()}…
        </div>
      )}
      {status === 'error' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8,
            color: '#E53E3E',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
          }}
        >
          <span>Failed to load {effect.label}</span>
          <span
            style={{ color: '#718096', fontSize: '0.65rem', maxWidth: 400, textAlign: 'center' }}
          >
            {error}
          </span>
        </div>
      )}
    </>
  );
}

const pillStyle = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.68rem',
  fontWeight: 600,
  letterSpacing: '0.3px',
  border: 'none',
  borderRadius: 999,
  cursor: 'pointer',
  transition: 'background 0.2s, color 0.2s',
} as const;

export default function TubesCursorDemo() {
  const [activeId, setActiveId] = useState('tubes');
  const activeEffect = EFFECTS.find((e) => e.id === activeId) ?? EFFECTS[0];

  const [filter, setFilter] = useState<'all' | 'cursor' | 'background'>('all');

  const filtered = EFFECTS.filter(
    (e) => !e.disabled && (filter === 'all' || e.category === filter),
  );

  const handleSelect = useCallback((id: string) => setActiveId(id), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: BG_GRADIENT }}>
      {/* Effect renderer - key forces remount on switch */}
      <EffectCanvas key={activeId} effect={activeEffect} />

      {/* Effect selector bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Category filter */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '4px 6px',
            background: 'rgba(11,20,38,0.5)',
            borderRadius: 999,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {(['all', 'cursor', 'background'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                ...pillStyle,
                padding: '4px 10px',
                fontSize: '0.6rem',
                color: filter === cat ? '#fff' : '#718096',
                background: filter === cat ? 'rgba(49,151,149,0.5)' : 'transparent',
              }}
            >
              {cat === 'all' ? 'All' : cat === 'cursor' ? 'Cursors' : 'Backgrounds'}
            </button>
          ))}
        </div>

        {/* Effect pills */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 6,
            background: 'rgba(11,20,38,0.65)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '90vw',
          }}
        >
          {filtered.map((effect) => {
            const active = effect.id === activeId;
            return (
              <button
                key={effect.id}
                onClick={() => handleSelect(effect.id)}
                style={{
                  ...pillStyle,
                  padding: '7px 13px',
                  color: active ? '#fff' : '#a0aec0',
                  background: active ? 'linear-gradient(135deg, #3182CE, #319795)' : 'transparent',
                  boxShadow: active ? '0 4px 16px rgba(49,151,149,0.35)' : 'none',
                }}
              >
                {effect.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current effect label */}
      <div
        style={{
          position: 'absolute',
          bottom: 110,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.6rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        {activeEffect.category} · {activeEffect.label}
      </div>
    </div>
  );
}
