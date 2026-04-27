import type { SVGProps } from 'react';
import { getColor } from './colors';

interface ProgressReportSVGProps extends SVGProps<SVGSVGElement> {
  colorScheme?: string;
  accentColor?: string;
  size?: number;
}

export default function ProgressReportSVG({
  colorScheme = 'teal',
  accentColor = 'orange',
  size = 32,
  ...props
}: ProgressReportSVGProps) {
  const mid = getColor(colorScheme, 300);
  const dark = getColor(colorScheme, 500);
  const deep = getColor(colorScheme, 600);
  const accent = getColor(accentColor, 400);
  const gray = getColor('gray', 200);

  const r = 110;
  const cx = 220;
  const cy = 260;
  const c = 2 * Math.PI * r;

  return (
    <svg fill="none" width={size} height={size} viewBox="0 0 512 512" {...props}>
      <g>
        <circle cx={cx} cy={cy} r={r} stroke={gray} strokeWidth="40" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={deep}
          strokeWidth="40"
          strokeDasharray={`${c * 0.45} ${c * 0.55}`}
          strokeDashoffset={c * 0.25}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={dark}
          strokeWidth="40"
          strokeDasharray={`${c * 0.25} ${c * 0.75}`}
          strokeDashoffset={c * 0.7}
          strokeLinecap="round"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={accent}
          strokeWidth="40"
          strokeDasharray={`${c * 0.15} ${c * 0.85}`}
          strokeDashoffset={c * 0.45}
          strokeLinecap="round"
        />
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="36" fontWeight="700" fill={deep}>
          65%
        </text>
        <rect x="370" y="180" width="16" height="16" rx="4" fill={deep} />
        <rect x="395" y="182" width="80" height="12" rx="4" fill={mid} />
        <rect x="370" y="215" width="16" height="16" rx="4" fill={dark} />
        <rect x="395" y="217" width="60" height="12" rx="4" fill={mid} />
        <rect x="370" y="250" width="16" height="16" rx="4" fill={accent} />
        <rect x="395" y="252" width="70" height="12" rx="4" fill={mid} />
        <rect x="370" y="285" width="16" height="16" rx="4" fill={gray} />
        <rect x="395" y="287" width="50" height="12" rx="4" fill={mid} />
      </g>
    </svg>
  );
}
