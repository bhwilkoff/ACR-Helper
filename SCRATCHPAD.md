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
- **Marketplace review (Nov 26)**: REJECTED: "allow all participants to
  collaborate even if permissions are not set in advance; permission
  adjustment during the session"; note "not showing the correct activity
  when joining an active one" (video photos.app.goo.gl/oHVyYmTWw5EDCUfE7,
  not viewable from the cloud container). v0.9.0 (decision 015): chair's
  **Add someone** shares the sheet in-call; joiner without access is told
  how; stage-ready resends the last view; lobby waits for the channel.
  Verified only in the mock harness. Next: Ben tests in a real call with an
  unshared second account, then republishes in the Marketplace SDK.
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

### 2026-11-26: Marketplace rejection (joining an active activity)

- **Found**: gwm-review rejected ACR Helper (guideline 1, permissions during
  a multi-player session; "not showing the correct activity when joining an
  active one"). Their video could not be fetched (photos.app.goo.gl blocked;
  no Remote Control folder on Ben's computer). In code: an unshared joiner got
  an empty Picker and a stage saying "Sign in", with no way in; a stage that
  loaded after its panel made the panel redraw into the lobby (or throw
  before sign-in); the lobby showed after 2.5 s even if the channel had not
  joined.
- **Done (v0.9.0)**: Add someone (Drive permissions.create, chair's token);
  joiner copy and Check again / Use another account; stage `pick`/`joining`
  views; stage-ready resends the last view; lobby waits for the channel.
  Privacy, support, testers pages; decision 015.
- **Verified**: mock harness (Playwright): chair adds an email, status shows;
  a member panel reloaded after Start review shows the applicant at 0.8 s,
  not the lobby; tests, US English, secrets checks pass.
- **Not verified**: anything in a real Meet call; Drive sharing with a real
  drive.file token.

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
