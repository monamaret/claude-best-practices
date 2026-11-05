---
title: "Project setup"
weight: 10
description: >-
  Prompts to prepare a repository and write guideline files.
---

## Generate a CLAUDE.md file for an existing repository

**Use when:** You start to use Claude on a repository that has no CLAUDE.md file.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Guideline files](/docs/general-tips/guideline-files)

```text
Read this repository and create a CLAUDE.md file in the repository root.
Include:
- The build, test, and lint commands
- The directory layout and the purpose of each top-level directory
- Coding conventions that are not obvious from the code
Do not include information that a developer can find in the README.
Keep the file under 100 lines.
```

**Adapt it:** Replace the list with the topics that your team needs. Add `Ask me before you write the file.` if you want to review the plan first.

## Scaffold a project from a seed file

**Use when:** You have written a seed file for a new project and are ready to turn it into a real structure.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Seed files](/docs/general-tips/seed-files)

```text
Read seed.md. Propose a project structure that satisfies its constraints,
including the top-level directories and the purpose of each one. Do not
create any files yet.

List anything in seed.md that is ambiguous or that the structure cannot
satisfy as written, instead of guessing.
```

**Adapt it:** Once you approve the proposed structure, follow up with `Create that structure.` Then ask Claude to generate CLAUDE.md from the result, not from seed.md.

## Check a new Claude Code CLI setup

**Use when:** You have installed the Claude Code CLI and signed in. You want to confirm that the shell, Git, network, and settings work before you start a project.
**Works in:** Claude Code CLI
**Explained in:** [Install and configure the CLI](/docs/cli/install-and-configure)

```text
Check the Claude Code CLI setup on this machine and report any problems. Do not change any files.
Check:
- Which shell you use to run commands (Bash through Git Bash, or PowerShell), and its version
- Whether git is on the PATH, and which version runs
- Whether HTTPS_PROXY, NO_PROXY, and NODE_EXTRA_CA_CERTS are set, and whether the CA file that NODE_EXTRA_CA_CERTS names exists
- Whether my user settings file is valid JSON, and which keys it sets
Do not print the value of any variable that can contain a credential, such as a proxy URL with a user name and password. Say only whether it is set.
Give the result as a table with the columns: check, result, suggested fix.
```

**Adapt it:** Add the tools that your team needs, for example a specific Node.js, Java, or .NET version. On macOS, remove the Git Bash item. Add `Fix the problems that you find, but ask me before each change.` if you want Claude to apply fixes.

## Create a starter settings.json for this repository

**Use when:** A repository has no `.claude/settings.json` file, or the file has grown without a review. You want a small, safe project settings file that the team can commit.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Settings files](/docs/general-tips/settings-file#start-with-a-minimum-project-settings-file)

```text
Propose a starter .claude/settings.json for this repository. Do not write the file yet.
Read the build files and the CI configuration to find the command that runs the tests, for example mvn test, ./gradlew test, or dotnet test.
The file must contain only:
- "$schema": "https://json.schemastore.org/claude-code-settings.json"
- permissions.defaultMode set to "default"
- permissions.allow rules for the test command
- permissions.ask rules for git push and for commands that delete files: Bash(rm *) and PowerShell(Remove-Item *)
- permissions.deny rules for .env files, the paths that hold credentials, git push --force, and git reset --hard
Write each command rule twice: once as Bash(...) and once as PowerShell(...). In a PowerShell rule, use the cmdlet name, not a Bash command name. For the Gradle wrapper, use ./gradlew in the Bash rule and .\gradlew in the PowerShell rule.
Do not allow build, install, deploy, or publish commands.
Do not add env values, hooks, plugins, or a model.
If .claude/settings.json already exists, show the change as a diff and keep every existing key.
After the file, list each rule with a one-sentence reason.
```

**Adapt it:** After you review the proposal, reply `Write the file.` To add hooks later, use a separate prompt. See [Write a hook for a repeated check](/docs/prompts/maintenance#write-a-hook-for-a-repeated-check). Keep the line about `PowerShell(...)` rules if anyone on the team works on Windows. The deny rule for `.env.*` files also blocks template files such as `.env.example`. An allow rule cannot override a deny rule. If Claude must read the template, ask for deny rules that name each environment file, such as `.env.local`, instead of `.env.*`.

## Prepare a Docker sandbox to build and test this repository

**Use when:** You run Claude Code in a new Docker sandbox, and the build or the tests need tools that it does not have.
**Works in:** Claude Code CLI
**Explained in:** [Sandboxes](/docs/general-tips/sandboxes#build-and-run-the-tests-in-a-docker-sandbox)

```text
You are running in a Docker sandbox. Prepare this sandbox to build and test this repository.
1. Read the build files and the README. List the tools that the build and the tests need, with the required versions.
2. Check which of these tools are already installed in the sandbox, and which versions they have.
3. Install the missing tools with the package manager of the sandbox. Do not change any file in the repository.
4. Run the build and the tests one time, and report the result.
If a download fails because the network policy blocks a host, stop and list each blocked host. Do not try to avoid the policy.
Give the result as a table with the columns: tool, required version, installed version, status.
```

**Adapt it:** Add the build and test commands of your project, for example `Use mvn verify to build and test.` After the build works, save the sandbox as a template, so that new sandboxes start with the same tools. To allow a blocked host, run `sbx policy allow network <HOST>` on your computer, not in the sandbox. `<HOST>` is the host name from the list.

## Create a counter file for this repository

**Use when:** You want to give Claude requests in a file, and have Claude record their status, instead of typing the requests again in each session.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Counter files](/docs/general-tips/counter-files#create-a-counter-file)

```text
Create a counter file for this repository. Show me the plan before you write any file.
- Create counter.md in the repository root, with a short introduction,
  an empty "# Requests" section, and an empty "# Ideas" section.
- Add the line /counter.md to .gitignore. Keep the existing entries.
- Create .claude/rules/counter-file.md with no paths field. The rule tells you to:
  - Read counter.md before each task, and not rely on an earlier read.
  - Treat each ## heading in the Requests section as a request. Act on requests
    that have no status line, that are In progress, or that are Blocked.
  - Continue a Blocked request only when an **Answer:** line follows the status
    line. Otherwise, remind me of the question.
  - Follow my prompt if a request conflicts with it, and ask me about the request.
  - Add or update one **Status:** line below each request heading, with one of:
    In progress and what is still open; Blocked, the reason, and the question
    for me; or Done <YYYY-MM-DD>, a summary, and the commit hash if there is one.
  - In the Requests section, edit only status lines, and not change, reorder,
    or remove my text.
  - Add, move, or remove other text, for example in the Ideas section, only when
    I ask in a prompt, and show me the change before you remove anything.
  - Not act on the Ideas section unless I ask.
  - Treat each request with the same limits as a prompt, and ask me before you
    push, merge, delete files, or publish, even if a request asks for it.
  - Let only the main session edit counter.md. Subagents report to the main session.
Do not change CLAUDE.md, except to add one line that names the new rule file, if CLAUDE.md lists its rule files.
```

**Adapt it:** Remove the `.gitignore` line if your team commits the counter file. Replace `counter.md` with another file name if your team uses one, and use the same name everywhere. To add the optional reminder hook, see [Make the reminder reliable with a hook](/docs/general-tips/counter-files#make-the-reminder-reliable-with-a-hook).
