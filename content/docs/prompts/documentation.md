---
title: "Documentation"
weight: 40
description: >-
  Prompts to write and update documentation.
---

## Write documentation that matches your conventions

**Use when:** You want a first draft of reference documentation for a module, an endpoint, or a script, in the voice and structure that your project already uses.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Documentation](/docs/workflows/documentation#generate-documentation-from-code)

```text
Write reference documentation for <MODULE_OR_ENDPOINT> for <AUDIENCE>.
Match the structure and voice of <EXAMPLE_DOC>. Describe only behavior
that the code in <SOURCE_PATH> actually has. If you are not sure what
a parameter or a return value does, say so instead of guessing.
```

**Adapt it:** Replace `<AUDIENCE>` with who reads the result, for example `another developer who calls this API` or `an operator who runs this script`. Replace `<EXAMPLE_DOC>` with a page in your own documentation that already has the voice and structure you want. Add `Follow the terminology in <STYLE_GUIDE>.` if your project has a style guide, and replace `<STYLE_GUIDE>` with its path.

## Update the documentation for a change you just made

**Use when:** You finished a code change in the same session, and want the documentation that describes the changed behavior updated to match, instead of a new page written on its own.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Documentation](/docs/workflows/documentation#keep-documentation-current-with-code-changes)

```text
Find every documentation page that describes the behavior you just
changed in this session. Search by the function, endpoint, or
configuration key name, not only by file name. For each page, update
only the parts that are now incorrect or incomplete. Do not rewrite
sections that the change did not affect. List the pages that you
changed, and the pages that you checked but left alone, with the reason.
```

**Adapt it:** Run this before you end the session, while the change is still in context. If your documentation lives in a different repository, add `The documentation is in <DOCS_PATH>, not this repository.` and replace `<DOCS_PATH>` with its location.
