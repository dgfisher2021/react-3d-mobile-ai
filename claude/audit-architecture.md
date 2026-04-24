## React Code Audit: Architecture Mode

**Files analyzed:**
- `src/App.tsx`, `src/main.tsx`, `src/index.css`
- `src/components/` (8 files): `DemoOverlay.tsx`, `DemoTabs.tsx`, `MeshBoundingBoxes.tsx`, `MeshLayerTree.tsx`, `SceneHelpers.tsx`, `SettingsPanel.tsx`, `ViewPresets.tsx`
- `src/components/dashboard/` (7 files): `AssistPanel.tsx`, `BottomNav.tsx`, `HierarchyTab.tsx`, `LiveDashboard.tsx`, `MeetingsTab.tsx`, `PhoneChrome.tsx`, `StandardsTab.tsx`, `TicketsTab.tsx`
- `src/constants/` (5 files): `ceremonies.ts`, `demoSettings.ts`, `hierarchy.ts`, `quickChips.ts`, `themes.ts`, `tickets.ts`
- `src/context/` (2 files): `DemoContext.tsx`, `SettingsContext.tsx`
- `src/demos/ThreeJsCanvasDemo/` (4 files): `index.tsx`, `buildPhone.ts`, `drawScreen.ts`, `phoneConstants.ts`
- `src/demos/CSS3DDemo/` (1 file): `index.tsx`
- `src/demos/R3FDemo/` (2 files): `index.tsx`, `PhoneMesh.tsx`
- `src/demos/GLBModelDemo/` (3 files): `index.tsx`, `DeviceModel.tsx`, `deviceConfigs.ts`
- `src/hooks/` (2 files): `useAIResponseParser.ts`, `useReducedMotion.ts`
- `src/types/index.ts`
- `src/utils/roundedRect.ts`
- Root configs: `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.prettierrc.json`, `.gitignore`, `package.json`, `index.html`

**Date:** 2026-04-24

---

### Critical

No critical issues found.

---

### High

**H1. No ESLint configuration**
There is no `eslint.config.js`, `.eslintrc.*`, or ESLint dependency in `package.json`. The project has Prettier but no static analysis for code quality, unused imports, React hooks rules, or type-aware linting. The skill reference (`react-project-setup`) mandates ESLint flat config with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` for all project sizes.

- **Impact:** Hooks rules violations, dead imports, and subtle bugs go undetected.
- **Fix:** Install `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` and create `eslint.config.js` with flat config. Add `"lint": "eslint ."` to `package.json` scripts.

**H2. No error boundaries**
Zero error boundary components exist anywhere in the tree. The app lazy-loads four heavy 3D demo components (WebGL, GLB models). A single render error in any demo will crash the entire app, showing a blank screen. The `<Suspense>` in `App.tsx` only handles loading, not errors.

- **Impact:** A WebGL context failure, malformed GLB, or any render error shows a white screen with no recovery.
- **Fix:** Add an `ErrorBoundary` component (class-based with `getDerivedStateFromError`) wrapping each lazy-loaded demo, with a fallback UI and a "retry" button.

**H3. Dependency direction violation: shared component imports from demos**
`src/components/SettingsPanel.tsx` imports from `src/demos/`:
```
import { PHONE } from '../demos/ThreeJsCanvasDemo/phoneConstants';
import type { ModelInfo } from '../demos/GLBModelDemo/DeviceModel';
import type { ModelOverrides } from '../demos/GLBModelDemo/deviceConfigs';
```
Shared `components/` should never import from `demos/`. This creates a circular dependency risk and means `SettingsPanel` cannot be used or tested without pulling in demo-specific code.

Similarly, `src/demos/R3FDemo/PhoneMesh.tsx` imports `PHONE` from `ThreeJsCanvasDemo/phoneConstants` -- a cross-demo dependency that couples unrelated demos.

- **Impact:** Violates single-direction dependency rule; makes refactoring dangerous.
- **Fix:** Move `phoneConstants.ts` to `src/constants/phone.ts`. Move `ModelInfo` and `ModelOverrides` types to `src/types/` or `src/types/glb.ts`. Update all imports.

---

### Medium

**M1. No path aliases configured**
The project uses relative imports everywhere (`../../components/`, `../../constants/`). Neither `tsconfig.app.json` nor `vite.config.ts` configures `@/` path aliases. The skill reference calls this out: "NEVER use relative imports like `../../../components/Button`." Deep nesting produces paths like `../../components/dashboard/LiveDashboard` in demo files.

- **Impact:** Refactoring file locations requires updating many import paths manually.
- **Fix:** Add `"paths": { "@/*": ["./src/*"] }` to `tsconfig.app.json` and `resolve.alias` to `vite.config.ts`.

**M2. No barrel files (index.ts re-exports)**
Only `src/types/index.ts` exists as a barrel. The `components/`, `components/dashboard/`, `constants/`, `hooks/`, `utils/`, and `context/` directories have no barrel files. Every consumer imports the full path to each individual file.

- **Impact:** Import statements are verbose and fragile; adding a new component requires each consumer to know the exact file name.
- **Fix:** Add `index.ts` barrel files per directory (at minimum for `components/`, `components/dashboard/`, `constants/`, `context/`, `hooks/`, `utils/`). Watch for circular imports -- barrel files that re-export everything from directories that import from each other can trigger cycles.

**M3. `useRef<any>` used for OrbitControls**
Both `src/demos/R3FDemo/index.tsx:25` and `src/demos/GLBModelDemo/index.tsx:36` use `useRef<any>(null)` for `OrbitControls`. drei exports an `OrbitControls` type that should be used.

- **Impact:** No type safety on `controlsRef.current` -- calling misspelled methods would not be caught at compile time.
- **Fix:** `useRef<React.ElementRef<typeof OrbitControls>>(null)` or import the concrete type from drei/three.

**M4. Missing `noUncheckedIndexedAccess` in tsconfig**
`tsconfig.app.json` does not include `noUncheckedIndexedAccess: true`. The skill reference recommends it as a standard strict setting. The code does unchecked array indexing (e.g., `VIEW_PRESETS[index]`, `DEVICES[0]`) without null guards.

- **Impact:** Runtime errors possible if an index is out of bounds.
- **Fix:** Add `"noUncheckedIndexedAccess": true` to `tsconfig.app.json` and add null checks where needed.

**M5. `console.log`/`console.warn` left in production code**
Three `console.log`/`console.warn` calls in `MeshBoundingBoxes.tsx:150` and `DeviceModel.tsx:112,148`. These are diagnostic logs that should not ship to production.

- **Impact:** Console noise in production; potential information leakage about internal mesh names/sizes.
- **Fix:** Remove or guard behind `import.meta.env.DEV`.

**M6. ThreeJsCanvasDemo has empty dependency array on main useEffect**
`src/demos/ThreeJsCanvasDemo/index.tsx` line 321: the massive `useEffect` that creates the entire Three.js scene, renderer, event listeners, and animation loop has `[]` as its dependency array but references `setAutoRotate` and `setActivePreset` from context. ESLint's `react-hooks/exhaustive-deps` rule (once installed) will flag this.

- **Impact:** If context callback identity changes, stale closures could cause subtle bugs. Currently safe because the callbacks are stable (`useCallback` in context), but fragile.
- **Fix:** Add the missing deps or use refs to capture them. This is a known pattern for imperative Three.js code but should be explicitly documented.

**M7. `useAIResponseParser.ts` is not actually a hook**
The file `src/hooks/useAIResponseParser.ts` exports `parseAIResponse`, which is a pure function (no React hooks used). Naming it `use*` implies it follows hooks rules. It is consumed as a pure function in `AssistPanel.tsx` inside a `useMemo`.

- **Impact:** Misleading naming; violates the convention that `use*` files contain React hooks.
- **Fix:** Move to `src/utils/aiResponseParser.ts` or rename the file.

**M8. No `type-check` script in package.json**
The `package.json` has `"typecheck": "tsc --noEmit"` but the skill reference recommends `"type-check": "tsc -b --noEmit"` (with `-b` for project references). The current script doesn't use `-b` and may not respect the project references setup in `tsconfig.json`.

- **Impact:** Type-checking may behave differently than the build step, which uses `tsc -b`.
- **Fix:** Change to `"type-check": "tsc -b --noEmit"`.

---

### Low

**L1. No `env.d.ts` or `vite-env.d.ts` for environment variable types**
The project uses `import.meta.env.BASE_URL` in `deviceConfigs.ts`. The `tsconfig.app.json` references `"types": ["vite/client"]` which provides `BASE_URL`, but there is no custom `env.d.ts` for documenting this or adding future `VITE_*` variables.

- **Impact:** No autocompletion for custom env vars if added later.
- **Fix:** Create `src/env.d.ts` with `/// <reference types="vite/client" />`.

**L2. `SettingsPanel.tsx` is a large multi-concern component (440 lines)**
This file contains: `Toggle`, `NumberInput`, `Vec3Input`, and `SettingsPanel` components plus 10+ style constant objects. It handles display settings, scene settings, model overrides, phone info, camera info, and mesh layer tree rendering.

- **Impact:** Difficult to maintain and test; single file owns too many UI concerns.
- **Fix:** Extract `Toggle`, `NumberInput`, `Vec3Input` into a `components/ui/` directory. Consider splitting the settings sections into sub-components.

**L3. `drawScreen.ts` is a 460-line imperative canvas painting function**
This is inherent to the architecture (pure Three.js demo can't use React), but the single function is long and hard to modify. The function manually paints everything the React dashboard renders.

- **Impact:** Any dashboard UI change requires manually updating two implementations (React components AND canvas painting code).
- **Fix:** Add a comment block at the top cross-referencing the React components it mirrors. Consider extracting sub-functions for each section (header, KPIs, nav, etc.) -- some extraction already exists for icons but not for layout sections.

**L4. `LoadingView` component defined inside `App.tsx`**
The `LoadingView` component at the bottom of `App.tsx` could be extracted to its own file for consistency.

- **Impact:** Minor; the component is small and only used once.
- **Fix:** Move to `src/components/LoadingView.tsx` or leave as-is given its simplicity.

**L5. Tab navigation pattern uses string comparison chains**
`App.tsx` renders demos with `{active === 'threejs' && <ThreeJsCanvasDemo />}` pattern repeated 6 times. This is fine for a small number of tabs but could be a lookup map for cleaner code.

- **Impact:** Adding a new demo requires adding another conditional line. No type safety on tab IDs matching component mapping.
- **Fix:** Create a `Record<string, React.LazyExoticComponent<...>>` mapping or a switch/lookup pattern.

**L6. Inline styles used exclusively (no CSS Modules, no Tailwind)**
Every component uses `style={{...}}` inline styles. This is acceptable for a demo/portfolio project of this size, but results in style objects being recreated on every render and makes responsive design harder.

- **Impact:** Cannot use pseudo-classes, media queries (in JS), or CSS animations without global CSS. Some shared style constants are duplicated across files (MONO font, TEAL color, DIM color appear in multiple files).
- **Fix:** Consider CSS Modules for components with heavy styling. At minimum, centralize shared style tokens in a constants file.

**L7. `DEVICES[0]` used as fallback without null check**
`src/demos/GLBModelDemo/index.tsx:38`: `const config = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];` -- `DEVICES[0]` is safe because the array is a non-empty constant, but `noUncheckedIndexedAccess` would flag this.

---

### Positive Findings

**P1. Clean project structure for its size**
The folder organization (`components/`, `components/dashboard/`, `constants/`, `context/`, `demos/`, `hooks/`, `types/`, `utils/`) is logical, consistent, and matches the "small project" template from the skill reference. Demo-specific code is properly isolated into `demos/` subdirectories with their own files.

**P2. Centralized shared constants**
`src/constants/demoSettings.ts` serves as a true single source of truth for camera, auto-rotate, float, view presets, screen dimensions, and background gradient across all 4 demos. The file header comment explicitly states this contract.

**P3. Context providers are well-structured**
Both `DemoContext` and `SettingsContext` follow best practices: `null` default with a custom hook that throws if used outside the provider, memoized value objects to prevent unnecessary re-renders, and stable `useCallback` references for setter functions.

**P4. React.lazy used correctly for code splitting**
All four demo components are lazy-loaded in `App.tsx` with a shared `Suspense` boundary. This keeps the initial bundle size small since each demo imports heavy Three.js dependencies.

**P5. Accessibility considerations present**
`useReducedMotion` hook respects `prefers-reduced-motion` and is used across all demos. The global CSS includes a `prefers-reduced-motion: reduce` media query. The `SettingsPanel` uses `role="switch"` and `aria-checked` on toggle buttons. Focus-visible styles are defined globally.

**P6. Proper TypeScript strict mode**
`tsconfig.app.json` has `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `isolatedModules`, and `moduleDetection: "force"`. No `any` types found except the two `useRef<any>` cases noted above.

**P7. Clean GPU resource management**
`R3FDemo/PhoneMesh.tsx` properly disposes geometry buffers on unmount. `ThreeJsCanvasDemo/index.tsx` cleans up renderer, textures, environment maps, and event listeners in its useEffect cleanup. This prevents WebGL memory leaks when switching between demos.

**P8. StrictMode enabled**
`src/main.tsx` wraps the app in `<React.StrictMode>`, enabling double-rendering in development to catch side effects.

**P9. Vite config with dynamic GitHub Pages base path**
`vite.config.ts` correctly derives the base path from `GITHUB_REPOSITORY` env var for CI, with a sensible fallback for local dev.

**P10. No hydration concerns**
Confirmed: this is a pure client-side SPA with no SSR/SSG. `ReactDOM.createRoot` is used correctly. No `typeof window` guards needed except in `useReducedMotion` which has a defensive check (harmless).

---

### Summary

The project is a well-organized small React + Three.js portfolio demo with 37 source files. The architecture is sound for its scope -- centralized constants, proper context providers, lazy loading, and GPU cleanup are all done well.

**Top 3 action items by impact:**

1. **Add ESLint** (High) -- The biggest gap. No static analysis means hooks violations, dead code, and subtle bugs go undetected. Install ESLint flat config with react-hooks and react-refresh plugins.

2. **Add error boundaries** (High) -- A single WebGL error crashes the entire app with no recovery. Wrap each lazy-loaded demo in an ErrorBoundary with fallback UI.

3. **Fix dependency direction** (High) -- `components/SettingsPanel.tsx` imports from `demos/`, and `R3FDemo/PhoneMesh.tsx` cross-imports from `ThreeJsCanvasDemo/`. Move shared types and constants to their proper locations (`types/`, `constants/`).

**Project classification:** Small (< 20 components, no routing library, local + context state, 1 dev). The tab-based navigation via `useState` in `App.tsx` is appropriate for this size -- React Router would be over-engineering.
