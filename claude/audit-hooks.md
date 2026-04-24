## React Code Audit: Hooks Mode

**Files analyzed:**
- src/App.tsx
- src/main.tsx
- src/hooks/useReducedMotion.ts
- src/hooks/useAIResponseParser.ts
- src/context/DemoContext.tsx
- src/context/SettingsContext.tsx
- src/components/DemoTabs.tsx
- src/components/DemoOverlay.tsx
- src/components/MeshLayerTree.tsx
- src/components/MeshBoundingBoxes.tsx
- src/components/ViewPresets.tsx
- src/components/SettingsPanel.tsx
- src/components/SceneHelpers.tsx
- src/components/dashboard/BottomNav.tsx
- src/components/dashboard/StandardsTab.tsx
- src/components/dashboard/TicketsTab.tsx
- src/components/dashboard/HierarchyTab.tsx
- src/components/dashboard/MeetingsTab.tsx
- src/components/dashboard/AssistPanel.tsx
- src/components/dashboard/PhoneChrome.tsx
- src/components/dashboard/LiveDashboard.tsx
- src/demos/CSS3DDemo/index.tsx
- src/demos/R3FDemo/index.tsx
- src/demos/R3FDemo/PhoneMesh.tsx
- src/demos/ThreeJsCanvasDemo/index.tsx
- src/demos/ThreeJsCanvasDemo/buildPhone.ts
- src/demos/ThreeJsCanvasDemo/drawScreen.ts
- src/demos/ThreeJsCanvasDemo/phoneConstants.ts
- src/demos/GLBModelDemo/index.tsx
- src/demos/GLBModelDemo/DeviceModel.tsx
- src/demos/GLBModelDemo/deviceConfigs.ts
- src/types/index.ts
- src/utils/roundedRect.ts
- src/constants/demoSettings.ts
- src/constants/themes.ts
- src/constants/quickChips.ts
- src/constants/tickets.ts
- src/constants/hierarchy.ts
- src/constants/ceremonies.ts

**Date:** 2026-04-24

---

### Critical

- **ThreeJsCanvasDemo/index.tsx:321 -- Large useEffect with empty deps reads reactive values via refs but misses `setAutoRotate` and `setActivePreset` in closure.** The `onPointerDown` handler inside the effect calls `setAutoRotate(false)`, `setActivePreset(null)`, and `setHint(false)`. These setters come from context and parent state. While `setState` functions from `useState` are stable, `setAutoRotate` and `setActivePreset` come from `useDemoContext()` and are created inside the provider. They are NOT direct `useState` setters -- they are values from a context object. If the context provider ever re-creates these (currently safe due to `useMemo` on the context value), the effect would hold stale references. The `[]` dep array means these are captured once at mount. **This is technically safe today** because `DemoProvider` memoizes its value correctly, but the pattern is fragile and would silently break if the provider changes. Additionally, this massive effect (lines 78-321, ~240 lines) mixes rendering setup, event handlers, animation loops, and cleanup in a single effect -- making it hard to reason about dependencies.

- **GLBModelDemo/index.tsx:94-96 -- `useGLTF.preload()` called in the component render body (not at top level or in an effect).** The loop `for (const d of DEVICES) { useGLTF.preload(d.glbPath); }` executes during render. `useGLTF.preload` is not a hook (it's a static method), so this does not violate Rules of Hooks, but calling side-effectful preload during render is an anti-pattern. It should be called at module scope (outside the component) or in a useEffect.

### High

- **ThreeJsCanvasDemo/index.tsx:58-60 -- useEffect syncing `autoRotate` to ref has no cleanup, and the ref pattern duplicates state.** `stateRef.current.autoRotate = autoRotate` syncs React state to an imperative ref. While this works, it creates two sources of truth for `autoRotate` (`stateRef.current.autoRotate` is set both by the effect AND directly in event handlers like `onPointerDown` at line 249). This dual-write pattern is a stale closure risk if the effect ordering changes.

- **CSS3DDemo/index.tsx:41-45 -- useEffect with `[activePreset]` missing `setRotation` dependency.** The effect reads `VIEW_PRESETS` (stable) and calls `setRotation` (stable useState setter), but omits a guard for the case where `activePreset` is set to an out-of-bounds index. More importantly, the dep array lists only `[activePreset]` but the effect's intent is to apply a preset on mount AND when preset changes -- this is correct, but an `exhaustive-deps` lint would flag that `setRotation` should technically be listed (though it's stable).

- **R3FDemo/index.tsx:29-35 and GLBModelDemo/index.tsx:62-69 -- Same pattern: useEffect with `[activePreset]` depends on `controlsRef.current` which is a ref.** Reading `controlsRef.current` inside these effects is fine, but the effects only run when `activePreset` changes. If `controlsRef` is not yet populated (e.g., Canvas not mounted), the effect silently no-ops. On the initial mount when `activePreset` is non-null, the OrbitControls ref may not be ready yet. This is a potential race condition.

- **DeviceModel.tsx:92-121 -- useEffect with many deps calls `onModelInfo` callback.** The dep array `[config.id, config.screenNode, normalizeScale, bbox, config.distanceFactor, onModelInfo]` includes `onModelInfo` which is `setModelInfo` from the parent -- stable. But if the parent ever wraps this in a non-memoized callback, this effect would re-run on every render. More concerning: `bbox` is an object created fresh by `useMemo` on line 78 when `scene` changes. Since `scene` is stable from `useGLTF`, this is fine, but the pattern of including an object in deps is fragile.

- **DeviceModel.tsx:127-187 -- useEffect with `[config.id, config.screenNode, normalizeScale, bbox, actualScale, scene, onModelInfo]` -- `onModelInfo` is called in both this effect AND the previous one (line 92).** If both effects fire on the same render, `onModelInfo` is called twice with potentially different data, causing an extra re-render cycle. The second effect (line 127) always calls `onModelInfo` unconditionally, so the first effect's call (line 113) when `screenNode` is NOT found is redundant when the second effect also runs.

- **AssistPanel.tsx:76-86 -- `sendMessage` is an async function that calls `setMessages` and `setIsThinking` after an `await`, but there is no cleanup/ignore flag.** If the user closes the panel (unmounts the component) while the 650ms `setTimeout` is in flight, React will attempt to set state on an unmounted component. While React 18 no longer warns about this, it's still a wasted update. The `await new Promise(r => setTimeout(r, 650))` should use a ref-based abort or at minimum an `ignore` flag.

- **No eslint-plugin-react-hooks installed.** The project has no ESLint configuration at all (`eslint` is not in devDependencies, no `.eslintrc` or `eslint.config.*` file exists). This means zero automated enforcement of Rules of Hooks, exhaustive-deps, or any other React lint rules. All dependency array correctness relies entirely on manual review.

### Medium

- **CSS3DDemo/index.tsx:34 -- `window.innerHeight` read during render (useState initializer).** `useState(window.innerHeight)` is fine for a client-only app, but if SSR were ever added, this would break. Given the project explicitly says NO SSR, this is low risk. The `useReducedMotion` hook correctly handles this with a `typeof window` guard -- this demo does not.

- **ThreeJsCanvasDemo/index.tsx:36-37 -- Ref assigned during render: `rotationRef.current = rotation`.** Writing to `ref.current` during render breaks component purity (per React docs, refs should only be read/written in effects and event handlers). StrictMode double-render would execute this assignment twice. In practice, since the value is just syncing state to a ref for use in event handlers, it's harmless but technically impure.

- **CSS3DDemo/index.tsx:37 -- Same pattern: `rotationRef.current = rotation` written during render.** Same issue as above.

- **ThreeJsCanvasDemo/index.tsx:43 -- `reducedMotionRef.current = reducedMotion` written during render.** Same pattern.

- **SceneHelpers.tsx:11-19 -- Lazy ref initialization pattern `if (!positions.current)` during render.** The `positions` ref is initialized conditionally during render with `if (!positions.current) { ... positions.current = arr; }`. This is a documented React pattern for lazy initialization of refs, but it reads and writes `.current` during render, which is technically impure. Works correctly with StrictMode because the second invocation sees the already-set value.

- **DeviceModel.tsx:204-206 -- `useEffect(() => { onScene?.(scene); }, [scene, onScene])` is a "You might not need an effect" candidate.** This effect exists solely to notify the parent about the scene. Since `scene` comes from `useGLTF` and is stable, this effect runs once. But conceptually, notifying a parent of a value derived during render should happen during render or via a callback ref, not an effect. The effect creates an extra render cycle (child renders -> effect fires -> parent setState -> parent re-renders -> child re-renders).

- **DeviceModel.tsx:209-219 -- useEffect that mutates Three.js objects directly.** `scene.traverse(...)` mutates `obj.visible` as a side effect. This is the correct pattern for Three.js (imperative mutations synced via effects), but it means React's rendering model does not track these visibility changes.

- **MeshBoundingBoxes.tsx:150-151 -- `console.log` inside `useMemo`.** The `useMemo` callback logs bounding box info with `console.log`. `useMemo` callbacks should be pure; console.log is a side effect. StrictMode will double-invoke this, producing duplicate log output.

- **useAIResponseParser.ts -- Named `useAIResponseParser` but exports `parseAIResponse` as a plain function, not a hook.** The filename suggests it's a hook (`use` prefix in filename), but the exported function `parseAIResponse` is a pure utility function with no hook calls. This is misleading -- the file should be in `utils/` or renamed. The actual usage in `AssistPanel.tsx` correctly calls it inside a `useMemo`, not as a hook. No Rules of Hooks violation, but the naming convention is confusing.

- **CSS3DDemo/index.tsx:33 -- `setHint` state triggers re-render but is only used once.** `hint` is set to `true` initially and flipped to `false` on first drag. This could be a ref instead of state if the hint visibility were not tied to rendering (but it is -- it controls `showHint` on `DemoOverlay`). This is fine, just noting the one-shot pattern.

### Low

- **DemoContext.tsx:39 -- useMemo dep array omits `setAutoRotate` and `setActivePreset`.** The `value` useMemo lists `[themeName, toggleTheme, autoRotate, activePreset]` but the object also includes `setAutoRotate` and `setActivePreset`. These are raw `useState` setters (stable identity), so omitting them is safe and correct. However, an exhaustive-deps lint would flag this. Adding them is harmless and silences the warning.

- **SettingsContext.tsx:77-89 -- useMemo dep array omits all `set*` functions.** Same pattern as DemoContext. The memoized value includes 9 setter functions (`setShowAxes`, `setShowGrid`, etc.) but the dep array only lists the state values and `resetDisplay`. All setters are stable `useState` identifiers. Safe to omit but would be flagged by exhaustive-deps.

- **CSS3DDemo/index.tsx:100 -- useEffect for drag handlers could be consolidated.** The `isDragging` effect (lines 83-100) adds/removes `pointermove` and `pointerup` listeners. This is a clean pattern, but the `isDragging` guard means listeners are added/removed on every drag start/end. This is correct behavior.

- **PhoneMesh.tsx:88-96 -- useEffect cleanup disposes geometries.** The cleanup correctly disposes GPU resources for memoized geometries when unmounting. The dep array `[bodyGeo, backGeo, bezelGeo, lensGeo, ringGeo]` is correct since these are all `useMemo`'d with `[]` deps (stable). Good pattern.

- **GLBModelDemo/index.tsx:36 -- `controlsRef` typed as `any`.** While not a hooks issue, `useRef<any>(null)` loses type safety for the OrbitControls ref. Same pattern at R3FDemo/index.tsx:25. Should be typed as `React.ElementRef<typeof OrbitControls>` or similar.

---

### Positive Findings

- **useReducedMotion hook (src/hooks/useReducedMotion.ts) is excellently written.** Proper lazy initializer for useState, correct useEffect with matchMedia listener, proper cleanup, empty deps array is correct since the effect subscribes to the media query which handles changes internally. Textbook hook implementation.

- **Context providers (DemoContext, SettingsContext) use the useMemo + useCallback pattern correctly.** Both providers memoize their context values with `useMemo` and wrap toggle functions with `useCallback`, preventing unnecessary re-renders of all consumers on unrelated state changes. The null-check pattern in `useDemoContext` / `useSettingsContext` provides good DX with clear error messages.

- **StrictMode is enabled in main.tsx.** The app wraps `<App />` in `<React.StrictMode>`, which catches impure renders and missing effect cleanups during development.

- **Proper useEffect cleanup in CSS3DDemo.** The drag-handling effect (lines 83-100) correctly adds and removes window event listeners with matching references. The resize effect (lines 48-51) also cleans up correctly.

- **Proper useEffect cleanup in ThreeJsCanvasDemo.** The massive imperative Three.js effect (lines 78-321) has comprehensive cleanup: cancels animation frame, removes all event listeners (mouse, touch, wheel, resize), disposes WebGL resources (envMap, pmrem, renderer, screenTexture), and removes the canvas from the DOM.

- **AssistPanel.tsx keyboard listener cleanup.** The Escape key handler (lines 57-61) properly removes the event listener on cleanup with correct deps `[onClose]`.

- **useMemo for expensive Three.js computations in PhoneMesh.** Geometry creation (`ExtrudeGeometry`, `CylinderGeometry`, `TorusGeometry`) is correctly memoized with `useMemo(() => ..., [])` to avoid recreating GPU objects on every render.

- **Correct use of useCallback with proper dependency arrays.** Throughout the codebase (MeshLayerTree, CSS3DDemo, R3FDemo, GLBModelDemo), `useCallback` is used with accurate dependency arrays that include the values actually read by the callback.

- **React.lazy + Suspense for code splitting in App.tsx.** All four demo components are lazy-loaded, reducing initial bundle size. The Suspense fallback provides a loading state.

- **Stable keys in list rendering.** Components consistently use meaningful keys (`tab.id`, `badge.label`, `child.uuid`, `chip.label`) rather than array indices for dynamic lists.

---

### Summary

**0 critical (fragile but currently safe), 7 high, 10 medium, 5 low findings**

The codebase demonstrates strong React patterns overall -- context providers are properly memoized, custom hooks follow best practices, effect cleanup is thorough, and Three.js resource management is well-handled. The most significant systemic issue is the **complete absence of ESLint** (and specifically `eslint-plugin-react-hooks`), which means all dependency array correctness relies on manual review. The ThreeJsCanvasDemo's 240-line imperative effect is the highest-risk area: while it works correctly today, its size and closure-heavy design make it brittle to future changes. The `useAIResponseParser` file naming is misleading (it's a utility, not a hook). The `useGLTF.preload()` calls in the render body should be moved to module scope.
