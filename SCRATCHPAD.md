# Scratchpad

## Current state

- **Status (2026-11-20)**: v0.5.0 live at https://acr.humanshaped.org/.
  Verified in real Meet calls: sign-in in the sidebar, two-person sealed
  votes, reveal, record, notes, country flag, Intended Concentration.
  Not yet verified: note-taker handoff to a second person.
- **Verification (Nov 23)**: Google refused `spreadsheets` (minimum
  scope) and asked for data-protection wording, a new video, and test
  steps. v0.6.x asks only for drive.file + openid/email/profile with a
  one-time Picker window (decision 014); console Data Access changed and
  the Verification Center now says verification is not required. Privacy
  policy has "How sensitive data is protected". **Waiting on Ben**: send
  the Gmail draft (ben.wilkoff@minerva.edu, Google's thread; new video
  youtu.be/ruo5K9UMRr8, reviewer steps, why no One Tap). v0.8.1 verified in
  Meet (call kdv-pszn-pce): one button, one Google window, Picker opened by
  itself in the side panel, lobby; returning users no window. Listing scopes fixed
  and resubmitted Nov 23. ACR Helper grants removed from both Ben accounts
  for the video: each sees consent (and gmail the picker) next time.
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
