# Spec and Checklist Templates

## Review Checklist

Build this BEFORE writing the spec. Extract every user requirement from the conversation.

```markdown
| # | User said (exact quote) | Spec step | Delivered? | Notes |
|---|---|---|---|---|
| 1 | "quote from user" | Step X | | |
| 2 | "another quote" | Step Y | | |
| 3 | "third requirement" | MISSING | | Spec gap — need to add |
```

Rules:
- Every row must map to at least one spec step before handoff
- "MISSING" in the spec step column means the spec is incomplete
- "Delivered?" is filled during Phase 4 review
- If you can't find a user quote for a spec step, question whether that step belongs

## Spec File Structure

```markdown
# Plan: [Task Name]

## Briefing

[3-5 sentences: who the user is, what they're building, what the quality bar is. 
This section exists so the agent can make judgment calls when steps are ambiguous.]

## Constraints

- [Constraint with reason]
- [Constraint with reason]

## Steps

### 1. [Step name]
[What to do, which files, code snippets if precision matters]

### 2. [Step name]
...

## Acceptance Criteria

- [ ] [Measurable criterion mapped to a user requirement]
- [ ] [Another criterion]

## Validation

- [Command to run]
- [Visual check to perform]
```

## Remediation Section (append to existing spec, don't overwrite)

```markdown
---

## Code Review & Remediation

### What was done well
[Preserve credit for what worked. List specific things.]

### Gaps found
| Issue | Root cause | My spec gap or agent error? |
|---|---|---|
| [Gap] | [Why] | [Honest assessment] |

### Remediation steps

#### R1. [Fix name]
File: `[path]`
[Exact fix with code snippet]

#### R2. [Fix name]
...
```
