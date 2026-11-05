# zsh and bash functions for Claude Code CLI non-interactive mode (claude -p).
#
# Add these functions to ~/.zshrc (zsh, the default shell on macOS) or
# ~/.bashrc (bash). Then open a new terminal window, or run: source ~/.zshrc
#
# Requires the Claude Code CLI on PATH.
# Each function runs one bounded task in a new session. The --tools "Read" flag
# limits the built-in tools to Read, so Claude can read files but cannot edit
# files or run shell commands. The tools of your MCP servers stay available,
# and --permission-mode dontAsk denies them unless an allow rule approves them.

# Draft a commit message from the staged diff, then open it in the Git editor.
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

# Summarize the current branch compared to a base branch, for a pull request description.
claude-pr-summary() {
  local base="${1:-main}"
  local prompt="The input on stdin is the commit log and the diff of the current branch compared to $base.
Write a pull request description in Markdown with these sections:
- Summary: two or three sentences about the purpose of the change
- Changes: a bulleted list, grouped by area of the code
- Testing: the tests that the diff adds or changes, or \"No test changes\"
- Risks: anything that a reviewer must check with care
Describe only changes that are in the diff. Print only the description."
  { git log --no-color "$base..HEAD"; git diff --no-color --no-ext-diff "$base...HEAD"; } |
    claude -p "$prompt" --permission-mode dontAsk --tools "Read" --max-turns 5
}

# Explain the root cause of a failure from a log file in the current directory.
claude-explain() {
  if [ -z "$1" ]; then
    echo "Usage: claude-explain <LOG_FILE>" >&2
    return 1
  fi
  local prompt="Read the log in $1 and find the root cause of the failure.
Report:
- The first error that caused the failure, quoted from the log, with its line number
- The cause, in three sentences or fewer
- The file and line in this repository that you think is responsible, if you can find one
- One proposed fix
Do not change any files. Do not explain errors that are consequences of the first error."
  claude -p "$prompt" --permission-mode dontAsk --tools "Read" --max-turns 10
}
