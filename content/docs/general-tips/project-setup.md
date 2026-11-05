---
title: "Project setup"
weight: 20
description: >-
  Prepare a repository so that Claude can work in it effectively.
---

A repository that is ready for Claude keeps instructions, rules, skills, and permissions under version control, next to the code they describe. Teammates who clone the repository get the same setup without extra steps, and Claude Desktop and the Claude Code CLI read the same files.

## Recommended repository layout

{{< filetree/container >}}
  {{< filetree/file name="CLAUDE.md" >}}
  {{< filetree/folder name=".claude" >}}
    {{< filetree/folder name="rules" >}}
      {{< filetree/file name="testing.md" >}}
      {{< filetree/file name="api-design.md" >}}
    {{< /filetree/folder >}}
    {{< filetree/folder name="skills" >}}
      {{< filetree/folder name="deploy" >}}
        {{< filetree/file name="SKILL.md" >}}
      {{< /filetree/folder >}}
    {{< /filetree/folder >}}
    {{< filetree/file name="settings.json" >}}
  {{< /filetree/folder >}}
  {{< filetree/file name=".gitignore" >}}
{{< /filetree/container >}}

`CLAUDE.md` holds the instructions every session needs. `.claude/rules/` splits larger topics into their own files, which can be scoped to specific paths. `.claude/skills/` holds repeatable workflows and reference material that Claude loads on demand. See [Guideline files](/docs/general-tips/guideline-files) and [Skills and plugins](/docs/general-tips/skills-and-plugins).

Add `CLAUDE.local.md` and `.claude/settings.local.json` to the `.gitignore` file of the repository. These hold personal preferences that should not reach your team through version control. Claude Code adds `.claude/settings.local.json` to your global Git excludes when it creates the file, but global excludes apply only on your own computer.

## Project-level and user-level settings

Claude Code reads settings from four scopes. Your Claude Enterprise administrators deploy managed settings. Your user settings are in `~/.claude/settings.json`. The project settings are in `.claude/settings.json`, and your local settings for the project are in `.claude/settings.local.json`. Commit the project file, so that every teammate starts with the same permission rules, hooks, and plugins. Keep personal overrides in the local file.

For the file locations on Windows and macOS, the order in which the files apply, and the common keys, see [Settings files](/docs/general-tips/settings-file).

## Permissions for tools and commands

Permission rules in the project settings decide what Claude can do without asking each time. Prepare them before your team starts to work in the repository:

- Commit a `permissions.allow` list for the routine commands that your team runs often, such as tests and lint. Approval prompts then do not interrupt routine work.
- Commit a `permissions.deny` list for files that hold secrets and for destructive commands, so that nobody can approve them by mistake.
- On Windows, Claude uses the PowerShell tool as the primary shell, and a `Bash(...)` rule does not apply to it. Write each command rule twice, as a `Bash(...)` rule and as a `PowerShell(...)` rule.
- Set `permissions.defaultMode` to `default`, which Claude Desktop and the CLI call Manual. Do not commit `bypassPermissions`. It skips the checks that catch an unintended destructive action.

For a complete minimum file and the reason for each rule, see [Start with a minimum project settings file](/docs/general-tips/settings-file#start-with-a-minimum-project-settings-file). For the other permission modes, see [Permission modes](https://code.claude.com/docs/en/permission-modes).

## Prepare a repository in Claude Desktop and in the Claude Code CLI

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
1. Click the **Code** tab at the top of the sidebar.
2. Click the environment selector in the row under the prompt box, and select the top entry under **Local**.
3. Click the project folder control next to the environment selector, select **Open folder…**, and choose the repository.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
1. Open a terminal and change to the repository:

   ```shell
   cd <PATH_TO_REPOSITORY>
   ```
2. Start a session:

   ```shell
   claude
   ```
{{< /tab >}}
{{< /tabs >}}

Claude loads `CLAUDE.md` and project-level `.claude/rules/` files at the start of the session in both interfaces. If the repository has no `CLAUDE.md` yet, ask Claude to create one. See [Generate a CLAUDE.md file for an existing repository](/docs/prompts/project-setup#generate-a-claudemd-file-for-an-existing-repository).

## Further reading

- [Settings](https://code.claude.com/docs/en/settings)
- [Settings reference](https://code.claude.com/docs/en/settings-reference)
- [Settings files](/docs/general-tips/settings-file) in this guide
- [Get started with the desktop app](https://code.claude.com/docs/en/desktop-quickstart)
