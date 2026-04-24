## React Code Audit: Component Patterns Mode

**Files analyzed:**

- `src/App.tsx` (87 lines)
- `src/main.tsx` (11 lines)
- `src/types/index.ts` (68 lines)
- `src/context/DemoContext.tsx` (43 lines)
- `src/context/SettingsContext.tsx` (93 lines)
- `src/components/DemoTabs.tsx` (61 lines)
- `src/components/DemoOverlay.tsx` (137 lines)
- `src/components/SettingsPanel.tsx` (442 lines)
- `src/components/ViewPresets.tsx` (111 lines)
- `src/components/MeshLayerTree.tsx` (425 lines)
- `src/components/MeshBoundingBoxes.tsx` (167 lines)
- `src/components/SceneHelpers.tsx` (79 lines)
- `src/components/dashboard/BottomNav.tsx` (151 lines)
- `src/components/dashboard/StandardsTab.tsx` (179 lines)
- `src/components/dashboard/TicketsTab.tsx` (212 lines)
- `src/components/dashboard/HierarchyTab.tsx` (145 lines)
- `src/components/dashboard/MeetingsTab.tsx` (240 lines)
- `src/components/dashboard/AssistPanel.tsx` (470 lines)
- `src/components/dashboard/PhoneChrome.tsx` (150 lines)
- `src/components/dashboard/LiveDashboard.tsx` (88 lines)
- `src/demos/CSS3DDemo/index.tsx` (285 lines)
- `src/demos/R3FDemo/index.tsx` (127 lines)
- `src/demos/R3FDemo/PhoneMesh.tsx` (243 lines)
- `src/demos/ThreeJsCanvasDemo/index.tsx` (385 lines)
- `src/demos/ThreeJsCanvasDemo/buildPhone.ts` (193 lines)
- `src/demos/ThreeJsCanvasDemo/drawScreen.ts` (462 lines)
- `src/demos/ThreeJsCanvasDemo/phoneConstants.ts` (11 lines)
- `src/demos/GLBModelDemo/index.tsx` (199 lines)
- `src/demos/GLBModelDemo/DeviceModel.tsx` (306 lines)
- `src/demos/GLBModelDemo/deviceConfigs.ts` (114 lines)
- `src/hooks/useReducedMotion.ts` (25 lines)
- `src/hooks/useAIResponseParser.ts` (71 lines)
- `src/constants/demoSettings.ts` (85 lines)
- `src/constants/themes.ts` (35 lines)
- `src/constants/quickChips.ts` (19 lines)
- `src/constants/tickets.ts` (99 lines)
- `src/constants/hierarchy.ts` (45 lines)
- `src/constants/ceremonies.ts` (149 lines)
- `src/utils/roundedRect.ts` (19 lines)

**Date:** 2026-04-24

---

### Critical

**(C-1) SettingsContext has 9 independent useState calls -- should use useReducer**
`src/context/SettingsContext.tsx` lines 37-46

9 interacting `useState` calls for closely related display settings (`showAxes`, `showGrid`, `showParticles`, `showScreen`, `settingsOpen`, `screenWidth`, `screenHeight`, `cornerRadius`, `distanceFactor`). The `resetDisplay` callback already manually coordinates 4 of them in a single action. Per the state management skill: "Use `useReducer` when: multiple state fields change in response to a single event, or state transitions follow business rules." This is a textbook case for `useReducer` with a discriminated union action type (`TOGGLE_AXES`, `SET_SCREEN_WIDTH`, `RESET_DISPLAY`, etc.). The current approach also forces `useMemo` to track 10 dependencies and exposes raw setters that consumers could call inconsistently.

**(C-2) Index keys on static-looking but semantically meaningful lists**
Multiple files use array index as keys:
- `src/components/dashboard/StandardsTab.tsx` line 31: `key={i}` on KPIS (static, but each has a unique `label`)
- `src/components/dashboard/StandardsTab.tsx` line 88: `key={i}` on TICKET_TYPES (each has unique `type`)
- `src/components/dashboard/StandardsTab.tsx` line 157: `key={i}` on CAPACITY_FACTS (each has unique `label`)
- `src/components/dashboard/TicketsTab.tsx` line 39: `key={i}` on TICKET_TYPES
- `src/components/dashboard/TicketsTab.tsx` line 145: `key={j}` on `requiredFields` (strings)
- `src/components/dashboard/MeetingsTab.tsx` line 20: `key={i}` on CEREMONIES
- `src/components/dashboard/MeetingsTab.tsx` line 139: `key={j}` on attendees
- `src/components/dashboard/MeetingsTab.tsx` line 170: `key={j}` on sections
- `src/components/dashboard/MeetingsTab.tsx` line 214: `key={j}` on antiPatterns
- `src/components/dashboard/HierarchyTab.tsx` line 47: `key={i}` on HIERARCHY
- `src/components/dashboard/PhoneChrome.tsx` line 26: `key={i}` on signal bars

While these are static lists that never reorder (so no functional bug), the skill explicitly states: "ALWAYS prefer database IDs or pre-generated stable IDs." Every one of these arrays has a natural string key (`label`, `type`, `name`, `level`, or the string itself). Using index keys is a code smell and makes future refactoring dangerous if items are conditionally filtered.

**(C-3) Hooks called inside a loop (rules of hooks violation)**
`src/demos/GLBModelDemo/index.tsx` lines 94-96:
```tsx
for (const d of DEVICES) {
  useGLTF.preload(d.glbPath);
}
```
While `useGLTF.preload` is technically a static method (not a hook), calling it inside a loop at the top level of a component body is a confusing pattern that looks like a hooks violation. If `DEVICES` ever became dynamic, this would be a real violation. Should be moved outside the component or into a module-level side effect.

---

### High

**(H-1) drawScreen.ts exceeds 300 lines (462 lines) -- single responsibility concern**
`src/demos/ThreeJsCanvasDemo/drawScreen.ts` is 462 lines. While it is a pure utility function (not a component), it handles icon drawing, layout, text rendering, KPI cards, navigation bar, status bar, and golden rule card all in one monolithic function. The icon drawing functions alone (6 of them, ~165 lines) could be extracted to a separate `drawIcons.ts` module.

**(H-2) AssistPanel.tsx exceeds 300 lines (470 lines) -- needs decomposition**
`src/components/dashboard/AssistPanel.tsx` at 470 lines is the largest component file. It combines:
- Chat message state management (messages, inputText, isThinking)
- Mock API response logic (MOCK_RESPONSES constant + sendMessage)
- AI response parsing/memoization
- Empty state UI
- Message list rendering with rich/plain branching
- Thinking indicator
- Quick chips bar
- Input bar

Should be split: extract `ChatMessageList`, `ChatInput`, and `EmptyState` sub-components. The `sendMessage` logic and `MOCK_RESPONSES` could move to a custom hook like `useMockChat`.

**(H-3) SettingsPanel.tsx exceeds 300 lines (442 lines)**
`src/components/SettingsPanel.tsx` at 442 lines. Contains the gear button, display section, scene section, model section with Vec3Inputs, phone info section, camera section, and 3 internal sub-components (Toggle, NumberInput, Vec3Input). The sub-components are well-factored but the main SettingsPanel render function is still doing too much. Consider extracting `DisplaySection`, `SceneSection`, `ModelSection` as separate files or at minimum separate named components.

**(H-4) MeshLayerTree.tsx exceeds 300 lines (425 lines)**
`src/components/MeshLayerTree.tsx` at 425 lines. Contains exported types, 8 helper functions, TreeNode component, MeshLayerTree component, and 2 exported utility functions. The helper functions and types could be extracted to a `meshLayerUtils.ts` file to bring the component file under 300 lines.

**(H-5) ThreeJsCanvasDemo exceeds 300 lines (385 lines) -- imperative Three.js lifecycle**
`src/demos/ThreeJsCanvasDemo/index.tsx` is 385 lines, with a single massive `useEffect` (lines 78-321, ~243 lines) that sets up the entire Three.js scene imperatively. This is inherent to the pure-Three.js approach (no R3F), but the scene setup (lights, helpers, particles) could be extracted into builder functions similar to `buildPhone`.

**(H-6) controlsRef typed as `any`**
`src/demos/R3FDemo/index.tsx` line 26: `const controlsRef = useRef<any>(null);`
`src/demos/GLBModelDemo/index.tsx` line 37: `const controlsRef = useRef<any>(null);`

Both should be typed properly. drei exports `OrbitControls` types. This should be:
```tsx
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
const controlsRef = useRef<OrbitControlsImpl>(null);
```

**(H-7) chatEndRef and inputRef use union type with null unnecessarily**
`src/components/dashboard/AssistPanel.tsx` line 50:
```tsx
const chatEndRef = useRef<HTMLDivElement | null>(null);
const inputRef = useRef<HTMLInputElement | null>(null);
```
`useRef<HTMLDivElement>(null)` already produces `RefObject<HTMLDivElement | null>`. The explicit union is redundant though not harmful. More importantly, `inputRef` is declared but never used for focusing or any imperative action -- it's dead code.

---

### Medium

**(M-1) SettingsContext exposes raw setters -- breaks encapsulation**
`src/context/SettingsContext.tsx` exposes 8 raw `setXxx` functions directly in the context type (e.g., `setShowAxes`, `setScreenWidth`). This makes the API surface large and provides no guardrails. If these were managed by a reducer, the context would expose a single `dispatch` function (or semantic action functions), reducing the surface area and making state transitions more predictable.

**(M-2) ChatMessage id uses Date.now() -- collision risk**
`src/components/dashboard/AssistPanel.tsx` lines 78, 84:
```tsx
{ role: 'user', content: text.trim(), id: Date.now() }
{ role: 'assistant', content: reply, id: Date.now() + 1 }
```
`Date.now()` has millisecond precision. The `+1` hack prevents collision between the user and assistant messages, but calling `sendMessage` twice in quick succession could produce duplicate IDs. Use a simple counter via `useRef` or `crypto.randomUUID()`.

**(M-3) Props interface fields not marked `readonly`**
Per the component design skill: "ALWAYS mark props as `readonly` -- props must never be mutated." None of the prop interfaces across the codebase use `readonly`. Examples:
- `DemoTabsProps` in `DemoTabs.tsx`
- `DemoOverlayProps` in `DemoOverlay.tsx`
- `SettingsPanelProps` in `SettingsPanel.tsx`
- `BottomNavProps` in `BottomNav.tsx`
- `AssistPanelProps` in `AssistPanel.tsx`
- `DeviceModelProps` in `DeviceModel.tsx`
- All other component props interfaces

This is a project-wide pattern. Adding `readonly` is low-effort and prevents accidental mutation.

**(M-4) Derived state stored in useState in DeviceModel**
`src/demos/GLBModelDemo/DeviceModel.tsx` lines 54-63:
```tsx
const [screenCenter, setScreenCenter] = useState<THREE.Vector3 | null>(null);
const [autoScreenDims, setAutoScreenDims] = useState<...>(null);
const [measured, setMeasured] = useState(false);
const [autoRotation, setAutoRotation] = useState<[number, number, number]>([0, 0, 0]);
```
These 4 state variables are computed from the GLB scene geometry and set once during a measurement `useEffect`. They are essentially derived values that depend on `scene`, `config`, and `actualScale`. While there is justification here (the measurement is an expensive side effect that reads DOM/GPU state), the `measured` boolean is redundant -- it could be derived as `screenCenter !== null && autoScreenDims !== null`.

**(M-5) LiveDashboard has 4 useState calls for related UI state**
`src/components/dashboard/LiveDashboard.tsx` lines 23-26:
```tsx
const [activeTab, setActiveTab] = useState<TabId>('standards');
const [assistOpen, setAssistOpen] = useState(false);
const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
const [expandedCeremony, setExpandedCeremony] = useState<number | null>(null);
```
4 related UI state values. The expanded states are tab-specific and could be colocated with their respective tabs rather than lifted to LiveDashboard. `expandedTicket` and `expandedCeremony` are only passed to TicketsTab and MeetingsTab respectively -- they could live inside those components (state colocation at the lowest common ancestor).

**(M-6) console.log left in production code**
`src/components/MeshBoundingBoxes.tsx` line 151: `console.log('[BBox] ...')` inside useMemo
`src/demos/GLBModelDemo/DeviceModel.tsx` line 148: `console.log('[Screen ...]')` inside useEffect
`src/demos/GLBModelDemo/DeviceModel.tsx` line 113: `console.warn('[GLB] Screen node ...')` (acceptable for error case)

The first two are debug logging that will fire on every state change. Should be removed or gated behind a debug flag.

**(M-7) Theme derived from context but also passed as prop**
`LiveDashboard` computes `const theme = THEMES[themeName]` (line 28) and then passes `theme` and `themeName` as separate props to every child tab component. This is a form of state duplication -- `theme` is derived from `themeName`. Since `themeName` comes from DemoContext, the child components could derive `theme` themselves, or a `useTheme()` hook could provide both. Currently, every tab receives the same `theme` + `themeName` pair, which is redundant prop threading.

**(M-8) Missing explicit return types on component functions**
Per the component design skill pattern: `function Comp(props: Props): React.ReactElement`. Most components in the codebase omit the return type annotation:
- `DemoTabs`, `DemoOverlay`, `SettingsPanel`, `ViewPresets`, `MeshLayerTree`, etc.

TypeScript can infer the return type, but explicit annotation catches errors earlier (e.g., accidentally returning `undefined` instead of `null`).

---

### Low

**(L-1) Toggle component uses onClick with undefined instead of relying on disabled attribute**
`src/components/SettingsPanel.tsx` line 105:
```tsx
onClick={disabled ? undefined : onToggle}
```
The button already has `disabled={disabled}`, which natively prevents click events. The conditional `onClick` is redundant.

**(L-2) `circleBtn` returns a plain object, not React.CSSProperties**
`src/components/dashboard/AssistPanel.tsx` lines 457-469: The `circleBtn` function uses `as const` assertion instead of typing the return as `React.CSSProperties`. While it works due to structural typing, explicit typing would provide better IDE support and catch invalid CSS properties.

**(L-3) DemoContext and SettingsContext use `<Context.Provider>` syntax**
Both context files use `<DemoContext.Provider value={value}>` (line 42 of DemoContext, line 91 of SettingsContext). This is the older syntax. React 19 allows `<Context value={value}>` directly. Since this project uses React 18, the Provider syntax is correct and appropriate. No action needed, but worth noting for future React 19 migration.

**(L-4) ViewPresets uses p.label as key -- stable but could collide**
`src/components/ViewPresets.tsx` line 61: `key={p.label}`. View preset labels ("Front", "Angle", "Back") are unique and stable, so this works. However, using an index into a `readonly` tuple from `as const` data would be slightly more robust if labels ever contained duplicates.

**(L-5) Inline style objects created every render**
Multiple components create inline style objects on every render (e.g., every badge in DemoOverlay, every row in SettingsPanel). For a demo/portfolio project this is fine, but in a production app with frequent re-renders, these could be extracted to constants or memoized.

**(L-6) DemoOverlay badges type uses inline object**
`src/components/DemoOverlay.tsx` line 5: `badges: { label: string; color: string }[]` -- could be extracted to a named interface `Badge` for reusability and self-documentation.

---

### Positive Findings

**(P-1) Context architecture is well-designed**
Both `DemoContext` and `SettingsContext` follow best practices:
- Created with `createContext<Type | null>(null)` (null default forces provider requirement)
- Custom hooks (`useDemoContext`, `useSettingsContext`) with null-check error messages
- `useMemo` wrapping the context value to prevent unnecessary consumer re-renders
- `useCallback` for stable function references (e.g., `toggleTheme`, `resetDisplay`)
- Clear separation of concerns between demo state and settings state

**(P-2) Code splitting with React.lazy is correctly implemented**
`src/App.tsx` lines 7-10: All 4 demos are lazy-loaded at module scope (not inside the component). Wrapped in `<Suspense fallback={<LoadingView />}>`. This follows the skill guidance exactly.

**(P-3) Key props are correct on most dynamic lists**
- `DemoTabs.tsx`: `key={tab.id}` (stable unique ID)
- `MeshLayerTree.tsx`: `key={child.uuid}` (THREE.js UUID, globally unique)
- `MeshBoundingBoxes.tsx`: `key={data.uuid}`
- `BottomNav.tsx`: `key={tab.id}`
- `GLBModelDemo/index.tsx`: `key={config.id}` on DeviceModel, `key={d.id}` on SidebarButtons
- `AssistPanel.tsx`: `key={chip.label}` on quick chips, `key={msg.id}` on messages
- `App.tsx`: `key="iphone"`, `key="macbook"`, `key="other"` on GLBModelDemo instances (used for remounting)

**(P-4) Composition over configuration pattern used effectively**
- `SettingsPanel` accepts `children?: React.ReactNode` for extensible content (MeshLayerTree)
- `ViewPresets` accepts `children?: React.ReactNode` for additional sidebar buttons
- No component has an unwieldy boolean prop interface (largest is `SettingsPanelProps` with 7 optional props, all meaningful)

**(P-5) Custom hooks are well-extracted**
- `useReducedMotion` -- clean, SSR-safe, with live media query listener and proper cleanup
- `useAIResponseParser` (actually `parseAIResponse`) -- pure function with discriminated union return type (`AISegment = TextSegment | ListItemSegment`)

**(P-6) TypeScript types are centralized and well-structured**
- `src/types/index.ts` defines all domain types (`Theme`, `ThemeName`, `TicketType`, `Ceremony`, `HierarchyLevel`, `ChatMessage`, `IconMap`)
- `DeviceConfig` and `ModelOverrides` are co-located with device configs
- `ModelInfo` is exported from `DeviceModel.tsx` and consumed by parent
- Discriminated unions used for `AISegment` types

**(P-7) Constants are properly extracted**
All magic numbers and configuration values are centralized in `src/constants/`:
- `demoSettings.ts`: Camera, auto-rotate, float, view presets, screen dimensions
- `themes.ts`: Full theme objects
- `quickChips.ts`, `tickets.ts`, `hierarchy.ts`, `ceremonies.ts`: Domain data

**(P-8) State colocation is mostly correct**
- `active` tab state (which demo is showing) lives in `App.tsx` (the only place that needs it)
- `isDragging`, `rotation` in CSS3DDemo are local (only that demo needs them)
- `activeTab`, `assistOpen` in LiveDashboard are at the right level (shared by BottomNav and content area)
- GLBModelDemo correctly lifts `meshLayers` state because it's shared between `DeviceModel`, `MeshLayerTree`, and `MeshBoundingBoxes`

**(P-9) No derived state stored in useState (mostly)**
`const theme = THEMES[themeName]` in LiveDashboard and CSS3DDemo is computed inline, not stored in state. `const config = DEVICES.find(...)` in GLBModelDemo is also computed inline. This follows the skill's rule: "NEVER store derived values in state."

**(P-10) Proper cleanup in effects**
- `useReducedMotion`: removes event listener on unmount
- `CSS3DDemo`: removes resize listener and pointer event listeners
- `ThreeJsCanvasDemo`: comprehensive cleanup (cancelAnimationFrame, remove all listeners, dispose textures/renderer/envMap)
- `PhoneMesh`: disposes geometries on unmount
- `AssistPanel`: removes keydown listener for Escape

---

### Summary

| Category | Count |
|----------|-------|
| Critical | 3 |
| High | 7 |
| Medium | 8 |
| Low | 6 |
| Positive | 10 |

**Top priorities:**

1. **SettingsContext refactor to useReducer** (C-1, M-1) -- 9 useState calls managing related display state is the single biggest state management smell. A reducer with typed actions would consolidate `resetDisplay`, prevent inconsistent intermediate states, and simplify the context type from 20 fields to `state + dispatch`.

2. **Replace index keys with stable unique keys** (C-2) -- Easy win across 5 dashboard files. Use `kpi.label`, `ticket.type`, `h.level`, `cer.name`, etc.

3. **Break up 3 oversized component files** (H-2, H-3, H-4) -- AssistPanel (470), SettingsPanel (442), and MeshLayerTree (425) each exceed 300 lines. Extract sub-components and utility functions.

4. **Type the OrbitControls refs** (H-6) -- Replace `useRef<any>` with proper drei/three-stdlib types.

5. **Add readonly to all props interfaces** (M-3) -- Mechanical change across all component files; prevents accidental prop mutation.

**Overall assessment:** The codebase demonstrates strong React fundamentals. Context architecture, code splitting, effect cleanup, and state colocation are all done correctly. The main issues are the oversized SettingsContext (should be a reducer), index keys on lists, a few oversized files, and missing TypeScript strictness (`readonly` props, typed refs, explicit return types). These are all straightforward to fix.
