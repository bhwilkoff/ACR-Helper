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
  policy has "How sensitive data is protected". **Reply sent by Ben** 2026-11-23 12:34 MST (he edited the formatting);
  waiting on Google. Was: the Gmail draft (ben.wilkoff@minerva.edu, Google's thread; new video
  youtu.be/ruo5K9UMRr8, reviewer steps, why no One Tap). v0.8.1 verified in
  Meet (call kdv-pszn-pce): one button, one Google window, Picker opened by
  itself in the side panel, lobby; returning users no window. Listing scopes fixed
  and resubmitted Nov 23. ACR Helper grants removed from both Ben accounts
  for the video: each sees consent (and gmail the picker) next time.
- **Marketplace (Nov 26)**: rejected (permission adjustment during the
  session); v0.9.1 fixes it, verified in Meet; reply drafted, unsent;
  republish pending (Ben).
- **Marketplace review (Nov 24)**: started. TEST sheet shared with
  gsmtestuser@marketplacetest.net (Editor); reply drafted in
  ben@learningischange.com, waiting on Ben to send.
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

### 2026-11-26: Marketplace rejection; access during the review (v0.9.0)

- **Found**: gwm-review@google.com, Nov 26 (benwilkoff@gmail.com, read in
  ben@learningischange.com): rejected for "permission adjustment MUST be
  available during the collaborative add-on session". Their screenshots:
  "GSM team test admin" (TEST sheet not shared) joined gsmtestuser's review;
  panel stuck on "Choose the spreadsheet", stage "Sign in from the side panel".
- **Done**: v0.9.0. Ask the chair for access (panel), Share / Not now (chair),
  door channel (acr-door.js, encrypted), Drive permissions.create view only
  after a permissions list check; stage messages for pick/asked/noaccess;
  privacy, support, testers, TESTERS.md; decision 015; harness ?noaccess=N.
- **Verified locally**: `node --test` (door tests included); harness: guest
  asks, chair sees it (member does not), Share, guest follows to the applicant
  ("0 of 3 have voted"), in the lobby and during a review.
- **Pushed** v0.9.0 (42bc13b), v0.9.1 (9c0bf1e, Use another account).
- **Verified in Meet (call oam-kkwm-iic)**: gmail, off the sheet, joined the
  running activity; picker "No spreadsheets"; Cancel showed Ask the chair; the
  ask reached the chair panel over Supabase; stage "Ben Wilkoff is running a
  review. Waiting for access". Share first failed: Drive API was disabled in
  acr-helper; **enabled it** (console, read back "Disable API").
- **Found**: the minerva Chrome profile holds minerva, learningischange and
  gmail sessions; its panel had signed in as gmail, so the "chair" was gmail
  and Share then 404'd (gmail had just been removed). A fresh minerva token
  on localhost read the file and its permissions (200, canShare true).
- **Verified in Meet, v0.9.1 (call zcz-mnxg-sxn, 14:48-14:53)**: chair panel
  landed on gmail; Use another account + Ben's pick in Google's chooser made
  it minerva. Review TEST-0012; gmail (off the sheet) asked; chair Share
  showed "Shared with Ben Wilkoff (view only)"; sheet read back gmail
  `reader`; gmail's picker opened by itself listing TEST; Select; gmail panel
  and stage on Test-Lin, "0 of 2 have voted", Chair: Ben Wilkoff.
- **Restored**: benwilkoff@gmail.com back to Editor (read back `writer`).
  Calls hung up, tabs closed, local server stopped.
- **Drafted, not sent**: reply to gwm-review in ben@learningischange.com,
  Google's thread, no links. Ben reads and sends; Ben republishes in the
  Marketplace SDK.
- **Not verified**: the Not now path in Meet; Share refused by domain limits.

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
- **After approval**: remove gsmtestuser from the TEST sheet.
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
