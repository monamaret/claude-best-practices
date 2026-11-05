---
paths:
  - "content/**"
---

# Content style guide

## Audience

Enterprise software developers who build internal tooling or work on product teams. They know Git, IDEs, CI/CD, and the command line. They may be new to Claude. Do not explain general software concepts. Do explain Claude-specific concepts such as context windows, CLAUDE.md, skills, hooks, subagents, and MCP.

The guide speaks as a technical expert giving best practices. It is not a product announcement, a training plan, or a rollout schedule.

## Voice

- Clear, technical, and uncluttered. Put the concept first, then the steps, then the example.
- Use second person ("you") and the imperative mood for instructions ("Open the settings file").
- Use present tense. Avoid "will" unless you are describing a future event in a procedure ("Claude asks for permission").
- One idea per paragraph. Keep paragraphs to three or four sentences.
- Say why a practice works, not only what it is. A best practice without a reason is hard to adapt.
- Do not use marketing language ("powerful", "seamless", "supercharge", "game-changing"). Do not use filler ("simply", "just", "easily", "obviously").

## Writing for localization

The content is translated later. Write so that a translator, or a machine translation tool, gets one clear meaning.

- Use short sentences, with a target of 25 words or fewer.
- Use one term for one concept everywhere. See the terminology table below.
- Do not use idioms, metaphors, humor, cultural references, or sports or war analogies ("out of the box", "low-hanging fruit", "game plan").
- Do not use phrasal verbs when a single verb exists: "start" not "fire up", "remove" not "get rid of", "examine" not "look into".
- Keep "that" in relative clauses: "the file that Claude creates", not "the file Claude creates".
- Do not stack nouns: "the settings for the hook configuration", not "the hook configuration settings file path".
- Do not put text in images. Put labels in the surrounding prose or in alt text.
- Do not build sentences from inline code or shortcodes. Write "Run the following command:" and put the command in a code block.
- Write dates as ISO 8601 (`2026-01-31`) only when a date is necessary.
- Do not use contractions ("do not", not "don't").
- Do not use "e.g.", "i.e.", "etc.", or "via". Write "for example", "that is", "and so on", and "through" or "by using".

## Terminology

| Use | Do not use |
| --- | --- |
| Claude Code (the underlying product; use only for a statement that applies to both interfaces) | the engine, the agent |
| Claude Code CLI (first use on a page), then "the CLI" | Claude CLI, the terminal app, CC |
| Claude Desktop | the desktop client, the app |
| plugin (a bundle of skills, subagents, hooks, and MCP servers that you install from a marketplace) | workflow kit, extension, add-on |
| Claude Enterprise | the enterprise plan, enterprise Claude |
| CLAUDE.md file | claude file, memory file (unless you are describing the memory feature) |
| guideline file | rules file, instructions file (unless you name a specific file type) |
| skill | plugin (these are different features) |
| subagent | sub-agent, helper agent |
| hook | trigger, callback |
| built-in sandbox (Claude Code's sandboxing of shell commands); Docker Sandboxes (the product) and Docker sandbox (one sandbox that it runs) | sandbox alone, when the context does not make clear which one; container (a Docker sandbox is a microVM) |
| counter file (a Markdown file that a person and Claude share for requests, status, and ideas; a convention, not a Claude Code feature) | queue file, cursor file, task file |
| MCP server | MCP plugin, connector (unless the UI uses that word) |
| prompt | query, ask (as a noun) |
| repository | repo (in prose; `repo` is acceptable in code and commands) |

When a product UI uses a different label, match the UI exactly and format it in **bold**.

## Structure of a page

1. **Front matter.** See `site-structure.md`.
2. **Introduction.** One or two paragraphs: what this practice is and why it matters.
3. **Concepts.** Only what the reader needs to act. Use a diagram if it helps.
4. **Procedure.** Numbered steps. Use the `steps` shortcode for procedures with headings. Use Desktop/CLI tabs when the interfaces differ.
5. **Example.** A complete, working configuration or code sample.
6. **Related prompts.** Links to entries in the prompt library.
7. **Further reading.** Links to official Claude documentation and related pages in this guide.

Skip sections that do not apply. Do not add empty headings.

## Procedures

- Each step is one action. Start with a verb.
- Name the exact interface location: "In Claude Desktop, select **Settings** > **Connectors**." Use `>` between menu levels and bold for UI labels.
- For configuration file changes, give the full path (`~/.claude/settings.json` or `.claude/settings.json`), state whether it is user-level or project-level, and show the complete relevant block, not a fragment without context.
- State the expected result after important steps: "Claude Code shows the hook in the `/hooks` menu."
- If a step requires a permission or an admin setting in Claude Enterprise, say so before the step.

## Code and configuration examples

- Examples must be complete and valid. A reader must be able to copy and run them.
- Use placeholders in angle brackets, in uppercase (`<PROJECT_NAME>`), and explain each placeholder below the block.
- Do not include real tokens, keys, internal URLs, or customer data.
- If a file is longer than about 40 lines, put the full file in `static/examples/<section>/` and show only the relevant excerpt inline. Link to the full file. See `hextra-components.md`.

## Links

- Link to official Claude documentation when you describe a feature. Prefer these sources, in this order:
  - Claude Code documentation: https://code.claude.com/docs/
  - Claude Help Center (Desktop and Enterprise features): https://support.claude.com/
  - Claude platform and API documentation: https://docs.claude.com/
- Before you add an external link, confirm that it resolves and that the page says what you claim. Documentation URLs change.
- Use descriptive link text: "see [Hooks reference](...)", not "click [here](...)".
- For internal links, use the site path from `/docs/`, without a trailing slash: `[Hooks](/docs/cli/hooks)` or `[Hooks](/docs/cli/hooks#configure-a-project-hook)`. Do not use `relref`. The link hook in `layouts/_markup/render-link.html` resolves the path and fails the build when no page exists for it. It does not check heading anchors.
- A link to a draft page renders as plain text in production. Write the sentence so that it still reads correctly without the link, for example "See Sandboxes." instead of "Click here."

## Diagrams and screenshots

- Use Mermaid diagrams (fenced code block with the language `mermaid`) for flows, architectures, and branch models. Mermaid text is translatable and easy to edit.
- Keep node labels short and free of idioms.
- Use screenshots only to show a UI that is hard to describe. Store them in a page bundle or in `static/images/<section>/`. Use descriptive file names (`desktop-connectors-settings.png`), and always write alt text.
- Do not show personal data, internal project names, or account details in screenshots.
- If you cannot take a screenshot, add a placeholder comment `<!-- SCREENSHOT: description of what to capture -->` so that a person can add one later. Do not invent image files.
