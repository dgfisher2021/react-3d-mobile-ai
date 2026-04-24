# Anti-Patterns

Real mistakes from real sessions. Each one cost tokens and user trust.

## Interpreting instead of quoting

**Wrong:** User says "I want ALL the effects from the original." You write in the spec: "Initialize all to false (off by default)."

**Why it fails:** You interpreted "give me control" as "start with everything off." The user meant "start with everything on, let me toggle."

**Fix:** Use the user's actual words in the spec. When in doubt, quote them directly and let the agent interpret in context.

## Asking questions the user already answered

**Wrong:** User says "tighten the work first, upgrade later." You ask: "Do you want to upgrade to React 19?"

**Why it fails:** Wastes the user's time and erodes trust. They feel unheard.

**Fix:** Before asking any question, search the conversation for the answer. If they said it, don't ask.

## Task list without context

**Wrong:** Spec contains 11 steps but no explanation of who the user is, what they're building, or why it matters.

**Why it fails:** The agent follows steps literally. Step 10 says "no model info for non-GLB demos" — the agent does exactly that, even though the user's intent (compare across tabs) requires info on all demos. Without context, the agent can't catch the contradiction.

**Fix:** Front-load the spec with a briefing section. Or better: put the context in the Agent tool prompt and point to the spec for technical details.

## Reviewing code before intent

**Wrong:** Agent finishes work. You run a code audit, find 2 bugs, report them. User asks "but did they build what I asked for?" You check — they didn't.

**Why it fails:** Code quality doesn't matter if the feature is wrong. You caught 2 bugs but missed 5 gaps.

**Fix:** Always review intent first (checklist), then code quality (audit). Report both.

## Blaming the agent for your spec gaps

**Wrong:** "The agent used meshBasicMaterial on GridHelper." Your spec said "with transparent material" — you were vague.

**Why it fails:** The agent followed your instruction. The instruction was bad.

**Fix:** For each gap, ask: "Did my spec cover this clearly?" If no, it's your fault. Say so.

## Overwriting instead of appending

**Wrong:** Agent completes 10 steps successfully. You find 5 gaps. You rewrite the entire spec from scratch, erasing the record of what was done.

**Why it fails:** Loses credit for good work. Loses the context of what was already implemented. The next agent might redo completed steps.

**Fix:** Append a remediation section. Preserve the original steps and their completion status. Add the fixes as new steps (R1, R2, etc.).

## Adding scope nobody asked for

**Wrong:** Agent finds a React 18 compatibility issue. Instead of fixing the code, they write a React 19 upgrade analysis and create a new branch for it.

**Why it fails:** The user didn't ask for an upgrade. Now there's extra work to review, an extra branch to manage, and the original bug still isn't fixed.

**Fix:** Only deliver what was asked. If you see an opportunity, mention it in a note — don't build it.

## Not using available skills

**Wrong:** You write a raw `git commit -m "long paragraph"` when `/git-commit` exists and does conventional commits with selective staging. You do a manual code review when `/react-code-audit` has 10 structured modes. You start coding immediately when `superpowers:brainstorming` would force you to think first.

**Why it fails:** Skills exist to enforce structure and prevent the exact mistakes you keep making. Ignoring them means relying on your own discipline, which has proven insufficient.

**Fix:** Before any major action, check if a skill exists for it:
- Commits → `/git-commit`
- Code review → `/react-code-audit`
- Planning → `superpowers:writing-plans` or `superpowers:brainstorming`
- Branch isolation → `/git-worktree` or `superpowers:using-git-worktrees`
- Verification → `superpowers:verification-before-completion`
- Completing a branch → `superpowers:finishing-a-development-branch`

## Committing to main

**Wrong:** You push directly to main without creating a feature branch.

**Why it fails:** The user's stable code is on main. In-progress work there means their deployed site could break.

**Fix:** Always create a feature branch before implementation. Only merge to main via PR or explicit user approval.

## Rushing through without a plan

**Wrong:** User describes what they want. You immediately start writing code. You fix the scale, but the controls are wrong. You fix the controls, but the lighting is different. You fix the lighting, but the defaults are off.

**Why it fails:** Each piecemeal fix introduces new inconsistencies. The user watches you thrash and loses confidence.

**Fix:** Stop. Re-read messages. Build the checklist. Present a plan. Get alignment. Then execute.
