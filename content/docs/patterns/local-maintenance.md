---
title: "Maintain local skills and guidelines"
weight: 50
description: >-
  Keep CLAUDE.md, .claude/rules/, and skills accurate as a project changes.
---

A CLAUDE.md file, a rule under `.claude/rules/`, and a skill are all instructions that Claude reads instead of deriving from the code each time. That is their value: Claude does not have to rediscover your build command or your commit convention every session. It is also their risk. None of them update themselves when the project changes, so each one can describe a project state that no longer exists, while still looking like a current instruction.

## Why out-of-date guidelines and skills cause errors

An out-of-date instruction is worse than no instruction, because Claude follows it with the same confidence as an accurate one. A CLAUDE.md that still names a removed build command sends Claude looking for a script that is not there. A rule that describes a convention the team dropped six months ago produces code that a reviewer now has to correct. Claude has no way to tell, from the file alone, that the project moved on since it was written.

This risk grows with the number of files. A single CLAUDE.md is easy to keep in your head. A project with several files under `.claude/rules/` and a handful of skills needs a habit for checking them, not only a habit for writing them.

## Review guideline files with each change

Treat a guideline file the same way you treat the code that it describes. When you change the thing that it documents, update the file in the same change, not in a later cleanup. A CLAUDE.md that says how to run the tests is wrong the moment the test command changes, until someone edits it.

Periodically, or before onboarding a teammate, audit every guideline file at once instead of waiting to notice a stale one by accident:

```text
Review CLAUDE.md and every file under .claude/rules/ for problems:
- Instructions written for a project state that no longer exists
- References to files, commands, or settings that do not exist
- Two files that give different guidance for the same situation
Report what you find. Do not change any file until I confirm the fix.
```

See [Audit guideline files for conflicts](/docs/prompts/review#audit-guideline-files-for-conflicts) for the full prompt, including a built-in alternative command. For how these files are organized and loaded, see [Guideline files](/docs/general-tips/guideline-files).

## Notice when a skill's description no longer matches how the project works

A skill has the same drift risk as a CLAUDE.md file, with one more failure mode. Claude decides whether to load a skill by matching your task against its `description` field. A description can go stale in a way that you do not see until the skill fails to trigger, or triggers for the wrong task. See [What a skill is and when Claude uses it](/docs/general-tips/skills-and-plugins#what-a-skill-is-and-when-claude-uses-it) for how that matching works.

A skill's body can also drift separately from its description: the description still matches the task, but the steps inside the skill reference a file, a command, or a convention that changed. Reviewing a skill for this is the same exercise as reviewing a CLAUDE.md file, applied to each `SKILL.md` instead.

{{< callout type="info" >}}
Tuning a skill's description for how reliably it triggers, including the tooling that reports on this, is a different task from checking whether it still describes reality. See [Watch how a skill actually triggers in real sessions](/docs/patterns/build-test-refactor-a-skill#watch-how-a-skill-actually-triggers-in-real-sessions).
{{< /callout >}}

## Ask Claude to update its own guidelines and skills

Claude can write the fix once you have confirmed it is needed. Point it at the specific file and the specific change, the same way you would for any other edit:

```text
Update CLAUDE.md: the build command changed from <OLD_COMMAND> to <NEW_COMMAND>.
Check .claude/rules/ for the same reference and update it too. Do not change
anything else in either file.
```

See [Update a guideline file after a tracked change](/docs/prompts/maintenance#update-a-guideline-file-after-a-tracked-change) for the full prompt and how to adapt it. Keep this kind of edit small and reviewed, in the same way as a code change. A guideline file is read on every session afterward, so a mistake in it repeats every time, not only once.

## Remove rules and skills that no longer apply

A rule or a skill that no longer applies is not neutral. It still loads, still takes up context, and still risks being followed. Remove it instead of leaving it in place "in case it is still useful." If you are not sure whether a rule still applies, the audit prompt above finds the candidates; confirming each one is a short decision once you see it listed.

For a skill, check whether it still loads at all before you decide to keep it. [`/skill-doctor`](/docs/patterns/build-test-refactor-a-skill#watch-how-a-skill-actually-triggers-in-real-sessions) reports skills that have gone unused, which is a sign that either nobody needs them anymore, or their description no longer matches how anyone asks for them.

## How this differs from building a skill

[Build, test, and refactor a skill](/docs/patterns/build-test-refactor-a-skill) is about the first build of a skill, and the tuning that happens while you get it working: writing it, testing it against more than one invocation, and fixing a description that does not trigger correctly yet. This page is about what happens afterward, to a skill or a guideline file that already worked: staying accurate as the rest of the project keeps changing around it.

## Good practice

- Update a guideline file in the same change as the thing that it describes, not in a later cleanup.
- Audit every guideline file at once on a schedule, instead of waiting to notice a stale one by accident.
- Treat a skill's description and its body as two separate things that can each go stale on their own.
- Remove a rule or a skill once it stops applying. A stale instruction is a risk, not a harmless leftover.

## Related prompts

- [Audit guideline files for conflicts](/docs/prompts/review#audit-guideline-files-for-conflicts)
- [Update a guideline file after a tracked change](/docs/prompts/maintenance#update-a-guideline-file-after-a-tracked-change)

## Further reading

- [Guideline files](/docs/general-tips/guideline-files)
- [Skills and plugins](/docs/general-tips/skills-and-plugins)
- [Build, test, and refactor a skill](/docs/patterns/build-test-refactor-a-skill)
- [Audit your instruction files](https://code.claude.com/docs/en/memory#audit-your-instruction-files)
