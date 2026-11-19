# ACR Helper: Agent Project Context

ACR Helper is a **Google Meet add-on**, a web app that Meet frames as a
side panel and a main stage. There are no native apps in this
repository and none are planned: no iOS, macOS, tvOS, Android, Windows,
or TV work. It was started on November 19, 2026, from what Ben learned
building the Human Shaped add-on for Meet
(`docs/MEET-ADDON.md`, and the `google-meet-addon` skill).

## What this app does

Ben, November 19, 2026, in his words:

> "The plan is to build out an add-on that works only for those with
> the proper access to a particular spreadsheet and it will help us to
> make decisions about each row of the spreadsheet based upon the data
> from within that spreadsheet (and other sources)."

So, three facts hold everything else up:

1. **The spreadsheet's own sharing is the access list.** A person who
   cannot open the sheet with their own Google account sees nothing but
   a plain refusal. The add-on never keeps a second copy of who is
   allowed in.
2. **One row is one decision.** The panel and stage work through rows:
   what the row says, what other sources say about it, and what the
   group decides.
3. **People decide; the add-on gathers.** It brings the row's data and
   the other sources together, says where each fact came from, and
   records the decision the people made. It never decides for them
   (see "Why we build").

Still open, and Ben's to answer (SCRATCHPAD.md, "Open questions"): what
ACR stands for and who sits in the call, which spreadsheet and which
columns, what the "other sources" are, what a decision is (the choices,
and where it is written), and whether the add-on is for one Google
Workspace organization or anyone. Ask; never fill these in.

## Why we build

Every feature in this app is built in service of human judgment and
learning, not to replace thinking, but to deepen it. At each decision
point, ask: does this design invite the people in the call to engage
more fully, think more critically, or connect more meaningfully? If a
feature makes a person more passive, reconsider it. If it opens a door
to curiosity or collaboration, prioritize it. The goal is never a slick
product. It is a tool that makes someone more human.

**Before implementing any feature**, invoke the
`learning-orientation-design` skill. For a decision tool that means: a
summary or a suggestion never stands in for the evidence; each fact
names its source and links to it; a recommendation, if Ben ever asks for
one, is labeled as one and is shown after the evidence, never before; and
the person who records a decision is named with it.

This is **human-shaped software**: it takes the mechanical work off
people's hands (finding the row, pulling the other sources, writing the
decision back) and leaves them the judging. Every round makes three
moves: **write** (values, features, and feedback live here), **play**
(the owner uses what you built in a real Meet call; you are never the
tester), **publish** (it goes out to the people who will use it, and
their feedback drives the next round).

---

## How we build

The method lives in **skills** in `.claude/skills/` (catalog:
`.claude/skills/README.md`). Don't re-derive a pattern; invoke the skill
when its trigger matches. This file is every agent's one source: Claude
Code imports it in `CLAUDE.md`, Gemini CLI in `GEMINI.md`. With no skill
mechanism, open `.claude/skills/<name>/SKILL.md` and follow it.

| When | Skill |
|---|---|
| **Deciding what to build** | |
| Proposing or reviewing ANY feature, especially AI or automation | `learning-orientation-design` |
| Starting any feature change | `feature-shipping-discipline` |
| Logging an architecture decision | `architectural-decision-log` |
| UI work once `ADDON-DESIGN.md` exists | `binding-design-doc-discipline` |
| Feedback on how human-shaped the add-on is | `human-shaped-review` |
| **The add-on** | |
| Anything Meet: side panel, main stage, activities, messages between frames, testing in a call, the Marketplace | `google-meet-addon` (then `docs/MEET-ADDON.md`) |
| Several people in one call sharing live state, turns, a queue | `live-learning-sessions` |
| Google sign-in, the Cloud project, OAuth scopes, Drive, Sheets, Calendar | `github-and-google-learning-infrastructure` |
| Any web UI, routing, data, offline work | `web-platform-patterns` |
| Designing any view | `mobile-first-density-design` + `native-platform-first` + `frontend-design` |
| A list, a sheet's rows, anything that loads | `universal-feature-states` |
| What each role sees (who decides, who watches) | `learner-experience-design` |
| **Data** | |
| A server, a database, or shared state beyond the sheet | `zero-cost-hosted-backend` |
| A stable ID for each row, or matching a row to another source | `canonical-entity-identity` |
| Deciding what another source may say about a row (provenance, wrong matches, stale data) | `evidence-gated-catalog-curation` |
| Adding a third-party data source, or one is withdrawn | `third-party-revocation-resilience` |
| Reading a web page as a source for a row | `web-content-extraction` |
| Figures from someone else's listings or data, shown honestly | `provenance-honest-market-data` |
| A second client reads the same data | `shared-data-plane-contract` |
| **Keeping it working** | |
| User pushback after 3+ rounds of "still broken" | `3d-feature-debug-loop` (the method is general) |
| Adding or editing a scheduled workflow, or CI noise | `ci-fleet-engineering` |
| Running an unattended multi-tick loop | `autonomous-loop-cadence` |
| Coordinating with a second AI agent surface | `two-agent-handoff` |

Read `docs/platforms/web.md` before any web work, and
`docs/MEET-ADDON.md` before any add-on work.

### Hard rules

- **All network calls through one shared client** (`assets/api.js`
  once it exists); views never call `fetch` directly.
- **Every request to Google uses the signed-in person's own token**,
  refreshed before it expires. The add-on never holds a service account
  key or anyone else's token in the browser.
- **Access is checked against the sheet on every load**, never cached
  as "allowed": someone removed from the sheet loses the add-on the
  next time it opens.
- **Spreadsheet contents never leave Google except to the person
  reading them**: no copy in a database, a log, an analytics call, a
  URL, or a third-party service, unless Ben decides otherwise and it is
  in DECISIONS.md.
- **Version every script and stylesheet** (`?v=`) and bump it on every
  change: Meet caches the pages for 10 minutes.
- **Secrets never in git**, and never in cleartext on disk. A Cloud
  project number and an OAuth client ID are not secrets; a client
  secret or a key is.

---

## Debugging philosophy

**Do not iterate blindly on behavior you cannot observe.** When the root
cause is not clear from reading the code, the first move is diagnostics,
not another implementation attempt.

1. **Add observability before another implementation.** Write what you
   *expect* to see vs. what would *indicate* the bug.
2. **Isolate layers**: the sheet, the token, the panel, the message to
   the stage, the stage. The bug is in the layer whose actual output
   diverges from its expected output.
3. **Inside Meet nobody can read the frames' console.** Put errors and
   diagnostic numbers on the panel or stage itself ("Something went
   wrong: <message>"), so a test and a real person can report them.
4. **Two tabs are not Meet.** Anything crossing panel and stage, or
   anything a second person sees, is verified only in a real call with
   a second Chrome profile (`google-meet-addon`, "Testing").
5. **Make diagnostics permanent but switched off by a flag when the bug
   class recurs** (`?diag=1`). One-off diagnostics are removed before
   declaring a fix complete.

After 3+ rounds of "still broken," invoke `3d-feature-debug-loop` and
reset to research and observable evidence. Stop trying fixes; start
measuring.

---

## Binding design doc

Past about five views, add `ADDON-DESIGN.md`, seeded from
`docs/templates/WEB-DESIGN-template.md` and the Human Shaped panel's
rules summarized in `docs/MEET-ADDON.md`. Once created, it is binding:
quote the rule before proposing UI work; fix the doc, then the feature.
The panel wears Meet's own colors, type, and shapes, light and dark.

---

## Automation, CI, and verification

- **`docs/AUTONOMOUS-LOOPS.md`**: the agent is never the tester; ship
  only on external observation; verified vs merely-fixed is a
  load-bearing distinction in every session log.
- **`docs/ENGINEERING-PROCESS.md`**: the engineering disciplines, each
  with its incident (absence is not evidence; a test is not a test
  until seen to fail).
- **`docs/CI-FLEET.md`**: a green run must have done something, a red
  run must mean something, and no run may destroy work. Much of it was
  written for app stores and devices; the principles hold here.

Those three documents came from a template that also builds native
apps. Where they mention a simulator, a device, or a store, read it as
"a real Meet call" and skip what does not apply.

---

## How we collaborate

**The memory ratchet.** When the user **corrects an approach**, save it
as a feedback memory with a `**Why:**` line. When the user **validates
a non-obvious choice**, save it too. Save **project state** as a project
memory with the date.

**Fix the doc first, then the feature.** When a binding design doc and a
proposal conflict, the bug is in the doc. Update the rule, get
alignment, then ship.

**Trust but verify.** Subagent summaries describe what the agent
*intended*, not what it *did*. Check the actual diff before reporting
work as done.

**Auto-pace decisiveness.** When how to build is reasonably inferable,
make the call and keep going. Reserve questions for decisions only the
user can make, and surface every such decision rather than burying it.

**There is never one way to solve a problem.** When Meet seems to forbid
something, list several routes, measure which the SDK allows, and build
the one that serves what people are trying to do (Ben, November 18,
2026, on the Human Shaped stage).

**Verify before declaring done.** Tests confirm code, not features;
"it loads" is not "it works in a call." Show the evidence: the command
you ran and what it returned, or a screenshot of the panel in Meet.

**Session log discipline.** Each SCRATCHPAD.md entry is state found,
work done, state left. The scratchpad keeps the two most recent
entries; older ones roll word for word into `docs/SESSION-LOG.md`.

---

## Standing instructions

- **Read the relevant skill before re-deriving a pattern.**
- **Commit messages quote the user's request verbatim** when applicable.
- **DECISIONS.md leads with WHY, not WHAT**: the rule, then `**Why:**`,
  then `**How to apply:**`.
- **Don't add features beyond what's requested.** Fix only the bug.
- **Don't refactor surrounding code.** Scoped diffs.
- **Default to writing no comments.** Only when the WHY is non-obvious.
- **No emojis in code or commits** unless explicitly requested.
- **Only essential words on screen.** A caption must be a refusal, a
  warning, or a fact the person cannot discover by looking. *No check
  yet.*
- **No AI-written lists or copy in the product.** Words on screen come
  from the sheet, a source, or a human editor. *No check yet.*
- **Never test with real rows in a real meeting.** Use a test copy of
  the sheet, label test data, and clean it up. *No check yet.*
- **One spelling locale, linted.** *Check: `tools/test_us_english.py`.*
- **Every agent finds the same skills.** *Check:
  `tools/test_agent_files.py`.*
- **Update SCRATCHPAD.md "Out of scope" when rejecting an idea**, so it
  is not re-litigated next session.

---

## Current state

`SCRATCHPAD.md`: active milestone and open questions. `DECISIONS.md`:
architecture decisions.
