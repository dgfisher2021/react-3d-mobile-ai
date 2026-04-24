# react-3d-mobile-ai

Live demo: https://dgfisher2021.github.io/react-3d-mobile-ai/

Four side-by-side approaches to rendering 3D devices with a live React
dashboard on screen. Built with Vite + React 18 + TypeScript + Three.js.

## The four demos

| Tab             | Stack                           | Dashboard on screen                                  |
| --------------- | ------------------------------- | ---------------------------------------------------- |
| Three.js Canvas | `three` only, hand-rolled orbit | Static paint via `CanvasTexture` (`drawScreen.ts`)   |
| CSS 3D Live     | CSS `rotateX/Y` + `perspective` | Real interactive `<LiveDashboard/>` React tree       |
| R3F + drei Live | `@react-three/fiber` + `drei`   | Real `<LiveDashboard/>` via drei `<Html transform/>` |
| GLB Models Live | `useGLTF` + `drei`              | Real `<LiveDashboard/>` on pre-made 3D device models |

All demos share the same controls (Front / Angle / Back / Auto), auto-rotate
speed, camera settings, and float animation via shared constants in
`src/constants/demoSettings.ts` and shared state in `src/context/DemoContext.tsx`.

### GLB Models demo

The GLB tab loads pre-made 3D models from Sketchfab and overlays the live
React dashboard onto each device's screen mesh using drei's `<Html transform>`.
Switch between 5 devices: iPhone 13 Pro, MacBook Pro, iMac 2021, iPad Pro,
and Office Monitor. Models are auto-scaled to a uniform size via bounding box
normalization.

GLB files are tracked with **Git LFS** (`*.glb` in `.gitattributes`).

## Project layout

```
src/
├── App.tsx                           # Top-level demo tab switcher
├── main.tsx
├── index.css
├── context/
│   └── DemoContext.tsx               # Shared state (theme, auto-rotate)
├── constants/
│   ├── demoSettings.ts              # Camera, speeds, presets, gradient
│   ├── themes.ts
│   ├── tickets.ts
│   ├── ceremonies.ts
│   ├── hierarchy.ts
│   └── quickChips.ts
├── components/
│   ├── DemoOverlay.tsx              # Shared title/hint/badges UI
│   ├── DemoTabs.tsx                 # Demo switcher pill
│   ├── ViewPresets.tsx              # Shared sidebar buttons (Front/Angle/Back/Auto)
│   └── dashboard/                   # Shared live app (CSS 3D, R3F, GLB demos)
│       ├── LiveDashboard.tsx
│       ├── PhoneChrome.tsx
│       ├── BottomNav.tsx
│       ├── StandardsTab.tsx
│       ├── TicketsTab.tsx
│       ├── MeetingsTab.tsx
│       ├── HierarchyTab.tsx
│       └── AssistPanel.tsx
├── utils/
│   └── roundedRect.ts              # Shared THREE.Shape utility
├── hooks/
│   ├── useAIResponseParser.ts
│   └── useReducedMotion.ts
├── demos/
│   ├── ThreeJsCanvasDemo/
│   │   ├── index.tsx
│   │   ├── drawScreen.ts            # 2D canvas dashboard paint
│   │   ├── buildPhone.ts            # THREE.Group construction
│   │   └── phoneConstants.ts
│   ├── CSS3DDemo/index.tsx
│   ├── R3FDemo/
│   │   ├── index.tsx
│   │   └── PhoneMesh.tsx
│   └── GLBModelDemo/
│       ├── index.tsx
│       ├── DeviceModel.tsx          # GLB loader + screen overlay
│       └── deviceConfigs.ts         # Per-device config (screen mesh, dimensions)
├── types/index.ts
public/
├── apple_iphone_13_pro_max.glb      # Git LFS
├── apple_ipad_pro.glb               # Git LFS
├── imac_2021.glb                    # Git LFS
├── macbook.glb                      # Git LFS
└── office_monitor__workstation_monitor.glb  # Git LFS
specs/
└── settings-panel.md                # Implementation plan for settings panel
```

## Shared architecture

All four demos consume from two shared sources:

- **`demoSettings.ts`** — single source of truth for camera (fov, distance, zoom limits),
  auto-rotate speeds (in each coordinate system), float animation params, view preset
  angles, and background gradient.
- **`DemoContext`** — React context providing `themeName`, `toggleTheme`, `autoRotate`,
  and `setAutoRotate` so state persists across tab switches.

View preset buttons (`ViewPresets.tsx`) and sidebar button styling are shared components
used by all demos.

## AI panel

The AI assist panel in the dashboard is mocked. Responses come from a scripted
lookup in `src/components/dashboard/AssistPanel.tsx`. Wire up a backend proxy
to make it live.

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run preview    # serves the built bundle
npm run typecheck  # tsc --noEmit
npm run format     # Prettier write
```

## Git LFS

GLB model files are tracked with Git LFS. After cloning:

```bash
git lfs install
git lfs pull
```

## Deploying

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and
deploys to Pages on every push to `main`. Make sure Pages is set to
"GitHub Actions" as the source under repo Settings > Pages.

The Vite `base` is derived from the `GITHUB_REPOSITORY` env var at build
time, falling back to `/react-3d-mobile-ai/` for local dev. See `vite.config.ts`.

## 3D model credits

Models sourced from Sketchfab under CC-BY-4.0 / CC-BY-NC-4.0 licenses:

- iPhone 13 Pro Max, iMac 2021, iPad Pro, Office Monitor by [DatSketch](https://sketchfab.com/DatSketch)
- MacBook Pro from [pmndrs/drei examples](https://github.com/pmndrs/drei)
