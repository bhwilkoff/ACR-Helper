// Runs in a top-level popup on the add-on's origin (Meet's frames get no
// cookies or storage). Google's token window may only open from a fresh
// click (it failed with popup_failed_to_open when started on load, measured
// in Meet 2026-11-19), so the person presses Continue here. The token goes
// back to the panel that opened this window, then the window closes.
// Nothing is stored.
window.ACRSignIn = {
  start() {
    const main = document.getElementById('main');
    const say = t => { main.replaceChildren(Object.assign(document.createElement('p'), { textContent: t })); };
    if (!window.opener) { say('Open ACR Helper from the side panel in Meet.'); return; }
    if (!ACR_CONFIG.oauthClientId) { say('Sign-in is not set up yet (needs the OAuth client ID).'); return; }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: ACR_CONFIG.oauthClientId,
      scope: ACR_CONFIG.scopes,
      include_granted_scopes: false,
      prompt: '',
      callback: r => {
        if (r.error) { show('Sign-in did not finish: ' + r.error); return; }
        window.opener.postMessage({ acrToken: r.access_token, expiresIn: Number(r.expires_in) || 3600 }, location.origin);
        window.close();
      },
      error_callback: e => show('Sign-in did not finish: ' + (e.type || e.message || 'closed')),
    });
    function show(note) {
      const nodes = [];
      if (note) nodes.push(Object.assign(document.createElement('p'), { className: 'error', textContent: note }));
      nodes.push(Object.assign(document.createElement('p'), { className: 'muted', textContent: 'Use the Google account the review spreadsheet is shared with.' }));
      const b = Object.assign(document.createElement('button'), { type: 'button', className: 'btn filled', textContent: 'Continue with Google' });
      b.addEventListener('click', () => client.requestAccessToken());
      nodes.push(b);
      main.replaceChildren(...nodes);
    }
    show(null);
  },
};
