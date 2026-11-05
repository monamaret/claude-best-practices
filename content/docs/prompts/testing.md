---
title: "Testing"
weight: 30
description: >-
  Prompts to write, run, and fix tests.
---

## Write a test that fails for the right reason

**Use when:** You want a new behavior tested before Claude implements it, so the test checks the requirement instead of mirroring whatever Claude ends up writing.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Testing](/docs/workflows/testing#write-the-test-before-the-implementation)

```text
Write a test for <BEHAVIOR>. Do not write the implementation yet.
Run the test and confirm that it fails, and that it fails because the
behavior is missing, not because of an unrelated error such as a syntax
error or a missing import. Show me the failure before you write any
implementation code. Then implement the behavior and run the test again.
```

**Adapt it:** Replace `<BEHAVIOR>` with the behavior in plain language, not the implementation, for example `rejecting an order with a negative quantity`, not `adding a check in validateOrder`. Add `Use the existing test style in <TEST_FILE>.` and replace `<TEST_FILE>` with a file in the same directory, so that the new test matches your conventions.
