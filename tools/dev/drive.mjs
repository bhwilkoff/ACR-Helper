// Drives the dev harness in headless Chrome: runs steps (JS evaluated in the
// top page, which can reach both same-origin frames) and screenshots each.
// Usage: node tools/dev/drive.mjs OUTDIR steps.json
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const [out, stepsFile] = process.argv.slice(2);
const steps = JSON.parse(readFileSync(stepsFile, 'utf8'));
mkdirSync(out, { recursive: true });
const root = new URL('../..', import.meta.url).pathname;
const srv = spawn('python3', ['-m', 'http.server', '8766'], { cwd: root, stdio: 'ignore' });
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=9333',
  '--user-data-dir=' + out + '/profile', '--window-size=' + (steps.size || '1830,600'), 'about:blank'], { stdio: 'ignore' });
const done = code => { chrome.kill(); srv.kill(); process.exit(code); };
try {
  let targets;
  for (let i = 0; i < 40 && !targets; i++) {
    await sleep(500);
    try { targets = await (await fetch('http://127.0.0.1:9333/json')).json(); } catch (_) {}
  }
  if (!targets) throw new Error('Chrome did not open its debugging port');
  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  if (steps.size) {
    const [w, h] = steps.size.split(',').map(Number);
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  }
  await send('Page.navigate', { url: 'http://localhost:8766' + (steps.path || '/tools/dev/') + (steps.query || '') });
  await sleep(2000);
  const results = [];
  for (const [n, s] of steps.steps.entries()) {
    if (s.js) {
      const r = await send('Runtime.evaluate', { expression: '(async () => {' + s.js + '})()', awaitPromise: true, returnByValue: true });
      results.push({ step: n, value: r.result?.result?.value, error: r.result?.exceptionDetails?.exception?.description });
    }
    await sleep(s.wait || 800);
    if (s.shot) {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(`${out}/${s.shot}.png`, Buffer.from(r.result.data, 'base64'));
      results.push({ step: n, shot: `${out}/${s.shot}.png` });
    }
  }
  console.log(JSON.stringify(results, null, 1));
  done(0);
} catch (e) { console.error(e); done(1); }
