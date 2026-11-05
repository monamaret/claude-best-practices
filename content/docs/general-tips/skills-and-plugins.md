---
title: "Skills and plugins"
weight: 40
aliases:
  - /docs/general-tips/skills-and-workflow-kits/
description: >-
  Package repeatable instructions as skills that Claude uses when a task needs them.
---

A skill is a markdown file that extends what Claude knows or can do. It can hold reference material, such as an API style guide, or a workflow you trigger by name, such as a release checklist. A plugin bundles several skills together, and optionally hooks, subagents, and MCP servers, for reuse across repositories.

## What a skill is and when Claude uses it

A skill lives in a `SKILL.md` file with a YAML frontmatter block and a markdown body. Claude compares your task against each available skill's `description` and loads the full body into context when one matches. You can also invoke a skill directly by typing `/<name>`.

Skills fall into two rough categories. A reference skill holds knowledge that Claude applies throughout a session, such as your team's API conventions. An action skill tells Claude to do something specific, such as running your release checklist.

Set `disable-model-invocation: true` in a skill's frontmatter for a skill that has side effects, such as one that deploys or commits. Claude then runs it only when you type its name, never on its own judgment.

## Skills compared to guideline files, slash commands, and subagents

**Skills compared to CLAUDE.md:**

| | CLAUDE.md | Skill |
| --- | --- | --- |
| Loads | Every session, automatically | On demand |
| Can trigger a workflow with `/<name>` | No | Yes |
| Best for | "Always do X" rules | Reference material, invocable workflows |

Put a fact in CLAUDE.md when Claude should always know it. Put it in a skill when it is reference material Claude needs only sometimes, or a workflow that you or Claude triggers by name. See [Guideline files](/docs/general-tips/guideline-files).

**Skills compared to slash commands:** a custom slash command, defined as a file in `.claude/commands/`, and a skill at `.claude/skills/<name>/SKILL.md` both create a `/<name>` command and work the same way. Skills are the newer, preferred mechanism. They add a directory for supporting files, more frontmatter options, and the ability for Claude to invoke them automatically without you typing their name. An existing `.claude/commands/` file keeps working, but write new work as a skill.

**Skills compared to subagents:**

| | Skill | Subagent |
| --- | --- | --- |
| What it is | Reusable instructions, knowledge, or workflow | Isolated worker with its own context window |
| Key benefit | Share content across contexts | Context isolation; only a summary returns |
| Best for | Reference material, invocable workflows | Tasks that read many files, parallel work |

The two combine: a subagent can preload specific skills, and a skill can run inside an isolated subagent by setting `context: fork` in its frontmatter. See [Subagents](https://code.claude.com/docs/en/sub-agents).

## Create a skill

{{% steps %}}

### Choose where the skill lives

Create `.claude/skills/<name>/SKILL.md` in the repository to share a skill with your team through version control. Create `~/.claude/skills/<name>/SKILL.md` for a personal skill that you want available in every project on your machine.

### Write the frontmatter

At minimum, give the skill a `name` and a `description`. Claude matches your task against the description to decide whether the skill applies, so state the task and when to use it:

```yaml {filename=".claude/skills/write-release-notes/SKILL.md"}
---
name: write-release-notes
description: >-
  Drafts release notes from merged pull requests since the last tag.
  Use when the user asks for release notes, a changelog entry, or
  what shipped since the last release.
---
```

### Write the instructions

Below the frontmatter, write the markdown that Claude follows when the skill loads. State the goal, the steps, and the expected output, the same way you would write a prompt for the task.

### Test it

Invoke the skill directly with `/<name>` first, to confirm the instructions work. Then describe the same task in your own words, without the slash command, to confirm that Claude's automatic matching picks up the skill when it should.

{{% /steps %}}

## Share skills with a team

Commit a project skill to `.claude/skills/` the same way you commit `CLAUDE.md` and `.claude/rules/`: teammates get it automatically the next time they pull the repository.

Package several skills into a plugin when more than one repository needs the same setup. A plugin also distributes skills to people outside your repository through a marketplace. Its skills are namespaced, for example `/my-plugin:release-notes`, so that plugins from different teams do not collide. See [Plugins](/docs/cli/plugins).

## Example skill

```markdown {filename=".claude/skills/write-release-notes/SKILL.md"}
---
name: write-release-notes
description: >-
  Drafts release notes from merged pull requests since the last tag.
  Use when the user asks for release notes, a changelog entry, or
  what shipped since the last release.
---

## Find what changed

List merged pull requests since the last tag:

!`git log $(git describe --tags --abbrev=0)..HEAD --merges --oneline`

## Instructions

1. Group the pull requests above into Features, Fixes, and Other.
2. Write one line per pull request, in plain language a user would understand,
   not the original commit message.
3. Drop anything that is purely internal, such as a dependency bump or a
   test-only change.
4. Output the result as a markdown list under each heading.
```

If you keep pasting the same procedure into chat, ask Claude to [turn a repeated procedure into a skill](/docs/prompts/maintenance#turn-a-repeated-procedure-into-a-skill).

## Further reading

- [Skills](https://code.claude.com/docs/en/skills)
- [Extend Claude Code](https://code.claude.com/docs/en/features-overview)
- [Plugins](https://code.claude.com/docs/en/plugins/overview)
