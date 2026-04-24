# Anti-Patterns

Real mistakes from real sessions. Each cost tokens and user trust. Read before coding.

## Guessing instead of reading source code

Spent an hour guessing at drei's distanceFactor formula from one data point. The answer was in `node_modules/@react-three/drei/web/Html.js` line 271. Found it in 5 minutes once looked. **After 2-3 failed attempts at understanding library behavior, read the source.**

## Racing through piecemeal changes

Fixed the scale, broke the controls. Fixed the controls, broke the lighting. Fixed the lighting, broke the defaults. Each fix introduced new inconsistencies. **Stop. Re-read messages. Build a checklist. Plan holistically.**

## Asking questions the user already answered

User said "tighten the work first, upgrade later." Asked: "Do you want to upgrade to React 19?" **Search the conversation for the answer before asking.**

## Interpreting instead of quoting

User said "ALL the effects from the original." Spec said "Initialize all to false (off by default)." **Use the user's actual words in specs.**

## Blaming the agent for spec gaps

Agent used meshBasicMaterial on GridHelper. Spec said "with transparent material" — vague instruction. **For each gap, ask: did my spec cover this clearly?**

## Deleting untracked files

Ran `rm specs/react-19-upgrade.md`. File was untracked — never committed. Gone forever. An agent spent 127k tokens creating it. **Check `git status` before deleting. If untracked, commit first or ask.**

## Committing to main

Pushed directly to main without asking. User's stable code was at risk. **Always create a feature branch. Only merge to main with explicit permission.**

## Not reading screenshots

User shared screenshots with tuned settings panel values. Didn't read them. Wrote a spec without the user's data. Agent rediscovered everything from scratch. **Screenshots are data. Read them carefully.**

## Doing inline implementation when context is low

Implemented code changes directly in conversation instead of spawning a sub-agent. Code diffs filled context. Fix didn't work. Context bloated AND problem unsolved. **If it's more than one file, spawn a sub-agent.**

## Not checking the iPhone after changes

Changed DeviceModel positioning for the MacBook. Didn't verify iPhone still worked. It didn't. **Test both devices after every shared-file change.**

## Using the wrong measurement method

Used `geometry.computeBoundingBox * getWorldScale` for sizing. Broke on the MacBook because parent rotation swaps axes. `getWorldScale` returns scale magnitudes, not rotated axes. **Use `Box3.setFromObject` for world-space dimensions.**

## Not running the full build

`tsc --noEmit` passed. `npm run build` failed. `as const` values in useState caused type mismatches that only the stricter `-b` flag caught. **Run `npm run build` before pushing to main.**
