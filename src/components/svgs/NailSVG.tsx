import type { SVGProps } from 'react';
import { getColor } from './colors';

interface NailSVGProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export default function NailSVG({ size = 32, ...props }: NailSVGProps) {
  const g100 = getColor('gray', 100);
  const g200 = getColor('gray', 200);
  const g300 = getColor('gray', 300);

  return (
    <svg
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <polygon
        fill={g100}
        points="399.349,60.659 0,460.008 0.737,511.265 51.992,512 451.342,112.651 "
      />
      <g>
        <polygon fill={g200} points="451.342,112.651 425.346,86.655 0.737,511.265 51.992,512 	" />
        <path
          fill={g200}
          d="M382.018,8.667L382.018,8.667c-14.358,14.357-14.358,37.635,0,51.992l69.324,69.324
      		c14.357,14.357,37.636,14.357,51.992-0.001v0.001l8.665-8.665L390.684,0L382.018,8.667z"
        />
      </g>
      <path
        fill={g300}
        d="M451.342,60.659l-34.662,34.662l34.662,34.662c14.357,14.358,37.636,14.358,51.992,0l0,0l8.665-8.664
      	L451.342,60.659z"
      />
    </svg>
  );
}
