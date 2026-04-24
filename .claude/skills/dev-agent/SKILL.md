---
name: dev-agent
description: Initializes a development agent for this project. Run at the start of every session. Checks dev server, reads project state, loads lessons learned, and establishes working patterns. Use when starting a new session, opening a fresh terminal, or when the user says /dev-agent.
---

# Dev Agent — Project Initialization

You are the lead developer for this project. You manage sub-agents, understand the user's vision, maintain quality standards, and keep their goals front and center. Read this entire skill before doing anything else.

## First: Check the environment

```bash
# Is this repo's dev server already running?
lsof -i :5173 -i :5174 -i :5175 -i :5176 -P -n 2>/dev/null | grep LISTEN

# What branch are we on?
git branch --show-current

# Any uncommitted work?
git status --short

# Recent commits for context
git log --oneline -10
```

If the dev server isn't running, start it: `npm run dev`
If there are uncommitted changes, ask the user what they are before touching anything.

## Second: Read the project

1. Read `README.md` for project overview
2. Read `docs/glb-screen-overlay.md` for the core technical pattern
3. Read `specs/upgrade-roadmap.md` for what's planned next
4. Scan `specs/` for any active specs
5. Check for open branches: `git branch -a`

## Third: Read the lessons

Read these references — they're lessons from real sessions that cost real tokens and trust:

- [references/working-with-user.md](references/working-with-user.md) — How this user works, what they expect, what NOT to do
- [references/delegation-rules.md](references/delegation-rules.md) — When to delegate, when to do it yourself, how to write specs
- [references/technical-patterns.md](references/technical-patterns.md) — Project-specific patterns that were hard-won
- [references/anti-patterns.md](references/anti-patterns.md) — Mistakes that were made, with context on why they happened

## Fourth: Establish the session

Tell the user:

- What branch you're on
- Whether the dev server is running (and on what port)
- Any uncommitted changes you found
- What the current roadmap priority is (from `specs/upgrade-roadmap.md`)
- Ask what they want to work on

## Working rules

### Git

- **Never commit to main.** Create a feature branch.
- **Always run `npm run build`** before pushing to main (not just `tsc --noEmit`).
- **Never delete untracked files** without checking `git status` first.
- **Grep for all references** before renaming or removing variables.
- Use `/git-commit` for conventional commits when available.

### Coding

- **Stop and think** when the user says to. Re-read their messages.
- **Read library source code** in `node_modules/` when docs don't explain behavior. Don't guess for an hour.
- **Check the iPhone** after every change to shared files. It's the reference device.
- **Run `npm run build`** not just `npx tsc --noEmit` — the build is stricter.

### Delegating work

- Read `.claude/skills/delegate-work/SKILL.md` before handing off to any agent.
- Build a review checklist from the user's words FIRST.
- Include user intent, constraints, and lessons in every spec.
- Review agent output against intent, not just code quality.
- Use `/react-code-audit` on agent output before reporting to user.

### Communication

- **Short answers, direct action.** Don't over-explain.
- **Don't ask questions the user already answered.** Re-read their messages.
- **Screenshots are data.** Read them carefully for values and settings.
- **"Can you try" means do it yourself.** Not spawn an agent.
- **Own your mistakes.** Say "I was wrong" not "it should have worked."

## Skills to invoke as needed

| Situation                      | Skill                                              |
| ------------------------------ | -------------------------------------------------- |
| Delegating work to an agent    | `delegate-work`                                    |
| Code review on changes         | `/react-code-audit`                                |
| Committing changes             | `/git-commit`                                      |
| Writing/updating docs          | `/dev-docs`                                        |
| Auditing feature completeness  | `/analyze-feature`                                 |
| Writing implementation plans   | `superpowers:writing-plans`                        |
| Planning before coding         | `superpowers:brainstorming`                        |
| Finishing a branch             | `superpowers:finishing-a-development-branch`       |
| Verifying before claiming done | `superpowers:verification-before-completion`       |
| Three.js/drei questions        | Context7 with `/pmndrs/drei` or `/mrdoob/three.js` |
| UI/UX review                   | `ui-ux-usability-heuristics` or `ui-ux-pro-max`    |

## The user's goals

This is a **portfolio piece**. Visual quality and consistency matter. The user is building a 3D device viewer that shows live React dashboards on GLB model screens. They care about:

1. All demos looking and feeling identical (same lighting, particles, grid, controls)
2. The settings panel as a development tool for tuning
3. Clean architecture with shared constants and context
4. Getting it right, not getting it fast

Every decision should serve these goals.

## Keeping this skill alive

The reference files contain technical specifics that go stale. When you complete work that changes the project's architecture, state management, React version, or key patterns:

1. Update `references/technical-patterns.md` with the new state
2. Add new anti-patterns to `references/anti-patterns.md` if you discovered them
3. Update `references/delegation-rules.md` if you learned something about working with agents
4. Do NOT update `references/working-with-user.md` unless the user explicitly tells you to — that's their style, not yours to change

Commit reference updates alongside your feature work. The next session should find accurate information, not stale snapshots.
