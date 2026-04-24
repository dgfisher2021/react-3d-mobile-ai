import { VIEW_PRESETS } from '../constants/demoSettings';

const BTN_BASE: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: '0.72rem',
  fontWeight: 600,
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: '0.3px',
  transition: 'all 0.2s ease',
};

const BTN_INACTIVE: React.CSSProperties = {
  ...BTN_BASE,
  background: 'rgba(255,255,255,0.06)',
  color: '#CBD5E0',
  boxShadow: 'none',
};

const BTN_ACTIVE: React.CSSProperties = {
  ...BTN_BASE,
  background: 'linear-gradient(135deg, #3182CE, #319795)',
  color: '#FFFFFF',
  boxShadow: '0 4px 16px rgba(49,151,149,0.35)',
};

interface ViewPresetsProps {
  autoRotate: boolean;
  activePreset: number | null;
  onPreset: (index: number) => void;
  onAuto: () => void;
  /** Extra buttons rendered after the divider (device picker, screen toggle, etc.) */
  children?: React.ReactNode;
}

export function ViewPresets({
  autoRotate,
  activePreset,
  onPreset,
  onAuto,
  children,
}: ViewPresetsProps) {
  return (
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
      {VIEW_PRESETS.map((p, i) => (
        <button
          key={p.label}
          onClick={() => onPreset(i)}
          style={activePreset === i && !autoRotate ? BTN_ACTIVE : BTN_INACTIVE}
        >
          {p.label}
        </button>
      ))}
      <button onClick={onAuto} style={autoRotate ? BTN_ACTIVE : BTN_INACTIVE}>
        Auto
      </button>

      {children && (
        <>
          <Divider />
          {children}
        </>
      )}
    </div>
  );
}

export function SidebarButton({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={active ? BTN_ACTIVE : BTN_INACTIVE}>
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: '100%',
        height: 1,
        background: 'rgba(255,255,255,0.08)',
        margin: '4px 0',
      }}
    />
  );
}
