// Runs in a top-level popup on the add-on's origin (Meet's frames get no
// cookies or storage). Gets this person's own access token from Google and
// hands it to the panel that opened it, then closes. Nothing is stored.
window.ACRSignIn = {
  start() {
    const main = document.getElementById('main');
    const say = t => { main.replaceChildren(Object.assign(document.createElement('p'), { textContent: t })); };
    if (!window.opener) { say('Open ACR Helper from the side panel in Meet.'); return; }
    if (!ACR_CONFIG.oauthClientId) { say('Sign-in is not set up yet (needs the OAuth client ID).'); return; }
    const client = google.accounts.oauth2.initTokenClient({
      client_id: ACR_CONFIG.oauthClientId,
      scope: ACR_CONFIG.scopes,
      prompt: new URLSearchParams(location.search).get('again') === '1' ? '' : 'select_account',
      callback: r => {
        if (r.error) { say('Sign-in did not finish: ' + r.error); return; }
        window.opener.postMessage({ acrToken: r.access_token, expiresIn: Number(r.expires_in) || 3600 }, location.origin);
        window.close();
      },
      error_callback: e => say('Sign-in did not finish: ' + (e.type || e.message || 'closed')),
    });
    client.requestAccessToken();
  },
};
