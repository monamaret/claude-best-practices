---
title: "Context"
weight: 10
description: >-
  Understand what Claude knows during a session and how to manage it.
---

Claude Code holds everything Claude knows about a session in a context window. This is a token budget shared by your instructions, the files Claude reads, its own responses, and background content that the conversation does not show you. A session that manages this budget well gives Claude the facts it needs and nothing that crowds those facts out.

Claude Desktop's Code tab runs Claude Code, so it reads the same files and responds to the same commands as the CLI. The rest of this page applies to both interfaces, except where a point names one interface.

## What fills the context window

Before you type a message, the context window already holds:

- The CLAUDE.md and rules files that apply to your working directory. See [Guideline files](/docs/general-tips/guideline-files).
- Auto memory: notes that Claude saved for itself in earlier sessions.
- The names of tools from connected MCP servers.
- The descriptions of the skills available to Claude. See [Skills and plugins](/docs/general-tips/skills-and-plugins).

As Claude works, the context window grows with every file it reads, writes, or edits, with command output and search matches, with the full content of a skill once it is invoked, and with the conversation itself.

## When the context window fills up

A context window has a limit that depends on the model. Most models support a 200,000-token window; some support a 1 million-token window. See [available models](https://code.claude.com/docs/en/model-config#available-models).

Claude Code compacts the session automatically as it approaches that limit. Compaction replaces the conversation history with a structured summary, so the session continues instead of stopping.

Not every mechanism survives compaction the same way:

| Mechanism | After compaction |
| --- | --- |
| Project-root CLAUDE.md and rules without a `paths` pattern | Reload immediately from disk |
| A CLAUDE.md in a subdirectory, or a rules file scoped with `paths` | Reload the next time Claude works with a matching file |
| Auto memory | Reloads immediately from disk |
| Files Claude read or edited | Claude re-reads up to five, most recently modified first |

{{< callout type="warning" >}}
An instruction in a path-scoped rules file does not return until Claude works with a matching file again. If an instruction must hold immediately after compaction, remove its `paths` front matter or move it to CLAUDE.md.
{{< /callout >}}

## How content enters the context window

Each way of giving Claude content adds a different amount to the context window. Some ways add only the lines that you choose. Others add a full copy of the content.

The table orders the ways from the most precise, which add the least, to the ways that add the most. Everything in the table stays in the conversation until you run `/clear` or compaction summarizes it.

| Method | What enters the context window | Why it works this way |
| --- | --- | --- |
| Select text in a connected IDE | The selected text and the path of the file | You choose the exact lines, so Claude does not have to search for them. |
| @-mention a directory, such as `@src/components/` | A listing of the files in the directory, not their content | The listing shows Claude the structure. Claude can then decide which files to read. |
| Ask Claude to find or read a file | The output of each search and each read that Claude does | Claude uses its tools. It can search first, and it reads a large file in parts instead of all at once. |
| @-mention a file, such as `@src/auth.ts` | The whole file, when it fits the limit for one read. Claude Code also adds the CLAUDE.md files from the directory of the file and its parent directories. | Claude Code adds the file when you send the prompt, without a tool call. The prompt keeps the path, so Claude can read the file again later. |
| @-mention an MCP resource, in the format `@server:protocol://resource/path` | The resource, which Claude Code fetches and attaches when you send the prompt | The MCP server decides what the resource contains and how large it is. |
| Paste text into the prompt | All of the pasted text | A paste is a copy without a path. It does not change when the source changes, and Claude cannot read it again from the source. |
| Paste or attach an image | The image, as visual content that Claude can see | An image shows what text cannot describe, such as a UI layout. Like pasted text, it stays in the conversation. |

The position of "Ask Claude to find or read a file" depends on the task. A narrow search adds little. A broad search across many files can add more than a file @-mention.

Some details explain the table:

- An @-mention of a file adds the content that the file has when you send the prompt. If the file changes later, Claude can read it again by path. If the file is too large for one read, Claude Code does not add its content. See [Reference files and directories](https://code.claude.com/docs/en/common-workflows#reference-files-and-directories).
- When Claude reads a file with its tools, one read returns a limited number of tokens. Claude reads a larger file in parts, or searches it for the lines that it needs. See [Read tool behavior](https://code.claude.com/docs/en/tools-reference#large-files).
- In the CLI, a long paste collapses into a placeholder such as `[Pasted text #1 +120 lines]`. The placeholder only keeps the input box readable. Claude Code still sends all of the text. See [Paste large content](https://code.claude.com/docs/en/terminal-config#paste-large-content).
- In the VS Code extension, Claude sees your selection and the name of the open file automatically. See [Automatic context from your selection and open file](https://code.claude.com/docs/en/vs-code#automatic-context-from-your-selection-and-open-file).

{{< callout type="info" >}}
An @-mention adds a file without a tool call, so `PreToolUse` hooks do not run for it. A `Read` deny rule in your [settings file](/docs/general-tips/settings-file) still blocks the file.
{{< /callout >}}

### Choose a method

- For a file in the repository, @-mention it instead of pasting it. The reference keeps the path, so Claude can read the current version later.
- For one part of a large file, select the lines in your IDE, or ask Claude to find that part. The rest of the file stays out of the context window.
- When you do not know where the code is, ask Claude to find it. For a search across many files, use a subagent, as described in [Give Claude the right context](#give-claude-the-right-context).
- For output that exists only in your terminal, such as a local error message, paste it. There is no file for Claude to read. In the CLI, you can also run the command with a `!` prefix, so that its output enters the session. See [Shell mode](https://code.claude.com/docs/en/interactive-mode#shell-mode-with-prefix).
- For a very large log, save it to a file and ask Claude to read the file. Claude can then read only the parts that it needs, and refer to the file by path later.
- For a UI problem or a diagram, attach an image.
- For data in an external system that has an MCP server, @-mention the resource instead of copying the data. See [Use MCP resources](https://code.claude.com/docs/en/mcp#use-mcp-resources).

## Give Claude the right context

These defaults work well until your team has a reason to depart from them.

- Give Claude a reference to a file instead of a pasted copy. See [How content enters the context window](#how-content-enters-the-context-window) for how the methods compare.
- Put a fact that matters in every session in CLAUDE.md, not in a chat message. A fact that you type into chat is not available next session unless you add it yourself or Claude saves it to auto memory.
- Put a request, or the status of work in progress, in a counter file when it must last longer than one session or survive compaction. See [Counter files](/docs/general-tips/counter-files).
- Send a side task to a subagent when its output does not need to stay in your conversation. A broad search across many files is a good example. The subagent reads the files in its own context window and returns only a summary. See [Subagents](https://code.claude.com/docs/en/sub-agents).
- Keep one task per conversation. Start a new session, or run `/clear`, when you move to unrelated work. CLAUDE.md and auto memory reload either way, so you do not lose project context.
- When you must paste output such as a log or a stack trace, paste only the part that Claude needs.

## Remove context that is not useful

- Run `/clear` when you switch to unrelated work, rather than carrying old conversation into a new task.
- Run `/compact` with a focus before a long new task, for example `/compact focus on the auth bug fix`, instead of waiting for automatic compaction to guess what to keep.
- Disconnect an MCP server that you are not using for the current task. Idle servers keep their tool names in context even though their full schemas load only on demand.
- Run `/context` at any point for a breakdown of what is using your context window, including which CLAUDE.md and rules files loaded.

## Further reading

- [Explore the context window](https://code.claude.com/docs/en/context-window)
- [Reference files and directories](https://code.claude.com/docs/en/common-workflows#reference-files-and-directories)
- [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [Best practices: keep cost and context down](https://code.claude.com/docs/en/best-practices#keep-cost-and-context-down)
