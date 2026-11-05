---
title: "Review"
weight: 70
description: >-
  Prompts to review code, plans, and guideline files.
---

## Audit guideline files for conflicts

**Use when:** Your CLAUDE.md and `.claude/rules/` files have grown over time, or you want to check them before onboarding a new teammate.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Guideline files](/docs/general-tips/guideline-files)

```text
Review CLAUDE.md and every file under .claude/rules/ for problems:
- Instructions written for a project state that no longer exists
- References to files, commands, or settings that do not exist
- Two files that give different guidance for the same situation
Report what you find. Do not change any file until I confirm the fix.
```

**Adapt it:** If your session supports it, run [`/doctor prompt-audit`](https://code.claude.com/docs/en/memory#audit-your-instruction-files) instead, which performs the same check as a built-in command. Use this prompt when that command is unavailable, or when you want Claude to explain each finding in more detail.

## Review the selected code before you change it

**Use when:** You select code that you do not know well in VS Code, and you want to understand it before you ask Claude to change it.
**Works in:** Claude Code CLI
**Explained in:** [CLI and IDE](/docs/cli/cli-and-ide)

```text
Review the code that I selected. Do not change any files yet.
Explain:
- What the code does, and which callers depend on it
- The inputs, outputs, and side effects
- Assumptions that the code makes and does not check
- The tests that cover it, or say that there are none
Then list the risks of changing it to <INTENDED_CHANGE>.
```

**Adapt it:** Replace `<INTENDED_CHANGE>` with a short description of the change that you plan, for example `support a second currency`. If you do not plan a change yet, remove the last line. In the CLI, select the code in VS Code while the CLI is connected through `/ide`, or add an @-mention with the file and line range.

## Review a plugin before you install it

**Use when:** You want to install a plugin from a third-party marketplace and need to know what it runs on your machine.
**Works in:** Claude Code CLI
**Explained in:** [Plugins](/docs/cli/plugins#review-a-plugin-before-you-install-it)

```text
Review the Claude Code plugin in <PLUGIN_DIR> before I install it. Do not
run any script, hook, or server from the plugin.

Report:
- Every hook in hooks/hooks.json and in plugin.json: the event, the matcher,
  and the exact command it runs. Say whether hooks.json has a modules key,
  which makes the plugin a mod.
- Every monitor in monitors/monitors.json and the command it runs
- Every MCP server in .mcp.json and LSP server in .lsp.json: the command or
  URL, and the arguments
- Every file in bin/ and every script that a hook, monitor, or server calls,
  with a summary of what it does
- Network access, file writes outside the project, and access to
  credentials or environment variables
- Skills and subagents whose instructions tell Claude to do something that
  the description does not mention

End with a list of risks, ordered from most to least serious.
```

**Adapt it:** Replace `<PLUGIN_DIR>` with the path to a clone of the plugin. Clone the marketplace repository first, so that Claude reads the files and does not install anything. Read the hook and server commands yourself before you install.

## Review the hooks in a repository before you trust it

**Use when:** You clone a repository that you did not write, and it has a `.claude/` directory. Use it before you trust the folder or run `claude -p` in it.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Hooks](/docs/cli/hooks#security)

```text
Do not run any commands. Read only.
List every hook that this repository configures. Check
.claude/settings.json, .claude/settings.local.json, the scripts that
they reference, and the hooks in any skill or subagent frontmatter
under .claude/. For each hook, report:
- The event and the matcher
- The exact command, and a summary of what the script does
- Any file deletes, network access, credential or environment reads,
  or commands that it downloads and runs
Mark each hook as expected, unclear, or risky, and give the reason.
```

**Adapt it:** Replace each `.claude/` path with the path to the clone, for example `<CLONE_PATH>/.claude/settings.json`. Start Claude Code in a different directory that you already trust, and give it the path to the clone. The settings of the clone do not load when it is not the working directory, so its hooks do not run. Do not use `claude -p` for this review. Add `Also check the plugins that .claude/settings.json enables.` if the repository declares plugins.

## Review a change to settings.json

**Use when:** A pull request or your own branch changes `.claude/settings.json`. Use it before you approve or merge the change.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Settings files](/docs/general-tips/settings-file#good-practice)

```text
Review the change to the .claude/ directory in the branch <BRANCH>, compared to <BASE_BRANCH>.
Use git diff <BASE_BRANCH>...<BRANCH> -- .claude/ for the change, and git show to read files from that branch.
Do not check out the branch. Run only read-only git commands. Do not change any files.
Report:
- Each permissions.allow rule that the change adds, what it lets Claude run without a prompt, and a narrower rule if one would work
- Each permissions.deny or permissions.ask rule that the change removes or makes weaker
- Command rules that have no equivalent for the other shell. Treat a Bash command and its PowerShell cmdlet as a pair, for example Bash(rm *) and PowerShell(Remove-Item *)
- A permissions.defaultMode value other than "default" or "manual", and any bypassPermissions value
- New or changed hooks, and a summary of each script that they run
- New entries in extraKnownMarketplaces and enabledPlugins
- env values that look like secrets, tokens, internal host names, or paths on one computer
- A .claude/settings.local.json file that the change adds to version control
Mark each finding as expected, unclear, or risky, and give the reason.
```

**Adapt it:** Replace `<BRANCH>` with the branch that you review, and `<BASE_BRANCH>` with the branch that it merges into, for example `main`. Run `git fetch` first, so that the branch exists in your clone. Do not check out a teammate's branch to review it, because its settings and hooks then load in your sessions.

## Summarize a branch before you open a pull request

**Use when:** Your branch is ready for review, and you want a first draft of the pull request description.
**Works in:** Claude Code CLI
**Explained in:** [Non-interactive mode](/docs/cli/non-interactive-mode#summarize-a-branch-before-you-open-a-pull-request)

```text
The input on stdin is the commit log and the diff of the current branch compared to <BASE_BRANCH>.
Write a pull request description in Markdown with these sections:
- Summary: two or three sentences about the purpose of the change
- Changes: a bulleted list, grouped by area of the code
- Testing: the tests that the diff adds or changes, or "No test changes"
- Risks: anything that a reviewer must check with care
Describe only changes that are in the diff. Print only the description.
```

**Adapt it:** Replace `<BASE_BRANCH>` with the branch that you merge into, for example `main`. Pipe in the output of `git log <BASE_BRANCH>..HEAD` and `git diff <BASE_BRANCH>...HEAD`. If your repository has a pull request template, add `Use the sections of the template in <TEMPLATE_PATH> instead.` Replace `<TEMPLATE_PATH>` with the path to the template.

## Check a staged diff before you commit

**Use when:** You want a second review of a staged change before Git creates the commit, for example in a Git pre-commit hook.
**Works in:** Claude Code CLI
**Explained in:** [Non-interactive mode](/docs/cli/non-interactive-mode#check-the-staged-diff-in-a-pre-commit-hook)

```text
Review the staged Git diff on stdin before it is committed.
Report only these problems in the changed lines:
- Obvious bugs, such as a wrong condition, a missing null check, or an unhandled error
- Debug code or temporary output that was left in
- Code that cannot compile or run, such as a syntax error or a call to a removed function
Do not comment on style or naming. Do not change any files.
On the first line, print exactly one word: PASS, WARN, or BLOCK.
Use BLOCK only for code that cannot compile or run. Use WARN for the other problems.
After the first line, list each problem as file:line and one sentence.
```

**Adapt it:** Keep the first-line rule if a script reads the result, because the example hook reads only the first line that is not blank. Add a problem type to the list, for example `- Changes to public APIs without a matching test change`. Do not add secret detection. The diff is already sent when Claude finds a secret, so use a secret scanner for that.

## Review the changes from a sandbox session before you commit

**Use when:** A Claude Code session in a Docker sandbox changed your working tree, and you want to check the changes before you commit.
**Works in:** Claude Code CLI
**Explained in:** [Sandboxes](/docs/general-tips/sandboxes#how-changes-return-to-your-files)

```text
Review the uncommitted changes in this repository. An agent made them in a session with few permission checks. Do not change any files.
1. Before you run any git command, read .git/config and .gitattributes as text files. Report each setting that runs a command, such as core.fsmonitor, core.hooksPath, core.sshCommand, and diff, merge, or filter drivers.
2. List the files in .git/hooks, because git diff does not show them. Report each hook that is not a sample file.
3. Run git status --ignored and git diff. Summarize each change in one sentence. Read each new untracked file and each new ignored file.
4. List each changed or new file that can run code without an explicit command, such as CI configuration, build scripts, package manifests with scripts, IDE task files, files in .claude/, and .mcp.json.
Give the result as three lists: expected changes, changes to check, and problems.
```

**Adapt it:** Run this prompt on your computer, not in the Docker sandbox. Start the session with `claude --setting-sources user`, so that Claude Code does not load the project settings, hooks, and MCP servers that the agent could have changed. Do not run Git yourself until step 1 reports no problems. This prompt does not look for secrets. Run a secret scanner on the changes for that. For a clone-mode sandbox, the host `.git/config` stays unchanged. Fetch the branch first, and replace `git diff` with `git diff main..sandbox-<SANDBOX_NAME>/<BRANCH>`. `<SANDBOX_NAME>` is the name of the Docker sandbox, `<BRANCH>` is the branch that the agent created, and `main` is your base branch.

## Review an sbxenv.yaml file before you run it

**Use when:** A repository contains a Docker Sandboxes environment file, or a pull request changes one, and you must check it before you run it.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Sandboxes](/docs/general-tips/sandboxes#declare-the-environment-in-a-file)

```text
Review the file sbxenv.yaml before I run it with sbx env run. Do not change any files, and do not run sbx.
Report:
- Each lifecycle, secret, and MCP command, because these commands run on my computer with my permissions
- Each secret that has a literal value
- Each kit source and template image, and whether it is pinned to an image digest, not only a tag
- Each entry in workspace, additionalWorkspaces, and mounts, and whether a mount is writable when read-only access is enough
- Each entry in registries and bindings, and the domains that each binding approves
- Each published port, and whether it binds to an address other than loopback
- Whether sandboxOptions.writableEnvFiles is true
- Whether the file itself is inside a directory that the sandbox mounts with write access
Give the result as a table with the columns: field, value, risk, suggested change.
```

**Adapt it:** If the file has another name, replace `sbxenv.yaml` with its path. For a pull request, add `Review only the lines that this branch changes compared to main.` Replace `main` with your base branch.

## Review the counter file and promote ideas into tasks

**Use when:** The Ideas section of your counter file has grown, and you want to decide which ideas become work and which you remove.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Counter files](/docs/general-tips/counter-files#keep-ideas-for-a-later-session)

```text
Read the Ideas section of counter.md in the repository root. Do not change any files yet.
For each idea, check the current code and propose one action:
- request: move it to the Requests section as a new ## heading
- issue: it needs the team, so draft a title and a description for the issue tracker
- skill: it is a procedure that I repeat
- plan: it is a larger change that needs plan mode first
- guideline: it is a rule for every session, for CLAUDE.md or a rule file
- remove: it is done, out of date, or no longer useful
Give the result as a table with the columns: idea, action, reason.
Also list requests in the Requests section that are Done, so that I can remove them.
```

**Adapt it:** Replace `counter.md` with the path of your counter file. After you review the table, reply `Apply the request and remove actions. Show me each removal before you make it.` If Git ignores the counter file, a removal cannot be undone. Create issues yourself from the drafts, or confirm each issue before Claude creates one with an MCP server or a command-line tool.
