# Agent Prompt Template

Use this structure when writing the `prompt` parameter for the Agent tool. The prompt is the briefing — it carries the context that makes the spec useful.

## Template

```
## Context

[Who is the user, what are they building, quality bar. 3-5 sentences.]

## What the user wants

[User's actual words. Use quotes. Not your interpretation — their words. Each requirement on its own line so the agent can refer back to them.]

## Constraints

[Hard rules. Each with a one-line reason so the agent can judge edge cases.]

- [Constraint]: [Why]
- [Constraint]: [Why]

## Lessons from previous attempts (if applicable)

[What went wrong last time. Be transparent about whether it was your spec gap or the previous agent's error. Include the "what I wrote vs what the user wanted" table if it helps.]

## Your task

Read the spec at `[path]`. Execute the steps in order. Run `[validation command]` after each step — stop if it fails.

But don't follow the steps blindly. You know what the user wants (above). If a step doesn't make sense given their goal, flag it or fix it. I'll hold you accountable for the outcome, not just for following instructions.

## When you're done

Before reporting completion, do a self-review:

1. **Intent coverage**: For each user requirement listed above, what did you build that addresses it? List them.
2. **Constraint check**: Did you violate any constraint? If so, explain why.
3. **Uncertainties**: What are you not confident about? Don't hide these — flagging them saves a review cycle.
```

## What NOT to put in the prompt

- Implementation details that belong in the spec (file paths, code snippets)
- Generic instructions ("write clean code") — be specific or don't say it
- Repeated information from the spec — point to the spec, don't duplicate it

## Sizing

The prompt should be 200-400 words. If it's longer, you're putting spec content in the prompt. If it's shorter, you're probably missing context or constraints.
