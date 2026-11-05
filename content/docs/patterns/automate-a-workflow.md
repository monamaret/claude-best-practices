---
title: "Automate a recurring workflow"
weight: 60
description: >-
  Package a workflow's repeatable steps so that triggering it once is most of the work.
tags:
  - under-review
---

[Develop a new feature](/docs/workflows/feature-development) walks through one feature with the setup already in place. A hook runs the tests. A hook checks the commit message. A rule asks before a push. Each piece removes one prompt from the session. Automating a workflow means combining the pieces, so that starting the workflow is most of what you do. The parts that still need you are exactly the ones that [Force human review](/docs/patterns/human-review) says must stay.

## What "fully automated" means here

Automation removes the steps that need no judgment. It does not remove the checkpoints that do. The table below reuses the stages from [Develop a new feature](/docs/workflows/feature-development):

| Stage | Once automated | Why |
| --- | --- | --- |
| Run the tests | A Claude Code `Stop` hook runs them after every turn. See [Run the tests automatically when Claude finishes a turn](/docs/workflows/testing#run-the-tests-automatically-when-claude-finishes-a-turn). | Passing or failing needs no judgment. |
| Check the commit message | A Git `commit-msg` hook, not a Claude Code hook, rejects one that does not fit. See [Example: enforce a commit message convention](/docs/version-control/commit-hooks#example-enforce-a-commit-message-convention). | The convention is mechanical. |
| Review the diff | Stays a checkpoint. See [Review the diff before you commit or merge](/docs/version-control/commits-and-pull-requests#review-the-diff-before-you-commit-or-merge). | A diff can be larger, or different, than you expected. |
| Push | Stays a checkpoint through `permissions.ask`. See [Confirm before Claude pushes or rewrites history](/docs/version-control/commits-and-pull-requests#confirm-before-claude-pushes-or-rewrites-history). | Visible to everyone once it reaches the remote. |

The first two rows are already solved by hooks that this guide covers elsewhere. The rest of this page covers the part that is not solved yet. That part is starting the whole sequence with one action, instead of writing the same prompt again each time.

## Package the trigger as a skill

Turn the prompt that you repeat into a skill, so that starting the workflow is typing one name:

```markdown {filename=".claude/skills/ship/SKILL.md"}
---
name: ship
description: >-
  Runs the commit and pull request description steps for the current
  branch. Use when the user says to ship or finish the current change.
disable-model-invocation: true
---

## Instructions

1. Run the test command once, to confirm that the branch is in the state
   the Stop hook already checked.
2. Stage the changes and commit, following the commit message convention
   in CLAUDE.md. The commit-msg hook rejects a message that does not fit.
3. Read the commit log and the diff against the base branch. Write a
   pull request description from them to pr-description.md at the
   repository root. Do not open a pull request.
```

Set `disable-model-invocation: true` because the skill commits. Claude should run it only when you type `/ship`, not on its own judgment. See [Create a skill](/docs/general-tips/skills-and-plugins#create-a-skill) and [Turn a repeated procedure into a skill](/docs/prompts/maintenance#turn-a-repeated-procedure-into-a-skill).

The skill stops after the commit and the draft description. Opening the pull request and pushing stay separate actions that you start yourself. Both are visible outside your own working copy, which [Where human review is required](/docs/patterns/human-review#where-human-review-is-required) treats as a reason to keep a checkpoint.

## Run the mechanical part without a live session

This section is specific to the Claude Code CLI. Claude Desktop does not have a non-interactive mode.

Some sessions do not need you watching them. Once you already know a branch is ready, you can run the `ship` skill and move on to something else while it runs. Use `claude -p` for this, and give the run only the permissions that its steps need:

```shell
claude -p "/ship" --permission-mode dontAsk --allowedTools "Read,Write,Bash(npm test *),Bash(git log *),Bash(git diff *),Bash(git add *),Bash(git commit *)"
```

Replace `Bash(npm test *)` with your own test command. `Write` lets the run create `pr-description.md`; `git log` and `git diff` let it read what the description needs. `git push` is not in the allow list. A run that tried it would be denied, the same as any other call that needs a prompt when nobody is there to answer it. See [Set permissions for an unattended run](/docs/cli/non-interactive-mode#set-permissions-for-an-unattended-run).

{{< callout type="warning" >}}
Running this the same way after every merge, with no person starting it, is repository automation, not a session that you dispatch yourself. That use is still under review in this guide. See [CI/CD and repository automation](/docs/cli/non-interactive-mode#cicd-and-repository-automation) before you wire a workflow like this one into a pipeline or a scheduled job.
{{< /callout >}}

## Decide what never gets automated

Run every new candidate for automation through the four categories in [Where human review is required](/docs/patterns/human-review#where-human-review-is-required) before you package it as a skill or a hook. An action that is hard to reverse, visible outside your working copy, security-sensitive, or costly stays a checkpoint. This holds regardless of how automated the rest of the workflow becomes.

## Good practice

- Automate the steps that need no judgment. Leave the steps that need judgment as checkpoints.
- Package a repeated prompt as a skill once you have typed it more than once.
- Give a non-interactive run only the permissions that its steps need. An action that you did not allow stays denied.
- Review the result of an automated run the same way as an interactive one. Automation changes who starts the work, not who checks it.

## Related prompts

- [Turn a repeated procedure into a skill](/docs/prompts/maintenance#turn-a-repeated-procedure-into-a-skill)
- [Summarize a branch before you open a pull request](/docs/prompts/review#summarize-a-branch-before-you-open-a-pull-request)

## Further reading

- [Develop a new feature](/docs/workflows/feature-development)
- [Force human review](/docs/patterns/human-review)
- [Skills and plugins](/docs/general-tips/skills-and-plugins)
- [Non-interactive mode](/docs/cli/non-interactive-mode)
- [Commit hooks](/docs/version-control/commit-hooks)
