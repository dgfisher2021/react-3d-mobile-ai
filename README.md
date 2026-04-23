# react-3d-mobile-ai

🔗 **Live demo:** https://dgfisher2021.github.io/react-3d-mobile-ai/

Three side-by-side 3D renderings of an iPhone 15 Pro running the PPM Sprint
Standards dashboard — prototyped originally in Claude artifacts and ported
into a proper Vite + React + TypeScript app. Switch between the approaches
via the tabs at the top of the page.

## The three demos

| Tab             | Stack                           | Dashboard on screen                                  |
| --------------- | ------------------------------- | ---------------------------------------------------- |
| Three.js Canvas | `three` only, hand-rolled orbit | Static paint via `CanvasTexture` (`drawScreen.ts`)   |
| CSS 3D Live     | CSS `rotateX/Y` + `perspective` | Real interactive `<LiveDashboard/>` React tree       |
| R3F + drei Live | `@react-three/fiber` + `drei`   | Real `<LiveDashboard/>` via drei `<Html transform/>` |

Demos 2 and 3 share the same `LiveDashboard` component tree — every tab,
expandable ticket card, ceremony agenda, and the AI assist panel behave
identically regardless of which 3D host you're viewing through.

## Heads up: the AI panel is mocked

The original artifact called `api.anthropic.com/v1/messages` directly from
the browser, which cannot work from a static GitHub Pages build (no secret
storage, CORS). The UI is preserved but responses come from a small scripted
lookup in `src/components/dashboard/AssistPanel.tsx`. Wire up your own
backend proxy to make it live.

## Project layout

```
src/
├── App.tsx                           # Top-level demo tab switcher
├── main.tsx
├── index.css
├── components/
│   ├── DemoOverlay.tsx               # Shared title/hint/badges UI
│   ├── DemoTabs.tsx                  # Demo switcher pill
│   └── dashboard/                    # Shared live app (demos 2 & 3)
│       ├── LiveDashboard.tsx
│       ├── PhoneChrome.tsx           # Status bar, island, header, home indicator
│       ├── BottomNav.tsx
│       ├── StandardsTab.tsx
│       ├── TicketsTab.tsx
│       ├── MeetingsTab.tsx
│       ├── HierarchyTab.tsx
│       └── AssistPanel.tsx
├── constants/                        # Themes, tickets, ceremonies, etc.
├── hooks/useAIResponseParser.ts      # Numbered-list parser for AI output
├── demos/
│   ├── ThreeJsCanvasDemo/
│   │   ├── index.tsx
│   │   ├── drawScreen.ts             # 2D canvas dashboard paint
│   │   ├── buildPhone.ts             # THREE.Group construction
│   │   └── phoneConstants.ts
│   ├── CSS3DDemo/index.tsx
│   └── R3FDemo/
│       ├── index.tsx
│       └── PhoneMesh.tsx
└── types/index.ts
```

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run preview    # serves the built bundle
npm run typecheck  # tsc --noEmit
npm run format     # Prettier write
```

## Deploying

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and
deploys to Pages on every push to `main`. Make sure Pages is set to
"GitHub Actions" as the source under repo Settings → Pages.

The Vite `base` is hardcoded to `/react-3d-mobile-ai/` to match the repo
name. If you fork under a different name, update `vite.config.ts`.
