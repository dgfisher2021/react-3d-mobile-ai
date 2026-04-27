import type { SVGProps } from 'react';
import { getColor } from './colors';

interface DashboardChartSVGProps extends SVGProps<SVGSVGElement> {
  colorScheme?: string;
  accentColor?: string;
  size?: number;
}

export default function DashboardChartSVG({
  colorScheme = 'teal',
  accentColor = 'orange',
  size = 32,
  ...props
}: DashboardChartSVGProps) {
  const light = getColor('gray', 50);
  const mid = getColor(colorScheme, 300);
  const dark = getColor(colorScheme, 500);
  const accent = getColor(accentColor, 400);

  return (
    <svg fill="none" width={size} height={size} viewBox="0 0 512 512" {...props}>
      <g>
        <rect x="60" y="60" width="392" height="392" rx="20" fill={light} />
        <rect x="100" y="300" width="50" height="120" rx="6" fill={mid} />
        <rect x="170" y="240" width="50" height="180" rx="6" fill={dark} />
        <rect x="240" y="270" width="50" height="150" rx="6" fill={mid} />
        <rect x="310" y="200" width="50" height="220" rx="6" fill={dark} />
        <rect x="380" y="160" width="50" height="260" rx="6" fill={mid} />
        <polyline
          points="125,280 195,220 265,250 335,180 405,140"
          stroke={accent}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="125" cy="280" r="6" fill={accent} />
        <circle cx="195" cy="220" r="6" fill={accent} />
        <circle cx="265" cy="250" r="6" fill={accent} />
        <circle cx="335" cy="180" r="6" fill={accent} />
        <circle cx="405" cy="140" r="6" fill={accent} />
      </g>
    </svg>
  );
}
