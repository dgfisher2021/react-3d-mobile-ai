import type { SVGProps } from 'react';
import { getColor } from './colors';

interface ChangeOrderSVGProps extends SVGProps<SVGSVGElement> {
  colorScheme?: string;
  accentColor?: string;
  size?: number;
}

export default function ChangeOrderSVG({
  colorScheme = 'teal',
  accentColor = 'orange',
  size = 32,
  ...props
}: ChangeOrderSVGProps) {
  const light = getColor('gray', 50);
  const mid = getColor(colorScheme, 300);
  const dark = getColor(colorScheme, 500);
  const accent = getColor(accentColor, 400);
  const accentDk = getColor(accentColor, 500);

  return (
    <svg fill="none" width={size} height={size} viewBox="0 0 512 512" {...props}>
      <g>
        <rect x="100" y="40" width="312" height="432" rx="16" fill={light} />
        <rect x="130" y="80" width="180" height="12" rx="6" fill={dark} />
        <rect x="130" y="110" width="252" height="8" rx="4" fill={mid} />
        <rect x="130" y="135" width="220" height="8" rx="4" fill={mid} />
        <rect x="130" y="160" width="252" height="8" rx="4" fill={mid} />
        <rect x="130" y="200" width="180" height="12" rx="6" fill={dark} />
        <rect x="130" y="230" width="252" height="8" rx="4" fill={mid} />
        <rect x="130" y="255" width="200" height="8" rx="4" fill={mid} />
        <line
          x1="130"
          y1="305"
          x2="382"
          y2="305"
          stroke={dark}
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <rect x="130" y="325" width="252" height="8" rx="4" fill={mid} />
        <rect x="130" y="350" width="180" height="8" rx="4" fill={mid} />
        <path
          d="M340 380 L380 380 L380 410 L400 410 L370 440 L340 410 L360 410 L360 400 L340 400 Z"
          fill={accent}
        />
        <path
          d="M280 440 L240 440 L240 410 L220 410 L250 380 L280 410 L260 410 L260 420 L280 420 Z"
          fill={accentDk}
        />
      </g>
    </svg>
  );
}
