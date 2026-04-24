## React Code Audit: Accessibility + Security Mode

**Files analyzed:**
- `src/App.tsx`
- `src/main.tsx`
- `src/components/DemoTabs.tsx`
- `src/components/DemoOverlay.tsx`
- `src/components/MeshLayerTree.tsx`
- `src/components/MeshBoundingBoxes.tsx`
- `src/components/ViewPresets.tsx`
- `src/components/SettingsPanel.tsx`
- `src/components/SceneHelpers.tsx`
- `src/components/dashboard/BottomNav.tsx`
- `src/components/dashboard/StandardsTab.tsx`
- `src/components/dashboard/TicketsTab.tsx`
- `src/components/dashboard/HierarchyTab.tsx`
- `src/components/dashboard/MeetingsTab.tsx`
- `src/components/dashboard/AssistPanel.tsx`
- `src/components/dashboard/PhoneChrome.tsx`
- `src/components/dashboard/LiveDashboard.tsx`
- `src/demos/CSS3DDemo/index.tsx`
- `src/demos/R3FDemo/index.tsx`
- `src/demos/R3FDemo/PhoneMesh.tsx`
- `src/demos/ThreeJsCanvasDemo/index.tsx`
- `src/demos/ThreeJsCanvasDemo/buildPhone.ts`
- `src/demos/ThreeJsCanvasDemo/drawScreen.ts`
- `src/demos/ThreeJsCanvasDemo/phoneConstants.ts`
- `src/demos/GLBModelDemo/index.tsx`
- `src/demos/GLBModelDemo/DeviceModel.tsx`
- `src/demos/GLBModelDemo/deviceConfigs.ts`
- `src/context/DemoContext.tsx`
- `src/context/SettingsContext.tsx`
- `src/hooks/useReducedMotion.ts`
- `src/hooks/useAIResponseParser.ts`
- `src/types/index.ts`
- `src/utils/roundedRect.ts`
- `src/constants/themes.ts`
- `src/constants/quickChips.ts`
- `src/constants/tickets.ts`
- `src/constants/hierarchy.ts`
- `src/constants/ceremonies.ts`
- `src/constants/demoSettings.ts`

**Date:** 2026-04-24

---

### Critical

No critical issues found.

---

### High

**H1. Interactive `<div>` elements used instead of `<button>` for clickable actions (semantic HTML)**
- **Files:** `BottomNav.tsx` (lines 66-89, 112-150), `AssistPanel.tsx` (lines 137-148, 186-200, 383-403, 433-449), `PhoneChrome.tsx` (lines 109-130)
- **Details:** Multiple interactive elements use `<div onClick={...}>` instead of semantic `<button>`:
  - `BottomNav.tsx`: The center "Ask AI" circle and all `TabButton` components are `<div onClick>`. Screen readers cannot identify these as interactive controls. They receive no keyboard focus and cannot be activated via Enter/Space.
  - `AssistPanel.tsx`: "Reset chat" and "Close" use `<div role="button">` which is an improvement but still lacks `tabIndex={0}` and `onKeyDown` for Enter/Space activation. Quick chips (both in empty state and in the chip bar) are `<div onClick>` with no ARIA role, no keyboard handling. The send button is a `<div onClick>` with no role or keyboard support.
  - `PhoneChrome.tsx`: The theme toggle is a `<div onClick>` with no accessible name, no keyboard support.
- **Impact:** Keyboard-only users and screen reader users cannot interact with navigation, AI chat, theme toggle, or quick-action chips.
- **Recommendation:** Replace interactive `<div>` elements with `<button>` elements. Where `<div role="button">` is used, add `tabIndex={0}` and `onKeyDown` handler for Enter/Space, or just switch to `<button>`.

**H2. TicketsTab and MeetingsTab expandable cards are not keyboard-accessible**
- **Files:** `TicketsTab.tsx` (line 52), `MeetingsTab.tsx` (line 33)
- **Details:** Expandable card headers use `<div onClick>` without `role="button"`, `tabIndex`, `onKeyDown`, or `aria-expanded`. Users cannot tab to these cards or use Enter/Space to expand them. Screen readers do not announce them as interactive or convey expanded/collapsed state.
- **Impact:** Keyboard-only and screen reader users cannot access the expandable content for ticket types and meeting ceremonies.
- **Recommendation:** Use `<button>` for the clickable header row, add `aria-expanded={isExp}`, and wire `aria-controls` to the expanded content panel with an appropriate `id`.

**H3. DemoTabs lack visible focus indicator and ARIA tab pattern**
- **Files:** `DemoTabs.tsx`
- **Details:** The tab bar does not implement the WAI-ARIA tabs pattern (`role="tablist"`, `role="tab"`, `aria-selected`). The active tab is only indicated by color, with no `aria-selected` or `aria-current` attribute. No `aria-label` on the tab container. The buttons use inline styles which override default browser focus outlines (no `outline` specified), potentially making keyboard focus invisible against the dark background.
- **Recommendation:** Add `role="tablist"` to the container, `role="tab"` and `aria-selected` to each button. Consider adding arrow-key navigation between tabs per WAI-ARIA tab pattern. Ensure a visible focus ring.

**H4. AssistPanel input lacks `<label>` and the chat lacks live region announcements**
- **File:** `AssistPanel.tsx`
- **Details:**
  - The text input (line 419) has `placeholder="Ask about standards..."` but no associated `<label>` or `aria-label`. Placeholder text alone is not an accessible name.
  - When the AI responds, new messages appear in the chat area but are not announced to screen readers (no `aria-live="polite"` region on the message container or individual responses).
  - The "thinking" dots animation (line 339) has no text alternative; screen readers see nothing when the AI is processing.
- **Impact:** Screen reader users cannot identify the input purpose or be notified of new AI responses.
- **Recommendation:** Add `aria-label="Ask about standards"` to the input. Wrap the chat messages area in a container with `aria-live="polite"`. Add visually-hidden text like "AI is thinking..." during the loading state.

---

### Medium

**M1. MeshLayerTree section header uses `<div onClick>` for collapse toggle**
- **File:** `MeshLayerTree.tsx` (line 355)
- **Details:** The "Mesh Layers" section header is a `<div style={sectionHeader} onClick={...}>` with no keyboard support, no ARIA role, and no expanded/collapsed state announcement.
- **Recommendation:** Use a `<button>` with `aria-expanded` for the collapsible section trigger.

**M2. MeshLayerTree group carets and name spans use `<span onClick>` for toggling**
- **File:** `MeshLayerTree.tsx` (lines 247, 258-270)
- **Details:** The caret icon and group name in `TreeNode` use `<span onClick>` for collapse toggling. These are not focusable and have no keyboard support or ARIA semantics.
- **Recommendation:** Use `<button>` for interactive expand/collapse triggers, with `aria-expanded` to convey state.

**M3. Bounding box toggle button lacks accessible label text**
- **File:** `MeshLayerTree.tsx` (line 222-228)
- **Details:** The bbox toggle button shows "bbox" as visible text and has `title="Toggle bounding box"`, but `title` is not reliably exposed to all assistive technologies. The visible text "bbox" is jargon.
- **Recommendation:** Add `aria-label="Toggle bounding box"` for clarity.

**M4. ViewPresets buttons lack accessible names describing the view**
- **File:** `ViewPresets.tsx`
- **Details:** Buttons like "Front", "Angle", "Back", "Auto" have visible labels but lack context about what they control. The "Auto" button toggles auto-rotation but has no `aria-pressed` or `aria-label` to convey its toggle state.
- **Recommendation:** Add `aria-pressed={autoRotate}` to the Auto button. Consider `aria-label` attributes like "Front view preset" for clarity.

**M5. SettingsPanel gear button relies on Unicode glyph for accessible name**
- **File:** `SettingsPanel.tsx` (lines 223-247)
- **Details:** The settings gear button uses the Unicode character `&#9881;` (gear) as its content and `title="Settings"`. The Unicode character may not be announced meaningfully by screen readers. The button has no `aria-label`.
- **Recommendation:** Add `aria-label="Settings"` and `aria-expanded={settingsOpen}` to communicate that it opens a panel.

**M6. NumberInput fields in SettingsPanel lack accessible labels**
- **File:** `SettingsPanel.tsx` (lines 279-293)
- **Details:** The number inputs for Screen Width, Screen Height, Corner Radius, and Distance Factor have visible text labels in the same row but are not programmatically associated via `<label htmlFor>` or `aria-label`/`aria-labelledby`.
- **Recommendation:** Add `aria-label` to each `NumberInput` or use `id` + `htmlFor` to associate the visible label.

**M7. Vec3Input fields lack individual axis labels for screen readers**
- **File:** `SettingsPanel.tsx` (lines 140-169)
- **Details:** Each axis (X, Y, Z) has a visible letter next to the input, but the number inputs are not programmatically labeled. A screen reader would announce "spinbutton" with no context for which axis or which property (Position, Rotation, etc.).
- **Recommendation:** Add `aria-label` to each input, e.g., `aria-label="Position X"`.

**M8. Color contrast concerns with muted text on dark backgrounds**
- **Files:** Multiple components
- **Details:** The dark theme uses `#718096` (muted text) on backgrounds like `#0B1426` or `rgba(11,20,38,...)`. This yields a contrast ratio of approximately 4.2:1 for normal-weight text. At the very small font sizes used (0.52rem-0.65rem), WCAG AA requires 4.5:1 for normal text. Several instances of muted text at small sizes may fall below WCAG AA:
  - `BottomNav.tsx`: Tab labels at 0.52rem in muted color
  - `AssistPanel.tsx`: "MOCK DEMO" badge, message timestamps, placeholder text
  - `DemoOverlay.tsx`: Hint text at 0.72rem
  - `StandardsTab.tsx`, `HierarchyTab.tsx`: Various labels at 0.58-0.62rem
- **Recommendation:** Increase muted text color brightness (e.g., `#8B97A8` or `#94A3B8`) or increase font sizes to meet WCAG AA 4.5:1 ratio.

**M9. Console.log statements left in production code**
- **File:** `MeshBoundingBoxes.tsx` (line 150-152), `DeviceModel.tsx` (lines 148-150)
- **Details:** `console.log` calls output bounding box dimensions and screen measurements on every render. While not a security vulnerability per se, excessive console output in production can leak internal implementation details and object structure to anyone with DevTools open.
- **Recommendation:** Remove or gate behind a `DEBUG` flag / `import.meta.env.DEV` check.

---

### Low

**L1. MeshLayerTree checkboxes lack associated label elements**
- **File:** `MeshLayerTree.tsx` (lines 211-216, 252-254)
- **Details:** Checkbox inputs have `title` attributes but no `<label>` elements or `aria-label`. They use `title="Toggle visibility"` / `title="Toggle group visibility"` which is less reliably conveyed than `aria-label`.
- **Recommendation:** Add `aria-label` to each checkbox for better screen reader support.

**L2. StatusBar decorative elements lack aria-hidden**
- **File:** `PhoneChrome.tsx` (lines 8-65)
- **Details:** The status bar with time "9:41", signal bars, and battery indicator are purely decorative (simulating a phone UI). They should be hidden from screen readers to reduce noise. Currently the "9:41" text and "5G" text would be read aloud.
- **Recommendation:** Add `aria-hidden="true"` to the status bar container, Dynamic Island, and Home Indicator since they are cosmetic phone chrome.

**L3. DemoOverlay text elements are decorative but not hidden from AT**
- **File:** `DemoOverlay.tsx`
- **Details:** The overlay text ("3D MOBILE SHOWCASE", "Device Viewer", subtitle, hint, badges) is ambient/decorative labeling for the 3D viewport. It already has `pointerEvents: 'none'` but is still announced by screen readers.
- **Recommendation:** Add `aria-hidden="true"` to the overlay container or use `role="presentation"`.

**L4. `<button>` "Reset Display" and "Reset Model" lack descriptive aria-labels**
- **File:** `SettingsPanel.tsx` (lines 296-299, 402-404)
- **Details:** These buttons have visible text and `title` attributes, which is acceptable. However, the "Reset Display" button's `title` says "Reset to 393 x 852" which provides useful context that the visible text alone does not. Making this an `aria-label` instead would ensure it reaches screen readers.
- **Recommendation:** Add `aria-label` matching the title text.

**L5. Lucide icon components lack aria-hidden on decorative icons**
- **Files:** Multiple components using lucide-react icons
- **Details:** Icons in `StandardsTab`, `TicketsTab`, `MeetingsTab`, `HierarchyTab`, `AssistPanel`, `BottomNav`, `PhoneChrome` are decorative (adjacent text provides meaning). Lucide icons render `<svg>` elements that may be picked up by screen readers.
- **Recommendation:** Pass `aria-hidden="true"` to decorative icon instances, or verify lucide-react defaults to `aria-hidden`.

**L6. `key={i}` used with static arrays**
- **Files:** `StandardsTab.tsx` (line 30, 88, 157), `TicketsTab.tsx` (line 39), `HierarchyTab.tsx` (line 46), `MeetingsTab.tsx` (line 18), `PhoneChrome.tsx` (line 25)
- **Details:** Array index is used as `key` for static arrays. Since these arrays never reorder, this is functionally fine. However, using a stable identifier (like the item's unique property) is preferred for clarity.
- **Recommendation:** Use unique properties from the data objects as keys where available (e.g., `key={kpi.label}`, `key={ticket.type}`, `key={h.level}`, `key={cer.name}`).

---

### Positive Findings

**P1. No `dangerouslySetInnerHTML` usage anywhere in the codebase.** All text content is rendered via JSX expressions, eliminating XSS risk from raw HTML injection.

**P2. No API keys, tokens, or sensitive data in client-side code.** The AI chat uses a fully mocked response map (`MOCK_RESPONSES` in AssistPanel.tsx). There are no `.env` references to API keys. The app is purely static.

**P3. No `href` or `src` attributes with user-interpolated values.** There are zero `<a>` or `<img>` tags in the entire source. All asset paths come from `import.meta.env.BASE_URL` concatenated with hardcoded filenames (deviceConfigs.ts), which is safe.

**P4. No third-party scripts loaded.** The app is a self-contained Vite bundle deployed to GitHub Pages. No external script tags, tracking pixels, or CDN scripts.

**P5. Toggle component in SettingsPanel uses proper ARIA.** The `Toggle` component correctly uses `role="switch"`, `aria-checked`, `aria-label`, and `disabled` (lines 102-118). This is a model pattern for the rest of the codebase.

**P6. `useReducedMotion` hook respects user motion preferences.** The hook in `useReducedMotion.ts` checks `prefers-reduced-motion` and updates live. It is used in `PhoneMesh.tsx`, `ThreeJsCanvasDemo/index.tsx`, and `DeviceModel.tsx` to disable animations. This is excellent accessibility practice.

**P7. Keyboard shortcut for closing AssistPanel.** The Escape key listener (AssistPanel.tsx line 57-61) properly cleans up on unmount.

**P8. Context providers use null-check with descriptive errors.** Both `useDemoContext` and `useSettingsContext` throw clear error messages when used outside their providers, preventing silent failures.

**P9. No input sanitization concerns.** The only user input is the chat text input in AssistPanel, which is rendered as text content in JSX (`{msg.content}`) and never interpolated into HTML, URLs, or eval-like contexts. React's default JSX escaping prevents XSS.

**P10. GLB model paths use `import.meta.env.BASE_URL` correctly.** The `deviceConfigs.ts` file safely constructs asset paths using template literals with the Vite base URL, which is build-time resolved.

---

### Summary

**Security posture: Strong.** This is a static demo app deployed to GitHub Pages with no backend, no auth, no API keys, no user-generated content persistence, and no `dangerouslySetInnerHTML`. The attack surface is minimal. No security issues were identified.

**Accessibility posture: Needs improvement.** The app has several high-severity accessibility gaps:

| Category | Issues | Severity Range |
|----------|--------|---------------|
| Semantic HTML (div onClick vs button) | 5 components | High |
| Keyboard navigation | 6+ interactive elements unreachable | High |
| Screen reader announcements | Chat messages not announced, missing labels | High |
| ARIA patterns | Missing tablist, expanded state, live regions | High-Medium |
| Color contrast | Muted text on dark backgrounds at small sizes | Medium |
| Decorative elements | Phone chrome/overlay not hidden from AT | Low |

**Top 3 recommendations (highest impact):**

1. Replace all interactive `<div onClick>` with `<button>` elements across BottomNav, AssistPanel, PhoneChrome, TicketsTab, MeetingsTab, and MeshLayerTree. This single change fixes keyboard access, focus management, and screen reader discoverability for the majority of the issues.

2. Add `aria-label` to the chat input and `aria-live="polite"` to the message container in AssistPanel so screen reader users can use the AI assistant feature.

3. Implement WAI-ARIA tabs pattern on DemoTabs (tablist/tab/aria-selected) and accordion pattern on TicketsTab/MeetingsTab (button with aria-expanded) to communicate state changes to assistive technology.

The Toggle component in SettingsPanel and the useReducedMotion hook demonstrate that the codebase already understands accessibility patterns -- the gap is applying that same rigor to the remaining interactive elements.
