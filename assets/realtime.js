// Supabase Realtime broadcast over its websocket protocol, with no third-party
// script. Carries only ciphertext from acr-crypto.js. Rejoins after a drop and
// tells the session to resync.
(function () {
  function connect(topicName) {
    const url = ACR_CONFIG.supabaseUrl.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' +
      encodeURIComponent(ACR_CONFIG.supabaseKey) + '&vsn=1.0.0';
    const topic = 'realtime:' + topicName;
    let ws = null, ref = 0, cb = null, onReconnect = null, beat = null, backoff = 1000, closed = false;
    const queue = [];
    const t = { kind: 'supabase', state: 'connecting', lastError: null };

    function raw(msg) {
      msg.ref = String(++ref);
      const s = JSON.stringify(msg);
      if (ws && ws.readyState === 1 && t.state === 'joined') ws.send(s); else queue.push(s);
    }

    function open() {
      t.state = 'connecting';
      ws = new WebSocket(url);
      ws.onopen = () => {
        backoff = 1000;
        ws.send(JSON.stringify({ topic, event: 'phx_join', ref: String(++ref),
          payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: false } } }));
        beat = setInterval(() => { if (ws.readyState === 1) ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(++ref) })); }, 25000);
      };
      ws.onmessage = e => {
        let m; try { m = JSON.parse(e.data); } catch (_) { return; }
        if (m.topic !== topic) return;
        if (m.event === 'phx_reply' && t.state !== 'joined') {
          if (m.payload && m.payload.status === 'ok') {
            const wasRejoin = t.everJoined;
            t.state = 'joined'; t.everJoined = true;
            while (queue.length) ws.send(queue.shift());
            if (wasRejoin && onReconnect) onReconnect();
          } else { t.lastError = 'join refused'; }
        } else if (m.event === 'broadcast' && m.payload && m.payload.payload && typeof m.payload.payload.d === 'string') {
          if (cb) cb(m.payload.payload.d);
        }
      };
      ws.onclose = () => {
        clearInterval(beat);
        if (closed) return;
        t.state = 'reconnecting';
        setTimeout(open, backoff);
        backoff = Math.min(backoff * 2, 15000);
      };
      ws.onerror = () => { t.lastError = 'websocket error'; };
    }

    t.send = text => raw({ topic, event: 'broadcast', payload: { type: 'broadcast', event: 'm', payload: { d: text } } });
    t.subscribe = f => { cb = f; };
    t.onReconnect = f => { onReconnect = f; };
    t.close = () => { closed = true; if (ws) ws.close(); };
    open();
    return t;
  }
  window.ACRRealtime = { connect };
})();
