---
title: "Version control"
weight: 30
description: >-
  Organize work with Claude in branches and keep commits consistent.
---

This section describes how to organize work with Claude in Git: how to run parallel workstreams, keep commits and pull requests consistent, undo a change safely, use commit hooks to enforce the rest, and coordinate several sessions on one repository.

## Pages

{{< cards >}}
  {{< card link="workstreams-and-branch-trees/" title="Workstreams and branch trees" icon="switch-horizontal" subtitle="Run parallel workstreams with branches and Git worktrees." >}}
  {{< card link="commits-and-pull-requests/" title="Commits and pull requests" icon="clipboard-check" subtitle="Get consistent commit messages and pull requests from Claude, and confirm before it changes shared history." >}}
  {{< card link="commit-hooks/" title="Commit hooks" icon="badge-check" subtitle="Integrate Git commit hooks with the changes that Claude makes." >}}
  {{< card link="undo-and-recover-changes/" title="Undo and recover changes" icon="rewind" subtitle="Choose the right way to undo a change that Claude made, from an uncommitted edit to a change that you already pushed." >}}
  {{< card link="headless-and-multi-agent-git/" title="Headless and multi-agent Git workflows" icon="user-group" subtitle="Run several Claude Code sessions against one repository, in the background or orchestrated as one task, without their Git state colliding." >}}
{{< /cards >}}
