## React Code Audit: Full Comprehensive Audit

**Files analyzed:** 39 source files across `src/` (components, dashboard, demos, context, hooks, constants, types, utils) + root config files
**Date:** 2026-04-24
**Agents completed:** 8/8

---

### Critical (8 unique findings)

- **[Performance] Monolithic SettingsContext causes cascading R3F re-renders** — 9 independent `useState` calls in a single context. Any toggle (e.g., `settingsOpen`) re-renders SceneHelpers, PhoneMesh, DeviceModel. Highest-impact perf issue. `src/context/SettingsContext.tsx`. Also flagged by Patterns agent (should use `useReducer`).

- **[Performance] Inline `badges` array literals in all 4 demo files** — `badges={[...]}` creates new object references every render alongside R3F Canvases. `R3FDemo/index.tsx:107`, `CSS3DDemo/index.tsx:173`, `GLBModelDemo/index.tsx:163`, `ThreeJsCanvasDemo/index.tsx:364`.

- **[Performance] Unstable inline `onStart` callback on OrbitControls** — `onStart={() => {...}}` creates new function every render in R3F components. `R3FDemo/index.tsx:97-99`, `GLBModelDemo/index.tsx:153-156`.

- **[Testing] Zero test infrastructure** — No vitest, jest, RTL, or test script in package.json. 0% coverage across 39 files. No way to run tests at all. `package.json`.

- **[Testing] No tests for interactive components** — AssistPanel (chat flow, keyboard shortcuts), BottomNav (tab switching), SettingsPanel (toggles), DemoTabs — all completely untested.

- **[Styles] Interactive `<div>` elements lack keyboard accessibility** — 6+ files use `<div onClick>` without `<button>`, `tabIndex`, or `onKeyDown`. Keyboard users cannot navigate. `BottomNav.tsx`, `AssistPanel.tsx`, `PhoneChrome.tsx`, `TicketsTab.tsx`, `MeetingsTab.tsx`, `MeshLayerTree.tsx`. Also flagged by A11y agent.

- **[Styles] No hover/focus/active states on any interactive element** — Inline styles cannot express CSS pseudo-classes. No visual feedback on any button, tab, chip, or card. Violates WCAG 2.4.7 (Focus Visible).

- **[Patterns] `useGLTF.preload()` called in component render body** — Side-effectful preload called inside a `for` loop in the component function. Should be module-level. `GLBModelDemo/index.tsx:94-96`.

---

### High (18 unique findings)

- **[Hooks] No ESLint or `eslint-plugin-react-hooks` installed** — Zero automated hook rule enforcement. All dep array correctness is manual review. Also flagged by Architecture.

- **[Hooks] 240-line imperative useEffect with `[]` deps capturing context values** — `ThreeJsCanvasDemo/index.tsx:78-321`. Fragile closure pattern; currently safe due to memoized context.

- **[Hooks] Two effects in DeviceModel both call `onModelInfo`** — Redundant parent re-renders. `DeviceModel.tsx:92-121, 127-187`.

- **[Hooks] Async `sendMessage` with no abort guard** — Component unmount during 650ms timer causes wasted state updates. `AssistPanel.tsx:76-86`.

- **[Hooks] Race condition: OrbitControls ref may not be populated when preset effect fires** — `R3FDemo/index.tsx:29-35`, `GLBModelDemo/index.tsx:62-69`.

- **[Performance] Unmemoized `config` from `DEVICES.find()` causes DeviceModel prop churn** — `GLBModelDemo/index.tsx:41-59`.

- **[Performance] MeshBoundingBoxes recomputes all bboxes on any `layerState` toggle** — O(n*m) computation fires on every checkbox change. `MeshBoundingBoxes.tsx:133-157`.

- **[Performance] `console.log` in render-path useMemo/useEffect** — `MeshBoundingBoxes.tsx:151`, `DeviceModel.tsx:148-150`. Also flagged by Patterns, Architecture, A11y.

- **[Performance] O(n^2) `collectMeshUuids` traversal in TreeNode render** — `MeshLayerTree.tsx:191, 235-236`.

- **[A11y] TicketsTab/MeetingsTab expandable cards not keyboard-accessible** — `<div onClick>` with no `role`, `aria-expanded`, or keyboard support. `TicketsTab.tsx:52`, `MeetingsTab.tsx:33`.

- **[A11y] DemoTabs missing WAI-ARIA tab pattern** — No `role="tablist"`, `aria-selected`, or arrow-key navigation. `DemoTabs.tsx`.

- **[A11y] AssistPanel input has no label; chat lacks `aria-live` region** — `AssistPanel.tsx`.

- **[Architecture] No error boundaries anywhere** — A WebGL or render error crashes the entire app. `App.tsx`.

- **[Architecture] Dependency direction violation** — `components/SettingsPanel.tsx` imports from `demos/` directories. `R3FDemo/PhoneMesh.tsx` cross-imports from `ThreeJsCanvasDemo/`. `SettingsPanel.tsx`, `PhoneMesh.tsx`.

- **[Patterns] 4 files exceed 300 lines** — AssistPanel (470), SettingsPanel (442), MeshLayerTree (425), ThreeJsCanvasDemo (385). Plus `drawScreen.ts` (462) as a utility.

- **[Patterns] `controlsRef` typed as `any`** — `R3FDemo/index.tsx:26`, `GLBModelDemo/index.tsx:37`. Should use drei/three-stdlib types.

- **[Styles] 56+ hardcoded color values across 17 files** — No CSS custom properties. `#319795` in 30+ places, `#718096` in 20+ places, etc.

- **[Styles] No type scale; 40+ distinct font-size values** — Many below 10px (0.52rem-0.65rem). No consistent typography system. 86 `fontSize` declarations across 14 files.

---

### Medium (32 unique findings, top items)

- **[Performance] CSS3D auto-rotation creates 60fps React re-renders** — Entire component tree re-renders every frame during auto-rotate. `CSS3DDemo/index.tsx:59`.
- **[Performance] DemoOverlay, ViewPresets, DemoTabs not wrapped with `React.memo`** — Presentational components re-render on parent state changes.
- **[Performance] Inline closures in LiveDashboard, BottomNav passed to children** — `LiveDashboard.tsx:80`, `BottomNav.tsx:55,62,92`.
- **[A11y] 9 medium findings** — MeshLayerTree collapse toggle a11y, bbox toggle label, ViewPresets button states, SettingsPanel gear button a11y, NumberInput/Vec3Input labels missing, color contrast on muted text.
- **[Patterns] SettingsContext exposes raw setters** — Large API surface, no encapsulation.
- **[Patterns] `Date.now()` for message IDs** — Collision risk under rapid input. `AssistPanel.tsx:78,84`. Also flagged by Queries.
- **[Patterns] Props interfaces not marked `readonly`** — Project-wide omission.
- **[Patterns] Derived state in DeviceModel** — `measured` boolean is redundant.
- **[Architecture] No path aliases** — Deep relative imports (`../../`) everywhere.
- **[Architecture] No barrel files** — Verbose imports across the codebase.
- **[Architecture] `useAIResponseParser.ts` is not actually a hook** — Pure function in `hooks/` dir with `use` prefix.
- **[Queries] Duplicate color maps** — `useAIResponseParser.ts` hardcodes colors separately from `constants/`.
- **[Styles] Split theming** — Dashboard themed, outer shell hardcoded dark-only.
- **[Styles] ~95% of styling is static inline** — Prevents pseudo-classes, responsive design.
- **[Styles] `drawScreen.ts` duplicates dashboard in Canvas 2D** — Different fonts, spacing vs React version.
- **[Styles] Inconsistent `fontFamily` fallback stacks** — Some have `system-ui`, some don't.
- **[Styles] Undocumented z-index layering** — Values 1-60 with no constant scale.
- **[Styles] No responsive breakpoints for outer shell** — DemoTabs, SettingsPanel overflow on narrow viewports.
- **[Styles] Spacing values on no consistent grid** — Arbitrary px values (6, 10, 14) not on 4px scale.

---

### Low (20 unique findings)

- **[Performance/Patterns] Array index keys on static lists** — 11 instances across 5 dashboard files. Each has a natural string key available. `StandardsTab.tsx`, `TicketsTab.tsx`, `MeetingsTab.tsx`, `HierarchyTab.tsx`, `PhoneChrome.tsx`.
- **[Hooks] useMemo dep arrays omit stable `useState` setters** — Safe but would be flagged by exhaustive-deps. `DemoContext.tsx:39`, `SettingsContext.tsx:77-89`.
- **[Hooks] Ref writes during render** — `rotationRef.current = rotation` in CSS3DDemo, ThreeJsCanvasDemo. Technically impure.
- **[Performance] `glassMaterial` never disposed in DeviceModel** — GPU memory leak. `DeviceModel.tsx:65-73`.
- **[Performance] `lensPositions` array recreated every render** — Constants used inline. `PhoneMesh.tsx:98-102`.
- **[A11y] StatusBar/DemoOverlay decorative elements not `aria-hidden`** — Phone chrome read by screen readers. `PhoneChrome.tsx`, `DemoOverlay.tsx`.
- **[A11y] Lucide icons lack `aria-hidden` on decorative instances** — Multiple files.
- **[Architecture] No `env.d.ts`** — No autocompletion for custom env vars.
- **[Architecture] Tab navigation via string comparison chains** — Could be a lookup map. `App.tsx`.
- **[Styles] Inconsistent transition timing, border-radius, box-shadow values** — No shared constants.
- **[Queries] Brittle `MOCK_RESPONSES` key coupling** — Raw prompt strings must match `QUICK_CHIPS`. `AssistPanel.tsx`.
- **[Testing] No coverage thresholds configured** — Even once tests exist, no regression guard.
- **[Patterns] Redundant `disabled ? undefined : onToggle` guard** — Button already has `disabled`. `SettingsPanel.tsx:105`.

---

### Positive Findings (across all agents)

- **Context architecture** — Both providers use `createContext<T|null>(null)` + custom hook with throw guard + `useMemo`-stabilized values + `useCallback` for handlers. Textbook pattern.
- **Code splitting** — All 4 demos lazy-loaded via `React.lazy` at module scope with `Suspense` fallback. Significant bundle reduction.
- **GPU resource management** — PhoneMesh disposes geometries on unmount. ThreeJsCanvasDemo cleans up renderer, textures, envMap, event listeners. No WebGL memory leaks between demo switches.
- **R3F animation patterns** — SceneHelpers uses `useRef` + `useFrame` (not state) for per-frame particle animation. ThreeJsCanvasDemo uses imperative refs for orbit animation. Correct R3F patterns.
- **`prefers-reduced-motion` support** — Global CSS rule + dedicated `useReducedMotion` hook + per-component usage across all demos. Comprehensive and rare.
- **Toggle component ARIA** — `role="switch"`, `aria-checked`, `aria-label`, `disabled`. Model implementation for the rest of the codebase.
- **Security posture** — No `dangerouslySetInnerHTML`, no API keys, no user-interpolated URLs, no third-party scripts, no `fetch()`. Minimal attack surface on static GitHub Pages deployment.
- **TypeScript strictness** — `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `isolatedModules`. Only 2 `any` types in the entire codebase.
- **Constants extraction** — All domain data (tickets, ceremonies, hierarchy, themes, device configs, camera settings) centralized in `src/constants/`. Module-level, referentially stable.
- **Stable keys on dynamic content** — `key={tab.id}`, `key={child.uuid}`, `key={config.id}`, `key={msg.id}` correctly used throughout dynamic lists.
- **Pure data transformation** — `parseAIResponse` is a pure function with discriminated union return type. Properly memoized in consumer.
- **StrictMode enabled** — Catches impure renders and missing effect cleanups in development.

---

### Summary

**8 critical, 18 high, 32 medium, 20 low** findings across 8 audit agents (after deduplication).

---

### Agent Breakdown (raw counts before dedup)

| Agent                    | Critical | High | Medium | Low |
| ------------------------ | -------- | ---- | ------ | --- |
| Hooks                    | 0*       | 7    | 10     | 5   |
| Performance              | 3        | 5    | 8      | 8   |
| Accessibility + Security | 0        | 4    | 9      | 6   |
| Testing                  | 2        | 3    | 4      | 3   |
| Component Patterns       | 3        | 7    | 8      | 6   |
| Queries                  | 0        | 0    | 2      | 3   |
| Architecture             | 0        | 3    | 8      | 7   |
| Styles                   | 2        | 4    | 6      | 5   |

*Hooks agent noted 2 items as "fragile but currently safe" — elevated to Critical in unified report based on cross-agent corroboration.

---

### Top 5 Priorities (highest ROI)

1. **Split SettingsContext or migrate to Zustand** — Eliminates the #1 source of unnecessary R3F re-renders. Flagged by 3 agents (Performance, Patterns, Hooks).

2. **Replace `<div onClick>` with `<button>` across all interactive elements** — Single change fixes keyboard navigation, focus management, screen reader discoverability, and enables CSS `:hover`/`:focus` states. Flagged by 3 agents (A11y, Styles, Testing).

3. **Install ESLint with react-hooks plugin** — Catches hook rule violations, stale deps, dead imports automatically. Flagged by 2 agents (Hooks, Architecture).

4. **Add error boundaries around lazy-loaded demos** — Prevents white-screen crashes from WebGL/GLB failures. Quick win. Flagged by 2 agents (Architecture, Testing).

5. **Install test infrastructure (vitest + RTL) and test `parseAIResponse` + context hooks** — Establishes the testing foundation. `parseAIResponse` is a pure function requiring zero mocking — highest ROI first test.

---

### Detail Reports

- [Hooks Audit](audit-hooks.md)
- [Performance Audit](audit-performance.md)
- [Accessibility + Security Audit](audit-a11y-security.md)
- [Testing Audit](audit-testing.md)
- [Component Patterns Audit](audit-patterns.md)
- [Queries Audit](audit-queries.md)
- [Architecture Audit](audit-architecture.md)
- [Styles Audit](audit-styles.md)
