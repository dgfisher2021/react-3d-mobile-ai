import type { LucideIcon } from 'lucide-react';
import { Calendar, FileText, Layers, Sparkles, Star } from 'lucide-react';
import type { Theme, ThemeName } from '../../types';

export type TabId = 'standards' | 'tickets' | 'meetings' | 'hierarchy';

interface BottomNavProps {
  theme: Theme;
  themeName: ThemeName;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenAssist: () => void;
}

interface TabConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const TABS: TabConfig[] = [
  { id: 'standards', label: 'Standards', icon: Star },
  { id: 'tickets', label: 'Tickets', icon: FileText },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
  { id: 'hierarchy', label: 'Hierarchy', icon: Layers },
];

export function BottomNav({
  theme,
  themeName,
  activeTab,
  onTabChange,
  onOpenAssist,
}: BottomNavProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: theme.navBg,
        borderTop: `1px solid ${theme.navBorder}`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        padding: '0 8px 6px',
        zIndex: 40,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* left tabs */}
      {TABS.slice(0, 2).map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          active={activeTab === tab.id}
          theme={theme}
          onClick={() => onTabChange(tab.id)}
        />
      ))}

      {/* center AI button */}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -20 }}
      >
        <div
          onClick={onOpenAssist}
          className="ai-glow"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3182CE, #319795)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(49,130,206,0.4)',
            border: `3px solid ${themeName === 'dark' ? '#0B1426' : '#F7FAFC'}`,
          }}
        >
          <Sparkles size={22} color="#FFF" />
        </div>
        <span style={{ fontSize: '0.52rem', fontWeight: 600, marginTop: 4, color: '#319795' }}>
          Ask AI
        </span>
      </div>

      {/* right tabs */}
      {TABS.slice(2).map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          active={activeTab === tab.id}
          theme={theme}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  );
}

interface TabButtonProps {
  tab: TabConfig;
  active: boolean;
  theme: Theme;
  onClick: () => void;
}

function TabButton({ tab, active, theme, onClick }: TabButtonProps) {
  const Icon = tab.icon;
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        cursor: 'pointer',
        padding: '8px 4px',
        minWidth: 56,
      }}
    >
      <Icon size={20} color={active ? '#319795' : theme.muted} strokeWidth={active ? 2.2 : 1.8} />
      <span
        style={{
          fontSize: '0.52rem',
          fontWeight: active ? 700 : 500,
          color: active ? '#319795' : theme.muted,
        }}
      >
        {tab.label}
      </span>
      {active && (
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#319795',
            marginTop: -1,
          }}
        />
      )}
    </div>
  );
}
