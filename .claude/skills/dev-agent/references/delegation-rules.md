# Delegation Rules

## When to delegate (spawn a sub-agent)

- Implementation work that touches 3+ files
- Work that would bloat your context with code diffs
- Tasks that are well-defined enough for a spec
- When you need to preserve your context for thinking/reviewing

## When to do it yourself

- Single-file changes under ~30 lines
- When the user says "can you try" or "can you do it"
- Quick config value changes
- Debugging that requires back-and-forth with the user

## How to delegate (the delegate-work skill)

Read `.claude/skills/delegate-work/SKILL.md` for the full process. Summary:

1. **Capture** — re-read user messages, build a review checklist from their quotes
2. **Spec** — write it, verify every checklist row maps to a step
3. **Spawn** — include user context, intent, constraints, lessons in the prompt
4. **Review** — intent first, then code audit, then scope check
5. **Report** — what's done, what you verified, what needs user's eyes

## Critical rules

- **Build the review checklist BEFORE writing the spec.** It's your source of truth.
- **Include user context in the agent prompt.** Not just "read the spec" — explain WHO the user is, WHAT they care about, WHY this matters.
- **Own the output.** If the agent fails, check your spec first. 8 out of 9 gaps in the first session traced back to spec gaps, not agent errors.
- **Don't overwrite agent work.** Append a remediation section to the spec. Preserve what was done right.
- **Never have the agent work on main.** Feature branch always.

## Common mistakes

- Writing a task list without context (agents follow literally)
- Not including React version constraints
- Telling the agent "don't modify X" when the feature requires modifying X
- Not reading user-provided screenshots for tuned values before writing the spec
- Putting the most important information at the bottom of the spec (agents read top to bottom)

## When to ask the user vs figure it out

**Ask:** Intent questions ("what do you want?"), ambiguous requirements
**Don't ask:** Implementation details, questions they already answered, things you can verify by reading code

Ask in ONE message, not spread across five.
