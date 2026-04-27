import type { SVGProps } from 'react';
import { getColor } from './colors';

interface InvoiceSVGProps extends SVGProps<SVGSVGElement> {
  colorScheme?: string;
  accentColor?: string;
  size?: number;
}

export default function InvoiceSVG({
  colorScheme = 'teal',
  accentColor = 'green',
  size = 32,
  ...props
}: InvoiceSVGProps) {
  const light = getColor('gray', 50);
  const mid = getColor(colorScheme, 300);
  const dark = getColor(colorScheme, 500);
  const deep = getColor(colorScheme, 600);
  const accentMid = getColor(accentColor, 400);
  const accentDk = getColor(accentColor, 500);

  return (
    <svg fill="none" width={size} height={size} viewBox="0 0 512 512" {...props}>
      <g>
        <rect x="90" y="40" width="332" height="432" rx="14" fill={light} />
        <rect x="120" y="75" width="160" height="14" rx="7" fill={dark} />
        <rect x="120" y="105" width="272" height="8" rx="4" fill={mid} />
        <rect x="120" y="125" width="272" height="8" rx="4" fill={mid} />
        <line x1="120" y1="155" x2="392" y2="155" stroke={mid} strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="120" y={175 + i * 35} width="160" height="8" rx="4" fill={mid} opacity="0.7" />
            <rect x="330" y={175 + i * 35} width="62" height="8" rx="4" fill={mid} opacity="0.7" />
          </g>
        ))}
        <line x1="120" y1="325" x2="392" y2="325" stroke={dark} strokeWidth="2" />
        <rect x="280" y="340" width="112" height="14" rx="7" fill={deep} />
        <circle cx="170" cy="400" r="40" fill={accentMid} opacity="0.15" />
        <circle cx="170" cy="400" r="30" stroke={accentDk} strokeWidth="3" fill="none" />
        <text x="170" y="410" textAnchor="middle" fontSize="28" fontWeight="700" fill={accentDk}>
          $
        </text>
        <rect
          x="310"
          y="375"
          width="70"
          height="50"
          rx="6"
          fill="none"
          stroke={accentDk}
          strokeWidth="3"
          transform="rotate(-12 345 400)"
        />
        <text
          x="345"
          y="406"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill={accentDk}
          transform="rotate(-12 345 400)"
        >
          PAID
        </text>
      </g>
    </svg>
  );
}
