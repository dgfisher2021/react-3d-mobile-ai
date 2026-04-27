import type { SVGProps } from 'react';
import { getColor } from './colors';

interface WallSVGProps extends SVGProps<SVGSVGElement> {
  accentColor?: string;
  size?: number;
}

export default function WallSVG({ accentColor = 'yellow', size = 32, ...props }: WallSVGProps) {
  const ac50 = getColor(accentColor, 50);
  const ac300 = getColor(accentColor, 300);
  const ac100b = getColor(accentColor, 100);
  const ac400 = getColor(accentColor, 400);
  const ac500 = getColor(accentColor, 500);

  return (
    <svg
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect y="76.8" fill={ac50} width="256" height="358.4" />
      <g>
        <rect x="256" y="76.8" fill={ac300} width="256" height="358.4" />
        <rect x="256" y="345.6" fill={ac300} width="204.8" height="89.6" />
      </g>
      <g>
        <rect x="153.6" y="256" fill={ac50} width="204.8" height="89.6" />
        <rect x="153.6" y="76.8" fill={ac50} width="204.8" height="89.6" />
      </g>
      <g>
        <rect x="256" y="76.8" fill={ac100b} width="102.4" height="89.6" />
        <rect x="256" y="256" fill={ac100b} width="102.4" height="89.6" />
      </g>
      <rect y="76.8" fill={ac300} width="153.6" height="89.6" />
      <rect x="358.4" y="76.8" fill={ac400} width="153.6" height="89.6" />
      <rect y="256" fill={ac300} width="153.6" height="89.6" />
      <rect x="358.4" y="256" fill={ac400} width="153.6" height="89.6" />
      <g>
        <rect x="460.8" y="345.6" fill={ac500} width="51.2" height="89.6" />
        <rect x="460.8" y="166.4" fill={ac500} width="51.2" height="89.6" />
      </g>
      <rect x="51.2" y="345.6" fill={ac100b} width="204.8" height="89.6" />
      <rect x="256" y="166.4" fill={ac300} width="204.8" height="89.6" />
      <rect x="51.2" y="166.4" fill={ac100b} width="204.8" height="89.6" />
    </svg>
  );
}
