# Future Improvements

Ideas to explore when time permits. Not blockers — the current setup works.

## Parallelization

Currently we spawn one sub-agent at a time. For independent tasks (e.g. setting up 3 GLB devices simultaneously), spawning multiple agents in parallel would save time. Consider:

- Only parallelize truly independent work (no shared file conflicts)
- Each agent gets its own spec or section of a spec
- Review all outputs before committing any
- Don't use worktrees yet — prove single-branch parallel works first

## Token tracking

The agent completion notification includes token usage. Track and report this:

- Log token cost per agent spawn
- Compare: did the briefing-heavy approach save tokens vs piecemeal iteration?
- Report total session token usage when wrapping up
- The goal is "fewest tokens for first-shot success" — measure it

## Status line

Consider a custom status line showing:

- Current branch
- Active device (when in GLB demo)
- Build status
- Last commit message

Use the `statusline-setup` agent type to configure.

## Hooks

Consider adding:

- Pre-commit hook: run `npx prettier --check` and `npx tsc --noEmit` before allowing commits
- Claude Code hooks: auto-run `/react-code-audit quick` after editing React components

## Auto-positioning improvement

The MacBook's pivot-to-center offset requires manual `htmlPosition` tuning. The geometry center approach (`mesh.geometry.boundingBox.getCenter → mesh.matrixWorld → scene inverse`) gives the exact center but broke iPhone's Z depth. A unified approach would:

- Use geometry center for all axes
- Compute the face normal direction to push the Html to the surface
- Eliminate per-device htmlPosition entirely

## Spec cleanup automation

Old specs accumulate. Consider:

- Auto-archiving specs that are fully implemented
- Moving completed specs to `specs/archive/`
- A skill that scans specs and reports status
