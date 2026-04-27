import type { SVGProps } from 'react';
import { getColor } from './colors';

interface BuildingLevelsSVGProps extends SVGProps<SVGSVGElement> {
  colorScheme?: string;
  accentColor?: string;
  size?: number;
}

export default function BuildingLevelsSVG({
  colorScheme = 'teal',
  accentColor = 'orange',
  size = 32,
  ...props
}: BuildingLevelsSVGProps) {
  const light = getColor('gray', 50);
  const mid = getColor(colorScheme, 300);
  const dark = getColor(colorScheme, 500);
  const deep = getColor(colorScheme, 600);
  const accent = getColor(accentColor, 400);
  const accentDk = getColor(accentColor, 500);

  return (
    <svg fill="none" width={size} height={size} viewBox="0 0 512 512" {...props}>
      <g>
        <rect x="40" y="440" width="432" height="6" rx="3" fill={mid} />
        <rect x="120" y="80" width="200" height="360" rx="8" fill={light} />
        <path d="M120 88c0-4.418 3.582-8 8-8h184c4.418 0 8 3.582 8 8v20H120V88z" fill={dark} />
        <rect x="140" y="125" width="40" height="50" rx="4" fill={mid} />
        <rect x="190" y="125" width="40" height="50" rx="4" fill={mid} />
        <rect x="240" y="125" width="40" height="50" rx="4" fill={mid} />
        <rect x="290" y="125" width="18" height="8" rx="4" fill={dark} />
        <rect x="130" y="185" width="180" height="2" rx="1" fill={mid} opacity="0.5" />
        <rect x="125" y="195" width="190" height="65" rx="4" fill={accent} opacity="0.12" />
        <rect x="140" y="200" width="40" height="50" rx="4" fill={accent} opacity="0.4" />
        <rect x="190" y="200" width="40" height="50" rx="4" fill={accent} opacity="0.4" />
        <rect x="240" y="200" width="40" height="50" rx="4" fill={accent} opacity="0.4" />
        <rect x="290" y="200" width="18" height="8" rx="4" fill={accentDk} />
        <rect x="130" y="265" width="180" height="2" rx="1" fill={mid} opacity="0.5" />
        <rect x="140" y="275" width="40" height="50" rx="4" fill={mid} />
        <rect x="190" y="275" width="40" height="50" rx="4" fill={mid} />
        <rect x="240" y="275" width="40" height="50" rx="4" fill={mid} />
        <rect x="290" y="275" width="18" height="8" rx="4" fill={dark} />
        <rect x="130" y="335" width="180" height="2" rx="1" fill={mid} opacity="0.5" />
        <rect x="140" y="350" width="40" height="50" rx="4" fill={mid} />
        <rect x="240" y="350" width="40" height="50" rx="4" fill={mid} />
        <rect x="185" y="360" width="50" height="80" rx="6" fill={deep} />
        <circle cx="228" cy="400" r="4" fill={accent} />
        <rect x="290" y="350" width="18" height="8" rx="4" fill={dark} />
        <rect x="340" y="220" width="100" height="220" rx="6" fill={mid} />
        <rect x="340" y="220" width="100" height="16" rx="6" fill={dark} />
        <rect x="358" y="250" width="28" height="35" rx="3" fill={light} />
        <rect x="396" y="250" width="28" height="35" rx="3" fill={light} />
        <rect x="358" y="300" width="28" height="35" rx="3" fill={light} />
        <rect x="396" y="300" width="28" height="35" rx="3" fill={light} />
        <rect x="358" y="350" width="28" height="35" rx="3" fill={light} />
        <rect x="396" y="350" width="28" height="35" rx="3" fill={light} />
        <line
          x1="80"
          y1="90"
          x2="80"
          y2="440"
          stroke={dark}
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <path d="M74 100 L80 85 L86 100" fill={dark} />
        <path d="M74 430 L80 445 L86 430" fill={dark} />
      </g>
    </svg>
  );
}
