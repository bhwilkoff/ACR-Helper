// Asking for access during a review (Marketplace review, 2026-11-26: a
// participant must be able to get permission while the activity runs).
// Someone who cannot open the sheet asks here; a person who can open it
// shares the sheet with them from the panel. Everything is encrypted
// (acr-crypto.js doorChannel) and nothing is stored.
(function (root) {
  const C = typeof module !== 'undefined' && module.exports ? require('./acr-crypto.js') : root.ACRCrypto;
  const ASK_EVERY_MS = 10000;

  class Door {
    constructor({ key, channel, transport, onChange, now }) {
      this.key = key;
      this.channel = channel;
      this.transport = transport;
      this.onChange = onChange || (() => {});
      this.now = now || (() => Date.now());
      this.asks = new Map();
      this.me = null;
      this.asking = null;
      this.granted = false;
      this.chair = null;
      this.queue = Promise.resolve();
      transport.subscribe(text => { this.queue = this.queue.then(() => this._receive(text)).catch(() => {}); });
    }

    async _send(m) { this.transport.send(await C.seal(this.key, m, this.channel)); }

    async _receive(text) {
      let m;
      try { m = await C.open(this.key, text, this.channel); } catch (_) { return; }
      if (!m || typeof m.t !== 'string') return;
      if (m.t === 'ask' && m.from && m.from.email && !this.asking) {
        const known = this.asks.get(m.from.email);
        if (known && known.nonce === m.nonce) { if (known.state === 'asked' && this.chair) await this._send({ t: 'running', chair: this.chair }); return; }
        this.asks.set(m.from.email, { name: String(m.from.name || m.from.email), email: String(m.from.email), nonce: m.nonce, state: 'asked' });
        this.onChange();
        if (this.chair) await this._send({ t: 'running', chair: this.chair });
      } else if (this.asking && m.to === this.asking.email && (m.t === 'granted' || m.t === 'declined')) {
        this.granted = m.t === 'granted';
        this.asking.answer = m.t;
        this.asking.by = m.by ? String(m.by) : null;
        this._stopAsking();
        this.onChange();
      } else if (!this.asking && (m.t === 'granted' || m.t === 'declined') && this.asks.has(m.to)) {
        const a = this.asks.get(m.to);
        if (a.state === 'asked') { a.state = 'dismissed'; this.onChange(); }
      } else if (m.t === 'running' && m.chair && this.asking) {
        this.chair = { name: String(m.chair.name || '') };
        this.onChange();
      }
    }

    // Someone without access.
    ask(me) {
      this.asking = { email: me.email, name: me.name, answer: null };
      this.granted = false;
      this._stopAsking();
      const nonce = C.randomId();
      const send = () => this._send({ t: 'ask', nonce, from: { name: me.name, email: me.email } }).catch(() => {});
      send();
      this._timer = setInterval(send, ASK_EVERY_MS);
      this.onChange();
    }
    _stopAsking() { clearInterval(this._timer); this._timer = null; }

    // Someone with access. chair: { name } while a review is running, else null.
    setRunning(chair) { this.chair = chair ? { name: String(chair.name || '') } : null; }
    pending() { return Array.from(this.asks.values()).filter(a => a.state !== 'dismissed'); }
    async answer(email, granted, byName) {
      const a = this.asks.get(email);
      if (!a) return;
      a.state = granted ? 'shared' : 'dismissed';
      this.onChange();
      await this._send({ t: granted ? 'granted' : 'declined', to: email, by: byName || null });
    }
    clearShared(email) { const a = this.asks.get(email); if (a && a.state === 'shared') { a.state = 'dismissed'; this.onChange(); } }

    close() { this._stopAsking(); if (this.transport.close) this.transport.close(); }
    settle() { return this.queue; }
  }

  async function openDoor({ sheetId, meetingCode, transportFor, onChange, now }) {
    const { key, channel } = await C.doorChannel(sheetId, meetingCode || 'no-meeting');
    return new Door({ key, channel, transport: transportFor(channel), onChange, now });
  }

  const lib = { Door, openDoor, ASK_EVERY_MS };
  if (typeof module !== 'undefined' && module.exports) module.exports = lib;
  else root.ACRDoor = lib;
})(typeof window !== 'undefined' ? window : globalThis);
