# Settings Panel V2: Direct Values, Shared Display State, Better UX

## Briefing

This is a portfolio project with 4 demos rendering 3D devices. The user needs a development tool to tune model positioning and compare display values across demos. The current settings panel has the right structure but wrong interaction model — it shows "modifiers" (offsets from hidden defaults) instead of letting the user see and edit actual values directly. It also lacks shared display constants (screen dimensions, corner radius, distanceFactor) that should be editable across all demos, and is missing a view preset state that persists across tabs.

**User's words:**
- "the default constants you are applying to them so they display the same way" — editable, not read-only
- "maybe even toggles to turn on and off a display showing current dimensions/scales positions" — the tuning tool
- "why can i not change those?" — referring to screen dimensions being hardcoded
- "didn't i say thats what i wanted" — yes, editable display constants across demos

**Quality bar:** Portfolio piece. The settings panel is a dev tool but should be well-organized and intuitive.

## Constraints

- React 18.3.1 — no React 19 features
- Feature branch `feature/settings-panel` — do not touch main
- Run `npx tsc --noEmit` after each step, `npx prettier --write` on files you touch
- Don't overwrite working code — build on the existing SettingsPanel, DemoContext, etc.

## Steps

### 1. Add shared screen constants to demoSettings.ts

Move hardcoded screen values into `demoSettings.ts`:

```typescript
export const SCREEN = {
  width: 393,
  height: 852,
  cornerRadius: 42,
  distanceFactor: 1.35,
} as const;
```

Update all files that hardcode these values to import from SCREEN:
- `src/demos/CSS3DDemo/index.tsx` (PHONE_W, PHONE_H → SCREEN.width, SCREEN.height)
- `src/demos/R3FDemo/PhoneMesh.tsx` (width: 393, height: 852, borderRadius: 42, distanceFactor: 1.35)
- `src/demos/ThreeJsCanvasDemo/drawScreen.ts` (cornerR = 42 * s)
- `src/demos/ThreeJsCanvasDemo/buildPhone.ts` (42/393)
- `src/demos/ThreeJsCanvasDemo/index.tsx` (canvas 512x1024 — change to match SCREEN aspect ratio: use 512 width, compute height as `Math.round(512 * SCREEN.height / SCREEN.width)`)

### 2. Split DemoContext

Split into two contexts per the react-use-context skill pattern:

**DemoContext** (changes infrequently — theme, rotation):
- themeName, toggleTheme
- autoRotate, setAutoRotate
- activePreset, setActivePreset (NEW — index or null for free orbit)

**SettingsContext** (changes on toggle clicks — environment + display):
- showAxes, showGrid, showParticles, showScreen, settingsOpen + setters
- screenWidth, screenHeight, cornerRadius, distanceFactor + setters (NEW — initialized from SCREEN defaults)
- resetDisplay() callback (NEW — resets screen values to SCREEN defaults)

Both contexts need `useMemo` for value stabilization. Create custom hooks: `useDemoContext()` and `useSettingsContext()`.

### 3. Add activePreset to DemoContext

Type: `activePreset: number | null` (index into VIEW_PRESETS, or null for free orbit/auto).

When a user clicks a view preset button, store it in context. Each demo reads it and applies via its own mechanism. When the user manually drags to orbit, set to null.

Wire into each demo:
- **R3F + GLB**: Read activePreset, call `controls.setAzimuthalAngle/setPolarAngle` via useEffect when it changes
- **CSS 3D**: Read activePreset, setRotation from VIEW_PRESETS[i].cssDeg when it changes
- **Three.js Canvas**: Read activePreset via ref bridge, set targetRot from VIEW_PRESETS[i].rad

### 4. Restructure SettingsPanel sections

New layout:

**Display** section:
- Screen Display toggle (on/off)
- Screen Width: editable number input (default 393)
- Screen Height: editable number input (default 852)
- Corner Radius: editable number input (default 42)
- Distance Factor: editable number input (default 1.35)
- Reset Display button — resets all to SCREEN defaults

**Scene** section:
- Axes Helper toggle
- Grid Floor toggle  
- Particles toggle

**Model** section (GLB demo only — merges current Model Modifiers + Model Info):
- Show actual computed values that are editable:
  - Position X, Y, Z (actual world position, not offset)
  - Rotation X, Y, Z (degrees)
  - Scale (actual applied scale = normalizeScale * multiplier)
  - Screen Position X, Y, Z (actual screen center + offset)
- Show read-only computed values below:
  - Bounding box W x H x D
  - normalizeScale
- Reset Model button — resets overrides to defaults for current device

**Phone Info** section (non-GLB demos):
- Same fields as Model section but using shared constants:
  - Dimensions (from PHONE constants)
  - Screen (from SCREEN constants)  
  - Scale: 1.0 (procedural)

**Camera** section:
- FOV (from CAMERA constant)
- Distance (from CAMERA.z)

### 5. Update ModelOverrides to use direct values instead of offsets

Currently:
```typescript
interface ModelOverrides {
  position: [number, number, number];  // offset from origin
  rotation: [number, number, number];  // offset in degrees
  scale: number;                       // multiplier
  screenOffset: [number, number, number]; // offset from mesh center
}
```

The user sees `Position: 0, 0, 0` which tells them nothing about where the model actually is. Change to direct values:

```typescript
interface ModelOverrides {
  position: [number, number, number];  // actual world position
  rotation: [number, number, number];  // actual rotation in degrees
  scale: number;                       // actual applied scale (normalizeScale * multiplier)
  screenPosition: [number, number, number]; // actual screen world position
}
```

`getDefaultOverrides` computes the initial actual values from the model's bounding box and normalizeScale after mount. The inputs show real positions the user can understand and edit.

In DeviceModel, convert from actual values back to the offsets Three.js needs:
- position offset = overrides.position - [0, 0, 0] (origin)
- scale multiplier = overrides.scale / normalizeScale
- screen offset = overrides.screenPosition - screenCenter

### 6. Add Reset callbacks

In GLBModelDemo:
```typescript
const resetCurrentDevice = useCallback(() => {
  setOverrides(prev => {
    const next = { ...prev };
    delete next[config.id];
    return next;
  });
}, [config.id]);
```

In SettingsContext:
```typescript
const resetDisplay = useCallback(() => {
  setScreenWidth(SCREEN.width);
  setScreenHeight(SCREEN.height);
  setCornerRadius(SCREEN.cornerRadius);
  setDistanceFactor(SCREEN.distanceFactor);
}, []);
```

Add these as small "Reset" buttons in each section.

### 7. Wire shared display values into all demos

Each demo reads screenWidth, screenHeight, cornerRadius, distanceFactor from SettingsContext instead of hardcoded constants:
- **CSS 3D**: Use context values for phone div dimensions and border-radius
- **R3F PhoneMesh**: Use context values for Html style width/height/borderRadius and distanceFactor
- **GLB DeviceModel**: Use context values for Html style (iPhone device at least)
- **Three.js Canvas**: Use context values for drawScreen scaling and buildPhone screen corner

When the user changes screen width from 393 to 400 in the settings panel, ALL demos update live.

### 8. Move axes helper to grid floor level

The axes currently render at world origin (0, 0, 0) which is the center of the phone model — visually cluttered. Move them to the grid floor plane at y=-2 so they provide spatial reference without overlapping the model:

```tsx
{showAxes && <axesHelper args={[2]} position={[0, -2, 0]} />}
```

This puts the axes at the same Y level as the grid, which makes more spatial sense — the axes show the floor plane orientation.

### 9. Validate

- `npx tsc --noEmit` — zero errors
- `npx prettier --write "src/**/*.{ts,tsx}"`
- Visual: change Screen Width in settings → all demos update
- Visual: switch tabs → display values, view preset, and environment toggles all persist
- Visual: GLB demo → Position shows actual world coordinates, not 0,0,0
- Visual: Reset Display → values snap back to 393 x 852 x 42
- Visual: Reset Model → GLB model snaps back to default position

## Acceptance Criteria

- [ ] Screen constants (393, 852, 42, 1.35) in demoSettings.ts, no hardcoded duplicates
- [ ] Context split: DemoContext (theme/rotate/preset) and SettingsContext (toggles/display)
- [ ] activePreset persists across tab switches with animated transition
- [ ] Display section: editable screen width, height, corner radius, distanceFactor
- [ ] All demos react to display value changes in real time
- [ ] GLB Model section shows actual values, not offsets
- [ ] Reset Display and Reset Model buttons work
- [ ] Phone Info on non-GLB demos shows comparable values
- [ ] Settings panel sections: Display, Scene, Model (GLB), Phone Info (non-GLB), Camera
- [ ] TypeScript passes, Prettier formatted
- [ ] No React 19 features
