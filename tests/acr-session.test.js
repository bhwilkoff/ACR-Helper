const test = require('node:test');
const assert = require('node:assert');
const C = require('../assets/acr-crypto.js');
const { Session } = require('../assets/acr-session.js');

function bus() {
  const subs = [];
  const wire = [];
  return {
    wire,
    endpoint() {
      const me = { cb: null };
      subs.push(me);
      return {
        send(text) { wire.push(text); for (const s of subs) if (s !== me && s.cb) setImmediate(() => s.cb(text)); },
        subscribe(cb) { me.cb = cb; },
      };
    },
  };
}

async function drain(sessions) {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setImmediate(r));
    await Promise.all(sessions.map(s => s.settle()));
  }
}

async function room(n, opts = {}) {
  const keyB64 = C.newGroupKey();
  const groupKey = await C.importGroupKey(keyB64);
  const channel = await C.channelName(keyB64, 'abc-defg-hij');
  const b = bus();
  const people = [];
  for (let i = 0; i < n; i++) {
    const me = { name: i === 0 ? 'Test Chair' : 'Test Member ' + i, email: `t${i}@example.invalid` };
    people.push(new Session({ me, groupKey, channel, transport: b.endpoint(), now: opts.now }));
  }
  return { b, people, groupKey, channel, keyB64 };
}

const APP = { tab: 'Early Action', sheetRow: 4, n: 4, total: 12 };

test('group envelope round-trips and is bound to key and channel', async () => {
  const k = await C.importGroupKey(C.newGroupKey());
  const k2 = await C.importGroupKey(C.newGroupKey());
  const box = await C.seal(k, { a: 1 }, 'acr-x');
  assert.deepStrictEqual(await C.open(k, box, 'acr-x'), { a: 1 });
  await assert.rejects(C.open(k, box, 'acr-y'));
  await assert.rejects(C.open(k2, box, 'acr-x'));
});

test('channel name depends on key and meeting, never shows either', async () => {
  const key = C.newGroupKey();
  const a = await C.channelName(key, 'abc-defg-hij');
  assert.notStrictEqual(a, await C.channelName(key, 'zzz-zzzz-zzz'));
  assert.notStrictEqual(a, await C.channelName(C.newGroupKey(), 'abc-defg-hij'));
  assert.ok(!a.includes('abc'));
  assert.match(a, /^acr-[0-9a-f]{32}$/);
});

test('a sealed vote opens only with the chair key', async () => {
  const chair = await C.newChairKeys();
  const other = await C.newChairKeys();
  const s = await C.sealVote(chair.publicJwk, { choice: 'Admit' }, 'sid|r1');
  assert.deepStrictEqual(await C.openVote(chair.privateKey, s, 'sid|r1'), { choice: 'Admit' });
  await assert.rejects(C.openVote(other.privateKey, s, 'sid|r1'));
  await assert.rejects(C.openVote(chair.privateKey, s, 'sid|r2'));
});

test('a bad group key is refused', async () => {
  await assert.rejects(C.importGroupKey(btoa('short')));
});

test('votes stay hidden until reveal; the wire carries no names or choices', async () => {
  const { b, people } = await room(3);
  const [chair, m1, m2] = people;
  await chair.start(APP);
  await m1.join(); await m2.join();
  await drain(people);
  assert.strictEqual(m1.view().n, 4);
  await m1.vote('Admit'); await m2.vote('Reject'); await chair.vote('Waitlist');
  await drain(people);
  for (const p of people) {
    const v = p.view();
    assert.deepStrictEqual(v.voters, ['Test Chair', 'Test Member 1', 'Test Member 2']);
    assert.strictEqual(v.revealed, null);
    assert.strictEqual(v.present, 3);
  }
  for (const w of b.wire) assert.ok(!/Admit|Reject|Waitlist|Test Member|Early Action|example\.invalid/.test(w), 'plaintext on the wire');
  await chair.reveal();
  await drain(people);
  assert.deepStrictEqual(m2.view().revealed, [
    { name: 'Test Chair', choice: 'Waitlist' },
    { name: 'Test Member 1', choice: 'Admit' },
    { name: 'Test Member 2', choice: 'Reject' },
  ]);
});

test('a member who changes their vote counts once, with the last choice', async () => {
  const { people } = await room(2);
  const [chair, m1] = people;
  await chair.start(APP); await m1.join(); await drain(people);
  await m1.vote('Admit'); await drain(people);
  await m1.vote('Discuss'); await drain(people);
  await chair.reveal(); await drain(people);
  assert.deepStrictEqual(m1.view().revealed, [{ name: 'Test Member 1', choice: 'Discuss' }]);
});

test('moving on or voting again clears votes; a stale vote is ignored', async () => {
  const { people, b } = await room(2);
  const [chair, m1] = people;
  await chair.start(APP); await m1.join(); await drain(people);
  await m1.vote('Admit'); await drain(people);
  const staleVote = b.wire[b.wire.length - 2];
  await chair.goTo({ tab: 'Early Action', sheetRow: 5, n: 5, total: 12 });
  await drain(people);
  assert.strictEqual(m1.view().myVote, null);
  assert.deepStrictEqual(m1.view().voters, []);
  chair.transport.send; // replay the old round's vote into the chair
  await chair._receive(staleVote);
  assert.deepStrictEqual(chair.view().voters, []);
  await m1.vote('Reject'); await drain(people);
  await chair.voteAgain(); await drain(people);
  assert.deepStrictEqual(m1.view().voters, []);
});

test('a late joiner catches up', async () => {
  const { people } = await room(3);
  const [chair, m1, late] = people;
  await chair.start(APP); await m1.join(); await drain(people);
  await chair.goTo({ tab: 'Early Action', sheetRow: 9, n: 9, total: 12 }); await drain(people);
  await late.join(); await drain(people);
  assert.strictEqual(late.view().n, 9);
});

test('someone without the group key reads nothing', async () => {
  const { people, b, channel } = await room(2);
  const outsiderKey = await C.importGroupKey(C.newGroupKey());
  const outsider = new Session({ me: { name: 'X', email: 'x@example.invalid' }, groupKey: outsiderKey, channel, transport: b.endpoint() });
  await people[0].start(APP); await drain([...people, outsider]);
  assert.strictEqual(outsider.view(), null);
});

test('only the chair can reveal, move, or record', async () => {
  const { people } = await room(2);
  await people[0].start(APP); await people[1].join(); await drain(people);
  await assert.rejects(people[1].reveal());
  await assert.rejects(people[1].goTo(APP));
  await assert.rejects(people[1].recorded('Admit'));
});

test('presence counts people seen in the last 45 seconds', async () => {
  let t = 1000;
  const { people } = await room(3, { now: () => t });
  const [chair, m1, m2] = people;
  await chair.start(APP); await m1.join(); await m2.join(); await drain(people);
  assert.strictEqual(m1.view().present, 3);
  t += 50000;
  await m1.heartbeat(); await drain(people);
  await chair.heartbeat(); await drain(people);
  assert.strictEqual(m1.view().present, 2);
});

test('members who opened before the chair started are counted', async () => {
  const { people } = await room(3);
  const [chair, m1, m2] = people;
  await m1.join(); await m2.join(); await drain(people);
  await chair.start(APP); await drain(people);
  assert.strictEqual(m1.view().present, 3);
});
