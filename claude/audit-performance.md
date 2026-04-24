## React Code Audit: Performance Mode

**Files analyzed:**
- `src/App.tsx`
- `src/main.tsx`
- `src/context/DemoContext.tsx`
- `src/context/SettingsContext.tsx`
- `src/components/DemoTabs.tsx`
- `src/components/DemoOverlay.tsx`
- `src/components/SettingsPanel.tsx`
- `src/components/ViewPresets.tsx`
- `src/components/SceneHelpers.tsx`
- `src/components/MeshLayerTree.tsx`
- `src/components/MeshBoundingBoxes.tsx`
- `src/components/dashboard/LiveDashboard.tsx`
- `src/components/dashboard/PhoneChrome.tsx`
- `src/components/dashboard/BottomNav.tsx`
- `src/components/dashboard/StandardsTab.tsx`
- `src/components/dashboard/TicketsTab.tsx`
- `src/components/dashboard/HierarchyTab.tsx`
- `src/components/dashboard/MeetingsTab.tsx`
- `src/components/dashboard/AssistPanel.tsx`
- `src/demos/R3FDemo/index.tsx`
- `src/demos/R3FDemo/PhoneMesh.tsx`
- `src/demos/CSS3DDemo/index.tsx`
- `src/demos/ThreeJsCanvasDemo/index.tsx`
- `src/demos/ThreeJsCanvasDemo/buildPhone.ts`
- `src/demos/ThreeJsCanvasDemo/drawScreen.ts`
- `src/demos/ThreeJsCanvasDemo/phoneConstants.ts`
- `src/demos/GLBModelDemo/index.tsx`
- `src/demos/GLBModelDemo/DeviceModel.tsx`
- `src/demos/GLBModelDemo/deviceConfigs.ts`
- `src/hooks/useReducedMotion.ts`
- `src/hooks/useAIResponseParser.ts`
- `src/types/index.ts`
- `src/constants/demoSettings.ts`
- `src/constants/themes.ts`
- `src/constants/quickChips.ts`
- `src/constants/tickets.ts`
- `src/constants/hierarchy.ts`
- `src/constants/ceremonies.ts`
- `src/utils/roundedRect.ts`

**Date:** 2026-04-24

---

### Critical

**P-CRIT-01: SettingsContext is a monolithic context with 9 independently-changing values**
- **File:** `src/context/SettingsContext.tsx`
- **Issue:** SettingsContext bundles 9 pieces of state (showAxes, showGrid, showParticles, showScreen, settingsOpen, screenWidth, screenHeight, cornerRadius, distanceFactor) into a single context. When ANY of these values changes, EVERY consumer re-renders. This is particularly damaging because `SceneHelpers` (an R3F component) consumes this context and re-renders on unrelated changes like `settingsOpen` toggling or `screenWidth` changing, causing visible jank in the 3D scene.
- **Consumers affected:** `SceneHelpers` (R3F), `PhoneMesh` (R3F), `DeviceModel` (R3F), `SettingsPanel`, `CSS3DDemo`, `ThreeJsCanvasDemo`, `R3FDemo`, `GLBModelDemo`
- **Fix:** Split into at least two contexts: a "scene display" context (showAxes, showGrid, showParticles, showScreen) and a "screen dimensions" context (screenWidth, screenHeight, cornerRadius, distanceFactor). Or move to a selector-based store (Zustand) since consumers only read specific slices.

**P-CRIT-02: DemoOverlay receives new `badges` array literal on every render**
- **Files:** `src/demos/R3FDemo/index.tsx` (line 107), `src/demos/CSS3DDemo/index.tsx` (line 173), `src/demos/GLBModelDemo/index.tsx` (line 163), `src/demos/ThreeJsCanvasDemo/index.tsx` (line 364)
- **Issue:** Every demo passes `badges={[...]}` as an inline array of new objects on each render. Each badge object `{ label, color }` is a fresh reference every time. Since these demos include R3F Canvases, any context-triggered re-render of the parent rebuilds these arrays, causing DemoOverlay to re-render unnecessarily. The badges are static data.
- **Fix:** Extract each badges array to a module-level constant (e.g., `const R3F_BADGES = [...]`). These values never change.

**P-CRIT-03: Inline callback `onStart` on OrbitControls creates new function every render**
- **Files:** `src/demos/R3FDemo/index.tsx` (line 97-99), `src/demos/GLBModelDemo/index.tsx` (line 153-156)
- **Issue:** `onStart={() => { setAutoRotate(false); setActivePreset(null); }}` creates a new function reference every render, passed as a prop to the `OrbitControls` drei component. OrbitControls is an R3F component that gets invalidated on every parent render because of this unstable prop. In the GLB demo, this parent re-renders frequently (device switching, model info updates, mesh layer changes).
- **Fix:** Wrap in `useCallback` with `[setAutoRotate, setActivePreset]` deps, or extract to a named handler.

---

### High

**P-HIGH-01: GLBModelDemo re-creates `handleOverridesChange` and `resetCurrentDevice` on every device switch but also on every render via config lookup**
- **File:** `src/demos/GLBModelDemo/index.tsx` (lines 41-59)
- **Issue:** `config` is derived from `DEVICES.find(...)` every render, creating a new object reference. `handleOverridesChange` and `resetCurrentDevice` depend on `config.id`, which is correct, but `config` is used directly in JSX props like `config.label` and `config.id`, causing child re-renders. The `DeviceModel` component receives `config` as a prop which is a new `.find()` result reference each render.
- **Impact:** `DeviceModel` is an R3F component with heavy `useEffect` chains. Unnecessary re-renders trigger expensive GLB scene measurements.
- **Fix:** Memoize `config` with `useMemo(() => DEVICES.find(...) ?? DEVICES[0], [deviceId])`.

**P-HIGH-02: `MeshBoundingBoxes` recomputes bounding boxes on every `layerState` change**
- **File:** `src/components/MeshBoundingBoxes.tsx` (line 133-157)
- **Issue:** The `bboxes` useMemo depends on `[scene, layerState]`. Since `layerState` is a plain object that gets a new reference whenever any mesh visibility or bbox toggle changes, this recomputes ALL bounding boxes (with `console.log` inside!) every time any single mesh checkbox is toggled. The computation involves `scene.traverse()`, `Box3.setFromObject()`, and `getMeshColor()` (another traversal).
- **Fix:** Move the filtering (`state?.showBBox`) outside the expensive computation. Memoize the full bounding box list by `scene` only, then filter by `layerState` cheaply.

**P-HIGH-03: `console.log` in render-path computations in production-facing code**
- **Files:** `src/components/MeshBoundingBoxes.tsx` (line 151), `src/demos/GLBModelDemo/DeviceModel.tsx` (lines 148-150)
- **Issue:** `console.log` calls inside `useMemo` and `useEffect` that run during normal operation (not just debugging). These log on every bbox toggle and every device mount, adding I/O overhead in the hot path.
- **Fix:** Remove or gate behind `import.meta.env.DEV`.

**P-HIGH-04: `DeviceModel` has unstable `onModelInfo` callback causing effect re-runs**
- **File:** `src/demos/GLBModelDemo/index.tsx` (line 33), `src/demos/GLBModelDemo/DeviceModel.tsx` (lines 121, 187)
- **Issue:** `onModelInfo={setModelInfo}` passes the `useState` setter directly, which is stable. However, the `useEffect` at line 92 in DeviceModel.tsx includes `onModelInfo` in its dependency array alongside `normalizeScale`, `bbox`, etc. When `onModelInfo` is listed as a dep but is already stable (setState), this is fine. BUT the second `useEffect` at line 127 also includes `onModelInfo` and runs heavy matrix computations (Box3, quaternion decomposition). If `onModelInfo` were ever wrapped or changed to a non-stable reference, this would cause repeated heavy computation. Currently safe but fragile.
- **Fix:** Consider removing `onModelInfo` from the dependency arrays since `setModelInfo` from `useState` is guaranteed stable, or wrap it in a ref.

**P-HIGH-05: `TreeNode` in MeshLayerTree performs `collectMeshUuids()` traversal on every render for group nodes**
- **File:** `src/components/MeshLayerTree.tsx` (lines 191, 235-236)
- **Issue:** Non-mesh, non-group nodes call `collectMeshUuids(object)` to check for descendants every render. Group nodes call `areAllDescendantsVisible()` and `areSomeDescendantsVisible()`, each of which calls `collectMeshUuids()` again, traversing the THREE.js scene graph. With a complex GLB model (dozens of meshes), this is O(n^2) per render of the tree.
- **Fix:** Precompute mesh UUIDs per node once (when `scene` changes) and pass the map down. Or memoize `collectMeshUuids` results by object UUID.

---

### Medium

**P-MED-01: `DemoTabs` does not use React.memo despite receiving array + function props**
- **File:** `src/components/DemoTabs.tsx`
- **Issue:** `DemoTabs` receives `tabs` (array), `activeId` (string), and `onChange` (function). It renders in the root `App` component. When the active demo causes a re-render (e.g., context changes), `DemoTabs` re-renders too. The `tabs` array is a module-level constant (stable), but `onChange` is `setActive` from `useState` (stable). Wrapping in `memo` would be cheap insurance since this is a small component.
- **Severity note:** Low impact because `App` only re-renders on `active` state changes, which are infrequent.

**P-MED-02: `DemoOverlay` does not use React.memo despite being purely presentational**
- **File:** `src/components/DemoOverlay.tsx`
- **Issue:** `DemoOverlay` is a purely presentational component that receives static props in most demos. When the parent demo re-renders (context changes), DemoOverlay re-renders even though its props haven't changed. Since it lives alongside R3F Canvases, any unnecessary DOM work competes with the WebGL frame budget.
- **Fix:** Wrap with `React.memo`.

**P-MED-03: `ViewPresets` does not use React.memo**
- **File:** `src/components/ViewPresets.tsx`
- **Issue:** Same pattern as DemoOverlay. Receives `autoRotate`, `activePreset`, `onPreset`, `onAuto`, and optional `children`. The callback props (`onPreset`, `onAuto`) are already wrapped in `useCallback` in the parent demos, but without `memo` on ViewPresets, it re-renders on every parent render regardless.
- **Fix:** Wrap with `React.memo`.

**P-MED-04: `CSS3DDemo` auto-rotation creates a new state object every frame**
- **File:** `src/demos/CSS3DDemo/index.tsx` (line 59)
- **Issue:** `setRotation((prev) => ({ ...prev, y: prev.y + AUTO_ROTATE.cssDegPerFrame }))` runs every animation frame via `requestAnimationFrame`. Each call creates a new object, triggering a React state update and re-render of the entire `CSS3DDemo` component tree at 60fps. This includes re-rendering `LiveDashboard`, `DemoOverlay`, `ViewPresets`, and `SettingsPanel` every frame.
- **Impact:** The CSS3D demo is intentionally non-WebGL, but 60fps React re-renders of the entire component tree is expensive. The `isDragging` guard helps, but auto-rotate is on by default.
- **Fix:** Use a ref for rotation and apply the transform imperatively via `ref.current.style.transform`, or use CSS animation for auto-rotate.

**P-MED-05: `LiveDashboard` re-creates inline closure `() => setAssistOpen(false)` every render**
- **File:** `src/components/dashboard/LiveDashboard.tsx` (line 80)
- **Issue:** `onClose={() => setAssistOpen(false)}` creates a new function reference every render. Since `LiveDashboard` sits inside R3F `Html` or CSS 3D transforms, it can re-render frequently. The `AssistPanel` receives this unstable `onClose` prop.
- **Fix:** Memoize with `useCallback(() => setAssistOpen(false), [])`.

**P-MED-06: `BottomNav` creates inline closures for tab change and assist open**
- **File:** `src/components/dashboard/BottomNav.tsx` (line 55, 62, 92)
- **Issue:** `onClick={() => onTabChange(tab.id)}` in `.map()` and `onClick={() => onOpenAssist()}` create new functions every render. Since BottomNav renders inside a 3D-transformed context, these contribute to unnecessary work.
- **Fix:** Low priority since the tab buttons are few, but could use `useCallback` at the parent level.

**P-MED-07: Inline style objects created on every render in SettingsPanel**
- **File:** `src/components/SettingsPanel.tsx` (lines 222-246, many others)
- **Issue:** The gear button and panel container create new style objects on every render via inline object literals that include dynamic values (`settingsOpen`, `BORDER`, etc.). Module-level constant styles are already used for some elements (good), but the dynamic ones are recreated each render.
- **Impact:** Low for DOM-only components, but the SettingsPanel is re-rendered by SettingsContext changes which affect R3F components.

**P-MED-08: `getMeshColor` in MeshBoundingBoxes traverses the entire scene for each mesh**
- **File:** `src/components/MeshBoundingBoxes.tsx` (line 149), `src/components/MeshLayerTree.tsx` (lines 412-424)
- **Issue:** `getMeshColor()` does a full `scene.traverse()` to find a single mesh's color by UUID. Inside `MeshBoundingBoxes.useMemo`, this is called once per visible bbox. With N bboxes shown, this is O(N * M) where M is total meshes.
- **Fix:** Use the `buildColorMap()` function (already exists in MeshLayerTree) to build a `Map<uuid, color>` once, and pass it as a prop or compute it in the parent.

---

### Low

**P-LOW-01: `useGLTF.preload` called inside component body, not at module level**
- **File:** `src/demos/GLBModelDemo/index.tsx` (lines 94-96)
- **Issue:** `for (const d of DEVICES) { useGLTF.preload(d.glbPath); }` is called inside the `GLBModelDemo` function body. While `useGLTF.preload` is idempotent (it no-ops if already cached), calling it in the component body means it runs on every render. Preloading is meant to be a module-level side effect.
- **Fix:** Move to module level: `DEVICES.forEach(d => useGLTF.preload(d.glbPath));`

**P-LOW-02: `lensPositions` array recreated on every render in PhoneMesh**
- **File:** `src/demos/R3FDemo/PhoneMesh.tsx` (lines 98-102)
- **Issue:** `const lensPositions: [number, number][] = [...]` is declared inside the component body but uses only constants (`PHONE_W`, `PHONE_H`). It's a new array reference each render.
- **Fix:** Move to module level since all values are constants.

**P-LOW-03: `StatusBar` signal bars use array index as key**
- **File:** `src/components/dashboard/PhoneChrome.tsx` (line 26)
- **Issue:** `{[10, 12, 14, 16].map((ht, i) => <div key={i} ...>)}` uses array index as key. Since the list is static and never reordered, this is functionally harmless but violates best-practice for keys.
- **Fix:** Use the height value as key: `key={ht}`.

**P-LOW-04: `KPIS` and `CAPACITY_FACTS` arrays use index keys in StandardsTab**
- **File:** `src/components/dashboard/StandardsTab.tsx` (lines 32, 157)
- **Issue:** `.map((kpi, i) => <div key={i}>)` and `.map((item, i) => <div key={i}>)`. Static lists, never reordered, so no functional impact.
- **Fix:** Use a derived key (e.g., `key={kpi.label}`, `key={item.label}`).

**P-LOW-05: `TicketsTab` and `MeetingsTab` use index keys for static data**
- **Files:** `src/components/dashboard/TicketsTab.tsx` (line 37), `src/components/dashboard/MeetingsTab.tsx` (line 19)
- **Issue:** Same as above. `TICKET_TYPES.map((ticket, i) => <div key={i}>)` and `CEREMONIES.map((cer, i) => <div key={i}>)`.
- **Fix:** Use `key={ticket.type}` and `key={cer.name}` respectively.

**P-LOW-06: `HierarchyTab` uses index keys for HIERARCHY data**
- **File:** `src/components/dashboard/HierarchyTab.tsx` (line 46)
- **Issue:** `HIERARCHY.map((h, i) => <div key={i}>)`. Static data, never reordered.
- **Fix:** Use `key={h.level}`.

**P-LOW-07: `glassMaterial` in DeviceModel is never disposed**
- **File:** `src/demos/GLBModelDemo/DeviceModel.tsx` (line 65-73)
- **Issue:** `glassMaterial` is created via `useMemo` but never disposed when the component unmounts. Unlike `PhoneMesh` which explicitly disposes its geometries, `DeviceModel` leaks this material.
- **Fix:** Add a cleanup `useEffect` to call `glassMaterial.dispose()`.

**P-LOW-08: `circleBtn` function returns a new style object on every call**
- **File:** `src/components/dashboard/AssistPanel.tsx` (line 457-469)
- **Issue:** `circleBtn(theme)` is called inline in JSX (lines 139, 146), creating a new style object each render. The `theme` object reference changes when theme toggles.
- **Fix:** Minor; could memoize or extract to a constant when theme is stable.

---

### Positive Findings

**P-POS-01: Excellent code splitting with React.lazy at module level**
- **File:** `src/App.tsx` (lines 7-10)
- All four demo components are lazy-loaded with `React.lazy()` declared at module level (not inside the component body). Each demo is a substantial bundle (Three.js scene setup, GLB loading, etc.), so this provides significant initial load reduction. Proper `Suspense` boundary with a loading fallback is in place.

**P-POS-02: Context value objects are properly stabilized with useMemo**
- **Files:** `src/context/DemoContext.tsx` (line 30), `src/context/SettingsContext.tsx` (line 55)
- Both context providers use `useMemo` to stabilize the value object, preventing unnecessary consumer re-renders when the provider's parent re-renders without state changes. The dependency arrays are correct and complete.

**P-POS-03: Context providers use custom hooks with null guards**
- **Files:** `src/context/DemoContext.tsx` (lines 15-20), `src/context/SettingsContext.tsx` (lines 28-33)
- Both contexts use the `createContext<T | null>(null)` + custom hook pattern with explicit error messages when used outside a provider. This is the recommended pattern.

**P-POS-04: Callbacks in DemoContext are stabilized with useCallback**
- **File:** `src/context/DemoContext.tsx` (line 28)
- `toggleTheme` uses `useCallback` with an empty dependency array and updater function pattern. State setters (`setAutoRotate`, `setActivePreset`) are inherently stable.

**P-POS-05: Three.js geometries in PhoneMesh are properly memoized and disposed**
- **File:** `src/demos/R3FDemo/PhoneMesh.tsx` (lines 39-96)
- Five geometries (bodyGeo, backGeo, bezelGeo, lensGeo, ringGeo) are created with `useMemo` and explicitly disposed in a cleanup `useEffect`. This prevents GPU memory leaks when switching between demos.

**P-POS-06: Particle system uses refs for animation instead of state**
- **File:** `src/components/SceneHelpers.tsx` (lines 9-46)
- The `Particles` component uses `useRef` for positions and `useFrame` for animation, avoiding React state updates on every frame. This is the correct R3F pattern for per-frame animations.

**P-POS-07: ThreeJsCanvasDemo uses imperative refs for animation loop**
- **File:** `src/demos/ThreeJsCanvasDemo/index.tsx`
- The pure Three.js demo correctly uses `useRef` for orbit state and runs the animation loop imperatively via `requestAnimationFrame`, avoiding React re-renders during animation. Context values are synced to refs for reading in the animation loop.

**P-POS-08: useReducedMotion hook properly respects accessibility preferences**
- **File:** `src/hooks/useReducedMotion.ts`
- Correctly uses `matchMedia` with a live listener for `prefers-reduced-motion`, disabling Float animations and particle drift for users who prefer reduced motion.

**P-POS-09: AssistPanel memoizes parsed AI responses**
- **File:** `src/components/dashboard/AssistPanel.tsx` (lines 68-74)
- `parsedByMessageId` uses `useMemo` keyed on `messages` to avoid re-parsing AI responses on every keystroke in the input field. Good awareness of the re-render implications of text input.

**P-POS-10: MeshLayerTree callbacks are stabilized with useCallback**
- **File:** `src/components/MeshLayerTree.tsx` (lines 310-351)
- `toggleCollapse`, `toggleVisible`, `toggleGroupVisible`, and `toggleBBox` all use `useCallback` with appropriate dependencies. `meshCount` and `colorMap` are memoized with `useMemo`.

**P-POS-11: Static constants are properly extracted to module level**
- **Files:** All `constants/*.ts` files, style objects in `SettingsPanel.tsx`, `ViewPresets.tsx`, `MeshLayerTree.tsx`
- The codebase consistently extracts static data (THEMES, TICKET_TYPES, CEREMONIES, HIERARCHY, CAMERA, VIEW_PRESETS, etc.) to module-level constants, preventing unnecessary object creation during renders.

**P-POS-12: No lists requiring virtualization**
- All lists in the app are small and bounded: 5 ticket types, 4 ceremonies, 5 hierarchy levels, 4 KPIs, 6 demo tabs, and a handful of GLB meshes. None approach the 1000+ threshold where virtualization would be needed.

**P-POS-13: Key prop used correctly on dynamic content**
- **File:** `src/App.tsx` (lines 56-58)
- `GLBModelDemo` uses `key` prop (e.g., `key="iphone"`, `key="macbook"`) to force remount when switching between device sub-tabs sharing the same component, correctly resetting internal state.

---

### Summary

The codebase demonstrates strong performance awareness overall -- code splitting, context stabilization, R3F-appropriate animation patterns (useFrame + refs), geometry disposal, and accessibility support are all well-implemented.

The most impactful issue is **P-CRIT-01** (monolithic SettingsContext). Every toggle in the settings panel triggers re-renders of R3F scene components (`SceneHelpers`, `PhoneMesh`, `DeviceModel`) that have no interest in the changed value. In a 3D rendering context, these unnecessary re-renders translate directly to dropped frames. Splitting the context or migrating to a selector-based store (Zustand) would have the highest performance ROI.

**P-MED-04** (CSS3D auto-rotation at 60fps React re-renders) is architecturally significant -- the entire CSS3D demo component tree re-renders every frame during auto-rotation, including the LiveDashboard and all overlays. Moving to imperative DOM updates for the rotation transform would eliminate this.

The remaining Critical and High issues are primarily about unstable object/function references passed into R3F components, which is the #1 cause of jank in react-three-fiber applications. The fixes are mechanical (extract constants, add useCallback, memoize with useMemo).

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 5 |
| Medium | 8 |
| Low | 8 |
| Positive | 13 |
