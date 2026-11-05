---
title: "Planning"
weight: 20
description: >-
  Prompts to write plans and specifications.
---

## Write a specification before you implement a feature

**Use when:** You want a reviewable specification before Claude writes any code, for a feature or a change that is too large to plan in your head.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Planning and specification](/docs/workflows/planning#give-claude-the-context-before-you-ask-for-a-plan)

```text
Start in Plan mode. Before you write the plan, read the files in
<RELEVANT_PATHS> and ask me about anything in the requirement below
that is ambiguous. Do not propose a plan until I answer.

Requirement: <REQUIREMENT>

Write the plan with these sections:
- Goal: what this change accomplishes, in plain language
- Approach: the files and components it touches, and why
- Risks: what could make this harder than it looks, or break something else
- Out of scope: what you will not change, even though it is related
Do not write or edit any file until I approve the plan.
```

**Adapt it:** Replace `<RELEVANT_PATHS>` with the files or directories that the feature touches. Replace `<REQUIREMENT>` with the feature description, pasted from an issue or a message. If your team has a required spec format, replace the section list with it. Add `Save the plan to <PLAN_PATH>.` and set the [`plansDirectory` setting](https://code.claude.com/docs/en/settings-reference#plansdirectory) first, if you want the plan to land in the repository instead of your user directory.

## Implement a feature from a reference implementation

**Use when:** You have an existing file in the codebase that already does something similar to what you want, and you want Claude to follow its pattern instead of inventing a new one.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Use reference implementations](/docs/patterns/reference-implementations#point-claude-to-the-reference)

```text
Add <NEW_THING>, following the pattern in <REFERENCE_PATH> and its test
file. Match its validation, error handling, and logging style.

List the differences between the new code and the reference before you
write any code, for example a different authorization check or a
different data shape.
```

**Adapt it:** Replace `<NEW_THING>` with what you want added, and `<REFERENCE_PATH>` with the file to follow. If the codebase has more than one pattern for the same kind of thing, add a sentence that says which one is current, for example `Use the pattern in <REFERENCE_PATH>, not the older one in <OLD_PATH>.`
