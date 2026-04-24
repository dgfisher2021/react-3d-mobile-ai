import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { SCREEN } from '../constants/demoSettings';

interface SettingsContextType {
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
  screenWidth: number;
  setScreenWidth: (v: number) => void;
  screenHeight: number;
  setScreenHeight: (v: number) => void;
  cornerRadius: number;
  setCornerRadius: (v: number) => void;
  distanceFactor: number;
  setDistanceFactor: (v: number) => void;
  resetDisplay: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettingsContext(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (ctx === null) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return ctx;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [showAxes, setShowAxes] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showScreen, setShowScreen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [screenWidth, setScreenWidth] = useState(SCREEN.width);
  const [screenHeight, setScreenHeight] = useState(SCREEN.height);
  const [cornerRadius, setCornerRadius] = useState(SCREEN.cornerRadius);
  const [distanceFactor, setDistanceFactor] = useState(SCREEN.distanceFactor);

  const resetDisplay = useCallback(() => {
    setScreenWidth(SCREEN.width);
    setScreenHeight(SCREEN.height);
    setCornerRadius(SCREEN.cornerRadius);
    setDistanceFactor(SCREEN.distanceFactor);
  }, []);

  const value = useMemo(
    () => ({
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
    }),
    [
      showAxes,
      showGrid,
      showParticles,
      showScreen,
      settingsOpen,
      screenWidth,
      screenHeight,
      cornerRadius,
      distanceFactor,
      resetDisplay,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
