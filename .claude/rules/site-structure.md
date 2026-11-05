---
paths:
  - "content/**"
  - "static/**"
  - "hugo.yaml"
---

# Site structure

## Sections

The guide has topical sections in order of increasing complexity, followed by one reference section. Section names and topics can change as the guide grows. Keep the order from basic to advanced, and keep the reference section last.

| Weight | Directory | Title | Topics (page slugs) |
| --- | --- | --- | --- |
| 10 | `content/docs/general-tips/` | General tips | `context`, `project-setup`, `settings-file`, `guideline-files`, `skills-and-plugins`, `seed-files`, `sandboxes`, `counter-files` |
| 20 | `content/docs/cli/` | Use the CLI | `install-and-configure`, `cli-and-ide`, `common-tasks`, `non-interactive-mode`, `hooks`, `plugins` |
| 30 | `content/docs/version-control/` | Version control | `workstreams-and-branch-trees`, `commits-and-pull-requests`, `commit-hooks`, `undo-and-recover-changes`, `headless-and-multi-agent-git` |
| 40 | `content/docs/workflows/` | Integrate workflows | `planning`, `feature-development`, `testing`, `documentation`, `build-release`, `refactoring`, `maintain` |
| 50 | `content/docs/patterns/` | Patterns that work | `reference-implementations`, `mcp`, `build-test-refactor-a-skill`, `human-review`, `local-maintenance`, `automate-a-workflow`, `parallelize-agents` |
| 90 | `content/docs/prompts/` | Reference: Prompting strategies | see `prompt-library.md` |

Leave gaps in weights (10, 20, 30) so that you can insert new sections and pages without renumbering.

## Files and naming

- Each section is a directory with an `_index.md` file. The `_index.md` file gives a short overview of the section and a `cards` list of its pages.
- Each topic is one Markdown file. Use lowercase kebab-case slugs (`branch-trees.md`).
- A page that needs images uses a leaf bundle: `content/docs/<section>/<slug>/index.md`, with the images next to it in the same directory. Reference them as a relative path (`![Alt text](diagram.png)`), not through `static/images/`.
- Do not rename or move a published page without adding an `aliases` entry in the front matter. Other pages and the prompt library link to these paths.

## Subsections

A section can have more child pages than fit well in one flat list. When that happens, group related pages into a subsection instead of adding more top-level pages to the section:

```
content/docs/<section>/
  _index.md
  <subsection>/
    _index.md
    <page-one>.md
    <page-two>.md
```

- A subsection is a directory with its own `_index.md`, nested one level under the section. Give it the same front matter as a section `_index.md` (`title`, `weight`, `description`, and a `cards` list of its own pages).
- Hugo and Hextra render nesting at any depth, but keep the guide to at most one level of subsection under a section. A deeper tree is harder for a reader to navigate and for a translator to keep straight.
- Add `sidebar: { open: true }` to a subsection's `_index.md` front matter so that the sidebar shows its pages expanded by default. Leave it unset (collapsed) for a subsection that a reader opens less often.
- Link to a page inside a subsection the same way as any other page, with the full site path: `[Page title](/docs/<section>/<subsection>/<page>)`.
- A page inside a subsection can still be a leaf bundle if it needs images: `content/docs/<section>/<subsection>/<slug>/index.md`.
- Before you add a subsection, check whether the section's pages are actually easier to find as a flat list instead. Add structure only when the number of pages needs it.

## Front matter

Every content page uses this front matter:

```yaml
---
title: Hooks                      # sentence case, short, no trailing punctuation
linkTitle: Hooks                  # optional sidebar label if the title is long
weight: 20                        # order within the section
description: >-
  Run commands automatically at points in the Claude Code CLI lifecycle.
---
```

- `description` is one sentence. Hextra uses it in cards and search results.
- Use sentence case for titles and headings ("Use reference implementations", not "Use Reference Implementations").
- Do not add `date`, `author`, or `draft: false`. Use `draft: true` only for pages that must not publish yet. A draft does not appear in production at all.
- The only tag in use is `under-review`, for a page that is already published but has steps that nobody has tested yet, or content that can still change. It does not require `draft: true` and is not hidden from production. See `hextra-components.md`. Do not add other tags without a decision from the owner.

## Headings

- The page title is the only H1. Hextra renders it from `title`. Start the body at `##`.
- Do not skip heading levels.
- Headings that start a procedure begin with a verb ("Configure a project hook").
- Keep headings stable. The prompt library and other pages link to heading anchors.

## Static files

| Path | Content |
| --- | --- |
| `static/examples/<section>/` | Complete example files (settings, hooks, CLAUDE.md templates, skills) that are linked as downloads |
| `static/images/<section>/` | Shared images that are not part of a page bundle |

Hugo publishes `static/` at the site root. `static/examples/cli/settings.json` is available at `/examples/cli/settings.json`.

## Navigation and configuration

- The sidebar is built from the `content/docs/` tree and the `weight` values. Do not hard-code sidebar entries.
- Changes to `hugo.yaml` (menus, params, the site title) affect every page. Make them only when a task asks for them, and run a full build afterwards.
