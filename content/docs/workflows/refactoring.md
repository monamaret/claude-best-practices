---
title: "Refactoring"
weight: 50
description: >-
  Have Claude restructure code without changing its behavior, in steps that you can verify.
---

A refactor changes the structure of code, not what it does. A plausible-looking diff does not tell you which one Claude actually did: fluent code that reads as correct is not the same evidence as code that behaves the same as before. Treat a refactor as a change that needs its own safety net and its own kind of review, not as a smaller version of a feature change.

## State that behavior must not change

Say so directly in the prompt, and name what must stay the same. Claude cannot tell the difference between "clean this up" meaning restructure it and meaning improve it, unless you say which one you want:

```text
Refactor <TARGET> to <GOAL>. Do not change its behavior, its public
interface, or its return values, unless I say otherwise. If you cannot
make this change without changing behavior, stop and tell me why instead
of proceeding.
```

For the complete prompt, see [Refactor code without changing its behavior](/docs/prompts/maintenance#refactor-code-without-changing-its-behavior).

## Establish a safety net before you refactor

A refactor needs tests that already pass, not tests that start out failing. This is the opposite order from [Testing](/docs/workflows/testing#write-the-test-before-the-implementation), which asks for a failing test before new behavior exists. Here, the behavior already exists; the test's job is to catch the refactor accidentally changing it.

If the code that you want to refactor has no test, ask Claude to write a characterization test first: a test that records what the code currently does, not what it should do. Run it, confirm it passes against the current code, and only then ask for the refactor. Run the same test again afterward. A refactor that changes the test to make it pass again has not kept behavior the same; it has moved the problem into the test.

## Refactor in small, reviewable steps

One mechanical change, reviewed and committed on its own, is easier to trust than a sweeping rewrite that does five things at once. Give each refactor its own branch, in the same way as [Give each task its own branch](/docs/version-control/workstreams-and-branch-trees#give-each-task-its-own-branch) already recommends, so that a refactor and a feature change never share a diff. For a mechanical change that repeats across many files, such as renaming a function everywhere it is called, run it as a bounded loop instead of one large session. See [Run a bounded task in a loop](/docs/cli/non-interactive-mode#run-a-bounded-task-in-a-loop).

## Review a refactor differently from a feature change

A feature change needs you to judge whether the new behavior is correct, often by running the application. A refactor should not need that: if you cannot tell from the diff alone that behavior stayed the same, treat that as a sign that the change is not purely structural, and ask what else moved. Push back on any hunk in the diff that you cannot explain as a rename, an extraction, a move, or an equivalent rewrite.

If a refactor that you already merged turns out to have changed behavior, revert it in the same way as any other shared commit. See [Undo and recover changes](/docs/version-control/undo-and-recover-changes).

## Recommended skills for this stage

[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) is a Claude Code plugin that bundles, among others, a `code-simplification` skill and a `deprecation-and-migration` skill, both relevant to behavior-preserving restructuring and large mechanical migrations. Review it before you install it, in the same way as any plugin. See [Review a plugin before you install it](/docs/cli/plugins#review-a-plugin-before-you-install-it).

## Related prompts

- [Refactor code without changing its behavior](/docs/prompts/maintenance#refactor-code-without-changing-its-behavior)

## Further reading

- [Testing](/docs/workflows/testing)
- [Workstreams and branch trees](/docs/version-control/workstreams-and-branch-trees)
- [Non-interactive mode](/docs/cli/non-interactive-mode)
- [Undo and recover changes](/docs/version-control/undo-and-recover-changes)
- [Plugins](/docs/cli/plugins)
