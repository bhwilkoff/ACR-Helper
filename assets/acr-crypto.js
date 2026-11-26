// Everything on the realtime channel is ciphertext (REQUIREMENTS P4-P7).
// Group key: 256-bit AES-GCM key kept in the sheet's hidden _acr tab.
// Sealed votes: ECDH P-256 to the chair's one-time public key, then AES-GCM.
(function (root) {
  const subtle = (root.crypto || globalThis.crypto).subtle;
  const rand = n => (root.crypto || globalThis.crypto).getRandomValues(new Uint8Array(n));
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function b64(bytes) {
    let s = '';
    const u = new Uint8Array(bytes);
    for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
    return btoa(s);
  }
  function unb64(str) {
    const s = atob(str);
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u;
  }

  function newGroupKey() { return b64(rand(32)); }

  async function importGroupKey(keyB64) {
    const raw = unb64(keyB64);
    if (raw.length !== 32) throw new Error('The _acr key is not a 256-bit key');
    return subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }

  async function channelName(keyB64, meetingCode) {
    const h = await subtle.digest('SHA-256', enc.encode('acr1|' + keyB64 + '|' + meetingCode));
    return 'acr-' + Array.from(new Uint8Array(h).slice(0, 16), b => b.toString(16).padStart(2, '0')).join('');
  }

  // The door: a channel for people who cannot open the sheet yet, so they hold
  // no group key. Bound to this call and this sheet; carries only who is asking.
  async function doorChannel(sheetId, meetingCode) {
    const seed = 'acr-door1|' + sheetId + '|' + meetingCode;
    const h = new Uint8Array(await subtle.digest('SHA-256', enc.encode('name|' + seed)));
    const k = await subtle.digest('SHA-256', enc.encode('key|' + seed));
    const key = await subtle.importKey('raw', k, 'AES-GCM', false, ['encrypt', 'decrypt']);
    return { key, channel: 'acr-door-' + Array.from(h.slice(0, 16), b => b.toString(16).padStart(2, '0')).join('') };
  }

  async function aesSeal(key, obj, aad) {
    const iv = rand(12);
    const ct = await subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(aad || '') }, key, enc.encode(JSON.stringify(obj)));
    return b64(iv) + '.' + b64(ct);
  }

  async function aesOpen(key, str, aad) {
    const [iv, ct] = String(str).split('.');
    const pt = await subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv), additionalData: enc.encode(aad || '') }, key, unb64(ct));
    return JSON.parse(dec.decode(pt));
  }

  // Group envelope, bound to the channel name so a message can't be replayed into another meeting.
  const seal = (groupKey, obj, channel) => aesSeal(groupKey, obj, channel);
  const open = (groupKey, str, channel) => aesOpen(groupKey, str, channel);

  const ECDH = { name: 'ECDH', namedCurve: 'P-256' };

  async function newChairKeys() {
    const kp = await subtle.generateKey(ECDH, false, ['deriveKey']);
    const jwk = await subtle.exportKey('jwk', kp.publicKey);
    return { privateKey: kp.privateKey, publicJwk: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y } };
  }

  async function derive(priv, pubJwk) {
    const pub = await subtle.importKey('jwk', pubJwk, ECDH, false, []);
    return subtle.deriveKey({ name: 'ECDH', public: pub }, priv, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  // A member seals a vote so only the chair's private key opens it.
  async function sealVote(chairPublicJwk, vote, aad) {
    const eph = await subtle.generateKey(ECDH, true, ['deriveKey']);
    const key = await derive(eph.privateKey, chairPublicJwk);
    const epkFull = await subtle.exportKey('jwk', eph.publicKey);
    const epk = { kty: epkFull.kty, crv: epkFull.crv, x: epkFull.x, y: epkFull.y };
    return { epk, box: await aesSeal(key, vote, aad) };
  }

  async function openVote(chairPrivateKey, sealed, aad) {
    const key = await derive(chairPrivateKey, sealed.epk);
    return aesOpen(key, sealed.box, aad);
  }

  function randomId() { return b64(rand(9)).replace(/[+/=]/g, ''); }

  const lib = { newGroupKey, importGroupKey, channelName, doorChannel, seal, open, newChairKeys, sealVote, openVote, randomId };
  if (typeof module !== 'undefined' && module.exports) module.exports = lib;
  else root.ACRCrypto = lib;
})(typeof window !== 'undefined' ? window : globalThis);
