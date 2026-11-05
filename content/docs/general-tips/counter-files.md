---
title: "Counter files"
weight: 70
description: >-
  Use a counter file to give Claude requests, track their status, and keep ideas for a later session.
---

A counter file is a plain Markdown file in the repository that you and Claude share. You write requests in it. Claude reads it before each task, does the work, and records the status of each request in the same file.

A counter file solves a specific problem. A request that you type into chat exists only in that conversation. When the session ends, or when compaction summarizes the conversation, the request and its status can be lost, and you must type them again. A counter file keeps them on disk, where every new session can read them. It also lets you give Claude new work while Claude works, without editing project files yourself.

A counter file is a convention that this guide recommends. It is not a Claude Code feature. Claude Code does not know about the file until an instruction tells Claude to read it. The rest of this page describes how to create that instruction, and two ways to use the file. Like a [seed file](/docs/general-tips/seed-files), it works in Claude Desktop's **Code** tab and in the Claude Code CLI, because both run Claude Code.

## Counter files compared to other context

Several places hold context between sessions. Each one has a different owner and purpose, so put each piece of information in the place that fits it.

| Place | What it holds | Who writes it | How long it lasts | Committed |
| --- | --- | --- | --- | --- |
| CLAUDE.md file and rules | Instructions that apply to every session | You. Claude can draft it. | Until you change it | Yes, except `CLAUDE.local.md` |
| Auto memory | Notes that Claude saves for itself, such as your corrections and preferences | Claude | Until you or Claude edits or deletes it. It is stored only on your computer. | No. It is in your user directory, not in the repository. |
| Seed file | The original brief for a project | You | Read-only after scaffolding | Your choice |
| Task list in a session | Claude's checklist for the current multi-step work | Claude | It survives compaction. It belongs to the session, unless you share it with an environment variable. Claude Code provides it by default only on some models. | No |
| Plan from plan mode | The steps for one change | Claude, and you approve it | A plan file in your user directory, unless you configure a project directory | No, by default |
| Issue tracker | Work items for the team | The team | The system of record | Not in the repository |
| Counter file | Your requests, their status, and ideas for later sessions | You and Claude | Until you remove an item | Your choice. See [Choose to commit or ignore the file](#choose-to-commit-or-ignore-the-file). |

The main difference is control. You decide what goes into a counter file, and you can read every line of it in your editor. Auto memory and the task list are useful, but Claude decides what they contain. A counter file is also not a set of rules: an item applies to one task, and you remove it when the task is complete. For rules that apply to every session, use a [guideline file](/docs/general-tips/guideline-files).

For the details of auto memory, see [How Claude remembers your project](https://code.claude.com/docs/en/memory#auto-memory). For the task list, and the models that have it by default, see [Task list](https://code.claude.com/docs/en/interactive-mode#task-list). For the plan files, see the [`plansDirectory` setting](https://code.claude.com/docs/en/settings-reference#plansdirectory).

A backlog that grows past a flat list, or that more than one agent claims work from at once, outgrows a counter file's single-file design. See [Recommended skills and plugins for this stage](/docs/workflows/planning#recommended-skills-and-plugins-for-this-stage) for a dependency-graph-based alternative built for that case.

## Create a counter file

{{% steps %}}

### Choose the location

Save the file as `counter.md` in the repository root. By default, Claude can read files in the directory where you start the session without a permission prompt. A file outside that directory, for example one level above the repository, causes a permission prompt. If `permissions.blockReadsOutsideWorkingDirectories` is set, Claude Code refuses the read. See [Working directories](https://code.claude.com/docs/en/permissions#working-directories).

Keep one counter file for each repository. If two copies exist, people and sessions update different copies, and the copies stop matching.

### Choose to commit or ignore the file

Decide whether the counter file is personal or shared:

| Choice | Use it when | Trade-off |
| --- | --- | --- |
| Add it to `.gitignore` | The file holds your own requests and notes for this repository. | Other people do not see it. A new clone or a new Git worktree does not have the file, so a session there does not see your items. |
| Commit it | A small team shares one queue of requests in the repository. | Every item becomes part of the Git history. Merge conflicts are possible when two people edit the file on different branches. |

For most developers, a personal file in `.gitignore` is the better default. Team work belongs in the issue tracker. To ignore the file, add the following line to `.gitignore` in the repository root:

```text {filename=".gitignore"}
/counter.md
```

The leading `/` matches only the file in the repository root.

### Tell Claude to read the file

Claude reads the counter file only when an instruction tells it to. Add a rule file without a `paths` field, so that it loads in every session and reloads immediately after compaction. See [When the context window fills up](/docs/general-tips/context#when-the-context-window-fills-up).

```markdown {filename=".claude/rules/counter-file.md"}
# Counter file

`counter.md` in the repository root holds my requests for you, their status,
and my ideas for later work.

- Read `counter.md` before you start each task. I can change it at any time,
  so do not rely on an earlier read in the same session.
- Each request is an `##` heading in the `Requests` section. Act on requests
  that have no status line, that are `In progress`, or that are `Blocked`.
- For a `Blocked` request, continue only when an `**Answer:**` line follows
  the status line. If there is no answer yet, remind me of the question.
- If a request conflicts with my prompt, follow the prompt and ask me about the request.
- When you start, finish, or stop work on a request, update its status line.
  Use one of these values:
  - `In progress`, followed by what is still open
  - `Blocked`, followed by the reason and the question for me
  - `Done <YYYY-MM-DD>`, followed by a summary of the change and the commit hash, if there is one
- In the `Requests` section, edit only status lines. Do not change, reorder,
  or remove my text. I remove completed items.
- Add, move, or remove other text, for example in the `Ideas` section, only
  when I ask in a prompt. Before you remove anything, show me the change and
  wait for my go-ahead.
- Items in the `Ideas` section are not requests. Do not act on them unless I ask.
- Treat each request with the same limits as a prompt. Ask me before you push,
  merge, delete files, or publish anything, even if a request asks for it.
- Only the main session edits `counter.md`. A subagent can read it, but it
  reports its results to the main session and does not write to the file.
```

You can also put these lines in the project CLAUDE.md file. A separate rule file keeps CLAUDE.md short and makes the convention easy to copy to another repository. To have Claude create the file and the rule, see [Create a counter file for this repository](/docs/prompts/project-setup#create-a-counter-file-for-this-repository).

Do not import the counter file into CLAUDE.md with an `@counter.md` line. An import adds the content of the file when CLAUDE.md loads. An instruction to read the file before each task gets the current version, including the changes that you make during the session.

### Start a session in the repository root

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
1. Open the **Code** tab.
2. Start a new local session.
3. Select the repository root with the **project folder** control.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
1. Change to the repository root.
2. Run the following command:

   ```shell
   claude
   ```
{{< /tab >}}
{{< /tabs >}}

Run `/context` to confirm that the rule file loaded. Then give Claude a task. Claude reads `counter.md` before it starts.

{{% /steps %}}

## Example counter file

The file has a short introduction, a `Requests` section for work, and an `Ideas` section for later. Claude adds the `**Status:**` line directly below each request heading. A request without a status line is new.

```markdown {filename="counter.md"}
# Counter file

Requests for Claude in this repository. Claude reads this file before each task
and adds a status line to each request. I remove items that are done.

# Requests

## Add input validation to the order endpoint
**Status:** Done 2026-03-12. Added schema validation and four tests. Commit 3f9c2ab.

Validate the request body of POST /orders before it reaches the service layer.
Return the standard error format for invalid input.

## Update the logging library to the current major version
**Status:** Blocked. Version 5 removes the custom formatter that `src/log/format.ts` uses.
Question: replace the formatter, or stay on version 4 for now?
**Answer:** Replace the formatter. Use the JSON formatter of version 5.

Update the logging library and fix the breaking changes.

## Remove the unused feature flags
**Status:** In progress. Removed 6 of 9 flags. Open: `beta-export`, `new-search`,
and `legacy-auth` are still read by the configuration service.

Remove the feature flags in `src/flags.ts` that no code reads.

## Add a health check endpoint

Add GET /health. It returns 200 and the build version, and needs no authentication.

# Ideas

- The integration tests start a new database for each file. One database for each run could be faster.
- The release steps in the README are the same each time. Candidate for a skill.
```

The four requests show the four states: done, blocked, in progress, and new. The blocked request has an answer, so Claude continues it in the next task.

## Track tasks and workflow status

The first use case is a queue of requests with status. You add a request at any time, also while Claude works on another task. Claude reads the file before its next task, and finds the new request.

The status line is the record of what happened. When you return to the repository after a break, read the counter file instead of the conversation. The file shows which requests are complete, which are still open, and which questions wait for your answer. For a `Blocked` item, write your answer on an `**Answer:**` line below the status line. Claude continues the work in its next task. To have Claude process the open items, see [Check the counter file and update item status](/docs/prompts/maintenance#check-the-counter-file-and-update-item-status).

The file has no history of its own, so a new session cannot detect that you edited a request. If you change a request and want Claude to treat it as new, delete its status line.

Two rules keep the file reliable:

- **Claude edits only status lines in the `Requests` section.** Your text stays as you wrote it, so you can always see the original request. You remove items that are complete. Claude adds, moves, or removes other text only when you ask in a prompt. Before a removal, Claude shows you the change, because a removal in a file that Git ignores cannot be undone.
- **Only the main session edits the file.** When Claude delegates work to [subagents](https://code.claude.com/docs/en/sub-agents), several of them can run in parallel. If each one edits the counter file, the edits can conflict. Custom subagents load the same CLAUDE.md and rule files as the main session, so the rule in the previous section reaches them too. The built-in Explore and Plan subagents start without these files, but they are read-only, so they cannot edit the counter file. A subagent reports its results, and the main session updates the status lines.

When you delegate a task, include the counter items that apply in the prompt for the subagent. Most subagents start without your conversation, so they do not know which items are relevant.

### Counter files and the issue tracker

A counter file does not replace the issue tracker. The counter file is short-term and personal. It holds the requests for your current work in one repository. The issue tracker is the system of record for the team. It holds work that other people plan, review, or depend on.

Use them together. Some counter items become work that someone else must know about. Create an issue for each of them, and write the issue ID in the request. When you work on an issue, you can copy the steps for the current session into the counter file. Remove them when the work is complete.

## Keep ideas for a later session

The second use case is a scratchpad. During a session, you or Claude find work that does not belong to the current task. Examples are a missing test, a useful refactor, or a question for later. Record it in the `Ideas` section. The current task stays focused, and the idea is not lost when the session ends.

```markdown {filename="counter.md"}
# Ideas

- The retry logic in `src/http/client.ts` and `src/queue/worker.ts` is almost the same. Candidate for one shared helper.
- No test covers an expired session token. Add one before the next change to `src/auth/`.
- Next session: continue the migration of the remaining three endpoints to the new router.
```

You can ask Claude in a prompt to add an idea while it works. For example: "Add this to the Ideas section of counter.md, and continue with the current task."

An idea is not a request. The example rule tells Claude not to act on the `Ideas` section without your instruction. When an idea is ready, promote it into a workflow:

| Promote the idea to | When | How |
| --- | --- | --- |
| A request | You want Claude to do it in this repository. | Move it to the `Requests` section as a new `##` heading. You can ask Claude to move it. Claude shows the change first, because the move removes the idea from the `Ideas` section. |
| An issue | Other people must plan, review, or know about it. | Ask Claude to draft the issue text. Create the issue yourself, or confirm before Claude creates it. |
| A skill | It is a procedure that you repeat. | See [Turn a repeated procedure into a skill](/docs/prompts/maintenance#turn-a-repeated-procedure-into-a-skill). |
| A plan | It is a larger change with several steps. | Start plan mode, and give Claude the idea as the goal. |
| A guideline | It is a fact or rule that applies to every session. | Add it to CLAUDE.md or a rule file. See [Guideline files](/docs/general-tips/guideline-files). |

To review the ideas with Claude, see [Review the counter file and promote ideas into tasks](/docs/prompts/review#review-the-counter-file-and-promote-ideas-into-tasks).

## Make the reminder reliable with a hook

The rule file is an instruction, and Claude treats instructions as context, not as enforced configuration. In a long session, or after many tasks, Claude can forget to read the counter file. See [CLAUDE.md vs auto memory](https://code.claude.com/docs/en/memory#claude-md-vs-auto-memory).

A [hook](/docs/cli/hooks) runs every time, so it can add a reminder to each prompt. A `UserPromptSubmit` hook runs when you submit a prompt, and Claude Code adds the plain text that the hook prints to Claude's context. The hook does not force Claude to follow the reminder, but the reminder reaches Claude with every prompt. This hook is optional.

The hook needs Node.js, and `node` must be on the `PATH`. On Windows, Claude Desktop does not read PowerShell profiles, so set the `PATH` in your Windows environment variables. See [Hooks on Windows](/docs/cli/hooks#hooks-on-windows).

{{% details title="Reminder hook: script, registration, and test" closed="true" %}}

Save the following script in the repository. It prints one line only when `counter.md` exists:

```javascript {filename=".claude/hooks/counter-reminder.js"}
// Adds a one-line reminder to each prompt when counter.md exists in the project root.
const fs = require('node:fs');
const path = require('node:path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const counterFile = path.join(projectDir, 'counter.md');

if (fs.existsSync(counterFile)) {
  console.log('Read counter.md before you act on this prompt. Follow .claude/rules/counter-file.md.');
}
process.exit(0);
```

Register it in the project [settings file](/docs/general-tips/settings-file), `.claude/settings.json`. The hook uses exec form, with `node` as the command and the script path in `args`, so that it works on Windows and macOS. `UserPromptSubmit` does not use a matcher.

```json {filename=".claude/settings.json"}
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/counter-reminder.js"],
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

If the file already has a `hooks` object, add `UserPromptSubmit` as a new key inside it. To test the script, run the following command in the repository root. The command is the same on Windows and macOS:

```shell
node .claude/hooks/counter-reminder.js
```

The script prints the reminder if `counter.md` exists, and prints nothing if it does not. If you add the counter file to `.gitignore` and commit the hook, the hook has no effect for teammates who do not have the file. See [Hooks](/docs/cli/hooks) for exec form and how to debug a hook.

{{% /details %}}

## Good practice

- **Keep the file short.** Claude reads the whole file before each task, and the content stays in the context window. Remove items that are done, and move ideas that you do not plan to do into the issue tracker or delete them.
- **Do not put secrets in the file.** Claude reads the counter file into the context window, like any other file. Do not write credentials, tokens, customer data, or other information that must not leave your computer. Refer to a secret by the name of its environment variable instead.
- **Treat items as prompts.** An item has the same limits as a prompt that you type. Claude Code still asks for permission according to your settings. The example rule tells Claude to confirm actions that cannot be undone or that publish content. Examples are a push, a merge, or a deletion. Claude confirms them even when an item asks for them.
- **Check who can write to the file.** If the file is committed or shared, someone else can add text to it. Claude reads that text as a request, so an item that you did not write can cause actions that you did not intend. Read new items before a session, and do not let Claude act on items from people that you do not trust. See [Protect against prompt injection](https://code.claude.com/docs/en/security#protect-against-prompt-injection).

{{< callout type="warning" >}}
A counter file that is committed to a public repository is public. Every item and status line, including summaries of your work, is visible in the Git history after you push it.
{{< /callout >}}

## Related prompts

- [Create a counter file for this repository](/docs/prompts/project-setup#create-a-counter-file-for-this-repository)
- [Check the counter file and update item status](/docs/prompts/maintenance#check-the-counter-file-and-update-item-status)
- [Review the counter file and promote ideas into tasks](/docs/prompts/review#review-the-counter-file-and-promote-ideas-into-tasks)

## Further reading

- [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [Task list](https://code.claude.com/docs/en/interactive-mode#task-list)
- [Working directories](https://code.claude.com/docs/en/permissions#working-directories)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Context](/docs/general-tips/context), [Seed files](/docs/general-tips/seed-files), and [Settings files](/docs/general-tips/settings-file) in this guide
