# Upgrade Roadmap

Ordered specs for the next phase of work. Each spec is a self-contained unit that can be handed to an agent. Do them in order — each builds on the previous.

---

## 1. React 19 + R3F v9 + drei v10 Upgrade

### Why first

Every subsequent spec assumes React 19. Building on React 18 and upgrading later means migrating twice. The research confirmed: R3F v9 is essentially a version bump for this codebase. The distanceFactor formula is unchanged in drei v10. The only real risk is StrictMode double-invocation in the Three.js Canvas demo's big useEffect.

### Scope

- `react` 18.3.1 → 19.2.x
- `react-dom` 18.3.1 → 19.2.x
- `@types/react` 18.3.12 → 19.x
- `@types/react-dom` 18.3.1 → 19.x
- `@react-three/fiber` 8.17.10 → 9.6.x
- `@react-three/drei` 9.114.0 → 10.7.x
- Do NOT bump `three` (0.169 is fine, R3F v9 requires >=0.156)
- Do NOT install React Compiler yet (separate spec)

### Steps

1. Create branch `feature/react-19-upgrade`
2. Update package.json versions
3. `npm install`
4. `npx tsc --noEmit` — fix any type errors from the new `@types/react`
5. Test all 4 demos visually — iPhone screen overlay, MacBook screen overlay, R3F procedural phone, CSS 3D, Three.js Canvas
6. Specifically test the Three.js Canvas demo's useEffect cleanup under StrictMode — it creates a renderer, scene, lights, particles. StrictMode will unmount and remount. Verify the cleanup function runs correctly and no duplicate renderers are created.
7. Verify the distanceFactor auto-sizing still produces correct screen overlay sizing on iPhone and MacBook GLB models
8. Verify occlude="blending" still works
9. Verify Float freeze-during-measurement still works

### Known risks

- Radix Slider v1.3.6 crashes on React 19. We don't use Radix yet but note for Spec 4.
- R3F v9.6.0 bundles its own react-reconciler for React 19.2 compatibility. This is intentional, not a bug.
- drei v10 is a major version. Check `<Html>`, `<Float>`, `<OrbitControls>`, `<ContactShadows>`, `<Environment>`, `useGLTF`, `<GizmoHelper>`, `<GizmoViewport>` for any API changes.

### Success criteria

- All 4 demos render and interact correctly
- iPhone and MacBook GLB screen overlays are correctly sized and positioned
- TypeScript compiles with zero errors
- No console errors or warnings from React/R3F/drei

---

## 2. Zustand v5 State Migration

### Why second

The current DemoContext + SettingsContext pattern won't scale past 15-20 values. We know the end state is 85+ controls. The Three.js Canvas demo's ref bridge pattern (one useEffect per synced value) is already messy at 6 values. Zustand's `store.subscribe(selector, callback)` gives the vanilla demo per-field subscriptions without the ref bridge.

### Scope

- Install `zustand@5.0.10` (pin this version — 5.0.9 has TS regression)
- Create `src/state/settingsStore.ts` with `subscribeWithSelector` middleware
- Migrate SettingsContext values (showAxes, showGrid, showParticles, showScreen, settingsOpen, screenWidth, screenHeight, cornerRadius, distanceFactor) into the store
- Migrate DemoContext values (autoRotate, activePreset) into the store
- Keep DemoContext for `themeName` and `toggleTheme` only (genuine React concern)
- Update all consumers: SettingsPanel, SceneHelpers, all 4 demos
- Wire Three.js Canvas demo to use `store.subscribe` instead of ref bridge
- Create `src/state/monitorRefs.ts` for 60fps diagnostic values (refs, not store)

### Key decisions

- Use `subscribeWithSelector` middleware for per-field vanilla subscriptions
- Export both React hook (`useSettingsStore`) and vanilla API (`settingsStore`)
- Always use selectors: `useSettingsStore(s => s.showGrid)`, never destructure
- Use `useShallow` for multi-value selectors that return objects/arrays
- Action-nonce pattern for imperative commands (resetCamera, screenshot)
- Per-model overrides keyed by device ID in the store (migrate from local useState in GLBModelDemo). CAUTION: defaults must be computed from `deviceConfigs` at store init via `getDefaultOverrides(config)`, not hardcoded. The MacBook has specific defaults (position [0, -0.5, 0], scale 0.25) that differ from the iPhone.
- `onModelInfo` callback and `modelInfo` state stay LOCAL in GLBModelDemo — this is read-only diagnostic data for the currently displayed device. Do NOT move it into the store. It's Tier 2 (refs/local) territory.

### Steps

1. Create branch `feature/zustand-migration`
2. `npm install zustand@5.0.10`
3. Create `src/state/settingsStore.ts` with all settings + actions
4. Create `src/state/monitorRefs.ts` (empty scaffold)
5. Update SettingsPanel to read from store instead of useSettingsContext
6. Update SceneHelpers to read from store
7. Update all 4 demo files to use store selectors
8. Wire Three.js Canvas demo subscriptions in its useEffect
9. Remove SettingsContext entirely
10. Slim DemoContext to theme only
11. Test all 4 demos — verify settings persist across tab switches

### Success criteria

- SettingsContext deleted
- DemoContext has only themeName + toggleTheme
- All settings persist across demo tab switches
- Three.js Canvas demo reads settings via store.subscribe, not refs
- No unnecessary re-renders (check React DevTools Profiler)
- TypeScript compiles, Prettier formatted

---

## 3. Settings Panel Controls Upgrade

### Why third

The current panel uses bare `<input type="number">` elements. The UX audit found 4 major issues. Do this BEFORE the React Compiler so the compiler is tested against the final component set, not a partial one.

### Scope

- Install `@radix-ui/react-slider@^1.3.7`, `@radix-ui/react-popover`, `@radix-ui/react-collapsible`
- Build `SliderRow` component using Radix Slider (unstyled, frosted glass CSS)
- Build `DraggableLabel` for X/Y/Z axis labels (click-drag to adjust, Shift=10x, Alt=0.1x)
- Color-coded axis labels: X=red (#E53E3E), Y=green (#38A169), Z=blue (#3182CE)
- Tooltips on all fields
- Min/max bounds on all inputs
- Escape to close panel
- Reorganize sections: Scene (toggles), Device (model tuning), Camera, Diagnostics

### Key decisions from the v3 spec and UX audit

- Radix Slider for range inputs (cross-browser styling without vendor prefixes)
- Radix Popover for future color picker
- Radix Collapsible for folder sections
- Native `<button role="switch">` for toggles (already works, no Radix needed)
- Native `<input type="number">` as fallback alongside slider for direct entry
- During drag: local useState drives thumb position AND writes to a ref/CSS var for live 3D preview. On pointerup: commit final value to Zustand store. This gives live feedback while dragging without 60fps store churn.
- `pointer-lock` during drag for infinite range

### Does NOT include

- Color pickers (no lighting controls yet — add react-colorful when needed)
- Monitor/diagnostics polling (Spec 5)
- Screenshot functionality (Spec 6)

### Success criteria

- All inputs have sliders with drag feedback
- XYZ labels are color-coded and draggable
- All inputs have tooltips and min/max bounds
- Escape closes the panel
- Settings panel sections are logically grouped
- iPhone and MacBook screen overlays still work correctly

---

## 4. React Compiler 1.0

### Why fourth

With the panel controls finalized (Spec 3), enable the compiler against the complete component set. Testing against the final components is less work than testing, adding 10+ new components, and wondering if any break it.

### Scope

- Install `babel-plugin-react-compiler`
- Configure in `vite.config.ts`
- Test all 4 demos + the new panel controls from Spec 3
- Add `"use no memo"` directive to any component that false-positives

### Steps

1. Create branch `feature/react-compiler`
2. `npm install babel-plugin-react-compiler`
3. Update `vite.config.ts`:

```ts
react({
  babel: {
    plugins: [['babel-plugin-react-compiler', {}]],
  },
});
```

4. Build and test — watch for compiler warnings
5. Test DeviceModel.tsx (imperative mesh mutations in useEffect)
6. Test the Three.js Canvas demo (large imperative useEffect)
7. Test all new Radix Slider/DraggableLabel components
8. If any component throws false positives, add `"use no memo"` at the top

### Success criteria

- Compiler enabled, builds without errors
- All 4 demos function identically
- Panel controls (sliders, draggable labels) work correctly
- No visible performance regression

---

## 5. Diagnostics and Monitor Display

### Why fifth

The settings panel shows static values. Live diagnostics (FPS, draw calls, camera position) help with debugging and tuning. This uses the monitorRefs pattern (Tier 2) — 60fps writes to refs, 4Hz polling for display.

### Scope

- Implement `src/state/monitorRefs.ts` with FPS, drawCalls, triangles, cameraPos
- Each demo writes to monitorRefs in its render loop
- Build `MonitorValue` component that polls refs at 4Hz via setInterval
- Add Diagnostics section to SettingsPanel
- Add live camera position/angle display

### Key decisions

- monitorRefs are plain `{ current: value }` objects, NOT in Zustand store
- Panel polls at 4Hz (setInterval), not 60fps
- Only re-renders the MonitorValue components, not the entire panel
- Use `renderer.info.render.calls` and `renderer.info.render.triangles` directly — no r3f-perf dependency (40 lines of code vs a dependency with stale peer deps)

### Success criteria

- FPS displays and updates ~4x per second
- Draw calls and triangle count visible
- Camera position updates as you orbit
- No performance impact from the monitoring itself

---

## 6. Lighting Controls and Color Pickers

### Why sixth

Unify the lighting rig across demos. Currently Three.js Canvas has 7 lights, R3F/GLB have 7 (after our fix). The user wants control over intensity and color of each light.

### Scope

- Install `react-colorful`
- Add lighting sliders (ambient, key, fill, rim, 3 point lights) to store
- Add color pickers using react-colorful inside Radix Popover
- Wire all 3 WebGL demos to read lighting from store
- Disable lighting section on CSS 3D demo (no WebGL)

### Success criteria

- Lighting intensity sliders affect all 3 WebGL demos
- Color pickers work inside the frosted glass panel
- CSS 3D demo shows lighting controls greyed out
- All demos have identical lighting when settings are at defaults

---

## 7. Additional GLB Devices (iMac, iPad, Monitor)

### Why last

The iPhone and MacBook patterns are proven. The auto-sizing, auto-rotation, glass overlay, and retina rendering all work. Each remaining device just needs the right config values tuned via the settings panel.

**NOTE:** The iMac and iPad entries already exist in `deviceConfigs.ts` with reasonable defaults. The auto-sizing and auto-rotation code in DeviceModel is generic. These devices might already partially work — check by switching to them in the sidebar before writing any code. They may only need `htmlPosition` tuning.

### Scope

- iMac 2021: find screenNode, set modelRotation, tune htmlPosition
- iPad Pro: find screenNode, set modelRotation (likely Y=π like iPhone), tune htmlPosition
- Office Monitor: find screenNode, set modelRotation, tune htmlPosition
- Each device follows the "Adding a New Device" section in `docs/glb-screen-overlay.md`

### Per-device checklist

1. Switch to device in sidebar
2. Check which way it faces (modelRotation)
3. Check console for auto-computed screen size and rotation
4. Tune htmlPosition via settings panel until screen overlay aligns
5. Verify occlusion works from behind
6. Hardcode final values into deviceConfigs.ts
7. Read the glass material from the GLB (if it has one) or use the generated glass

### Success criteria

- All 5 devices show the dashboard on their screens
- Screen overlays are correctly sized, positioned, and occluded
- Switching between devices is smooth
- Settings panel shows correct diagnostics for each device
