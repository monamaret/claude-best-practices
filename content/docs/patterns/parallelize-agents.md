---
title: "Parallelize work across many agents"
weight: 70
description: >-
  Run several agents on several features at once, with the GitHub, repository, and local setup that keeps them from claiming the same work twice.
tags:
  - under-review
---

[Orchestrate several agents as one task](/docs/version-control/headless-and-multi-agent-git#orchestrate-several-agents-as-one-task) covers one task that splits into subtasks, each as its own background session and worktree. This page extends that pattern to several independent features, issues, or tasks, each with its own agent, running at the same time. That needs two things the single-task pattern does not. It needs a shared backlog that assigns work without two agents claiming the same item. It also benefits from a tool that manages many worktrees and agent processes for you, instead of you scripting each one yourself.

This page covers sessions that you dispatch from your own machine, under your own Claude Enterprise sign-in. That is the same scope as [Headless and multi-agent Git workflows](/docs/version-control/headless-and-multi-agent-git). It does not cover running agents unattended in a pipeline. See [CI/CD and repository automation](/docs/cli/non-interactive-mode#cicd-and-repository-automation) for why that stays a separate, open question.

Background sessions, worktrees, and the tools on this page are only in the Claude Code CLI. Claude Desktop does not have them.

## Two separate jobs: assigning work, and running it

| Job | What handles it |
| --- | --- |
| Decide what is ready, and who is working on it | A shared backlog with atomic claims, for example [Beads](https://github.com/gastownhall/beads) |
| Run one isolated agent process per task | A worktree per task, started yourself, or a tool that manages many of them, for example [Orca](https://github.com/stablyai/orca) |

Use either one alone, or both together. Beads alone still needs you to start each agent session yourself. Orca alone still lets two agents pick the same work item, unless you coordinate that yourself. Together, Beads decides what is safe to start next, and Orca, or your own scripted worktrees, gives each one somewhere to run.

## Set up Beads as the shared backlog

[Recommended skills and plugins for this stage](/docs/workflows/planning#recommended-skills-and-plugins-for-this-stage) covers installing Beads and the Claude Code integration. This section covers what changes once more than one agent reads from the same backlog.

`bd update <id> --claim` is atomic: when two agents both run `bd ready --claim` at once, exactly one of them gets the task. A claim carries a lease that expires if the agent holding it stops heartbeating, for example because it crashed. `bd reclaim` returns an expired claim to the pool, so a dead agent does not hold a task forever.

All worktrees of one clone share the same local Beads database. An agent in one worktree sees a claim that an agent in another worktree recently made, with nothing extra to set up. Syncing with `bd dolt push` and `bd dolt pull` only matters across separate clones. Two examples are your own machine and a teammate's, or two machines each running their own agents.

Beads' default storage, embedded mode, is built for one person working across worktrees, not for several agents writing to it at once. For agents that genuinely write at the same time, even on one machine, initialize the repository with `bd init --server` instead. Server mode runs a Dolt server that supports concurrent writers. See [Dolt backend](https://beads.gascity.com/architecture/dolt) for the two modes.

Claim a task, then start an agent for it, in two commands:

```shell
bd ready --claim --json
claude --bg --worktree <TASK_ID>
```

### Sync the backlog over your existing GitHub remote

Beads stores its data under `refs/dolt/data`, a separate ref namespace from your code branches. Add it to the same repository your code already lives in:

```shell
bd dolt remote add origin git+ssh://git@github.com/<ORG>/<REPO>.git
```

Because the data lives under a separate ref, your branch protection rules on `main` do not need to change for this. A teammate who clones the repository runs `bd bootstrap`, which detects the Dolt remote on `origin` and configures it for them. Commit your own local changes before you run `bd dolt pull`; a pull fails if you have not.

{{< callout type="warning" >}}
Beads' `agent.profile` setting controls how much git authority an agent has. The default, `conservative`, has an agent report proposed commands instead of running them. The `team-maintainer` profile lets an agent commit and run `bd dolt push` and `git push` on its own. Treat switching to `team-maintainer` as a deliberate decision, not a default. [Where human review is required](/docs/patterns/human-review#where-human-review-is-required) treats any action like this, visible outside your own working copy, the same way.
{{< /callout >}}

## Add Orca if you want one place to run many agents

[Orca](https://github.com/stablyai/orca) is a desktop application for macOS, Windows, and Linux, built around `git worktree`. Each task gets its own worktree, with its own branch, terminal, and browser tabs. It starts the `claude` CLI as a normal process inside that worktree. This uses the Claude Code login that you already have, so Orca needs no separate Claude credentials of its own. It works the same way with other terminal-based coding agents, not only Claude Code.

### Launch and manage Claude CLI sessions across worktrees

Each worktree tab runs its own `claude` process, the same binary and login as a session that you start yourself in a terminal. Orca adds a status line to the process. Its UI uses this to show whether a session is working, waiting for input, or idle. It also reads your existing Claude usage and rate-limit data, and shows it alongside each session.

Create a worktree and launch an agent in it from the command line, instead of the UI:

```shell
orca worktree create --name <NAME> --agent claude --prompt "<PROMPT>" --json
```

`--prompt` sends that text to the agent once the worktree is ready. Pass `--setup skip` to skip the repository's setup scripts for this worktree, or `--setup inherit` to follow the repository's own policy instead of the default.

List and remove worktrees with the matching commands:

```shell
orca worktree list --repo id:<REPO_ID> --json
orca worktree rm --worktree id:<WORKTREE_ID> --force --json
```

`orca repo list --json` prints the repository ID that `--repo` needs. `orca worktree list --json` prints each worktree's ID for `--worktree`. A script can manage the same set of parallel sessions that you would otherwise click through in the UI.

{{< callout type="info" >}}
Orca also has an experimental orchestration layer, where one coordinator session dispatches tasks to several worker agents and tracks each one by task ID. It needs enabling under Settings → Experimental, and its command sequence is more involved than a single worktree create. See [Orchestration](https://onorca.dev/docs/cli/orchestration) for the current flow, since the project marks it experimental and its commands can still change.
{{< /callout >}}

### Local setup

See [Install](https://onorca.dev/docs/install) for the current download and installation steps. Local use needs no separate Orca account. On first launch, it asks for access to your home directory and offers to import your existing `~/.claude` login.

### Repository setup

Two files, both meant to be committed so the whole team gets the same worktree setup:

- `orca.yaml` at the repository root: scripts to run when a worktree is created or removed. It also names directories to share across worktrees, such as `node_modules`, instead of recreating them, and optional cloud environment recipes.
- `.worktreeinclude` at the repository root: a list of gitignored files to copy into every new worktree, such as `.env`. A secret stays in a gitignored file this way, instead of a tracked one.

Orca runs a committed `orca.yaml`'s scripts through its own approval flow before it executes them. Give it the same caution as a hook or a plugin that you did not write yourself. See [`orca.yaml` and `.worktreeinclude`](https://onorca.dev/docs/model/orca-yaml) and [Review the hooks in a repository before you trust it](/docs/prompts/review#review-the-hooks-in-a-repository-before-you-trust-it) for the same idea applied to a different artifact.

{{< callout type="warning" >}}
Invalid YAML, or a duplicate key anywhere in `orca.yaml`, rejects the whole file. Orca does not always show an error when this happens. Validate the file after you edit it, instead of assuming a mistake will surface on its own. See [`orca.yaml` and `.worktreeinclude`](https://onorca.dev/docs/model/orca-yaml#parse-failures-and-limits).
{{< /callout >}}

## Decide what still needs you

Running several agents at once does not reduce how much review each one needs. Skipping a checkpoint costs more when several agents are running, not less, because more work depends on it.

Review each worktree's diff before you merge it, the same way as you would for a single session. See [Confirm a session before you trust its result](/docs/version-control/headless-and-multi-agent-git#confirm-a-session-before-you-trust-its-result).

Every worktree gets its own push and its own pull request. Treat each one as its own checkpoint, not only the first one that finishes.

## Good practice

- Keep Beads' `agent.profile` at its conservative default until you have a specific reason to let an agent push on its own.
- Decide how many agents run at once based on what you can actually review, not only on what the tooling allows. The GitHub rate limit that you share with them is a real constraint too.
- Review a repository's `orca.yaml` the same way as a hook or a plugin that you did not write, before you trust it.
- Treat every agent running under one Orca installation as sharing your GitHub identity, not as having one of its own. If you use `gh` for auth on your local machine, each agent uses that same session, the same one every terminal on your machine already uses. Several agents calling the GitHub API at once also share one hourly rate limit, since they all authenticate as you. A burst of parallel agents can exhaust it before any one of them finishes.

## Related prompts

- [Verify that a background or subagent session committed its work](/docs/prompts/version-control#verify-that-a-background-or-subagent-session-committed-its-work)

## Further reading

- [Orchestrate several agents as one task](/docs/version-control/headless-and-multi-agent-git#orchestrate-several-agents-as-one-task)
- [Recommended skills and plugins for this stage](/docs/workflows/planning#recommended-skills-and-plugins-for-this-stage)
- [Force human review](/docs/patterns/human-review)
- [Beads documentation](https://beads.gascity.com/)
- [Orca documentation](https://onorca.dev/docs)
