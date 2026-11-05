# Claude Code Guide

A Hugo documentation site with best practices for software developers who use Claude Enterprise (Claude Desktop and Claude Code CLI) as a coding assistant.

- **Generator:** Hugo 0.168.0+extended+withdeploy (local)
- **Theme:** [Hextra](https://imfing.github.io/hextra/) v0.12.3, imported as a Hugo module (`go.mod`). It is not vendored or a submodule.
- **Origin:** https://github.com/monamaret/claude-best-practices. The repository and the published site are **public**.
- **Site:** https://monamaret.github.io/claude-best-practices/ (a project site, so every URL is under the `/claude-best-practices/` subpath).
- **Deploy:** `.github/workflows/pages.yaml` builds the site and deploys it to GitHub Pages on every push to `main`. The Pages source is "GitHub Actions" (Settings > Pages > Source).
- **License:** content under CC BY 4.0 (`LICENSE`), code under MIT (`LICENSE-CODE`). See the License section in `README.md`.
- **Hugo version:** The local version, the `HUGO_VERSION` variable in `pages.yaml`, and `module.hugoVersion.min` in `hugo.yaml` must stay the same. When you upgrade Hugo locally, update all three.

## Commands

```shell
hugo mod tidy                                            # resolve theme module
hugo server --disableFastRender -p 1313                  # local preview at http://localhost:1313
hugo --gc --minify                                       # production build into public/ (no drafts)
hugo mod get -u && hugo mod tidy                         # update Hextra (then re-apply the theme overrides; see hextra-components.md)
```

A page is not finished until `hugo --gc --minify` completes with no errors and no `WARN` lines. Hextra prints warnings for deprecated shortcode parameters, so check the output.

## Repository layout

```
content/
  _index.md               # landing page
  docs/                   # all guide content (see .claude/rules/site-structure.md)
static/
  examples/               # full config/code files linked as raw downloads
research/                 # research notes for future pages (committed, not published)
.claude/
  rules/                  # detailed project guidelines (loaded automatically)
  agents/                 # project subagents
.github/workflows/pages.yaml   # production deploy to GitHub Pages on push to main
layouts/                       # project layout overrides (see hextra-components.md)
hugo.yaml
```

## Project guidelines

Detailed rules live in `.claude/rules/`. Read the relevant file before you add or edit content:

| File | Covers |
| --- | --- |
| `.claude/rules/content-style.md` | Audience, voice, localization-safe writing, procedures, diagrams |
| `.claude/rules/site-structure.md` | Sections, file naming, front matter, weights, navigation |
| `.claude/rules/hextra-components.md` | Shortcodes, Desktop/CLI tabs, callouts, steps, code blocks |
| `.claude/rules/prompt-library.md` | The Prompting strategies reference section and how to link to it |
| `.claude/rules/counter-file.md` | `counter.md`, the file for owner requests and task status |

## Counter file

The project owner writes change requests in `counter.md`, in the repository root. It is gitignored, so it is not committed and not published. Check it before each task, act on open items, and record their status in it. See `.claude/rules/counter-file.md`.

## Pages under review

There is no separate review site or review branch. A page that still needs testing or that can still change publishes straight to `main` with the `under-review` tag, which shows a flag and a link to open an issue. See "Under-review flag" in `hextra-components.md`. Preview unfinished work locally with `hugo server --disableFastRender -p 1313` (add `-D` to also see `draft: true` pages), or in the pull request diff, before you merge to `main`. Removing the tag, or the page, once it is no longer accurate is a manual step, done directly on `main`, not a separate workflow.

## Start sessions in the repository root

Start Claude Code in this directory, not in a directory above it. If a session starts in a parent directory, this file loads only after Claude reads a file in the repository, and the files in `.claude/` (rules, agents, settings, and hooks) do not load.

## Rules that apply to every change

1. **Public output, public source.** Everything under `content/` and `static/` that is not `draft: true` is published on the public internet, including pages tagged `under-review`. Everything committed to the repository, including `research/`, is public too. Do not include secrets, internal hostnames, customer names, or non-public company information. Use placeholders such as `<YOUR_API_KEY>` or `${ANTHROPIC_API_KEY}`.
2. **No links to raw files in this repository on GitHub.** `raw.githubusercontent.com` links depend on the branch and the repository layout, and they break when either changes. Put large example files in `static/examples/` and link to them by site path.
3. **Cover both interfaces.** If a procedure differs between Claude Desktop and Claude Code CLI, use the synced Desktop/CLI tabs pattern in `hextra-components.md`.
4. **Link to the prompt library.** When a page tells the reader to ask Claude to do something, add the prompt to the library and link to it. Do not leave long prompts only inline.
5. **Link to official documentation.** Cite Claude documentation by URL instead of restating details that can change, such as flags, settings keys, or model names.
6. **No timelines.** Do not write about rollout dates, deadlines, schedules, or project plans. The guide gives technical guidance only.
