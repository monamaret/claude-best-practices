---
title: "Build, test, and refactor a skill"
weight: 30
description: >-
  Take a skill from a first draft to one that is tested, deployed, and triggers correctly.
tags:
  - under-review
---

[Skills and plugins](/docs/general-tips/skills-and-plugins) covers writing one skill, testing it once by hand, and packaging it into a plugin. This page starts where that leaves off: testing a skill across more than one invocation, publishing it once it holds up, and fixing it when it triggers too often, too rarely, or for the wrong task.

{{< callout type="info" >}}
`claude plugin eval` requires a recent Claude Code version and is still an early-access feature. Its exact flags and output can change. Check [`claude plugin eval` reference](https://code.claude.com/docs/en/plugin-evals) for the current syntax before you rely on a command in this page.
{{< /callout >}}

## Test a skill with more than one invocation

Running a skill once with `/<name>` and once with a natural-language request, as described in [Test it](/docs/general-tips/skills-and-plugins#create-a-skill), confirms that the skill works at all. It does not tell you whether it works reliably, across the different ways a real task phrases the same request, or whether a later edit to the skill broke a case that used to pass.

`claude plugin eval` runs a skill, inside a plugin, against a written set of cases and reports a score for each one. Create the suite with `claude plugin eval init` in the plugin directory, which writes one `prompt.md` file per case under `evals/`:

```markdown {filename="release-helper/evals/drafts-from-merged-prs/prompt.md"}
---
name: drafts-from-merged-prs
---

Write release notes for what shipped since the last tag.
```

Add a grader next to the case to say what counts as a pass. A `tool_used` grader confirms Claude invoked the skill at all, which is the first thing to check when a skill does not trigger the way you expect:

```markdown {filename="release-helper/evals/drafts-from-merged-prs/graders/invoked.md"}
---
type: tool_used
tool: Skill
input_match: '"skill"\s*:\s*"(?:[\w-]+:)?write-release-notes"'
---
```

Run the suite from the plugin directory:

```shell
claude plugin eval ./release-helper
```

Each case runs more than once by default, with and without the skill available. The report shows a delta, not only a score. This separates "the skill helped" from "Claude would have done fine anyway." For a faster loop while you fix one failing case, run only that case, once, without the comparison arm:

```shell
claude plugin eval ./release-helper --case drafts-from-merged-prs --runs 1 --ablation none
```

Confirm with the full default run, more than one case and both arms, before you trust the result. A single fast run is for iterating on one fix, not for deciding that a skill is ready.

The run itself is isolated. It starts a fresh, temporary Claude Code session with only the plugin under test loaded, not your own settings, hooks, other plugins, or CLAUDE.md files. This keeps the score about the skill, not about your own setup. See [`claude plugin eval` reference](https://code.claude.com/docs/en/plugin-evals) for the complete grader types, including `regex`, `tool_order`, `file_exists`, and an `llm` grader for cases that a pattern cannot check. The same reference describes the JSON output format for gating a release on a score threshold.

## Deploy a tested skill through a plugin

Publishing a skill is the same procedure as publishing any other plugin: see [Publish the plugin in a marketplace](/docs/cli/plugins#publish-the-plugin-in-a-marketplace). Treat a passing eval suite as one condition for raising the plugin's `version` and publishing an update. A passing test suite is the same kind of condition for a code release. A skill with no eval suite can still work, but a later change to it has nothing to confirm that it still does.

## Watch how a skill actually triggers in real sessions

An eval suite checks cases that you thought to write. It does not tell you whether a skill is actually used, or whether it costs you context without anyone invoking it. Run `/skill-doctor` in a session to see, for each loaded skill, how much context it costs and whether anyone has invoked it recently. A skill that nobody has triggered in practice is a sign to check. Either its description does not match how people actually ask for the task, or nobody needs it anymore; see [Remove rules and skills that no longer apply](/docs/patterns/local-maintenance#remove-rules-and-skills-that-no-longer-apply) for the second case.

## Refactor a skill's description

Claude decides whether to load a skill by matching your request against its `description` field, so the description is almost always where a triggering problem lives, not the body of the skill. See [What a skill is and when Claude uses it](/docs/general-tips/skills-and-plugins#what-a-skill-is-and-when-claude-uses-it).

If a skill triggers for tasks it should not:

- Narrow the description to the specific task, instead of a general area. "Helps with code changes" matches almost anything; name the actual task.
- Set `disable-model-invocation: true` if the skill should run only when someone types its name.
- Set a `paths` pattern if the skill applies to a specific part of the repository, for example a frontend skill that should not load for backend work.

If a skill does not trigger for a task it should cover:

- Add the phrasing people actually use, not only the formal name of the task. "Commit changes to git, stage files, or create commits" catches more real requests than "Creates commits."
- Add a `when_to_use` field with a few concrete trigger phrases, next to the description.

Use the eval suite to confirm a description change worked, instead of guessing from one try. A case whose `tool_used` grader starts passing, or whose score moves closer to its with-skill arm, confirms the fix; a case that still fails after you expected it to pass tells you the description still does not cover that phrasing.

## Split an overgrown skill

Split a skill instead of continuing to patch one that has grown past one clear job. A few signs that a skill should become more than one:

- It covers more than one distinct task. A single `git-workflow` skill that handles committing, pushing, and reviewing a pull request is three skills that happen to share a topic, not one.
- Its body has grown past what a reader can hold in mind at once, commonly cited around 500 lines. Move reference material that Claude only sometimes needs into a supporting file instead of the main skill body.
- Part of it needs `disable-model-invocation: true` and part does not. A skill cannot be half-automatic.
- Different parts apply to different `paths`. A skill that covers both frontend and backend conventions loads for tasks where only one half is relevant.

Each resulting skill gets its own description and its own eval cases. This is often where a split pays for itself. A case that was hard to grade because it depended on which part of a combined skill ran becomes a clean pass or fail once the parts are separate.

## How this differs from maintaining guidelines

This page is about the first build of a skill and the tuning that happens while you get it working: writing it, testing it against more than one case, and fixing a description that does not trigger correctly yet. [Maintain local skills and guidelines](/docs/patterns/local-maintenance) is about what happens afterward, to a skill that already worked. That page keeps the skill accurate as the rest of the project changes around it.

## Good practice

- Write an eval case for every phrasing that you expect to trigger a skill, not only the one you tested by hand.
- Use a fast, single-run, single-case loop while you fix one failure, and confirm with the full suite before you trust the result.
- Fix the description first when a skill mistriggers. The body is rarely the problem.
- Split a skill along task boundaries, not along file size alone.

## Related prompts

- [Write an eval suite for a skill](/docs/prompts/maintenance#write-an-eval-suite-for-a-skill)
- [Diagnose why a skill is not triggering correctly](/docs/prompts/maintenance#diagnose-why-a-skill-is-not-triggering-correctly)
- [Package repository skills into a plugin](/docs/prompts/maintenance#package-repository-skills-into-a-plugin)

## Further reading

- [Skills](https://code.claude.com/docs/en/skills)
- [`claude plugin eval` reference](https://code.claude.com/docs/en/plugin-evals)
- [Plugins](/docs/cli/plugins)
- [Maintain local skills and guidelines](/docs/patterns/local-maintenance)
