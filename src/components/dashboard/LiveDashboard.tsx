import { useState } from 'react';
import { THEMES } from '../../constants/themes';
import type { ThemeName } from '../../types';
import { AssistPanel } from './AssistPanel';
import { BottomNav, type TabId } from './BottomNav';
import { HierarchyTab } from './HierarchyTab';
import { MeetingsTab } from './MeetingsTab';
import { DynamicIsland, Header, HomeIndicator, StatusBar } from './PhoneChrome';
import { StandardsTab } from './StandardsTab';
import { TicketsTab } from './TicketsTab';

interface LiveDashboardProps {
  themeName: ThemeName;
  onToggleTheme: () => void;
}

/**
 * The full, interactive dashboard app. Rendered at the phone's
 * logical 393x852 screen size; the 3D host demo (CSS transform, R3F Html, etc.)
 * is responsible for scaling & positioning this inside the device bezel.
 */
export function LiveDashboard({ themeName, onToggleTheme }: LiveDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('standards');
  const [assistOpen, setAssistOpen] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [expandedCeremony, setExpandedCeremony] = useState<number | null>(null);

  const theme = THEMES[themeName];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
        background: theme.screenBg,
      }}
    >
      <DynamicIsland />
      <StatusBar theme={theme} />
      <Header theme={theme} themeName={themeName} onToggleTheme={onToggleTheme} />

      <div
        style={{
          height: 'calc(100% - 44px - 52px - 72px)',
          overflow: 'auto',
          paddingTop: 4,
        }}
      >
        {activeTab === 'standards' && <StandardsTab theme={theme} themeName={themeName} />}
        {activeTab === 'tickets' && (
          <TicketsTab
            theme={theme}
            themeName={themeName}
            expandedTicket={expandedTicket}
            onExpand={setExpandedTicket}
          />
        )}
        {activeTab === 'meetings' && (
          <MeetingsTab
            theme={theme}
            themeName={themeName}
            expandedCeremony={expandedCeremony}
            onExpand={setExpandedCeremony}
          />
        )}
        {activeTab === 'hierarchy' && <HierarchyTab theme={theme} themeName={themeName} />}
      </div>

      <BottomNav
        theme={theme}
        themeName={themeName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAssist={() => setAssistOpen(true)}
      />

      {assistOpen && (
        <AssistPanel theme={theme} themeName={themeName} onClose={() => setAssistOpen(false)} />
      )}

      <HomeIndicator theme={theme} />
    </div>
  );
}
