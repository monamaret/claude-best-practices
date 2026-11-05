---
paths:
  - "content/**"
---

# Prompt library

The reference section `content/docs/prompts/` is a library of prompts that a reader can copy and use. Content pages link to entries in the library. The library links back to the pages that explain the context.

## Organization

- `content/docs/prompts/_index.md` explains how to use and adapt the prompts and lists the categories as cards.
- Each category is one page. Categories follow the content sections, for example `project-setup.md`, `planning.md`, `testing.md`, `documentation.md`, `build-release.md`, `maintenance.md`, `review.md`.
- Each prompt is an `##` heading on its category page. The heading anchor is the stable ID of the prompt.

## Format of a prompt entry

````markdown
## Generate a CLAUDE.md file for an existing repository

**Use when:** You start to use Claude Code CLI in a repository that has no CLAUDE.md file.
**Works in:** Claude Code CLI
**Explained in:** [Guideline files](/docs/general-tips/guideline-files)

```text
Read this repository and create a CLAUDE.md file in the repository root.
Include:
- The build, test, and lint commands
- The directory layout and the purpose of each top-level directory
- Coding conventions that are not obvious from the code
Do not include information that a developer can find in the README.
Keep the file under 100 lines.
```

**Adapt it:** Replace the list with the topics that your team needs. Add `Ask me before you write the file.` if you want to review the plan first.
````

Rules:

- Put the prompt in a `text` code block, so that Hextra shows a copy button and does not apply syntax highlighting.
- Write placeholders as `<UPPERCASE_IN_ANGLE_BRACKETS>` and explain each one in **Adapt it**.
- **Works in** is `Claude Desktop`, `Claude Code CLI`, or both.
- Prompts must be generic. Do not use internal project names, repositories, or customer data.
- A prompt states the goal, the constraints, and the expected output. Do not write single-line prompts that depend on context that the reader does not have.
- If a prompt invokes a feature (a skill, a slash command, a subagent), link to the content page that explains how to set up that feature.

## Linking from content pages

- When a content page tells the reader to ask Claude for something, add or reuse a library entry and link to it:

  ```markdown
  Ask Claude to draft the file. See [Generate a CLAUDE.md file](/docs/prompts/project-setup#generate-a-claudemd-file-for-an-existing-repository).
  ```

- A short prompt of one line can be inline, but it must also be in the library if more than one page uses it.
- End a content page with a **Related prompts** list when it has two or more related entries.
- When you rename a prompt heading, the anchor changes. Search `content/` for the old anchor and update every link.
