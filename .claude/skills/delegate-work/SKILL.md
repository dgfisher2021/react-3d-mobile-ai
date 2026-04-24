---
name: delegate-work
description: Guides the process of delegating implementation work to a sub-agent for maximum first-shot success with fewest tokens. Use when handing off coding tasks, writing specs for agents, spawning implementation agents, or reviewing completed agent work before reporting to the user.
---

# Delegate Work

Goal: the user's intent is delivered correctly on the first attempt, using the fewest tokens possible. Every phase serves that goal. If a phase doesn't reduce iteration risk, it's waste.

You are responsible for your agent's output. The spec is the reference material. The Agent prompt is the briefing. If the agent delivers the wrong thing, check your prompt and spec before blaming them.

## When to use

- You need to delegate implementation work to a sub-agent
- You're writing a spec that an agent will execute
- You're about to spawn an Agent tool call for implementation
- An agent finished work and you need to review before reporting to the user

## Process

### Phase 1: Capture

Before writing anything, re-read every user message in the conversation. Extract every request, preference, and constraint into a review checklist.

Format:
```
| User said | Maps to spec step | Delivered? |
|---|---|---|
| "exact quote" | Step X | (fill after review) |
```

**This is your source of truth.** The spec serves the checklist. If a user requirement has no spec step, the spec is incomplete. Build this BEFORE writing the spec.

If something is genuinely ambiguous after re-reading, ask the user — but:
- Check if they already answered in a previous message first
- Ask all questions in ONE message, not spread across multiple
- Only ask about intent ("what do you want"), never implementation ("should I use useRef")

### Phase 2: Spec

Write a spec file (typically in `specs/`) with the technical details the agent needs. Reference [templates.md](references/templates.md) for the structure.

After writing the spec, verify: does every row in your review checklist map to at least one spec step? If not, the spec is incomplete. Fix it before proceeding.

Ensure the agent will work on a feature branch, never main.

### Phase 3: Spawn

Spawn the sub-agent via the Agent tool. If `spec-implementer` is available as a subagent_type (check the available agents list — it may require a console restart after creation), use it. Otherwise use a general-purpose agent and include the self-review instructions directly in the prompt (see template).

Your prompt to the agent is a briefing. Reference [agent-prompt-template.md](references/agent-prompt-template.md) for the structure.

**Provide spec content directly in the prompt** when possible, rather than just pointing to a file path. This saves the agent a file read and ensures it gets exactly what you want it to see. For large specs, provide the key sections inline and point to the file for reference details.

Key sections in the briefing prompt:
- **Context**: Who is the user, what are they building, what's the quality bar
- **Intent**: What the user wants in their own words (quotes)
- **Constraints**: Hard rules with reasons (versions, branches, what NOT to do)
- **Lessons**: What went wrong on previous attempts (if any), what to watch for
- **Spec content**: The steps and details (inline or file pointer)
- **Anti-patterns pointer**: "Read `.claude/skills/delegate-work/references/anti-patterns.md`"

**If the agent asks questions**, answer clearly before letting it proceed. Don't rush it into implementation.

### Phase 4: Review

When the agent completes, review in this order — intent first, then spec compliance, then code quality:

1. **Intent check**: Walk your review checklist. For each row, find the corresponding delivery. Mark covered/missing. This catches requirements gaps that no code audit can find.

2. **Spec compliance**: Did the agent build what the spec asked? Separately — did the spec ask for the right things? (If not, that's your fault, not the agent's.)

3. **Code audit**: Run `/react-code-audit` on the changed files. Choose the mode based on change scope:
   - **Small/focused change** (1-3 files, single concern): `quick`
   - **Multi-file feature** (4-10 files, crosses component boundaries): `architecture` + `hooks`
   - **Large feature or first implementation** (10+ files, new patterns): `full`

   The audit catches code quality issues. It does NOT catch missing requirements or domain-specific bugs — those require step 1 and your own knowledge.

4. **Scope check**: Did the agent add things nobody asked for? Remove or flag them.

5. **Verification**: Run the app, check typecheck passes, confirm the feature actually works before claiming it does. Never report "it should work" without evidence.

### Phase 5: Report

Tell the user what happened. Structure:
- **What's done**: Brief summary of delivered work
- **What you verified**: Typecheck, audit results, intent checklist coverage
- **Token cost**: Report the agent's token usage from the completion notification
- **What needs their eyes**: Visual verification, UX judgment, priority calls
- **What's not done**: Any gaps, with your plan to fix them

The user should never have to find code bugs, trace spec gaps, or re-state requirements. If they're doing that, you failed.

## Principles

- **Own the output.** Agent followed your instructions? Then your instructions were the problem.
- **Intent over steps.** A correct step that produces the wrong outcome is still wrong.
- **Capture before spec.** The review checklist is the source of truth, not the spec.
- **Front-load context in the prompt.** The 20% that explains WHY makes the 80% of steps useful.
- **One spawn, not three.** A thorough prompt costs less than three failed iterations.
- **Don't overwrite, append.** If remediating, preserve what the agent did right.
- **Stay in scope.** Only deliver what was asked.
- **Anti-patterns are living documentation.** When you discover a new domain-specific mistake, add it to `references/anti-patterns.md`.
- **Separate spec compliance from code quality.** "Did it match the spec" and "is the code good" are different questions. Check them in that order.
- **Answer sub-agent questions before proceeding.** If an agent is uncertain, resolve it — don't let them guess.
