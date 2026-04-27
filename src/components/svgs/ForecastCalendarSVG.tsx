import type { SVGProps } from 'react';
import { getColor } from './colors';

interface ForecastCalendarSVGProps extends SVGProps<SVGSVGElement> {
  colorScheme?: string;
  accentColor?: string;
  size?: number;
}

export default function ForecastCalendarSVG({
  colorScheme = 'teal',
  accentColor = 'orange',
  size = 32,
  ...props
}: ForecastCalendarSVGProps) {
  const light = getColor('gray', 50);
  const mid = getColor(colorScheme, 300);
  const dark = getColor(colorScheme, 500);
  const deep = getColor(colorScheme, 600);
  const accent = getColor(accentColor, 400);

  return (
    <svg fill="none" width={size} height={size} viewBox="0 0 512 512" {...props}>
      <g>
        <rect x="60" y="100" width="392" height="340" rx="16" fill={light} />
        <rect x="60" y="100" width="392" height="70" rx="16" fill={dark} />
        <rect x="60" y="140" width="392" height="30" fill={dark} />
        <rect x="120" y="80" width="16" height="50" rx="8" fill={deep} />
        <rect x="376" y="80" width="16" height="50" rx="8" fill={deep} />
        {[0, 1, 2, 3, 4].map((col) =>
          [0, 1, 2, 3].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={100 + col * 70}
              y={195 + row * 55}
              width="40"
              height="30"
              rx="6"
              fill={mid}
              opacity={0.5 + row * 0.1}
            />
          )),
        )}
        <path
          d="M140 380 Q220 280 300 300 T420 220"
          stroke={accent}
          strokeWidth="5"
          strokeDasharray="10 6"
          strokeLinecap="round"
        />
        <polygon points="420,210 430,228 410,228" fill={accent} />
      </g>
    </svg>
  );
}
