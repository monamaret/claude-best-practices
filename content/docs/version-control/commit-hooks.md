---
title: "Commit hooks"
weight: 30
description: >-
  Integrate Git commit hooks with the changes that Claude makes.
---

A Git hook and a [Claude Code hook](/docs/cli/hooks) both run a command automatically, but at different points, and they see different things. Pick the one that matches what the check must catch.

## Git hooks and Claude Code hooks are different

| | Git hook | Claude Code hook |
| --- | --- | --- |
| Runs on | A Git operation, such as a commit, a push, or a checkout | A Claude Code session event, such as a tool call or the end of a turn |
| Sees | Every commit or push, whatever created it: you, a teammate, a GUI client, or Claude | Only the tool calls that Claude Code itself makes |
| Stored in | `.git/hooks/` in your local clone. Git does not clone or push this directory. | `.claude/settings.json`, or a script in `.claude/hooks/` that it references |
| Reaches your team when | You commit a setup script, or a tool such as Husky, that installs it in each clone | You commit the settings file. Every teammate gets it with their next pull. |

The distinction matters most for a check that must hold regardless of who or what makes the commit. A Claude Code hook cannot see a commit that you make yourself in a terminal, or one that a teammate makes without Claude. A Git hook sees every commit, because Git runs it as part of the commit itself.

## Run a check on every commit, regardless of who makes it

Use a Git hook for a check that must hold even when Claude is not involved. A `pre-commit` hook that pipes the staged diff into `claude -p` gives you a second opinion on the diff before Git creates the commit, whether the diff came from Claude or from you. This guide already covers that hook in full, with the complete script and the environment variables that control it. See [Check the staged diff in a pre-commit hook](/docs/cli/non-interactive-mode#check-the-staged-diff-in-a-pre-commit-hook).

A Git hook does not need to call Claude at all. The example later on this page enforces a commit message convention with a plain script, because the check is mechanical and does not need judgment.

### Share a Git hook with your team

`.git/hooks/` is not part of the repository, so a hook that you save there stays on your computer only. To share a hook, commit it to a tracked directory, and point Git at that directory once per clone:

```shell
git config core.hooksPath .githooks
```

This setting applies to every hook in `.githooks/`, for the clone where you run it. If the repository already uses `.git/hooks/` for something else, or already sets `core.hooksPath` to a different directory, add your hook there instead of overwriting the setting. Commit the `.githooks/` directory and tell your team to run the command once.

## Run a check only on Claude's own actions

Use a Claude Code hook for a rule that only needs to hold while Claude works, such as blocking a command before Claude runs it, or formatting a file right after Claude edits it. This guide already covers both patterns, with complete scripts. See [Block unsafe commands](/docs/cli/hooks#block-unsafe-commands) and [Format and lint after each edit](/docs/cli/hooks#format-and-lint-after-each-edit).

A Claude Code `PreToolUse` hook can also inspect a `git commit` command before Claude runs it, in the same way as the block-unsafe-commands example inspects a delete or a force push. This stops Claude from writing a bad commit, but not a teammate who commits from their own terminal. For a rule that must hold for every commit, use the Git hook instead, or use both.

## Use both together

A Claude Code hook and a Git hook do not conflict, because they run at different points for different reasons. Pair them when you want the rule to hold even if a teammate disables Claude Code's hooks, works in a tool other than Claude Code, or commits a change that Claude did not make. The Claude Code hook gives Claude fast feedback inside the session. The Git hook is the backstop that holds regardless of what produced the commit.

## Example: enforce a commit message convention

[Commits and pull requests](/docs/version-control/commits-and-pull-requests#write-commit-messages-that-fit-your-project) puts a commit message convention in CLAUDE.md, so that Claude follows it. A guideline file is advisory, so a session can still forget it, or a teammate's commit never reads it at all. A `commit-msg` hook checks the parts of the convention that a script can verify, for every commit:

```shell {filename=".githooks/commit-msg"}
#!/bin/sh
# Enforce the commit message convention from CLAUDE.md.
# Checks only the parts that a script can verify: the type prefix and the
# subject length. Imperative mood and the ticket reference still rely on
# CLAUDE.md and on review.

message_file="$1"
subject=$(head -n 1 "$message_file")

# Git writes these subjects itself. Do not block them.
case "$subject" in
  "Merge "*|"Revert "*) exit 0 ;;
esac

if ! printf '%s' "$subject" | grep -Eq '^(feat|fix|docs|refactor|test|chore): .+'; then
  echo "commit-msg: start the subject with feat:, fix:, docs:, refactor:, test:, or chore:." >&2
  echo "commit-msg: subject was: $subject" >&2
  exit 1
fi

if [ "${#subject}" -gt 72 ]; then
  echo "commit-msg: the subject is ${#subject} characters. Keep it to 72 or fewer." >&2
  exit 1
fi
```

A `commit-msg` hook receives the path to a file with the message that Git already collected, so it checks a message that you typed in an editor in the same way as one that Claude passed with `git commit -m`. A `PreToolUse` hook on the Claude Code side cannot do this: it only sees the command that Claude is about to run, so it misses a message that an editor collects afterward.

{{< tabs >}}
{{< tab name="Windows" >}}
Git for Windows runs this script with its own shell, so it works from any terminal. Save it with the exact name `commit-msg`, with no extension, in the `.githooks` directory at the root of the repository:

```powershell
New-Item -ItemType Directory -Force .githooks | Out-Null
Copy-Item <DOWNLOAD_PATH>\commit-msg .githooks\commit-msg
git config core.hooksPath .githooks
```
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
mkdir -p .githooks
cp <DOWNLOAD_PATH>/commit-msg .githooks/commit-msg
chmod +x .githooks/commit-msg
git config core.hooksPath .githooks
```
{{< /tab >}}
{{< /tabs >}}

`<DOWNLOAD_PATH>` is the directory where you saved the script. Commit `.githooks/commit-msg` and ask your team to run `git config core.hooksPath .githooks` once. To test it, try a commit with a subject that does not start with one of the types, and confirm that Git rejects it.

## Good practice

- **Keep a Git hook fast.** It runs on every commit, and a slow hook makes every commit feel slow, for everyone on the team.
- **Fail with a reason that says what to fix.** A hook that only prints "rejected" sends you back to read the script. A hook that prints the rule, and the value it saw, does not.
- **Let a hook warn before it blocks.** Ship a new check as a warning first, and switch it to a blocking exit code once your team trusts it. The pre-commit example in [Non-interactive mode](/docs/cli/non-interactive-mode#check-the-staged-diff-in-a-pre-commit-hook) follows this pattern.
- **Keep `core.hooksPath` to one directory per repository.** A second tool that also sets it overwrites your value, and neither warns you.

## Related prompts

- [Write a hook for a repeated check](/docs/prompts/maintenance#write-a-hook-for-a-repeated-check)
- [Review the hooks in a repository before you trust it](/docs/prompts/review#review-the-hooks-in-a-repository-before-you-trust-it)

## Further reading

- [Hooks](/docs/cli/hooks)
- [Non-interactive mode](/docs/cli/non-interactive-mode)
- [Commits and pull requests](/docs/version-control/commits-and-pull-requests)
- [Guideline files](/docs/general-tips/guideline-files)
- [githooks](https://git-scm.com/docs/githooks) in the Git documentation
