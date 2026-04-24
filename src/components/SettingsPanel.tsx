import { useSettingsContext } from '../context/SettingsContext';
import { CAMERA, SCREEN } from '../constants/demoSettings';
import { PHONE } from '../demos/ThreeJsCanvasDemo/phoneConstants';
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

const resetBtnStyle: React.CSSProperties = {
  fontSize: '0.6rem',
  fontFamily: MONO,
  padding: '4px 10px',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6,
  background: 'rgba(255,255,255,0.04)',
  color: '#CBD5E0',
  cursor: 'pointer',
  transition: 'all 0.15s',
  letterSpacing: '0.5px',
};

function Toggle({
  active,
  onToggle,
  disabled,
  label,
}: {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={disabled ? undefined : onToggle}
      style={{
        ...toggleBtn(active),
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? 'default' : 'pointer',
      }}
      role="switch"
      aria-checked={active}
      aria-label={label}
      disabled={disabled}
    >
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
  onResetModel?: () => void;
  staticInfo?: Record<string, string>;
  webgl?: boolean;
}

export function SettingsPanel({
  modelInfo,
  overrides,
  onOverridesChange,
  onResetModel,
  staticInfo,
  webgl = true,
}: SettingsPanelProps) {
  const {
    showAxes,
    setShowAxes,
    showGrid,
    setShowGrid,
    showParticles,
    setShowParticles,
    showScreen,
    setShowScreen,
    settingsOpen,
    setSettingsOpen,
    screenWidth,
    setScreenWidth,
    screenHeight,
    setScreenHeight,
    cornerRadius,
    setCornerRadius,
    distanceFactor,
    setDistanceFactor,
    resetDisplay,
  } = useSettingsContext();

  // Compute display-ready actual scale for GLB model
  const actualScale =
    overrides && modelInfo
      ? overrides.scale > 0
        ? overrides.scale
        : modelInfo.normalizeScale
      : null;

  return (
    <>
      {/* Gear button */}
      <button
        onClick={() => setSettingsOpen(!settingsOpen)}
        style={{
          position: 'absolute',
          bottom: 28,
          right: 24,
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
            right: 24,
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
          {/* Display Section */}
          <div style={sectionHeader}>Display</div>
          <div style={rowStyle}>
            <span style={labelStyle}>Screen Display</span>
            <Toggle
              active={showScreen}
              onToggle={() => setShowScreen(!showScreen)}
              label="Screen Display"
            />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Screen Width</span>
            <NumberInput value={screenWidth} step={1} onChange={setScreenWidth} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Screen Height</span>
            <NumberInput value={screenHeight} step={1} onChange={setScreenHeight} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Corner Radius</span>
            <NumberInput value={cornerRadius} step={1} onChange={setCornerRadius} />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Distance Factor</span>
            <NumberInput value={distanceFactor} step={0.01} onChange={setDistanceFactor} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button
              style={resetBtnStyle}
              onClick={resetDisplay}
              title={`Reset to ${SCREEN.width} x ${SCREEN.height}`}
            >
              Reset Display
            </button>
          </div>

          {/* Scene Section */}
          <div style={{ ...sectionHeader, marginTop: 16 }}>Scene</div>
          <div style={rowStyle}>
            <span style={{ ...labelStyle, opacity: webgl ? 1 : 0.4 }}>
              Axes Helper{!webgl && ' (WebGL)'}
            </span>
            <Toggle
              active={showAxes}
              onToggle={() => setShowAxes(!showAxes)}
              disabled={!webgl}
              label="Axes Helper"
            />
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Grid Floor</span>
            <Toggle active={showGrid} onToggle={() => setShowGrid(!showGrid)} label="Grid Floor" />
          </div>
          <div style={rowStyle}>
            <span style={{ ...labelStyle, opacity: webgl ? 1 : 0.4 }}>
              Particles{!webgl && ' (WebGL)'}
            </span>
            <Toggle
              active={showParticles}
              onToggle={() => setShowParticles(!showParticles)}
              disabled={!webgl}
              label="Particles"
            />
          </div>

          {/* Model Section (GLB demo only) */}
          {overrides && onOverridesChange && (
            <>
              <div style={{ ...sectionHeader, marginTop: 16 }}>Model</div>
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
                  value={actualScale ?? 1}
                  step={0.01}
                  onChange={(v) => onOverridesChange({ ...overrides, scale: v })}
                />
              </div>
              <Vec3Input
                label="Screen Position"
                value={overrides.screenPosition}
                step={0.001}
                onChange={(v) => onOverridesChange({ ...overrides, screenPosition: v })}
              />

              {/* Read-only computed values */}
              {modelInfo && (
                <div style={{ marginTop: 8 }}>
                  <div style={monoValue}>
                    Box: {modelInfo.boundingBox.w.toFixed(3)} x {modelInfo.boundingBox.h.toFixed(3)}{' '}
                    x {modelInfo.boundingBox.d.toFixed(3)}
                  </div>
                  <div style={monoValue}>normalizeScale: {modelInfo.normalizeScale.toFixed(4)}</div>
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
                </div>
              )}

              {onResetModel && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 6,
                  }}
                >
                  <button style={resetBtnStyle} onClick={onResetModel}>
                    Reset Model
                  </button>
                </div>
              )}
            </>
          )}

          {/* Phone Info (non-GLB demos) */}
          {staticInfo && !overrides && (
            <>
              <div style={{ ...sectionHeader, marginTop: 16 }}>Phone Info</div>
              <div style={monoValue}>
                Dimensions: {PHONE.w} x {PHONE.h} x {PHONE.d}
              </div>
              <div style={monoValue}>
                Screen: {screenWidth} x {screenHeight} px
              </div>
              <div style={monoValue}>Corner Radius: {cornerRadius}</div>
              <div style={monoValue}>Scale: 1.0 (procedural)</div>
              {Object.entries(staticInfo).map(([key, val]) => (
                <div key={key} style={monoValue}>
                  {key}: {val}
                </div>
              ))}
            </>
          )}

          {/* Camera */}
          <div style={{ ...sectionHeader, marginTop: 16 }}>Camera</div>
          <div style={monoValue}>FOV: {CAMERA.fov}</div>
          <div style={monoValue}>Distance: {CAMERA.z}</div>
        </div>
      )}
    </>
  );
}
