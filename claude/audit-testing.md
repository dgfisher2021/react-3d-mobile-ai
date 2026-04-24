## React Code Audit: Testing Mode

**Files analyzed:** All 39 source files in `src/` -- components (DemoTabs, DemoOverlay, SettingsPanel, ViewPresets, MeshLayerTree, MeshBoundingBoxes, SceneHelpers), dashboard components (LiveDashboard, AssistPanel, BottomNav, StandardsTab, TicketsTab, MeetingsTab, HierarchyTab, PhoneChrome), demos (ThreeJsCanvasDemo, CSS3DDemo, R3FDemo, GLBModelDemo, DeviceModel, PhoneMesh), hooks (useReducedMotion, useAIResponseParser), contexts (DemoContext, SettingsContext), constants, types, and utilities.

**Date:** 2026-04-24

---

### Critical

**C1. No testing framework installed -- zero test coverage across the entire codebase**

No testing dependencies exist in `package.json` (no vitest, jest, @testing-library/react, @testing-library/dom, @testing-library/jest-dom, @testing-library/user-event, or jsdom). No `test` script exists in `package.json`. Zero `.test.tsx` or `.spec.tsx` files exist in `src/`. This means the project has **0% test coverage** with no way to run tests at all.

**Required installation:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/dom \
  @testing-library/jest-dom @testing-library/user-event jsdom
```

**Required configuration files:**
- `vitest.config.ts` with jsdom environment, globals, and setup file
- `src/test/setup.ts` importing `@testing-library/jest-dom/vitest`
- `tsconfig.json` update to add `"vitest/globals"` and `"@testing-library/jest-dom"` to `compilerOptions.types`
- `package.json` script: `"test": "vitest"`, `"test:ci": "vitest run"`

**C2. No tests for user-facing interactive components**

The codebase has multiple interactive components with complex state logic that are completely untested:

- **AssistPanel** (`src/components/dashboard/AssistPanel.tsx`): Chat interface with message sending, mock API responses, keyboard shortcuts (Escape to close), input handling, quick chips, thinking state, and parsed AI response rendering. This is the most complex interactive component in the app.
- **BottomNav** (`src/components/dashboard/BottomNav.tsx`): Tab navigation with 4 tabs plus a center AI button -- controls which tab content is displayed.
- **LiveDashboard** (`src/components/dashboard/LiveDashboard.tsx`): Parent component orchestrating tab state, assist panel open/close, and expanded ticket/ceremony state.
- **SettingsPanel** (`src/components/SettingsPanel.tsx`): Toggle switches (role="switch" with aria-checked), number inputs, Vec3 inputs, reset buttons, and gear button to open/close panel.
- **DemoTabs** (`src/components/DemoTabs.tsx`): Tab bar controlling which 3D demo is active.

---

### High

**H1. No tests for pure logic / utility functions**

`parseAIResponse` (`src/hooks/useAIResponseParser.ts`) is a pure function that parses text into structured segments (text blocks vs. numbered list items with labels, descriptions, and color coding). This is the single most testable unit in the codebase -- it has no DOM dependencies, no side effects, and clear input/output contracts. It should have at minimum 5 test cases:
- Plain text input returns a single text segment
- Numbered list items are parsed correctly with `num`, `label`, `desc`
- Labels with colons are split into label + desc
- Known ticket type labels (Epic, Story, Bug, Task, Spike) get correct colors from `TICKET_COLORS`
- Known ceremony labels get correct colors from `CEREMONY_COLORS`
- Mixed text + list items produce correct segment ordering

**H2. No tests for context providers and custom hooks**

- `useDemoContext` / `DemoProvider` (`src/context/DemoContext.tsx`): Theme toggling logic, auto-rotate state, active preset state. The `useDemoContext` hook correctly throws when used outside provider -- this is a critical behavior to test.
- `useSettingsContext` / `SettingsProvider` (`src/context/SettingsContext.tsx`): 9+ pieces of state with a `resetDisplay` function that resets 4 values to defaults from `SCREEN` constants. The reset logic should be tested.
- `useReducedMotion` (`src/hooks/useReducedMotion.ts`): Listens to `prefers-reduced-motion` media query and updates live. Should be tested with `matchMedia` mock.

**H3. No tests for expandable/collapsible components**

`TicketsTab` and `MeetingsTab` both have expand/collapse behavior driven by parent state. Clicking a card toggles expanded details (required fields for tickets, agenda sections + anti-patterns for meetings). Clicking an already-expanded card collapses it. These user flows are completely untested.

---

### Medium

**M1. No accessibility tests**

While some components do use ARIA attributes correctly:
- `SettingsPanel.Toggle` uses `role="switch"`, `aria-checked`, `aria-label`, and `disabled`
- `AssistPanel` buttons use `role="button"` and `aria-label` ("Reset chat", "Close")

These ARIA patterns are never validated by tests. There are no `axe-core` or accessibility testing utilities installed. Many interactive elements lack proper semantic markup:
- `BottomNav.TabButton` uses `<div onClick>` instead of `<button>` -- not keyboard-accessible
- `AssistPanel` quick chips use `<div onClick>` instead of `<button>` -- not keyboard-accessible
- `PhoneChrome.Header` theme toggle uses `<div onClick>` instead of `<button>` -- not keyboard-accessible, no aria-label
- `MeetingsTab` and `TicketsTab` expandable cards use `<div onClick>` -- not keyboard-accessible

**M2. No error boundary or error state testing**

- `DeviceModel` logs a `console.warn` when a screen node is not found but has no user-facing error state.
- No `ErrorBoundary` wraps the Suspense fallbacks or the 3D Canvas components. If a GLB model fails to load, the app would crash with an unhandled error.
- The `AssistPanel.sendMessage` function has no error handling for the mock response lookup -- if `setTimeout` rejected (hypothetically in a real API scenario), there's no catch block.

**M3. No snapshot or visual regression tests for presentational components**

Several components are purely presentational with no interaction logic and would benefit from snapshot tests to catch unintended UI changes:
- `DemoOverlay` (badges, title, hint)
- `StatusBar`, `DynamicIsland`, `HomeIndicator` (phone chrome elements)
- `StandardsTab` (KPI grid, golden rule card, title conventions, capacity facts)
- `HierarchyTab` (hierarchy timeline visualization)

**M4. No tests for keyboard interaction**

- `AssistPanel` has Escape key handling to close the panel
- `AssistPanel` input has Enter key handling to send messages
- Neither keyboard interaction is tested
- `CSS3DDemo` has pointer drag handling that should be tested for proper event cleanup

---

### Low

**L1. No test coverage thresholds configured**

Even once testing is set up, there are no coverage thresholds to prevent regression. Recommended configuration in `vitest.config.ts`:
```ts
coverage: {
  provider: 'v8',
  thresholds: { statements: 60, branches: 50, functions: 60, lines: 60 }
}
```

**L2. Three.js / R3F components will need custom test utilities**

Components like `DeviceModel`, `PhoneMesh`, `SceneHelpers`, `MeshBoundingBoxes`, and `MeshLayerTree` operate inside a `<Canvas>` context from `@react-three/fiber`. Testing these requires either:
- A custom `renderWithCanvas` wrapper using `@react-three/test-renderer` (experimental)
- Mocking the Canvas and drei components to test the React logic layer only
- Focusing integration tests on the dashboard components rendered via `<Html>` inside the 3D scene

This is a known complexity for 3D React apps and is acceptable to defer, but the dashboard components rendered inside the 3D scene should still be tested in isolation.

**L3. `MeshLayerTree` helper functions are testable without Three.js mocks**

Functions like `buildInitialLayerState`, `collectMeshUuids`, `countMeshes`, `areAllDescendantsVisible`, and `areSomeDescendantsVisible` in `MeshLayerTree.tsx` operate on `THREE.Object3D` trees that can be constructed in tests without a WebGL context. These are good candidates for unit tests.

---

### Positive Findings

**P1. Good component architecture for testability**

Components follow a clean props-down pattern with typed interfaces. The dashboard components (`LiveDashboard`, `StandardsTab`, `TicketsTab`, etc.) accept `theme` and `themeName` as props rather than reaching into context, making them easy to test in isolation without wrapping in providers.

**P2. Pure function ready for unit testing**

`parseAIResponse` is a well-structured pure function with clear input/output that can be tested immediately with zero mocking.

**P3. Context hooks follow throw-on-missing-provider pattern**

Both `useDemoContext` and `useSettingsContext` throw descriptive errors when used outside their providers. This is a best practice and is easy to test with `renderHook`.

**P4. ARIA attributes already present in key components**

The `Toggle` component in `SettingsPanel` correctly implements `role="switch"`, `aria-checked`, `aria-label`, and `disabled`. The `AssistPanel` buttons use `role="button"` with `aria-label`. This shows accessibility awareness -- it just needs test coverage to prevent regressions.

**P5. Separation of constants from components**

Data constants (`TICKET_TYPES`, `CEREMONIES`, `HIERARCHY`, `QUICK_CHIPS`, `THEMES`, `DEVICES`) are extracted into their own files, making components easier to test with predictable data.

**P6. No Enzyme usage**

The codebase has zero Enzyme imports or patterns, which is correct for a React 18 project.

---

### Summary

The project has **zero test infrastructure and zero test coverage**. This is the single most impactful gap -- no tests exist, no test runner is configured, and no test script is defined.

**Priority order for remediation:**

1. **Install test infrastructure** (vitest, RTL, jest-dom, user-event, jsdom) and configure vitest.config.ts + setup file
2. **Unit test `parseAIResponse`** -- pure function, highest ROI, zero mocking needed
3. **Test context hooks** (`useDemoContext`, `useSettingsContext`, `useReducedMotion`) using `renderHook` -- verify throw behavior and state transitions
4. **Test `AssistPanel`** -- most complex interactive component: message flow, keyboard shortcuts, quick chips, thinking state
5. **Test `SettingsPanel` toggles and inputs** -- already has ARIA attributes making queries straightforward
6. **Test `BottomNav` and `DemoTabs`** -- tab switching behavior
7. **Test `TicketsTab` and `MeetingsTab`** -- expand/collapse flows
8. **Add accessibility tests** -- fix `<div onClick>` patterns to use `<button>`, then validate with `@axe-core/react` or `jest-axe`
9. **Add snapshot tests** for presentational components (DemoOverlay, StandardsTab, HierarchyTab)
10. **Establish coverage thresholds** to prevent regression

**Estimated component count needing tests:** 15 components + 3 hooks + 1 utility function = 19 test files.

**Components that can be tested without 3D mocking (highest priority):**
- `parseAIResponse` (pure function)
- `DemoContext` / `SettingsContext` (hooks via renderHook)
- `useReducedMotion` (hook via renderHook with matchMedia mock)
- `AssistPanel`, `BottomNav`, `DemoTabs`, `SettingsPanel`, `TicketsTab`, `MeetingsTab`, `HierarchyTab`, `StandardsTab`, `LiveDashboard`, `DemoOverlay`, `PhoneChrome` components (standard RTL render)

**Components requiring 3D test setup (defer):**
- `DeviceModel`, `PhoneMesh`, `SceneHelpers`, `MeshBoundingBoxes`, `MeshLayerTree` (need Canvas wrapper or mocks)
- `GLBModelDemo`, `R3FDemo`, `CSS3DDemo`, `ThreeJsCanvasDemo` (full demo wrappers)
