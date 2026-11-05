---
title: "Headless and multi-agent Git workflows"
weight: 50
description: >-
  Run several Claude Code sessions against one repository, in the background or orchestrated as one task, without their Git state colliding.
tags:
  - under-review
---

This page covers sessions that you dispatch and supervise from your own computer, under your own Claude Enterprise sign-in, in the same way as [Non-interactive mode](/docs/cli/non-interactive-mode). It does not cover running Claude Code unattended on a shared server or in a CI/CD pipeline. See [CI/CD and repository automation](/docs/cli/non-interactive-mode#cicd-and-repository-automation) for why that is still a separate, open question.

Background sessions and the commands on this page are only in the Claude Code CLI. Claude Desktop does not have them.

More than one Claude Code process can touch the same repository at the same time, whether you start a second session yourself or Claude starts one for a subtask. Each one needs the same Git-level isolation as any other parallel workstream, whether you are watching it or not.

## Keep concurrent sessions out of each other's way

Give each session that runs at the same time its own worktree, in the same way as [Run parallel sessions in a worktree](/docs/version-control/workstreams-and-branch-trees#run-parallel-sessions-in-a-worktree) already describes, whether the session runs in your terminal or in the background.

Two sessions that share one working tree share one index and one checked-out branch. A commit from one session can pick up the files that the other staged but did not commit yet, and a branch switch in one session changes the files under the other mid-task. A worktree avoids this because each one has its own index and its own checked-out branch, even though all worktrees of a repository share the same history.

## Start a session in the background

Pass `--bg` or `--background` to start a session that keeps running without a terminal attached, under a supervisor process that outlives your shell. A background session is still a full conversation, so you cannot combine the flag with `-p`:

```shell
claude --bg --worktree auth-fix
```

Combine `--bg` with `--worktree`, as in the example, so that the session gets its own worktree before it edits anything. Without a worktree, Claude Code can refuse the session's edits to your main checkout.

If worktrees do not work well in your repository, for example a monorepo with submodules, a shallow clone, or a build that cannot run from more than one working directory at once, set `worktree.bgIsolation` to `"none"` instead. A background session then edits the working copy directly, with no worktree:

```json {filename=".claude/settings.json"}
{
  "worktree": {
    "bgIsolation": "none"
  }
}
```

With this setting, [Keep concurrent sessions out of each other's way](#keep-concurrent-sessions-out-of-each-others-way) still applies, but Claude Code can no longer enforce it for you. Do not run more than one background or foreground session at a time in a repository where you set this. For the complete behavior, see the [`worktree.bgIsolation` setting](https://code.claude.com/docs/en/settings-reference#worktree-bgisolation).

Manage a background session with the following commands:

| Command | Does |
| --- | --- |
| `claude agents` | Lists and monitors background sessions. Add `--json` to print them as an array for a script. |
| `claude attach <ID_OR_NAME>` | Attaches to a background session in your terminal. |
| `claude logs <ID_OR_NAME>` | Prints recent output from a background session, without attaching. |
| `claude stop <ID>` or `claude kill` | Stops a background session. |
| `claude respawn <ID>` | Restarts a background session with its conversation intact. |
| `claude rm <ID>` | Removes a background session from the list. Its transcript stays available through `--resume`. |

Claude Code sends a notification through your configured notification channel when a background session needs input, finishes, or fails, and fires the `Notification` hook with an `agent_needs_input` or `agent_completed` type. For the complete behavior, including agent view's live status footer, see [Background sessions](https://code.claude.com/docs/en/agent-view).

## Orchestrate several agents as one task

A task that splits into independent subtasks can run as several background sessions at once, each in its own worktree, instead of one session that works through the subtasks in turn:

1. Start one background session per subtask, each with its own `--worktree` name. A custom subagent with `isolation: worktree` in its frontmatter does the same thing for a subtask that one session delegates, as described in [Isolate subagents automatically](/docs/version-control/workstreams-and-branch-trees#isolate-subagents-automatically).
2. Monitor them with `claude agents --json` from a script, or with `claude agents` and the notifications described above if you are watching interactively.
3. Treat the result of each session as its own workstream. Review it, run its tests, and merge it in the same way as [Merge and clean up a workstream](/docs/version-control/workstreams-and-branch-trees#merge-and-clean-up-a-workstream) already describes, including conflict resolution when two agents touched the same file.

A background session follows the same push and merge rules as any other session. Running unattended is not a reason to skip the confirmation that [Confirm before Claude pushes or rewrites history](/docs/version-control/commits-and-pull-requests#confirm-before-claude-pushes-or-rewrites-history) describes. Keep `git push` in `permissions.ask` for a background session in the same way as for a foreground one.

## Confirm a session before you trust its result

A background session, or a subagent isolated in its own worktree, can report that it finished before you have looked at what it actually committed. Check the worktree yourself, or ask a foreground session to check it, before you merge:

```text
Check the worktree at <WORKTREE_PATH>, not this one.
Report:
- The current branch, and whether it has uncommitted or untracked changes
- Each commit that is not on <BASE_BRANCH>, with its subject line
- Whether the commits look complete for the task: <DESCRIPTION_OF_THE_TASK>
Do not change any files, and do not merge or push anything yet.
```

For the complete prompt, see [Verify that a background or subagent session committed its work](/docs/prompts/version-control#verify-that-a-background-or-subagent-session-committed-its-work).

## Clean up after background and multi-agent sessions

Claude Code holds a `git worktree lock` on a background session's worktree for as long as the session runs, so a cleanup sweep, or `git worktree remove` that you run yourself, leaves it in place until the session stops. Once the session has stopped, clean up its worktree in the same way as [Clean up the worktree](/docs/version-control/workstreams-and-branch-trees#clean-up-the-worktree) already describes for the CLI. Remove the session itself from the list with `claude rm <ID>`, or stop it first with `claude stop <ID>` if it is still running.

If an agent ran in a Docker sandbox instead of a worktree, clean it up the same way as any other sandbox. See [Manage the lifecycle of a Docker sandbox](/docs/general-tips/sandboxes#manage-the-lifecycle-of-a-docker-sandbox).

## Good practice

- **Name every background session and worktree.** An unnamed session is harder to find in `claude agents` and harder to resume later. Pass a name to both `--bg` and `--worktree`.
- **Read the result before you act on it, not only the notification.** A notification tells you that a session stopped, not that it stopped because it succeeded.
- **Keep the number of sessions that you run at once to what you can actually review.** Nothing stops you from starting ten background sessions, but you still read ten diffs before you merge ten branches.
- **Treat a background session's push the same as a foreground one's.** Running unattended does not relax the confirmation that a push or a force push needs.

## Related prompts

- [Verify that a background or subagent session committed its work](/docs/prompts/version-control#verify-that-a-background-or-subagent-session-committed-its-work)

## Further reading

- [Background sessions](https://code.claude.com/docs/en/agent-view)
- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Workstreams and branch trees](/docs/version-control/workstreams-and-branch-trees)
- [Commits and pull requests](/docs/version-control/commits-and-pull-requests)
- [Non-interactive mode](/docs/cli/non-interactive-mode)
- [Sandboxes](/docs/general-tips/sandboxes)
