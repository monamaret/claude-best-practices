---
title: "Use reference implementations"
weight: 10
description: >-
  Give Claude an existing implementation to follow, instead of only a description of what you want.
---

A description tells Claude what the result should do. A reference implementation shows Claude what the result should look like: the file layout, the naming, the error handling, the level of abstraction. When both are available, point Claude to the reference. It removes an entire category of guessing.

## Why examples work better than descriptions

A description leaves gaps that Claude fills with a generic default, which is often not what your codebase does. "Add a REST endpoint for refunds" can produce a correct endpoint that still does not match how your other endpoints validate input, log errors, or return pagination.

An existing, working implementation closes those gaps without you having to write them down. Claude reads the pattern from the code: which layer validates input, which exceptions map to which status codes, how a similar endpoint is tested. You do not have to describe a convention that the codebase already states.

This also makes a request easier to translate across a team. "Add an endpoint like the one in `OrdersController`" names a concrete artifact. "Add an endpoint that follows our conventions" asks the reader to already know what those conventions are.

## Select a good reference implementation

Not every existing file is a good reference. Pick one that is:

- **Representative, not exceptional.** Choose a typical case, not the one file in the codebase that has an unusual workaround or a deprecated pattern.
- **Complete.** Include its tests, not only the implementation file. A reference without a test pattern leaves Claude to guess how to test the new code too.
- **Current.** Check when the file last changed. A reference implementation that predates a later refactor teaches Claude the old pattern.
- **Close in scope.** A reference for a similar kind of change works better than a reference for a similar kind of feature. A small CRUD endpoint is a better reference for another small CRUD endpoint than a large, stateful one is, even if both are "endpoints."

If the codebase has more than one pattern for the same kind of thing, for example two different ways of writing a repository class, say which one is current and which one is legacy. Without that, Claude can match either one.

## Use a whole repository as the reference

A reference implementation does not have to be a file in the same repository. A new project can be a variant of an existing one, for example the same kind of internal tool built for a different team. In that case, point Claude at the whole existing repository, instead of describing its structure again in words.

Claude Code reads files on disk. It does not browse a remote repository on its own. Clone the reference repository first, or confirm that Claude already has a local copy. Name its path the same way you would name a file inside your own repository.

This pairs naturally with scaffolding a project from a seed file. If the new project is close enough to an existing one, name the existing repository as a reference. Do this in the same prompt that asks Claude to propose a structure from the seed file. See [Use a seed file for initial scaffolding](/docs/general-tips/seed-files#use-a-seed-file-for-initial-scaffolding).

## Point Claude to the reference

Name the reference implementation by file path, not by description. Ask Claude to read it before it writes anything new.

```text
Add a refund endpoint, following the pattern in src/api/orders/OrdersController.ts
and its test file. Match its validation, error handling, and logging style.
List the differences between the new endpoint and the reference before you
write any code, for example a different authorization check.
```

Asking Claude to list the differences first gives you a chance to catch a case where the reference does not fully apply. You catch it before Claude writes code around a wrong assumption.

{{< callout type="info" >}}
A reference implementation also works as a teaching tool during review. If a reviewer asks why the code is structured a certain way, you can point to the same reference, instead of writing a new explanation.
{{< /callout >}}

## Good practice

- Reference a file, not a feature. "Like `OrdersController`" is specific. "Like our other endpoints" is not.
- Point to a reference and its test together. A reference without a test pattern produces new code without a test pattern.
- Say when a reference is legacy. If the codebase has more than one pattern for the same kind of thing, name the current one.
- Ask for the differences before the code. This surfaces a mismatch while it is still cheap to fix.
- Point at a cloned repository, not a URL, when the reference is a whole project rather than one file. Claude reads what is on disk.

## Related prompts

- [Implement a feature from a reference implementation](/docs/prompts/planning#implement-a-feature-from-a-reference-implementation)

## Further reading

- [Guideline files](/docs/general-tips/guideline-files)
