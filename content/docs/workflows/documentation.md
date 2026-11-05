---
title: "Documentation"
weight: 30
description: >-
  Use Claude to write and update documentation.
---

Claude can write documentation as fast as it writes code, so the harder problem is not generating a first draft. It is keeping that draft matched to your project's audience and conventions, and keeping it matched to the code after the code moves on.

## Generate documentation from code

Give Claude the audience and the conventions before you ask for documentation, in the same way as [Planning and specification](/docs/workflows/planning#give-claude-the-context-before-you-ask-for-a-plan) gives Claude context before a plan. State who reads the result, for example another developer who will call this API, or an operator who will run this script, and point Claude at an existing page that already has the voice and structure you want:

```text
Write reference documentation for <MODULE_OR_ENDPOINT> for <AUDIENCE>.
Match the structure and voice of <EXAMPLE_DOC>. Describe only behavior
that the code in <SOURCE_PATH> actually has. If you are not sure what
a parameter or a return value does, say so instead of guessing.
```

If your project has a documentation style guide, for example a terminology list or a rule against certain phrasing, put it in your CLAUDE.md file once, so that every generated page follows it without you restating it each time. See [Guideline files](/docs/general-tips/guideline-files). For the complete prompt, see [Write documentation that matches your conventions](/docs/prompts/documentation#write-documentation-that-matches-your-conventions).

## Keep documentation current with code changes

Documentation drifts because nothing connects a code change to the doc that describes it. Two techniques address this at different points:

- **While you work:** add a CLAUDE.md rule that names the pairing, for example "when you change a file under `src/api/`, update `docs/api-reference.md` in the same change." This needs judgment, so it belongs in a guideline file, not a hook. See [Hooks compared to CLAUDE.md instructions](/docs/cli/hooks#hooks-compared-to-claudemd-instructions).
- **After the fact:** periodically check whether the documentation still matches the code, instead of only relying on every change remembering to update it. See [Maintain local skills and guidelines](/docs/patterns/local-maintenance) for this kind of ongoing check.

## Review generated documentation

Read generated documentation the way you would read a pull request from a teammate who is confident but sometimes wrong. Check two things that a quick read can miss: a claim about behavior that the code does not actually have, and a confident-sounding statement about something the code does not make clear, where the honest answer is "this is not documented in the code." Claude can produce fluent text for both without flagging the difference, so check the claim against the source, not only against how well it reads.

## Recommended plugins for this stage

[wshobson/agents](https://github.com/wshobson/agents) has a `documentation-generation` plugin: OpenAPI specification generation, Mermaid diagram creation, tutorial writing, and API reference documentation. Review it before you install it. See [Review a plugin before you install it](/docs/cli/plugins#review-a-plugin-before-you-install-it).

## Related prompts

- [Write documentation that matches your conventions](/docs/prompts/documentation#write-documentation-that-matches-your-conventions)
- [Update the documentation for a change you just made](/docs/prompts/documentation#update-the-documentation-for-a-change-you-just-made)

## Further reading

- [Guideline files](/docs/general-tips/guideline-files)
- [Hooks](/docs/cli/hooks)
- [Plugins](/docs/cli/plugins)
- [Maintain local skills and guidelines](/docs/patterns/local-maintenance)
