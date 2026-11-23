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
- Pages and authorized domain: **humanshaped.org** (home page
  https://acr.humanshaped.org/, since Nov 20; was bhwilkoff.github.io).

**Nov 23, 2026:** Google refused `spreadsheets`; v0.6.0 uses `drive.file` + a one-time Picker (DECISIONS.md 014, VERIFICATION-REPLY.md). The scope justification below is superseded.

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
| 7 | Demo video of the scope in use (TEST sheet only) | agent | done: https://youtu.be/OCE8VseHeAc (unlisted), SCREENCAST.md |
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

**Links:** terms https://acr.humanshaped.org/terms/ · privacy https://acr.humanshaped.org/privacy/ · support https://acr.humanshaped.org/support/

**Scope justification** (verification form, for `spreadsheets`):

> ACR Helper reads the rows of one spreadsheet the user's committee chooses, so each member sees the applicant under review in Google Meet; it keeps a hidden tab in that spreadsheet holding the key that encrypts messages between members' add-ons; and the chair writes the committee's decision and a note into the applicant's row. The narrower drive.file scope cannot open a spreadsheet the user did not create or pick, and spreadsheets.readonly cannot write the decision. ACR Helper opens no other spreadsheet and sends no spreadsheet data to any server.

## Demo video (Ben records, about two minutes, TEST sheet only)

Google asks for a video showing the OAuth consent screen and each scope in use. Record the whole screen (Shift-Command-5 on a Mac), with the browser's address bar visible, in English, then upload to YouTube as Unlisted and paste the link in the verification form.

1. Show https://acr.humanshaped.org/ and its Privacy link (2 seconds each).
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

## Submission state, November 19, 2026 (afternoon)

- Consent screen pushed to **In production** (Ben approved). Any Google
  account can now sign in (unverified-app warning, 100-user cap until
  verified); the sheet's sharing still decides what anyone sees. Testers
  no longer need the test-user list, but until Marketplace approval they
  still install from the Cloud console (TESTERS.md).
- Branding: logo added (icon-128), developer contacts
  ben.wilkoff@minerva.edu and benwilkoff@gmail.com, saved. **Verify
  branding** ran Google's automatic check and failed only on "home page
  URL ... is not registered to you. Verify ownership ... then wait 24
  hours." Both https://bhwilkoff.github.io/ (HTML file) and
  https://bhwilkoff.github.io/ACR-Helper/ (auto, parent property) are
  verified in Search Console as ben.wilkoff@minerva.edu since about
  12:30 on Nov 19.
- **Next, after 12:30 on Nov 20:** Branding > Verification status >
  View issues > "I have fixed the issues" > Proceed. Once branding
  passes, Verification Center > Prepare for verification: the
  `spreadsheets` justification (above) and the video link; then Ben
  presses Submit. Then Ben presses Submit for review on the Marketplace
  store listing (draft saved, read back).

## Branding re-check, November 20, 2026, 12:50 MST

- In the ben.wilkoff@minerva.edu profile: Branding > Verification status >
  View issues > "I have fixed the issues" > Proceed. Google logged "Verify
  branding information" as done; the status is unchanged and the issue is
  the same: home page URL "https://bhwilkoff.github.io/ACR-Helper/" "is
  not registered to you."
- Search Console, same account: "You are a verified owner" of
  https://bhwilkoff.github.io/ (HTML file), so this is not the 24-hour wait.
  Developer forum threads report the same failure on github.io and
  vercel.app hosts despite verification.
- Verification Center: "You need to verify and publish your branding
  before you can request for verification." Prepare for verification is
  locked; nothing filled, nothing submitted.
- Options (Ben decides): (1) "I believe the issues found are incorrect"
  (asks Google for human review; may take days); (2) put the home,
  privacy, and terms pages on a domain Ben owns, verify it in Search
  Console by DNS, update Branding and the authorized domain, re-check.

## Moved to acr.humanshaped.org, November 20, 2026 (afternoon)

Ben: "Either humanshaped.org or learningischange.com would be the most
logical to use." Done in the ben.wilkoff@minerva.edu profile, each read back:

- WordPress.com DNS for humanshaped.org: CNAME `acr` -> bhwilkoff.github.io;
  TXT `@` google-site-verification=_l-BzsB0... (Search Console token for
  ben.wilkoff@minerva.edu; the two older TXT tokens belong to the gmail
  account and are untouched).
- Search Console: Domain property humanshaped.org verified ("Ownership
  auto verified") as ben.wilkoff@minerva.edu. Keep the TXT record.
- GitHub Pages custom domain acr.humanshaped.org, certificate approved,
  HTTPS enforced. Old github.io URLs 301 to the new domain.
- OAuth client origins: https://acr.humanshaped.org and
  http://localhost:8080 (github.io removed).
- Meet deployment `acr-helper`: every URL and addOnOrigins now
  acr.humanshaped.org ("Changes saved successfully").
- Branding: home, privacy, terms on acr.humanshaped.org; authorized
  domains humanshaped.org and bhwilkoff.github.io (left in place: editing
  Branding again could reset its verification). **Branding verified and
  published** ("Your branding has been verified and is being shown to users").
- Data Access: `spreadsheets` justification (552 chars, above) and
  https://youtu.be/OCE8VseHeAc saved; the Prepare for verification summary
  reads both back.
- Marketplace store listing: terms, privacy, support, and draft-tester
  opt-out URLs on acr.humanshaped.org; Save Draft, read back after reload.

**Ready for Ben** (not pressed by the agent):
1. Verification Center > Prepare for verification > **Confirm**
   (Additional info is optional and empty).
2. Marketplace SDK > Store Listing > **SUBMIT FOR REVIEW**.

Not yet verified in a real Meet call on the new domain (sign-in from the
new origin; Google says client changes take 5 minutes to a few hours).
The demo video's consent window shows bhwilkoff.github.io, the old origin.

## Submitted by Ben, November 21, 2026

Read back in the console:
- Verification Center: "Your app's data access is under review." Branding
  verified and shown. Additional info carried an 867-character note
  (Meet add-on, sheet-sharing access model, encryption, the move from
  bhwilkoff.github.io to acr.humanshaped.org with the same client ID).
- Marketplace Store Listing: "The draft is in review and can't be edited."
  Draft testers unchanged.

Next: wait for Google's emails (to ben.wilkoff@minerva.edu and
benwilkoff@gmail.com). Run a real Meet call on acr.humanshaped.org.
