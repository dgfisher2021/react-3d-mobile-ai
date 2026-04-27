import type { SVGProps } from 'react';
import { getColor } from './colors';

interface CertificateSVGProps extends SVGProps<SVGSVGElement> {
  colorScheme?: string;
  accentColor?: string;
  size?: number;
}

export default function CertificateSVG({
  colorScheme = 'teal',
  accentColor = 'orange',
  size = 32,
  ...props
}: CertificateSVGProps) {
  const light = getColor('gray', 50);
  const midlight = getColor(colorScheme, 200);
  const mid = getColor(colorScheme, 300);
  const dark = getColor(colorScheme, 500);
  const deep = getColor(colorScheme, 600);
  const accentLt = getColor(accentColor, 300);
  const accentDk = getColor(accentColor, 500);

  const scallops = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      cx: 256 + 48 * Math.cos(rad),
      cy: 370 + 48 * Math.sin(rad),
    };
  });

  return (
    <svg fill="none" width={size} height={size} viewBox="0 0 530 530" {...props}>
      <g>
        <rect x="70" y="95" width="400" height="310" rx="12" fill={midlight} />
        <rect x="60" y="80" width="392" height="300" rx="12" fill={light} />
        <rect
          x="76"
          y="96"
          width="360"
          height="260"
          rx="6"
          fill="none"
          stroke={mid}
          strokeWidth="3"
          strokeDasharray="8 4"
        />
        <rect x="140" y="115" width="232" height="10" rx="5" fill={dark} />
        <path
          d="M256 148 L264 170 L288 170 L268 184 L276 206 L256 192 L236 206 L244 184 L224 170 L248 170 Z"
          fill={accentDk}
        />
        <rect x="160" y="220" width="192" height="8" rx="4" fill={mid} />
        <rect x="180" y="240" width="152" height="6" rx="3" fill={mid} opacity="0.7" />
        <rect x="140" y="260" width="232" height="6" rx="3" fill={mid} opacity="0.7" />
        <rect x="160" y="295" width="100" height="2" rx="1" fill={deep} />
        <rect x="290" y="295" width="100" height="2" rx="1" fill={deep} />
        <rect x="175" y="302" width="70" height="5" rx="2.5" fill={mid} opacity="0.5" />
        <rect x="305" y="302" width="70" height="5" rx="2.5" fill={mid} opacity="0.5" />
        <path d="M220 360 L220 460 L240 430 L260 460 L260 360" fill={accentDk} />
        <path d="M252 360 L252 460 L272 430 L292 460 L292 360" fill={accentLt} />
        <circle cx="256" cy="370" r="52" fill={deep} />
        <circle cx="256" cy="370" r="42" fill={dark} />
        <path
          d="M256 340 L262 356 L280 356 L266 366 L272 382 L256 372 L240 382 L246 366 L232 356 L250 356 Z"
          fill={accentDk}
        />
        {scallops.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r="5" fill={deep} />
        ))}
      </g>
    </svg>
  );
}
