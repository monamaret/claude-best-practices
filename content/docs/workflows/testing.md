---
title: "Testing"
weight: 20
description: >-
  Use Claude to write, run, and fix tests.
---

Claude can write an implementation and a test for it in the same turn. Left unchecked, the test can end up checking what the code happens to do, not what it should do, because the same session wrote both from the same understanding of the task. Writing the test first, and letting Claude run it itself, keeps the test an independent check instead of a mirror of the implementation.

## Write the test before the implementation

Ask Claude to write a test that fails for the reason that you expect, before it writes the code that makes it pass. State the behavior that you want, not the implementation, so that the test checks the requirement and not a specific approach:

```text
Write a test for <BEHAVIOR>. Do not write the implementation yet.
Run the test and confirm that it fails, and that it fails because the
behavior is missing, not because of an unrelated error. Show me the
failure before you write any implementation code.
```

Reviewing the failure before Claude implements anything catches a test that would have passed for the wrong reason, such as one that never reaches the code under test. For the complete prompt, see [Write a test that fails for the right reason](/docs/prompts/testing#write-a-test-that-fails-for-the-right-reason).

## Let Claude run tests and read the results

Approve your test command so that Claude can run it without a prompt every time. [Settings files](/docs/general-tips/settings-file#start-with-a-minimum-project-settings-file) already gives starter `permissions.allow` rules for Maven, Gradle, and dotnet test commands. A test run is a safe default allow, because it only reads the repository and reports a result; it does not change files, install anything, or reach a system outside the repository. Add the equivalent rule for your own test command if it is not one of these, with a matching `PowerShell(...)` rule for Windows.

When a test fails, Claude reads the output and tries a fix. Check what actually changed before you accept it: a fix can make the test pass by correcting the code, or by weakening the test, for example loosening an assertion or deleting the case that failed. Read the diff to both files, not only the test output.

### Run the tests automatically when Claude finishes a turn

A `Stop` hook runs when Claude would otherwise end its turn, and it can send Claude back to work instead. Use it to run your test command automatically, so that Claude keeps going until the tests pass, without you asking after every change:

```javascript {filename=".claude/hooks/run-tests-on-stop.js"}
const { spawnSync } = require('node:child_process');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const result = spawnSync('npm', ['test', '--silent'], { cwd: projectDir, encoding: 'utf8' });

if (result.status !== 0) {
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: `The test command failed:\n${result.stdout}\n${result.stderr}`,
  }));
}
```

Replace `npm`, `['test', '--silent']` with your own test command, for example `mvn` and `['test']`. Register it on `Stop` in `.claude/settings.json`, in exec form so that it works on Windows and macOS:

```json {filename=".claude/settings.json"}
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/run-tests-on-stop.js"],
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

A `decision: "block"` on `Stop` sends the reason back to Claude as the next instruction, so Claude keeps working instead of ending its turn. Set `timeout` high enough for your test suite to finish; a hook that times out makes no decision, so a slow suite can let a failing turn stop anyway. For the general mechanics of hooks, matchers, and exit codes, see [Hooks](/docs/cli/hooks). Keep this hook off a test suite that takes minutes to run, because it runs after every turn, not only once.

## Review generated tests

A test that never fails is not testing anything. Before you trust a new test, break the behavior that it checks on purpose, for example by commenting out the line it covers, and confirm that the test fails. Then restore the code and confirm that it passes again. This catches a test that always passes regardless of the implementation, which a passing test run alone does not reveal.

## Recommended plugins for this stage

[wshobson/agents](https://github.com/wshobson/agents) is a Claude Code plugin marketplace with two plugins relevant here: `unit-testing` (unit and integration test automation for Python and JavaScript, with debugging support) and `tdd-workflows` (test-driven development with red-green-refactor cycles and code review). Review each one before you install it. See [Review a plugin before you install it](/docs/cli/plugins#review-a-plugin-before-you-install-it).

## Related prompts

- [Write a test that fails for the right reason](/docs/prompts/testing#write-a-test-that-fails-for-the-right-reason)
- [Explain a failure from a log](/docs/prompts/maintenance#explain-a-failure-from-a-log)

## Further reading

- [Settings files](/docs/general-tips/settings-file)
- [Hooks](/docs/cli/hooks)
- [Plugins](/docs/cli/plugins)
- [Refactoring](/docs/workflows/refactoring), for the safety net that a solid test suite gives a refactor
