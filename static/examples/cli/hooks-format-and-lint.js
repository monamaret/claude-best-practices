#!/usr/bin/env node
// PostToolUse hook for the Edit and Write tools.
// Save as .claude/hooks/format-and-lint.js in your repository.
//
// Claude Code sends the tool call as JSON on stdin. The script formats the
// edited file with Prettier, then lints it with ESLint. If Prettier cannot
// parse the file or ESLint reports problems, the script returns a "block"
// decision, so that Claude receives the output next to the tool result and
// can fix the problems.
//
// The script runs the formatter and the linter one after the other. Two
// separate hooks on the same event run in parallel, so the linter could read
// the file while the formatter writes it.
//
// The script starts each tool with the same node executable, from the
// repository's node_modules directory. It does not use a shell, npx, or the
// .cmd shims, so it works the same way on Windows, macOS, and Linux.
'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const LINT_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);

// Returns the absolute path of a package's command-line entry point, or null
// if the package is not installed in the repository.
function findBin(projectDir, pkg, binName) {
  const pkgJson = path.join(projectDir, 'node_modules', pkg, 'package.json');
  if (!fs.existsSync(pkgJson)) return null;
  const { bin } = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
  const rel = typeof bin === 'string' ? bin : bin && bin[binName];
  return rel ? path.resolve(path.dirname(pkgJson), rel) : null;
}

function run(projectDir, bin, args) {
  return spawnSync(process.execPath, [bin, ...args], { cwd: projectDir, encoding: 'utf8' });
}

// A PostToolUse "block" decision does not undo the edit. Claude receives the
// reason next to the tool result.
function block(reason) {
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
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
    // Exit code 1 is a non-blocking error. The transcript shows a notice.
    process.stderr.write(`format-and-lint: cannot parse hook input: ${err.message}\n`);
    process.exitCode = 1;
    return;
  }
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd;
  const filePath = input.tool_input && input.tool_input.file_path;
  if (!filePath || !fs.existsSync(filePath)) return;

  // 1. Format. --ignore-unknown skips file types that Prettier does not support.
  const prettier = findBin(projectDir, 'prettier', 'prettier');
  if (prettier) {
    const result = run(projectDir, prettier, ['--write', '--ignore-unknown', filePath]);
    if (result.status !== 0) {
      // Prettier fails when the file has a syntax error. Return the error to
      // Claude, so that Claude can fix the file in the next step.
      block(`Prettier could not format ${filePath}. Fix the file:\n${result.stderr || result.stdout}`);
      return;
    }
  }

  // 2. Lint. ESLint exits 1 when it finds problems and 2 on a configuration error.
  const eslint = findBin(projectDir, 'eslint', 'eslint');
  if (!eslint || !LINT_EXTENSIONS.has(path.extname(filePath).toLowerCase())) return;
  const result = run(projectDir, eslint, [filePath]);
  if (result.status === 1) {
    block(`ESLint found problems in ${filePath}. Fix them:\n${result.stdout}`);
  } else if (result.status !== 0) {
    process.stderr.write(`ESLint failed for ${filePath}:\n${result.stderr || result.stdout}`);
    process.exitCode = 1;
  }
});
