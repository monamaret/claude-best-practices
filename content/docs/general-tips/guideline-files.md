---
title: "Guideline files"
weight: 30
description: >-
  Write CLAUDE.md files and other guideline files that give Claude project knowledge.
---

A CLAUDE.md file gives Claude persistent instructions for a project: the facts and rules that you would otherwise type into chat every session. Claude reads it at the start of every session, in Claude Desktop's Code tab and in the Claude Code CLI alike, since both run on Claude Code.

## What a CLAUDE.md file is and how Claude loads it

CLAUDE.md is a plain markdown file. Claude treats it as context that shapes its behavior, not as enforced configuration. Write instructions that are specific enough to verify: "Use 2-space indentation" works more reliably than "format code properly." Some rules must hold every time, whatever Claude decides. For example, a command must always be blocked. For these rules, use a permission rule in a [settings file](/docs/general-tips/settings-file) or a [hook](https://code.claude.com/docs/en/hooks-guide), not a guideline file.

Ask Claude to generate a starting file by running `/init`, or with a prompt if you want more control over what it includes. See [Generate a CLAUDE.md file for an existing repository](/docs/prompts/project-setup#generate-a-claudemd-file-for-an-existing-repository).

## User, project, and directory-level files

| Scope | Location | Shared with |
| --- | --- | --- |
| User | `~/.claude/CLAUDE.md` | Only you, across every project |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Your team, through version control |
| Local | `./CLAUDE.local.md` | Only you, for this project. Add it to `.gitignore` |

Claude loads the user, project, and local files from your working directory and every directory above it when a session starts. Within each directory, `CLAUDE.local.md` loads after `CLAUDE.md`, so your personal notes are the last thing Claude reads at that level.

Claude also finds a `CLAUDE.md` in a subdirectory of where you started the session, but does not load it at launch. It loads the first time Claude reads, writes, or edits another file in that subdirectory. Use a directory-level file for instructions that apply only to one part of a large repository, such as a single package in a monorepo.

## Path-scoped rules in .claude/rules/

When a project CLAUDE.md grows past a couple of topics, split it into files under `.claude/rules/`. Each file covers one topic, with a descriptive name such as `testing.md` or `api-design.md`. A rule without a `paths` field loads every session, at the same priority as `.claude/CLAUDE.md`.

Add a `paths` field to scope a rule to matching files, so that it loads only when it is relevant:

```markdown {filename=".claude/rules/api-design.md"}
---
paths:
  - "src/api/**/*.ts"
---

# API development rules

- Every endpoint validates its input before it touches the database.
- Return errors in the project's standard error-response format.
```

A path-scoped rule loads when Claude reads, writes, or edits a file that matches one of its patterns. This keeps instructions for a part of the codebase that a session never touches out of that session's context.

## What to include and what to leave out

Add an instruction when Claude makes the same mistake twice, or when a code review catches something Claude should have known. Also add one when a new teammate would need the same context to be productive. Good candidates are build, test, and lint commands; naming conventions; a short architecture overview; hard constraints such as "never write to the production database from a test"; and pitfalls that a new contributor runs into.

Leave out anything Claude can derive from the code itself, such as a full API reference, a changelog, or a directory layout that matches what `ls` already shows. Also leave out a rule that your team does not actually follow. An aspirational rule teaches Claude to break it. Leave out requests for one task, too. Put them in a [counter file](/docs/general-tips/counter-files).

Keep each CLAUDE.md file under about 200 lines. A longer file costs more context on every request and reduces how reliably Claude follows it. Move a topic that matters for only part of the codebase into a path-scoped rule, and move reference material that Claude needs only sometimes into a skill. See [Skills and plugins](/docs/general-tips/skills-and-plugins).

## Example CLAUDE.md file

```markdown {filename="CLAUDE.md"}
# Project name

A short description of what the project does.

## Commands

- `npm install`: install dependencies
- `npm run test`: run the test suite
- `npm run lint`: run the linter
- `npm run build`: production build

## Architecture

The API lives in `src/api/`, the frontend in `src/web/`, and shared types in
`src/types/`. Database access goes through `src/db/client.ts`; nothing else
opens a connection directly.

## Conventions

- Use named exports. Do not use default exports.
- Write new endpoints in TypeScript, even in a file that still has `.js` siblings.
- Run `npm run lint` before every commit. The pre-commit hook does not catch everything.

## Pitfalls

- The staging database seed script truncates tables first. Never point it at production.
```

## Further reading

- [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [Extend Claude Code](https://code.claude.com/docs/en/features-overview)
- [Settings](https://code.claude.com/docs/en/settings)

## Related prompts

- [Generate a CLAUDE.md file for an existing repository](/docs/prompts/project-setup#generate-a-claudemd-file-for-an-existing-repository)
- [Audit guideline files for conflicts](/docs/prompts/review#audit-guideline-files-for-conflicts)
