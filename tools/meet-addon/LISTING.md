# Listing ACR Helper publicly

*Written by Claude, November 19, 2026, from Human Shaped's approved listing
(humanshaped-site/tools/meet-addon/LISTING.md) and Ben's answers the same
day. Awaiting Ben's review.*

Ben chose a public Marketplace listing so committee members on any Google
account can add ACR Helper (DECISIONS.md 012). Access is still decided by
the spreadsheet's sharing; a listing only lets people install it.

## Ben's answers (November 19, 2026)

- Developer: **Ben Wilkoff**, individual. Non-trader.
- Support and developer email: **benwilkoff@gmail.com**.
- Pages and authorized domain: **bhwilkoff.github.io** (home page
  https://bhwilkoff.github.io/ACR-Helper/).

## What is harder than Human Shaped

Human Shaped asked only for name and email, so Google did a light brand
check. ACR Helper asks for `https://www.googleapis.com/auth/spreadsheets`,
a **sensitive** scope, so the consent screen needs full verification:
a scope justification, a demo video showing the scope in use from sign-in
to writing a cell, and a privacy policy that says what is done with sheet
data. Review usually takes several days, longer if Google asks for changes.

## Checklist

| # | Step | Who | State |
|---|---|---|---|
| 1 | Home, privacy, terms, support pages on bhwilkoff.github.io | agent drafts, Ben approves the words | approved by Ben Nov 19 |
| 2 | One Tap prompt in the panel when not signed in (Meet review rule) | agent | done, verified in Meet Nov 19 |
| 3 | Works with third-party cookies blocked (Meet review rule) | agent tests in Chrome | to test |
| 4 | Verify bhwilkoff.github.io in Search Console (HTML file in the bhwilkoff.github.io repo, `tweet-archive-app/public/`) | agent | done Nov 19, verified as ben.wilkoff@minerva.edu |
| 5 | Consent screen Branding: home, privacy, terms, authorized domain (logo left off: optional, adds review) | agent in the console | done, read back |
| 6 | Data Access: declare the Sheets, email, profile, openid scopes | agent | done; justification goes in the verification form |
| 7 | Demo video of the scope in use (TEST sheet only) | agent records; Ben does the Google consent clicks | to do |
| 8 | Icons 32/48/96/128 (transparent corners), banner 220x140, screenshots 1280x800 with TEST data | agent | done: tools/meet-addon/listing/ |
| 9 | App Configuration: Public (permanent), Individual + Admin install, deployment `acr-helper`, scopes, developer info | agent filled; Ben pressed Save Draft Nov 19 | done |
| 10 | Store listing: name, descriptions, Teacher and Admin Tools, icons, banner, 4 screenshots, links, Free, all regions, draft testers | agent | draft saved and read back Nov 19 |
| 11 | Publish app (consent screen to In production) and submit verification | Ben presses | to do |
| 12 | Publish the store listing | Ben presses | to do |

Every Google product name in the listing carries ™ (Google Meet™, Google
Sheets™) with "is a trademark of Google LLC" (Human Shaped was rejected
once for this). Minerva's name and logo stay out of the listing.

## The words (from the pages Ben approved, November 19, 2026)

**Application name:** ACR Helper

**Short description** (under 200 characters):

> Review one applicant at a time in Google Meet™: see their row from your committee's Google Sheets™ spreadsheet, vote privately, reveal together, and record the decision.

**Detailed description:**

> ACR Helper is a Google Meet™ add-on for an admissions review committee that decides on one applicant at a time, together, from a shared Google Sheets™ spreadsheet.
>
> What it does:
> • Shows one applicant from the committee's spreadsheet on Meet's main stage for everyone in the call, with links to the pages a reviewer needs.
> • Lets each member vote privately. Votes stay hidden until the chair reveals them, so each person's own judgment reaches the room first.
> • Writes the committee's decision into the applicant's row, with a note naming who recorded it and when.
>
> Who can use it: only people whose own Google account can open the committee's spreadsheet. ACR Helper checks this with Google every time it opens and keeps no list of its own.
>
> What it never does: it never copies the spreadsheet anywhere, never stores votes, and never ranks, scores, or recommends a decision. People decide.
>
> Google Meet and Google Sheets are trademarks of Google LLC.

**Category:** Productivity (no admissions category; "Teacher and Admin Tools" is also possible).

**Links:** terms https://bhwilkoff.github.io/ACR-Helper/terms/ · privacy https://bhwilkoff.github.io/ACR-Helper/privacy/ · support https://bhwilkoff.github.io/ACR-Helper/support/

**Scope justification** (verification form, for `spreadsheets`):

> ACR Helper reads the rows of one spreadsheet the user's committee chooses, so each member sees the applicant under review in Google Meet; it keeps a hidden tab in that spreadsheet holding the key that encrypts messages between members' add-ons; and the chair writes the committee's decision and a note into the applicant's row. The narrower drive.file scope cannot open a spreadsheet the user did not create or pick, and spreadsheets.readonly cannot write the decision. ACR Helper opens no other spreadsheet and sends no spreadsheet data to any server.

## Demo video (Ben records, about two minutes, TEST sheet only)

Google asks for a video showing the OAuth consent screen and each scope in use. Record the whole screen (Shift-Command-5 on a Mac), with the browser's address bar visible, in English, then upload to YouTube as Unlisted and paste the link in the verification form.

1. Show https://bhwilkoff.github.io/ACR-Helper/ and its Privacy link (2 seconds each).
2. In a Meet call: Activities > Add-ons > ACR Helper. Press Sign in with Google.
3. Google's window: show the app name "ACR Helper" and the permission list, with the address bar showing the client ID; tick Google Sheets; Continue.
4. The panel opens the TEST spreadsheet (its title says TEST). Start review: the main stage shows a TEST applicant read from the sheet (that is the `spreadsheets` read).
5. Vote, Reveal votes, pick Waitlist, Record. Then switch to the TEST spreadsheet in another tab and show the decision cell now says Maybe with the note "Recorded by ..." (that is the `spreadsheets` write).
6. Show the hidden `_acr` tab exists (View > Hidden sheets) and say it holds the encryption key.

## Measured November 19, 2026

- A draft tester sees the draft listing at
  https://workspace.google.com/marketplace/app/acr_helper/29360684398
  with Install, but Google says: "This app hasn't been approved for Google
  Meet yet. If you install it now, it will appear there as soon as it's
  approved." So before approval, testers install from the Cloud console
  (TESTERS.md), not from Meet. Draft testers get no email.
- The consent screen's user support email can only be the signed-in
  account or a group it manages, so it shows ben.wilkoff@minerva.edu.
  Ben wants no implied Minerva endorsement; changing it needs a
  non-Minerva group or account that owns the project (open).
