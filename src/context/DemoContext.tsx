import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ThemeName } from '../types';

interface DemoContextType {
  themeName: ThemeName;
  toggleTheme: () => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean) => void;
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

  const toggleTheme = useCallback(() => setThemeName((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(
    () => ({ themeName, toggleTheme, autoRotate, setAutoRotate }),
    [themeName, toggleTheme, autoRotate],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
