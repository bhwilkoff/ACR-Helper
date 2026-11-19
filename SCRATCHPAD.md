# Scratchpad

## Current state

- **Status**: M1-M5 BUILT in mock mode and checked offline in the dev
  harness (three TEST panels + a stage). NOTHING verified in Meet.
- **Active milestone**: M2, blocked on Ben's setup values.
- **Last session**: 2026-11-19, requirements, then a four-tick loop.
- **Blocked on Ben** (REQUIREMENTS section 9): Cloud project number,
  OAuth client ID (origin `https://bhwilkoff.github.io`), Supabase URL
  and publishable key, GitHub Pages on, deployment JSON
  (`tools/meet-addon/deployment.json`) installed, a logo, test copy
  shared with the test accounts, and permission to push.
- **Then**: put the four values in `assets/config.js`, bump `?v=`,
  push, and Ben tests in a real call with two profiles (one with sheet
  access, one without), on the TEST sheet only.
- **Open questions**: REQUIREMENTS O7 (Video Recordings / Fast Review
  Page columns).
- **Run locally**: `python3 -m http.server 8080`, open
  `http://localhost:8080/tools/dev/` (add `?diag=1`). Tests:
  `node --test tests/*.test.js`.

---

## Out of scope

- Native apps of any kind (iOS, macOS, tvOS, Android, Windows, TV).
  Ben, 2026-11-19: "we are not planning to build out any native apps in
  this new repository".

---

## Session log

### 2026-11-19: loop tick 4, confirm path, Go to row, sign-in, realtime

- **Found**: voting flow working in the harness; confirm path undriven.
- **Done**: Go to applicant; sign-in popup (`addon/signin/`, Google
  Identity Services token client, token back by postMessage, memory
  only, "Stay signed in" 5 minutes before expiry); Supabase Realtime
  broadcast over its raw websocket (`assets/realtime.js`, no
  third-party script, rejoin + resync); deployment JSON. Fixed:
  members who opened before the chair started were not counted (test
  seen failing first); the Scores two-column rule lost to a later rule,
  so small stages hit the zoom floor and clipped.
- **Verified (offline harness only)**: changing the cell behind the
  chair's back brings up "It now says: Yes. Replace it with No
  (Reject)?" and Replace writes `No` (mock); Go to 9 moves all three
  panels; "0 of 3 have voted" with three panels; the recorded stage fits
  at 560x315 and 1280x720. 22 tests pass.
- **Built, not verified**: sign-in popup, real Sheets reads/writes and
  the cell note, `_acr` tab creation, Supabase transport, Meet SDK
  calls (startActivity, notifyMainStage, getMeetingInfo).
- **Left**: everything in "Blocked on Ben".

### 2026-11-19: loop tick 3, voting, reveal, record in the panel

- **Found**: session logic tested on a fake bus, panel not wired.
- **Done**: panel joins the encrypted session (`assets/transport.js`:
  BroadcastChannel in mock/harness, Supabase to come); lobby with tab
  picker; four vote buttons; "n of m have voted"; chair Reveal, Vote
  again, decision picker, Record (re-reads the cell first and asks to
  confirm if it changed, R22), Next applicant (next undecided),
  Previous, Skip; `_acr` key read or created via `api.js`; three-panel
  dev harness with the stage of a member.
- **Verified (offline harness only)**: full flow with three TEST
  panels. Before reveal neither member's panel shows a tally; after
  reveal all three and the member's stage show the same names and
  choices; Record Waitlist wrote `Maybe` into TEST-0004's decision cell
  (mock); Next applicant moved everyone to TEST-0005 with votes
  cleared. Screenshots in the session scratchpad.
- **Built, not verified**: the confirm-on-changed-cell path (not yet
  driven), real Sheets writes and the cell note, the `_acr` tab
  creation, anything in Meet.
- **Left**: drive the confirm path; Go to row; Google sign-in; Supabase
  transport.

### 2026-11-19: loop tick 2, encrypted channel and sealed votes

- **Found**: M1 shells, 10 tests.
- **Done**: `assets/acr-crypto.js` (AES-GCM group envelope bound to
  the channel name; channel name = SHA-256 of key + meeting code;
  ECDH P-256 sealed votes bound to session + round);
  `assets/acr-session.js` (chair owns state, members follow; hello /
  here / vote / state messages; presence over 45 s; reveal opens votes
  only then; vote again and moving on clear votes; stale-round votes
  ignored). Run tests with `node --test tests/*.test.js`.
- **Verified (offline only)**: 21 tests pass. Mutations seen to fail:
  plaintext envelope (3 fail), early reveal (2 fail).
- **Built, not verified**: nothing on a real network yet; transport
  is a fake bus. Known limit: a member's name on a vote is self-declared
  inside the envelope, so any sheet reader could spoof a name.
- **Left**: wire the session into the panel (BroadcastChannel transport
  for the dev harness, Supabase later), vote UI, reveal, record.

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
