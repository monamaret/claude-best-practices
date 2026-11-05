# Recommended plugins and skills per SDLC stage: research notes

Not published. Hugo publishes only `content/` and `static/`. Collected on 2026-11-03 for the "Recommended plugins and skills for this stage" sections planned across `content/docs/workflows/` (and already written into `content/docs/workflows/planning.md`'s outline). Bar set by the owner: highly starred repos with recent commits, verified by fetching the repository directly, not trusted from search snippets. None of these plugins or skills have been installed or tried. Verify stars and last-commit date again before you draft the page, since both change.

## Conclusions

| Stage | Repo | Type | What to cite | Stars | Last push |
| --- | --- | --- | --- | --- | --- |
| Planning | [github/spec-kit](https://github.com/github/spec-kit) | Skills (for the Claude Code integration specifically) | Installs via `specify init ... --integration claude` as `.claude/skills/speckit-<command>/SKILL.md` | not checked (GitHub's own repo; not the focus of the star-count bar) | active |
| Testing | [wshobson/agents](https://github.com/wshobson/agents) | Plugin marketplace | `plugins/unit-testing` (v1.2.2) and `plugins/tdd-workflows` (v1.3.2) | 42,152 | 2026-11-02 |
| Documentation | [wshobson/agents](https://github.com/wshobson/agents) | Plugin marketplace | `plugins/documentation-generation` (v1.2.4) | 42,152 | 2026-11-02 |
| Build and release | [wshobson/agents](https://github.com/wshobson/agents) | Plugin marketplace | `plugins/cicd-automation` (v1.2.4) | 42,152 | 2026-11-02 |
| Refactoring | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Plugin, containing skills | `skills/code-simplification/SKILL.md` and `skills/deprecation-and-migration/SKILL.md` | 113,014 | 2026-11-01 |
| Maintain | [wshobson/agents](https://github.com/wshobson/agents) | Plugin marketplace | `plugins/dependency-management` (v1.2.2) and `plugins/debugging-toolkit` (v1.2.2) | 42,152 | 2026-11-02 |

`wshobson/agents` covers four of the five stages below planning. Say so explicitly on each page rather than presenting four independent discoveries — it is one marketplace repository with distinct plugins per stage. All five `wshobson/agents` plugin.json files share the same author block (`"name": "Seth Hobson"`, `"email": "seth@major7apps.com"`) and `"license": "MIT"`, confirmed by fetching each file directly at `https://raw.githubusercontent.com/wshobson/agents/main/plugins/<name>/.claude-plugin/plugin.json`.

Exact confirmed `plugin.json` fields, fetched verbatim on 2026-11-03:

- `unit-testing`: "Unit and integration test automation for Python and JavaScript with debugging support"
- `tdd-workflows`: "Test-driven development methodology with red-green-refactor cycles and code review"
- `documentation-generation`: "OpenAPI specification generation, Mermaid diagram creation, tutorial writing, API reference documentation"
- `cicd-automation`: "CI/CD pipeline configuration, GitHub Actions/GitLab CI workflow setup, and automated deployment pipeline orchestration"
- `dependency-management`: "Dependency auditing, version management, and security vulnerability scanning"
- `debugging-toolkit`: "Interactive debugging, developer experience optimization, and smart debugging workflows"

`wshobson/agents` also has a `git-pr-workflows` plugin (v1.3.2, "Git workflow automation, pull request enhancement, and team onboarding processes"). Not placed on any workflows page: it fits the already-published `content/docs/version-control/commits-and-pull-requests.md` better than Build and release. Not added there without being asked — flagging it here so a future session does not need to re-find it.

`addyosmani/agent-skills` is a genuine Claude Code plugin (`.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` confirmed at the repo root) that also contains real skills (`SKILL.md` files) inside it. It is a multi-agent repo (also has `.codex-plugin/`, `.gemini/`, `.opencode/` directories), not Claude-exclusive. Describe it on the refactoring page as skills distributed through a plugin, not as "a skill" alone.

## Rejected candidates, by stage

Keep this list so a future session does not re-surface and re-reject the same repos.

**Testing:**
- `neonwatty/qa-skills` — real, confirmed `SKILL.md` files (14 of them, Playwright E2E/QA), `pushed_at: 2026-10-19`. Only 34 stars. Fails "highly starred" by any reasonable bar.
- A batch of higher-star hits from a broad GitHub Search API query did not hold up: implausibly high star counts that arrived through the fetch tool's own summarization rather than verbatim data, and the verbatim-confirmed high-star hits that did check out were off-topic (security/pentesting skill packs, Terraform/IaC testing, game-modding) rather than ordinary software QA.

**Documentation:**
- `davila7/claude-code-templates` — 33,101 stars, pushed the day of research, but its own README states the `--plugins` and `--skills-manager` flags were removed in v1.31.0, replaced by a different "mods" system. Its skill/plugin surface is being actively deprecated. Rejected as unstable to recommend.
- `aj-geddes/useful-ai-prompts` — has real skills (`changelog-maintenance`, `release-planning`, `semantic-versioning`, and others), 376 stars, but last push was roughly 8 months before research. Marginal-to-failing on "recent commits." Also a 4,725-file general prompt-library repo, not documentation-specific.
- `ComposioHQ/awesome-claude-plugins` — 404s. Does not exist at the path that search results showed.
- `ccplugins/awesome-claude-code-plugins` — the best independently-found documentation candidate before the `wshobson/agents` follow-up: confirmed genuine plugin structure, 996 stars, last commit 2026-08-12 (about 3 months old). Its `plugins/changelog-generator/` has its own `.claude-plugin` manifest. Superseded by `wshobson/agents`' `documentation-generation` plugin, which has far more stars and a much more recent push. Keep in mind if `documentation-generation` ever goes stale.

**Build and release:**
- `yonatangross/orchestkit` — confirmed real plugin (`.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`) containing `plugins/ork/skills/release-management/SKILL.md`. 299 stars, pushed the day of research. Rejected because it is a 115-skill/36-agent/161-hook "complete AI development toolkit" — recommending it for one skill means installing an enormous unrelated surface.
- `marckrenn/claude-code-changelog` — 900 stars, pushed the day of research, but it tracks Anthropic's own Claude Code release changelog, not a tool you install for your own project's releases. Wrong category entirely, not a near-miss.

**Refactoring:**
- `cskwork/clean-code-skill` — real, well-scoped `SKILL.md` (Fowler's refactoring catalog), 0 stars. Fails the bar outright.
- `pproenca/dot-skills`, `laurigates/claude-plugins`, `sundial-org/awesome-openclaw-skills` — surfaced in search, low-star or not squarely about refactoring.

## Method

Five parallel research passes, one per stage below planning, each instructed to fetch the actual repository (README, file tree, or `plugin.json`/`SKILL.md` directly) rather than trust search-result snippets for star counts or last-commit dates, and to report "no good match" rather than stretch a weak candidate to fill the slot. A sixth, narrower follow-up fetched five specific `plugin.json` files from `wshobson/agents` directly to confirm plugins that a different stage's research pass had noticed but not verified, which resolved three of the five "no good match" results into verified recommendations.
