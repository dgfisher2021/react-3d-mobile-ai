# Plan: Settings Panel for 3D Demo Viewer

## Task Description

Build a collapsible settings panel that provides environment controls (axes helper, grid floor, particles), editable model modifiers (position, rotation, scale, screen offset for GLB models), read-only model diagnostics (bounding box, normalizeScale, screen mesh info), and read-only camera info. The panel uses the same frosted-glass UI style as the existing sidebar. Environment toggles persist across demo tabs via DemoContext. Model modifiers are local to the GLB demo and initialized from deviceConfigs defaults.

## Objective

Give the user a visual tool to:

1. Toggle reference helpers (XYZ axes, grid, particles) across all demos for spatial orientation
2. Live-tune GLB model position, rotation, scale, and screen offset to align devices
3. Read diagnostic values (bounding box, scale factor, screen center, camera state) to compare across demos
4. Maintain a consistent, compact UI that doesn't interfere with the 3D viewport or sidebar controls

## Problem Statement

GLB models load at arbitrary native scales and orientations. The current approach auto-computes a normalizeScale from bounding box math, but the screen overlay position, model rotation, and fine-tune offsets all need visual tuning. Without reference helpers (axes, grid) and without seeing the actual runtime values, tuning is guesswork. The user needs an interactive tool to adjust these values and report the correct ones back for hardcoding.

## Solution Approach

- Add environment toggle state (`showAxes`, `showGrid`, `showParticles`) to DemoContext so they persist across tab switches
- Create a `SettingsPanel` component anchored bottom-left, toggled by a gear icon
- For each WebGL demo (Three.js Canvas, R3F, GLB), conditionally render `<axesHelper>`, `<gridHelper>`, and particles based on context state
- For the CSS 3D demo, render CSS-based grid (already exists) based on context state
- In the GLB demo, maintain local `modelOverrides` state (position, rotation, scale, screenOffset per device) initialized from deviceConfigs, pass to DeviceModel
- DeviceModel reports computed values (bounding box, normalizeScale, screen center/size, distanceFactor) back to the panel via a callback or ref
- The panel displays all values in a compact, scrollable frosted-glass card

## Relevant Files

### Existing Files to Modify

- `src/context/DemoContext.tsx` — Add `showAxes`, `showGrid`, `showParticles`, `settingsOpen` to context state
- `src/demos/GLBModelDemo/index.tsx` — Add modelOverrides state, pass to DeviceModel, render SettingsPanel
- `src/demos/GLBModelDemo/DeviceModel.tsx` — Accept override props, report computed values via callback
- `src/demos/GLBModelDemo/deviceConfigs.ts` — No changes needed but referenced as defaults
- `src/demos/R3FDemo/index.tsx` — Add conditional AxesHelper, GridHelper, particles inside Canvas
- `src/demos/ThreeJsCanvasDemo/index.tsx` — Make existing grid/particles conditional on context
- `src/demos/CSS3DDemo/index.tsx` — Make existing CSS grid conditional on context
- `src/components/DemoOverlay.tsx` — May need to adjust bottom-left badge positioning to avoid overlap with settings panel

### New Files

- `src/components/SettingsPanel.tsx` — The collapsible settings panel component
- `src/components/SceneHelpers.tsx` — Shared R3F components for AxesHelper, GridHelper, Particles that read from context

## Implementation Phases

### Phase 1: Foundation (Context + SceneHelpers)

Extend DemoContext with environment toggle state. Create shared SceneHelpers components that conditionally render based on context. Wire into all 4 demos.

### Phase 2: Core Implementation (SettingsPanel + ModelOverrides)

Build the SettingsPanel UI. Add modelOverrides state to GLB demo. Connect DeviceModel to report computed values and accept overrides.

### Phase 3: Integration & Polish

Ensure panel doesn't overlap other UI. Test all demos with helpers toggled. Verify model overrides apply correctly. Format and typecheck.

## Step by Step Tasks

### 1. Extend DemoContext with environment toggles

- Add to `DemoContextType`: `showAxes: boolean`, `showGrid: boolean`, `showParticles: boolean`, `settingsOpen: boolean`
- Add corresponding `setShowAxes`, `setShowGrid`, `setShowParticles`, `setSettingsOpen` setters
- Initialize all to `false` (off by default)
- Update the `useMemo` value to include new state
- Keep toggles as simple booleans — no `useReducer` needed since they change infrequently

### 2. Create SceneHelpers component for R3F scenes

- Create `src/components/SceneHelpers.tsx`
- Export `SceneHelpers` component that reads `showAxes`, `showGrid`, `showParticles` from `useDemoContext()`
- Render conditionally:
  - `<axesHelper args={[2]} />` when showAxes (2 world units long, RGB = XYZ)
  - `<gridHelper args={[12, 24, '#1a2744', '#0f1a2e']} position={[0, -2, 0]} />` with transparent material when showGrid (matches existing Three.js Canvas grid)
  - A `<Points>` particle system (60 particles, teal, 0.02 size, pulsing opacity) when showParticles (matches existing Three.js Canvas particles)
- This component goes inside `<Canvas>` in R3F and GLB demos

### 3. Wire SceneHelpers into R3F and GLB demos

- In `src/demos/R3FDemo/index.tsx`: Add `<SceneHelpers />` inside the Canvas
- In `src/demos/GLBModelDemo/index.tsx`: Add `<SceneHelpers />` inside the Canvas

### 4. Make Three.js Canvas environment conditional

- In `src/demos/ThreeJsCanvasDemo/index.tsx`: The grid and particles already exist
- Read `showGrid` and `showParticles` from context (need a ref to bridge into the imperative useEffect)
- Set `gridHelper.visible = showGrid` and `particles.visible = showParticles`
- Add an AxesHelper (size 2) to the scene, set `axesHelper.visible = showAxes`
- Sync via refs that update in the animation loop or via separate useEffects

### 5. Make CSS 3D grid conditional

- In `src/demos/CSS3DDemo/index.tsx`: The CSS grid floor div already exists
- Conditionally render it based on `showGrid` from context

### 6. Define ModelOverrides type and state

- In `src/demos/GLBModelDemo/deviceConfigs.ts`, export a new type:
  ```typescript
  export interface ModelOverrides {
    position: [number, number, number];
    rotation: [number, number, number]; // degrees for UI, converted to radians for Three.js
    scale: number; // multiplier on top of normalizeScale
    screenOffset: [number, number, number];
  }
  ```
- Add a helper function `getDefaultOverrides(config: DeviceConfig): ModelOverrides` that returns:
  ```typescript
  { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, screenOffset: config.htmlPosition }
  ```

### 7. Add modelOverrides state to GLB demo

- In `src/demos/GLBModelDemo/index.tsx`:
  - Add `const [overrides, setOverrides] = useState<Record<string, ModelOverrides>>({})`
  - Compute current overrides: `const currentOverrides = overrides[config.id] ?? getDefaultOverrides(config)`
  - Pass `currentOverrides` to `<DeviceModel>`
  - Reset overrides when device changes if no saved override exists

### 8. Update DeviceModel to accept overrides and report values

- In `src/demos/GLBModelDemo/DeviceModel.tsx`:
  - Add `overrides: ModelOverrides` to props
  - Apply `overrides.position` as an additional group position offset
  - Apply `overrides.rotation` (convert degrees → radians) as group rotation
  - Apply `overrides.scale` as multiplier: `scale={normalizeScale * overrides.scale}`
  - Use `overrides.screenOffset` instead of `config.htmlPosition` for the Html position offset
  - Add a new `ModelInfo` interface:
    ```typescript
    export interface ModelInfo {
      boundingBox: { w: number; h: number; d: number };
      normalizeScale: number;
      screenCenter: [number, number, number] | null;
      screenSize: { w: number; h: number } | null;
      distanceFactor: number;
    }
    ```
  - Accept an `onModelInfo?: (info: ModelInfo) => void` callback prop
  - Call `onModelInfo` from the useEffect that computes bounding box / screen mesh info

### 9. Build SettingsPanel component

- Create `src/components/SettingsPanel.tsx`
- **Gear button**: Fixed position `bottom: 28px, left: 32px`, same frosted-glass style as sidebar buttons, `zIndex: 20`
  - Use a simple gear SVG or the text label "Settings" with a gear unicode character
  - Clicking toggles `settingsOpen` in context
- **Panel**: Positioned `bottom: 72px, left: 32px`, width `300px`, max-height `70vh`, overflow-y auto
  - Background: `rgba(11,20,38,0.85)`, `backdropFilter: blur(16px)`, border `1px solid rgba(255,255,255,0.08)`, borderRadius `16px`
  - Padding: `16px`
  - Only rendered when `settingsOpen` is true
  - Animation: `fadeIn 0.3s ease`

- **Section: Environment**
  - Header: "Environment" in small caps, teal color, JetBrains Mono
  - 3 toggle rows: "Axes Helper", "Grid Floor", "Particles"
  - Each row: label left, small toggle button right (uses the active/inactive button pattern but smaller)

- **Section: Model Modifiers** (only rendered when `modelInfo` prop is provided — i.e., GLB demo)
  - Header: "Model Modifiers"
  - 4 subsections with number inputs:
    - **Position**: 3 number inputs (X, Y, Z) with 0.01 step
    - **Rotation**: 3 number inputs (X, Y, Z) in degrees with 1 step
    - **Scale**: 1 number input with 0.01 step, default 1.0
    - **Screen Offset**: 3 number inputs (X, Y, Z) with 0.001 step
  - Each input: monospace font, dark background, compact (50px wide), labeled with axis letter
  - `onChange` calls `onOverridesChange` prop with updated ModelOverrides

- **Section: Model Info** (only rendered when `modelInfo` prop is provided)
  - Header: "Model Info"
  - Read-only rows in monospace:
    - `Box: W × H × D` (3 decimal places)
    - `Scale: <normalizeScale>` (4 decimal places)
    - `Screen: X, Y, Z` (3 decimal places) or "not found"
    - `Screen Size: W × H` (3 decimal places)
    - `distanceFactor: <value>` (3 decimal places)

- **Section: Camera** (always rendered)
  - Header: "Camera"
  - Read-only rows:
    - `Pos: X, Y, Z` — reads from shared CAMERA constants (static for now)
    - `FOV: 35`

### 10. Wire SettingsPanel into demos

- In GLB demo: Render `<SettingsPanel modelInfo={modelInfo} overrides={currentOverrides} onOverridesChange={...} />`
- In R3F, ThreeJS, CSS3D demos: Render `<SettingsPanel />` (no model info, just environment toggles + camera)
- Adjust DemoOverlay bottom-left badges: shift up to `bottom: 72px` when settings panel is present, or just always position at `bottom: 72px` to leave room

### 11. Validate and format

- Run `npx tsc --noEmit` — must pass with zero errors
- Run `npx prettier --write "src/**/*.{ts,tsx}"` — format all files
- Visually verify: gear icon visible, panel opens, toggles work, axes/grid/particles appear in all demos
- GLB demo: verify number inputs change model position/rotation/scale in real time

## Testing Strategy

- **Unit**: No formal unit tests for this feature — it's a development tool
- **Visual verification**:
  - Toggle axes on → RGB axes visible at origin in all 3 WebGL demos
  - Toggle grid on → floor grid appears at y=-2 in all WebGL demos, CSS grid in CSS3D
  - Toggle particles on → floating teal particles in all WebGL demos
  - GLB demo: adjust Position X slider → model shifts horizontally
  - GLB demo: adjust Scale → model grows/shrinks relative to normalizeScale
  - GLB demo: adjust Screen Offset → Html overlay shifts relative to screen mesh center
  - Model Info values update when switching devices
  - Settings persist when switching demo tabs (environment toggles)
  - Panel scrolls if content overflows viewport

## Acceptance Criteria

- [ ] Gear icon button visible bottom-left on all 4 demos
- [ ] Clicking gear opens/closes the settings panel
- [ ] Environment section: Axes/Grid/Particles toggles work across all 4 demos
- [ ] Environment toggles persist when switching demo tabs
- [ ] Model Modifiers section appears only in GLB demo
- [ ] Position/Rotation/Scale/ScreenOffset inputs update the model in real time
- [ ] Model Info section shows correct computed values for the active GLB device
- [ ] Camera section shows FOV and position from shared constants
- [ ] Panel styling matches existing frosted-glass UI (backdrop blur, dark background, monospace values)
- [ ] No TypeScript errors
- [ ] Prettier formatted

## Validation Commands

- `npx tsc --noEmit` — Must compile with zero errors
- `npx prettier --check "src/**/*.{ts,tsx}"` — Must pass formatting check
- Visual: Open each demo tab, click gear, verify panel renders
- Visual: Toggle Axes in R3F demo → RGB axes appear at origin
- Visual: Toggle Grid in GLB demo → floor grid appears
- Visual: In GLB demo, change Position X from 0 to 0.5 → iPhone shifts right

## Implementation Status

- Steps 1–10: Complete, committed to `feature/settings-panel`
- Step 11 (validate/format): TypeScript and Prettier pass
- Gear button moved to bottom-right per user preference (diverges from original spec)
- **Pending:** React 19 upgrade required before merge (see below)

## React 19 Upgrade — Required Before Merge

### Why

- `SceneHelpers.tsx` uses `useRef` with a callback initializer (React 19 feature)
- `SceneHelpers.tsx` uses `meshBasicMaterial` on GridHelper — should be `lineBasicMaterial`
- Latest `@react-three/drei` requires `react ^19` and `@react-three/fiber ^9`
- Current deps: React 18.3.1, fiber v8, drei v9

### Packages to upgrade

```
react: ^18.3.1 → ^19
react-dom: ^18.3.1 → ^19
@types/react: ^18.3.12 → ^19
@types/react-dom: ^18.3.1 → ^19
@react-three/fiber: ^8.17.10 → ^9 (latest)
@react-three/drei: ^9.114.0 → latest (requires fiber ^9)
```

### Risk areas in this codebase

1. **`main.tsx`**: Uses `ReactDOM.createRoot` — still supported in React 19, no change needed
2. **`@react-three/fiber` v8 → v9 API changes**: May have breaking changes in Canvas props, event handling, or reconciler internals. Need to check R3F v9 migration guide.
3. **`drei` API changes**: `Html`, `Float`, `ContactShadows`, `Environment`, `OrbitControls`, `useGLTF` — all heavily used. Any signature changes could break GLB/R3F demos.
4. **`three` version**: Currently ^0.169.0. Fiber v9 requires >=0.156, so current version is fine. But drei latest may pull a newer minimum.
5. **`@vitejs/plugin-react`**: Should be compatible with React 19 but worth verifying.
6. **StrictMode double-renders**: React 19 StrictMode may surface new warnings in the imperative Three.js Canvas demo (useEffect with empty deps creating scene objects).
7. **Type changes**: React 19 types changed `ReactNode`, removed some legacy types, changed `ref` prop handling (no more `forwardRef` needed). This project doesn't use `forwardRef` so should be fine.

### Recommended approach

- Commit current work, push branch
- Upgrade in a separate commit on the same branch
- Run typecheck + visual test all 4 demos after upgrade
- Fix any breakage before merging

## Notes

- The settings panel is a **development/tuning tool**, not end-user UI. It can be more information-dense than the polished demo overlays.
- ModelOverrides state is ephemeral (local useState). Once the user finds good values, they report them and we hardcode into deviceConfigs.ts.
- The CSS 3D demo doesn't have a WebGL scene, so axes and particles are not applicable there — only the grid toggle applies.
- Camera section is read-only from constants for now. If we later add interactive camera controls, those values would become live.
- The Three.js Canvas demo already has grid + particles. The implementation makes them conditional rather than always-on, defaulting to off for consistency with the other demos.
