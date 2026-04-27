import type { SVGProps } from 'react';
import { getColor } from './colors';

interface BarrierSVGProps extends SVGProps<SVGSVGElement> {
  accentColor?: string;
  size?: number;
}

export default function BarrierSVG({
  accentColor = 'yellow',
  size = 32,
  ...props
}: BarrierSVGProps) {
  const g100 = getColor('gray', 100);
  const g200 = getColor('gray', 200);
  const g50 = getColor('gray', 50);
  const rd300b = getColor('red', 300);
  const rd500 = getColor('red', 500);
  const ac300 = getColor(accentColor, 300);
  const ac400 = getColor(accentColor, 400);
  const ac500 = getColor(accentColor, 500);
  const g500 = getColor('gray', 500);
  const g600 = getColor('gray', 600);

  return (
    <svg
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="33.391" y="201.739" fill={g100} width="44.522" height="222.609" />
      <rect x="434.087" y="201.739" fill={g200} width="44.522" height="222.609" />
      <polyline
        fill={g50}
        points="221.373,235.13 0,235.13 0,79.304 512,79.304 512,235.13 290.628,235.13 "
      />
      <polyline
        fill={g100}
        points="366.687,235.13 256,235.13 256,79.304 512,79.304 512,235.13 401.314,235.13 "
      />
      <g>
        <polygon fill={rd300b} points="228.174,235.13 66.783,79.304 0,79.304 161.391,235.13 	" />
        <polygon
          fill={rd300b}
          points="339.478,235.13 178.087,79.304 111.304,79.304 272.696,235.13 	"
        />
        <polygon
          fill={rd300b}
          points="456.348,235.13 294.957,79.304 228.174,79.304 389.565,235.13 	"
        />
        <polygon fill={rd300b} points="0,127.664 0,192.144 44.522,235.13 111.304,235.13 	" />
      </g>
      <g>
        <polygon fill={rd500} points="512,79.304 461.913,79.304 512,127.664 	" />
        <polygon
          fill={rd500}
          points="512,176.023 411.826,79.304 345.043,79.304 506.435,235.13 512,235.13 	"
        />
        <polygon fill={rd500} points="272.696,235.13 339.478,235.13 256,154.531 256,219.011 	" />
        <polygon
          fill={rd500}
          points="456.348,235.13 294.957,79.304 256,79.304 256,106.171 389.565,235.13 	"
        />
      </g>
      <polygon
        fill={g50}
        points="278.261,190.609 233.739,190.609 178.087,402.087 333.913,402.087 "
      />
      <polygon fill={g100} points="278.261,190.609 256,190.609 256,402.087 333.913,402.087 " />
      <g>
        <polygon
          fill={ac300}
          points="301.694,279.652 278.261,190.609 233.739,190.609 210.306,279.652 	"
        />
        <polygon
          fill={ac300}
          points="313.41,324.174 198.59,324.174 178.087,402.087 333.913,402.087 	"
        />
      </g>
      <g>
        <polygon fill={ac400} points="313.41,324.174 256,324.174 256,402.087 333.913,402.087 	" />
        <polygon fill={ac400} points="278.261,190.609 256,190.609 256,279.652 301.694,279.652 	" />
        <rect x="166.957" y="390.957" fill={ac400} width="178.087" height="33.391" />
      </g>
      <rect x="256" y="390.957" fill={ac500} width="89.043" height="33.391" />
      <path
        fill={g500}
        d="M500.87,432.696H11.13c-4.611,0-8.348-3.736-8.348-8.348c0-4.611,3.736-8.348,8.348-8.348H500.87
      	c4.611,0,8.348,3.736,8.348,8.348C509.217,428.959,505.481,432.696,500.87,432.696z"
      />
      <path
        fill={g600}
        d="M500.87,416H256v16.696h244.87c4.611,0,8.348-3.736,8.348-8.348
      	C509.217,419.736,505.481,416,500.87,416z"
      />
    </svg>
  );
}
