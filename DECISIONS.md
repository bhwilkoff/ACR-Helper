# Decisions

Each decision leads with the rule, then **Why:**, then **How to apply:**.
Newest at the bottom. Keep this file context-sized.

---

## 001: A Meet add-on on the web, and nothing native (2026-11-19)

ACR Helper is a Google Meet add-on: static web pages Meet frames as a
side panel and a main stage. This repository builds no native apps.

**Why:** Ben, November 19, 2026: "we are not planning to build out any
native apps in this new repository." Meet add-ons run only in a
computer's browser, so a native app would not reach the people in the
call anyway.

**How to apply:** Platform skills and docs for iOS, macOS, tvOS,
Android, Windows, and TV were left out on purpose. Do not add them back,
and do not add a PARITY.md. If a second surface is ever wanted (a
standalone page outside Meet, say), it is a new decision here first.

---

## 002: The spreadsheet's sharing is the access list (2026-11-19, proposed)

Only people whose own Google account can open the spreadsheet can use
ACR Helper. The add-on checks with the person's own token every time it
opens and keeps no list of its own.

**Why:** Ben, November 19, 2026: the add-on "works only for those with
the proper access to a particular spreadsheet." A second list would
drift from the sheet's sharing, and someone removed from the sheet would
keep seeing its rows.

**How to apply:** `docs/MEET-ADDON.md`, "Who gets in". Proposed, not
yet confirmed by Ben in those words; confirm before building the gate.

---

## 003: Votes are hidden until the chair reveals them (2026-11-19)

Members see who has voted, never what, until the chair presses Reveal.

**Why:** Ben chose "Hidden until revealed" over live or auto-reveal.
Seeing early votes pulls later voters toward them; each member's own
judgment should reach the room first.

**How to apply:** REQUIREMENTS.md R17-R18 and P6 (sealed votes). No
partial tally, no "leaning" hint, no highlighted winner after reveal.

---

## 004: Votes are never stored; only the decision is written (2026-11-19)

Votes live only in the memory of the panels in the call. The chair
writes the committee's decision into the applicant's row.

**Why:** Ben chose "Decision only, no vote record" for a confidential
process: a record of individual votes is a record that can leak or be
requested.

**How to apply:** R20. No votes in the sheet, a database, browser
storage, or logs. Whether the chair's name sits beside the decision is
open (REQUIREMENTS O4).

---

## 005: The chair alone moves the call (2026-11-19)

Whoever starts the review is chair; only the chair navigates, reveals,
and records. Everyone's panel and stage follow.

**Why:** Ben chose "The chair only" over any-member or automatic.

**How to apply:** R11-R14.

---

## 006: Votes travel by an encrypted realtime channel (2026-11-19)

Supabase Realtime broadcast carries the current row number and votes
between panels, encrypted in the browser with a key kept in a hidden
`_acr` tab of the sheet. Supabase sees only ciphertext.

**Why:** Ben chose "Realtime channel, nothing saved" over a scratch tab
in the sheet. Encryption with a key only sheet readers can open keeps
AGENTS.md's rule that spreadsheet contents never leave Google readable,
and keeps the sheet's sharing as the gate for the channel too.

**How to apply:** REQUIREMENTS.md P4-P7. Never send plaintext on the
channel, not even the row number.

---

## 007: Any Google account with sheet access; External consent (2026-11-19)

**Why:** Ben chose "Any Google account with sheet access" over
minerva.edu only.

**How to apply:** External consent screen; committee members are test
users until Google verifies the `spreadsheets` scope.

---

## 008: GitHub Pages from this public repository (2026-11-19)

**Why:** Ben chose the free public route. The code holds no data and no
secrets.

**How to apply:** Never commit sheet data, fixtures from real rows, or
keys. Mock data is made up and labeled TEST.

---

## 009: Admit / Waitlist / Reject / Discuss (2026-11-19)

**Why:** Ben's choice. "Discuss" lets a member say they need the
conversation before they can vote, without a forced choice.

**How to apply:** Votes take four values; a recorded decision takes
only the three outcomes.

---

## 010: Build and test with a fake copy of the sheet (2026-11-19)

**Why:** Ben chose "Make a fake test copy": same columns, made-up
applicants, so no real applicant is ever on screen in a test.

**How to apply:** Mock mode (`?mock=1`) and the test copy use invented
rows labeled TEST. Blocked on the column names (REQUIREMENTS O1).
