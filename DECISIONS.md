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
