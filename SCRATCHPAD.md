# Scratchpad

## Current state

- **Status**: requirements written (`docs/REQUIREMENTS.md`), Ben's
  choices logged (DECISIONS.md 003-010); no add-on code yet.
- **Active milestone**: M1, panel + stage shells, mock mode with fake
  applicants, offline stage harness (REQUIREMENTS section 8).
- **Last session**: 2026-11-19, requirements from Ben's answers; test
  sheet `1ZCsMmoUErQurrT7SQX5yz5F_fHDAm2DiJxM-eMTcnso` made with fake rows.
- **Next actions**:
  1. Autonomous loop builds M1, then M3-M5 logic in mock mode (link
     building, field filtering, decision mapping, encrypted channel
     envelope, sealed votes), with unit tests and stage screenshots.
  2. Ben does REQUIREMENTS section 9 (Cloud project, OAuth client,
     Pages, Supabase, deployment) and sends the four non-secret values.
  3. M2 onward verified only in a real call by Ben.
- **Open questions**: REQUIREMENTS O7 (Video Recordings / Fast Review
  Page columns).

---

## Out of scope

- Native apps of any kind (iOS, macOS, tvOS, Android, Windows, TV).
  Ben, 2026-11-19: "we are not planning to build out any native apps in
  this new repository".

---

## Session log

### 2026-11-19: loop tick 1, M1 shells

- **Found**: requirements committed, no code.
- **Done**: `assets/acr-lib.js` (field filtering by header name with
  NULL/blank hidden, link building with shape checks, Yes/Maybe/No
  mapping, cell note text, next undecided); `assets/api.js` (one client,
  mock mode); `assets/config.js` (test sheet ID live, production ID
  parked); stage and panel pages with CSP and Meet SDK; mock TEST data;
  `tools/stage_screens.sh`; dev harness `tools/dev/` with a DevTools
  driver.
- **Verified (offline only)**: 10 unit tests pass, and a mutation of
  the NULL rule makes 2 fail. Stage fits at 560x315, 805x455, and
  1280x720 (screenshots). In the dev harness the panel starts a review
  on the first undecided TEST row and Previous moves the stage.
- **Built, not verified**: anything in Meet (SDK session,
  startActivity, notifyMainStage). Needs Ben's project number.
- **Left**: sign-in (needs client ID), voting, realtime, record.

### 2026-11-19: repository made

- **Found**: nothing; new repository.
- **Done**: copied the web, Meet, Google, data, and process skills and
  docs from UniversalAppTemplate; wrote AGENTS.md for a Meet add-on
  gated by a spreadsheet's sharing; wrote `docs/MEET-ADDON.md` from what
  was measured building the Human Shaped add-on.
- **Left**: every open question above; no code.
