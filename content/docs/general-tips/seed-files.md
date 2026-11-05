---
title: "Seed files"
weight: 50
description: >-
  Use a seed file to brief Claude on a new project before it scaffolds any code or structure.
---

A seed file is a plain-language brief that you write before Claude, or anyone, writes code or structure. It states what a project is for, who it serves, and the constraints that will not change. Claude reads it to scaffold the project. After that, the seed file steps back. CLAUDE.md, written from the project as scaffolded, takes over as the instruction source for everyday sessions.

A seed file is not a CLAUDE.md file and not a plan. CLAUDE.md describes a codebase that already exists. A plan describes the steps to build something. A seed file is the source material that both are generated from, written for a project, or a major new direction within one, that does not have either yet. See [Guideline files](/docs/general-tips/guideline-files). A seed file is also not a counter file, which holds short-term requests for Claude and their status. See [Counter files](/docs/general-tips/counter-files).

## Structure a seed file for scaffolding

- Keep the seed file in plain language, not YAML or JSON, so that a person, not only Claude, can read and edit it.
- Store it at the repository root as `seed.md`. If the project does not exist as a repository yet, keep it in a working directory next to where the repository will be created.
- Split a large brief into topic files when one file covers unrelated concerns, for example `seed.md` for the overall brief and `content-seed.md` for a content strategy that a different part of the team owns. This mirrors how `.claude/rules/` splits a large CLAUDE.md into topics.
- Write what the project is for, who it serves, and the constraints that will not change. Leave out implementation detail; that belongs in the plan that Claude writes from the seed file, not in the seed file itself.
- State in the seed file itself that it is temporary. Once CLAUDE.md, rules, and real project structure exist, they become the source of truth, and the seed file stops changing.

## Use a seed file for initial scaffolding

{{% steps %}}

### Write the seed file first

Write the brief before you ask Claude to scaffold anything. A seed file that Claude helps you write from a short conversation still works. Write it down before you move to structure, though, so that the brief stays stable while Claude proposes and builds the structure from it.

### Ask Claude to propose a structure

Ask Claude to read the seed file and propose a project structure, rather than generate files directly from it on the first pass. Use plan mode, so that you approve the structure before Claude creates it. If the new project is a variant of one that already exists, name that repository as a reference too. See [Use a whole repository as the reference](/docs/patterns/reference-implementations#use-a-whole-repository-as-the-reference).

### Generate CLAUDE.md from the result, not from the seed file alone

Once the structure exists, ask Claude to write CLAUDE.md from the project as scaffolded, not from the seed file. CLAUDE.md should describe what exists. See [Generate a CLAUDE.md file for an existing repository](/docs/prompts/project-setup#generate-a-claudemd-file-for-an-existing-repository).

### Stop treating the seed file as an instruction source

Once CLAUDE.md exists, everyday sessions should load their context from CLAUDE.md and rules, not from the seed file. The seed file stays in the repository as a historical record of the original brief, not as something Claude reads again on its own.

{{% /steps %}}

## Example seed file

```markdown {filename="seed.md"}
# Project brief: internal time-off tracker

## Problem

Employees request time off over chat and email today. Approvals get lost,
and nobody has a single view of who is out when.

## Audience

Employees who request time off, and managers who approve it. Both groups
use the company's existing single sign-on.

## Constraints

- Must integrate with the existing HR system for current balances.
- No new database of personal data beyond what the request itself needs.
- Must work on mobile browsers; most requests happen outside a desk.

## Out of scope

- Payroll integration. A later project, not this one.
- Time tracking for hourly pay. This tool is for planned absence only.

## Open questions

- Does legal require a retention limit on request history? Ask before
  the data model is final.
```

## Further reading

- [Common workflows](https://code.claude.com/docs/en/common-workflows)
- [Best practices](https://code.claude.com/docs/en/best-practices)

## Related prompts

- [Scaffold a project from a seed file](/docs/prompts/project-setup#scaffold-a-project-from-a-seed-file)
