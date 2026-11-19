// How sealed messages travel between panels. Everything passed here is already
// ciphertext (acr-crypto.js); a transport never sees plaintext.
(function () {
  function broadcastChannel(name) {
    const bc = new BroadcastChannel(name);
    return {
      kind: 'local',
      send(text) { bc.postMessage(text); },
      subscribe(cb) { bc.onmessage = e => cb(e.data); },
      close() { bc.close(); },
    };
  }

  function make(name, opts) {
    if (opts && opts.local) return broadcastChannel(name);
    if (!ACR_CONFIG.supabaseUrl || !ACR_CONFIG.supabaseKey) {
      throw new Error('The realtime channel is not set up yet (needs the Supabase URL and key)');
    }
    return window.ACRRealtime.connect(name);
  }

  window.ACRTransport = { make };
})();
