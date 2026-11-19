// The side panel: one per person. Reads the sheet with this person's own token
// and tells this person's own stage what to draw.
(function () {
  const params = new URLSearchParams(location.search);
  const MOCK = params.get('mock') === '1';
  const HARNESS = params.get('harness') === '1';
  const DIAG = params.get('diag') === '1';
  const $main = document.getElementById('main');
  const $foot = document.getElementById('foot');
  const $sub = document.getElementById('sub');
  const $diag = document.getElementById('diag');

  const S = {
    client: null, activity: false, user: null,
    sheet: null, tab: null, sheetTabId: null, headers: [], headerRow: 0, rows: [], cur: -1,
    role: null, lastError: null,
  };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function button(text, cls, onClick) {
    const b = el('button', 'btn' + (cls ? ' ' + cls : ''), text);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }
  function show(nodes, footNodes) {
    $main.replaceChildren(...nodes);
    $foot.replaceChildren(...(footNodes || []));
    $foot.hidden = !(footNodes && footNodes.length);
    diag();
  }

  // ---- stage messages ----
  function sendStage(view) {
    const text = JSON.stringify(view);
    if (HARNESS) { window.parent.postMessage({ to: 'stage', data: text }, location.origin); return; }
    if (S.client && S.activity) {
      try { S.client.notifyMainStage(text); } catch (e) { S.lastError = e.message; }
    }
  }

  // ---- views ----
  function viewError(message) {
    S.lastError = message;
    show([el('p', 'error', 'Something went wrong: ' + message)], [button('Try again', '', boot)]);
    sendStage({ type: 'error', message });
  }

  function viewNoAccess() {
    show([el('p', null, "This review's spreadsheet isn't shared with you."),
      el('p', 'muted', 'Ask the committee chair to share it with your Google account.')]);
    sendStage({ type: 'noaccess' });
  }

  function viewSignIn() {
    show([el('p', 'muted', 'Sign in with the Google account the review spreadsheet is shared with.')],
      [button('Sign in with Google', 'filled', signIn)]);
    sendStage({ type: 'signin' });
  }

  function viewPickTab() {
    const tabs = S.sheet.tabs;
    const sel = el('select');
    sel.id = 'tab';
    for (const t of tabs) { const o = el('option', null, t.title); o.value = t.title; sel.append(o); }
    const field = el('label', 'field');
    field.append(el('span', null, 'Tab to review'), sel);
    show([el('p', null, S.sheet.title), field,
      el('p', 'muted', 'Starting makes you chair: everyone who joins sees the applicant you choose.')],
      [button('Start review', 'filled', () => startReview(sel.value))]);
  }

  function currentView() {
    const r = S.rows[S.cur];
    if (!r) return { type: 'done' };
    const a = ACR.buildApplicant(S.headers, r.r);
    return { type: 'applicant', applicant: a, tab: S.tab, position: { n: S.cur + 1, total: S.rows.length } };
  }

  function viewReview() {
    const v = currentView();
    sendStage(v);
    if (v.type === 'done') {
      show([el('p', null, 'Every applicant on this tab has a decision.')], chairControls());
      return;
    }
    const a = v.applicant;
    const head = el('div', 'compact');
    head.append(el('h2', 'app-name', a.name || a.id), el('div', 'muted', a.id + ' · ' + v.position.n + ' of ' + v.position.total));
    const links = el('div', 'links');
    for (const l of ACR.buildLinks(a.id, a.pk)) {
      if (!l.url) { links.append(el('span', 'link-btn bad', l.label)); continue; }
      const link = el('a', 'link-btn', l.label);
      link.href = l.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer';
      links.append(link);
    }
    const nodes = [head, links];
    if (a.decisionCell) nodes.push(el('p', 'muted', 'In the sheet: ' + a.decisionCell + (a.decision ? ' (' + a.decision + ')' : '')));
    show(nodes, chairControls());
  }

  function chairControls() {
    if (S.role !== 'chair') return [];
    const prev = button('Previous', '', () => go(S.cur - 1));
    prev.disabled = S.cur <= 0;
    const next = button('Next', '', () => go(S.cur + 1));
    next.disabled = S.cur >= S.rows.length - 1;
    return [prev, next];
  }

  function go(i) {
    S.cur = Math.max(0, Math.min(S.rows.length - 1, i));
    viewReview();
  }

  // ---- data ----
  async function loadTab(title) {
    const values = await API.getValues(ACR_CONFIG.spreadsheetId, ACR.quoteTab(title));
    const h = ACR.findHeaderRow(values);
    if (h < 0) throw new Error('No "Unique ID" column on ' + title);
    S.tab = title;
    S.headerRow = h;
    S.headers = values[h];
    S.sheetTabId = (S.sheet.tabs.find(t => t.title === title) || {}).sheetId;
    S.rows = ACR.applicantRows(values.slice(h + 1), S.headers).map(x => ({ r: x.r, sheetRow: h + 1 + x.i }));
  }

  async function startReview(title) {
    show([el('p', 'muted', 'Loading ' + title + '…')]);
    try {
      await loadTab(title);
      S.role = 'chair';
      if (S.client && !S.activity) {
        try {
          await S.client.startActivity({
            mainStageUrl: new URL('stage/', location.href).href,
            sidePanelUrl: location.href.split('?')[0],
          });
          S.activity = true;
        } catch (e) {
          S.lastError = e.message;
          if (/Policy/i.test(String(e.message))) throw new Error("The call's host settings don't allow add-on activities");
        }
      }
      const first = ACR.nextUndecided(S.rows.map(x => x.r), S.headers, 0);
      S.cur = first < 0 ? S.rows.length : first;
      viewReview();
    } catch (e) {
      viewError(e.message);
    }
  }

  async function checkAccess() {
    try {
      S.sheet = await API.getSpreadsheet(ACR_CONFIG.spreadsheetId);
    } catch (e) {
      if (e.status === 403 || e.status === 404) { viewNoAccess(); return false; }
      throw e;
    }
    $sub.textContent = S.sheet.title;
    return true;
  }

  async function signIn() {
    viewError('Google sign-in is not set up yet (needs the OAuth client ID).');
  }

  function diag() {
    if (!DIAG) return;
    $diag.hidden = false;
    $diag.textContent = 'v' + ACR_CONFIG.version + (MOCK ? ' MOCK' : '') + ' role=' + (S.role || '-') +
      ' activity=' + S.activity + ' tab=' + (S.tab || '-') + ' row=' + S.cur + '/' + S.rows.length +
      (S.headers.length ? ' missing=' + ACR.buildApplicant(S.headers, []).missing.length : '') +
      (S.lastError ? '\nlast error: ' + S.lastError : '');
  }

  async function boot() {
    try {
      if (MOCK) {
        await loadScript('../assets/mock.js?v=' + ACR_CONFIG.version);
        API.useMock(window.ACR_MOCK);
      }
      if (!HARNESS) await connectMeet();
      if (!MOCK) { viewSignIn(); return; }
      if (await checkAccess()) viewPickTab();
    } catch (e) {
      viewError(e.message || String(e));
    }
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src));
      document.head.append(s);
    });
  }

  async function connectMeet() {
    try {
      await loadScript('https://www.gstatic.com/meetjs/addons/1.2.0/meet.addons.js');
      const session = await meet.addon.createAddonSession({ cloudProjectNumber: ACR_CONFIG.cloudProjectNumber });
      S.client = await session.createSidePanelClient();
      S.client.on('frameToFrameMessage', m => {
        try { const msg = JSON.parse(m.payload); if (msg.type === 'stage-ready' && S.role) viewReview(); } catch (_) {}
      });
      try { const st = await S.client.getActivityStartingState(); S.activity = !!st; } catch (_) {}
    } catch (e) {
      S.lastError = 'Meet: ' + (e.message || e);
    }
  }

  window.ACR_PANEL = { S };
  boot();
})();
