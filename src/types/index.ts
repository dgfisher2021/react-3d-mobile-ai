import type { LucideIcon } from 'lucide-react';

export type ThemeName = 'dark' | 'light';

export interface Theme {
  screenBg: string;
  cardBg: string;
  cardBorder: string;
  bodyText: string;
  headers: string;
  muted: string;
  aiBubbleBg: string;
  userBubbleBg: string;
  chipBg: string;
  navBg: string;
  navBorder: string;
  homeIndicator: string;
  expandedBg: string;
  statusBarText: string;
}

export type TicketIconKey = 'zap' | 'filetext' | 'bug' | 'clipboard' | 'search';

export interface TicketType {
  type: string;
  icon: TicketIconKey;
  color: string;
  titleConvention: string;
  example: string;
  requiredFields: string[];
  estimate: string;
  labels: string;
  warningRule: string;
}

export interface CeremonySection {
  name: string;
  time: string;
  desc: string;
}

export interface Ceremony {
  name: string;
  duration: string;
  cadence: string;
  owner: string;
  attendees: string[];
  sections: CeremonySection[];
  antiPatterns: string[];
  color: string;
}

export interface HierarchyLevel {
  level: string;
  duration: string;
  subItems: string;
  ownerLevel: string;
  example: string;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id: number;
}

export type IconMap = Record<TicketIconKey, LucideIcon>;
