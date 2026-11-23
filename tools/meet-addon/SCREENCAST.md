# Review video (drive.file), 2026-11-23

**Uploaded:** youtu.be/ruo5K9UMRr8 (v0.8.1: one button, one Google window,
Picker in the side panel), Unlisted, 3:16, on Ben's channel
(benwilkoff@gmail.com). Superseded: youtu.be/hFSTPAD5ikQ (v0.6.2, pick window).
Built with `screencast/build.sh <clips> <work>` from eight window clips
(s1-signin, s1b-confirm, s2-openreview, s3-consent, s4-choose, s5-pick,
s6-review, s7-sheet) and cards 01-08 (`cards.json`, `make.py`). Call
xgw-gwmt-ccf / sgz-pwwt-nky hosted by benwilkoff@gmail.com, TEST-0010.

How to reset so the consent screen and the picker appear on camera:
- drive.google.com/drive/settings > Manage apps > ACR Helper > Disconnect
  from Drive. This one step removes the sheet choice **and** the approval.
  Do it while ACR Helper still has access: after myaccount "Delete all" the
  app leaves Drive's list but the sheet choice survives (measured Nov 23).
- Start recording a pop-up window ~2.5 s after it appears, and wait ~3 s after
  stopping one recording before starting the next; overlapping streams
  crashed the recorder ("connection being interrupted").
- Compile the recorder with `swiftc -O -parse-as-library`.
- Picker rows cannot be selected through Accessibility; a person clicks.
- One Tap's chooser shows the second account; build.sh blurs that line.

---

# Review video, shot by shot (2026-11-19)

*Made by Claude the way Human Shaped's was (humanshaped-site/tools/meet-addon/SCREENCAST.md).*

**Uploaded:** <https://youtu.be/OCE8VseHeAc>, Unlisted, on Ben's "Ben Wilkoff"
channel (benwilkoff@gmail.com). 3:12, 1920x1080. The video file is not in
the repository.

Filmed in a Meet call (oxv-uysq-xic) hosted by benwilkoff@gmail.com, so no
minerva.edu address is on screen, on the TEST sheet only (applicant
TEST-0007). Before filming, that account's ACR Helper grant was deleted at
myaccount.google.com/connections so the consent screens show.

| # | Shot | Scope |
|---|---|---|
| 1 | Card: what ACR Helper is, project 29360684398, the four scopes, nothing sent to a server | all |
| 2 | Card: sign-in inside the side panel | openid, email, profile, spreadsheets |
| 3 | Meet: Meeting tools > Add-ons > ACR Helper; One Tap inside the panel; Continue as Ben | openid, email, profile |
| 4 | Google's confirm window ("Confirm you want to sign in to bhwilkoff.github.io as Ben"), with privacy and terms links | openid, email, profile |
| 5 | Panel "Signed in to Google as ..."; Open the review | — |
| 6 | Google's window: "Google hasn't verified this app" > Continue; "bhwilkoff.github.io wants additional access ... See, edit, create, and delete all your Google Sheets spreadsheets" with the address bar on the consent URL; Continue | spreadsheets, granted |
| 7 | Card: spreadsheets (read) | |
| 8 | Lobby shows the TEST sheet's title; Start review; Meet's activity dialog; the main stage shows TEST-0007 read from the sheet | spreadsheets, read |
| 9 | Card: private votes; then vote Waitlist, Reveal | none |
| 10 | Card: spreadsheets (write); Pick Waitlist, Record; Write a note, Add note; the stage shows the note | spreadsheets, write |
| 11 | Card: the spreadsheet afterward; AB8 "Maybe" with its cell note, AK8 in the formula bar, the hidden _acr tab in the sheet list | spreadsheets, written |
| 12 | Card: summary and privacy link | |

Recorded window-only with Archive Watch's `tools/demo_window_record.swift`
(one window at a time: starting a second stream ends the first). Google's
own windows were pressed through Accessibility (`ax_press.swift` focus +
Return; AXPress alone did nothing on those web buttons). Assembly:
`screencast/build.sh <clips> <work>`: crops Chrome's tab strip and the
"Claude started debugging this browser" banner, blurs the "Claude" pills,
keeps the title and address bar of Google's windows, and `tighten.py` cuts
still stretches. The sheet clip starts at 38.5 s, after a Workspace promo
was closed. Upload copy re-encoded at CRF 26 (4.8 MB) so the browser
upload tool would take it.
