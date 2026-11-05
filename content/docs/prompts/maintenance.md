---
title: "Maintenance"
weight: 60
description: >-
  Prompts for upgrades, refactoring, and bug fixes.
---

## Refactor code without changing its behavior

**Use when:** You want Claude to restructure code, such as a rename, an extraction, or a cleanup, without also changing what it does.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Refactoring](/docs/workflows/refactoring#state-that-behavior-must-not-change)

```text
Refactor <TARGET> to <GOAL>. Do not change its behavior, its public
interface, or its return values, unless I say otherwise. If you cannot
make this change without changing behavior, stop and tell me why instead
of proceeding.
```

**Adapt it:** Replace `<TARGET>` with the file, function, or module. Replace `<GOAL>` with the structural goal, for example `extract the validation logic into its own function` or `remove the duplication between these two files`. If no test covers `<TARGET>` yet, add `Write a test that captures its current behavior first, and run it before and after the refactor.`

## Reproduce a bug with a failing test

**Use when:** Someone reports a bug, and you want proof that Claude's fix actually addresses it, instead of a fix that happens to make the symptom go away in one manual check.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Maintain](/docs/workflows/maintain#investigate-and-fix-bugs)

```text
Here is a bug report: <BUG_REPORT>
Write a test that reproduces it. Run the test and confirm that it fails
in the way the report describes, not for an unrelated reason. Show me
the failure. Only then fix the code, and run the test again to confirm
it passes.
```

**Adapt it:** Replace `<BUG_REPORT>` with the report, pasted as the user wrote it, including steps to reproduce if you have them. If you have a log or a stack trace instead of a description, use [Explain a failure from a log](#explain-a-failure-from-a-log) first to find the cause, then come back to this prompt to lock the fix in with a test.

## Turn a repeated procedure into a skill

**Use when:** You have pasted the same multi-step procedure into chat more than once, or you keep asking Claude to do the same task the same way.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Skills and plugins](/docs/general-tips/skills-and-plugins)

```text
I keep asking you to do the following task the same way:
<DESCRIBE THE TASK AND THE STEPS YOU REPEAT>

Turn this into a skill at .claude/skills/<SKILL_NAME>/SKILL.md. Write a
description that states the task and when to use it, so that the skill
loads automatically when it applies. Keep the instructions as close as
possible to how I described the steps.
```

**Adapt it:** Add `Set disable-model-invocation: true` to the prompt if the task has a side effect, such as deploying or committing, and you want to trigger it only by name.

## Fix the problems that the IDE reports

**Use when:** VS Code or a JetBrains IDE shows errors or warnings, and you want Claude to fix all of them in the same session.
**Works in:** Claude Code CLI
**Explained in:** [CLI and IDE](/docs/cli/cli-and-ide)

```text
Read the current errors and warnings that the IDE reports for <FILE_OR_DIRECTORY>.
Group them by cause, and list each group with the files and lines it affects.
Fix the errors first, then the warnings.
Do not change behavior that the diagnostics do not identify.
Do not disable lint rules or add suppression comments to make a warning go away.
After the fixes, read the diagnostics again and report any that remain, with the reason.
```

**Adapt it:** Replace `<FILE_OR_DIRECTORY>` with a file path, a directory, or `every open file`. In a JetBrains IDE, each diagnostics call covers one file, so name the files explicitly. Remove the line about suppression comments if your team allows them for specific rules. Add `Ask me before you fix each group.` to review the changes one group at a time.

## Package repository skills into a plugin

**Use when:** Two or more repositories need the same skills, subagents, or hooks that one repository keeps in `.claude/`.
**Works in:** Claude Code CLI
**Explained in:** [Plugins](/docs/cli/plugins)

```text
Package the following parts of this repository's .claude/ directory into a
Claude Code plugin named <PLUGIN_NAME> in the directory <PLUGIN_DIR>:
<LIST_OF_SKILLS_SUBAGENTS_AND_HOOKS>

Follow the official plugin layout:
- .claude-plugin/plugin.json with name, description, and version 1.0.0
- skills/, agents/, and hooks/hooks.json at the plugin root, not inside .claude-plugin/
- Use ${CLAUDE_PLUGIN_ROOT} for every path to a file inside the plugin

Copy the files. Do not change the skill or subagent instructions. Do not
delete the originals in .claude/ yet.

When you finish, run `claude plugin validate <PLUGIN_DIR>` and fix any
errors. Then list the new names of each skill and subagent, and the command
that I run to test the plugin with --plugin-dir.
```

**Adapt it:** Replace `<PLUGIN_NAME>` with a name without spaces. It becomes the prefix of every skill, as in `/<PLUGIN_NAME>:deploy`. Replace `<PLUGIN_DIR>` with the directory for the plugin, for example `./plugins/<PLUGIN_NAME>`. Replace `<LIST_OF_SKILLS_SUBAGENTS_AND_HOOKS>` with the names of the files to include. Add `Also create .claude-plugin/marketplace.json for a marketplace named <MARKETPLACE_NAME> that lists the plugin.` if you want to publish it from the same repository.

## Update a guideline file after a tracked change

**Use when:** Something that CLAUDE.md or a file under `.claude/rules/` describes has changed, for example a build command, and you want the guideline file fixed in the same change, not in a later cleanup.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Ask Claude to update its own guidelines and skills](/docs/patterns/local-maintenance#ask-claude-to-update-its-own-guidelines-and-skills)

```text
Update <GUIDELINE_FILE>: <WHAT_CHANGED>, from <OLD_VALUE> to <NEW_VALUE>.
Check the other guideline files for the same reference and update them too.
Do not change anything else in any file.
```

**Adapt it:** Replace `<GUIDELINE_FILE>` with the file you know changed, for example `CLAUDE.md`. Replace `<WHAT_CHANGED>`, `<OLD_VALUE>`, and `<NEW_VALUE>` with the specific fact, for example `the build command` and the two commands. Review the diff before you commit, in the same way as any other change to a file that every session reads.

## Write an eval suite for a skill

**Use when:** You have a skill that works in a manual test, and you want to confirm it works across the different ways someone might ask for the same task, and keep confirming that after you change it.
**Works in:** Claude Code CLI
**Explained in:** [Test a skill with more than one invocation](/docs/patterns/build-test-refactor-a-skill#test-a-skill-with-more-than-one-invocation)

```text
Write a claude plugin eval suite for the skill <PLUGIN_NAME>:<SKILL_NAME> in
<PLUGIN_DIR>. Create one case under evals/ for each of the following requests,
written the way a user would actually phrase it, not as a restatement of the
skill's description:
<LIST_OF_REQUESTS>

For each case, add a tool_used grader that confirms the skill was invoked.
Add a second grader where the output itself can be checked, for example a
regex for required content or a file_exists check for a file the skill
should create.

After you write the suite, run it and report the result. Do not change the
skill itself yet.
```

**Adapt it:** Replace `<LIST_OF_REQUESTS>` with the phrasings you want covered, including at least one that is easy to confuse with a different skill or with no skill at all. Add `Also add a case using the exact wording from <EXAMPLE>.` for a real request that prompted you to write this suite.

## Diagnose why a skill is not triggering correctly

**Use when:** A skill does not load when you expect it to, loads for tasks it should not, or you changed its description and want to confirm the change worked before you publish it.
**Works in:** Claude Code CLI
**Explained in:** [Refactor a skill's description](/docs/patterns/build-test-refactor-a-skill#refactor-a-skills-description)

```text
The skill <PLUGIN_NAME>:<SKILL_NAME> is <over-triggering on unrelated tasks /
not triggering for tasks it should cover>. Run its eval suite and report,
for each failing case, whether the tool_used grader for the skill passed.

Propose a change to the skill's description that addresses the failing
cases, without broadening or narrowing it so far that it affects the cases
that already pass. Explain the change before you make it.
```

**Adapt it:** Replace the bracketed phrase with the actual symptom. After Claude proposes a description change, run the suite again with `--case <CASE> --runs 1 --ablation none` for one fast check, then the full suite before you publish. If the skill has no eval suite yet, run [Write an eval suite for a skill](#write-an-eval-suite-for-a-skill) first.

## Explain a failure from a log

**Use when:** A build, test run, or deployment fails, and you have the log output but not the cause.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Non-interactive mode](/docs/cli/non-interactive-mode#explain-a-failing-build-or-test-log)

```text
Read the log in <LOG_FILE> and find the root cause of the failure.
Report:
- The first error that caused the failure, quoted from the log, with its line number
- The cause, in three sentences or fewer
- The file and line in this repository that you think is responsible, if you can find one
- One proposed fix
Do not change any files. Do not explain errors that are consequences of the first error.
```

**Adapt it:** Replace `<LOG_FILE>` with the path to the log file. To pipe the log instead, remove the first line. In PowerShell on Windows, run `Get-Content <LOG_FILE> | claude -p "<PROMPT>"`. In zsh or bash on macOS, run `cat <LOG_FILE> | claude -p "<PROMPT>"`. Remove `Do not change any files.` if you want Claude to apply the fix.

## Write a hook for a repeated check

**Use when:** You keep asking Claude to run the same check, or a CLAUDE.md instruction such as "always run the formatter" is not followed every time.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Hooks](/docs/cli/hooks)

```text
I want this check to run automatically, not only when I remember to ask:
<DESCRIPTION_OF_CHECK>

Write a Claude Code hook for it:
- Choose the hook event and the matcher, and tell me why you chose them.
- Put the logic in a Node.js script at .claude/hooks/<SCRIPT_NAME>.js that
  reads the hook input as JSON from stdin. Do not use jq or a shell.
- Register it in .claude/settings.json in exec form: "command": "node" and
  "args" with ${CLAUDE_PROJECT_DIR}. Merge it into the existing hooks
  object. Do not replace other settings.
- The hook must work on Windows and macOS. If it inspects shell commands,
  match both Bash and PowerShell.
- Explain the exit codes and any JSON output that the script uses.
Then show me a command that sends sample JSON to the script so that I can
test it before I commit it.
```

**Adapt it:** Replace `<DESCRIPTION_OF_CHECK>` with the check, for example `Run the linter on each file that you edit`. Replace `<SCRIPT_NAME>` with a short kebab-case name. If the hook is a safety check, add `Set "onFailure": "block" so that a failure blocks the action.` If your team uses Python, replace Node.js with Python and `node` with `python`.

## Build the solution and fix the compiler errors

**Use when:** Claude cannot read the errors of your IDE, for example when you run the Claude Code CLI in the Visual Studio terminal.
**Works in:** Claude Code CLI
**Explained in:** [CLI and IDE](/docs/cli/cli-and-ide)

```text
Build <SOLUTION_OR_PROJECT> with the following command: <BUILD_COMMAND>
Read the compiler output and group the errors and warnings by cause.
Fix the errors first, then the warnings.
Do not change behavior that the build output does not identify.
Do not suppress warnings or disable analyzers to make the build pass.
After the fixes, build again and report the errors or warnings that remain, with the reason.
```

**Adapt it:** Replace `<SOLUTION_OR_PROJECT>` with the solution or project file, and `<BUILD_COMMAND>` with the build command of your project, for example `dotnet build` or `mvn -q compile`. Remove the line about warnings if your team handles them separately. Add `Ask me before you fix each group.` to review the changes one group at a time.

## Draft a commit message from the staged diff

**Use when:** You staged a change and want a first draft of the commit message to edit before you commit.
**Works in:** Claude Code CLI
**Explained in:** [Non-interactive mode](/docs/cli/non-interactive-mode#draft-a-commit-message-from-the-staged-diff)

```text
Write a commit message for the staged Git diff on stdin.
Use the imperative mood. Write a subject line of 72 characters or fewer.
Then write a blank line and a body that explains what changed and why.
Wrap the body at 72 characters. Do not invent a reason that the diff does not show.
Print only the commit message, with no code fences and no introduction.
```

**Adapt it:** Pipe the diff into the prompt with `git diff --cached | claude -p "<PROMPT>"`. To follow a team convention, add a line such as `Start the subject with a type, such as feat: or fix:.` To link a ticket, add `End the body with the line Refs: <TICKET_ID>.` and replace `<TICKET_ID>` with the ticket ID.

## Apply one bounded change to a file

**Use when:** The same change must be applied to many files, and you run Claude one time for each file in a loop.
**Works in:** Claude Code CLI
**Explained in:** [Non-interactive mode](/docs/cli/non-interactive-mode#run-a-bounded-task-in-a-loop)

```text
In the file <FILE>, make this change: <CHANGE>
Constraints:
- Change only <FILE>. Do not create, rename, or delete files.
- Keep the behavior the same. Do not refactor code that the change does not need.
- If the file does not need the change, do not edit it.
When you finish, print one line: CHANGED, UNCHANGED, or NEEDS REVIEW,
followed by one sentence that explains why.
```

**Adapt it:** Replace `<FILE>` with the loop variable that holds the file path. Replace `<CHANGE>` with one specific change, for example `replace each call to <OLD_API> with <NEW_API>`. Run it with `--permission-mode dontAsk --tools "Read,Edit" --allowedTools "Read,Edit"`. Claude can then read files and change existing files, but it cannot create files or run commands. Review the complete `git diff` after the loop.

## Triage linter warnings as JSON

**Use when:** A linter reports many warnings, and a script must decide which warnings a person fixes, which an autofix handles, and which do not apply.
**Works in:** Claude Code CLI
**Explained in:** [Non-interactive mode](/docs/cli/non-interactive-mode#get-structured-output-for-a-script)

```text
The input on stdin is the output of a linter.
For each warning, choose one action:
- fix: the warning points to a real bug or a risk, and a person must fix it
- autofix: the linter or a formatter can fix it safely, with no review
- ignore: the warning does not apply to this code
Return one entry for each warning, with the file, the line, the rule, the action,
and a reason of one sentence.
Do not change any files.
```

**Adapt it:** Run it with `--output-format json` and `--json-schema`. Use the schema in `lint-triage.schema.json` from [Get structured output for a script](/docs/cli/non-interactive-mode#get-structured-output-for-a-script). The result is then in the `structured_output` field. To apply team rules, add a line such as `Always choose fix for the rule <RULE_NAME>.` and replace `<RULE_NAME>` with the name of the rule.

## Check the counter file and update item status

**Use when:** You added requests to the counter file, answered a blocked request, or return to a repository and want Claude to continue the open work.
**Works in:** Claude Desktop, Claude Code CLI
**Explained in:** [Counter files](/docs/general-tips/counter-files#track-tasks-and-workflow-status)

```text
Read counter.md in the repository root.
List each request in the Requests section that has no status line, or that is
In progress or Blocked. For a Blocked request, say whether an **Answer:** line
follows the status line. For each request that you can work on, give one
sentence on what you plan to do. Do not act on the Ideas section.
Then wait for my go-ahead.

When you work on the requests:
- Continue a Blocked request only when it has an **Answer:** line.
- Update the **Status:** line of each request when you start, finish, or stop.
  Use In progress, Blocked, or Done <YYYY-MM-DD>, with what is still open,
  the question for me, or a summary and the commit hash.
- In the Requests section, edit only status lines. Do not change, reorder,
  or remove my text.
- Ask me before you push, merge, delete files, or publish anything.
```

**Adapt it:** Replace `counter.md` with the path of your counter file. Add `Work only on the request <REQUEST_HEADING>.` to limit the session to one item, and replace `<REQUEST_HEADING>` with the heading of the request. Remove `Then wait for my go-ahead.` if you want Claude to start without a review of the list. The last line of the prompt still makes Claude ask before a push, a merge, or a deletion.
