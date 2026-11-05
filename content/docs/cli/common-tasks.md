---
title: "Common task reference"
linkTitle: "Common tasks"
weight: 30
description: >-
  Commands and shortcuts for everyday tasks in a Claude Code session.
---

This page is a lookup reference for tasks that you do often in a Claude Code CLI session. Each task has its own heading, so that you can link to it directly. Where Claude Desktop's Code tab does the task in a different way, the section shows both interfaces in tabs.

Commands that start with `/` are slash commands that you type at the start of a prompt. Commands that start with `claude` run in your shell. For the complete lists, see [Commands](https://code.claude.com/docs/en/commands), [Interactive mode](https://code.claude.com/docs/en/interactive-mode), and the [CLI reference](https://code.claude.com/docs/en/cli-reference). Not every command appears for every user, because availability depends on your platform, plan, and environment.

## Quick reference

| Task | CLI command or shortcut |
| --- | --- |
| [Check context usage](#check-context-usage) | `/context` |
| [Compact or clear the conversation](#compact-or-clear-the-conversation) | `/compact [instructions]`, `/clear [name]` |
| [Resume a previous session](#resume-a-previous-session) | `claude --continue`, `claude --resume`, `/resume` |
| [Rename a session](#rename-a-session) | `/rename <name>`, `claude -n <name>` |
| [Rewind to a checkpoint](#rewind-to-a-checkpoint) | `Esc` `Esc` on an empty prompt, `/rewind` |
| [Switch the model](#switch-the-model) | `/model`, `Alt+P` (Windows), `Option+P` (macOS) |
| [Switch the permission mode](#switch-the-permission-mode) | `Shift+Tab`, `claude --permission-mode <MODE>` |
| [Add a directory](#add-a-directory) | `/add-dir <path>`, `claude --add-dir <path>` |
| [Run a shell command inline](#run-a-shell-command-inline) | `!` at the start of the prompt |
| [Check status and run diagnostics](#check-status-and-run-diagnostics) | `/status`, `/doctor`, `claude doctor` |
| [Export a conversation](#export-a-conversation) | `/export [filename]` |
| [Check usage and cost](#check-usage-and-cost) | `/usage` |
| [Paste images and screenshots](#paste-images-and-screenshots) | `Alt+V` (Windows), `Ctrl+V` (macOS), drag and drop |
| [Move a session between Claude Desktop and the CLI](#move-a-session-between-claude-desktop-and-the-cli) | `/desktop`, `claude --desktop` |
| [Run Claude non-interactively](#run-claude-non-interactively) | `claude -p "<PROMPT>"` |

## Check context usage

Check context usage before a long task, or when Claude starts to forget earlier instructions. The breakdown shows which files, tools, and messages use the most space. For what fills the context window and why it matters, see [Context](/docs/general-tips/context).

The `/context` command works in both interfaces. It prints a per-category breakdown of the context window.

```text
/context
```

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
The **Context** card in the session details panel shows context usage as a percentage. Open the card to see usage by category. In the earlier Code tab layout, select the usage ring next to the model picker instead.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
Run `/context all` to expand the per-item breakdown. To see context usage at all times, configure the status line with `/statusline`. See [Status line](https://code.claude.com/docs/en/statusline).
{{< /tab >}}
{{< /tabs >}}

## Compact or clear the conversation

Compact the conversation when you continue the same task but need space. Clear it when you move to unrelated work. Clearing costs nothing, while compaction is itself a large request, because Claude reads the conversation to summarize it.

| Command | Result |
| --- | --- |
| `/compact` | Replaces the conversation history with a summary. The session continues. |
| `/compact <INSTRUCTIONS>` | Summarizes with a focus, for example `/compact focus on the auth bug fix`. |
| `/clear` | Starts a new conversation with empty context. Claude Code saves the previous conversation, so that you can resume it. |
| `/clear <NAME>` | Starts a new conversation and gives the previous conversation a name in the `/resume` picker. |

`/clear` has the aliases `/reset` and `/new`. The CLAUDE.md file in the project root and auto memory load again after `/compact` and after `/clear`.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Type `/compact` in the prompt box. To start with empty context, start a new session with **Cmd+N** on macOS or **Ctrl+N** on Windows.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
Run `/rename` before `/clear` if you want to find the conversation again by name. Then run `/resume` to return to it.
{{< /tab >}}
{{< /tabs >}}

## Resume a previous session

Resume a session to continue work that you stopped, with the full conversation restored. This is useful after you close the terminal, restart your computer, or run `/clear`.

| Command | Result |
| --- | --- |
| `claude --continue` or `claude -c` | Opens the most recent session in the current directory. |
| `claude --resume` or `claude -r` | Opens the session picker. |
| `claude --resume <NAME_OR_ID>` | Resumes the session with that name or session ID. |
| `/resume` | Opens the session picker from inside a running session. `/continue` is an alias. |
| `/resume <NAME_OR_ID>` | Switches to that session from inside a running session. |

In the session picker, press `Enter` to resume the highlighted session and `Space` to preview it. Press `Ctrl+A` to show sessions from all projects on this machine. See [Use the session picker](https://code.claude.com/docs/en/sessions#use-the-session-picker) for all shortcuts.

`claude --continue` skips sessions that you started with `claude -p`. To keep the original session unchanged and continue in a copy, add `--fork-session`:

```shell
claude --continue --fork-session
```

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Select a session in the sidebar. To continue a session that you started in the CLI, see [Move a session between Claude Desktop and the CLI](#move-a-session-between-claude-desktop-and-the-cli).
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
Use the commands in the table above.
{{< /tab >}}
{{< /tabs >}}

## Rename a session

Give a session a descriptive name when you work on several tasks in parallel. A name makes the session easy to find in the picker, and you can resume it by name.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Open the session, and then select the session title in the title bar to edit it.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
| When | Command |
| --- | --- |
| At startup | `claude -n <NAME>` |
| During a session | `/rename <NAME>` |
| During a session, with a generated name | `/rename` |
| In the session picker | Highlight the session and press `Ctrl+R`. |

The name also appears on the prompt bar. Resume the session later with the following command:

```shell
claude --resume <NAME>
```
{{< /tab >}}
{{< /tabs >}}

## Rewind to a checkpoint

Rewind when Claude takes a wrong direction and you want to return to an earlier point. Claude Code creates a checkpoint before each prompt that you send. Checkpoints stay with the session, so you can also rewind after you resume it.

To open the rewind menu, press `Esc` two times when the prompt input is empty, or run the following command:

```text
/rewind
```

`/checkpoint` and `/undo` are aliases. Select the prompt that you want to return to, and then select an action:

| Action | Result |
| --- | --- |
| **Restore code and conversation** | Reverts the files and the conversation to that point. |
| **Restore conversation** | Rewinds the conversation and keeps the current files. |
| **Restore code** | Reverts the files and keeps the conversation. |
| **Summarize from here** | Compresses the conversation from that point forward into a summary. |
| **Summarize up to here** | Compresses the conversation before that point into a summary. |

The code options appear only when Claude changed files after the selected point.

{{< callout type="warning" >}}
Checkpoints track file edits only. They do not reverse other effects of a shell command, such as a push, a package installation, or a database change. They also do not restore a file that only a shell command changed, most edits by subagents, or edits that you made outside Claude Code. Use Git for those changes.
{{< /callout >}}

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Use Git to revert changes that Claude made in a Claude Desktop session. For the features of the Code tab, see [Claude Code Desktop](https://code.claude.com/docs/en/desktop).
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
If the prompt input has text, the first double `Esc` clears the text instead. Press `Up` to recall it after you use the rewind menu.
{{< /tab >}}
{{< /tabs >}}

For all limitations, see [Checkpointing](https://code.claude.com/docs/en/checkpointing#limitations).

## Switch the model

Switch to a smaller model for routine edits and a larger model for complex reasoning. The model affects both the quality of the result and how fast you use your plan allowance. Model names change, so see [Model configuration](https://code.claude.com/docs/en/model-config) for the current aliases.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Select the model picker in the row under the prompt box. The shortcut is **Cmd+Shift+I** on macOS or **Ctrl+Shift+I** on Windows. You can change the model during a session.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
| Command or shortcut | Result |
| --- | --- |
| `/model` | Opens the model picker. The selection becomes your default for new sessions. In the picker, press `s` on a row to switch for this session only. |
| `/model <MODEL_ALIAS>` | Switches to that model. |
| `Alt+P` (Windows) or `Option+P` (macOS) | Switches the model without clearing your prompt. |
| `claude --model <MODEL_ALIAS>` | Starts a session with that model. |
| `/effort <LEVEL>` | Sets the effort level for models that support it. |

On macOS, `Option+P` works only after you configure Option as the Meta key in your terminal. See [Enable Option key shortcuts on macOS](https://code.claude.com/docs/en/terminal-config#enable-option-key-shortcuts-on-macos).
{{< /tab >}}
{{< /tabs >}}

A Claude Enterprise administrator can restrict which models are available to you.

## Switch the permission mode

The permission mode controls whether Claude asks before it edits files or runs commands. Use Plan mode to review an approach before Claude changes code. Use Manual mode to approve each change. For the available modes, see [Permission modes](https://code.claude.com/docs/en/permission-modes). To set the mode that new sessions start in, see the `permissions.defaultMode` row in [Common settings](/docs/general-tips/settings-file#common-settings).

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Select the mode selector in the row under the prompt box. The shortcut is **Cmd+Shift+M** on macOS or **Ctrl+Shift+M** on Windows. `Shift+Tab` does not cycle modes in Claude Desktop.

To edit allow and deny rules, edit the settings files directly. The `/permissions` dialog is not available in the Code tab. See [Settings files](/docs/general-tips/settings-file).
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
| Command or shortcut | Result |
| --- | --- |
| `Shift+Tab` | Cycles through the permission modes. The mode indicator shows the current mode. |
| `claude --permission-mode <MODE>` | Starts a session in that mode, for example `plan`. |
| `/permissions` | Opens a dialog to view and edit allow, ask, and deny rules. |
{{< /tab >}}
{{< /tabs >}}

A Claude Enterprise administrator can restrict which permission modes are available.

## Add a directory

Add a directory when a task needs files outside the current working directory, for example a shared library in a sibling repository. The added directory gives Claude access to its files. Claude Code does not load most `.claude/` configuration from it.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
While a session runs, select **+** next to the prompt box, and then select **Add folder**. To add folders before a session starts, add them under **Folders** in a saved environment. See [Add folders to a session](https://code.claude.com/docs/en/desktop#add-folders-to-a-session).
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
During a session, run the following command:

```text
/add-dir <PATH>
```

To add the directory when the session starts, run the following command:

```shell
claude --add-dir <PATH>
```

`<PATH>` is the path to the directory. To keep a directory for every session, add it to `permissions.additionalDirectories` in your settings. See [Settings](https://code.claude.com/docs/en/settings-reference#permissions-additionaldirectories).
{{< /tab >}}
{{< /tabs >}}

## Run a shell command inline

Run a shell command inline when you want Claude to see its output, for example a failing test run. You do not need to ask Claude to run the command or approve it.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Type `!` at the start of the prompt box, followed by the command, in the same way as in the CLI.

To run commands without Claude, open the integrated terminal with `` Ctrl+` `` on macOS or Windows, or select **Terminal** in the title bar of the session. The terminal opens in the working directory of the session. See [Run commands in the terminal](https://code.claude.com/docs/en/desktop#run-commands-in-the-terminal).
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
Type `!` at the start of the prompt, followed by the command:

```text
! npm test
```

Claude Code adds the command and its output to the conversation, and Claude responds to the output. To exit shell mode, press `Esc` or `Backspace` on an empty prompt.

Commands that you run in shell mode run outside the built-in sandbox, even when you enable it. To add output to the context without a response from Claude, set `respondToBashCommands` to `false`. See [Shell mode](https://code.claude.com/docs/en/interactive-mode#shell-mode-with-prefix).
{{< /tab >}}
{{< /tabs >}}

## Check status and run diagnostics

Check status when you need the version, the model, or the account that a session uses. Run diagnostics when the CLI does not start, does not find settings, or behaves in an unexpected way.

The `/status` command works in both interfaces. It shows the Claude Code version, the model, the account, and the connection status.

```text
/status
```

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
The Code tab runs its own copy of Claude Code, which can have a different version from the `claude` command in your terminal. Read the **Claude Code** row in the `/status` output. To update it, select **Claude** > **Check for Updates…** on macOS, or **Help** > **Check for Updates…** on Windows. Then start a new session.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
| Command | Result |
| --- | --- |
| `claude --version` | Prints the installed version. |
| `claude doctor` | Prints read-only diagnostics for the installation and settings, without a session. |
| `/doctor` | Runs a checkup inside a session and proposes fixes. Claude applies them after you confirm. |
| `claude auth status --text` | Prints whether you are signed in. |

For installation problems, see [Install and configure the CLI](/docs/cli/install-and-configure).
{{< /tab >}}
{{< /tabs >}}

## Export a conversation

Export a conversation to share it with a reviewer, to attach it to a ticket, or to keep a record of a decision. The export is plain text, with messages and tool output rendered for a person to read.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Export a conversation from the Claude Code CLI. For the features of the Code tab, see [Claude Code Desktop](https://code.claude.com/docs/en/desktop).
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
| Command | Result |
| --- | --- |
| `/export` | Opens a menu to copy the conversation to the clipboard or save it to a file. |
| `/export <FILENAME>` | Writes the conversation to that file. |
| `/copy` | Copies the last response from Claude to the clipboard. |
{{< /tab >}}
{{< /tabs >}}

Review an export before you share it. It contains the tool output from the session, which can include file content and command output.

## Check usage and cost

Check usage to see how much of your Claude Enterprise plan allowance you have used. The allowance is shared across Claude Code surfaces, so usage in Claude Desktop and in the CLI counts toward the same limits.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Select the usage ring next to the model picker to see your plan usage.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
Run the following command:

```text
/usage
```

`/cost` and `/stats` are aliases. On a Claude Enterprise plan, `/usage` shows the following:

- Plan usage bars and activity statistics.
- A breakdown of recent usage by skill, subagent, plugin, and MCP server, with recommendations to reduce usage. Press `d` or `w` to switch between the last day and the last week.
- A session block with token counts and an estimated dollar cost.

The dollar figure is an estimate at list price, unless your administrator configured your contracted rates. It is not a bill. The breakdown uses local session history only, so it does not include usage from other devices or from claude.ai.
{{< /tab >}}
{{< /tabs >}}

Run `/insights` for a report on how you work, for example where requests went wrong. The report uses tokens from your plan. For more about costs and how to reduce them, see [Manage costs effectively](https://code.claude.com/docs/en/costs).

## Paste images and screenshots

Give Claude a screenshot when text cannot describe the problem well, for example a layout bug, an error dialog, or a design mockup. Claude can read diagrams, screenshots, and mockups.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Select **+** next to the prompt box, and then select **Add files or photos**. You can also drag files into the prompt box.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
Use one of these methods:

- Paste an image from the clipboard. Claude Code inserts an `[Image #N]` reference at the cursor.
- Drag an image file into the terminal window.
- Type the path to the image file in your prompt.

| Task | Windows | macOS |
| --- | --- | --- |
| Capture a screen area to the clipboard | `Win+Shift+S` | `Cmd+Ctrl+Shift+4` |
| Paste the image into the CLI | `Alt+V` | `Ctrl+V` |

In WSL, `Ctrl+V` also pastes an image. Use `Alt+V` if your terminal uses `Ctrl+V` for text paste. In iTerm2 on macOS, `Cmd+V` also pastes an image.
{{< /tab >}}
{{< /tabs >}}

After you paste the image, describe what you want, for example: "Here is a screenshot of the error. What causes it?" To open an image that Claude refers to, press `Ctrl` (Windows) or `Cmd` (macOS) and select the `[Image #N]` link.

Do not paste screenshots that show credentials, customer data, or personal data.

## Move a session between Claude Desktop and the CLI

Move a session to Claude Desktop when you want to review the diff visually or run several sessions in one window. Both interfaces continue the same session, not a copy, and they read the same CLAUDE.md files and settings.

These commands require macOS or x64 Windows, and sign-in with your Claude Enterprise account.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
To continue a session that you started in the CLI:

1. Exit the session in the terminal.
2. In the Claude Desktop prompt box of a local session, type `/resume`.

   Claude Desktop lists the sessions that you started in the CLI on this computer.

3. Select the session.

The session continues in Claude Desktop with its full conversation. `claude --resume` in the terminal still finds it afterwards.

A session that you started in Claude Desktop resumes in Claude Desktop.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
From inside a running session, run the following command:

```text
/desktop
```

Claude Code saves the session, opens it in Claude Desktop, and exits the CLI. `/app` is an alias.

From your shell, run one of the following commands:

```shell
claude --desktop --continue
claude --desktop --resume <SESSION_ID>
```

The first command opens the most recent session in the current directory. The second opens the session with that ID. `<SESSION_ID>` is the ID that `/status` shows; a session name does not work here. Claude Code does not move a session that is open in another terminal.
{{< /tab >}}
{{< /tabs >}}

## Run Claude non-interactively

Run Claude with `-p` (`--print`) for one bounded task in a script, a shell function, or a Git hook on your computer. Claude Code runs the prompt, prints the response, and exits. Non-interactive mode is not available in Claude Desktop.

Pipe command output into Claude, and allow only what the task needs:

```shell
git diff --cached | claude -p "Write a commit message for the staged Git diff on stdin." --permission-mode dontAsk
```

No person answers permission prompts in a `-p` run, and the run does not show the workspace trust dialog. It runs the hooks and connects the MCP servers that the repository configures, so run `claude -p` only in repositories that you trust.

For input and output formats, permissions, and complete examples on Windows and macOS, see [Non-interactive mode](/docs/cli/non-interactive-mode).

## Further reading

- [Commands](https://code.claude.com/docs/en/commands)
- [Interactive mode](https://code.claude.com/docs/en/interactive-mode)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Manage sessions](https://code.claude.com/docs/en/sessions)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Manage costs effectively](https://code.claude.com/docs/en/costs)
- [Claude Code Desktop: Coming from the CLI](https://code.claude.com/docs/en/desktop#coming-from-the-cli)
- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
- [Context](/docs/general-tips/context)
- [CLI and IDE](/docs/cli/cli-and-ide)
- [Non-interactive mode](/docs/cli/non-interactive-mode)
