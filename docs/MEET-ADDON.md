# Building ACR Helper as a Meet add-on

Read this, and the `google-meet-addon` skill, before any add-on work.
Everything marked **measured** was seen in real Meet calls while
building the Human Shaped add-on (October and November 2026). Everything
marked **proposed** is a plan for ACR Helper that nobody has tried yet.

The Human Shaped add-on's code is the worked example: the
`humanshaped-site` repository (branch `site`), files `addon/index.html`
(panel), `addon/stage/index.html` (stage), `assets/addon.js`,
`assets/addon-stage.js`, `assets/addon-lib.js`, `assets/panel-frame.js`,
and `tools/meet-addon/` (deployment, listing, and setup steps). Borrow
patterns from it; do not copy its features.

## How an add-on is put together (measured)

- **Two pages on your own origin**, served as static files (GitHub
  Pages is enough). Meet frames them; Google hosts nothing.
  - the **side panel**, one per person, about 320 pixels wide;
  - the **main stage**, opened as an *activity* that the whole call can
    join, roughly 800 by 450 CSS pixels on a laptop with the panel open.
- Both load Google's SDK,
  `https://www.gstatic.com/meetjs/addons/1.2.0/meet.addons.js` (1.2.0 was
  the only version on gstatic in November 2026), and call
  `meet.addon.createAddonSession({ cloudProjectNumber })`, then
  `createSidePanelClient()` or `createMainStageClient()`. The stage must
  create its client at once, even with nothing to show, or Meet shows
  "The add-on couldn't start".
- The panel's client can `startActivity({ mainStageUrl, sidePanelUrl,
  additionalData })`, `endActivity()`, `setActivityStartingState()`,
  `getActivityStartingState()`, `notifyMainStage(text)`, and
  `getMeetingInfo()` (the meeting code); the stage's client can
  `notifySidePanel(text)` and `loadSidePanel()` / `unloadSidePanel()`. Nothing else reaches Meet: no
  participant list, no chat, no recording, no breakouts.
- **The deployment** is a JSON file pasted into the Google Workspace
  Marketplace SDK's HTTP deployments (`tools/meet-addon/deployment.json`
  in humanshaped-site is the model):

  ```json
  {
    "addOns": {
      "common": { "name": "ACR Helper", "logoUrl": "https://<origin>/assets/logo.png" },
      "meet": {
        "web": {
          "sidePanelUrl": "https://<origin>/addon/",
          "supportsScreenSharing": true,
          "addOnOrigins": ["https://<origin>"],
          "logoUrl": "https://<origin>/assets/logo.png",
          "darkModeLogoUrl": "https://<origin>/assets/logo-dark.png"
        },
        "termsUri": "https://<origin>/terms/"
      }
    }
  }
  ```

## Setting it up, once (Ben's steps, from the Human Shaped setup)

Each step ends with something to check. The agent cannot do these for
Ben; they need his Google account.

1. **Allow third-party Meet add-ons** in the Google Admin console for
   the organizational unit that will use ACR Helper (if it is a
   Workspace organization). *Check:* Activities in a Meet call lists
   add-ons.
2. **Make a Cloud project** for ACR Helper and enable the **Google
   Workspace Marketplace SDK** and the **Google Workspace add-ons API**,
   plus the **Google Sheets API** (and the Drive API only if a decision
   needs it). *Check:* all show as enabled.
3. **Send the agent the project number** (not a secret). It goes in a
   config script the panel and stage load.
4. **Consent screen**: name, support email, home page. *Internal*
   audience if only one Workspace organization uses it: Google does not
   verify sensitive scopes, such as Sheets, for an Internal app.
   *External* means verification for the Sheets scope before anyone
   outside the test users can sign in.
5. **Make an OAuth client** (Web application) whose authorized
   JavaScript origin is the add-on's origin, and send the agent its
   client ID (not a secret).
6. **Add the deployment** (the JSON above) and press **Install** on it.
   This needs no listing and no review. *Check:* ACR Helper appears in
   Activities for the account that installed it.
7. **Do not choose a Marketplace visibility yet.** Google says the
   choice between private (your domain only) and public cannot be
   changed once saved.

## Who gets in: the spreadsheet is the gate (proposed)

The rule in AGENTS.md is that the sheet's own sharing decides. A design
that needs no server:

1. The panel opens and shows one button, **Sign in with Google**.
2. Meet's frames cannot use the site's cookies or storage (measured:
   `requestStorageAccess` is refused), so sign-in happens in a **popup**
   on the add-on's own origin, which Meet allows (measured: Human
   Shaped signs in this way). Google Identity Services' token client, in
   the popup or opened from the panel, asks for the Sheets scope and
   returns an access token for that person. *Unverified in a call:*
   whether the token client's own popup works straight from Meet's
   panel frame, or needs the add-on's popup page to run it and hand the
   token back by `postMessage`.
3. The panel calls the Sheets API (`spreadsheets.get` with
   `fields=properties.title`) with that person's token.
   - 200: they can open the sheet, and the panel goes on.
   - 403 or 404: they cannot. The panel says so in one line and names
     who to ask, and shows nothing from the sheet.
4. The check runs every time the panel opens. Nothing records "allowed".
5. The **stage has no sign-in of its own** (measured: panel and stage
   share no storage). What a person's stage shows, their own panel
   sends it with `notifyMainStage`, already read with their own token.
   So a person without access who joins the activity sees a stage that
   says the sheet is not shared with them, never the rows.

Scopes: `drive.file` with a one-time Google Picker pre-pointed at the
sheet (`setFileIds`). Google's verification refused `spreadsheets` on
November 23, 2026 (DECISIONS.md 014). The pick persists: later tokens open
the sheet with no picker (measured). The Picker works inside the sidebar once the
panel's CSP allows its inline styles (`style-src 'unsafe-inline'`).

## One row, the whole call (proposed; Ben chooses)

Everyone in the call should be looking at the same row. Routes, each
with its cost:

- **The sheet holds the current row** (a cell or a small tab the
  leader's panel writes, every panel re-reads every few seconds). No
  server, nothing outside Google, needs write access for the leader;
  a few seconds' lag.
- **A realtime channel** (Supabase Realtime broadcast, free; measured
  working without sign-in in Human Shaped) carries only "row 42 is
  current", never the row's contents; each panel reads the row itself.
  Instant, but adds a service, and the row number does leave Google.
- **Each person moves on their own**, and the leader says the row
  aloud. Nothing shared at all.

## The stage gives way (measured, November 18, 2026)

Ben's point, building Human Shaped: the stage must never force a big
slide to stay on screen just to keep the activity open. What Meet
allows:

- An activity may name **only `sidePanelUrl`**: everyone's panel opens
  and Meet's big window stays free for people and screen shares.
- `startActivity` while an activity runs is refused ("Operation cannot
  be performed while an activity is ongoing"). Nothing closes only the
  stage; `endActivity()` closes every frame and a restart shows each
  person Meet's "Join activity" card.
- So a stage can live **inside the panel** (an iframe of the stage page)
  whenever no main stage is open, and the main stage can **turn into**
  whatever is shown (a source page, a shared screen) instead of
  closing.
- Frames have no autoplay, camera, microphone, display capture,
  clipboard, or fullscreen. A popup the panel opens has all of them.

## The panel (rules from the Human Shaped panel)

These are a starting point for `ADDON-DESIGN.md`, not yet binding here:

1. Design at 320 by 500; fluid from 300 to 480; one column; nothing
   scrolls sideways.
2. The top and the bottom bar never scroll away, together under 160px.
3. Two levels at most: a view, and a view with Back. No modals.
4. One filled button per view; targets at least 32px, the main one 48.
5. A person can read the panel in one glance; a live action takes two
   presses at most.
6. Each view is defined for loading, empty, error, offline, and "you do
   not have access".
7. The panel wears Meet's colors, type, and shapes, light and dark.
8. A control that changes what others see says so before it does.

## Testing: two tabs are not Meet (measured)

- Only a real call counts for anything crossing panel and stage or
  anything a second person sees.
- Use **separate Chrome profiles**, each signed into a different Google
  account: one with access to the test sheet, one without. The second
  account proves the refusal.
- Join twice with **Join here too**, never **Switch here**. Turn the
  camera and microphone off first.
- Use a **test copy of the sheet**, never the real rows.
- Meet caches the pages up to 10 minutes after a push, whatever `curl`
  shows. Bump every `?v=`, wait, then leave and rejoin the activity.
- Each push to Pages cancels a deploy still running; batch pushes.
