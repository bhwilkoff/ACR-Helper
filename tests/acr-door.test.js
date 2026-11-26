const test = require('node:test');
const assert = require('node:assert');
const { openDoor } = require('../assets/acr-door.js');

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
const drain = async doors => { for (let i = 0; i < 20; i++) { await new Promise(r => setImmediate(r)); await Promise.all(doors.map(d => d.settle())); } };

async function pair(code = 'abc-defg-hij', code2 = code) {
  const b = bus();
  const chair = await openDoor({ sheetId: 'SHEET', meetingCode: code, transportFor: () => b.endpoint() });
  const guest = await openDoor({ sheetId: 'SHEET', meetingCode: code2, transportFor: () => b.endpoint() });
  return { b, chair, guest };
}

test('an ask reaches the person with access; sharing tells the asker', async () => {
  const { chair, guest } = await pair();
  chair.setRunning({ name: 'Test Chair' });
  guest.ask({ name: 'Test Guest', email: 'guest@example.invalid' });
  await drain([chair, guest]);
  assert.deepStrictEqual(chair.pending().map(a => [a.email, a.state]), [['guest@example.invalid', 'asked']]);
  assert.strictEqual(guest.chair.name, 'Test Chair');
  await chair.answer('guest@example.invalid', true, 'Test Chair');
  await drain([chair, guest]);
  assert.strictEqual(guest.granted, true);
  assert.strictEqual(guest.asking.by, 'Test Chair');
  guest.close();
});

test('the relay sees no names or emails', async () => {
  const { b, chair, guest } = await pair();
  guest.ask({ name: 'Test Guest', email: 'guest@example.invalid' });
  await drain([chair, guest]);
  await chair.answer('guest@example.invalid', false);
  await drain([chair, guest]);
  assert.ok(b.wire.length >= 2);
  for (const w of b.wire) assert.ok(!/guest|Test/i.test(w), w);
  assert.strictEqual(guest.granted, false);
  assert.strictEqual(guest.asking.answer, 'declined');
  guest.close();
});

test('a door in another meeting cannot read the ask', async () => {
  const { chair, guest } = await pair('abc-defg-hij', 'zzz-zzzz-zzz');
  guest.ask({ name: 'Test Guest', email: 'guest@example.invalid' });
  await drain([chair, guest]);
  assert.strictEqual(chair.pending().length, 0);
  guest.close();
});

test('a repeated ask is shown once; a new ask after Not now is shown again', async () => {
  const { chair, guest } = await pair();
  const me = { name: 'Test Guest', email: 'guest@example.invalid' };
  guest.ask(me);
  await drain([chair, guest]);
  await chair.answer(me.email, false);
  await drain([chair, guest]);
  assert.strictEqual(chair.pending().length, 0);
  guest.ask(me);
  await drain([chair, guest]);
  assert.strictEqual(chair.pending().length, 1);
  guest.close();
});
