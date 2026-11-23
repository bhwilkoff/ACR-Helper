// Runs in a top-level window on the add-on's origin. Inside Meet's nested
// frames the Picker opened but listed no file (measured 2026-11-23); here it
// works as on any page. The panel that opened this window hands over its
// token by postMessage; only "picked" or "cancelled" goes back. Nothing is stored.
(function () {
  const main = document.getElementById('main');
  const say = t => main.replaceChildren(Object.assign(document.createElement('p'), { textContent: t }));
  const opener = window.opener;
  if (!opener) { say('Open ACR Helper from the side panel in Meet.'); return; }
  const reply = msg => { try { opener.postMessage(msg, location.origin); } catch (_) {} };
  let token = null;
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || e.source !== opener || !e.data || !e.data.acrPickToken) return;
    token = e.data.acrPickToken;
    start(0);
  });
  window.addEventListener('beforeunload', () => reply({ acrPick: 'closed' }));
  reply({ acrPick: 'ready' });

  function start(n) {
    if (!(window.gapi)) {
      if (n > 100) return say("Google's file picker did not load.");
      return setTimeout(() => start(n + 1), 100);
    }
    gapi.load('picker', { callback: show, onerror: () => say("Google's file picker did not load.") });
  }
  function show() {
    const g = google.picker;
    const view = new g.DocsView(g.ViewId.SPREADSHEETS).setFileIds(ACR_CONFIG.spreadsheetId).setMode(g.DocsViewMode.LIST);
    new g.PickerBuilder()
      .setAppId(ACR_CONFIG.cloudProjectNumber)
      .setOAuthToken(token)
      .addView(view)
      .enableFeature(g.Feature.SUPPORT_DRIVES)
      .enableFeature(g.Feature.NAV_HIDDEN)
      .setSize(Math.max(320, window.innerWidth - 16), Math.max(320, window.innerHeight - 16))
      .setCallback(d => {
        if (d.action === g.Action.PICKED) { reply({ acrPick: 'picked' }); window.close(); }
        else if (d.action === g.Action.CANCEL) { reply({ acrPick: 'cancelled' }); window.close(); }
      })
      .build().setVisible(true);
  }
})();
