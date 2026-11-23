# Google's verification review, November 23, 2026

*Written by Claude, November 23, 2026. Awaiting Ben's review.*

Google's Third Party Data Safety Team wrote to ben.wilkoff@minerva.edu
(cc benwilkoff@gmail.com) on November 23, 2026, subject "[Action Needed]
OAuth Verification Request Acknowledgement", project acr-helper
(29360684398). They asked for four things. Each, and what was done:

| # | Google asked | Done |
|---|---|---|
| 1 | Use the narrower `drive.file` scope instead of `spreadsheets`, or justify why not (Option 1 / Option 2) | **Option 1.** v0.6.0 asks only for `drive.file openid email profile`. The first time a person opens the add-on, Google's Picker (pre-pointed at the committee's sheet with `setFileIds`) asks them to choose it once. Measured Nov 23 with a `drive.file`-only token: the Sheets API returned 404 for the TEST sheet before the pick and 200 after, hidden `_acr` tab included. No API key needed. |
| 2 | Privacy policy must state data protection mechanisms for sensitive data | New section "How sensitive data is protected" on https://acr.humanshaped.org/privacy/ (no copies, TLS + AES-256-GCM end to end, ECDH-sealed votes, Google-enforced access on every request, least access via drive.file, memory-only tokens, strict CSP and no trackers, nothing retained, how to report a problem). |
| 3 | New demo video: consent screen with every scope expanded, scopes matching the console, the scopes' full use | Made and uploaded Nov 23: youtu.be/hFSTPAD5ikQ (SCREENCAST.md). Originally judged needed only if a sensitive scope remains. With Option 1 every scope is non-sensitive, so Google should close the sensitive-scope review; a new video is ready to record if they still ask (shot list below). |
| 4 | Test credentials and step-by-step instructions | Reviewer steps below. Needs Ben's choice on how a reviewer reaches the TEST sheet. |

## Console changes (done by the agent, Nov 23, read back after reload)

- Google Auth Platform > Data Access: added `drive.file`, removed
  `spreadsheets` (never approved). Save asked "Saving will update your
  verification request"; Confirm. Read back: non-sensitive scopes
  drive.file, userinfo.email, userinfo.profile, openid; no sensitive or
  restricted scopes.
- Verification Center now reads: "Verification is not required since your
  app is not requesting any sensitive or restricted scopes." Branding
  still verified and shown.
- **Done Nov 23 (Ben approved):** listing review cancelled, App Configuration Scope 3 changed to drive.file (read back after reload), listing resubmitted ("Review submitted"). Before that it was locked: Marketplace SDK > App Configuration > OAuth Scopes
  still lists `spreadsheets` as Scope 3. Save Draft is disabled while the
  store listing is in review. Change Scope 3 to
  `https://www.googleapis.com/auth/drive.file` as soon as it unlocks
  (after the listing review, or if Google returns it for changes).

## Reply to send (from ben.wilkoff@minerva.edu, replying in the same thread)

> Confirming narrower scopes
>
> Hello,
>
> Thank you for the review. For project acr-helper (29360684398):
>
> 1. Minimum scopes: ACR Helper now requests only drive.file, openid, email, and profile. We added drive.file to the Cloud Console project and removed the spreadsheets scope (it had not been approved) from both the project and the app's code. Each user now chooses the committee's spreadsheet once in the Google Picker (pre-selected with setFileIds), and ACR Helper can open only that file.
>
> 2. Privacy policy: https://acr.humanshaped.org/privacy/ now has a section "How sensitive data is protected" describing our data protection mechanisms: no server-side storage or copies of user data; TLS for every connection plus AES-256-GCM end-to-end encryption between add-ons; votes sealed with ECDH P-256; access enforced by Google on every request using each user's own token; least-privilege file access through drive.file; access tokens held only in memory; a strict Content Security Policy with no analytics or trackers; no data retention; and how to report a problem.
>
> 3. Demo video and test instructions: since the app no longer requests any sensitive or restricted scope, we understand these are no longer required. If you still need them, we will provide a new video showing the full consent screen and every feature, and reviewer instructions.
>
> Thank you,
> Ben Wilkoff

## Reviewer steps (if Google asks for test access)

ACR Helper has no login of its own: a reviewer uses their own Google
account. It opens only one spreadsheet (the TEST copy, fake data). The
reviewer needs that sheet shared with their account, with edit access to
try recording a decision. Ben chooses how:

- (a) Share the TEST sheet "Anyone with the link: Editor" for the review
  period (fake data only; undo after approval), or
- (b) make a dedicated test Google account, share the TEST sheet with it,
  and put its sign-in in the verification form yourself (agents never
  handle passwords).

Steps for the reviewer:

1. Start a Google Meet call at https://meet.google.com in Chrome on a computer.
2. Open Activities (the shapes icon, bottom right) > Add-ons > ACR Helper (install it from the Workspace Marketplace if asked).
3. In the side panel press **Sign in with Google**. Google's consent screen lists: your name and email, and "See, edit, create, and delete only the specific Google Drive files you use with this app". Press Continue.
4. The panel shows **Choose the spreadsheet**. Press it; a window opens with Google's Picker on "TEST - ACR Helper fake applicants (no real data)". Select it and press **Select**. (This is the drive.file grant.)
5. The panel shows a tab picker. Press **Start review**: the main stage opens and shows the first undecided TEST applicant, read from the sheet.
6. Press a vote (Admit, Waitlist, Reject, Abstain), then **Reveal votes**: the tally appears.
7. Choose a decision and press **Record**: the decision is written into that applicant's row in the TEST sheet, with a cell note naming who recorded it. Open the TEST sheet to see it.
8. Press **Next applicant** to move on.

## New demo video shot list (only if Google asks again)

Record with the address bar visible; TEST sheet only; English.

1. https://acr.humanshaped.org/ and its Privacy link (2 s each).
2. In a Meet call: Activities > Add-ons > ACR Helper > Sign in with Google.
3. Google's consent screen: zoom on the app name and the client ID in the
   address bar; expand every permission ("Show all services" if present):
   name, email, drive.file. Continue.
4. Choose the spreadsheet > the window with Google's Picker on the TEST
   sheet > Select (the drive.file grant).
5. Start review: the stage shows a TEST applicant (drive.file read).
6. Vote, Reveal, Record Waitlist; switch to the TEST sheet and show the
   cell now says Maybe with the note (drive.file write).
7. View > Hidden sheets: the `_acr` tab holding the channel key.
