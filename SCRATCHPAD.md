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
- **Marketplace (Nov 27)**: rejected again 10:21 MST ("Spreadsheet is not
  accessible to create a votation"; gsmtestuser's picker said "No
  spreadsheets"). Root cause: the account hint lived in localStorage, shared
  by every Meet tab in a Chrome profile, so the reviewer's second account
  took the first account's token. v0.9.2 (2c9e147) keeps it per tab, names
  the account on the pick screen; review TEST sheet is now a gmail-owned
  copy (1vQemIaw...; gsmtestuser and minerva Editors). Verified in Meet.
  Ben sent the reply. Full reviewer path verified on the copy (call
  hqo-ioqw-eos); listing resubmitted Nov 27 ~13:45 MST ("Review submitted",
  "The draft is in review and can't be edited").
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

### 2026-11-27: Third rejection; root cause found (v0.9.2)

- **Found**: Nov 27 rejection (gwm-review, 10:21 MST): Functionality,
  "Spreadsheet is not accessible to create a votation"; the recording shows
  GSM Test User's panel picker with "No spreadsheets" (gsmtestuser is an
  Editor). The earlier session (fff10d04) had been filming a new video; its
  stray "Transfer ownership" press changed nothing (owner read back).
- **Root cause**: `acr-hint` in localStorage is shared by all Meet tabs in a
  Chrome profile; with both test accounts in one browser, the second panel
  got the first account's token silently. Same bug as Nov 26 (minerva panel
  landed on gmail), which was only patched with Use another account.
- **Done**: v0.9.2 (2c9e147): hint in sessionStorage; pick screen says
  "Signed in as ..." with Use another account; picker setTitle (Google's
  drive.file picker ignores it). TEST copy owned by benwilkoff@gmail.com
  (Ben: "Copy to gmail"), shared with gsmtestuser and minerva (writer, read
  back); config points at it. Support and tester steps updated.
- **Verified in Meet (call yyp-xkso-oah, 13:04-13:09)**: one Chrome profile
  (minerva), tab A as gmail, tab B as minerva. Each got Google's account
  chooser; A reached the lobby on the copy; B's panel said "isn't shared with
  ben.wilkoff@minerva.edu" after Cancel, i.e. its own account.
- **Verified in Meet (call hqo-ioqw-eos, 13:36-13:40)**: minerva taken off
  the copy; gmail chair started the review; minerva's picker "No
  spreadsheets", Cancel, Ask the chair; chair saw the request, Share, "Shared
  with Ben Wilkoff (view only)" (Drive read back `reader`); minerva's picker
  opened by itself listing the copy; Select; "0 of 2 have voted", Chair: Ben
  Wilkoff. minerva restored to writer (read back). Meet's start-activity
  confirm was cancelled once by a tab switch; "Open the main stage" fixed it.
- **Not verified**: an Editor (not owner) pressing Share on the copy:
  learningischange cannot install the unpublished add-on (not a draft
  tester), so there was no second asker.
- **Filming**: stopped; the Mac froze (load 58 with three other sessions).
  Clips so far are on the old sheet. samantha and cintia are not on the copy.
- **Video (v0.9.2)**: filmed in call cfw-vrff-usu (gmail chair, minerva
  off the copy and disconnected from ACR Helper first, restored to Editor
  after); built with build2.sh, 3:43, ~/Movies/acr-helper-marketplace-review-v0.9.2.mp4.
  Uploaded Unlisted: youtu.be/ZT2Bog2CBc8 (read back signed out); not sent
  to Google; ready if the reviewers ask. TEST-0012 on the copy now `Maybe`
  with a TEST note.
- **Reply** sent by Ben. **Resubmitted** ~13:45 MST (Ben: "Test, then resubmit"); read back "in review".

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
- **Reply**: drafted in ben@learningischange.com (Google's thread, no links);
  Ben read and sent it. **Resubmitted** the store listing (Ben: "Go ahead and
  do the republish"); read back "The draft is in review and can't be edited".
- **Not verified**: the Not now path in Meet; Share refused by domain limits.
