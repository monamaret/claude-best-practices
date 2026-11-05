---
title: "Non-interactive mode"
weight: 35
description: >-
  Run claude -p for bounded, scripted development tasks on your own computer, such as commit messages, log analysis, and pre-commit checks.
---

Non-interactive mode runs one prompt and exits. You start it with `claude -p` (`--print`) in the Claude Code CLI. Claude Code reads the prompt and any piped input, and works on the task with the tools that you allow. Then it prints the result and returns an exit code. Claude Desktop does not have non-interactive mode, so every procedure on this page uses the CLI.

Non-interactive mode suits local scripting for three reasons. Each run is one bounded task, so the result is easier to check. Each run starts with a fresh context window, so an earlier conversation does not affect it. The output is text or JSON, so a shell function, a Git hook, or a script can use it. This page covers runs on your own computer, with your own Claude Enterprise sign-in.

## How a run works

A run reads its input, does the task, and writes the result to stdout. It loads the same configuration as an interactive session in the same directory: CLAUDE.md files, skills, hooks, and MCP servers. It does not ask you anything while it runs.

### Give Claude the input

A run accepts input in three ways. You can combine them.

| Input | Example | Use for |
| --- | --- | --- |
| Prompt argument | `claude -p "<PROMPT>"` | The instructions |
| Piped stdin | `git diff --cached \| claude -p "<PROMPT>"` | Command output, such as a diff or a test log |
| File path in the prompt | `claude -p "Read build.log and ..."` | Large input, and files that Claude must search |

Piped stdin is limited to 10 MB. If the input is larger, Claude Code exits with an error. Save the input to a file in the working directory, and give Claude the path instead. Claude can read files in the working directory without a permission prompt.

When you pipe data, Claude does not need a shell tool to read it. This keeps the permissions of the run small.

### Choose the output format

The `--output-format` flag selects the format of stdout:

| Value | Output |
| --- | --- |
| `text` | The response as plain text. This is the default. |
| `json` | One JSON object with the result and the metadata of the run. |
| `stream-json` | One JSON object for each event, one per line, while the run works. |

Scripts read these fields of the `json` output:

| Field | Content |
| --- | --- |
| `result` | The response text. Error results do not have this field. |
| `is_error` | `true` if the run failed. |
| `subtype` | `success`, or an error type such as `error_max_turns` or `error_max_budget_usd`. |
| `session_id` | The ID that continues this conversation with `--resume`. |
| `structured_output` | The JSON that matches your `--json-schema`, if you passed one. |
| `total_cost_usd` | An estimated cost, calculated on your computer at list price, unless your organization configured its own rates. It is not a bill. |

For the complete list of fields, see [`SDKResultMessage`](https://code.claude.com/docs/en/agent-sdk/typescript#sdkresultmessage).

### Check the exit status

Claude Code exits with code 0 when the run succeeds, and with a non-zero code when it fails. If a flag is not valid, Claude Code writes the error to stderr before the run starts. If the run fails after it starts, for example because you are not signed in, Claude Code prints the failure on stdout as the result.

Check the exit code before a script uses the output. In PowerShell, read `$LASTEXITCODE`. In zsh or bash, read `$?`.

If your sign-in expired, start `claude` in a terminal and sign in again. The `/login` command does not work in a `-p` run.

### Limit a run

A bounded task needs a limit, because no person watches the run. Use these flags:

| Flag | Effect |
| --- | --- |
| `--max-turns <N>` | Stops the run with an error after `<N>` agentic turns. |
| `--max-budget-usd <AMOUNT>` | Stops the run when the estimated cost reaches `<AMOUNT>`. Spend can go past the amount, so leave a margin. |
| `--model <MODEL_ALIAS>` | Uses a smaller model for a routine task, for example `haiku` or `sonnet`. |

For the current model aliases, see [Model configuration](https://code.claude.com/docs/en/model-config). A Claude Enterprise administrator can restrict the models that you can select.

### Continue a conversation

Each run starts a new session. To give a follow-up instruction with the earlier context, continue the session.

To continue the most recent conversation in the current directory, including earlier `-p` runs, run the following command:

```shell
claude -c -p "<PROMPT>" --permission-mode dontAsk
```

To continue a specific conversation, run the following command. It works from any directory on this computer.

```shell
claude -p "<PROMPT>" --resume <SESSION_ID> --permission-mode dontAsk
```

To capture the session ID in a script, read it from the `json` output:

{{< tabs >}}
{{< tab name="Windows" >}}
```powershell
$sessionId = (claude -p "Review src/auth for error handling." --output-format json --permission-mode dontAsk | ConvertFrom-Json).session_id
claude -p "Now list the three most important problems." --resume $sessionId --permission-mode dontAsk
```
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
session_id=$(claude -p "Review src/auth for error handling." --output-format json --permission-mode dontAsk | jq -r '.session_id')
claude -p "Now list the three most important problems." --resume "$session_id" --permission-mode dontAsk
```

This example uses `jq`. If `jq` is not installed, install it with `brew install jq`.
{{< /tab >}}
{{< /tabs >}}

A continued conversation keeps all the earlier context, so each run uses more of your allowance. For an unrelated task, start a new run.

## Set permissions for an unattended run

No person answers permission prompts in a `-p` run. In current versions, if nothing sets a permission mode, the run starts in Manual mode, and Claude Code denies each tool call that needs approval. A run can still do actions that need no approval, such as reading files in the working directory. For the details, see [Which mode a non-interactive run starts in](https://code.claude.com/docs/en/permission-modes#which-mode-a-non-interactive-run-starts-in).

Give the run only the permissions that the task needs. Use these flags:

| Flag | Use |
| --- | --- |
| `--permission-mode dontAsk` | Denies every call that would prompt. Reads in the working directory, read-only commands, and your allow rules still run. |
| `--allowedTools "<RULES>"` | Approves the tools and commands that the task needs, with the [permission rule syntax](https://code.claude.com/docs/en/settings-reference#permission-rule-syntax). |
| `--disallowedTools "<RULES>"` | Denies tools or commands. A bare tool name, such as `Edit`, removes the tool from the run. |
| `--tools "<TOOLS>"` | Limits the built-in tools that the run has, for example `"Read"`. It does not affect the tools of MCP servers. |

Pass `--permission-mode` in every script. A `permissions.defaultMode` value in your settings also applies to `-p` runs. Without the flag, the run can start in another mode, such as `acceptEdits`. Also pass the allow rules that the task needs with `--allowedTools`. In a folder that you never trusted in an interactive session, a `-p` run does not apply the `permissions.allow` rules from the project's `.claude/settings.json` file. See [Settings files](/docs/general-tips/settings-file).

The following command approves file edits and the test command. Other calls that need approval are denied:

```shell
claude -p "Run the unit tests and fix the failures in src/parser." --permission-mode dontAsk --allowedTools "Read,Edit,Bash(npm test *),PowerShell(npm test *)"
```

On Windows, Claude uses the PowerShell tool as the primary shell. Without Git for Windows, it is the only shell tool. A `Bash(...)` rule does not apply to the PowerShell tool. With Git for Windows installed, a `Bash(...)` deny rule also disables the PowerShell tool without a warning, if no settings file has a `PowerShell(...)` rule. If any settings file has a `PowerShell(...)` rule, the PowerShell tool stays available, and an unpaired `Bash(...)` deny rule does not restrict it. Write each command rule for both tools. See [PowerShell tool](https://code.claude.com/docs/en/tools-reference#powershell-tool).

{{< callout type="warning" >}}
A `-p` run does not show the workspace trust dialog. It runs the repository's hooks, connects the MCP servers in its `.mcp.json` file, and applies the `allowed-tools` field of its skills. Run `claude -p` only in repositories that you trust. In another repository, add `--setting-sources user`. The run then skips the project settings, including their hooks, and the `.mcp.json` file. To disable all hooks for one run, add `--settings '{"disableAllHooks": true}'`. See [What runs before you trust a folder](https://code.claude.com/docs/en/permissions#what-runs-before-you-trust-a-folder). Do not use `--dangerously-skip-permissions` outside an isolated container or virtual machine. See [Sandboxes](/docs/general-tips/sandboxes).
{{< /callout >}}

If a `-p` run reports an authentication error, see [Start faster with bare mode](https://code.claude.com/docs/en/headless#start-faster-with-bare-mode).

## Prepare your shell

The examples on this page work in PowerShell on Windows and in zsh or bash on macOS.

{{< tabs >}}
{{< tab name="Windows" >}}
Use PowerShell 7.3 or later (`pwsh`) for the examples. Windows PowerShell 5.1 removes double quotation marks from the arguments of programs such as `claude.exe`, so a JSON argument does not arrive intact. It also writes files with the `>` operator in UTF-16 encoding. See [Install PowerShell on Windows](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows) and [Passing arguments that contain quote characters](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_parsing#passing-arguments-that-contain-quote-characters).

To check your version, run the following command:

```powershell
$PSVersionTable.PSVersion
```

Diffs, logs, and responses can contain non-ASCII text. To pass this text between PowerShell and `claude` without damage, add the following line to your PowerShell profile:

```powershell
$OutputEncoding = [Console]::InputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
```

The Git pre-commit hook on this page is a shell script. Git for Windows runs it with its own shell, so the hook works in any terminal.
{{< /tab >}}
{{< tab name="macOS" >}}
zsh is the default shell on macOS. The examples also work in bash. Some examples parse JSON with `jq`. If it is not installed, install it with `brew install jq`, or use the `node` alternative where the page shows one.
{{< /tab >}}
{{< /tabs >}}

## Local use cases

Each use case in this section is one bounded task with input that a command can produce. That is the kind of task that `-p` does well.

### Explain a failing build or test log

A failing build often prints hundreds of lines, and the first error is hard to find. A `-p` run reads the log, finds the first error, and does not add the log to your interactive session. Save the log to a file in the repository, so that Claude can search it and compare it with the code.

{{< tabs >}}
{{< tab name="Windows" >}}
```powershell
npm test *> test.log
claude -p "Read the log in test.log and find the root cause of the failure. Quote the first error and propose one fix. Do not change any files." --permission-mode dontAsk --tools "Read" --max-turns 10
```
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
npm test > test.log 2>&1
claude -p "Read the log in test.log and find the root cause of the failure. Quote the first error and propose one fix. Do not change any files." --permission-mode dontAsk --tools "Read" --max-turns 10
```
{{< /tab >}}
{{< /tabs >}}

Replace `npm test` with your build or test command. For a more complete prompt, see [Explain a failure from a log](/docs/prompts/maintenance#explain-a-failure-from-a-log). Delete the log file afterwards, or add it to `.gitignore`, so that you do not commit it.

### Draft a commit message from the staged diff

A commit message describes one diff, so it is a bounded task with exact input. Pipe the staged diff into Claude, and open the result in the Git editor so that you review it before Git creates the commit.

{{< tabs >}}
{{< tab name="Windows" >}}
```powershell
$message = git diff --cached | claude -p "Write a commit message for the staged Git diff on stdin. Use the imperative mood and a subject line of 72 characters or fewer. Print only the message." --permission-mode dontAsk --tools "Read" --max-turns 5
git commit --edit --message ($message -join "`n")
```
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
message=$(git diff --cached | claude -p "Write a commit message for the staged Git diff on stdin. Use the imperative mood and a subject line of 72 characters or fewer. Print only the message." --permission-mode dontAsk --tools "Read" --max-turns 5)
git commit --edit --message "$message"
```
{{< /tab >}}
{{< /tabs >}}

The `--edit` option opens the message in your Git editor. If you close the editor with an empty message, Git does not create the commit. For the complete prompt, see [Draft a commit message from the staged diff](/docs/prompts/maintenance#draft-a-commit-message-from-the-staged-diff). The [shell functions](#add-shell-functions) at the end of this section wrap these commands.

### Summarize a branch before you open a pull request

A pull request description needs the whole branch, not only the last commit. Pipe the commit log and the diff against the base branch into Claude, and write the summary to a file that you edit.

{{< tabs >}}
{{< tab name="Windows" >}}
```powershell
& { git log --no-color main..HEAD; git diff --no-color main...HEAD } | claude -p "The input is the commit log and the diff of this branch compared to main. Write a pull request description in Markdown with the sections Summary, Changes, Testing, and Risks. Describe only changes that are in the diff." --permission-mode dontAsk --tools "Read" --max-turns 5 > pr-description.md
```
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
{ git log --no-color main..HEAD; git diff --no-color main...HEAD; } | claude -p "The input is the commit log and the diff of this branch compared to main. Write a pull request description in Markdown with the sections Summary, Changes, Testing, and Risks. Describe only changes that are in the diff." --permission-mode dontAsk --tools "Read" --max-turns 5 > pr-description.md
```
{{< /tab >}}
{{< /tabs >}}

Replace `main` with your base branch. If the diff is larger than the stdin limit, replace `git diff` with `git diff --stat`, and let Claude read the files that it needs. For the complete prompt, see [Summarize a branch before you open a pull request](/docs/prompts/review#summarize-a-branch-before-you-open-a-pull-request).

### Check the staged diff in a pre-commit hook

A Git pre-commit hook runs before each commit. A hook that calls `claude -p` gives you a second review of the staged diff before Git creates the commit. This is a Git hook in `.git/hooks/`, not a [Claude Code hook](/docs/cli/hooks). It stays on your computer, because Git does not commit or push the `.git/hooks/` directory.

The example hook behaves in the following way:

- **It warns, and does not block, by default.** It prints the problems that Claude finds, and the commit continues. To stop the commit when Claude reports `BLOCK`, set the environment variable `CLAUDE_PRECOMMIT_BLOCK` to `1`.
- **You can skip it.** Run `git commit --no-verify` to skip it for one commit. Set `CLAUDE_PRECOMMIT_SKIP` to `1` to skip it in the current shell.
- **It does not stop your work when Claude is not available.** If the `claude` command is missing or the run fails, the hook prints a notice. The commit continues.
- **It skips some commits.** It skips empty diffs, commits that a Claude Code session makes, and diffs larger than `CLAUDE_PRECOMMIT_MAX_BYTES`. The default limit is 200,000 bytes. Claude Code sets `CLAUDE_CODE_CHILD_SESSION` to `1` in the commands that it runs.
- **It gives Claude only the diff.** The run has no built-in tools and no MCP servers, so Claude cannot read other files, edit files, or run commands.

To set the variables in the current shell, run the commands for your operating system:

{{< tabs >}}
{{< tab name="Windows" >}}
```powershell
$env:CLAUDE_PRECOMMIT_BLOCK = '1'
$env:CLAUDE_PRECOMMIT_SKIP = '1'
$env:CLAUDE_PRECOMMIT_MAX_BYTES = '100000'
```

To remove a variable, run `Remove-Item Env:CLAUDE_PRECOMMIT_SKIP`. To keep a value for every session, add the line to your PowerShell profile.
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
export CLAUDE_PRECOMMIT_BLOCK=1
export CLAUDE_PRECOMMIT_SKIP=1
export CLAUDE_PRECOMMIT_MAX_BYTES=100000
```

To remove a variable, run `unset CLAUDE_PRECOMMIT_SKIP`. To keep a value for every session, add the line to `~/.zshrc` or `~/.bashrc`.
{{< /tab >}}
{{< /tabs >}}

The hook adds the time of one Claude run to each commit, and each commit uses some of your allowance. If you commit often in small steps, enable the hook only for the repositories where a second review is worth that cost.

The core of the hook pipes the staged diff into Claude and reads the first line of the response that is not blank:

```shell {filename=".git/hooks/pre-commit"}
git diff --cached --no-color --no-ext-diff > "$diff_file"

# stdout holds the result. stderr goes to a separate file and is shown only on failure.
if ! output=$(claude -p "$prompt" --permission-mode dontAsk --tools "" --strict-mcp-config --max-turns 5 < "$diff_file" 2> "$err_file"); then
  echo "pre-commit: the Claude check did not complete. The commit continues." >&2
  { printf '%s\n' "$output"; cat "$err_file"; } | head -n 5 >&2
  exit 0
fi

# The verdict is the first line that is not blank.
verdict=$(printf '%s\n' "$output" | tr -d '\r' | awk 'NF { print $1; exit }')
```

[Download the complete non-interactive-pre-commit.sh](/examples/cli/non-interactive-pre-commit.sh).

Before you install it, check that the repository does not already use a pre-commit hook. Do not copy the file if `.git/hooks/pre-commit` already exists, or if the following command prints a value:

```shell
git config core.hooksPath
```

In that case, save the script under another name, and call it from the existing hook. Otherwise, change to the repository root and run the commands for your operating system:

{{< tabs >}}
{{< tab name="Windows" >}}
```powershell
Copy-Item <DOWNLOAD_PATH>\non-interactive-pre-commit.sh .git\hooks\pre-commit
```

The file name must be `pre-commit`, with no extension. Git for Windows runs the hook in Git Bash, which finds `claude.exe` on your `PATH`.
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
cp <DOWNLOAD_PATH>/non-interactive-pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```
{{< /tab >}}
{{< /tabs >}}

`<DOWNLOAD_PATH>` is the directory where you saved the file. To test the hook, stage a small change and run `git commit`. The hook prints `Claude is checking the staged diff` and then the result. For the prompt that the hook uses, see [Check a staged diff before you commit](/docs/prompts/review#check-a-staged-diff-before-you-commit).

The hook sends the staged diff to Claude. Do not use it to find secrets: a secret in the diff is already sent when Claude finds it. Use a secret scanner for that check, and run the scanner first.

### Run a bounded task in a loop

A change that repeats across many files, such as the replacement of a deprecated API, is a good candidate for a loop. Each iteration is one `-p` run for one file, with a fresh context. A problem in one file does not affect the next, and each run uses only the context that its file needs.

Start from a clean working tree, so that `git diff` afterwards shows only the changes from the loop. The following loop processes only the files that contain the old API:

{{< tabs >}}
{{< tab name="Windows" >}}
```powershell
git grep -l '<OLD_API>' -- '<PATHSPEC>' | ForEach-Object {
    Write-Host "Processing $_"
    claude -p "In the file $_, replace each call to <OLD_API> with <NEW_API>. Keep the behavior the same. Change only this file." --permission-mode dontAsk --tools "Read,Edit" --allowedTools "Read,Edit" --max-turns 10
    if ($LASTEXITCODE -ne 0) { Write-Warning "Claude did not finish $_" }
}
git diff --stat
```
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
git grep -l '<OLD_API>' -- '<PATHSPEC>' | while IFS= read -r file; do
  echo "Processing $file"
  claude -p "In the file $file, replace each call to <OLD_API> with <NEW_API>. Keep the behavior the same. Change only this file." --permission-mode dontAsk --tools "Read,Edit" --allowedTools "Read,Edit" --max-turns 10 < /dev/null ||
    echo "Claude did not finish $file" >&2
done
git diff --stat
```

The `< /dev/null` redirect is necessary. Without it, `claude` reads the list of files from the loop's stdin, and the loop stops after the first file.
{{< /tab >}}
{{< /tabs >}}

- `<OLD_API>` is the text to search for, for example the name of a deprecated function.
- `<NEW_API>` is the replacement.
- `<PATHSPEC>` limits the search to some files, for example `src/*.ts`.

The `--tools "Read,Edit"` flag limits the run to the Read and Edit tools. Claude can read files and change existing files, but it cannot create files or run commands. The tools of your MCP servers stay available, and `dontAsk` denies them unless an allow rule approves them. Check `git status` and the complete diff after the loop. Run your tests yourself before you commit. To undo the change in one file, run `git restore <FILE>`. For a longer prompt with more constraints, see [Apply one bounded change to a file](/docs/prompts/maintenance#apply-one-bounded-change-to-a-file).

### Get structured output for a script

When a script must act on the result, ask for JSON that matches a schema. Pass the schema with `--json-schema`, and read the `structured_output` field of the `json` output. The following example sorts linter warnings into three groups: fix, autofix, and ignore.

Save the schema in a file:

```json {filename="lint-triage.schema.json"}
{
  "type": "object",
  "properties": {
    "warnings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "file": { "type": "string" },
          "line": { "type": "integer" },
          "rule": { "type": "string" },
          "action": { "type": "string", "enum": ["fix", "autofix", "ignore"] },
          "reason": { "type": "string" }
        },
        "required": ["file", "line", "rule", "action", "reason"]
      }
    }
  },
  "required": ["warnings"]
}
```

Then pipe the linter output into Claude and parse the result:

{{< tabs >}}
{{< tab name="Windows" >}}
```powershell
$schema = Get-Content -Raw .\lint-triage.schema.json | ConvertFrom-Json | ConvertTo-Json -Depth 10 -Compress
$prompt = 'The input is linter output. For each warning, choose the action fix, autofix, or ignore, and give a reason of one sentence. Do not change any files.'
$json = <LINT_COMMAND> 2>&1 | claude -p $prompt --output-format json --json-schema $schema --permission-mode dontAsk --max-turns 5
$response = ($json -join "`n") | ConvertFrom-Json
if ($response.is_error -or -not $response.structured_output) { throw 'Claude did not return structured output.' }
$response.structured_output.warnings | Where-Object action -eq 'fix' | Format-Table file, line, rule, reason
```
{{< /tab >}}
{{< tab name="macOS" >}}
```shell
schema=$(cat lint-triage.schema.json)
prompt='The input is linter output. For each warning, choose the action fix, autofix, or ignore, and give a reason of one sentence. Do not change any files.'
<LINT_COMMAND> 2>&1 | claude -p "$prompt" --output-format json --json-schema "$schema" --permission-mode dontAsk --max-turns 5 > lint-triage.json
jq -r 'if .is_error or (.structured_output == null) then error("no structured output") else .structured_output.warnings[] | select(.action == "fix") | "\(.file):\(.line) \(.rule) \(.reason)" end' lint-triage.json
```

To parse the file with Node.js instead of `jq`, run the following command:

```shell
node -e 'const r = JSON.parse(require("fs").readFileSync("lint-triage.json", "utf8")); if (r.is_error || !r.structured_output) process.exit(1); for (const w of r.structured_output.warnings) if (w.action === "fix") console.log(`${w.file}:${w.line} ${w.rule} ${w.reason}`);'
```
{{< /tab >}}
{{< /tabs >}}

`<LINT_COMMAND>` is your linter command, for example `npx eslint .`. If the run ends without valid structured output, the response has no `structured_output` field, so the examples check for it first. For the complete prompt, see [Triage linter warnings as JSON](/docs/prompts/maintenance#triage-linter-warnings-as-json). For more about schemas, see [Get structured output](https://code.claude.com/docs/en/headless#get-structured-output).

### Add shell functions

A shell function gives a repeated task a short name, and keeps the prompt and the flags the same for each run. The downloadable files define three functions:

| Function | Task |
| --- | --- |
| `claude-commit` | Drafts a commit message from the staged diff and opens it in the Git editor. |
| `claude-pr-summary [<BASE_BRANCH>]` | Prints a pull request description for the current branch. The default base branch is `main`. |
| `claude-explain <LOG_FILE>` | Explains the root cause of a failure from a log file in the current directory. |

{{< tabs >}}
{{< tab name="Windows" >}}
Add the functions to your PowerShell profile. To open the profile, run the following commands:

```powershell
if (-not (Test-Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }
notepad $PROFILE
```

The following excerpt shows one function:

```powershell {filename="Microsoft.PowerShell_profile.ps1"}
function claude-commit {
    $diff = git diff --cached --no-color --no-ext-diff
    if (-not $diff) { Write-Warning 'Nothing is staged.'; return }
    $prompt = @'
Write a commit message for the staged Git diff on stdin.
Use the imperative mood. Write a subject line of 72 characters or fewer.
Then write a blank line and a body that explains what changed and why.
Wrap the body at 72 characters. Do not invent a reason that the diff does not show.
Print only the commit message, with no code fences and no introduction.
'@
    $message = $diff | claude -p $prompt --permission-mode dontAsk --tools "Read" --max-turns 5
    if ($LASTEXITCODE -ne 0 -or -not $message) { Write-Warning 'Claude did not return a message.'; return }
    git commit --edit --message ($message -join "`n")
}
```

[Download the complete non-interactive-profile.ps1](/examples/cli/non-interactive-profile.ps1), and copy its functions into your profile. Open a new PowerShell window to load them.
{{< /tab >}}
{{< tab name="macOS" >}}
Add the functions to `~/.zshrc` for zsh, or to `~/.bashrc` for bash. The following excerpt shows one function:

```shell {filename="~/.zshrc"}
claude-commit() {
  if git diff --cached --quiet; then
    echo "Nothing is staged." >&2
    return 1
  fi
  local prompt message
  prompt='Write a commit message for the staged Git diff on stdin.
Use the imperative mood. Write a subject line of 72 characters or fewer.
Then write a blank line and a body that explains what changed and why.
Wrap the body at 72 characters. Do not invent a reason that the diff does not show.
Print only the commit message, with no code fences and no introduction.'
  message=$(git diff --cached --no-color --no-ext-diff |
    claude -p "$prompt" --permission-mode dontAsk --tools "Read" --max-turns 5) || {
    echo "Claude did not return a message." >&2
    return 1
  }
  if [ -z "$message" ]; then
    echo "Claude did not return a message." >&2
    return 1
  fi
  git commit --edit --message "$message"
}
```

[Download the complete non-interactive-functions.sh](/examples/cli/non-interactive-functions.sh), and copy its functions into your shell configuration file. Open a new terminal window to load them.
{{< /tab >}}
{{< /tabs >}}

## Good practice

- **Keep prompts in one place.** A script that calls a stable prompt gives results that you can compare from run to run. Keep the prompt in a shell function, a file, or a [skill](/docs/general-tips/skills-and-plugins). A `-p` run can start a skill: put `/<SKILL_NAME>` at the start of the prompt, followed by its arguments.
- **Do not pipe secrets or customer data.** Piped input goes to Claude in the same way as a prompt. Do not pipe environment files, credentials, production logs with personal data, or customer data. Check a log before you pipe it.
- **Check the usage that automated runs add.** Each run counts toward your Claude Enterprise allowance, the same as an interactive session. A hook or a loop can start many runs without you noticing. Check your usage regularly. See [Check usage and cost](/docs/cli/common-tasks#check-usage-and-cost).
- **Review changes before you commit them.** A run that edits files does not show you each edit. Read the complete `git diff`, and run the tests yourself before you commit.
- **Use a fresh run for each task.** A new run has no history from earlier tasks. Use `-c` or `--resume` only when the next step needs the earlier context.

## CI/CD and repository automation

The use of non-interactive mode in CI/CD pipelines and repository automation is still under review. It is not yet a recommended workflow in this guide. Before it can be recommended, the following topics need a decision:

- **Authentication.** A CI runner cannot complete the browser SSO sign-in that your Claude Enterprise account uses. The method that automation uses to authenticate needs a decision by an administrator.
- **Unattended permissions.** A pipeline runs without a person who checks each action, so its permissions need a separate review.
- **Cost and usage visibility.** Automated runs need usage that the organization can attribute and limit.
- **Data handling.** A pipeline can send repository content, logs, and build output to Claude without a person who checks the content first.

{{< callout type="important" >}}
Ask your Claude Enterprise administrators before you use Claude Code in a CI/CD pipeline or in a scheduled job on a shared server. The same applies to repository automation, such as a GitHub workflow. Do not use your personal sign-in or credentials on a shared runner.
{{< /callout >}}

For background on how the CLI runs in automation, see [Run Claude Code programmatically](https://code.claude.com/docs/en/headless).

## Related prompts

- [Explain a failure from a log](/docs/prompts/maintenance#explain-a-failure-from-a-log)
- [Draft a commit message from the staged diff](/docs/prompts/maintenance#draft-a-commit-message-from-the-staged-diff)
- [Summarize a branch before you open a pull request](/docs/prompts/review#summarize-a-branch-before-you-open-a-pull-request)
- [Check a staged diff before you commit](/docs/prompts/review#check-a-staged-diff-before-you-commit)
- [Apply one bounded change to a file](/docs/prompts/maintenance#apply-one-bounded-change-to-a-file)
- [Triage linter warnings as JSON](/docs/prompts/maintenance#triage-linter-warnings-as-json)

## Further reading

- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Configure permissions](https://code.claude.com/docs/en/permissions)
- [Permission modes](https://code.claude.com/docs/en/permission-modes)
- [Tools reference](https://code.claude.com/docs/en/tools-reference)
- [Manage costs effectively](https://code.claude.com/docs/en/costs)
- [Common task reference](/docs/cli/common-tasks)
- [Hooks](/docs/cli/hooks)
- [Project setup](/docs/general-tips/project-setup)
