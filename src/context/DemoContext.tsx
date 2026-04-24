import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ThemeName } from '../types';

interface DemoContextType {
  themeName: ThemeName;
  toggleTheme: () => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean) => void;
  showAxes: boolean;
  setShowAxes: (v: boolean) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  showParticles: boolean;
  setShowParticles: (v: boolean) => void;
  showScreen: boolean;
  setShowScreen: (v: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function useDemoContext(): DemoContextType {
  const ctx = useContext(DemoContext);
  if (ctx === null) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return ctx;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const [autoRotate, setAutoRotate] = useState(true);
  const [showAxes, setShowAxes] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showScreen, setShowScreen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleTheme = useCallback(() => setThemeName((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(
    () => ({
      themeName,
      toggleTheme,
      autoRotate,
      setAutoRotate,
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
    }),
    [
      themeName,
      toggleTheme,
      autoRotate,
      showAxes,
      showGrid,
      showParticles,
      showScreen,
      settingsOpen,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
