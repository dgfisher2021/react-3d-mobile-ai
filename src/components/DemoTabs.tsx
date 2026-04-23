export interface DemoTab {
  id: string;
  label: string;
  blurb: string;
}

interface DemoTabsProps {
  tabs: DemoTab[];
  activeId: string;
  onChange: (id: string) => void;
}

export function DemoTabs({ tabs, activeId, onChange }: DemoTabsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        gap: 6,
        padding: 6,
        background: 'rgba(11,20,38,0.65)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 999,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            title={tab.blurb}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '8px 14px',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.3px',
              cursor: 'pointer',
              color: active ? '#FFFFFF' : '#a0aec0',
              background: active ? 'linear-gradient(135deg, #3182CE, #319795)' : 'transparent',
              boxShadow: active ? '0 4px 16px rgba(49,151,149,0.35)' : 'none',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
