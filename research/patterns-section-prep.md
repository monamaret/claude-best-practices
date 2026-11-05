# Patterns section: preparation notes

Not published. Collected 2026-11-03, re-verified fresh against disk after the stale-`main` incident earlier in the session (all six pages below were re-read after `git pull`; none had actually reverted). Written because the user expects the patterns section to be the most complex yet and to build on everything else in the site, and asked for compaction/prep before drafting starts.

## Current state: all six pages are still draft outline stubs

`content/docs/patterns/_index.md` lists, in weight order:

1. `reference-implementations.md` (10) — "Why examples work better than descriptions; Select a good reference implementation; Point Claude to the reference"
2. `mcp.md` (20) — "What MCP is; Add an MCP server in Claude Desktop and in the Claude Code CLI; Limits: context cost, permissions, and reliability; Security considerations"
3. `build-test-refactor-a-skill.md` (30) — see its own outline, reproduced below; this is the page the "complex" framing is mostly about
4. `human-review.md` (40) — "Where human review is required; Permission modes and approval prompts; Review checkpoints in plans and pull requests"
5. `local-maintenance.md` (50) — "Why out-of-date guidelines and skills cause errors; Review guideline files with each change; Notice when a skill's description no longer matches how the project works; Ask Claude to update its own guidelines and skills; Remove rules and skills that no longer apply; How this differs from Build, test, and refactor a skill"
6. `seed-file-drift.md` (60) — "Why implementation drifts...; Ask Claude to compare current structure against seed file constraints, periodically; Generate test cases from the seed file's audience/constraints; Decide whether a drifted constraint is a bug or outdated; How this relates to Maintain local skills and guidelines; A worked example"

`build-test-refactor-a-skill.md`'s full outline, since it is the load-bearing page:
- Start from the basics in Skills and plugins: assumes the reader can already write and test one skill by hand
- Test a skill with more than one invocation: eval suites, variance across runs, and the built-in tooling for this
- Deploy a tested skill through a plugin instead of copying files between repositories by hand
- Watch how a skill actually triggers in real sessions, not only how you expect it to
- Refactor a skill's description when it triggers too often, too rarely, or for the wrong tasks
- Split an overgrown skill into smaller ones instead of patching it further
- Explicit boundary note against `local-maintenance.md`: this page is the first build and its early tuning; that page is staying accurate afterward

## What NOT to re-derive: already fully covered elsewhere

The version-control and workflows sections are both complete now (11 pages total, all published). Patterns pages should cross-link into them, not restate:

- **Plan mode, reviewing a plan**: `workflows/planning.md` already covers this in full, including the Mermaid flow diagram and the `plansDirectory` setting. `human-review.md` should link to it, not re-explain Plan mode.
- **Confirming before push/merge, `permissions.ask`**: `version-control/commits-and-pull-requests.md#confirm-before-claude-pushes-or-rewrites-history`.
- **Reviewing a diff, staged-diff second opinion**: `prompts/review.md#check-a-staged-diff-before-you-commit`, and `patterns/human-review.md` itself per its own outline — this is the natural home for the general "where must a person look" framework, with the specific mechanics linked out.
- **Test-first / characterization-test distinction**: `workflows/testing.md` and `workflows/refactoring.md` already establish this precisely, including a comparison table in `workflows/maintain.md`. Do not add a fourth variant without reading all three first.
- **Hooks vs. CLAUDE.md, when to use which**: `cli/hooks.md#hooks-compared-to-claudemd-instructions`.
- **Context budget, what fills it (CLAUDE.md, auto memory, MCP tool names, skill descriptions)**: `general-tips/context.md` already states plainly that MCP tool names and skill descriptions are part of the fixed context cost before you even type a message. `mcp.md`'s "context cost" bullet should cite this, not re-derive it.
- **Guideline file structure, CLAUDE.md vs `.claude/rules/`**: `general-tips/guideline-files.md`.
- **Skill basics (what a skill is, the 4-step create flow, skill vs. CLAUDE.md vs. slash command vs. subagent)**: `general-tips/skills-and-plugins.md`. `build-test-refactor-a-skill.md`'s own outline already says it assumes this.
- **Plugin creation, marketplaces, `claude plugin marketplace list`, reviewing a plugin before install**: `cli/plugins.md` is fully written. "Deploy a tested skill through a plugin" in `build-test-refactor-a-skill.md` should link to the existing "create a plugin" content there (not yet confirmed which heading — re-check when drafting, since this session only read the first ~60 lines of `plugins.md` in full).
- **Seed files themselves**: `general-tips/seed-files.md` is fully written and already gestures at the drift-audit pattern twice, including a verbatim sentence in its "Use seed files for cross-project activities" section.

## One drift already found in an existing, published page

`general-tips/seed-files.md`'s closing line of "Use seed files for cross-project activities" reads: *"This page covers the structure of seed files themselves. For the testing and maintenance workflows that use them, see the [Workflows](/docs/workflows) section."* That link target is wrong (or at least stale) — the actual audit pattern it is gesturing at is `patterns/seed-file-drift.md`, not the workflows section generally. Fix this sentence when `seed-file-drift.md` is drafted, pointing directly at the new page instead of the whole Workflows section.

## Existing prompts to reuse, not duplicate

From `prompts/review.md` (all already written, all still relevant to patterns pages):
- "Audit guideline files for conflicts" — directly reusable for `local-maintenance.md`'s "review guideline files with each change" bullet. Also mentions `/doctor prompt-audit` as a built-in alternative.
- "Review a plugin before you install it" — reusable for `build-test-refactor-a-skill.md`'s deploy step.
- "Review the hooks in a repository before you trust it", "Review a change to settings.json", "Review the changes from a sandbox session before you commit" — general review-pattern precedent for `human-review.md` to point at as examples of the pattern applied to specific artifacts.
- "Review the counter file and promote ideas into tasks" — the "skill" and "guideline" promotion actions in that prompt's table are relevant to `local-maintenance.md`.

From `prompts/project-setup.md`: "Scaffold a project from a seed file" (linked from `seed-files.md` already) — check this page before drafting `seed-file-drift.md`, since an "audit drift" prompt would be a natural sibling there, or could go in `review.md` next to "Audit guideline files for conflicts."

No existing prompt covers "turn a repeated procedure into a skill" refactoring/splitting, or "optimize a skill's description" — these would be new, if `build-test-refactor-a-skill.md` needs them. Note `prompts/maintenance.md` already has "Turn a repeated procedure into a skill" (creation, not refactoring).

## What needs fresh, verified research before drafting (do not write from memory)

- **`mcp.md`**: the exact `claude mcp add` syntax (CLI) and the Desktop connector flow, current scope types (user/project/local), and the official security guidance page. This session has not researched MCP at all yet — everything in the current outline is unverified assumption. Fetch `https://code.claude.com/docs/en/mcp` fresh.
- **`build-test-refactor-a-skill.md`**: this page's own outline references "eval suites, variance across runs, and the built-in tooling for this" and a skill triggering/description-optimization workflow. This session has only ever seen these referenced indirectly — in the available-skills list as a built-in `skill-creator` skill ("run evals to test a skill, benchmark skill performance with variance analysis, optimize a skill's description for better triggering accuracy") and in the `claude-code-guide` subagent's description (`claude plugin eval`, `/skill-doctor`). None of these have been fetched or verified against official docs. Do not describe their exact commands, flags, or output format until that research happens — follow the same rigor as the worktree/`bgIsolation` research earlier in this session (fetch directly, flag anything that only comes from a tool-generated summary rather than verbatim text).

## Suggested drafting order

Easiest and least research-dependent first, so later pages can lean on earlier ones' finished anchors for cross-linking (matching how `workflows/refactoring.md` was able to link into `workflows/testing.md` because testing was drafted first):

1. `reference-implementations.md` — simplest, self-contained, no new research needed.
2. `human-review.md` — mostly synthesis of already-finished pages (`planning.md`, `commits-and-pull-requests.md`, `review.md` prompts); low new-research burden.
3. `local-maintenance.md` — synthesis of `guideline-files.md` + `skills-and-plugins.md`; needs the "Audit guideline files for conflicts" prompt reuse and a new skill-drift angle.
4. `seed-file-drift.md` — explicitly depends on `local-maintenance.md`'s finished anchors per its own outline's cross-reference; also fixes the stale `seed-files.md` link.
5. `mcp.md` — needs fresh official-doc research (not yet done this session).
6. `build-test-refactor-a-skill.md` — last, since it needs the most fresh research (eval tooling, `claude plugin eval`, `/skill-doctor`) and is the page the user is most likely to scrutinize closely given the "most complex" framing.

## Prompt-library categories involved

No `patterns` prompt category exists (prompt categories follow content sections loosely, not 1:1 — see `.claude/rules/prompt-library.md`). New prompts for these pages should go into the existing categories whose descriptions already cover the topic: `review.md` for anything review/audit-shaped, `maintenance.md` for skill-refactoring-shaped prompts, matching how the workflows section's new prompts were placed into existing categories rather than creating new ones.
