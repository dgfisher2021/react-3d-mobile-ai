import { Moon, Sun } from 'lucide-react';
import type { Theme, ThemeName } from '../../types';

interface StatusBarProps {
  theme: Theme;
}

export function StatusBar({ theme }: StatusBarProps) {
  return (
    <div
      style={{
        height: 44,
        padding: '14px 18px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 55,
      }}
    >
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: theme.statusBarText }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: theme.statusBarText }}>5G</span>
        <div style={{ display: 'flex', gap: 1 }}>
          {[10, 12, 14, 16].map((ht, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: ht,
                borderRadius: 1,
                background: theme.statusBarText,
                opacity: i === 3 ? 0.4 : 1,
              }}
            />
          ))}
        </div>
        <div
          style={{
            width: 22,
            height: 11,
            borderRadius: 3,
            border: `1px solid ${theme.statusBarText}`,
            padding: 1,
            position: 'relative',
          }}
        >
          <div style={{ width: '75%', height: '100%', borderRadius: 1.5, background: '#48BB78' }} />
          <div
            style={{
              position: 'absolute',
              right: -3,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 2,
              height: 5,
              borderRadius: '0 1px 1px 0',
              background: theme.statusBarText,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function DynamicIsland() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 105,
        height: 30,
        borderRadius: 20,
        background: '#000',
        zIndex: 60,
      }}
    />
  );
}

interface HeaderProps {
  theme: Theme;
  themeName: ThemeName;
  onToggleTheme: () => void;
}

export function Header({ theme, themeName, onToggleTheme }: HeaderProps) {
  return (
    <div
      style={{
        padding: '8px 18px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: theme.headers }}>
          3D Device Viewer
        </div>
        <div style={{ fontSize: '0.62rem', fontWeight: 500, color: theme.muted, marginTop: 1 }}>
          React + Three.js Demo
        </div>
      </div>
      <div
        onClick={onToggleTheme}
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: theme.chipBg,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${theme.cardBorder}`,
        }}
      >
        {themeName === 'dark' ? (
          <Sun size={14} color={theme.muted} />
        ) : (
          <Moon size={14} color={theme.muted} />
        )}
      </div>
    </div>
  );
}

export function HomeIndicator({ theme }: { theme: Theme }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 3,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 120,
        height: 4,
        borderRadius: 2,
        background: theme.homeIndicator,
        zIndex: 55,
      }}
    />
  );
}
