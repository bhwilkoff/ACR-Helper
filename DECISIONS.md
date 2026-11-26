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

---

## 011: Sign in with one press from the sidebar; keep no Google refresh tokens (2026-11-19)

The sidebar's Sign in button starts Google's token client directly. Google's
window appears the first time a person allows ACR Helper, and after that
opens and closes on its own. The access token lives only in the panel's
memory. No server keeps any Google token.

**Why:** Ben, testing in Meet: "I'd much prefer for everything to be done
inside of the sidebar rather than opening new tabs/windows." Google issues
permission to read and write a person's sheet only through its own window
(its pages cannot be framed) or through a server holding a refresh token.
Ben chose the window over a stored credential that could open members'
spreadsheets, the same rule Human Shaped keeps ("keep no Google refresh
tokens"). Human Shaped's in-sidebar button only proves identity, which is
not enough here.

**How to apply:** never add an intermediate tab or page before Google's
window; the sign-in tab (`addon/signin/`) is only a fallback when Google's
window is refused. A refusal from Sheets says why (scope, API, or not
shared) and only a plain permission refusal shows "not shared".

---

## 012: A public Marketplace listing, by Ben Wilkoff (2026-11-19)

ACR Helper will be listed publicly on the Google Workspace Marketplace,
with Ben Wilkoff as the individual developer, benwilkoff@gmail.com for
support, and its pages on bhwilkoff.github.io.

**Why:** Ben chose "Public listing" over a minerva.edu-only private one,
keeping decision 007 (any Google account the sheet is shared with). An
HTTP deployment's Install reaches only the developer's own account;
everyone else saw "The activity is not available to you."

**How to apply:** `tools/meet-addon/LISTING.md` is the checklist. The
listing never uses Minerva's name or logo. The Sheets scope is sensitive,
so verification needs a demo video recorded on the TEST sheet only.
Visibility cannot be changed once App Configuration is saved; Ben presses
that Save and every Publish.

---

## 013: The add-on lives at acr.humanshaped.org (2026-11-20)

The add-on, its home, privacy, terms, and support pages are served from
https://acr.humanshaped.org/ (GitHub Pages custom domain), not from
bhwilkoff.github.io.

**Why:** Google's branding check rejected the github.io home page twice
("not registered to you") although Search Console showed
ben.wilkoff@minerva.edu as verified owner; a shared host suffix does not
pass. Ben owns humanshaped.org and chose it; it keeps Minerva's name out of
the product (decision 012).

**How to apply:** the domain's Search Console Domain property is verified
by a TXT record at WordPress.com DNS for ben.wilkoff@minerva.edu (the
project owner); never delete it. Any new URL goes on acr.humanshaped.org,
in `tools/meet-addon/deployment.json`, the OAuth client origins, Branding,
and the store listing together.

## 014: drive.file and a one-time Google Picker, not the spreadsheets scope (2026-11-23)

ACR Helper asks only for `drive.file`, `openid`, `email`, `profile`. Each
person chooses the committee's sheet once in Google's Picker, pre-pointed at
it with `setFileIds`; after that the token opens that sheet and nothing else.

**Why:** Google's verification review (Nov 23) refused `spreadsheets` under
the minimum-scope rule and named drive.file + Picker as the fix; UI
preference is not an accepted exception. drive.file is non-sensitive, so no
video, CASA, or yearly review. Measured Nov 23: a drive.file-only token got
404 on the TEST sheet before the pick and 200 after (hidden `_acr` tab too),
the grant survived a new token, and the Picker ran without an API key.

**How to apply:** an unpicked sheet and an unshared sheet both read as 404,
so the first 404 shows "Choose the spreadsheet"; only a 404 after a pick
means "not shared". The Picker lists the sheet only if it is shared with the
person, so the sheet's sharing is still the access list. Request tokens with
`include_granted_scopes: false` so an old `spreadsheets` grant never hides a
missing drive.file grant. Never add a broader Drive or Sheets scope back.
The Picker opens by itself inside the sidebar right after sign-in (v0.8.0,
measured in Meet Nov 23). It had shown blank there only because the panel's
CSP blocked its inline styles. A new person sees one button and one Google
window (account and permission together). One Tap is off for everyone
(v0.8.1): for a new person it adds Google's own "Confirm you want to sign in"
window (measured, with and without FedCM), and a returning person's button
press already finishes with no visible window. Google's Meet guide only
"strongly recommends" One Tap; if the Marketplace review insists, call
oneTap() from viewSignIn again. Ben: "fewest clicks and fewest pop-ups".

## 015: The chair adds people to the sheet during the call, from the side panel (2026-11-26)

The chair's panel has **Add someone**: an email and "Can vote" (reader) or
"Can vote and edit the sheet" (writer). ACR Helper calls Drive's
`permissions.create` on the review sheet with the chair's own token. A joiner
the sheet is not shared with is told which account they are signed in as and
that the chair can add them now, with **Choose the spreadsheet** / **Check
again** to continue once added.

**Why:** Google's Marketplace review rejected v0.8.1 on Nov 26 under "If
multi-player experience, add-on MUST allow for all participants to
collaborate on content even if permissions are not set in advance.
Permission adjustment MUST be available during the collaborative add-on
session", noting "Add-on not showing the correct activity when joining an
active one." A joiner without access saw an empty Picker and a stage saying
only "Sign in", with no way forward inside the call. The sheet's sharing
stays the access list (AGENTS.md fact 1); the chair, a person, decides who
is added.

**How to apply:** drive.file covers sharing because the chair picked the
sheet; a chair without share rights gets 403 ("Ask its owner"). The typed
email goes only to Google, never to the realtime channel. The panel resends
its last stage view when a late stage says `stage-ready` (redrawing there
had jumped to the lobby), and the lobby waits until the channel has joined
plus 4 seconds, so a joiner is not told "No review is running" while one is.
