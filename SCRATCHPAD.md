# Scratchpad

## Current state

- **Status**: deployed to https://bhwilkoff.github.io/ACR-Helper/ (v0.2.0,
  repo public). Google and Supabase set up. NOTHING verified in Meet yet.
- **Active milestone**: M2-M5 real-call verification, by Ben.
- **Setup done 2026-11-19** (agent in Ben's minerva.edu Chrome profile):
  - Cloud project "ACR Helper", ID `acr-helper`, number 29360684398,
    org minerva.edu. Sheets API, Workspace add-ons API, Marketplace SDK on.
  - Consent screen: ACR Helper, External, Testing; test users
    ben.wilkoff@minerva.edu, benwilkoff@gmail.com (Ben ticked the
    User Data Policy box). Scopes not declared (not needed in Testing;
    declare before verification).
  - OAuth web client "ACR Helper web", origins
    https://bhwilkoff.github.io and http://localhost:8080.
  - HTTP deployment `acr-helper` (tools/meet-addon/deployment.json).
  - Supabase: org "Minerva University Admissions", project ACR Helper,
    ref gjnbqfcqaxfgnjodvxlr, publishable key in config. Broadcast on a
    public channel verified from Node (two clients).
- **Ben's next steps**: press Install on the `acr-helper` deployment;
  then a real call on the TEST sheet: minerva.edu profile (has access,
  chair) and the gmail profile (no access, must see the refusal).
  Committee members must be added as test users before they can sign in.
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

### 2026-11-19: first real-call test (call bkr-rpwk-qka)

- **Profiles** (by deviceId, account checked on screen): f839cfaa =
  ben.wilkoff@minerva.edu, chair; 465d58b6 = benwilkoff@gmail.com, no
  sheet access, admitted as a guest.
- **Verified in Meet**: ACR Helper appears under Add-ons after Install;
  the panel loads in Minerva colors; sign-in from the sidebar with only
  Google's window (v0.3.0, Ben allowed with the Sheets box ticked); the
  access check passes for the sheet's owner; the hidden `_acr` key tab
  was created with Ben's own token; Start review opened TEST-0004, the
  first row with an empty decision (rows 1-3 have Yes/Maybe/No).
- **Found and fixed**: GIS started on load in a popup failed
  (`popup_failed_to_open`); an intermediate sign-in tab plus Google's
  window was too much for Ben (decision 011); any 403 read as "not
  shared" (now scope / API / not shared); Start review opened no main
  stage because the panel trusted getActivityStartingState (v0.3.1).
- **Meet keeps the old panel alive**: after a push, use the add-on's
  ⋮ > Close add-on, then reopen from Activities, after the 10-minute
  cache window.
- **Second call (myc-dbru-ynu), v0.3.2, all verified in Meet**:
  supportsScreenSharing off removed Meet's "let those without the
  add-on follow along" tab share; Start review + Continue opened the
  main stage with the TEST applicant (profile, scores, FA, notes, three
  links); vote shows "1 of 1 have voted" with the name only; Reveal
  shows name + choice + counts on panel and stage; Record Waitlist
  wrote `Maybe` to TEST-0004's decision cell with the note "Recorded by
  Ben Wilkoff, Nov 19 2026 in ACR Helper" (read back from the sheet).
  A participant without the add-on (gmail) sees no applicant data;
  Meet tells them "The activity is not available to you."
- **Third call (wqv-atvn-zei), v0.4.0, verified in Meet**: One Tap
  signed the panel in inside the sidebar with no window and no click
  ("Signed in to Google as ben.wilkoff@minerva.edu"); Open the review
  then got the Sheets token with no visible Google window to answer, and
  the lobby appeared. Sign-in is now one press, inside the sidebar.
- **Not yet verified**: two different voters with access (needs a
  second account that has the add-on); the in-panel no-access refusal
  for someone who has the add-on but no sheet access; whether the
  account hint skips Google's chooser (stored now, untested).
- **Blocked on Ben**: committee members cannot get the add-on until it
  has a Marketplace listing (Install covers only the developer account).
  Profile 3f1c0f29 needs Google's "Verify it's you" sign-in.

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
