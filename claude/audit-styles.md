## React Code Audit: Styles Mode

**Files analyzed:**
- `src/index.css`
- `src/constants/themes.ts`
- `src/constants/demoSettings.ts`
- `src/types/index.ts`
- `src/hooks/useReducedMotion.ts`
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
- `src/components/dashboard/PhoneChrome.tsx`
- `src/components/dashboard/LiveDashboard.tsx`
- `src/components/dashboard/BottomNav.tsx`
- `src/components/dashboard/AssistPanel.tsx`
- `src/components/dashboard/StandardsTab.tsx`
- `src/components/dashboard/TicketsTab.tsx`
- `src/components/dashboard/MeetingsTab.tsx`
- `src/components/dashboard/HierarchyTab.tsx`
- `src/demos/CSS3DDemo/index.tsx`
- `src/demos/R3FDemo/index.tsx`
- `src/demos/R3FDemo/PhoneMesh.tsx`
- `src/demos/ThreeJsCanvasDemo/index.tsx`
- `src/demos/ThreeJsCanvasDemo/drawScreen.ts`
- `src/demos/GLBModelDemo/index.tsx`
- `src/demos/GLBModelDemo/DeviceModel.tsx`

**Date:** 2026-04-24

---

### Critical

**C-1. Interactive `<div>` elements lack keyboard accessibility and semantic roles**

Multiple clickable `<div>` elements are used as interactive controls without `<button>` semantics, `tabIndex`, `role="button"`, or `onKeyDown` handlers. These elements are unreachable by keyboard-only users.

Affected files:
- `BottomNav.tsx` -- `TabButton` is a `<div onClick>` with no `role`, `tabIndex`, or keyboard handler. The center AI button (`<div onClick={onOpenAssist}>`) also lacks semantics.
- `PhoneChrome.tsx` -- Theme toggle (`<div onClick={onToggleTheme}>`) has no `role="button"`, `tabIndex`, or `aria-label`.
- `TicketsTab.tsx` -- Expandable ticket headers use `<div onClick>` without accordion semantics (`role="button"`, `aria-expanded`).
- `MeetingsTab.tsx` -- Same pattern as TicketsTab for ceremony headers.
- `AssistPanel.tsx` -- Quick chips (`<div onClick>`) lack button semantics. The send button (`<div onClick>`) has no `role` or `aria-label`. The close and reset buttons use `role="button"` but lack `tabIndex={0}` and `onKeyDown`.
- `MeshLayerTree.tsx` -- Section header collapse toggle and caret span are clickable without keyboard support.

Fix: Replace interactive `<div>` elements with `<button>` elements, or add `role="button"`, `tabIndex={0}`, and `onKeyDown` (Enter/Space) handlers. Add `aria-label` where text content is absent and `aria-expanded` on expandable triggers.

**C-2. No hover or focus styles on inline-styled interactive elements**

Inline styles cannot express `:hover`, `:focus`, or `:active` pseudo-classes. Every interactive element in the project (buttons, tabs, chips, toggles, expandable cards) relies solely on inline styles. This means:
- No hover feedback on any dashboard button, tab, chip, or card
- No visible focus indicator beyond the global `*:focus-visible` rule in `index.css` (which uses `outline` -- this works for native `<button>` elements but not for the many `<div onClick>` elements that are not focusable)
- No active/pressed state on any control

This violates Nielsen's heuristic #1 (Visibility of System Status) and WCAG 2.1 SC 2.4.7 (Focus Visible).

Affected files: `DemoTabs.tsx`, `ViewPresets.tsx`, `BottomNav.tsx`, `AssistPanel.tsx`, `TicketsTab.tsx`, `MeetingsTab.tsx`, `PhoneChrome.tsx`, `SettingsPanel.tsx`, `MeshLayerTree.tsx`.

Fix: Extract interactive element styles to CSS classes (in `index.css` or CSS Modules) so `:hover`, `:focus-visible`, and `:active` states can be defined. Alternatively, add `onMouseEnter`/`onMouseLeave` state management -- but CSS is strongly preferred.

---

### High

**H-1. Hardcoded color values scattered across 17+ files instead of centralized tokens**

The project has a theme system (`constants/themes.ts`) for dashboard components, but the overlay/settings/demo-chrome layer uses raw hex values duplicated across files:
- `#319795` (teal accent) -- 30+ occurrences across 12 files
- `#3182CE` (blue) -- 15+ occurrences across 10 files
- `#718096` (muted gray) -- 20+ occurrences across 10 files
- `#CBD5E0` (body text) -- 10+ occurrences across 6 files
- `#0B1426`, `#0d1b2a` (background shades) -- duplicated in `themes.ts`, `demoSettings.ts`, `drawScreen.ts`, `CSS3DDemo/index.tsx`, `AssistPanel.tsx`
- Gradient `linear-gradient(135deg, #3182CE, #319795)` -- duplicated in 5 files

The `Theme` type in `types/index.ts` covers dashboard internals but none of the outer shell UI tokens (demo tabs, view presets, settings panel, overlays). These all hardcode colors directly.

Fix: Centralize all shared color values (accent, muted, text, background) into a single constants file or extend the existing theme system. CSS custom properties in `:root` would be ideal for the non-dashboard shell, allowing potential future theming.

**H-2. No CSS custom properties used anywhere**

The `index.css` file defines no CSS custom properties. All color, spacing, shadow, and border values are inline hardcoded hex/rgba strings. This makes global adjustments (rebranding, accessibility high-contrast mode, or extending the theme system) a manual multi-file search-and-replace exercise.

Fix: Define design tokens as CSS custom properties in `:root` (colors, spacing scale, border radii, shadows, font families) and reference them from both inline styles (`var(--token)` via string template) and CSS rules.

**H-3. Font size values are inconsistent and extremely small**

86 `fontSize` declarations across 14 files use 40+ distinct values. Many dashboard font sizes are dangerously small:
- `0.52rem` (8.3px) -- used for tab labels, badges, section labels (BottomNav, AssistPanel, MeetingsTab)
- `0.55rem` (8.8px) -- used for data labels, attendee chips
- `0.58rem` (9.3px) -- used for anti-pattern text, row labels
- `0.6rem` (9.6px) -- used for section headers, badge text, title convention labels
- `0.62rem` (9.9px) -- used for body text in cards and meeting details
- `0.65rem` (10.4px) -- used for AI response text, list item descriptions

While this dashboard renders inside a 393x852 "phone chrome" that is scaled down in 3D space, the base font sizes are below the 12px minimum recommended for readability. If the dashboard is ever viewed at 1:1 scale or by users with vision impairments, these sizes would be illegible.

There is no type scale system -- sizes appear to be chosen ad-hoc. A defined scale (e.g., 0.625rem / 0.6875rem / 0.75rem / 0.875rem / 1rem) would bring consistency.

**H-4. Spacing values have no consistent scale**

Padding, margin, and gap values across all components use arbitrary pixel values: 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 32, 40, 100. There is no 4px/8px spacing system. For example:
- `padding: '8px 14px'` (not on a 4px grid)
- `gap: 6` (not on a 4px grid)
- `marginBottom: 14` (not on a 4px grid)
- `padding: '12px 14px'` (mixed)

This creates subtle visual inconsistencies in alignment and rhythm.

Fix: Adopt a spacing scale (e.g., multiples of 4: 4, 8, 12, 16, 20, 24, 32, 40, 48) and define them as constants.

---

### Medium

**M-1. Dark mode theming is split into two disconnected systems**

Dashboard components use the `Theme` object from `constants/themes.ts` (dark/light), passed as props. But the outer shell (DemoTabs, ViewPresets, SettingsPanel, DemoOverlay, demo containers) is hardcoded to dark-only colors with no light variant. This means:
- Toggling the theme only affects the dashboard inside the phone chrome
- The settings panel, view presets, demo tabs, and overlay text are always dark
- There is no `prefers-color-scheme` integration for the outer shell
- The `index.css` body styles are hardcoded dark (`background: #0a0f1a; color: #cbd5e0`)

This is intentional for the current 3D showcase use case (dark shell, themed dashboard), but it means the theming architecture is incomplete -- the outer shell cannot adapt.

**M-2. All static styles are inline, violating the inline-styles-for-dynamic-values-only principle**

The project uses inline `style={{}}` for approximately 95% of all styling, including completely static styles that never change based on props or state. Examples:
- `DemoOverlay.tsx` -- All text sizing, colors, spacing, and layout are static inline styles
- `SettingsPanel.tsx` -- The `sectionHeader`, `rowStyle`, `labelStyle`, `monoValue` objects are defined as `React.CSSProperties` constants, which is better than raw inline, but still cannot express pseudo-classes
- `StandardsTab.tsx` / `TicketsTab.tsx` / `MeetingsTab.tsx` / `HierarchyTab.tsx` -- Dense inline style objects on every element

Per the react-ui-styling skill: "NEVER use inline styles for static values -- move them to CSS Modules or Tailwind classes instead." The current approach increases bundle size (styles are re-created on every render) and prevents any pseudo-class or media query usage.

Fix: Extract static styles to CSS classes. Given the project explicitly avoids CSS Modules and Tailwind, `index.css` with well-scoped class names or a component-level `.css` file is the appropriate target.

**M-3. `drawScreen.ts` duplicates the entire dashboard visual design in Canvas 2D**

The `drawScreen.ts` file (462 lines) manually repaints the dashboard UI using Canvas 2D context calls, duplicating every color, font size, spacing value, and layout decision from the React components. When the dashboard design changes, this file must be manually kept in sync. It uses different font families (`-apple-system, sans-serif` vs `'DM Sans'` in the React components) and slightly different spacing.

This is a known trade-off (the pure Three.js demo can't mount React), but it creates a maintenance burden and visual inconsistency between the static texture and live dashboard.

**M-4. `fontFamily` declarations are redundant and inconsistent**

The body font is set globally in `index.css` as `'DM Sans', system-ui, sans-serif`, but many components re-declare it inline:
- `DemoTabs.tsx`: `fontFamily: "'DM Sans', system-ui, sans-serif"`
- `SettingsPanel.tsx`: `fontFamily: "'DM Sans', sans-serif"` (missing `system-ui`)
- `AssistPanel.tsx`: `fontFamily: "'DM Sans', sans-serif"` (missing `system-ui`)
- `ViewPresets.tsx`: `fontFamily: "'DM Sans', sans-serif"` (missing `system-ui`)
- `LiveDashboard.tsx`: `fontFamily: "'DM Sans', sans-serif"` (missing `system-ui`)

The monospace font (`'JetBrains Mono', monospace`) is also redeclared as a raw string in 4 files. The fallback stacks are inconsistent (`system-ui, sans-serif` vs `sans-serif`).

Fix: Remove redundant `fontFamily` from inline styles (they inherit from the body). Define the mono font family as a constant (some files already do: `const MONO = "'JetBrains Mono', monospace"`).

**M-5. `z-index` values are used without a defined scale**

z-index values across the project: 1, 10, 20, 40, 50, 55, 60. There is no documented layering system or constants file for z-index values. This makes it hard to reason about stacking order:
- `DynamicIsland`: 60
- `StatusBar`: 55
- `HomeIndicator`: 55
- `AssistPanel`: 50
- `DemoTabs`: 50
- `BottomNav`: 40
- `SettingsPanel` gear button and panel: 20
- `DemoOverlay` / `ViewPresets`: 10
- `HierarchyTab` timeline dot: 1

Fix: Define a z-index scale as named constants (e.g., `Z_INDEX = { overlay: 10, controls: 20, nav: 40, modal: 50, chrome: 55, island: 60 }`).

**M-6. No responsive design handling for the outer shell**

The outer shell UI (DemoTabs, ViewPresets, DemoOverlay, SettingsPanel) uses absolute positioning with fixed pixel values. On narrow viewports:
- `DemoTabs` may overflow horizontally (6 tabs in a pill row at `top: 24, left: 50%`)
- `ViewPresets` sidebar at `right: 24` may overlap the phone model
- `SettingsPanel` at `right: 24, width: 300` may extend off-screen on phones
- `DemoOverlay` text at `left: 32` has no max-width constraint

There are no `@media` queries in `index.css` (beyond `prefers-reduced-motion`) and no responsive breakpoints in any component. The CSS3DDemo has a viewport height listener for scaling, but the UI chrome itself does not adapt.

---

### Low

**L-1. Transition/animation timing is inconsistent**

Various `transition` durations: `0.15s`, `0.2s`, `0.3s`, `0.6s`. Various animation durations: `0.3s`, `0.6s`, `0.8s`, `1.2s`, `1.5s`, `2.5s`. While some variation is expected (micro-interactions vs page transitions), there is no shared timing constant. The skill guidance recommends 150-300ms for micro-interactions.

**L-2. Border radius values are inconsistent**

Across the project: 1, 1.5, 2, 3, 4, 6, 7, 8, 10, 12, 14, 16, 20, 24, 46, 50, 56, 999. While some variation is inherent to the phone chrome design (matching physical device bezels), the dashboard cards and chips use 6, 8, 12, 14, 16, 20, and 24 with no clear system. Defining a `borderRadius` scale constant would help.

**L-3. Box shadow values are duplicated**

The gradient shadow `0 4px 16px rgba(49,151,149,0.35)` appears in `ViewPresets.tsx`, `DemoTabs.tsx`. The AI glow shadow `0 4px 20px rgba(49,130,206,0.4)` appears in `BottomNav.tsx` and the `@keyframes glowPulse` in `index.css`. These could be centralized as shadow tokens.

**L-4. The `opacity: 0.7` badge text in `DemoOverlay.tsx` may have contrast issues**

Badge text at `opacity: 0.7` with colors like `#718096` on a dark background may not meet WCAG 4.5:1 contrast ratio. The effective color after opacity reduction would be even lower contrast.

**L-5. SettingsPanel number inputs lack `aria-label`**

The `NumberInput` component renders `<input type="number">` with no label or `aria-label`. Screen readers cannot identify what each input controls. The `Toggle` component correctly uses `aria-label` and `aria-checked`.

---

### Positive Findings

**P-1. `prefers-reduced-motion` is comprehensively handled**

The project excels at respecting reduced motion preferences:
- `index.css` includes a global `@media (prefers-reduced-motion: reduce)` rule that disables all CSS animations and transitions
- A dedicated `useReducedMotion()` hook listens to the media query and updates live
- The hook is used in `PhoneMesh.tsx` and `DeviceModel.tsx` to disable Float animation parameters
- `ThreeJsCanvasDemo/index.tsx` checks the ref in its animation loop to skip particle drift and bob

This is thorough and rare to see done this well.

**P-2. Theme system is well-typed and consistent within its scope**

The `Theme` interface in `types/index.ts` defines 13 semantic tokens. The `THEMES` constant provides complete dark/light variants. Dashboard components consistently receive the theme via props and use its tokens -- there are no raw hex colors inside dashboard components for values that should be themed. The separation between `themeName` (for conditional logic) and `theme` (for style values) is clean.

**P-3. Shared constants in `demoSettings.ts`**

Camera, auto-rotate, float, view preset, and screen dimension values are centralized in a single constants file and imported by all four demo implementations. This prevents drift between demos and is well-documented with comments explaining the math.

**P-4. Toggle component has proper ARIA semantics**

The `Toggle` in `SettingsPanel.tsx` uses `role="switch"`, `aria-checked`, `aria-label`, and `disabled` attribute. This is the gold standard for custom toggle implementations.

**P-5. Global CSS reset is minimal and correct**

The `index.css` reset (`* { box-sizing: border-box; margin: 0; padding: 0; }`) is the standard modern reset. The `*:focus-visible` rule provides a visible focus indicator with a teal outline that matches the project's accent color. The scrollbar hiding is intentional for the 3D showcase context.

**P-6. Style objects are extracted to file-level constants where inline styles are used**

`SettingsPanel.tsx`, `ViewPresets.tsx`, and `MeshLayerTree.tsx` define style objects as `const` outside the component body (e.g., `const sectionHeader: React.CSSProperties`). This avoids re-creating style objects on every render and provides some organization, even though it cannot express pseudo-classes.

**P-7. Lucide icons used consistently**

All icons come from `lucide-react` with consistent sizing and stroke widths. No emoji icons are used as structural UI elements. Icon colors are always derived from the theme or from data-driven color values.

---

### Summary

| Severity | Count | Category |
|----------|-------|----------|
| Critical | 2 | Accessibility: non-focusable interactive elements, no hover/focus/active states |
| High | 4 | Design tokens, typography scale, spacing system, color centralization |
| Medium | 6 | Theming architecture, inline style overuse, canvas duplication, font families, z-index, responsive shell |
| Low | 5 | Timing, border radius, shadows, contrast, input labels |
| Positive | 7 | Reduced motion, theme typing, shared constants, ARIA toggle, CSS reset, style extraction, icon consistency |

**Overall assessment:** The project has a strong foundation -- well-typed themes, excellent reduced motion support, and good constant centralization for 3D parameters. The primary issues are:

1. **Accessibility is the top priority.** Interactive `<div>` elements without keyboard access or ARIA roles (Critical C-1) and the inability to express hover/focus states via inline styles (Critical C-2) are the most impactful issues. These affect every interactive element in the dashboard.

2. **Design token centralization is the second priority.** The 56+ hardcoded color references (High H-1) and absence of CSS custom properties (High H-2) make the codebase brittle to visual changes. Extracting shared values to a constants file or CSS custom properties would immediately improve maintainability.

3. **The inline-styles-everywhere approach is the root cause of multiple issues.** It prevents hover/focus/active states (C-2), forces font/color duplication (H-1, M-4), and blocks responsive design (M-6). Moving static styles to CSS classes -- even just in `index.css` -- would resolve several issues at once.

The project is a portfolio/showcase demo, so some findings (small font sizes, dark-only shell) are acceptable design choices for its context. The accessibility issues should still be addressed since the dashboard is interactive and the project serves as a portfolio piece demonstrating professional quality.
