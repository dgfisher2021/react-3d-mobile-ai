import type { SVGProps } from 'react';
import { getColor } from './colors';

interface HammerSVGProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export default function HammerSVG({ size = 32, ...props }: HammerSVGProps) {
  const w200 = getColor('orange', 200);
  const w300 = getColor('orange', 300);
  const g200 = getColor('gray', 200);
  const g300 = getColor('gray', 300);

  return (
    <svg
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 511.997 511.997"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill={w200}
        d="M376.951,45.015L9.322,412.644c-12.43,12.431-12.43,32.585,0,45.015l0,0
      	c12.431,12.43,32.585,12.431,45.016,0.001l367.628-367.63L376.951,45.015z"
      />
      <path
        fill={w300}
        d="M421.966,90.031l-22.508-22.509L9.322,457.659c12.431,12.43,32.585,12.431,45.016,0.001
      	L421.966,90.031z"
      />
      <g>
        <rect
          x="333.977"
          y="181.347"
          transform="matrix(-0.7071 0.7071 -0.7071 -0.7071 876.387 42.1239)"
          fill={g200}
          width="190.984"
          height="42.441"
        />
        <path
          fill={g200}
          d="M391.958,120.042l-45.017-45.016c-34.279-34.28-99.882-37.223-156.737,8.322l23.876,23.876
      		c28.149-15.233,64.055-10.972,87.845,12.818l45.014,45.015c24.863,24.862,24.863,65.171,0.001,90.032l135.047-135.046
      		C457.129,144.903,416.819,144.903,391.958,120.042z"
        />
      </g>
      <path
        fill={g300}
        d="M391.958,120.042L369.45,97.534l-45.016,45.015l22.507,22.507
      	c24.863,24.862,24.863,65.171,0.001,90.032l135.047-135.046C457.129,144.903,416.819,144.903,391.958,120.042z"
      />
    </svg>
  );
}
