---
title: "Plugins"
weight: 50
description: >-
  Install, share, and create plugins that bundle skills, subagents, hooks, and MCP servers.
---

A plugin is a directory of skills, subagents, hooks, MCP servers, and other components that Claude Code installs and loads as one unit. You install plugins from a marketplace, which is a catalog that lists plugins and the location of each one. A plugin gives several repositories the same setup, with one install command and versioned updates.

This page describes how to find, review, install, share, and create plugins. For how to write a skill, see [Skills and plugins](/docs/general-tips/skills-and-plugins).

## What a plugin contains

A plugin can contain any mix of these components:

- **Skills:** `SKILL.md` instructions that Claude loads when a task needs them, or that you run as a command.
- **Subagents:** agent definitions that Claude can delegate a task to.
- **Hooks:** commands that Claude Code runs at points in its lifecycle, such as after each file edit. See [Hooks](/docs/cli/hooks).
- **MCP servers:** tool servers that Claude Code connects to while the plugin is enabled.

An optional manifest at `.claude-plugin/plugin.json` gives the plugin its name, a version, and a description. Without a manifest, Claude Code loads the components from the standard layout and takes the name from the marketplace entry or the directory name. See [Plugin manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference). Plugins can also contain other component types, such as LSP servers and executables. See [Plugin components](https://code.claude.com/docs/en/plugins/components) for the full list.

### Choose a plugin or files in `.claude/`

Skills, subagents, and hooks work without a plugin. Commit them to `.claude/` when one repository needs them. Package them as a plugin when the same setup must work in more than one repository.

| | Files in `.claude/` | Plugin |
| --- | --- | --- |
| Reach | One repository | Any repository, through a marketplace |
| Updates | Each repository changes its own copy | One release that every user can update to |
| Versions | Follow the repository history | A `version` in the manifest, or a git tag |
| Names | `/deploy` | `/<PLUGIN_NAME>:deploy`, so that two plugins can each have a `deploy` skill |

Do not move a setup into a plugin only because a plugin exists. A plugin adds a release step, and a change to a skill then needs a new release before teammates get it.

## Marketplaces

A marketplace is a git repository, a directory, or a URL that holds a `.claude-plugin/marketplace.json` file. The file lists plugins and where to fetch each one. You add a marketplace one time, and then install its plugins by name, in the form `<PLUGIN_NAME>@<MARKETPLACE_NAME>`.

Anthropic's official marketplace is `claude-plugins-official`. Claude Code adds it the first time you start an interactive Claude Code CLI session, unless a managed policy blocks it. Every marketplace that Anthropic does not publish is a third-party marketplace, including one that your own team publishes. See [Anthropic's marketplaces](https://code.claude.com/docs/en/plugins/anthropic-marketplaces).

## Review a plugin before you install it

{{< callout type="warning" >}}
A plugin can run code on your machine with your user permissions. Its hooks, monitors, MCP servers, LSP servers, and mods run outside the built-in sandbox, and your permission rules do not apply to them. Executables in the plugin `bin/` directory run through Claude's Bash tool, so your permission rules and the built-in sandbox do apply to them. Review every plugin before you install it, whatever marketplace it comes from. To try a plugin that you have not reviewed, use a Docker sandbox. See [Sandboxes](/docs/general-tips/sandboxes).
{{< /callout >}}

1. Run the following command in your shell to show the source of each marketplace that you added:

   ```shell
   claude plugin marketplace list
   ```

2. In a CLI session, run `/plugin` and open the plugin. Read the **Will install** section, which lists the skills, subagents, hooks, and MCP servers that the plugin adds.
3. Open the plugin source. In the details pane, select **Open homepage** or **View on GitHub**, or open the marketplace repository from step 1.
4. Read the commands that the plugin runs. The **Will install** section shows that a hook exists, but not what it runs. Check these files in the plugin directory:
   - `hooks/hooks.json`: the command that each hook runs. A `modules` key in this file means that the plugin is a mod, which runs JavaScript inside Claude Code.
   - `monitors/monitors.json`: the background commands that start with the session.
   - `.mcp.json` and `.lsp.json`: the command or URL of each MCP server and LSP server.
   - `bin/`: every file in the directory.
5. Clone the repository that holds the plugin. Then run the following command in your shell to list what the plugin contains, without installing it:

   ```shell
   claude --plugin-dir <PLUGIN_DIR> plugin details <PLUGIN_NAME>
   ```

   The command prints a `Component inventory` with the skills, subagents, hooks and their events, and the MCP and LSP servers. Replace `<PLUGIN_DIR>` with the path to the plugin directory in your clone.

6. After you install the plugin, run `claude plugin details <PLUGIN_NAME>` to list what the installed copy contains.

Auto-update can change the files that you reviewed. Auto-update is off by default for third-party marketplaces. If you enable it, review each update in the same way.

To have Claude help with the review, see [Review a plugin before you install it](/docs/prompts/review#review-a-plugin-before-you-install-it). Read the hook and MCP server commands yourself before you install.

## Install a plugin

An install scope decides who gets the plugin and which settings file records it:

| Scope | Settings file | Choose it when |
| --- | --- | --- |
| User | `~/.claude/settings.json` | You want the plugin in every project on your machine. |
| Project | `.claude/settings.json` (committed) | Everyone who works in the repository needs the plugin. |
| Local | `.claude/settings.local.json` | You want the plugin only for yourself, only in this repository. |

When the same plugin is set at more than one scope, local overrides project, and project overrides user. See [Settings files](/docs/general-tips/settings-file). The CLI, the local sessions in Claude Desktop, and the VS Code extension read the same settings files. A plugin that you install at user scope in one of them is available in the others on the same computer.

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
1. Open a local session or an SSH session in the **Code** tab.
2. Select **+** next to the prompt box, and then select **Add plugins**. If the menu shows **Plugins** instead, select **Plugins** > **Browse plugins**.
3. Select the plugin, and read its details.
4. Select a scope: your user account, this project, or local only.

The plugin browser lists the plugins from the marketplaces that you added. Claude Desktop and the Claude Code CLI on one computer read the same settings files. To add a marketplace, use the commands in the **Claude Code CLI** tab.

Plugins are not available in cloud sessions or in WSL sessions in Claude Desktop.
<!-- SCREENSHOT: Claude Desktop Code tab, the + menu next to the prompt box with Add plugins visible -->
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
1. If the plugin is not in `claude-plugins-official`, add its marketplace. In a session, run the following command:

   ```text
   /plugin marketplace add <YOUR_ORG>/<MARKETPLACE_REPO>
   ```

   The source can also be a full git URL, a local path that starts with `./`, or the URL of a hosted `marketplace.json` file.

2. Run the following command. It opens the plugin details in the `/plugin` panel. It does not install the plugin yet.

   ```text
   /plugin install <PLUGIN_NAME>@<MARKETPLACE_NAME>
   ```

   To browse instead, run `/plugin` with no arguments. The **Discover** tab lists the plugins from your marketplaces.

3. Read the details pane, and then select a scope.
4. Read the last line of the install summary. If it says `Run /reload-plugins to apply.`, Claude Code reloads the plugins for you.
5. Type `/` and find the plugin skills, in the form `/<PLUGIN_NAME>:<SKILL_NAME>`.

To install from your shell without a session, for example in a setup script, run the following commands:

```shell
claude plugin marketplace add <YOUR_ORG>/<MARKETPLACE_REPO>
claude plugin install <PLUGIN_NAME>@<MARKETPLACE_NAME> --scope project
```

The shell command uses user scope when you do not pass `--scope`. Plugins that you install from the shell load in the next session, or after you run `/reload-plugins`.
{{< /tab >}}
{{< /tabs >}}

The placeholders are:

- `<YOUR_ORG>/<MARKETPLACE_REPO>`: the GitHub owner and repository of the marketplace.
- `<MARKETPLACE_NAME>`: the `name` field in the `marketplace.json` file of the marketplace. It can differ from the repository name.
- `<PLUGIN_NAME>`: the name of the plugin in the marketplace.

A private marketplace uses the git credentials that are already on your machine. Claude Code does not prompt for credentials. See [Add a private marketplace](https://code.claude.com/docs/en/plugins/install#add-a-private-marketplace).

## Manage plugins

{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
In a local session in the **Code** tab, select **+** > **Plugins** > **Manage plugins**. From there you can enable, disable, or uninstall a plugin.

To update a plugin or to check what it adds to context, use the commands in the **Claude Code CLI** tab.
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
In a session, run `/plugin` and press **Tab** to open the **Installed** tab. Select a plugin and press **Enter** for its actions: **Disable plugin** or **Enable plugin**, **Update now**, and **Uninstall**. Press **Space** to enable or disable the selected plugin directly.

From your shell, run the same actions as commands:

```shell
claude plugin list
claude plugin disable <PLUGIN_NAME>@<MARKETPLACE_NAME>
claude plugin enable <PLUGIN_NAME>@<MARKETPLACE_NAME>
claude plugin update <PLUGIN_NAME>@<MARKETPLACE_NAME>
claude plugin uninstall <PLUGIN_NAME>@<MARKETPLACE_NAME> --scope project
```

`enable` and `disable` change the most specific scope that already lists the plugin. `install` and `uninstall` change user scope unless you pass `--scope`.
{{< /tab >}}
{{< /tabs >}}

### Check what a plugin adds to context

An enabled plugin is part of every session, not only the sessions that use it. The name and description of each skill and subagent that Claude can invoke stay in context on every turn. Its MCP servers run, and its hooks fire on their events. See [Context](/docs/general-tips/context).

To check the cost of an installed plugin, run the following command in your shell:

```shell
claude plugin details <PLUGIN_NAME>
```

The `Always-on` line shows the number of tokens that the plugin adds to every session. The rows below it show which skill or subagent adds the most. In a session, the **Installed** tab in `/plugin` groups the plugins that you have not used recently under **Not used recently**. Disable or uninstall those plugins. See [Measure plugin cost and usage](https://code.claude.com/docs/en/plugins/measure).

### Opt out of a plugin that the project enables

A plugin that `.claude/settings.json` enables stays enabled if you disable it in `~/.claude/settings.json`, because project settings override user settings. To disable it only for yourself, set it to `false` in `.claude/settings.local.json`. In `/plugin`, select **Uninstall** for the plugin and press **y** to do this for you.

## Share plugins with a team

To give everyone who works in a repository the same plugins, commit the marketplace and the plugins to the project settings file. Claude Code registers the marketplace when a teammate opens the repository, after they accept the workspace trust dialog. In a folder that the teammate has not trusted, Claude Code ignores the marketplace entry without a message.

```json {filename=".claude/settings.json"}
{
  "extraKnownMarketplaces": {
    "<MARKETPLACE_NAME>": {
      "source": {
        "source": "github",
        "repo": "<YOUR_ORG>/<MARKETPLACE_REPO>"
      }
    }
  },
  "enabledPlugins": {
    "<PLUGIN_NAME>@<MARKETPLACE_NAME>": true
  }
}
```

The placeholders are:

- `<MARKETPLACE_NAME>`: the `name` field in the `marketplace.json` file. The key in `extraKnownMarketplaces` must match it.
- `<YOUR_ORG>/<MARKETPLACE_REPO>`: the GitHub repository of the marketplace. For another git host, use `"source": "git"` and a `"url"` field instead of `"repo"`.
- `<PLUGIN_NAME>`: the name of the plugin entry in the marketplace.

A plugin that is stored inside the marketplace repository, at a relative path, loads after the marketplace is registered. A plugin that the marketplace fetches from another source, such as its own repository, does not install from these settings alone. Each teammate then runs the following command one time:

```shell
claude plugin install <PLUGIN_NAME>@<MARKETPLACE_NAME> --scope project
```

Keep the plugins that the whole team needs inside the marketplace repository, so that teammates do not need this step.

{{< callout type="important" >}}
A Claude Enterprise administrator can control plugins through managed settings. Managed settings can allow or block marketplace sources (`strictKnownMarketplaces` and `blockedMarketplaces`), and they can enable or block plugins for every user. A managed value always applies. If a marketplace or a plugin does not load, ask your administrator. See [Manage plugins for your organization](https://code.claude.com/docs/en/plugins/org).
{{< /callout >}}

## Create a plugin

Create and test a plugin in the CLI. The procedure uses the `--plugin-dir` option of the CLI, which loads a plugin from a directory for one session. The procedure packages an existing repository skill, a subagent, and a hook into a plugin named `release-helper`. It then publishes the plugin in a marketplace named `team-tools`. Replace both names with your own.

To have Claude do these steps for an existing `.claude/` directory, see [Package repository skills into a plugin](/docs/prompts/maintenance#package-repository-skills-into-a-plugin).

{{% steps %}}

### Create the directory layout

Create a directory for the plugin, with a `.claude-plugin/` directory inside it. Put the component directories at the plugin root, next to `.claude-plugin/`, not inside it. Components inside `.claude-plugin/` do not load.

{{< filetree/container >}}
  {{< filetree/folder name="release-helper" >}}
    {{< filetree/folder name=".claude-plugin" >}}
      {{< filetree/file name="plugin.json" >}}
    {{< /filetree/folder >}}
    {{< filetree/folder name="skills" >}}
      {{< filetree/folder name="write-release-notes" >}}
        {{< filetree/file name="SKILL.md" >}}
      {{< /filetree/folder >}}
    {{< /filetree/folder >}}
    {{< filetree/folder name="agents" >}}
      {{< filetree/file name="release-reviewer.md" >}}
    {{< /filetree/folder >}}
    {{< filetree/folder name="hooks" >}}
      {{< filetree/file name="hooks.json" >}}
    {{< /filetree/folder >}}
    {{< filetree/folder name="scripts" >}}
      {{< filetree/file name="check-changelog.js" >}}
    {{< /filetree/folder >}}
  {{< /filetree/folder >}}
{{< /filetree/container >}}

Add only the directories that you use. An MCP server goes in `.mcp.json` at the plugin root.

### Write the manifest

Create the manifest. Only `name` is required. The `name` becomes the prefix of every skill and subagent in the plugin, so do not use spaces.

```json {filename="release-helper/.claude-plugin/plugin.json"}
{
  "name": "release-helper",
  "description": "Skills, a subagent, and a hook for preparing releases",
  "version": "1.0.0",
  "author": {
    "name": "<TEAM_NAME>"
  }
}
```

Replace `<TEAM_NAME>` with the name of the team that maintains the plugin. When `version` is set, users stay on that version until you change it. See [Plugin manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference).

### Add a skill

Copy an existing skill directory from the repository into `skills/`. The skill file does not change.

```shell
cp -r .claude/skills/write-release-notes release-helper/skills/
```

In the plugin, the skill runs as `/release-helper:write-release-notes`. To write a new skill, see [Skills and plugins](/docs/general-tips/skills-and-plugins#create-a-skill).

### Add a subagent

Create one Markdown file for each subagent in `agents/`:

```markdown {filename="release-helper/agents/release-reviewer.md"}
---
name: release-reviewer
description: >-
  Reviews a release branch before it is tagged. Use when the user asks
  whether a branch is ready to release.
---

Compare the release branch with the last tag. Report:

1. Changes that are not in the changelog.
2. Migrations or configuration changes that need a release note.
3. Tests that were skipped or removed since the last tag.

Do not edit files. Return the report as a markdown list.
```

In the plugin, the subagent is named `release-helper:release-reviewer`. See [Subagents](https://code.claude.com/docs/en/sub-agents) for the other frontmatter fields.

### Add a hook

Create `hooks/hooks.json`. It has a top-level `hooks` key, with the same structure as the `hooks` object in a settings file. Use `${CLAUDE_PLUGIN_ROOT}` for paths inside the plugin, because you do not know where the plugin is installed.

```json {filename="release-helper/hooks/hooks.json"}
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/check-changelog.js"]
          }
        ]
      }
    ]
  }
}
```

The hook uses exec form: `command` names the executable, and `args` holds its arguments. Claude Code starts `node` directly, without a shell, so the hook works the same on Windows and macOS. Each element of `args` is one argument, so a path with spaces needs no quotes. See [Exec form and shell form](https://code.claude.com/docs/en/hooks#exec-form-and-shell-form).

Create the script that the hook runs:

```javascript {filename="release-helper/scripts/check-changelog.js"}
// Remind Claude to update the changelog after it edits a file in src/.
let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  const event = JSON.parse(input);
  // Windows paths use backslashes. Normalize them before the match.
  const filePath = (event.tool_input?.file_path ?? "").replaceAll("\\", "/");
  if (filePath.includes("/src/")) {
    const output = {
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext:
          "A file in src/ changed. Add an entry to CHANGELOG.md if users can see the change.",
      },
    };
    console.log(JSON.stringify(output));
  }
});
```

The hook needs Node.js on your `PATH`. For a `PostToolUse` hook, Claude Code writes plain text output only to the debug log. The script prints JSON with an `additionalContext` field, so that the reminder reaches Claude. See [Hooks](/docs/cli/hooks) for hook events, exit codes, and shell behavior on Windows.

A plugin hook fires on its events in every session where the plugin is enabled, not only when a plugin skill runs. Keep the `matcher` narrow.

### Validate the plugin

Run the following command in your shell. It checks the manifest and the frontmatter of each skill and subagent.

```shell
claude plugin validate ./release-helper
```

The command prints `Validation passed` when the plugin is valid. If it prints `Validation failed`, each line above the result names a field to fix.

### Test the plugin locally

Start a session with the plugin loaded. Nothing is installed, and the plugin loads only in this session.

```shell
claude --plugin-dir ./release-helper
```

Test each component under its new name:

- Run `/release-helper:write-release-notes`.
- Ask Claude to use the `release-helper:release-reviewer` subagent.
- Ask Claude to edit a file in `src/`, and confirm that Claude mentions the changelog. The reminder does not show as a chat message. To see it, add `--debug` to the start command, and read the log in `~/.claude/debug/`. See [Debug hooks](https://code.claude.com/docs/en/hooks#debug-hooks).

After you edit a plugin file, run `/reload-plugins` in the session to load the change. If a component is missing, run `/plugin` and open the **Errors** tab.

If the original files are still in `.claude/` in the repository, both copies load. Skills and subagents do not conflict because of the plugin prefix, but a hook that is in both places runs two times. Remove the originals after the plugin works.

### Publish the plugin in a marketplace

Create a marketplace repository with the plugin in a `plugins/` directory:

{{< filetree/container >}}
  {{< filetree/folder name="<MARKETPLACE_REPO>" >}}
    {{< filetree/folder name=".claude-plugin" >}}
      {{< filetree/file name="marketplace.json" >}}
    {{< /filetree/folder >}}
    {{< filetree/folder name="plugins" >}}
      {{< filetree/folder name="release-helper" >}}
        {{< filetree/folder name=".claude-plugin" >}}
          {{< filetree/file name="plugin.json" >}}
        {{< /filetree/folder >}}
      {{< /filetree/folder >}}
    {{< /filetree/folder >}}
  {{< /filetree/folder >}}
{{< /filetree/container >}}

List the plugin in the marketplace file. Write each `source` as a path from the marketplace root, which is the directory that contains `.claude-plugin/`. Keep the entry `name` the same as the `name` in `plugin.json`.

```json {filename="<MARKETPLACE_REPO>/.claude-plugin/marketplace.json"}
{
  "name": "team-tools",
  "description": "Plugins that the team uses in several repositories",
  "owner": {
    "name": "<TEAM_NAME>"
  },
  "plugins": [
    {
      "name": "release-helper",
      "source": "./plugins/release-helper",
      "description": "Skills, a subagent, and a hook for preparing releases"
    }
  ]
}
```

Validate the marketplace, then add it locally and install the plugin from it before you push:

```shell
claude plugin validate ./<MARKETPLACE_REPO>
claude plugin marketplace add ./<MARKETPLACE_REPO>
claude plugin install release-helper@team-tools
```

Push the repository to your git host. Anyone who can clone the repository can install from it, so a private repository gives a private marketplace. Teammates add it with `claude plugin marketplace add <YOUR_ORG>/<MARKETPLACE_REPO>`, or through the project settings in [Share plugins with a team](#share-plugins-with-a-team).

{{% /steps %}}

### Release an update

Change the `version` in `plugin.json` for each release. When `version` is set, users do not get a change until the version changes. Teammates update with `claude plugin update release-helper@team-tools`, or automatically if they enable auto-update for the marketplace. See [Publish and distribute a plugin](https://code.claude.com/docs/en/plugins/publish).

## Related prompts

- [Package repository skills into a plugin](/docs/prompts/maintenance#package-repository-skills-into-a-plugin)
- [Review a plugin before you install it](/docs/prompts/review#review-a-plugin-before-you-install-it)
- [Turn a repeated procedure into a skill](/docs/prompts/maintenance#turn-a-repeated-procedure-into-a-skill)

## Further reading

- [Plugins overview](https://code.claude.com/docs/en/plugins/overview)
- [Install and manage plugins](https://code.claude.com/docs/en/plugins/install)
- [Plugin security and trust](https://code.claude.com/docs/en/plugins/security)
- [Create a plugin](https://code.claude.com/docs/en/plugins/create)
- [Plugin components](https://code.claude.com/docs/en/plugins/components)
- [Create a marketplace](https://code.claude.com/docs/en/plugins/create-marketplace)
- [Plugin commands reference](https://code.claude.com/docs/en/plugins/cli-reference)
- [Manage plugins for your organization](https://code.claude.com/docs/en/plugins/org)
- [Install plugins in Claude Desktop](https://code.claude.com/docs/en/desktop#install-plugins)
- [Skills and plugins](/docs/general-tips/skills-and-plugins) and [Hooks](/docs/cli/hooks) in this guide
