---
title: "Force human review"
weight: 40
description: >-
  Decide where a person must look before a change ships, and make that decision stick.
---

Claude Code gives you two different kinds of control over a session. A permission mode decides whether Claude asks before it acts. A review checkpoint decides whether a person looks at the result before it goes further, for example before a merge or a release. The first is a setting. The second is a decision about your workflow. It stays yours to make, even when the permission mode would have let the action through without asking.

This page is about the second kind. For the mechanism, see [Permission modes](https://code.claude.com/docs/en/permission-modes) and [Settings files](/docs/general-tips/settings-file).

## Where human review is required

Decide where review is required by what the action does, not by how much you trust the session that proposes it. A session that has been reliable all day can still make its first bad change in the next minute. Four categories tend to need a checkpoint:

- **Actions that are hard to reverse.** A force push, a dropped database table, a deleted branch, a rewritten commit history. See [Why force push and hard reset are denied by default](/docs/version-control/undo-and-recover-changes#why-force-push-and-hard-reset-are-denied-by-default) for one example of denying the action outright instead of only reviewing it.
- **Actions that are visible outside your own working copy.** A push, a merge, a comment on an issue, a message to a channel, a published release. Once it is visible to someone else, correcting a mistake costs more than preventing it.
- **Security-sensitive changes.** A change to `.claude/settings.json`, a hook, or a permission rule; a new MCP server or plugin; a dependency upgrade. These change what Claude, or something Claude grants access to, can do next, not only what it did this time.
- **Changes that cost money or affect shared infrastructure.** A cloud resource, a CI pipeline, a shared environment that other people depend on.

An action can need review for more than one of these reasons at once. A force push is both hard to reverse and visible to others. Treat that as a reason to require review, not as a reason to split the decision.

{{< callout type="info" >}}
A long, autonomous session raises the cost of skipping review, because more has to be undone if something goes wrong partway through. Review a background or multi-agent session's result before you trust it, in the same way as an interactive one. See [Confirm a session before you trust its result](/docs/version-control/headless-and-multi-agent-git#confirm-a-session-before-you-trust-its-result).
{{< /callout >}}

## Permission modes and approval prompts

The permission mode is the mechanism that asks. **Manual** mode asks before every edit and every command that changes something. **Plan** mode asks once, for the whole plan, before Claude edits anything. Other modes ask less, or not at all. See [Switch the permission mode](/docs/cli/common-tasks#switch-the-permission-mode) and [Permission modes](https://code.claude.com/docs/en/permission-modes) for the complete list and how to switch between them.

A mode that asks less is not the same decision as removing review. Use [`permissions.ask`](https://code.claude.com/docs/en/settings-reference#permissions-ask) to require a prompt for specific actions, such as `git push` or a deploy script, regardless of which mode the session is in. This lets a session run in a faster mode for everyday edits while still stopping for the actions in [Where human review is required](#where-human-review-is-required) above. See the `permissions.ask` row in [Common settings](/docs/general-tips/settings-file#common-settings).

A rule in `permissions.ask` or `permissions.deny` is a decision that you can commit to the repository. It then applies to everyone who works in it, not only to your own sessions. A review habit that lives only in your own memory does not transfer to a teammate, or to a non-interactive run. See [Confirm before Claude pushes or rewrites history](/docs/version-control/commits-and-pull-requests#confirm-before-claude-pushes-or-rewrites-history) for a worked example of committing this kind of rule.

For a checkpoint that a permission rule cannot express, for example a check that depends on the content of the change and not only on which tool runs, write a `PreToolUse` hook instead. A hook can inspect the actual command or edit and return `ask` or `deny` with a reason. See [Hooks](/docs/cli/hooks#common-hooks).

## Review checkpoints in plans and pull requests

Two points in a normal workflow already give you a natural place to put a checkpoint, before you add a new one:

- **The plan, before Claude edits anything.** Reviewing a plan is cheap, because nothing has changed yet. See [Review and approve a plan](/docs/workflows/planning#review-and-approve-a-plan).
- **The diff, before you commit or merge.** This is the last point where catching a problem costs only a comment, not a revert. See [Review the diff before you commit or merge](/docs/version-control/commits-and-pull-requests#review-the-diff-before-you-commit-or-merge) and [Check a staged diff before you commit](/docs/prompts/review#check-a-staged-diff-before-you-commit) for a prompt that gives you a second opinion on the diff.

Treat a large deviation from an approved plan as a reason to repeat the second checkpoint even if the first one already happened. A plan that you approved is not a guarantee that the diff still matches it.

A checkpoint that depends on a specific kind of artifact often has its own prompt already in the library. [Review a plugin before you install it](/docs/prompts/review#review-a-plugin-before-you-install-it), [Review the hooks in a repository before you trust it](/docs/prompts/review#review-the-hooks-in-a-repository-before-you-trust-it), and [Review a change to settings.json](/docs/prompts/review#review-a-change-to-settingsjson) cover three of the security-sensitive cases above. Use the general framework on this page to decide whether a new kind of action needs the same treatment. This saves you from writing a new review step each time.

## Good practice

- Decide what needs review by what the action does, not by how much you trust the session.
- Commit a `permissions.ask` rule for an action that always needs review, instead of relying on remembering to check.
- Review a plan before Claude edits, and review the diff again before you commit or merge, even when the plan was approved.
- Treat a background or multi-agent session's result the same as an interactive one: review it before you trust it.

## Further reading

- [Permission modes](https://code.claude.com/docs/en/permission-modes)
- [Settings files](/docs/general-tips/settings-file)
- [Hooks](/docs/cli/hooks)
- [Planning and specification](/docs/workflows/planning)
- [Commits and pull requests](/docs/version-control/commits-and-pull-requests)
