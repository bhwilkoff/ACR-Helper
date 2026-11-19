# ACR Helper: Requirements

Version 1, November 19, 2026. Written from Ben's request and his answers
to eight multiple-choice questions the same day (quoted in
DECISIONS.md 003-010). Items marked **OPEN** are Ben's to answer and are
never filled in by an agent.

## 1. Purpose

The Admissions Review Committee (ACR) meets in Google Meet and decides,
one applicant at a time, whether to recommend **Admit**, **Waitlist**, or
**Reject**. ACR Helper is a Meet add-on that:

- puts **one applicant** on the main stage for everyone in the call,
- shows that applicant's row from the committee spreadsheet and links
  straight to the three admin pages a member needs,
- lets every member **vote privately**, hidden until the chair reveals,
- lets the chair **record the committee's decision** in the sheet and
  move everyone to the next applicant.

People decide; the add-on gathers. It never ranks, scores, summarizes,
or suggests a decision.

## 2. Sources

| Source | What it is | How the add-on uses it |
|---|---|---|
| Spreadsheet `1uiUPxkNHcAAfTWS-9y6XSbbxnpQWyJv3ZCO3Ew7vc6I`, "Fall 2027 - Admissions Data Top Applicants" | Tabs: **Early Action** (44 columns, 2 frozen header rows, column A frozen), **Scores**, **Metabase Data** | Read live in each person's browser with their own Google token. Column A = Minerva ID (e.g. `2026-KDOX-4805`). Column B = applicant number (e.g. `508301`). |
| Applicant overview | `https://www.minerva.edu/admin/application/applicantoverview/?q={A}&evaluation_ready_on=All&matriculation_date=All` | Link only |
| Fast review | `https://www.minerva.edu/admin/applicants/{B}?pks={B}` | Link only |
| Integrity check (recorded responses) | `https://www.minerva.edu/admin/integrity_check/?unique_id={A}` | Link only |

The add-on **never fetches, frames, or scrapes** minerva.edu admin pages.
They need each member's own admin login, and copying them would move
applicant data somewhere new. The links open in a new browser tab.

## 3. Roles

- **Chair**: the person who presses **Start review** in their panel.
  Only the chair moves to another applicant, reveals votes, and records
  the decision. Needs **edit** access to the sheet.
- **Member**: anyone in the call who joins the activity and whose own
  Google account can open the sheet. Votes. Needs **view** access
  (edit is not required to vote).
- **No access**: anyone in the call whose account cannot open the sheet.
  Sees one line: "This review's spreadsheet isn't shared with you." Sees
  no applicant, no vote, no count. Their browser receives nothing it
  can read (section 7).

## 4. Functional requirements

### 4.1 Sign-in and access gate

- R1. The panel's first view has one button, **Sign in with Google**.
  Sign-in runs in a popup on the add-on's origin (Meet's frames get no
  cookies or storage) and returns an access token to the panel.
- R2. Scopes: `spreadsheets` (the chair writes the decision),
  `openid email profile` (names on "who has voted"). Nothing else.
- R3. On every load the panel calls `spreadsheets.get` with the person's
  token. 200 = continue. 403/404 = the no-access line. Nothing records
  "allowed"; tokens live in memory only and are refreshed before expiry.
- R4. The stage has no sign-in of its own. It shows only what that
  person's own panel sends it.

### 4.2 The applicant on the main stage

- R5. The stage shows exactly one applicant: the Minerva ID, the
  applicant's position ("12 of 48"), and these columns, in the sheet's
  own names and values, untouched (Ben, November 19, 2026):
  - **Profile**: First Name, Last Name, Has a Minerva Family Member,
    Citizenship Country.
  - **Scores**: Math Score, Understanding Score, Reasoning Score,
    Creativity Score, Average on first 4 challenges, Original Transcript
    Score, Four Point Transcript Score, Written Score, Expression Score,
    Accomplishment 1-3, Average Accomplishment score, Overall Score.
  - **Financial aid**: FA App Status, Estimated FA Tier, FA Status, EFC,
    FA Tier, Scholarship/Grant, Loan, WS.
  - **Notes**: Notes from Admissions, Notes from Enrollment team, Notes
    from Financial Aid.
- R5a. Columns are found **by header name, not letter**, so a tab with
  columns in another order (Regular Decision) still works. A listed
  header the tab lacks is skipped and named once in `?diag=1`.
- R6. Three link buttons, always in the same order and place:
  **Applicant overview**, **Fast review**, **Integrity check**. Each is
  built from column A or B with `encodeURIComponent`, and only after the
  value matches its expected shape (A: `^\d{4}-[A-Z]{4}-\d{4}$`,
  B: `^\d+$`). A value that does not match shows "Column A doesn't look
  like a Minerva ID" in place of the link, never a broken URL.
- R7. Links open with `target="_blank" rel="noopener noreferrer"` and
  `referrerpolicy="no-referrer"`.
- R8. **Only fields with a value show** (Ben: "only show fields that are
  not NULL"). A cell that is empty, whitespace, or the text `NULL` is
  left out entirely, label and all. A group with nothing left is left
  out. Nothing is ever shown as "N/A" or guessed.
- R9. The stage fits Meet's stage at 560x315, 805x455, and 1280x720
  without scrolling sideways (measured fit-to-stage step,
  `google-meet-addon` skill, "Fitting content").
- R10. Each member's panel also shows the applicant compactly and holds
  their vote buttons, so a member can vote with the main stage hidden.

### 4.3 One applicant for the whole call

- R11. When the chair moves to an applicant, every member's panel and
  stage follow within two seconds.
- R12. The chair moves by **Next**, **Previous**, or **Go to row**.
  Default next = the next row with an empty decision cell. Rows are in
  the tab's own order.
- R12a. **The chair picks the tab** when starting a review (Ben: "We are
  in Early Action now, but the next cycle will be Regular Decision, so
  we need to be able to manually switch which sheet is the one being
  processed for a given meeting"). The picker lists the spreadsheet's
  tabs whose header row has a "Unique ID" column; members follow the
  chair's tab.
- R13. A member who joins late, or reloads, catches up: their panel asks
  "where are we?" and the chair's panel answers.
- R14. If the chair leaves, the current applicant can be recovered from
  the sheet (first undecided row). Votes in progress are lost and
  members vote again. This follows Ben's "nothing saved" choice.

### 4.4 Voting

- R15. Choices: **Admit**, **Waitlist**, **Reject**, **Discuss**.
  "Discuss" means "I need to talk this through before I can vote".
- R16. A member may change their vote until the chair reveals.
- R17. Before reveal, everyone sees **who has voted** (names, no choice)
  and "4 of 6 have voted". No one, including the chair, can see any
  choice before reveal (section 7, sealed votes).
- R18. The chair presses **Reveal**; every stage shows each member's
  name with their vote and the count per choice. No percentages, no
  "majority says", no highlighted winner.
- R19. The chair can **Vote again** (clears all votes for this
  applicant) after discussion.
- R20. Votes are **never stored**: not in the sheet, not in a database,
  not in browser storage, not in a log. They exist only in the memory
  of the panels in the call and vanish when the applicant changes.

### 4.5 Recording the decision

- R21. After reveal, the chair picks the committee's decision (Admit /
  Waitlist / Reject) and presses **Record**. The add-on writes into the
  column **"App Review Committee recommends admit?"** the sheet's own
  words (Ben: "The current Committee Recommendation options are Yes, No,
  and Maybe ... that is the field and the options that need to be
  written"):

  | Committee decision | Written to the cell |
  |---|---|
  | Admit | `Yes` |
  | Waitlist | `Maybe` |
  | Reject | `No` |

  The panel and stage say Admit / Waitlist / Reject; the sheet keeps
  Yes / Maybe / No. A cell holding anything else reads as "not decided
  by ACR Helper" and is shown to the chair as-is.
- R22. Before writing, the add-on re-reads the cell. If it is no longer
  what the panel last saw (someone edited the sheet), it shows the
  current value and asks the chair to confirm, never overwrites silently.
- R23. A recorded decision shows on the stage ("Recorded: Waitlist")
  and the chair moves on. Changing a recorded decision is the same
  Record action, which shows the old value first.
- R24. The decision cell also gets a **cell note**: "Recorded by <chair's
  Google name>, <Mon D YYYY> in ACR Helper". No vote information goes in
  the note (Ben chose "Word + chair + date in a cell note").

### 4.6 States (every view)

- R25. Each view defines loading, empty (no rows / all decided), error
  ("Something went wrong: <message>"), offline, and no access.
- R26. `?diag=1` shows diagnostics on the panel and stage (token expiry,
  channel state, last message time). Never applicant data.

## 5. Privacy and confidentiality requirements

These are hard requirements; a build that breaks one does not ship.

- P1. **Applicant data never leaves Google except to the person reading
  it.** It is read from the Sheets API into the browser's memory and
  drawn on screen. No copy in localStorage, IndexedDB, cookies, the URL,
  `startActivity` data, logs, analytics, or any third party.
- P2. **No analytics, no trackers, no fonts or scripts** from anywhere
  but Google's own sign-in and Meet SDKs and the pinned realtime client
  (P5). A Content-Security-Policy lists exactly those origins.
- P3. **No `console.log` of row contents**, tokens, or votes.
- P4. **The realtime channel carries only ciphertext.** Each message
  (current row number, "has voted", sealed vote, reveal, decided) is
  encrypted with AES-GCM in the browser before it leaves. The realtime
  service sees opaque bytes and a random channel name.
- P5. **The group key lives in the sheet.** A hidden tab `_acr` holds a
  random 256-bit key, created by the first chair (who has edit access).
  Only people who can open the sheet can read the key, so the sheet's
  own sharing also decides who can read the channel. Removing someone
  from the sheet locks them out of the next session; the chair can
  **Rotate key** to lock them out of the current one.
- P6. **Sealed votes.** Each session the chair's panel makes a one-time
  key pair and announces the public key. A member's vote is encrypted
  to that public key (ECDH P-256 + AES-GCM) inside the group envelope,
  so other members cannot read it. On Reveal the chair's panel opens
  the votes and sends them to all. The chair's own screen does not show
  choices before Reveal. A modified chair client could peek. The
  committee trusts its chair; the add-on stops casual and accidental
  peeking, not a determined chair.
- P7. **Channel name** = SHA-256 of (group key, meeting code). Not
  guessable from the public code. A new channel each meeting.
- P8. The code is public (GitHub Pages) and holds **no data and no
  secrets**: the sheet ID, Cloud project number, OAuth client ID, and
  realtime publishable key are not secrets.
- P9. **Test with fake applicants only**: a test copy of the sheet with
  the same columns and made-up rows, labeled TEST. Never real rows in a
  test call.
- P10. The stage shows applicant data inside Meet. Members should not
  record ACR calls; the add-on shows no warning (only essential words),
  but the README for the committee says so.
- P12. **No screen-share fallback.** The deployment sets
  `supportsScreenSharing: false`. With it on, Meet offered to share the
  chair's tab "so those without the add-on can follow along", which would
  show applicants to people the sheet does not admit (measured in Meet,
  November 19, 2026).
- P11. Nothing is cached after the call. Closing the panel drops tokens,
  rows, keys, and votes.

## 6. Non-functional

- Static pages on GitHub Pages (public repo), vanilla JS, no build step.
- All network calls through `assets/api.js`.
- Every script and stylesheet versioned with `?v=` and bumped on change
  (Meet caches 10 minutes).
- The panel wears Meet's colors, type, and shapes, light and dark;
  320x500 design size; one filled button per view.
- External consent screen (Ben: "Any Google account with sheet
  access"). Until Google verifies the `spreadsheets` scope, only the
  test users listed on the consent screen (up to 100) can sign in, and
  they see an "unverified app" warning.

## 7. Architecture summary

```
Each person's browser (inside Meet)
  panel  --own token-->  Sheets API (rows, _acr key, decision write)
  panel  --notifyMainStage-->  own stage (draws applicant, votes)
  panel  <--AES-GCM ciphertext-->  Supabase Realtime broadcast  <-->  other panels
```

Nothing else. No server of our own, no database.

## 8. Milestones

| | Milestone | Verified by |
|---|---|---|
| M0 | Ben's setup (section 9) | Ben sends project number, client ID, Supabase URL and key |
| M1 | Panel + stage shells, Meet SDK, config, `api.js`, offline stage harness, mock mode with fake applicants | Screenshots at three stage sizes (agent) |
| M2 | Sign-in popup, access gate | Real call: one profile with access, one without (Ben) |
| M3 | Applicant on stage + links, chair navigation (single person) | Real call (Ben) |
| M4 | Encrypted realtime: whole call follows the chair, late join | Real call, two profiles (Ben) |
| M5 | Sealed voting, reveal, vote again, record decision | Real call on the test copy (Ben) |
| M6 | States, diagnostics, fit, polish; committee README | Real committee dry run on test copy |

The agent builds and checks everything it can see offline (unit tests
for link building, crypto round trips, fit screenshots). Anything
crossing panel and stage or reaching a second person is "built, not
verified" until Ben sees it work in a real call.

## 9. Setup steps (M0; done November 19, 2026 except Install, see SCRATCHPAD.md)

1. Google Cloud project; enable Google Workspace Marketplace SDK, Google
   Workspace add-ons API, Google Sheets API. Send the **project number**.
2. OAuth consent screen, **External**, with the committee's accounts as
   test users. Scopes: `spreadsheets`, `openid`, `email`, `profile`.
3. OAuth client (Web application), authorized JavaScript origin
   `https://bhwilkoff.github.io`. Send the **client ID**.
4. Turn on GitHub Pages for this repository (public).
5. A Supabase project for the realtime channel (free tier). Send the
   **project URL** and **publishable (anon) key**. No tables are used.
6. Add the HTTP deployment JSON (`tools/meet-addon/deployment.json`,
   written in M1) in the Marketplace SDK and press **Install**.
7. **Test copy**: made November 19, 2026 in Ben's minerva.edu Drive,
   "TEST - ACR Helper fake applicants (no real data)",
   `1ZCsMmoUErQurrT7SQX5yz5F_fHDAm2DiJxM-eMTcnso`: the real 42 headers,
   12 invented applicants (IDs `2026-TEST-0001`...), some blank and
   `NULL` cells. Share it with the test accounts. Its tab still needs
   renaming to "Early Action" plus a second "Regular Decision" tab to
   test the picker.
8. minerva.edu admin console: allow third-party Meet add-ons, if Meet
   does not already list add-ons under Activities.

## 10. Open questions (Ben's)

Answered November 19, 2026: column names (Ben pasted the header),
stage columns (R5), decision column and words (R21), cell note (R24),
tab choice and order (R12, R12a).

- O7, answered: the Fast review and Integrity check links built from
  the sheet (R6) appear on both the main stage and the side panel; the
  "Video Recordings" and "Fast Review Page" columns are not shown.
