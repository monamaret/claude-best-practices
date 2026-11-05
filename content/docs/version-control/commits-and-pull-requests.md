---
title: "Commits and pull requests"
weight: 20
description: >-
  Get consistent commit messages and pull requests from Claude, and confirm before it changes shared history.
---

Claude can stage, commit, and push a change as part of a larger task, without you typing the Git commands yourself. This is convenient for routine work, but a commit message, a pull request description, and a push each outlive the session that created them. Set the conventions once, and confirm the actions that reach shared systems, so that Claude's commits read like the rest of your history.

## Write commit messages that fit your project

Claude writes a reasonable commit message on its own, but it does not know your project's convention unless you state it. Add the convention to your CLAUDE.md file, so that every session follows it without a reminder:

```markdown {filename="CLAUDE.md"}
## Commit messages

- Use the imperative mood: "Add retry logic", not "Added retry logic".
- Start the subject with a type: feat:, fix:, docs:, refactor:, test:, or chore:.
- Keep the subject to 72 characters or fewer. Wrap the body at 72 characters.
- Reference the ticket at the end of the body: Refs: <TICKET_ID>.
```

See [Guideline files](/docs/general-tips/guideline-files) for where to put this instruction, and how it differs from a settings file. To draft a message from a diff that you already staged, without starting a full session, see [Draft a commit message from the staged diff](/docs/prompts/maintenance#draft-a-commit-message-from-the-staged-diff).

{{< callout type="important" >}}
Do not ask Claude to amend a commit that you already pushed, or to rewrite a shared branch with `git rebase` or `git commit --amend`. A teammate's checkout, or a pull request's comment history, depends on the original commits. Create a new commit instead.
{{< /callout >}}

## Confirm before Claude pushes or rewrites history

A push, a merge, and a force push reach your remote repository, where a teammate, a pull request, or a pipeline can depend on the result before you notice a mistake. Require confirmation for these actions, and deny the ones that destroy history outright:

- Add `git push` to `permissions.ask`, so that Claude confirms with you even in a mode that otherwise approves commands.
- Add `git push --force` and `git reset --hard` to `permissions.deny`, so that no mode runs them.

See [Start with a minimum project settings file](/docs/general-tips/settings-file#start-with-a-minimum-project-settings-file) for the complete rules, with the matching PowerShell forms. A permission rule matches the command text that Claude writes, so pair it with a [hook](/docs/version-control/commit-hooks) if you need the rule to hold for every form of the command.

## Add the attribution that your team wants

Claude Code adds a line to each commit and each pull request description that it creates, to show that an agent wrote it. Your team can change this text or remove it with the `attribution.commit` and `attribution.pr` settings. See the `attribution` row in [Common settings](/docs/general-tips/settings-file#common-settings), and the [`attribution` setting](https://code.claude.com/docs/en/settings-reference#attribution) for the exact keys.

## Draft a pull request description from the branch

A pull request description needs the whole branch, not only the last commit. Ask Claude to read the commit log and the diff against your base branch, and to write the description in your team's format. For a prompt that does this from a script, with no session running, see [Summarize a branch before you open a pull request](/docs/prompts/review#summarize-a-branch-before-you-open-a-pull-request). The same prompt works when you ask it directly in an interactive session.

If your repository has a pull request template, tell Claude to use its sections instead of the default ones, and give it the path to the template.

## Review the diff before you commit or merge

Read the complete diff before you let Claude commit or merge it, in the same way as you would review a change from a teammate. A large or fast-moving session can touch more files than you expect. See [Force human review](/docs/patterns/human-review) for where to put this check in a larger workflow, and [Check a staged diff before you commit](/docs/prompts/review#check-a-staged-diff-before-you-commit) for a prompt that gives you a second opinion on the diff before Git creates the commit. To run that check automatically, every time, see [Commit hooks](/docs/version-control/commit-hooks).

## Good practice

- **State the convention once, in a guideline file.** A CLAUDE.md instruction survives `/clear` and applies to every teammate who works in the repository. Repeating it in chat only helps the current session.
- **Require confirmation for push, not only for the first one.** A session that pushes once without a prompt can push again later in the same way. Keep `git push` in `permissions.ask`.
- **Treat an agent's commit like any other teammate's commit.** Read it, and ask for a change, instead of accepting it because Claude produced it quickly.
- **Keep the attribution, unless your team has a reason to remove it.** It tells a future reader of the history, or of the pull request, that a person did not write the change by hand.

## Related prompts

- [Draft a commit message from the staged diff](/docs/prompts/maintenance#draft-a-commit-message-from-the-staged-diff)
- [Summarize a branch before you open a pull request](/docs/prompts/review#summarize-a-branch-before-you-open-a-pull-request)
- [Check a staged diff before you commit](/docs/prompts/review#check-a-staged-diff-before-you-commit)

## Further reading

- [Settings files](/docs/general-tips/settings-file)
- [Guideline files](/docs/general-tips/guideline-files)
- [Commit hooks](/docs/version-control/commit-hooks)
- [Force human review](/docs/patterns/human-review)
- [Non-interactive mode](/docs/cli/non-interactive-mode)
- [Settings reference](https://code.claude.com/docs/en/settings-reference)
