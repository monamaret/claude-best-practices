---
paths:
  - "content/**"
  - "layouts/**"
  - "hugo.yaml"
---

# Hextra components

The site uses Hextra v0.12.3. Shortcode source is in the Hugo module cache. To find it, run `hugo config | grep cachedir`, then look in `modules/filecache/modules/pkg/mod/github.com/imfing/hextra@v0.12.3/layouts/_shortcodes/` under that directory. Check the source before you use a parameter that this file does not list. Theme documentation: https://imfing.github.io/hextra/docs/guide/shortcodes/

Use the built-in shortcodes. Do not write raw HTML for layout. Raw HTML is enabled in `hugo.yaml`, but it is harder to maintain and translate.

## Desktop and CLI tabs

Many procedures differ between Claude Desktop and the Claude Code CLI. Use tabs with the same names and order on every page, so that the reader selects an interface one time:

````markdown
{{< tabs >}}
{{< tab name="Claude Desktop" icon="desktop-computer" >}}
1. Select **Settings** > **Connectors**.
2. ...
{{< /tab >}}
{{< tab name="Claude Code CLI" icon="terminal" >}}
1. Run the following command:

   ```shell
   claude mcp add ...
   ```
{{< /tab >}}
{{< /tabs >}}
````

Rules:

- Tab names are exactly `Claude Desktop` and `Claude Code CLI`, in that order. Tab sync matches tabs by name. A different spelling breaks the sync.
- Tab sync must be on for the whole site in `hugo.yaml`:

  ```yaml
  params:
    page:
      tabs:
        sync: true
  ```

- If a feature exists in only one interface, keep both tabs. In the other tab, write one sentence that says so and links to the alternative. For example: "Running Claude non-interactively with `claude -p` is not available in Claude Desktop. Use the Claude Code CLI."
- Use the `name` parameter on each `tab`. The `items` parameter on `tabs` and the `defaultIndex` parameter are deprecated and cause build warnings.
- Put content that is the same for both interfaces outside the tabs.
- If more interfaces are added later (for example, an IDE extension or Claude Code on the web), add them after the existing tabs and use the same name on every page.

## Operating system tabs

When a step differs between Windows and macOS (install commands, paths, environment variables, shortcuts), use a separate tab set with the exact names `Windows` and `macOS`, in that order. Windows comes first because most readers use Windows. Tab sync matches these names across pages in the same way as the interface tabs. Do not set an icon on these tabs.

If a step differs by both interface and operating system, put the operating system tabs inside the `Claude Code CLI` tab. For a short list of shortcuts, a table with one column for each operating system is easier to scan than tabs.

Put notes for WSL inside the `Windows` tab. The rule for a feature that exists in only one interface does not apply to these tabs. If a step is the same on both operating systems, do not use tabs.

## Cards

Use cards on section `_index.md` pages and on the landing page:

```markdown
{{< cards >}}
  {{< card link="hooks" title="Hooks" icon="lightning-bolt" subtitle="Run commands at points in the Claude Code lifecycle." >}}
{{< /cards >}}
```

## Callouts

```markdown
{{< callout type="info" >}}
Text.
{{< /callout >}}
```

| Type | Use for |
| --- | --- |
| `info` | Background, tips, or optional detail |
| `warning` | An action that can cause data loss, a security exposure, or unexpected cost |
| `error` | A known failure mode or an anti-pattern to avoid |
| `important` | A Claude Enterprise admin requirement or a prerequisite |

Use one or two callouts per page at most. Too many callouts make the important ones hard to see.

## Steps

Use `steps` for procedures where each step has a heading and more than one line of content. The shortcode uses `%` delimiters, and each step is an `###` heading:

```markdown
{{% steps %}}

### Create the settings file

Text and code for this step.

### Add the hook

Text and code for this step.

{{% /steps %}}
```

For short procedures, use a numbered list.

## Code blocks

- Always set a language: `shell`, `json`, `yaml`, `toml`, `markdown`, `python`, `typescript`, and so on.
- Add a file name when the block is the content of a file:

  ````markdown
  ```json {filename=".claude/settings.json"}
  { }
  ```
  ````

- Use `shell` for commands. Do not include a `$` prompt, so that the reader can copy the command.
- Use `hl_lines` to highlight the lines that a step changes.

## Large example files

If an example is longer than about 40 lines:

1. Save the complete file in `static/examples/<section>/<file>`.
2. Show the relevant excerpt inline, with a `filename` attribute.
3. Link to the complete file with the site path: `[Download the complete settings.json](/examples/cli/settings.json)`.

Do not link to `github.com/.../raw/...` or `raw.githubusercontent.com`. Those links depend on the branch and the repository layout, and they break when either changes. A site path stays with the published page.

## Under-review flag

Mark a page as under review when it has steps that nobody has tested yet, or content that can still change. Add the tag to the front matter:

```yaml
tags:
  - under-review
```

A page tagged `under-review` publishes normally, in production, with the flag shown below the title. The tag does not hide the page and does not require `draft: true`. Use `draft: true` separately, on its own, for a page that must not publish yet (see `site-structure.md`).

- The flag shows below the page title. Do not add a callout for the same purpose.
- `layouts/_partials/under-review.html` renders the flag. The text is in `i18n/en.yaml`, so that it can be translated.
- The flag links to the page `/tags/under-review/`, which lists every page with the tag. Its title and intro are in `content/tags/under-review/_index.md`.
- The report link opens a new issue in this repository, with the page title and URL filled in. The URL is `params.feedback.issuesURL` in `hugo.yaml`. When it is empty, the flag shows without the link. Readers need a GitHub account to open an issue.
- Remove the tag when the open questions for the page are resolved, or when someone else decides the page is no longer accurate and removes or rewrites it. There is no separate workflow step that removes the tag; the owner (or whoever is following up) edits the page directly on `main`.

## Draft pages in production

In production, a page with `draft: true` is not built. Two overrides keep other pages correct when they reference one:

- Links to the page render as plain text (`layouts/_markup/render-link.html`).
- Cards to the page are left out of section indexes (`layouts/_shortcodes/card.html`).

## Theme overrides

These files are copies of Hextra v0.12.3 files with a marked project addition. When you update Hextra, copy the new version of each file and add the marked block again:

| File | Addition |
| --- | --- |
| `layouts/docs/single.html` | Calls the under-review partial below the title |
| `layouts/_markup/render-link.html` | Plain text for draft pages, and a build error for a broken `/docs/` link |
| `layouts/_shortcodes/card.html` | Leaves out cards for draft pages |

## Other components

| Component | Use for |
| --- | --- |
| `{{< filetree/container >}}` | Showing a recommended project layout (for example, `.claude/` contents) |
| `{{< details title="..." >}}` | Long optional content, such as a full sample output |
| `{{< badge >}}` | Marking a feature as CLI-only or Desktop-only in a heading or table |
| Mermaid fenced blocks | Diagrams. Hextra renders `mermaid` code blocks without extra configuration. |
