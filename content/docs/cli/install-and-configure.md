---
title: "Install and configure the CLI"
linkTitle: "Install and configure"
weight: 10
description: >-
  Install the Claude Code CLI on Windows or macOS, sign in, and configure it.
---

The Claude Code CLI runs Claude Code in a terminal. You start it with the `claude` command in a project directory, and Claude reads, edits, and runs code in that directory. Install the CLI to run `claude` in any terminal, including the integrated terminal of your IDE. Later pages in this section describe the IDE integration, hooks, and plugins.

You do not need the CLI to use Claude Code in Claude Desktop. The **Code** tab in Claude Desktop includes Claude Code, so it needs no separate install of the CLI or Node.js. Install the CLI when you want `claude` in a terminal or in your IDE. Both interfaces read the same settings files, so this page also helps if you use both.

## Requirements

- A Claude Enterprise account that your administrator has given access to Claude Code.
- A supported version of Windows or macOS. Check the current list in [System requirements](https://code.claude.com/docs/en/setup#system-requirements).
- Network access to the Anthropic hosts that the CLI uses. If your network uses a proxy or inspects TLS traffic, see [Enterprise network configuration](https://code.claude.com/docs/en/network-config).
- On Windows, [Git for Windows](https://git-scm.com/downloads/win) is recommended. The first step of the procedure explains why.

You do not need administrator rights to run the native installer.

## Install the CLI

The native installer is the recommended method on both Windows and macOS. It installs a single binary and updates it automatically in the background.

{{% steps %}}

### Install Git for Windows

On Windows, install [Git for Windows](https://git-scm.com/downloads/win) before you install the CLI. On macOS, skip this step.

Git for Windows includes Git Bash. Without Git Bash, Claude Code has only its PowerShell tool for shell commands. With Git Bash, Claude Code has both the PowerShell tool and the Bash tool. It uses PowerShell as the primary shell and uses Bash for POSIX scripts. Install Git for Windows if your project has Bash scripts, and because some tools, such as the Monitor tool, need Git Bash. See [Bash tool behavior](https://code.claude.com/docs/en/tools-reference#bash-tool-behavior) and [PowerShell tool](https://code.claude.com/docs/en/tools-reference#powershell-tool).

During setup, select the option that adds Git to your PATH. If Claude Code cannot find Git Bash, for example because Git is in a non-default location, set `CLAUDE_CODE_GIT_BASH_PATH` in your user settings file:

```json {filename="%USERPROFILE%\\.claude\\settings.json"}
{
  "env": {
    "CLAUDE_CODE_GIT_BASH_PATH": "<GIT_INSTALL_DIR>\\bin\\bash.exe"
  }
}
```

Replace `<GIT_INSTALL_DIR>` with the Git installation directory. To find it, run `where.exe git` in PowerShell. Use double backslashes, because the file is JSON. The path must end in `bash.exe`, not `git-bash.exe`.

### Run the installer

{{< tabs >}}
{{< tab name="Windows" >}}
Open PowerShell. The prompt starts with `PS`. Run the following command:

```powershell
irm https://claude.ai/install.ps1 | iex
```

The installer shows no progress while it downloads. It puts `claude.exe` in `%USERPROFILE%\.local\bin`.

If you work in Command Prompt (CMD), use the CMD command in [Install Claude Code](https://code.claude.com/docs/en/setup#install-claude-code) instead. An `'irm' is not recognized` error means that you are in CMD, not PowerShell.

**Alternative: WinGet.** Run the following command:

```powershell
winget install Anthropic.ClaudeCode
```

A WinGet installation does not update automatically. You must run `winget upgrade Anthropic.ClaudeCode` yourself to get new features and security fixes. Use WinGet only if your team manages software through it.
{{< /tab >}}
{{< tab name="macOS" >}}
Open Terminal and run the following command:

```shell
curl -fsSL https://claude.ai/install.sh | bash
```

The installer shows no progress while it downloads. It puts the `claude` launcher in `~/.local/bin`.

**Alternative: Homebrew.** Run the following command:

```shell
brew install --cask claude-code
```

The `claude-code` cask follows the stable release channel. The `claude-code@latest` cask follows the latest channel. A Homebrew installation does not update automatically. Run `brew upgrade claude-code` (or `brew upgrade claude-code@latest`) to update it.
{{< /tab >}}
{{< /tabs >}}

### Verify the installation

Open a new terminal window, so that it reads the updated PATH. Then run the following command:

```shell
claude --version
```

A working installation prints a version number. For a more detailed check, run the following command:

```shell
claude doctor
```

`claude doctor` prints diagnostics for the installation and the settings files without starting a session. It reports settings that are not valid and the result of the last update attempt.

{{% /steps %}}

## Fix a PATH problem on Windows

If PowerShell reports that `claude` is not recognized, the install directory is not on your PATH. Do the following steps in PowerShell:

1. Confirm that the binary exists. The following command prints `True` if it does:

   ```powershell
   Test-Path "$env:USERPROFILE\.local\bin\claude.exe"
   ```

2. Add the install directory to your user PATH:

   ```powershell
   $currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
   [Environment]::SetEnvironmentVariable('PATH', "$currentPath;$env:USERPROFILE\.local\bin", 'User')
   ```

3. Close and open the terminal again. If the terminal runs inside an IDE, close and open the IDE, because the terminal gets its PATH from the IDE.
4. Run `claude --version` again.

If `claude` opens Claude Desktop instead of the CLI, an older version of Claude Desktop is first on your PATH. Update Claude Desktop to fix this. For other errors, such as a `403` response or a TLS error during install, see [Troubleshoot installation and login](https://code.claude.com/docs/en/troubleshoot-install).

On macOS, the installer prints the PATH fix for your shell if `~/.local/bin` is not on your PATH. See [Verify your PATH](https://code.claude.com/docs/en/troubleshoot-install#verify-your-path).

## Use WSL 2 instead

You can also run the CLI inside a WSL 2 distribution instead of on native Windows. Choose WSL 2 if your project uses a Linux toolchain, or if you need the [built-in sandbox](https://code.claude.com/docs/en/sandboxing). The built-in sandbox is supported in WSL 2 but not on native Windows. On native Windows, Docker Sandboxes can isolate the CLI instead. See [Sandboxes](/docs/general-tips/sandboxes).

To install, open your WSL distribution and run the macOS and Linux install command from [Install Claude Code](https://code.claude.com/docs/en/setup#install-claude-code). Install and start `claude` inside the WSL terminal, not from PowerShell or CMD. A WSL installation does not need Git for Windows.

Claude Desktop can also run a **Code** tab session inside a WSL 2 distribution. See [Claude Desktop with WSL](https://code.claude.com/docs/en/desktop-wsl).

## Sign in with Claude Enterprise

Sign in with the Claude Enterprise account that your administrator invited you to. Your organization uses single sign-on (SSO), so you authenticate in the browser with your company credentials.

1. In a terminal, change to a project directory and run `claude`.
2. Select **Claude Enterprise**. Do not select the Console or third-party platform option. Claude Code opens a browser window. If the browser does not open, press `c` to copy the sign-in URL, and paste it into your browser.
3. Complete the SSO sign-in in the browser.
4. If the browser shows a code instead of returning to the terminal, paste the code at the `Paste code here if prompted` prompt. This happens most often in WSL 2.
5. When the terminal shows `Login successful`, press `Enter`.
6. Run `/status`. Confirm that the account and organization are your Claude Enterprise account and organization.

<!-- SCREENSHOT: The Status tab that /status opens in the CLI, showing the Login method, Organization, and Setting sources rows, with the email and organization redacted. -->

After you sign in, you can ask Claude to check the shell, Git, network, and settings configuration on your machine. See [Check a new Claude Code CLI setup](/docs/prompts/project-setup#check-a-new-claude-code-cli-setup). For other authentication methods, such as API keys or cloud providers, see [Authentication](https://code.claude.com/docs/en/authentication).

{{< callout type="important" >}}
A Claude Enterprise administrator can enforce managed settings, for example the permitted sign-in method, permission rules, or the update channel. A managed setting always applies, even if your user or project settings set a different value. To see which managed source applies to you, run `/status` and check the **Setting sources** line.
{{< /callout >}}

## Configure the CLI

### Find the configuration files

Claude Code stores user-level configuration in the `.claude` directory in your home directory. On Windows, `~/.claude` means `%USERPROFILE%\.claude`. Claude Desktop and the VS Code extension use the same directory.

| File | Windows | macOS |
| --- | --- | --- |
| User settings | `%USERPROFILE%\.claude\settings.json` | `~/.claude/settings.json` |
| User CLAUDE.md file | `%USERPROFILE%\.claude\CLAUDE.md` | `~/.claude/CLAUDE.md` |
| State that Claude Code writes (account, MCP servers, project trust) | `%USERPROFILE%\.claude.json` | `~/.claude.json` |
| Sign-in credentials | `%USERPROFILE%\.claude\.credentials.json` | macOS Keychain |
| CLI binary (native installer) | `%USERPROFILE%\.local\bin\claude.exe` | `~/.local/bin/claude` |

Edit `settings.json` and `CLAUDE.md` as you need. Change `.claude.json` only through `/config`, not by hand. Do not edit the credentials file. Do not share or commit `.claude.json` or the credentials file. The installer does not create `settings.json`. Create the file yourself, or let `/config` create it.

Project-level settings, permission rules, the order in which settings files apply, and a minimum settings file are in [Settings files](/docs/general-tips/settings-file). For every settings key, see [Settings](https://code.claude.com/docs/en/settings).

### Change settings with /config

Run `/config` in a session to open the **Settings** interface. The **Config** tab lists personal options, such as the theme, the editor mode, and the auto-update channel. Claude Code saves most changes to your user settings file.

`/config` shows a subset of the available settings. For other keys, edit `settings.json`. After you save, run `/status` to confirm that the file loaded.

### Enable multiline input

Press `Enter` to send a prompt. To add a new line without sending, press `Ctrl+J`, or type `\` and then press `Enter`. These work in every terminal.

`Shift+Enter` also adds a new line in Windows Terminal, iTerm2, and Apple Terminal without configuration. In the integrated terminal of VS Code or Cursor, run the following command one time:

```text
/terminal-setup
```

`/terminal-setup` adds a `Shift+Enter` key binding to the terminal configuration. In Apple Terminal, it enables `Option+Enter` for new lines instead. For other terminals, see [Configure your terminal](https://code.claude.com/docs/en/terminal-config).

### Add a status line

A status line is a bar at the bottom of the CLI that shows the output of a script. It can show the model, the Git branch, or the context window usage. Run `/statusline` with a description of what to show, for example:

```text
/statusline show the model name, the git branch, and the context usage percentage
```

Claude Code writes a script in `~/.claude/` and adds a `statusLine` entry to your user settings. On Windows, the script runs in Git Bash if it is installed, otherwise in PowerShell. See [Customize your status line](https://code.claude.com/docs/en/statusline).

### Keep the CLI up to date

A native installation checks for updates at startup and while it runs. It installs them in the background, and the update applies the next time you start `claude`. To update immediately, run the following command:

```shell
claude update
```

The `autoUpdatesChannel` setting selects the release channel. `latest` is the default and gets each release when it ships. `stable` gets a version that is about one week older and skips releases with major regressions. Change the channel in `/config` under **Auto-update channel**, or in your user settings:

```json {filename="~/.claude/settings.json"}
{
  "autoUpdatesChannel": "stable"
}
```

Choose `stable` if a regression in a new release costs you more than a late feature. A new model can require a version that the stable channel does not have yet.

WinGet and Homebrew installations do not update automatically. Run the upgrade command for your package manager, or see [Update Claude Code](https://code.claude.com/docs/en/setup#update-claude-code) for the option that runs it for you.

## Uninstall the CLI

To remove a native installation, run the commands for your operating system:

{{< tabs >}}
{{< tab name="Windows" >}}
```powershell
Remove-Item -Path "$env:USERPROFILE\.local\bin\claude.exe" -Force
Remove-Item -Path "$env:USERPROFILE\.local\share\claude" -Recurse -Force
```

For a WinGet installation, run `winget uninstall Anthropic.ClaudeCode`.
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
rm -f ~/.local/bin/claude
rm -rf ~/.local/share/claude
```

For a Homebrew installation, run `brew uninstall --cask claude-code`.
{{< /tab >}}
{{< /tabs >}}

These commands keep your settings and sessions in `~/.claude`, and your credentials. Claude Desktop and the VS Code extension use the same directory. To remove the configuration as well, see [Uninstall Claude Code](https://code.claude.com/docs/en/setup#uninstall-claude-code).

## Further reading

- [Advanced setup](https://code.claude.com/docs/en/setup): system requirements, install options, updates, and uninstall
- [Troubleshoot installation and login](https://code.claude.com/docs/en/troubleshoot-install)
- [Authentication](https://code.claude.com/docs/en/authentication)
- [Enterprise network configuration](https://code.claude.com/docs/en/network-config)
- [Settings](https://code.claude.com/docs/en/settings)
- [Configure your terminal](https://code.claude.com/docs/en/terminal-config)
- [Project setup](/docs/general-tips/project-setup)
- [CLI and IDE](/docs/cli/cli-and-ide)
