#!/bin/sh
# Git pre-commit hook: Claude Code CLI checks the staged diff before each commit.
#
# Save this file as .git/hooks/pre-commit in your repository (no file extension).
# Git for Windows runs it with its bundled shell. On macOS, run:
#   chmod +x .git/hooks/pre-commit
#
# Behavior:
#   - By default, the hook only warns, and the commit continues.
#   - If CLAUDE_PRECOMMIT_BLOCK=1 is set, a BLOCK result stops the commit.
#   - Skip the hook for one commit with: git commit --no-verify
#   - Or set CLAUDE_PRECOMMIT_SKIP=1 to skip it for a whole shell session.
#   - The hook skips commits that a Claude Code session makes, empty diffs,
#     and diffs larger than CLAUDE_PRECOMMIT_MAX_BYTES (default 200000).
#   - If the claude command is missing or the run fails, the commit continues.
#
# Claude gets only the diff on stdin: no built-in tools and no MCP servers.
# The staged diff is sent to Claude. Run a secret scanner before this hook,
# and do not use it in repositories whose content must not leave your computer.

[ "${CLAUDE_PRECOMMIT_SKIP:-0}" = "1" ] && exit 0

# A Claude Code session sets CLAUDE_CODE_CHILD_SESSION=1 in the commands that it
# runs. Skip those commits, so that Claude does not start a second run for its own commit.
[ "${CLAUDE_CODE_CHILD_SESSION:-0}" = "1" ] && exit 0

if ! command -v claude >/dev/null 2>&1; then
  echo "pre-commit: the claude command is not on PATH. Skipping the Claude check." >&2
  exit 0
fi

max_bytes="${CLAUDE_PRECOMMIT_MAX_BYTES:-200000}"
case "$max_bytes" in
  ''|*[!0-9]*) max_bytes=200000 ;;
esac

diff_file=$(mktemp) || exit 0
err_file=$(mktemp) || { rm -f "$diff_file"; exit 0; }
trap 'rm -f "$diff_file" "$err_file"' EXIT

git diff --cached --no-color --no-ext-diff > "$diff_file"
size=$(wc -c < "$diff_file" | tr -d ' ')

[ "$size" -eq 0 ] && exit 0
if [ "$size" -gt "$max_bytes" ]; then
  echo "pre-commit: the staged diff is larger than $max_bytes bytes. Skipping the Claude check." >&2
  exit 0
fi

prompt='Review the staged Git diff on stdin before it is committed.
Report only these problems in the changed lines:
- Obvious bugs, such as a wrong condition, a missing null check, or an unhandled error
- Debug code or temporary output that was left in
- Code that cannot compile or run, such as a syntax error or a call to a removed function
Do not comment on style or naming. Do not change any files.
On the first line, print exactly one word: PASS, WARN, or BLOCK.
Use BLOCK only for code that cannot compile or run. Use WARN for the other problems.
After the first line, list each problem as file:line and one sentence.'

echo "pre-commit: Claude is checking the staged diff..." >&2

# stdout holds the result. stderr goes to a separate file and is shown only on failure.
if ! output=$(claude -p "$prompt" --permission-mode dontAsk --tools "" --strict-mcp-config --max-turns 5 < "$diff_file" 2> "$err_file"); then
  echo "pre-commit: the Claude check did not complete. The commit continues." >&2
  { printf '%s\n' "$output"; cat "$err_file"; } | head -n 5 >&2
  exit 0
fi

# The verdict is the first line that is not blank.
verdict=$(printf '%s\n' "$output" | tr -d '\r' | awk 'NF { print $1; exit }')

case "$verdict" in
  PASS)
    echo "pre-commit: Claude found no problems." >&2
    exit 0
    ;;
  BLOCK)
    printf '%s\n' "$output" >&2
    if [ "${CLAUDE_PRECOMMIT_BLOCK:-0}" = "1" ]; then
      echo "pre-commit: commit stopped. Fix the problems, or commit with --no-verify." >&2
      exit 1
    fi
    echo "pre-commit: warning only. The commit continues." >&2
    exit 0
    ;;
  *)
    printf '%s\n' "$output" >&2
    echo "pre-commit: warning only. The commit continues." >&2
    exit 0
    ;;
esac
