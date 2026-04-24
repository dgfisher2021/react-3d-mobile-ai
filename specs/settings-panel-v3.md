# Settings Panel V3: Dynamic Screen Sizing, Leva-Style Controls, Clean State Architecture

## READ THIS FIRST — Context

This is a portfolio project with 4 demos rendering 3D devices. The settings panel is a dev tool for tuning GLB model screen overlays and comparing values across demos. V1 and V2 work but have significant UX problems (bare number inputs, confusing labels, no bounds, no drag feedback) and a fundamental architectural issue: screen dimensions and distanceFactor are manually tuned when they can be computed dynamically from the GLB model's screen mesh geometry.

### What the user wants

- **"if you can set it properly dynamically instead of finicky adjustments"** — auto-compute screen overlay dimensions from the GLB screen mesh bounding box. Eliminate manual tuning where possible.
- **Clear separation of global vs model-specific state** — what applies to all demos vs what's per-device
- **Well-thought-out controls** — draggable inputs, bounds, color-coded axes, tooltips
- **"did you audit the ui of the whole settings control? everything logically grouped? EVERY input logical?"** — full heuristic-driven redesign

### Key discovery: distanceFactor ≈ screen mesh world width

The R3F procedural phone has screen width 1.36 world units and distanceFactor 1.35. These match. This means:
- `distanceFactor = screenMeshWorldWidth` (auto-computed from Box3)
- `htmlHeight = Math.round(htmlWidth * (meshHeight / meshWidth))` (aspect ratio from mesh)
- No manual tuning needed for screen sizing on GLB models

### Constraints

- React 18.3.1 — no React 19 features
- Branch: `feature/settings-panel`
- `npx tsc --noEmit` after each step, `npx prettier --write` on files you touch
- Build on existing code. Don't rewrite from scratch.
- Consider using `leva` (from pmndrs, same team as drei/fiber) for the controls UI — it's purpose-built for this exact use case (3D parameter tuning). It supports: draggable number inputs, vector3 inputs, folders, theming, and integrates natively with R3F. If adding a dependency feels heavyweight, implement the key patterns (draggable labels, color-coded axes, bounded inputs) manually.

---

## State Architecture

### Global State (applies to ALL demos, persists across tabs)

**DemoContext** (changes infrequently):
| State | Type | Default | Purpose |
|---|---|---|---|
| themeName | ThemeName | 'dark' | Light/dark theme |
| autoRotate | boolean | true | Auto-rotation on/off |
| activePreset | number \| null | null | Which view preset is active |

**SettingsContext** (changes on toggle/input):
| State | Type | Default | Purpose |
|---|---|---|---|
| settingsOpen | boolean | false | Panel expanded |
| showAxes | boolean | false | XYZ axes at grid floor |
| showGrid | boolean | true | Floor grid |
| showParticles | boolean | true | Floating particles |
| showScreen | boolean | true | Screen display on/off |

Note: `screenWidth`, `screenHeight`, `cornerRadius`, `distanceFactor` are REMOVED from SettingsContext. They were manual tuning values that should be auto-computed for GLB models and come from SCREEN constants for procedural demos. If the user needs to override, that's a per-device model override, not a global setting.

### Per-Device State (GLB demo only, local to GLBModelDemo)

**ModelOverrides** (per device, stored in `Record<string, ModelOverrides>`):
| Field | Type | Default | Purpose |
|---|---|---|---|
| position | [x, y, z] | [0, 0, 0] | Model position offset |
| rotation | [x, y, z] | [0, 0, 0] | Additional rotation (degrees) |
| scale | number | 1.0 | Multiplier on normalizeScale |
| screenOffset | [x, y, z] | config.htmlPosition | Screen overlay position adjustment |
| cornerRadius | number | config default or 42 | Per-device corner radius override |

**ModelInfo** (computed, read-only, reported by DeviceModel):
| Field | Type | Purpose |
|---|---|---|
| boundingBox | {w, h, d} | Raw model dimensions |
| normalizeScale | number | Auto-computed scale to reach 3.0 world units |
| screenCenter | [x, y, z] \| null | Screen mesh world-space center |
| screenSize | {w, h} \| null | Screen mesh world-space dimensions |
| autoDistanceFactor | number | Computed: screenSize.w (≈ world width) |
| autoHtmlHeight | number | Computed: round(393 * screenSize.h / screenSize.w) |
| autoAspectRatio | number | Computed: screenSize.w / screenSize.h |

### Per-Device Config (static, in deviceConfigs.ts)

| Field | Purpose | Note |
|---|---|---|
| modelRotation | Base orientation (e.g. Y=π for iPhone) | Now exposed in settings for tuning |
| screenNode | Which mesh to find | Not editable at runtime |
| htmlRotation | Euler for Html component | Rarely changes |
| portrait | Layout hint | Affects corner radius default |

---

## Dynamic Screen Sizing (the key improvement)

### How it works

In `DeviceModel.tsx`, after finding the screen mesh and computing its world-space bounding box:

```typescript
const screenBox = new THREE.Box3().setFromObject(screenMesh);
const size = new THREE.Vector3();
screenBox.getSize(size);

// Auto-compute distanceFactor and dimensions from mesh geometry
const autoDistanceFactor = Math.max(size.x, size.y) * (config.portrait ? 1 : 1);
// Actually: for portrait, width is the smaller dimension
const screenWorldWidth = config.portrait ? Math.min(size.x, size.z) : Math.max(size.x, size.z);
const screenWorldHeight = config.portrait ? Math.max(size.x, size.z) : Math.min(size.x, size.z);

// Note: which axes are width vs height depends on model orientation.
// After modelRotation is applied, we need to check which axes correspond
// to screen width and height. For most models, x=width, y=height after
// the rotation is applied. But we should check both x,y and x,z pairs
// and use the pair that matches a phone-like aspect ratio.

const autoDistanceFactor = screenWorldWidth;
const autoAspectRatio = screenWorldWidth / screenWorldHeight;
const baseWidth = 393; // Fixed CSS width matching LiveDashboard design
const autoHtmlHeight = Math.round(baseWidth / autoAspectRatio);
```

The `<Html>` component then uses:
```tsx
<Html
  transform
  occlude="blending"
  distanceFactor={autoDistanceFactor}
  style={{
    width: baseWidth,
    height: autoHtmlHeight,
    borderRadius: overrides.cornerRadius,
  }}
>
```

### What this eliminates

- Manual `distanceFactor` tuning per device
- Manual `htmlSize.width/height` in deviceConfigs
- The global `screenWidth`/`screenHeight`/`distanceFactor` in SettingsContext (those were workarounds for not having auto-computation)

### What still needs manual config

- `cornerRadius` — can't be extracted from mesh geometry. Per-device override.
- `screenOffset` — fine-tune position if auto center is off. Per-device.
- `modelRotation` — which way the device faces. Per-device.
- `htmlRotation` — Euler for the Html element. Per-device (MacBook needs -π/2 X rotation).

---

## Settings Panel Redesign

### Panel Structure

```
[Gear Button — bottom right]

Settings Panel (300px, frosted glass):
├── SCENE (global toggles)
│   ├── Screen Display    [toggle]
│   ├── Axes Helper       [toggle] (disabled + "WebGL" on CSS3D)
│   ├── Grid Floor        [toggle]
│   └── Particles         [toggle] (disabled + "WebGL" on CSS3D)
│
├── DEVICE — "{device.label}" (GLB only, shows which device)
│   ├── Base Orientation   [Vec3 draggable, degrees] (modelRotation, exposed!)
│   ├── Position Offset    [Vec3 draggable]
│   ├── Rotation           [Vec3 draggable, degrees]
│   ├── Scale              [draggable number, range 0.1–10]
│   ├── Screen Offset      [Vec3 draggable, fine step]
│   ├── Corner Radius      [draggable number, range 0–60]
│   ├── ── divider ──
│   ├── Auto-Computed (read-only):
│   │   ├── Bounding Box    W × H × D
│   │   ├── normalizeScale  0.0197
│   │   ├── distanceFactor  1.36 (auto)
│   │   ├── Screen Size     1.36 × 2.92 world
│   │   ├── Html Size       393 × 852 px (auto from aspect)
│   │   └── Aspect Ratio    0.466
│   └── [Reset Device] button
│
├── PHONE INFO (non-GLB demos, read-only)
│   ├── Dimensions    1.44 × 3.0 × 0.16
│   ├── Screen        393 × 852 px
│   ├── Scale         1.0 (procedural)
│   ├── distanceFactor 1.35
│   └── (per-demo extras like CSS phoneScale)
│
└── CAMERA (read-only)
    ├── FOV        35
    └── Distance   5.5
```

### Control Component: DraggableInput

Replace all `<input type="number">` with a custom `DraggableInput`:

```typescript
interface DraggableInputProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;        // default 0.01
  min?: number;         // clamp min
  max?: number;         // clamp max
  label?: string;       // optional inline label (e.g., "X")
  labelColor?: string;  // color-coded axis (red/green/blue)
  tooltip?: string;     // hover tooltip explaining the field
  suffix?: string;      // unit label (e.g., "°", "px")
}
```

Behavior:
- **Click the label to drag** — `cursor: ew-resize`, `onPointerDown` → `onPointerMove` computes delta × step. Shift held = 10× speed, Alt held = 0.1× speed.
- **Click the number to type** — focuses the input for direct entry.
- **Min/max clamping** — values clamped on change, visual indicator if at bounds.
- **Live update** — onChange fires on every pointermove, not just on blur.
- **Pointer lock** — `requestPointerLock()` during drag so the cursor doesn't hit screen edges.

### Vec3DraggableInput

```typescript
interface Vec3DraggableInputProps {
  label: string;
  value: [number, number, number];
  onChange: (v: [number, number, number]) => void;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
}
```

Renders three DraggableInputs with:
- **X** in `#E53E3E` (red)
- **Y** in `#38A169` (green)  
- **Z** in `#3182CE` (blue)

Matching the RGB convention of the axes helper.

### Tooltips

Every input gets a tooltip explaining what it controls:

| Field | Tooltip |
|---|---|
| Screen Display | "Show/hide the dashboard overlay on the device screen" |
| Axes Helper | "Show RGB axes at the grid floor (X=red, Y=green, Z=blue)" |
| Base Orientation | "Rotate the raw model to face the camera. Y=180° flips front/back." |
| Position Offset | "Shift the model from center. Use to fine-tune placement." |
| Scale | "Multiplier on auto-computed scale. 1.0 = default size." |
| Screen Offset | "Fine-tune the screen overlay position relative to the mesh center." |
| Corner Radius | "Border radius of the screen overlay in CSS pixels." |
| distanceFactor | "Auto-computed from screen mesh width. Controls overlay world-space size." |

---

## Steps

### 1. Add DraggableInput and Vec3DraggableInput components

Create `src/components/DraggableInput.tsx` with:
- DraggableInput component (label drag + number input)
- Vec3DraggableInput component (three color-coded DraggableInputs)
- All inline styles matching the frosted glass dark theme
- Pointer lock during drag
- Shift = 10× speed, Alt = 0.1× speed
- Min/max clamping
- Tooltip via `title` attribute

### 2. Implement dynamic screen sizing in DeviceModel

In `DeviceModel.tsx`, after computing the screen mesh bounding box:
- Compute `autoDistanceFactor` from screen mesh world width
- Compute `autoHtmlHeight` from mesh aspect ratio (base width = 393)
- Use these auto values for the `<Html>` component instead of config/context values
- Report auto values in ModelInfo callback
- Handle the axis ambiguity: after modelRotation is applied, determine which world axes correspond to screen width vs height

### 3. Simplify SettingsContext

Remove: `screenWidth`, `screenHeight`, `cornerRadius`, `distanceFactor`, `setScreenWidth`, `setScreenHeight`, `setCornerRadius`, `setDistanceFactor`, `resetDisplay`.

These are no longer global — they're either auto-computed (GLB) or constant (procedural demos). Keep only:
- `showAxes`, `showGrid`, `showParticles`, `showScreen`, `settingsOpen` + setters

### 4. Move cornerRadius to per-device ModelOverrides

Add `cornerRadius: number` to ModelOverrides. Default from config (42 for portrait, 8 for landscape). Editable per-device in the settings panel.

### 5. Expose modelRotation in settings panel

The `modelRotation` field in DeviceConfig is currently static. Add it to ModelOverrides so the user can tune base orientation without editing code. Initialize from `config.modelRotation` converted to degrees.

### 6. Restructure SettingsPanel

Rewrite SettingsPanel to use the new panel structure:
- Scene section: toggles only (showScreen moved here)
- Device section (GLB only): device label header, all DraggableInput/Vec3DraggableInput controls, read-only auto-computed values, Reset button
- Phone Info section (non-GLB): static comparable values
- Camera section: static FOV + distance

Use DraggableInput/Vec3DraggableInput everywhere instead of bare number inputs.

### 7. Update R3F PhoneMesh for procedural demos

The R3F PhoneMesh currently reads `screenWidth`, `screenHeight`, `cornerRadius`, `distanceFactor` from SettingsContext. Since those are being removed, it should use SCREEN constants directly:

```typescript
import { SCREEN } from '../../constants/demoSettings';
// Use SCREEN.width, SCREEN.height, SCREEN.cornerRadius, SCREEN.distanceFactor
```

Same for CSS3D demo — use SCREEN constants instead of context values.

### 8. Update Three.js Canvas demo

Same — use SCREEN constants instead of context values for screen-related dimensions.

### 9. Add Escape to close panel

Add a `useEffect` keydown listener for Escape that closes the settings panel.

### 10. Validate

- `npx tsc --noEmit` — zero errors
- `npx prettier --write "src/**/*.{ts,tsx}"`
- Visual: GLB iPhone — screen overlay auto-sized to match mesh, no manual tuning
- Visual: drag an X label — value changes, model moves live, cursor shows ew-resize
- Visual: X/Y/Z labels are red/green/blue
- Visual: tooltips appear on hover
- Visual: Scene section has all toggles including Screen Display
- Visual: Device section header shows "iPhone 13 Pro"
- Visual: Reset Device snaps back to defaults
- Visual: Escape closes panel
- Visual: switch tabs — toggles persist, model overrides stay per-device

## Acceptance Criteria

- [ ] Dynamic screen sizing: distanceFactor and htmlHeight auto-computed from mesh bounding box
- [ ] No global screenWidth/screenHeight/distanceFactor in SettingsContext
- [ ] DraggableInput with label drag, pointer lock, Shift/Alt modifiers, min/max bounds
- [ ] Vec3DraggableInput with X=red, Y=green, Z=blue color coding
- [ ] Tooltips on all settings fields
- [ ] modelRotation (Base Orientation) exposed as editable Vec3 in settings
- [ ] cornerRadius as per-device override, not global
- [ ] Panel sections: Scene (toggles), Device (GLB editable + auto-computed), Phone Info (non-GLB), Camera
- [ ] Device section header shows active device name
- [ ] Reset Device button
- [ ] Escape closes panel
- [ ] Procedural demos use SCREEN constants directly (no context dependency for sizing)
- [ ] TypeScript passes, Prettier formatted
- [ ] No React 19 features
