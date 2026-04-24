## React Code Audit: Queries Mode

**Files analyzed:**
- `src/constants/ceremonies.ts`
- `src/constants/tickets.ts`
- `src/constants/hierarchy.ts`
- `src/constants/themes.ts`
- `src/constants/quickChips.ts`
- `src/constants/demoSettings.ts`
- `src/hooks/useAIResponseParser.ts`
- `src/hooks/useReducedMotion.ts`
- `src/types/index.ts`
- `src/context/DemoContext.tsx`
- `src/context/SettingsContext.tsx`
- `src/components/dashboard/LiveDashboard.tsx`
- `src/components/dashboard/AssistPanel.tsx`
- `src/components/dashboard/StandardsTab.tsx`
- `src/components/dashboard/TicketsTab.tsx`
- `src/components/dashboard/MeetingsTab.tsx`
- `src/components/dashboard/HierarchyTab.tsx`
- `src/components/dashboard/BottomNav.tsx`
- `src/components/dashboard/PhoneChrome.tsx`
- `src/demos/GLBModelDemo/deviceConfigs.ts`
- `src/demos/ThreeJsCanvasDemo/phoneConstants.ts`
- `src/App.tsx`

**Date:** 2026-04-24

### Critical

No critical issues found.

### High

No high-severity issues found.

### Medium

**M1. Duplicate color maps between constants and parser (data consistency risk)**
- `src/hooks/useAIResponseParser.ts` lines 16-29 duplicate ticket and ceremony color values that already exist in `src/constants/tickets.ts` and `src/constants/ceremonies.ts`. If colors change in the constants files, the parser's hardcoded maps will drift silently, producing mismatched colors in the AI assistant responses vs. the rest of the dashboard.
- **Recommendation:** Import `TICKET_TYPES` and `CEREMONIES` from constants and derive the color maps:
  ```ts
  const TICKET_COLORS = Object.fromEntries(TICKET_TYPES.map(t => [t.type, t.color]));
  const CEREMONY_COLORS = Object.fromEntries(CEREMONIES.map(c => [c.name, c.color]));
  ```

**M2. Chat message IDs use `Date.now()` (non-unique under rapid input)**
- `src/components/dashboard/AssistPanel.tsx` lines 78 and 84 generate message IDs with `Date.now()` and `Date.now() + 1`. These IDs serve as React `key` props (line 211) and as lookup keys in the `parsedByMessageId` memoized map (line 69). If a user triggers two messages within the same millisecond (unlikely but possible on fast hardware or automated tests), IDs collide and overwrite cached parse results.
- **Recommendation:** Use an incrementing counter (`useRef(0)`) or `crypto.randomUUID()` for stable, unique IDs.

### Low

**L1. Array-index keys used for static constant lists**
- `StandardsTab.tsx` (lines 33, 157), `TicketsTab.tsx` (line 36), `MeetingsTab.tsx` (line 18), and `HierarchyTab.tsx` (line 45) all use `key={i}` (array index) when mapping over `KPIS`, `CAPACITY_FACTS`, `TICKET_TYPES`, `CEREMONIES`, and `HIERARCHY`.
- Since these arrays are hardcoded constants that never reorder, filter, or mutate, index keys are functionally safe here. However, using a stable identifier (e.g., `key={ticket.type}`, `key={cer.name}`, `key={h.level}`) is a minor improvement for readability and would be resilient if the data source ever becomes dynamic.

**L2. `sendMessage` is async but never awaits anything that could fail**
- `src/components/dashboard/AssistPanel.tsx` line 76: `sendMessage` is marked `async` and uses `await` only for a `setTimeout` delay. This is fine now, but if real API calls are ever added, there is no try/catch error handling or error state to display to the user.
- **Recommendation:** No action needed unless this evolves to real API calls. If it does, add a `try/catch` with an error state.

**L3. `MOCK_RESPONSES` keys are raw prompt strings (brittle coupling)**
- `src/components/dashboard/AssistPanel.tsx` lines 16-41: The mock response lookup table keys must exactly match `QUICK_CHIPS[n].prompt` strings from `src/constants/quickChips.ts`. If a prompt string changes in one file, the lookup silently misses and returns the `FALLBACK`.
- **Recommendation:** Import `QUICK_CHIPS` and key responses by chip label or index rather than duplicated prompt strings.

### Positive Findings

**P1. No data fetching libraries needed or misused**
- The project has no `fetch()`, `axios`, `XMLHttpRequest`, `@tanstack/react-query`, or any other data-fetching mechanism. All data comes from hardcoded constant arrays in `src/constants/`. This is correct for a static demo app deployed to GitHub Pages with no backend.

**P2. Constants are module-level and referentially stable**
- All data arrays (`CEREMONIES`, `TICKET_TYPES`, `HIERARCHY`, `QUICK_CHIPS`, `THEMES`, `DEVICES`, `VIEW_PRESETS`, etc.) are defined at module scope with `as const` where appropriate. They are never recreated on render, which means components consuming them get stable references for free.

**P3. `useAIResponseParser` is a pure synchronous function, not a hook**
- Despite the file name `useAIResponseParser.ts`, the exported `parseAIResponse` is a pure function, not a React hook. It takes a string and returns parsed segments with no side effects. This is the correct design for data transformation that doesn't need React lifecycle integration.

**P4. Parsed AI responses are properly memoized**
- `AssistPanel.tsx` line 68: The `parsedByMessageId` map uses `useMemo` keyed on `[messages]`, avoiding re-parsing on every keystroke in the input field. This is good performance practice.

**P5. Context providers use `useMemo` for value objects**
- Both `DemoContext.tsx` (line 30) and `SettingsContext.tsx` (line 55) wrap their context values in `useMemo` with correct dependency arrays, preventing unnecessary re-renders of all consumers when unrelated parent state changes.

**P6. Theme lookup is O(1) via `Record<ThemeName, Theme>`**
- `src/constants/themes.ts` uses a `Record` keyed by `ThemeName`, so `THEMES[themeName]` is a direct property access rather than an array search. This is efficient and type-safe.

**P7. Code splitting with `React.lazy` for demo modules**
- `src/App.tsx` uses `lazy()` imports for all four demo modules, so only the active demo's code is loaded. This is appropriate for a multi-demo app where users view one demo at a time.

### Summary

This project has **no data fetching layer** and needs none. All data is hardcoded in `src/constants/` files and imported directly at module scope. The TanStack Query and TanStack Table checklist items (query keys, cache invalidation, staleTime, N+1 observers, server-side pagination, column stability, etc.) are all **not applicable** -- there are no queries, mutations, or tabular data grids.

The two medium findings are about **data consistency** (duplicated color maps in the parser) and **ID uniqueness** (Date.now-based message IDs). Both are minor risks in a demo app but would be worth fixing if the codebase grows. The overall data flow architecture is clean: constants are imported at module scope, passed as props through a shallow component tree, and transformed via memoized pure functions where needed.
