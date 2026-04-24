import { useDemoContext } from '../context/DemoContext';
import { CAMERA } from '../constants/demoSettings';
import type { ModelInfo } from '../demos/GLBModelDemo/DeviceModel';
import type { ModelOverrides } from '../demos/GLBModelDemo/deviceConfigs';

const PANEL_BG = 'rgba(11,20,38,0.85)';
const BORDER = '1px solid rgba(255,255,255,0.08)';
const MONO = "'JetBrains Mono', monospace";
const TEAL = '#319795';
const DIM = '#718096';

const sectionHeader: React.CSSProperties = {
  fontSize: '0.6rem',
  fontWeight: 600,
  color: TEAL,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  fontFamily: MONO,
  marginBottom: 8,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 0',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: '#CBD5E0',
  fontFamily: "'DM Sans', sans-serif",
};

const monoValue: React.CSSProperties = {
  fontSize: '0.65rem',
  color: DIM,
  fontFamily: MONO,
};

const toggleBtn = (active: boolean): React.CSSProperties => ({
  width: 36,
  height: 20,
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  background: active ? TEAL : 'rgba(255,255,255,0.1)',
  position: 'relative',
  transition: 'background 0.2s',
  flexShrink: 0,
});

const toggleDot = (active: boolean): React.CSSProperties => ({
  position: 'absolute',
  top: 3,
  left: active ? 19 : 3,
  width: 14,
  height: 14,
  borderRadius: '50%',
  background: '#fff',
  transition: 'left 0.2s',
});

const numInputStyle: React.CSSProperties = {
  width: 50,
  padding: '3px 4px',
  fontSize: '0.65rem',
  fontFamily: MONO,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4,
  color: '#CBD5E0',
  textAlign: 'right',
  outline: 'none',
};

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={toggleBtn(active)}>
      <div style={toggleDot(active)} />
    </button>
  );
}

function NumberInput({
  value,
  step,
  onChange,
}: {
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      style={numInputStyle}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  );
}

function Vec3Input({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: [number, number, number];
  step: number;
  onChange: (v: [number, number, number]) => void;
}) {
  const update = (i: number, v: number) => {
    const next = [...value] as [number, number, number];
    next[i] = v;
    onChange(next);
  };
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ ...labelStyle, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ ...monoValue, fontSize: '0.6rem' }}>{axis}</span>
            <NumberInput value={value[i]} step={step} onChange={(v) => update(i, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

interface SettingsPanelProps {
  modelInfo?: ModelInfo | null;
  overrides?: ModelOverrides;
  onOverridesChange?: (o: ModelOverrides) => void;
}

export function SettingsPanel({ modelInfo, overrides, onOverridesChange }: SettingsPanelProps) {
  const {
    showAxes,
    setShowAxes,
    showGrid,
    setShowGrid,
    showParticles,
    setShowParticles,
    settingsOpen,
    setSettingsOpen,
  } = useDemoContext();

  return (
    <>
      {/* Gear button */}
      <button
        onClick={() => setSettingsOpen(!settingsOpen)}
        style={{
          position: 'absolute',
          bottom: 28,
          left: 32,
          zIndex: 20,
          width: 40,
          height: 40,
          borderRadius: 10,
          border: BORDER,
          background: settingsOpen ? TEAL : 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)',
          color: settingsOpen ? '#fff' : '#CBD5E0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          transition: 'all 0.2s ease',
        }}
        title="Settings"
      >
        &#9881;
      </button>

      {/* Panel */}
      {settingsOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 72,
            left: 32,
            width: 300,
            maxHeight: '70vh',
            overflowY: 'auto',
            zIndex: 20,
            background: PANEL_BG,
            backdropFilter: 'blur(16px)',
            border: BORDER,
            borderRadius: 16,
            padding: 16,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {/* Environment */}
          <div style={sectionHeader}>Environment</div>
          <div style={rowStyle}>
            <span style={labelStyle}>Axes Helper</span>
            <Toggle active={showAxes} onToggle={() => setShowAxes(!showAxes)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Grid Floor</span>
            <Toggle active={showGrid} onToggle={() => setShowGrid(!showGrid)} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Particles</span>
            <Toggle active={showParticles} onToggle={() => setShowParticles(!showParticles)} />
          </div>

          {/* Model Modifiers */}
          {overrides && onOverridesChange && (
            <>
              <div style={{ ...sectionHeader, marginTop: 16 }}>Model Modifiers</div>
              <Vec3Input
                label="Position"
                value={overrides.position}
                step={0.01}
                onChange={(v) => onOverridesChange({ ...overrides, position: v })}
              />
              <Vec3Input
                label="Rotation (deg)"
                value={overrides.rotation}
                step={1}
                onChange={(v) => onOverridesChange({ ...overrides, rotation: v })}
              />
              <div style={{ marginBottom: 6 }}>
                <div style={{ ...labelStyle, marginBottom: 4 }}>Scale</div>
                <NumberInput
                  value={overrides.scale}
                  step={0.01}
                  onChange={(v) => onOverridesChange({ ...overrides, scale: v })}
                />
              </div>
              <Vec3Input
                label="Screen Offset"
                value={overrides.screenOffset}
                step={0.001}
                onChange={(v) => onOverridesChange({ ...overrides, screenOffset: v })}
              />
            </>
          )}

          {/* Model Info */}
          {modelInfo && (
            <>
              <div style={{ ...sectionHeader, marginTop: 16 }}>Model Info</div>
              <div style={monoValue}>
                Box: {modelInfo.boundingBox.w.toFixed(3)} x {modelInfo.boundingBox.h.toFixed(3)} x{' '}
                {modelInfo.boundingBox.d.toFixed(3)}
              </div>
              <div style={monoValue}>Scale: {modelInfo.normalizeScale.toFixed(4)}</div>
              <div style={monoValue}>
                Screen:{' '}
                {modelInfo.screenCenter
                  ? `${modelInfo.screenCenter[0].toFixed(3)}, ${modelInfo.screenCenter[1].toFixed(3)}, ${modelInfo.screenCenter[2].toFixed(3)}`
                  : 'not found'}
              </div>
              <div style={monoValue}>
                Screen Size:{' '}
                {modelInfo.screenSize
                  ? `${modelInfo.screenSize.w.toFixed(3)} x ${modelInfo.screenSize.h.toFixed(3)}`
                  : 'n/a'}
              </div>
              <div style={monoValue}>distanceFactor: {modelInfo.distanceFactor.toFixed(3)}</div>
            </>
          )}

          {/* Camera */}
          <div style={{ ...sectionHeader, marginTop: 16 }}>Camera</div>
          <div style={monoValue}>Pos: 0, 0, {CAMERA.z}</div>
          <div style={monoValue}>FOV: {CAMERA.fov}</div>
        </div>
      )}
    </>
  );
}
