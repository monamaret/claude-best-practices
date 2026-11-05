---
title: "Build and release"
weight: 50
description: >-
  Prompts for build pipelines, release notes, and changelogs.
---

## Draft release notes from merged pull requests

**Use when:** You tagged a release and want a first draft of the release notes or changelog entry, before you have a skill set up for this repeated task.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Build and release](/docs/workflows/build-release#draft-release-notes-and-a-changelog)

```text
List the pull requests merged since the last tag, with
git log <LAST_TAG>..HEAD --merges --oneline.
Group them into Features, Fixes, and Other. Write one line per pull
request, in plain language for a user, not the original commit message.
Drop anything purely internal, such as a dependency bump or a test-only
change.
```

**Adapt it:** Replace `<LAST_TAG>` with the tag of the previous release. If you do not use merge commits, replace the `git log` command with `git log <LAST_TAG>..HEAD --oneline` and ask Claude to group commits instead of pull requests. If you repeat this for every release, turn it into a skill instead. See [Example skill](/docs/general-tips/skills-and-plugins#example-skill).
