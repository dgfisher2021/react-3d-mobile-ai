import type { SVGProps } from 'react';
import { getColor } from './colors';

interface SteamrollerSVGProps extends SVGProps<SVGSVGElement> {
  colorScheme?: string;
  accentColor?: string;
  size?: number;
}

export default function SteamrollerSVG({
  colorScheme = 'blue',
  accentColor = 'yellow',
  size = 32,
  ...props
}: SteamrollerSVGProps) {
  const cs100 = getColor(colorScheme, 100);
  const cs200 = getColor(colorScheme, 200);
  const g500 = getColor('gray', 500);
  const g600 = getColor('gray', 600);
  const ac300 = getColor(accentColor, 300);
  const ac100 = getColor(accentColor, 100);
  const g100 = getColor('gray', 100);
  const g200 = getColor('gray', 200);
  const ac200 = getColor(accentColor, 200);

  return (
    <svg
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill={cs100}
        d="M249.155,98.567c36.291,0,43.807,7.516,43.807,43.807v98.567H150.588V98.567
      	C150.588,98.567,205.348,98.567,249.155,98.567z"
      />
      <path
        fill={cs200}
        d="M150.588,240.941l142.374,10.952V142.374c0-18.145-1.879-29.097-8.295-35.513L150.588,240.941z"
      />
      <path
        fill={g500}
        d="M249.155,76.663c-43.807,0-98.567,0-98.567,0v43.807h98.567c12.097,0,21.904,9.806,21.904,21.904
      	v98.567h43.807v-98.567C314.866,106.083,285.446,76.663,249.155,76.663z"
      />
      <path
        fill={g600}
        d="M260.107,77.589v45.836c6.542,3.789,10.952,10.847,10.952,18.95v109.519h43.807V142.374
      	C314.866,109.816,291.182,82.805,260.107,77.589z"
      />
      <rect x="282.011" y="262.845" fill={ac300} width="109.519" height="131.422" />
      <path
        fill={g500}
        d="M446.289,435.337H8.214c-4.537,0-8.214-3.678-8.214-8.214c0-4.536,3.677-8.214,8.214-8.214h438.075
      	c4.537,0,8.214,3.678,8.214,8.214C454.503,431.659,450.826,435.337,446.289,435.337z"
      />
      <path
        fill={g600}
        d="M205.348,353.198h-32.856c-4.537,0-8.214-3.678-8.214-8.214c0-4.536,3.677-8.214,8.214-8.214h32.856
      	c4.537,0,8.214,3.678,8.214,8.214C213.562,349.52,209.885,353.198,205.348,353.198z"
      />
      <polygon
        fill={ac100}
        points="150.588,240.941 205.348,306.652 205.348,394.267 314.866,394.267 314.866,295.701 
      	380.578,295.701 446.289,372.364 479.144,372.364 512,306.652 479.144,240.941 "
      />
      <circle fill={g500} cx="90.353" cy="344.984" r="82.139" />
      <rect x="8.214" y="317.604" fill={g100} width="164.278" height="54.759" />
      <polygon
        fill={g200}
        points="380.578,240.941 413.433,240.941 413.433,175.23 380.578,164.278 "
      />
      <rect x="358.674" y="219.037" fill={g600} width="76.663" height="43.807" />
      <polygon
        fill={ac200}
        points="479.144,240.941 260.107,240.941 260.107,394.267 314.866,394.267 314.866,295.701 
      	380.578,295.701 446.289,372.364 479.144,372.364 512,306.652 "
      />
      <circle fill={g600} cx="380.578" cy="361.412" r="65.711" />
      <circle fill={g200} cx="380.578" cy="361.412" r="21.904" />
      <path
        fill={g600}
        d="M446.289,418.909H260.107v16.428h186.182c4.537,0,8.214-3.678,8.214-8.214
      	C454.503,422.587,450.826,418.909,446.289,418.909z"
      />
    </svg>
  );
}
