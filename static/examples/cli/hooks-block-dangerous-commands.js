#!/usr/bin/env node
// PreToolUse hook for the Bash and PowerShell tools.
// Save as .claude/hooks/block-dangerous-commands.js in your repository.
//
// Claude Code sends the tool call as JSON on stdin. If the command matches a
// rule below, the script prints a JSON "deny" decision and Claude receives the
// reason. Otherwise it exits 0 with no output, so the normal permission flow
// applies. This script does not approve any command.
//
// The script uses only Node.js built-in modules, so it runs the same way on
// Windows, macOS, and Linux, and it does not need jq.
//
// A pattern list cannot find every way to write a command. Use this hook
// together with permissions.deny rules, not instead of them.
'use strict';

// Commands that delete files: rm (Bash, and the PowerShell alias), the
// PowerShell cmdlet Remove-Item and its aliases, and the cmd.exe commands.
const DELETE_COMMANDS = new Set(['rm', 'remove-item', 'ri', 'del', 'erase', 'rd', 'rmdir']);

// Flags that make a delete recursive:
// - rm short flags, alone or combined: -r, -R, -rf, -fr, -f -r
// - rm long flag: --recursive
// - PowerShell -Recurse and its abbreviations: -r, -re, -rec, -recurse:$true
// - cmd.exe: rd /s, rmdir /s, del /s
const RECURSIVE_FLAG = [
  /^-[dfiIvrR]*[rR][dfiIvrR]*$/,
  /^--recursive$/,
  /^-r(e(c(u(r(s(e)?)?)?)?)?)?(:\S*)?$/i,
  /^\/s$/i,
];

// Each rule gets the words of one command segment and returns true if the
// segment must be blocked. Adapt the list to your team.
const RULES = [
  {
    reason: 'Recursive delete is blocked by a project hook. Delete specific files, or ask the user to run the command.',
    test: (words) =>
      words.some(
        (word, i) =>
          DELETE_COMMANDS.has(word.toLowerCase()) &&
          words[i - 1] !== 'git' && // git rm -r --cached only changes the index
          words.slice(i + 1).some((arg) => RECURSIVE_FLAG.some((flag) => flag.test(arg))),
      ),
  },
  {
    reason: 'Force push is blocked by a project hook. Push without force, or ask the user.',
    test: (words) =>
      gitArgs(words, 'push').some(
        (arg) =>
          /^--force(-with-lease)?(=.*)?$/.test(arg) || // --force, --force-with-lease
          /^-[a-zA-Z]*f[a-zA-Z]*$/.test(arg) || // -f, -uf, -fu
          /^\+/.test(arg), // +main, +HEAD:main
      ),
  },
  {
    reason: 'git reset --hard is blocked by a project hook, because it discards uncommitted work. Ask the user first.',
    test: (words) => gitArgs(words, 'reset').includes('--hard'),
  },
];

// Returns the words after "git ... <subcommand>", or an empty list.
function gitArgs(words, subcommand) {
  const git = words.indexOf('git');
  if (git === -1) return [];
  const sub = words.indexOf(subcommand, git + 1);
  return sub === -1 ? [] : words.slice(sub + 1);
}

// Splits a command line into segments at ; & | && || and line breaks, and
// each segment into words without surrounding quotes or parentheses.
function segments(command) {
  return command
    .split(/&&|\|\||[;&|\r\n]/)
    .map((segment) =>
      segment
        .trim()
        .split(/\s+/)
        .map((word) => word.replace(/^["'`(]+|["'`)]+$/g, ''))
        .filter(Boolean),
    );
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch (err) {
    // Exit code 1 is a hook failure. With "onFailure": "block" in the
    // settings, Claude Code blocks the tool call instead of running it.
    process.stderr.write(`block-dangerous-commands: cannot parse hook input: ${err.message}\n`);
    process.exitCode = 1;
    return;
  }

  const command = (input.tool_input && input.tool_input.command) || '';
  const rule = RULES.find((r) => segments(command).some((words) => r.test(words)));
  if (!rule) {
    return; // Exit 0 with no output: no decision.
  }

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: rule.reason,
      },
    }),
  );
});
