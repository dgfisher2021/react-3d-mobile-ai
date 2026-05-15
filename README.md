# react-3d-mobile-ai

Live demo: https://dgfisher2021.github.io/react-3d-mobile-ai/

Side-by-side approaches to rendering 3D content with a live React dashboard
on screen, plus a couple of pure-3D showcases. Built with Vite + React 18 +
TypeScript + Three.js.

## The demos

| Tab             | Stack                              | What's on it                                          |
| --------------- | ---------------------------------- | ----------------------------------------------------- |
| Three.js Canvas | `three` only, hand-rolled orbit    | Static paint via `CanvasTexture` (`drawScreen.ts`)    |
| CSS 3D Live     | CSS `rotateX/Y` + `perspective`    | Real interactive `<LiveDashboard/>` React tree        |
| R3F + drei Live | `@react-three/fiber` + `drei`      | Real `<LiveDashboard/>` via drei `<Html transform/>`  |
| iPhone 13 Pro   | `useGLTF` GLB + `<Html transform>` | DatSketch iPhone model with the dashboard overlaid    |
| MacBook Pro     | `useGLTF` GLB + `<Html transform>` | pmndrs/drei sample MacBook with the dashboard overlaid |
| More Devices    | `useGLTF` GLB + `<Html transform>` | iMac / iPad / Office Monitor with the dashboard overlaid |
| Helmet Decal    | `useGLTF` + decal projection       | Hard-hat model with selectable SVG-to-texture decals  |
| Tubes Cursor    | R3F custom effects                 | Cursor-reactive tubes + ambient background            |

The Three.js / CSS3D / R3F + drei / iPhone / MacBook / More Devices demos all
render the same `LiveDashboard` component (PPM Sprint Standards). Helmet Decal
and Tubes Cursor are standalone 3D showcases.

Demos with a phone-like form factor share controls (Front / Angle / Back /
Auto), camera settings, and animation params via shared constants in
`src/constants/demoSettings.ts` and shared state in `src/context/DemoContext.tsx`.
A `SettingsContext` + `SettingsPanel` exposes per-demo tunables for live
tweaking.

### GLB device tabs

Each device tab loads a pre-made 3D model and overlays the live React dashboard
onto the screen mesh using drei's `<Html transform>`. Models are auto-scaled to
a uniform size via bounding-box normalization. Per-device offsets (screen mesh
name, glass-overlay tuning, rotation) live in
`src/demos/GLBModelDemo/deviceConfigs.ts`. The "More Devices" tab cycles between
iMac 2021, iPad Pro, and Office Monitor.

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
│   ├── SettingsPanel.tsx            # Live tunables (camera, screen, rotation, etc.)
│   ├── MeshBoundingBoxes.tsx        # Dev helper — visualise GLB mesh bboxes
│   ├── MeshLayerTree.tsx            # Dev helper — collapsible mesh hierarchy
│   ├── SceneHelpers.tsx             # Grid + axis gizmo overlays
│   ├── svgs/                        # ~60 construction-themed SVG components
│   │   ├── index.ts                 # Barrel export
│   │   └── …
│   └── dashboard/                   # Shared live app
│       ├── LiveDashboard.tsx
│       ├── PhoneChrome.tsx
│       ├── BottomNav.tsx
│       ├── StandardsTab.tsx
│       ├── TicketsTab.tsx
│       ├── MeetingsTab.tsx
│       ├── HierarchyTab.tsx
│       └── AssistPanel.tsx
├── context/
│   ├── DemoContext.tsx              # Shared theme + auto-rotate state
│   └── SettingsContext.tsx          # Live tweakable settings per demo
├── utils/
│   └── roundedRect.ts               # Shared THREE.Shape utility
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
│   ├── GLBModelDemo/
│   │   ├── index.tsx
│   │   ├── DeviceModel.tsx          # GLB loader + screen overlay
│   │   └── deviceConfigs.ts         # Per-device config (screen mesh, dimensions)
│   ├── HelmetDecalDemo/
│   │   ├── index.tsx
│   │   ├── HelmetModel.tsx
│   │   ├── DecalPicker.tsx
│   │   ├── svgEntries.ts
│   │   └── useSvgTexture.ts         # SVG → CanvasTexture decal pipeline
│   └── TubesCursorDemo/index.tsx
├── types/index.ts
public/
├── apple_iphone_13_pro_max.glb      # Git LFS
├── apple_ipad_pro.glb               # Git LFS
├── imac_2021.glb                    # Git LFS
├── macbook.glb                      # Git LFS
└── office_monitor__workstation_monitor.glb  # Git LFS
specs/                               # Implementation plans
├── macbook-pro-setup.md
├── settings-panel-v3.md
└── upgrade-roadmap.md
docs/                                # Technical reference
└── glb-screen-overlay.md
```

## Shared architecture

Dashboard-bearing demos consume from three shared sources:

- **`demoSettings.ts`** — single source of truth for camera (fov, distance, zoom limits),
  auto-rotate speeds in each coordinate system, float animation params, view preset
  angles, and the background gradient.
- **`DemoContext`** — React context providing `themeName`, `toggleTheme`, `autoRotate`,
  and `setAutoRotate` so state persists across tab switches.
- **`SettingsContext`** — per-demo live tunables surfaced through `SettingsPanel`
  (screen size, corner radius, rotation, distance factor, etc.) for in-browser tweaking.

View preset buttons (`ViewPresets.tsx`) and the sidebar button styling are shared
components used by every demo with a phone/device form factor.

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
