---
title: "Version control"
weight: 15
description: >-
  Prompts for branches, worktrees, merges, undoing changes, and background sessions.
---

## Resolve a merge conflict between two workstreams

**Use when:** Two branches or worktrees changed the same file, and you want Claude to resolve the conflict in one of them before you continue.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Workstreams and branch trees](/docs/version-control/workstreams-and-branch-trees#resolve-conflicts-between-workstreams)

```text
This branch has a merge conflict with <BASE_BRANCH>. Resolve it.
- Read both sides of each conflict, and the commits that produced them, before you choose a resolution.
- Keep the intent of both sides where they do not truly conflict. Do not silently drop either side's change.
- If you cannot tell which side should win, list the conflict and stop. Do not guess.
- Do not resolve a conflict by reverting a change to its state before this branch started.
After you resolve the conflicts, list each file that had one, with one sentence on how you resolved it. Do not commit yet.
```

**Adapt it:** Replace `<BASE_BRANCH>` with the branch that you merge into or rebase onto, for example `main`. Add `Run <TEST_COMMAND> after you resolve the conflicts.` and replace `<TEST_COMMAND>` with your test command, so that Claude checks its resolution before you review it. Review the complete diff yourself before you commit the resolution.

## Revert a shared commit without rewriting history

**Use when:** A commit that you already pushed, merged, or shared needs to be undone, and you want a new commit that reverses it instead of a rewritten branch.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Undo and recover changes](/docs/version-control/undo-and-recover-changes#revert-a-shared-commit-instead-of-resetting-it)

```text
Revert commit <COMMIT_SHA> with git revert. Do not use git reset or a force push.
If the commit is a merge commit, tell me which parent you treat as the
mainline before you revert it, and why.
After the revert, show me the diff that it produces before you push.
```

**Adapt it:** Replace `<COMMIT_SHA>` with the commit hash, or a short description if you do not have the hash yet, for example `the commit that added the retry loop`. Add `Write the commit message explaining why we are reverting it.` if your team expects a reason in the revert's commit message.

## Find and recover a lost commit with reflog

**Use when:** A commit seems to have disappeared after a reset, a deleted branch, or an amended commit, and you want to recover it without guessing at the lost work.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Undo and recover changes](/docs/version-control/undo-and-recover-changes#recover-a-commit-or-branch-that-looks-lost)

```text
I expected to see commit <DESCRIPTION_OF_THE_LOST_WORK> and I do not.
Read git reflog and find the commit. Do not run git reset, git checkout,
or any command that changes the working tree or the branches. Report
the commit hash and the command that a person would run to recover it.
```

**Adapt it:** Replace `<DESCRIPTION_OF_THE_LOST_WORK>` with what you remember about the commit, for example `my fix for the null check, from about an hour ago`. Review the commit that Claude finds before you act on it. Add `Also check if another local branch still points at it.` if you suspect the commit is still reachable from a branch that you have not deleted.

## Verify that a background or subagent session committed its work

**Use when:** A background session, or a subagent isolated in its own worktree, reported that it finished, and you want to confirm what it actually committed before you merge or trust the result.
**Works in:** Claude Code CLI
**Explained in:** [Headless and multi-agent Git workflows](/docs/version-control/headless-and-multi-agent-git#confirm-a-session-before-you-trust-its-result)

```text
Check the worktree at <WORKTREE_PATH>, not this one.
Report:
- The current branch, and whether it has uncommitted or untracked changes
- Each commit that is not on <BASE_BRANCH>, with its subject line
- Whether the commits look complete for the task: <DESCRIPTION_OF_THE_TASK>
Do not change any files, and do not merge or push anything yet.
```

**Adapt it:** Replace `<WORKTREE_PATH>` with the path that `claude agents` or the session's resume command reported. Replace `<BASE_BRANCH>` with the branch the worktree started from, and `<DESCRIPTION_OF_THE_TASK>` with what you asked the session to do. Run this from your own foreground session, so that the check does not run inside the worktree that it is checking.
