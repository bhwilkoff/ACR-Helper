---
name: template-skills
description: "Use at the start of any task in this repository, and whenever a row in the AGENTS.md \"How we build\" table matches what you are about to do. This repository keeps its skills in .claude/skills/ (SKILL.md folders for feature design, the Meet add-on, Google sign-in and Sheets, web, data, CI, and loops). This skill is the pointer to them: it says how to find and load the right one."
---

# The skills live in `.claude/skills/`

This repository keeps one copy of its skills, in `.claude/skills/`. This
folder exists only so that agents that look in `.agents/skills/` (Gemini
CLI, Antigravity) can find them.

1. Read the "How we build" table in `AGENTS.md`. Each row names the
   skill to use for a situation.
2. Open `.claude/skills/<skill-name>/SKILL.md` and follow it. Read its
   `references/` files when it points to them.
3. When no row matches, scan `.claude/skills/README.md`.

Do not copy skills into this folder. `tools/test_agent_files.py` checks
that every link here resolves.
