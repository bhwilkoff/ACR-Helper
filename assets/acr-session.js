// One review session shared by every panel in the call (REQUIREMENTS 4.3, 4.4).
// The chair's panel owns the state and rebroadcasts it; members follow.
// Votes are sealed to the chair's one-time key and opened only on Reveal.
// Nothing here is ever written to storage (R20).
(function (root) {
  const C = typeof module !== 'undefined' && module.exports ? require('./acr-crypto.js') : root.ACRCrypto;
  const PRESENT_MS = 45000;
  const CHOICES = ['Admit', 'Waitlist', 'Reject', 'Discuss'];

  class Session {
    // transport: { send(text), subscribe(cb(text)) }; me: { name, email }
    constructor({ me, groupKey, channel, transport, onChange, now }) {
      this.me = me;
      this.groupKey = groupKey;
      this.channel = channel;
      this.transport = transport;
      this.onChange = onChange || (() => {});
      this.now = now || (() => Date.now());
      this.st = null;
      this.isChair = false;
      this.myVote = null;
      this.chairKeys = null;
      this.sealed = new Map();
      this.present = new Map();
      this.queue = Promise.resolve();
      this.lastError = null;
      transport.subscribe(text => { this.queue = this.queue.then(() => this._receive(text)).catch(e => { this.lastError = e.message; }); });
    }

    async _send(msg) {
      this.transport.send(await C.seal(this.groupKey, msg, this.channel));
    }

    async _receive(text) {
      let m;
      try { m = await C.open(this.groupKey, text, this.channel); } catch (_) { return; }
      if (!m || typeof m.t !== 'string') return;
      if (m.t === 'state') return this._onState(m.st);
      if (!this.isChair) return;
      if (m.t === 'hello' || m.t === 'here') {
        this._seen(m.from);
        if (m.t === 'hello') await this._broadcast();
        else await this._maybeBroadcastPresence();
      }
      if (m.t === 'vote') await this._onVote(m);
    }

    _seen(from) {
      if (!from || !from.email) return;
      this.present.set(from.email, { name: String(from.name || from.email), at: this.now() });
    }

    _presentCount() {
      const t = this.now();
      let n = 0;
      for (const p of this.present.values()) if (t - p.at < PRESENT_MS) n++;
      return n;
    }

    async _maybeBroadcastPresence() {
      const n = this._presentCount();
      if (this.st && n !== this.st.present) await this._broadcast();
    }

    _onState(st) {
      if (!st || !st.sid) return;
      const cur = this.st;
      const newer = !cur || (st.sid === cur.sid ? st.rev > cur.rev : st.startedAt > cur.startedAt);
      if (!newer) return;
      if (this.isChair && cur && st.sid !== cur.sid) this.isChair = false;
      if (!cur || cur.round !== st.round || cur.sid !== st.sid) this.myVote = null;
      this.st = st;
      this.onChange(this.view());
    }

    async _onVote(m) {
      const st = this.st;
      if (!st || m.sid !== st.sid || m.round !== st.round || st.revealed) return;
      if (!m.from || !m.from.email || !m.sealed) return;
      this._seen(m.from);
      if (m.retract) this.sealed.delete(m.from.email);
      else this.sealed.set(m.from.email, { name: String(m.from.name || m.from.email), sealed: m.sealed });
      await this._broadcast();
    }

    async _broadcast() {
      const st = this.st;
      st.rev++;
      st.voters = Array.from(this.sealed.values(), v => v.name).sort();
      st.present = Math.max(this._presentCount(), st.voters.length);
      this.onChange(this.view());
      await this._send({ t: 'state', st });
    }

    // ---- everyone ----
    async join() {
      this._seenSelf();
      await this._send({ t: 'hello', from: this.me });
    }

    _seenSelf() { this._seen(this.me); }

    async heartbeat() {
      if (this.isChair) { this._seenSelf(); await this._maybeBroadcastPresence(); }
      else await this._send({ t: 'here', from: this.me });
    }

    async vote(choice) {
      if (!CHOICES.includes(choice)) throw new Error('Not a vote: ' + choice);
      const st = this.st;
      if (!st || st.revealed || st.recorded) return;
      const sealed = await C.sealVote(st.chairPub, { choice, round: st.round }, st.sid + '|' + st.round);
      this.myVote = choice;
      const m = { t: 'vote', sid: st.sid, round: st.round, from: this.me, sealed };
      if (this.isChair) await this._onVote(m);
      else { this.onChange(this.view()); await this._send(m); }
    }

    // ---- chair ----
    async start(applicant) {
      this.isChair = true;
      this.chairKeys = await C.newChairKeys();
      this.sealed.clear();
      this._seenSelf();
      this.st = {
        sid: C.randomId(), startedAt: this.now(), rev: 0, round: C.randomId(),
        chair: this.me, chairPub: this.chairKeys.publicJwk,
        tab: applicant.tab, sheetRow: applicant.sheetRow, n: applicant.n, total: applicant.total,
        voters: [], present: 1, revealed: null, recorded: null,
      };
      this.myVote = null;
      await this._broadcast();
    }

    async goTo(applicant) {
      this._chairOnly();
      Object.assign(this.st, { tab: applicant.tab, sheetRow: applicant.sheetRow, n: applicant.n, total: applicant.total });
      await this._newRound();
    }

    async voteAgain() {
      this._chairOnly();
      await this._newRound();
    }

    async _newRound() {
      this.sealed.clear();
      this.myVote = null;
      Object.assign(this.st, { round: C.randomId(), revealed: null, recorded: null });
      await this._broadcast();
    }

    async reveal() {
      this._chairOnly();
      const st = this.st;
      const out = [];
      for (const v of this.sealed.values()) {
        try {
          const opened = await C.openVote(this.chairKeys.privateKey, v.sealed, st.sid + '|' + st.round);
          if (opened.round === st.round && CHOICES.includes(opened.choice)) out.push({ name: v.name, choice: opened.choice });
        } catch (_) { /* a vote that does not open is left out */ }
      }
      out.sort((a, b) => a.name.localeCompare(b.name));
      st.revealed = out;
      await this._broadcast();
    }

    async recorded(decision) {
      this._chairOnly();
      this.st.recorded = decision;
      await this._broadcast();
    }

    _chairOnly() {
      if (!this.isChair || !this.st) throw new Error('Only the chair can do that');
    }

    view() {
      const st = this.st;
      if (!st) return null;
      return {
        isChair: this.isChair, chair: st.chair, tab: st.tab, sheetRow: st.sheetRow, n: st.n, total: st.total,
        round: st.round, voters: st.voters.slice(), present: st.present,
        revealed: st.revealed ? st.revealed.slice() : null, recorded: st.recorded, myVote: this.myVote,
      };
    }

    settle() { return this.queue; }
  }

  const lib = { Session, CHOICES, PRESENT_MS };
  if (typeof module !== 'undefined' && module.exports) module.exports = lib;
  else root.ACRSession = lib;
})(typeof window !== 'undefined' ? window : globalThis);
