---
title: "Maintain"
weight: 60
description: >-
  Use Claude for maintenance work such as upgrades and bug fixes.
---

Maintenance is not one task that finishes. It is an ongoing backlog of dependency upgrades, bug reports, and small cleanups that arrive over weeks, not in one session. Keep the backlog in a [counter file](/docs/general-tips/counter-files), so that an upgrade you started last week and a bug that came in this morning both stay visible to the next session, instead of only to the conversation where you first heard about them.

## Dependency upgrades

Upgrade one dependency at a time, not a whole lockfile at once. Ask Claude to read the changelog between your current version and the target version, point out breaking changes that affect this repository, make the change, and run the tests. A single-dependency upgrade is also easier to revert on its own if it turns out to break something that the tests did not catch.

An install command is riskier to allow by default than a test command, because many package managers run arbitrary code from the package during install, such as a `postinstall` script. [Settings files](/docs/general-tips/settings-file#good-practice) already excludes build, install, and deploy commands from its starter allow list for this reason. Keep install and upgrade commands in `permissions.ask`, so that Claude confirms with you before it runs one. If an upgrade turns out to have broken something after you already committed it, revert it in the same way as any other commit; see [Undo and recover changes](/docs/version-control/undo-and-recover-changes).

An upgrade that changes a library's API across many call sites is a refactor, not an upgrade in place. Treat it as one: establish a safety net, and make the change in small, reviewable steps. See [Refactoring](/docs/workflows/refactoring).

## Investigate and fix bugs

Ask Claude to reproduce a reported bug with a failing test before it changes any code, in the same way as [Testing](/docs/workflows/testing#write-the-test-before-the-implementation) asks for a failing test before new behavior. The three kinds of test that this guide's workflow pages ask for are easy to mix up, because each one is deliberately the opposite of its neighbor:

| Situation | What the test should do |
| --- | --- |
| New behavior that does not exist yet | Fail, because the behavior is missing. See [Testing](/docs/workflows/testing#write-the-test-before-the-implementation). |
| Existing behavior that you are about to refactor | Pass, against the code as it is today, before you touch it. See [Refactoring](/docs/workflows/refactoring#establish-a-safety-net-before-you-refactor). |
| A reported bug | Fail, in a way that reproduces the report, before the fix. Then pass, after it. |

For a bug that you already have a log or a stack trace for, see [Explain a failure from a log](/docs/prompts/maintenance#explain-a-failure-from-a-log). For a bug that you only have a description of, see [Reproduce a bug with a failing test](/docs/prompts/maintenance#reproduce-a-bug-with-a-failing-test).

## Recommended plugins for this stage

[wshobson/agents](https://github.com/wshobson/agents) has two plugins relevant here: `dependency-management` (dependency auditing, version management, and security vulnerability scanning) and `debugging-toolkit` (interactive debugging, developer experience optimization, and smart debugging workflows). Review each one before you install it. See [Review a plugin before you install it](/docs/cli/plugins#review-a-plugin-before-you-install-it).

## Related prompts

- [Explain a failure from a log](/docs/prompts/maintenance#explain-a-failure-from-a-log)
- [Reproduce a bug with a failing test](/docs/prompts/maintenance#reproduce-a-bug-with-a-failing-test)
- [Check the counter file and update item status](/docs/prompts/maintenance#check-the-counter-file-and-update-item-status)

## Further reading

- [Counter files](/docs/general-tips/counter-files)
- [Settings files](/docs/general-tips/settings-file)
- [Testing](/docs/workflows/testing)
- [Refactoring](/docs/workflows/refactoring)
- [Undo and recover changes](/docs/version-control/undo-and-recover-changes)
- [Plugins](/docs/cli/plugins)
