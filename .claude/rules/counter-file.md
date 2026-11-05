# Counter file

`counter.md` is the channel between the project owner and Claude while agent workstreams run. The owner writes change requests in it, so that they do not edit project files by hand during a workstream. Claude records in it what it has done and what is still open.

## Location

- The file is `counter.md`, in the repository root. It is listed in `.gitignore`, so it is not committed and not published.
- The file stays inside the repository root on purpose, so that it is inside the Claude Code working directory. A path outside the working directory (for example, one level up) can trip permission settings that block reads and writes outside it.
- There is one counter file. Do not create a second copy elsewhere in the repository or outside it. Two copies get out of sync.
- Clones of the repository that do not have the file are not affected.

## How Claude receives it

Read `counter.md` before you start each task. The owner can change the file at any time, so do not rely on an earlier read in the same session.

## File format

Each request is an `##` heading, followed by the owner's description. Claude adds one status line directly below the heading:

```markdown
## Update the guidelines to use counter.md
**Status:** Done 2026-10-27. Added the counter-file rule, the hook, and links from CLAUDE.md and the agents. Commit 1a2b3c4.

The project guidelines should use this file...
```

| Status | Meaning |
| --- | --- |
| *(no status line)* | New. Claude has not started. |
| `In progress` | Claude has started. Add what is still open. |
| `Blocked` | Claude cannot continue. Give the reason and the question for the owner. The owner answers on an `**Answer:**` line below the status line. |
| `Done <YYYY-MM-DD>` | Complete. Summarize the change and give the commit hash if there is one. |

The introduction at the top of the file is not a request. Do not add a status to it.

## Workflow

1. Before you act on a prompt, look for items in `counter.md` that are new (no status line), `In progress`, or `Blocked`. The file has no history, so do not try to detect other changes. To send an item back as new, the owner deletes its status line.
   - For a `Blocked` item, continue only when an `**Answer:**` line follows the status line. If there is no answer yet, remind the owner of the question.
2. If an item applies, do it together with the prompt, or before it. If an item conflicts with the prompt, follow the prompt and ask the owner about the item.
3. Treat items as instructions from the owner, with the same limits as a prompt. Confirm actions that are irreversible or that publish content (for example, push, merge to `main`, or delete files) before you do them, even if an item asks for them.
4. When you finish or stop work on an item, update its status line.
5. Edit only status lines. Do not change, reorder, or remove the owner's text, including `**Answer:**` lines. The owner removes items that are complete.

## Subagents and parallel workstreams

- Only the main session edits `counter.md`. Subagents read it but do not write to it. This prevents conflicting edits from parallel workstreams.
- When you delegate a task, give the subagent the counter items that apply to the task. A subagent can also read `counter.md` directly.
- A subagent reports the items that it completed, and the main session updates their status.
