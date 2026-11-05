---
title: "Undo and recover changes"
weight: 40
description: >-
  Choose the right way to undo a change that Claude made, from an uncommitted edit to a change that you already pushed.
---

Claude can change many files before you have a chance to stop it, so undoing a mistake is as routine a task as making the change in the first place. Git gives you several ways to undo a change, and they are not interchangeable: the right one depends on how far the change has traveled, from your working tree to a commit that a teammate has already built on. Choose the one that matches, so that an undo on your side does not become a surprise on someone else's.

## Checkpoints undo a session, not a repository

Claude Code creates a checkpoint before each prompt that you send, and `/rewind` can restore the files, the conversation, or both to an earlier checkpoint. A checkpoint only tracks file edits in the current session. It does not reverse a push, a merge, a package installation, or a change that a shell command made outside an edit. See [Rewind to a checkpoint](/docs/cli/common-tasks#rewind-to-a-checkpoint) for what each restore option covers.

Once a change is a commit, undo it with Git instead of `/rewind`, even if Claude made the commit in the same session that you want to rewind.

## Choose the undo that matches how far the change traveled

| Where the change is | Command | Why it is safe there |
| --- | --- | --- |
| Uncommitted, in your working tree | `git restore <FILE>` | Only your working tree changes. No commit or remote is affected. |
| Staged, not yet committed | `git restore --staged <FILE>` | Unstages the file. The working tree keeps the edit. |
| Committed, not pushed or shared | `git reset` | No other checkout depends on the commit yet, so moving your branch pointer back does not affect anyone else. |
| Pushed, merged, or shared with anyone else | `git revert` | Adds a new commit that undoes the change, instead of removing a commit that another checkout, a pull request, or a pipeline already depends on. |

Tell Claude which of these you want, instead of asking it to "undo" a change in general terms. "Undo" does not say whether the change is still local or already shared, and the two cases need a different command.

## Revert a shared commit instead of resetting it

[Commits and pull requests](/docs/version-control/commits-and-pull-requests) already recommends a new commit over an amend or a rebase once you push a change. The same reasoning applies to undoing one: once a commit is on a shared branch, revert it forward with a new commit, and do not move the branch backward with `git reset` or a force push. A reset or a force push on a shared branch can make a teammate's checkout, or an open pull request, diverge from the remote in a way that their next pull does not resolve cleanly.

Name the commit when you ask Claude to revert it, so that it reverts the one that you mean:

```text
Revert commit <COMMIT_SHA> with git revert. Do not use git reset or a force push.
```

A merge commit needs the `-m` flag to tell Git which parent is the mainline. Ask Claude to confirm which parent before it reverts a merge commit, so that it reverts the change and not the mainline itself. For the complete prompt, see [Revert a shared commit without rewriting history](/docs/prompts/version-control#revert-a-shared-commit-without-rewriting-history).

## Recover a commit or branch that looks lost

Git keeps a local record of where your branches and `HEAD` have pointed, called the reflog, even after a `reset`, a deleted branch, or an amended commit. If a commit seems to have disappeared, ask Claude to read the reflog and find it there, rather than recreate the work by hand:

```text
I expected to see commit <DESCRIPTION_OF_THE_LOST_WORK> and I do not.
Read git reflog and find the commit. Do not run git reset, git checkout,
or any command that changes the working tree or the branches. Report
the commit hash and the command that a person would run to recover it.
```

Review the commit that Claude finds before you act on it. For the complete prompt, see [Find and recover a lost commit with reflog](/docs/prompts/version-control#find-and-recover-a-lost-commit-with-reflog).

The reflog is local to your clone, not shared with a push, so it recovers work only on the computer where the commit happened. Git also expires reflog entries over time, so recover the commit soon after you notice it is missing.

## Recover from a bad push or merge

- **You pushed a commit that should not have gone out.** Push a revert commit, as described above. Do not force push to remove it, even if you are confident that no one has based work on it yet. See [Confirm before Claude pushes or rewrites history](/docs/version-control/commits-and-pull-requests#confirm-before-claude-pushes-or-rewrites-history).
- **A merge produced a result that you do not want, and you have not pushed it.** The merge commit is still local, so `git reset` to the commit before the merge is safe, in the same way as any other unshared commit.
- **A merge produced a result that you do not want, and you already pushed it.** Revert the merge commit, with the `-m` flag described above.

## Why force push and hard reset are denied by default

A force push can overwrite commits on the remote that another checkout already has, and `git reset --hard` discards uncommitted changes in your working tree with no prompt and no way back. [Settings files](/docs/general-tips/settings-file#start-with-a-minimum-project-settings-file) lists both commands in `permissions.deny`, so that no permission mode runs them. [Hooks](/docs/cli/hooks#block-unsafe-commands) shows a hook that blocks the same two commands for every form that Claude might write. If you have a specific reason to run either command, for example cleaning up a personal branch that no one else uses, run it yourself in your terminal instead of asking Claude to.

## Good practice

- **Name the commit, the file, or the branch, not only the problem.** "Undo the last commit" is ambiguous about whether the commit is shared. "Revert commit `<SHA>`" is not.
- **Check `git log` and `git status` after the undo, not only before it.** Confirm that Claude reverted or reset the commit that you meant, and nothing else.
- **Treat a reset on a shared branch the same as a force push.** Confirm with your team before you move a shared branch backward, even if the command itself only touches your own checkout first.
- **Reach for `/rewind` only for edits in the current session.** Once a change is a commit, undo it with Git, so that the undo is part of the same history as the original change.

## Related prompts

- [Revert a shared commit without rewriting history](/docs/prompts/version-control#revert-a-shared-commit-without-rewriting-history)
- [Find and recover a lost commit with reflog](/docs/prompts/version-control#find-and-recover-a-lost-commit-with-reflog)

## Further reading

- [Rewind to a checkpoint](/docs/cli/common-tasks#rewind-to-a-checkpoint) and [Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Commits and pull requests](/docs/version-control/commits-and-pull-requests)
- [Settings files](/docs/general-tips/settings-file)
- [Hooks](/docs/cli/hooks)
- [git-revert](https://git-scm.com/docs/git-revert), [git-reset](https://git-scm.com/docs/git-reset), and [git-reflog](https://git-scm.com/docs/git-reflog) in the Git documentation
