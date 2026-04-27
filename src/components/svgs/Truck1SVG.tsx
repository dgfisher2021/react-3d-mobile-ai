import type { SVGProps } from 'react';
import { getColor } from './colors';

interface Truck1SVGProps extends SVGProps<SVGSVGElement> {
  colorScheme?: string;
  accentColor?: string;
  size?: number;
}

export default function Truck1SVG({
  colorScheme = 'blue',
  accentColor = 'yellow',
  size = 32,
  ...props
}: Truck1SVGProps) {
  const ac400 = getColor(accentColor, 400);
  const ac100 = getColor(accentColor, 100);
  const g600 = getColor('gray', 600);
  const g700 = getColor('gray', 700);
  const g500 = getColor('gray', 500);
  const ac300 = getColor(accentColor, 300);
  const ac200 = getColor(accentColor, 200);
  const g50 = getColor('gray', 50);
  const g100 = getColor('gray', 100);
  const g200 = getColor('gray', 200);
  const cs100 = getColor(colorScheme, 100);
  const cs200 = getColor(colorScheme, 200);
  const strokeDk = getColor('gray', 800);

  return (
    <svg
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <polyline
        fill={ac400}
        points="426.22,278.785 501.277,278.785 501.277,214.45 426.22,214.45 "
      />
      <path
        fill={ac100}
        d="M243.937,300.23V171.56c0-47.375,38.405-85.78,85.78-85.78h75.058l53.613,53.613v75.058
      	c0,25.619-11.232,48.615-29.039,64.333"
      />
      <rect x="243.937" y="278.785" fill={ac400} width="32.168" height="32.168" />
      <rect x="29.487" y="310.953" fill={g600} width="450.346" height="53.613" />
      <rect x="168.88" y="289.508" fill={g700} width="85.78" height="32.168" />
      <polygon
        fill={g500}
        points="125.99,321.675 179.602,321.675 179.602,289.508 190.325,289.508 190.325,257.34 
      	125.99,257.34 "
      />
      <polygon
        fill={ac300}
        points="211.77,182.283 211.77,214.45 179.602,214.45 179.602,289.508 243.937,289.508 
      	243.937,182.283 "
      />
      <rect x="211.77" y="182.283" fill={ac400} width="32.168" height="32.168" />
      <path
        fill={ac200}
        d="M404.775,85.78h-75.058c-25.629,0-48.617,11.253-64.335,29.072v182.897l163.967-18.967
      	c17.807-15.717,29.039-38.713,29.039-64.332v-75.058L404.775,85.78z"
      />
      <g>
        <circle
          fill="none"
          stroke={strokeDk}
          strokeWidth={15}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          cx="88.461"
          cy="369.927"
          r="5.361"
        />

        <circle
          fill="none"
          stroke={strokeDk}
          strokeWidth={15}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          cx="313.634"
          cy="369.927"
          r="5.361"
        />

        <circle
          fill="none"
          stroke={strokeDk}
          strokeWidth={15}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          cx="410.136"
          cy="369.927"
          r="5.361"
        />

        <line
          fill="none"
          stroke={strokeDk}
          strokeWidth={15}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          x1="8.042"
          y1="321.675"
          x2="61.654"
          y2="321.675"
        />

        <line
          fill="none"
          stroke={strokeDk}
          strokeWidth={15}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          x1="93.822"
          y1="257.34"
          x2="61.654"
          y2="257.34"
        />
      </g>
      <path
        fill={g50}
        d="M287.324,96.999c-13.399,7.636-24.532,18.769-32.168,32.168l152.165,152.165l22.028-2.549
      	c7.084-6.253,13.123-13.662,17.833-21.926L287.324,96.999z"
      />
      <circle fill={ac200} cx="211.77" cy="182.283" r="32.168" />
      <rect x="243.937" y="310.953" fill={g700} width="235.895" height="53.613" />
      <circle fill={g500} cx="88.461" cy="369.927" r="48.251" />
      <path
        fill={g100}
        d="M88.461,383.33c-7.391,0-13.403-6.012-13.403-13.403c0-7.391,6.012-13.403,13.403-13.403
      	c7.391,0,13.403,6.012,13.403,13.403C101.864,377.318,95.852,383.33,88.461,383.33z"
      />
      <circle fill={g600} cx="313.634" cy="369.927" r="48.251" />
      <path
        fill={g200}
        d="M313.634,383.33c-7.391,0-13.403-6.012-13.403-13.403c0-7.391,6.012-13.403,13.403-13.403
      	c7.391,0,13.403,6.012,13.403,13.403C327.037,377.318,321.025,383.33,313.634,383.33z"
      />
      <circle fill={g600} cx="410.136" cy="369.927" r="48.251" />
      <path
        fill={g200}
        d="M410.136,383.33c-7.391,0-13.403-6.012-13.403-13.403c0-7.391,6.012-13.403,13.403-13.403
      	c7.391,0,13.403,6.012,13.403,13.403C423.539,377.318,417.527,383.33,410.136,383.33z"
      />
      <path
        fill={g500}
        d="M458.387,426.22H40.209c-4.441,0-8.042-3.601-8.042-8.042s3.601-8.042,8.042-8.042h418.178
      	c4.441,0,8.042,3.601,8.042,8.042S462.829,426.22,458.387,426.22z"
      />
      <path
        fill={g600}
        d="M458.387,410.136H265.382v16.084h193.005c4.441,0,8.042-3.601,8.042-8.042
      	S462.829,410.136,458.387,410.136z"
      />
      <polygon
        fill={ac100}
        points="93.822,139.393 8.042,225.172 8.042,364.565 29.487,364.565 61.654,321.675 136.712,321.675 
      	136.712,139.393 "
      />
      <polygon
        fill={cs100}
        points="93.822,139.393 61.653,139.393 8.042,193.004 8.042,225.173 93.822,225.173 "
      />
      <path
        fill={g500}
        d="M93.822,265.382H61.654c-4.441,0-8.042-3.601-8.042-8.042c0-4.441,3.601-8.042,8.042-8.042h32.168
      	c4.441,0,8.042,3.601,8.042,8.042C101.864,261.782,98.263,265.382,93.822,265.382z"
      />
      <polygon fill={cs200} points="8.042,225.173 93.822,225.173 93.822,139.393 8.042,225.172 " />
      <path
        fill={g500}
        d="M75.058,329.717H8.042c-4.441,0-8.042-3.601-8.042-8.042c0-4.441,3.601-8.042,8.042-8.042h67.016
      	c4.441,0,8.042,3.601,8.042,8.042C83.099,326.117,79.499,329.717,75.058,329.717z"
      />
      <path
        fill={g100}
        d="M287.324,96.999c-8.276,4.716-15.685,10.77-21.941,17.866v24.528L407.32,281.332l22.028-2.549
      	c7.084-6.253,13.123-13.662,17.833-21.926L287.324,96.999z"
      />
      <polygon
        fill={ac200}
        points="243.937,364.565 286.827,321.675 436.942,321.675 479.832,364.565 512,332.398 
      	458.387,278.785 265.382,278.785 211.77,332.398 "
      />
      <polygon
        fill={ac300}
        points="458.387,278.785 265.382,278.785 265.382,343.12 286.827,321.675 436.942,321.675 
      	479.832,364.565 512,332.398 "
      />
    </svg>
  );
}
