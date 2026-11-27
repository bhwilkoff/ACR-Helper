# Session log (older entries, word for word from SCRATCHPAD.md)

### 2026-11-24: Marketplace review started; reviewer access checked

- **Found**: gwm-review@google.com (Nov 24, to benwilkoff@gmail.com, read in
  ben@learningischange.com) asks for a video and that
  gsmtestuser@marketplacetest.net be allowed in. The TEST sheet was shared
  only with Ben's two accounts, samantha and cintia; link access was off
  (401 signed out), though the Nov 23 reply to the OAuth team said it was on.
- **Done**: Ben chose Editor; TEST sheet shared with gsmtestuser (read back).
  Reply drafted in Google's thread (ben@learningischange.com), real links
  read back, not sent.
- **Checked, read-only**: console scopes, listing scopes, and config.js match
  (drive.file, email, profile, openid); Verification Center "not required";
  listing in review; video unlisted, 3:16; every public page 200; real sheet
  has no link access (401).
- **Corrected (Ben: "Update everything that needs to be updated for their
  review to be accurate.")**: support/, testers/, TESTERS.md (picker in the
  side panel, no unverified-app warning); privacy/ (notes by the chair or the
  note-taker; the `acr-ready` marker in the browser; date Nov 24).
- **Found, not changed (locked during review)**: Developer and Application
  Website URLs are still bhwilkoff.github.io/ACR-Helper (301 to
  acr.humanshaped.org); the four screenshots predate the notes button.
  Editing either means cancelling the review.
- **After approval**: remove gsmtestuser from the TEST sheet; retake the
  four screenshots. (Website URLs done Nov 26, before resubmitting.)
- **Not verified**: the reviewer's path as gsmtestuser.

### 2026-11-23: Google's verification review answered

- **Found**: Google's email (Nov 23) asked for drive.file instead of
  `spreadsheets`, data protection in the privacy policy, a new video, and
  test credentials with steps.
- **Done**: v0.6.0 drive.file scope + Picker with setFileIds; v0.6.1
  setOrigin; v0.6.2 Picker moved to `addon/pick/` (top-level window).
  Privacy section, support/tester steps, decision 014. Console: Data Access
  now drive.file/email/profile/openid (Confirm dialog), Verification Center
  "Verification is not required". Pages build for 51d693e errored at
  GitHub; a manual rebuild deployed it.
- **Verified**: localhost, a drive.file-only token got 404 on TEST before
  the pick, 200 after, and a later token opened it with no pick. In Meet
  (call wgf-ogzq-rtg, chair ben.wilkoff@minerva.edu, v0.6.0): sign-in with
  no window, Start review, stage TEST-0008, vote, reveal, Record Waitlist;
  the sheet read back `Maybe` for TEST-0008 (drive.file write).
- **Found in Meet**: the Picker inside the panel (benwilkoff@gmail.com,
  call qzn-wkwb-pjb) opened at 150px and listed no file, with or without
  setOrigin; the gmail account cannot join minerva.edu calls ("You can't
  join this video call").
- **Verified in Meet, v0.6.2 (call tqo-tqeb-tye, 10:25-10:30)**: gmail
  (first time, never picked) pressed Choose the spreadsheet; the pick
  window listed the TEST sheet, Ben clicked it, the window closed itself and
  the panel opened the lobby. gmail started the review as chair (TEST-0009);
  minerva.edu asked to join, was admitted, joined the activity; its stage
  said "Sign in from the side panel" until One Tap + Open the review, then
  followed to TEST-0009 ("0 of 2", "Chair: Ben Wilkoff", no picker needed).
  Member voted Reject: chair stage "1 of 2" with name only (sealed). Chair
  Admit, Reveal: Admit 1 / Reject 1 with names on both. Record Reject: the
  sheet reads `No` for TEST-0009; member saw "Recorded: Reject".
- **Not verified**: the pick window's Cancel button in Meet (closing the
  window returned to Choose the spreadsheet on localhost); the in-panel
  refusal for an account without sheet access.
- **Test data left**: TEST-0008 `Maybe` and TEST-0009 `No` with notes, in
  the TEST sheet only.
- Reply to Google drafted in ben.wilkoff@minerva.edu (plain text, no
  links), not sent.

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
- **Two-person test, same call, verified in Meet (10:40)**: chair
  ben.wilkoff@minerva.edu + member benwilkoff@gmail.com (tester roles,
  test user, TEST sheet shared as viewer; see tools/meet-addon/TESTERS.md).
  The member pressed Meet's Join activity, One Tap signed the new panel in,
  Open the review finished with no window; the member's panel and stage
  followed the chair to TEST-0005 over the encrypted Supabase channel
  ("0 of 2 have voted", "Chair: Ben Wilkoff"); member voted Reject and the
  chair saw only "1 of 2" (sealed); chair voted Admit; Reveal showed
  Admit 1 / Reject 1 with names on both panels and both stages; Record
  Reject wrote `No` + note to TEST-0005, and the member saw "Recorded:
  Reject".
- **Found**: two accounts with the same Google name look identical on
  the vote chips (real committee names differ; noted, not fixed).
- **Not yet verified**: the in-panel no-access refusal
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
