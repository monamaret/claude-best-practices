---
title: "Settings files"
weight: 25
description: >-
  Choose the settings that Claude Code enforces for you and your team, and put each setting in the correct settings file.
---

Settings files are JSON files that configure Claude Code. They control what Claude can run without asking, what it must never read, which hooks and plugins load, and which model a session starts with. Claude Code enforces these settings. A [guideline file](/docs/general-tips/guideline-files), such as a CLAUDE.md file, is guidance that Claude reads and usually follows. A deny rule in a settings file applies every time, whatever Claude decides.

The **Code** tab in Claude Desktop, the Claude Code CLI, and the IDE extensions read the same settings files. A file that you commit to a repository applies to every teammate in every interface. This page gives a small, safe starting point and the settings that developers use most often. For all other keys, see the [settings reference](https://code.claude.com/docs/en/settings-reference).

## Where settings live

Claude Code reads settings from four scopes. The scope of a file decides who the settings in it apply to.

| Scope | Windows | macOS | Applies to |
| --- | --- | --- | --- |
| Managed | Deployed by your Claude Enterprise administrators | Deployed by your Claude Enterprise administrators | Everyone that the policy reaches |
| User | `%USERPROFILE%\.claude\settings.json` | `~/.claude/settings.json` | Only you, in every project |
| Project | `.claude\settings.json` in the repository | `.claude/settings.json` in the repository | Everyone who works in the repository |
| Local | `.claude\settings.local.json` in the repository | `.claude/settings.local.json` in the repository | Only you, in this repository |

Managed settings can come from the Claude Enterprise admin console, from a device management policy, or from a `managed-settings.json` file in a system directory. You do not create or edit them.

The installer does not create any settings file. Claude Code creates the user file when you change an option in `/config`. It creates the local file when you select **Yes, and don't ask again** on a permission prompt. It then adds the local file to your global Git excludes, which apply only on your own computer. Add `.claude/settings.local.json` to the `.gitignore` file of the repository as well, so that no teammate commits it by mistake.

Claude Code also writes a different file, `%USERPROFILE%\.claude.json` on Windows and `~/.claude.json` on macOS. It holds your account, MCP servers, project trust, and global options such as the IDE diff tool, so change it only through `/config`. See [Find the configuration files](/docs/cli/install-and-configure#find-the-configuration-files).

## Which value applies

When more than one source sets the same key, Claude Code uses the value from the highest source, in this order:

1. **Managed settings.** No other source can override a managed value.
2. **Command line.** The `--settings` flag sets keys for one session.
3. **Local settings** in `.claude/settings.local.json`.
4. **Project settings** in `.claude/settings.json`.
5. **User settings** in `~/.claude/settings.json`.

Other flags, such as `--permission-mode` and `--model`, are not part of this order. Each one overrides one key for one session. The entry for each key in the settings reference names the flags that override it.

Two rules change how this order works in practice:

- **Lists merge.** The `permissions.allow`, `permissions.ask`, and `permissions.deny` lists from all files combine, and so do the hooks. Claude Code evaluates deny rules first, so a deny rule from any file blocks the tool. An allow rule in another file cannot override it.
- **Project settings override your user settings.** If the committed project file sets a value that you do not want, override it in your local file, not in your user file.

For the exceptions and examples, see [Settings precedence](https://code.claude.com/docs/en/settings#settings-precedence).

{{< callout type="important" >}}
Your Claude Enterprise administrators can enforce settings through managed settings, for example permission rules, the permitted models, or the update channel. A managed value always applies. To see which managed source applies to you, use the procedure in [Check which settings apply](#check-which-settings-apply).
{{< /callout >}}

## Start with a minimum project settings file

Commit a small `.claude/settings.json` file to each repository. The following file is a safe starting point. It approves the routine commands, prompts before the risky ones, and blocks secrets and destructive Git commands:

```json {filename=".claude/settings.json"}
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "defaultMode": "default",
    "allow": [
      "Bash(mvn test *)",
      "PowerShell(mvn test *)",
      "Bash(./gradlew test *)",
      "PowerShell(.\\gradlew test *)",
      "Bash(dotnet test *)",
      "PowerShell(dotnet test *)"
    ],
    "ask": [
      "Bash(git push *)",
      "PowerShell(git push *)",
      "Bash(rm *)",
      "PowerShell(Remove-Item *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Bash(git push --force *)",
      "PowerShell(git push --force *)",
      "Bash(git reset --hard *)",
      "PowerShell(git reset --hard *)"
    ]
  }
}
```

Keep the rules for the build tool that your repository uses, and remove the others. Replace `./secrets/**` with the paths in your repository that hold credentials.

A rule matches the command text as Claude writes it, not the program that runs. For example, the Bash rule for `./gradlew test` does not match `gradle test` or `sh gradlew test`. In PowerShell, other forms of the wrapper, such as `./gradlew test` or `.\gradlew.bat test`, can need their own rule. If Claude uses a form that no rule matches, you get a prompt. Select **Yes, and don't ask again** to save that form to your local file, or add a rule for it to the project file. In the JSON file, `\\` stands for one backslash.

| Entry | Reason |
| --- | --- |
| `$schema` | Your editor validates the file and suggests key names while you type. |
| `defaultMode: "default"` | CLI and Claude Desktop sessions start in **Manual** mode, so Claude asks before it edits files or runs commands. The built-in default can be a mode with fewer prompts. A teammate can still switch modes in a session. The VS Code extension does not read this value. See the note after the [Common settings](#common-settings) table. |
| `allow` | Tests run often and do not change shared state. Approving them removes the most frequent prompts. The file does not allow build, install, or deploy commands, because some of them publish artifacts or change systems outside the repository. |
| `ask` | A push changes the remote repository. A file that only a shell command deleted is not restored when you rewind to a checkpoint. An `ask` rule prompts even in a mode that otherwise approves the command. |
| `deny` with `Read` | Claude's file tools, and the file commands that Claude Code recognizes, such as `cat`, cannot read or edit these files. Most searches do not show them. The block is not complete: a script that Claude runs can still read the files. For a block at the operating system level, use the built-in sandbox ([Sandboxing](https://code.claude.com/docs/en/sandboxing)) or a Docker sandbox ([Sandboxes](/docs/general-tips/sandboxes)). |
| `deny` with Git commands | A force push and a hard reset can destroy work that has no other copy. |
| Pairs of `Bash` and `PowerShell` rules | On Windows, Claude uses the PowerShell tool as the primary shell. A `Bash(...)` rule does not apply to the PowerShell tool. With Git for Windows installed, a `Bash(...)` deny rule also disables the PowerShell tool without a warning, if no settings file has a `PowerShell(...)` rule. If any settings file has a `PowerShell(...)` rule, the PowerShell tool stays available, and an unpaired `Bash(...)` deny rule does not restrict it. See [Bash deny rules also turn off the PowerShell tool](https://code.claude.com/docs/en/tools-reference#bash-deny-rules-also-turn-off-the-powershell-tool). |

The `Read(./.env.*)` rule also blocks template files, such as `.env.example`. Remove that rule if Claude must read the templates.

A command rule matches the command as Claude writes it. `Bash(git push --force *)` does not match `git push -f` or `git push origin main --force`. For a rule that must hold for every form of a command, add a hook. See [Block unsafe commands](/docs/cli/hooks#block-unsafe-commands). For the full rule syntax, see [Permission rule syntax](https://code.claude.com/docs/en/permissions#permission-rule-syntax).

Deny and ask rules from the project file apply at once. The `permissions.allow` rules, `permissions.additionalDirectories`, `extraKnownMarketplaces`, and most `env` values apply only after each teammate accepts the workspace trust dialog for the repository. See [Project allow rules and workspace trust](https://code.claude.com/docs/en/permissions#project-allow-rules-and-workspace-trust).

To have Claude write this file for your repository, see [Create a starter settings.json for this repository](/docs/prompts/project-setup#create-a-starter-settingsjson-for-this-repository).

## Add a minimum user settings file

Your user file holds personal preferences and the rules that protect your own computer in every project. On Windows, the file is `%USERPROFILE%\.claude\settings.json`. On macOS, the file is `~/.claude/settings.json`. The following file is a small starting point:

```json {filename="%USERPROFILE%\\.claude\\settings.json"}
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "deny": [
      "Read(//**/.env)",
      "Read(~/.ssh/**)",
      "Read(~/.aws/**)"
    ]
  }
}
```

| Entry | Reason |
| --- | --- |
| `Read(//**/.env)` | Blocks `.env` files everywhere on your computer, in every project. On Windows, the rule covers every drive. A rule that starts with `//` is an absolute path. A rule that starts with `/` in the user file means a path in `~/.claude/`, not in your project. |
| `Read(~/.ssh/**)` and `Read(~/.aws/**)` | Claude's file tools and the file commands that Claude Code recognizes cannot read your SSH keys and cloud credentials. A script that Claude runs can still read them. Add the other credential directories that you use. |

## Common settings

The following table lists the keys that developers on most teams use. For most keys, it gives a recommendation and a scope. The scope is where the key is most useful, not the only file that accepts it. For the type, the default, and the per-session flags of each key, follow the link to the settings reference.

| Key | What it does | Recommendation | Scope |
| --- | --- | --- | --- |
| [`permissions.allow`](https://code.claude.com/docs/en/settings-reference#permissions-allow) | Approves tool uses without a prompt | List only routine commands, such as tests and lint. Write a `Bash` rule and a `PowerShell` rule for each command. | Project for team commands. Local for your own. |
| [`permissions.ask`](https://code.claude.com/docs/en/settings-reference#permissions-ask) | Prompts before a tool use, even in a mode that approves it | Use it for pushes, deletes, and commands that change shared systems. | Project |
| [`permissions.deny`](https://code.claude.com/docs/en/settings-reference#permissions-deny) | Blocks a tool use. A `Read` rule also blocks edits and hides the file from most searches. It applies to Claude's file tools and the file commands that Claude Code recognizes, not to scripts. | Use it for secrets and destructive commands. Pair each `Bash` rule with a `PowerShell` rule. For a block at the operating system level, see [Sandboxing](https://code.claude.com/docs/en/sandboxing). | Project for repository paths. User for files in your home directory. |
| [`permissions.defaultMode`](https://code.claude.com/docs/en/settings-reference#permissions-defaultmode) | Sets the permission mode that new sessions start in | Commit `default` (**Manual**). A committed value outranks your user file. To start in another mode in one repository, set `plan` or `acceptEdits` in your local file, or pass `--permission-mode`. The values `auto` and `bypassPermissions` have no effect in project or local files. Never use `bypassPermissions` outside an isolated container or virtual machine, such as a [Docker sandbox](/docs/general-tips/sandboxes). | Project. User for a personal default. |
| [`permissions.additionalDirectories`](https://code.claude.com/docs/en/settings-reference#permissions-additionaldirectories) | Gives Claude file access to directories outside the working directory | The paths differ on each computer, so keep them personal. See [Add a directory](/docs/cli/common-tasks#add-a-directory). | Local or user |
| [`permissions.disableBypassPermissionsMode`](https://code.claude.com/docs/en/settings-reference#permissions-disablebypasspermissionsmode) | Prevents `bypassPermissions` mode when set to `"disable"` | Set it if you never need to skip permission checks. Your administrators can enforce it for everyone. In project, local, or managed settings, it also makes Claude Code reject the default launch flag of a [Docker sandbox](/docs/general-tips/sandboxes). A value in your user settings does not reach a Docker sandbox. | User |
| [`env`](https://code.claude.com/docs/en/settings-reference#env) | Sets environment variables for each session and the commands that it runs | Put only values that are not secret here. Values are plain text. Most values from the project file apply only after a teammate trusts the folder. For the Git Bash path on Windows, see [Install Git for Windows](/docs/cli/install-and-configure#install-git-for-windows). | Project for values that the build needs. User for paths on your computer. |
| [`hooks`](https://code.claude.com/docs/en/settings-reference#hooks) | Runs commands at points in a session, such as after each edit | Commit the hooks and their scripts together. See [Hooks](/docs/cli/hooks). | Project |
| [`disableAllHooks`](https://code.claude.com/docs/en/settings-reference#disableallhooks) | Disables hooks, a custom status line, and a custom file suggestion command | Do not commit it. Pass it for one run in a repository that you do not trust. See [Set permissions for an unattended run](/docs/cli/non-interactive-mode#set-permissions-for-an-unattended-run). | Command line |
| [`enabledPlugins`](https://code.claude.com/docs/en/settings-reference#enabledplugins) | Enables or disables plugins | Commit the plugins that the whole team needs. Disable a project plugin for yourself in your local file. See [Plugins](/docs/cli/plugins). | Project. Local to opt out. |
| [`extraKnownMarketplaces`](https://code.claude.com/docs/en/settings-reference#extraknownmarketplaces) | Registers plugin marketplaces for a repository | Commit it together with `enabledPlugins`. It applies after a teammate trusts the folder. See [Share plugins with a team](/docs/cli/plugins#share-plugins-with-a-team). | Project |
| [`model`](https://code.claude.com/docs/en/settings-reference#model) | Sets the model that new sessions start with | Keep it personal, and change it with `/model`. Your administrators can restrict the models that you can select. | User |
| [`outputStyle`](https://code.claude.com/docs/en/settings-reference#outputstyle) | Changes the role, tone, and format of Claude's responses | Keep it personal. A team convention belongs in a guideline file. | User |
| [`statusLine`](https://code.claude.com/docs/en/settings-reference#statusline) | Runs a command that shows a status line below the prompt | Create it with `/statusline`. See [Add a status line](/docs/cli/install-and-configure#add-a-status-line). | User |
| [`autoUpdatesChannel`](https://code.claude.com/docs/en/settings-reference#autoupdateschannel) | Selects the `latest` or the `stable` release channel | Use `stable` if a regression costs you more than a late feature. Change it in `/config`. It has no effect on Homebrew or WinGet installations. See [Keep the CLI up to date](/docs/cli/install-and-configure#keep-the-cli-up-to-date). | User |
| [`cleanupPeriodDays`](https://code.claude.com/docs/en/settings-reference#cleanupperioddays) | Sets the number of days that Claude Code keeps session transcripts | Keep the default of 30 days. Set a lower value if your sessions often contain sensitive data. The minimum is 1. | User |
| [`attribution`](https://code.claude.com/docs/en/settings-reference#attribution) | Changes or hides the text that Claude Code adds to commits (`attribution.commit`) and to pull request descriptions (`attribution.pr`) | To hide the text, set `commit` and `pr` to empty strings. Do not set `attribution` to `false`, because versions before v2.1.281 reject that value and skip the whole settings file. The older `includeCoAuthoredBy` key is deprecated. | Any settings file |
| [`sandbox.enabled`](https://code.claude.com/docs/en/settings-reference#sandbox-enabled) | Isolates Bash, PowerShell, and Monitor commands from the file system and the network | Available on macOS, Linux, and WSL 2, not on native Windows. On native Windows, see [Sandboxes](/docs/general-tips/sandboxes). Enable it with `/sandbox`. See [Sandboxing](https://code.claude.com/docs/en/sandboxing). | User or local |

The VS Code extension reads `permissions.defaultMode` only from your user settings and from managed settings. It ignores the project and local files for the starting mode. See [Extension settings that matter for teams](/docs/cli/cli-and-ide#extension-settings-that-matter-for-teams).

## Good practice

- **Commit the project file, and keep personal settings local.** Commit `.claude/settings.json` and the scripts that its hooks run. Do not commit `.claude/settings.local.json`, and list it in the `.gitignore` file of the repository. It holds your own approvals, and it can contain paths that exist only on your computer.
- **Do not put secrets in a settings file.** This includes the `env` key, in every scope. Values in settings files are plain text, and every command that Claude runs receives them. Set secrets as environment variables in your operating system, or load them from a secret manager.
- **Review a change to permissions as you review code.** An allow rule in the project file gives a capability to every teammate. Check new allow rules, removed deny rules, and new hooks in each pull request. See [Review a change to settings.json](/docs/prompts/review#review-a-change-to-settingsjson).
- **Use the built-in commands where they are safer than a manual edit.** In the CLI, `/permissions` shows each rule and the file that it comes from, and it writes valid JSON. `/config` changes personal options and writes them to the correct file. Claude Desktop does not have these commands, so edit the files in your editor.
- **Validate the JSON.** Settings files are strict JSON, with no comments and no trailing commas. The `$schema` line gives you validation in VS Code and other editors that support JSON Schema. The schema can be behind the newest release, so a warning on a new key does not always mean an error.
- **Check the result after each change.** Claude Code reloads most settings while a session runs. Confirm that the file loaded with the procedure in the next section.

## Check which settings apply

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
Claude Desktop reads the same settings files as the CLI. If you have the Claude Code CLI installed, open a terminal in the same folder and use the steps in the **Claude Code CLI** tab. See [Install and configure the CLI](/docs/cli/install-and-configure).

A permission mode that you select in the mode selector of the **Code** tab is saved for the folder. It applies instead of `permissions.defaultMode` for that folder, except **Plan**, which applies to the current session only.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
1. Start a session in the repository root, and run the following command:

   ```text
   /status
   ```

   The **Setting sources** line lists each settings file that loaded, such as **User settings** or **Project local settings**. When managed settings apply, the line shows how they reached your computer.
2. To see each permission rule and the file that it comes from, run the following command:

   ```text
   /permissions
   ```

3. If a file does not load, or a value has no effect, run the following command in your shell:

   ```shell
   claude doctor
   ```

   The `claude doctor` command lists the settings that are not valid and the entries that Claude Code rejected.
{{< /tab >}}
{{< /tabs >}}

The `/status` command shows which files loaded, not which file supplied each key. If a value has no effect, a higher source probably sets the same key. See the troubleshooting cases in [Settings files and precedence](https://code.claude.com/docs/en/settings#common-cases).

## Related prompts

- [Create a starter settings.json for this repository](/docs/prompts/project-setup#create-a-starter-settingsjson-for-this-repository)
- [Review a change to settings.json](/docs/prompts/review#review-a-change-to-settingsjson)

## Further reading

- [Settings files and precedence](https://code.claude.com/docs/en/settings)
- [Settings reference](https://code.claude.com/docs/en/settings-reference)
- [Example settings files](https://code.claude.com/docs/en/settings-example)
- [Configure permissions](https://code.claude.com/docs/en/permissions)
- [Permission modes](https://code.claude.com/docs/en/permission-modes)
- [Debug your configuration](https://code.claude.com/docs/en/debug-your-config)
- [Project setup](/docs/general-tips/project-setup) and [Guideline files](/docs/general-tips/guideline-files) in this guide
- [Hooks](/docs/cli/hooks), [Plugins](/docs/cli/plugins), and [Non-interactive mode](/docs/cli/non-interactive-mode) in this guide
