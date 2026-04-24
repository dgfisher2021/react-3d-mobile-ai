# Plan: Settings Panel for 3D Demo Viewer

## READ THIS FIRST — Context for the agent

You're picking up remediation work on the `feature/settings-panel` branch. **Check out that branch before doing anything** — you may be on a different branch when you start. Run `git checkout feature/settings-panel` first. The first implementation pass (steps 1-10 below) is complete and committed on that branch. The code compiles and the basic structure is sound. But it doesn't deliver what the user actually wants because the spec I wrote had gaps. I'm being upfront about this: almost every issue traces back to my instructions being incomplete or wrong, not the previous agent's execution. I'll hold you to the same standard when I review your work — if something in this spec doesn't make sense given the user's goal described below, flag it or fix it. Don't blindly follow steps that produce the wrong outcome.

### What the user actually wants and why

This project has 4 demos showing a 3D phone rendered with different techniques (Three.js Canvas, CSS 3D transforms, React Three Fiber, GLB Models). It's a portfolio piece the user is actively iterating on.

**All 4 demos should look and feel identical.** Same phone size, same rotation speed, same controls, same background, same grid, same particles, same lighting. When you switch tabs, the only thing that changes is the rendering technique — not the visual result. We mostly achieved this with shared constants and context, but the lighting rig is still inconsistent (Three.js Canvas has 7 lights, R3F and GLB only have 3).

**The settings panel is a development tool for tuning across ALL demos.** The user needs to position GLB model screen overlays onto device screen meshes. They can't do this without spatial references (axes, grid) and diagnostic values (dimensions, scale factors, camera position). Critically, these diagnostics must be visible on EVERY demo tab so the user can flip between tabs and compare values to verify things match. I screwed this up by telling the first agent to only show diagnostics on the GLB tab.

**Screen display toggle on ALL 4 demos.** The user wants to turn off the screen content (dashboard, texture, whatever it is) to see just the device model — to debug the model layer separately from the screen layer. This applies everywhere: hiding the Html overlay on R3F/GLB, hiding the LiveDashboard div on CSS 3D, hiding the canvas texture on Three.js Canvas. I completely missed this in the original spec.

**Grid and particles should be ON by default.** The Three.js Canvas demo originally had a grid floor and floating particles always visible. The user wants all demos to start with this same rich environment, with the ability to toggle things off. I wrote "Initialize all to false" in the spec — the exact opposite of what was wanted.

**The project is on React 18.3.1.** The user is open to upgrading to React 19 in the future, but not right now — and definitely not as a workaround for code bugs. The previous agent used a React 19 `useRef` callback feature, then recommended upgrading React to make it work. That's backwards. Write code that works on the current stack. If we upgrade later, that'll be a separate deliberate effort on a clean baseline.

### What I got wrong in my spec (so you don't repeat it)

| What I wrote | What the user wanted | Impact |
|---|---|---|
| "Initialize all to false" | Grid + particles ON by default | Everything starts blank |
| "no model info, just environment toggles" for non-GLB demos | Diagnostic values on ALL tabs for comparison | Can't compare across demos |
| Environment toggles: axes, grid, particles (3 items) | Also a screen display toggle on all demos | Can't debug model vs screen layers |
| No mention of lighting anywhere | Same 7-light rig across all WebGL demos | Demos look different |
| "with transparent material" on GridHelper | Needed to specify LineBasicMaterial or use ref callback | Wrong material type crashed rendering |
| No React version constraint stated | Code must work on React 18 | Agent used React 19 useRef callback |
| "apply overrides to group" without specifying Html placement | Html must be INSIDE the positioned group | Model moves but screen stays put |

---

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

## Implementation Status

Steps 1-10 completed on `feature/settings-panel` (commits bc1d721, 7fa3a3a, d684df0). TypeScript and Prettier pass. Gear button moved to bottom-right (diverges from spec but reasonable to avoid overlapping badges).

---

## Code Review & Remediation

### Review summary

The agent followed the spec faithfully. Almost every gap traces back to instructions I either wrote wrong or left out entirely. The agent's work is structurally sound — the SettingsPanel UI, ModelOverrides type system, DeviceModel callback pattern, imperative Three.js bridge in ThreeJsCanvasDemo, and CSS 3D grid conditional are all well-implemented.

### Fault analysis

| Issue | Root cause | Fault |
|---|---|---|
| C1: useRef callback crashes on React 18 | Spec never stated React version | Spec gap |
| C2: meshBasicMaterial on GridHelper | Spec said "with transparent material" without specifying type | Spec was vague; agent should know GridHelper uses LineSegments |
| H1: Html doesn't track model overrides | Spec said "apply overrides to group" but didn't specify Html must be inside that group | Spec gap |
| H2: Single context with 13 properties | Spec step 1 explicitly said "Add to DemoContextType" | Spec instructed this |
| M1: Screen toggle on GLB only | Spec environment section only lists axes/grid/particles — never mentions screen toggle | Spec gap — user asked for it, I didn't capture it |
| M2: No diagnostics on non-GLB demos | Spec step 10 literally says "no model info, just environment toggles + camera" | Spec explicitly excluded what the user wanted |
| M3: Lighting not unified | Word "light" doesn't appear in spec | Spec gap — user mentioned lighting, I ignored it |
| M4: Defaults OFF instead of ON | Spec step 1 says "Initialize all to false" | Spec instructed the wrong default |
| M5: No WebGL-only indicator on CSS 3D | Not in spec | Spec gap |

### Remediation steps

Execute these on the `feature/settings-panel` branch. Run `npx tsc --noEmit` after each step. Do NOT proceed if typecheck fails.

**IMPORTANT: This project is on React 18.3.1. Do NOT use React 19 features (useRef callbacks, use() hook, Context as Provider without .Provider). Do NOT suggest upgrading React to fix code bugs — fix the code instead.**

#### R1. Fix useRef callback (Critical)

File: `src/components/SceneHelpers.tsx`

Replace the React 19 callback initializer:
```tsx
// BROKEN — sets .current to the function, not the array
const positions = useRef<Float32Array>(() => { ... });
```
With React 18 lazy init pattern:
```tsx
const positions = useRef<Float32Array>(null!);
if (!positions.current) {
  const arr = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 10;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
  }
  positions.current = arr;
}
```

#### R2. Fix GridHelper material (Critical)

File: `src/components/SceneHelpers.tsx`

GridHelper uses `LineSegments` internally — `meshBasicMaterial` is wrong. Remove the child material and set opacity via a ref callback:
```tsx
<gridHelper
  args={[12, 24, '#1a2744', '#0f1a2e']}
  position={[0, -2, 0]}
  ref={(grid) => {
    if (grid) {
      const mat = grid.material as THREE.Material;
      mat.opacity = 0.3;
      mat.transparent = true;
    }
  }}
/>
```

#### R3. Fix Html tracking model overrides (High)

File: `src/demos/GLBModelDemo/DeviceModel.tsx`

Currently the `<Html>` is a sibling of the positioned/rotated group inside `<Float>`. When you change position or rotation via the settings panel, the model moves but the screen overlay stays put.

Move `<Html>` INSIDE the outer group that has position/rotation applied:
```tsx
<Float ...>
  <group position={pos} rotation={[rx, ry, rz]}>
    <group ref={groupRef} scale={appliedScale}>
      <primitive object={scene} />
    </group>
    {showScreen && screenCenter && (
      <Html transform position={[...]} ... />
    )}
  </group>
</Float>
```

After this change, `screenCenter` (computed from world-space bounding box) needs to be converted to the outer group's local space. Since the outer group applies position and rotation, the screenCenter values from the useEffect (which runs after mount with the scale applied but before overrides) may need adjustment. Test by changing Position X in the panel — both model and screen must move together.

#### R4. Fix default environment state (High)

File: `src/context/DemoContext.tsx`

Change grid and particles to default ON (matching what Three.js Canvas originally had):
```tsx
const [showGrid, setShowGrid] = useState(true);
const [showParticles, setShowParticles] = useState(true);
```
Leave `showAxes` as `false` — it's a debug reference, not a default visual.

#### R5. Add screen display toggle to all demos (High)

The user asked for the ability to turn the screen display on/off on ALL demos to debug the model layer separately from the screen layer. The screen means different things per demo but the concept is the same — hide the dashboard/texture so you see just the device.

Add `showScreen: boolean` and `setShowScreen` to DemoContext, default `true`.

Wire into each demo:
- **GLB demo**: Already has local `showScreen` state — replace with context value. Remove the local useState and the SidebarButton for it.
- **R3F demo** (`PhoneMesh.tsx`): Accept `showScreen` prop. Conditionally render the `<Html>` block.
- **CSS 3D demo**: Conditionally render the `<LiveDashboard>` inside the screen div. When off, show the bezel/background only.
- **Three.js Canvas demo**: The screen mesh is created inside `buildPhone.ts` but isn't named or returned separately. Add `screen.name = 'screen'` in `buildPhone.ts` after creating the screen mesh. Then in the demo's useEffect, find it with `phone.getObjectByName('screen')` and toggle its `visible` property via the imperative ref bridge pattern (same as grid/particles). Add `showScreen` to the `helpersRef` sync.

Add a "Screen Display" toggle row to the SettingsPanel Environment section (between Particles and any demo-specific controls) so the user doesn't need a separate sidebar button.

#### R6. Add diagnostic info for ALL demos (High)

The user asked to see "the default constants you are applying to them so they display the same way" so they can COMPARE values across tabs.

Currently the Model Info section only shows when `modelInfo` prop is provided (GLB only). For non-GLB demos, the settings panel only shows environment toggles and static camera values. This makes cross-tab comparison impossible.

Add an optional `staticInfo` prop to SettingsPanel. Each non-GLB demo passes its known values:
```tsx
// R3F and Three.js Canvas demos:
<SettingsPanel staticInfo={{
  dimensions: '1.44 x 3.0 x 0.16',
  screen: '393 x 852 px (1.36 x 2.92 world)',
  scale: '1.0 (procedural)',
}} />

// CSS 3D demo:
<SettingsPanel staticInfo={{
  dimensions: '393 x 852 CSS px',
  phoneScale: phoneScale.toFixed(4),
  perspective: perspective.toFixed(0),
  scale: 'viewport-relative',
}} webgl={false} />
```

When `staticInfo` is provided (non-GLB demos), render a "Phone Info" section with those values in the same monospace style as Model Info.

#### R7. Unify lighting across WebGL demos (Medium)

The user said all demos should have the same visual environment including lighting. Three.js Canvas has 7 lights; R3F and GLB have 3.

Add the 3 missing PointLights to R3F and GLB demos:
```tsx
<pointLight position={[0, 4, 2]} intensity={0.4} color={0xfff0e0} />
<pointLight position={[-3, 0, 1]} intensity={0.3} color={0x3182ce} />
<pointLight position={[3, -1, 1]} intensity={0.25} color={0x9f7aea} />
```

Consider extracting a shared `<SceneLighting />` component or adding light configs to `demoSettings.ts` so all WebGL demos reference the same source.

#### R8. Handle CSS 3D WebGL-only toggles (Low)

The CSS 3D demo has no WebGL scene, so Axes and Particles toggles do nothing there. This is confusing.

Add a `webgl` prop to SettingsPanel (default `true`). When `false`:
- Disable (gray out) the Axes Helper and Particles toggles
- Append "(WebGL)" to their labels so the user knows why they're disabled

CSS 3D demo passes `<SettingsPanel webgl={false} ... />`.

#### R9. Toggle accessibility (Low)

Add `role="switch"` and `aria-checked={active}` to the Toggle component in SettingsPanel. Pass the setting name as `aria-label`.

#### R10. Split context (Low — can defer)

DemoContext now has 13+ properties. Every toggle re-renders all consumers. Split into:
- `DemoThemeContext`: themeName, toggleTheme, autoRotate, setAutoRotate
- `DemoSettingsContext`: showAxes, showGrid, showParticles, showScreen, settingsOpen + setters

This prevents environment toggle changes from re-rendering the 3D canvas. Can be deferred if the re-render cost is not noticeable in practice.

#### R11. Validate

- `npx tsc --noEmit` — zero errors
- `npx prettier --write "src/**/*.{ts,tsx}"`
- Visual: all 4 demos show grid + particles by default
- Visual: toggle Screen off on each demo — phone shows without dashboard/texture
- Visual: toggle Axes on — RGB axes appear on all 3 WebGL demos, disabled on CSS 3D
- Visual: GLB demo — change Position X — model AND screen move together
- Visual: flip between R3F and GLB tabs — settings panel shows comparable diagnostic values
- Visual: switch tabs — all environment toggles persist

---

## Acceptance Criteria (Updated)

- [ ] Zero runtime crashes on React 18 (no React 19 features)
- [ ] Gear icon visible on all 4 demos
- [ ] Environment toggles (axes, grid, particles, screen display) work on all applicable demos
- [ ] Grid and particles default ON; axes defaults OFF
- [ ] Screen display toggle works on all 4 demos (hides dashboard/texture, shows bare device)
- [ ] Axes and Particles toggles disabled with "(WebGL)" label on CSS 3D demo
- [ ] All 3 WebGL demos have identical 7-light rig
- [ ] GLB: model modifiers move model AND screen overlay together
- [ ] Diagnostic info visible on ALL demo tabs for cross-tab comparison
- [ ] Model Modifiers and full Model Info appear only in GLB demo
- [ ] Settings persist across tab switches
- [ ] Toggle has `role="switch"` and `aria-checked`
- [ ] TypeScript passes, Prettier formatted

## Notes

- The settings panel is a **development/tuning tool**, not end-user UI. It can be more information-dense than the polished demo overlays.
- ModelOverrides state is ephemeral (local useState). Once the user finds good values, they report them and we hardcode into deviceConfigs.ts.
- The CSS 3D demo doesn't have a WebGL scene, so axes and particles are not applicable there — only grid and screen toggles apply.
- Camera section is read-only from constants for now.
- The Three.js Canvas demo already has grid + particles. The implementation makes them conditional rather than always-on, defaulting to ON for consistency.
- Do NOT suggest upgrading React, fiber, or drei to fix bugs. Fix the bugs to work with current dependencies (React 18.3.1).
