---
title: "Build and release"
weight: 40
description: >-
  Use Claude in build and release pipelines.
---

A release has two kinds of work: the parts that you do yourself, at a keyboard, such as drafting release notes or reviewing a changelog, and the parts that could run unattended, such as a step inside a CI/CD pipeline. This guide only recommends the first kind so far.

## Where Claude Code fits in a release, and where it does not yet

Running Claude Code unattended in a CI/CD pipeline or a scheduled job on a shared server is still an open question in this guide, not a recommended workflow. The reasons are authentication, unattended permissions, cost attribution, and data handling, not a technical limitation. See [CI/CD and repository automation](/docs/cli/non-interactive-mode#cicd-and-repository-automation), and ask your Claude Enterprise administrators before you use Claude Code this way.

The rest of this page covers what you do yourself, locally, around a release: drafting its artifacts and reviewing them, with your own sign-in and your own judgment in the loop.

## Draft release notes and a changelog

A release note needs the same kind of input as a pull request description: the commits or merged pull requests since the last tag, summarized for a reader who did not follow the development. If you draft this for every release, write it once as a skill instead of repeating the prompt. [Skills and plugins](/docs/general-tips/skills-and-plugins#example-skill) walks through building exactly this skill, from the commit list to the finished notes.

For a one-off release, or before you have a skill for it, ask Claude directly with the same input. See [Draft release notes from merged pull requests](/docs/prompts/build-release#draft-release-notes-from-merged-pull-requests). Review the result against the actual changes before you publish it: a summary written from commit messages alone can miss a change that a vague commit message did not describe well.

## Confirm before Claude tags or publishes a release

A build or install command can publish an artifact or change a system outside the repository, which is why [Settings files](/docs/general-tips/settings-file#good-practice) does not add these commands to a default allow list. Treat a release tag and a publish step the same way as the push and merge confirmation in [Confirm before Claude pushes or rewrites history](/docs/version-control/commits-and-pull-requests#confirm-before-claude-pushes-or-rewrites-history): keep the commands in `permissions.ask`, so that Claude confirms with you even in a mode that otherwise approves its actions. A release tag is harder to meaningfully undo than most commits, because other systems and other people can consume it within minutes of the push. See [Undo and recover changes](/docs/version-control/undo-and-recover-changes) for what is and is not recoverable once that has happened.

## Recommended plugins for this stage

[wshobson/agents](https://github.com/wshobson/agents) has a `cicd-automation` plugin: CI/CD pipeline configuration, GitHub Actions and GitLab CI workflow setup, and automated deployment pipeline orchestration. This plugin helps you, in an ordinary interactive session, write and maintain your pipeline configuration files. It is not a way to run Claude Code unattended inside the pipeline itself, which is the separate, not-yet-recommended question above. Review it before you install it. See [Review a plugin before you install it](/docs/cli/plugins#review-a-plugin-before-you-install-it).

## Related prompts

- [Draft release notes from merged pull requests](/docs/prompts/build-release#draft-release-notes-from-merged-pull-requests)

## Further reading

- [Non-interactive mode](/docs/cli/non-interactive-mode)
- [Settings files](/docs/general-tips/settings-file)
- [Skills and plugins](/docs/general-tips/skills-and-plugins)
- [Plugins](/docs/cli/plugins)
- [Commits and pull requests](/docs/version-control/commits-and-pull-requests)
- [Undo and recover changes](/docs/version-control/undo-and-recover-changes)
