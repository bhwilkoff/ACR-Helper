// The one first-time window (Ben, 2026-11-23: "combine these different
// pop-ups into a single experience"). It runs on the add-on's origin, top
// level, so Google's own sign-in box can open over it and Google's Picker
// lists files (neither works inside Meet's frames). Google's sign-in pages
// cut the link to an opener (Cross-Origin-Opener-Policy: same-origin,
// measured 2026-11-23), so this window never navigates to Google; it opens
// Google's box with the token client and keeps the link to the panel.
// Steps: Continue -> Google's box (account, permission) -> if the sheet is not
// yet chosen, the Picker -> the token goes back to the panel -> close.
// Nothing is stored. Mode "pick" skips sign-in when the panel already has a token.
(function () {
  const main = document.getElementById('main');
  const opener = window.opener;
  const SID = ACR_CONFIG.spreadsheetId;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  const say = (t, cls) => main.replaceChildren(el('p', cls || 'muted', t));
  if (!opener) { say('Open ACR Helper from the side panel in Meet.'); return; }
  const reply = msg => { try { opener.postMessage(msg, location.origin); } catch (_) {} };
  let token = null, expiresIn = 3600, hint = '', finished = false;

  window.addEventListener('message', e => {
    if (e.origin !== location.origin || e.source !== opener || !e.data) return;
    if (e.data.acrPickToken) { token = e.data.acrPickToken; pick(); }
    else if (e.data.acrSetup) { hint = String(e.data.hint || ''); viewContinue(); }
  });
  window.addEventListener('beforeunload', () => { if (!finished) reply({ acrPick: 'closed' }); });
  reply({ acrPick: 'ready' });

  function viewContinue(note) {
    const nodes = [];
    if (note) nodes.push(el('p', 'error', note));
    nodes.push(el('p', null, 'Sign in with the Google account the review spreadsheet is shared with.'));
    const b = el('button', 'btn filled', 'Continue with Google'); b.type = 'button';
    b.addEventListener('click', signIn);
    nodes.push(b);
    main.replaceChildren(...nodes);
  }

  function signIn() {
    if (!(window.google && google.accounts && google.accounts.oauth2)) return viewContinue("Google's sign-in did not load. Try again.");
    const client = google.accounts.oauth2.initTokenClient({
      client_id: ACR_CONFIG.oauthClientId,
      scope: ACR_CONFIG.scopes,
      include_granted_scopes: false,
      callback: r => {
        if (r.error) return viewContinue('Sign-in did not finish: ' + r.error);
        if (!google.accounts.oauth2.hasGrantedAllScopes(r, 'https://www.googleapis.com/auth/drive.file')) {
          return viewContinue('Allow access on Google’s screen to continue.');
        }
        token = r.access_token; expiresIn = Number(r.expires_in) || 3600;
        checkThenPick();
      },
      error_callback: e => viewContinue(e && e.type === 'popup_closed' ? '' : 'Sign-in did not finish: ' + ((e && e.type) || 'closed')),
    });
    const opts = hint ? { hint } : {};
    client.requestAccessToken(opts);
    say('Finish in Google’s window.');
  }

  // Already chosen before (or shared another way): skip the Picker.
  async function checkThenPick() {
    say('Checking the review spreadsheet…');
    try {
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + encodeURIComponent(SID) + '?fields=spreadsheetId',
        { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store', referrerPolicy: 'no-referrer' });
      if (res.ok) return done(false);
    } catch (_) {}
    pick();
  }

  function done(picked) {
    finished = true;
    reply({ acrPick: 'picked', acrToken: token, expiresIn, picked });
    window.close();
  }

  function pick(n) {
    n = n || 0;
    if (!window.gapi) {
      if (n > 100) return say("Google's file picker did not load.", 'error');
      return setTimeout(() => pick(n + 1), 100);
    }
    say('Opening Google’s file picker…');
    gapi.load('picker', { callback: showPicker, onerror: () => say("Google's file picker did not load.", 'error') });
  }

  function showPicker() {
    const g = google.picker;
    const view = new g.DocsView(g.ViewId.SPREADSHEETS).setFileIds(SID).setMode(g.DocsViewMode.LIST);
    new g.PickerBuilder()
      .setAppId(ACR_CONFIG.cloudProjectNumber)
      .setOAuthToken(token)
      .addView(view)
      .enableFeature(g.Feature.SUPPORT_DRIVES)
      .enableFeature(g.Feature.NAV_HIDDEN)
      .setSize(Math.max(320, window.innerWidth - 16), Math.max(320, window.innerHeight - 16))
      .setCallback(d => {
        if (d.action === g.Action.PICKED) done(true);
        else if (d.action === g.Action.CANCEL) { finished = true; reply({ acrPick: 'cancelled' }); window.close(); }
      })
      .build().setVisible(true);
  }
})();
