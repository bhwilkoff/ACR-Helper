// The side panel: one per person. Reads the sheet with this person's own token,
// joins the call's encrypted review session, and tells this person's own stage
// what to draw.
(function () {
  const params = new URLSearchParams(location.search);
  const MOCK = params.get('mock') === '1';
  const HARNESS = params.get('harness') === '1';
  const DIAG = params.get('diag') === '1';
  const $main = document.getElementById('main');
  const $foot = document.getElementById('foot');
  const $sub = document.getElementById('sub');
  const $diag = document.getElementById('diag');
  const SID = ACR_CONFIG.spreadsheetId;
  const DRIVE_FILE = 'https://www.googleapis.com/auth/drive.file';

  const S = {
    client: null, activity: false, me: null, meetingCode: null,
    sheet: null, tab: null, sheetTabId: null, headers: [], rows: [],
    session: null, sv: null, pick: null, confirm: null, busy: false, lastError: null, picked: false,
  };

  // ---------- small DOM helpers ----------
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function button(text, cls, onClick) {
    const b = el('button', 'btn' + (cls ? ' ' + cls : ''), text);
    b.type = 'button';
    b.disabled = S.busy;
    b.addEventListener('click', onClick);
    return b;
  }
  function linkRow(a) {
    const links = el('div', 'links');
    for (const l of ACR.buildLinks(a.id, a.pk)) {
      if (!l.url) { links.append(el('span', 'link-btn bad', l.label)); continue; }
      const link = el('a', 'link-btn', l.label);
      link.href = l.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer';
      links.append(link);
    }
    return links;
  }
  function show(nodes, footNodes) {
    if (S.expiring) {
      const warn = el('p', 'error', 'Your Google sign-in ends in a few minutes. ');
      const b = el('button', 'btn small', 'Stay signed in');
      b.type = 'button';
      b.addEventListener('click', () => signIn(true));
      warn.append(b);
      nodes = [warn].concat(nodes);
    }
    const notesBox = document.getElementById('notes');
    if (notesBox) notesBox.hidden = true;
    $main.replaceChildren(...nodes);
    $foot.replaceChildren(...(footNodes || []));
    $foot.hidden = !(footNodes && footNodes.length);
    diag();
  }

  // ---------- stage ----------
  function sendStage(view) {
    const text = JSON.stringify(view);
    if (HARNESS) { window.parent.postMessage({ to: 'stage', data: text }, location.origin); return; }
    // Meet's answer about a running activity is not trusted; a panel opened by
    // an activity has a stage, and notifying one that has none does no harm.
    if (S.client) {
      try { Promise.resolve(S.client.notifyMainStage(text)).catch(e => { S.lastError = 'stage: ' + (e.message || e); }); }
      catch (e) { S.lastError = 'stage: ' + e.message; }
    }
  }

  // ---------- plain views ----------
  function viewError(message) {
    S.lastError = message;
    show([el('p', 'error', 'Something went wrong: ' + message)], [button('Try again', '', boot)]);
    sendStage({ type: 'error', message });
  }
  // drive.file (Google's verification review, 2026-11-23): the token opens only
  // files this person has chosen for ACR Helper, so until then the sheet reads
  // as 404 exactly like an unshared one. Google's picker, pre-pointed at the
  // sheet, is the one-time choice; it lists the sheet only if it is shared with
  // them, so the sheet's sharing still decides. Measured 2026-11-23: 404 before
  // the pick, 200 after, no API key needed.
  function viewPick() {
    show([el('p', null, 'Choose the review spreadsheet to let ACR Helper open it.'),
      el('p', 'muted', 'Google asks once. Select the spreadsheet, then press Select.')],
    [button('Choose the spreadsheet', 'filled', openPicker)]);
    sendStage({ type: 'signin' });
  }
  function openPicker() {
    const w = window.open(new URL('pick/?v=' + ACR_CONFIG.version, location.href).href, 'acr-pick', 'popup,width=760,height=560');
    if (!w) return viewError('The file picker window was blocked. Allow pop-ups for Meet and try again.');
    let done = false;
    const onMsg = e => {
      if (e.origin !== location.origin || e.source !== w || !e.data || !e.data.acrPick) return;
      const m = e.data.acrPick;
      if (m === 'ready') { w.postMessage({ acrPickToken: API.getToken() }, location.origin); return; }
      if (done) return;
      done = true;
      window.removeEventListener('message', onMsg);
      if (m === 'picked') { S.picked = true; afterSignIn(); } else viewPick();
    };
    window.addEventListener('message', onMsg);
    show([el('p', 'muted', 'Choose the spreadsheet in the window that opened.')],
      [button('Open it again', '', openPicker)]);
  }
  function viewNoAccess() {
    show([el('p', null, "This review's spreadsheet isn't shared with you."),
      el('p', 'muted', 'Ask the committee chair to share it with your Google account.')]);
    sendStage({ type: 'noaccess' });
  }
  function viewSignIn() {
    show([el('p', 'muted', 'Sign in with the Google account the review spreadsheet is shared with.')],
      [button('Sign in with Google', 'filled', () => signIn(false))]);
    sendStage({ type: 'signin' });
    oneTap();
  }

  // Google's One Tap prompt, inside the panel (Meet's review asks for it when
  // someone is not signed in). It only says who the person is; the Sheets
  // permission still comes from the token client, now told which account.
  let oneTapShown = false;
  function oneTap() {
    if (oneTapShown || MOCK || HARNESS || !ACR_CONFIG.oauthClientId) return;
    const id = window.google && google.accounts && google.accounts.id;
    if (!id) { setTimeout(oneTap, 500); return; }
    oneTapShown = true;
    id.initialize({
      client_id: ACR_CONFIG.oauthClientId,
      auto_select: true,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: true,
      callback: r => {
        const email = emailFromCredential(r && r.credential);
        if (!email) return;
        try { localStorage.setItem('acr-hint', email); } catch (_) {}
        show([el('p', null, 'Signed in to Google as ' + email + '.')],
          [button('Open the review', 'filled', () => signIn(false))]);
      },
    });
    id.prompt(n => {
      if (n && n.isNotDisplayed && n.isNotDisplayed()) S.lastError = 'One Tap not shown: ' + n.getNotDisplayedReason();
      else if (n && n.isSkippedMoment && n.isSkippedMoment()) S.lastError = 'One Tap skipped: ' + n.getSkippedReason();
      diag();
    });
  }

  function emailFromCredential(jwt) {
    try {
      const part = String(jwt).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = JSON.parse(decodeURIComponent(escape(atob(part + '==='.slice((part.length + 3) % 4)))));
      return json.email_verified !== false ? String(json.email || '') : '';
    } catch (_) { return ''; }
  }
  function viewLobby() {
    const sel = el('select');
    for (const t of S.sheet.tabs) {
      if (t.title === '_acr') continue;
      const o = el('option', null, t.title); o.value = t.title; sel.append(o);
    }
    const field = el('label', 'field');
    field.append(el('span', null, 'Tab to review'), sel);
    show([el('p', 'muted', 'No review is running in this call yet.'), field,
      el('p', 'muted', 'Starting makes you chair: everyone who joins sees the applicant you choose.')],
      [button('Start review', 'filled', () => startReview(sel.value))]);
    sendStage({ type: 'waiting' });
  }

  // ---------- review ----------
  function rowIndexOf(sheetRow) { return S.rows.findIndex(x => x.sheetRow === sheetRow); }

  function stageView(sv, a) {
    return {
      type: 'applicant', applicant: a, tab: sv.tab, position: { n: sv.n, total: sv.total },
      votes: { total: sv.present, voters: sv.voters, revealed: sv.revealed },
      recorded: sv.recorded,
    };
  }

  async function render() {
    const sv = S.sv;
    if (!sv) return viewLobby();
    if (S.tab !== sv.tab) {
      show([el('p', 'muted', 'Loading ' + sv.tab + '…')]);
      try { await loadTab(sv.tab); } catch (e) { return viewError(e.message); }
      if (S.sv !== sv) return;
    }
    const i = rowIndexOf(sv.sheetRow);
    if (i < 0) {
      sendStage({ type: 'done' });
      return show([el('p', null, 'Every applicant on this tab has a decision.')], sv.isChair ? [button('Back to the first applicant', '', () => goTo(0))] : []);
    }
    if (sv.recorded) {
      const col = ACR.columnIndex(S.headers).get(ACR.headerKey(ACR.DECISION_COLUMN));
      if (col !== undefined) setCell(i, col, ACR.decisionToCell(sv.recorded));
    }
    const a = ACR.buildApplicant(S.headers, S.rows[i].r);
    sendStage(stageView(sv, a));
    if (S.confirm) return renderConfirm(a);

    const head = el('div', 'compact');
    head.append(el('h2', 'app-name', a.name || a.id), el('div', 'muted', a.id + ' · ' + sv.n + ' of ' + sv.total + ' · ' + sv.tab));
    const nodes = [head, linkRow(a)];

    if (sv.recorded) {
      nodes.push(el('p', 'recorded c-' + sv.recorded, 'Recorded: ' + sv.recorded));
    } else if (!sv.revealed) {
      const grid = el('div', 'vote-grid');
      for (const c of ACRSession.CHOICES) {
        const b = el('button', 'vote-btn c-' + c, c);
        b.type = 'button';
        b.setAttribute('aria-pressed', String(sv.myVote === c));
        b.addEventListener('click', () => act(() => S.session.vote(c)));
        grid.append(b);
      }
      nodes.push(grid);
      nodes.push(el('p', 'muted', sv.voters.length + ' of ' + sv.present + ' have voted' + (sv.myVote ? ' · you can change your vote until Reveal' : '')));
    } else {
      const t = ACR.tally(sv.revealed);
      const counts = el('div', 'counts');
      for (const c of ACRSession.CHOICES) counts.append(el('span', 'c-' + c, c + ' ' + t[c]));
      nodes.push(counts);
      const row = el('div', 'voters');
      for (const r of sv.revealed) { const chip = el('span', 'chip', r.name + ' '); chip.append(el('b', 'c-' + r.choice, r.choice)); row.append(chip); }
      nodes.push(row);
      if (!sv.isChair) nodes.push(el('p', 'muted', sv.chair.name + ' records the committee\'s decision.'));
    }
    if (a.decisionCell && !sv.recorded) nodes.push(el('p', 'muted', 'In the sheet: ' + a.decisionCell + (a.decision ? ' (' + a.decision + ')' : '')));
    if (!sv.isChair) nodes.push(el('p', 'muted', 'Chair: ' + sv.chair.name));
    show(nodes.concat(sv.isChair ? chairMain(sv).concat([noteTakerPicker(sv), goToRow(sv)]) : []), sv.isChair ? chairControls(sv, a, i) : []);
    updateNotes(sv, i);
  }

  function chairMain(sv) {
    if (!sv.revealed || sv.recorded) return [];
    S.pick = ACR.DECISIONS.includes(S.pick) ? S.pick : null;
    const grid = el('div', 'vote-grid three');
    for (const d of ACR.DECISIONS) {
      const b = el('button', 'vote-btn c-' + d, d);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(S.pick === d));
      b.addEventListener('click', () => { S.pick = d; render(); });
      grid.append(b);
    }
    return [el('h3', 'label', 'Committee decision'), grid];
  }

  // The chair alone, or one person the chair names, may add notes.
  function noteTakerPicker(sv) {
    const box = el('label', 'field');
    const sel = el('select');
    const me = el('option', null, 'Chair (me)'); me.value = ''; sel.append(me);
    for (const p of sv.people) {
      if (p.email === S.me.email) continue;
      const o = el('option', null, p.name); o.value = p.email; sel.append(o);
    }
    sel.value = sv.noteTaker ? sv.noteTaker.email : '';
    if (sv.noteTaker && sel.value !== sv.noteTaker.email) {
      const o = el('option', null, sv.noteTaker.name); o.value = sv.noteTaker.email; sel.append(o); sel.value = o.value;
    }
    sel.addEventListener('change', () => {
      const p = sv.people.find(x => x.email === sel.value);
      act(() => S.session.setNoteTaker(p || null));
    });
    box.append(el('span', 'label', 'Note-taker'), sel);
    return box;
  }

  // The notes box sits outside the redrawn area so typing survives redraws.
  const $notes = document.getElementById('notes');
  const $noteText = document.getElementById('note-text');
  const $noteAdd = document.getElementById('note-add');
  const $noteStatus = document.getElementById('note-status');
  const $noteForm = document.getElementById('note-form');
  const $noteOpen = document.getElementById('note-open');
  $noteOpen.addEventListener('click', () => {
    $noteForm.hidden = !$noteForm.hidden;
    $noteOpen.textContent = $noteForm.hidden ? 'Write a note' : 'Close';
    if (!$noteForm.hidden) $noteText.focus();
  });
  let notesFor = null;
  function updateNotes(sv, i) {
    const on = !!(sv && sv.canNote && !S.confirm && i >= 0);
    $notes.hidden = !on;
    const key = sv ? sv.tab + '|' + sv.sheetRow : null;
    if (key !== notesFor) {
      notesFor = key; $noteText.value = ''; $noteStatus.textContent = '';
      $noteForm.hidden = true; $noteOpen.textContent = 'Write a note';
    }
  }
  $noteAdd.addEventListener('click', async () => {
    const text = $noteText.value.trim();
    const sv = S.sv;
    if (!text || !sv) return;
    const col = ACR.columnIndex(S.headers).get(ACR.headerKey(ACR.NOTES_COLUMN));
    const i = rowIndexOf(sv.sheetRow);
    if (col === undefined) { $noteStatus.textContent = 'This tab has no "' + ACR.NOTES_COLUMN + '" column.'; return; }
    if (i < 0) return;
    $noteAdd.disabled = true;
    $noteStatus.textContent = 'Adding…';
    try {
      const current = await API.getCell(SID, S.tab, sv.sheetRow, col);
      const value = ACR.appendNote(current, text, S.me.name);
      await API.writeCell(SID, S.tab, S.sheetTabId, sv.sheetRow, col, value);
      setCell(i, col, value);
      $noteText.value = '';
      $noteStatus.textContent = 'Added.';
      await S.session.noted();
    } catch (e) {
      $noteStatus.textContent = e.status === 403 ? 'Your account can only view this spreadsheet, so it cannot add notes.' : 'Something went wrong: ' + e.message;
    } finally {
      $noteAdd.disabled = false;
    }
  });

  function goToRow(sv) {
    const box = el('div', 'goto');
    const input = el('input');
    input.type = 'number'; input.min = '1'; input.max = String(S.rows.length); input.placeholder = String(sv.n);
    input.setAttribute('aria-label', 'Applicant number');
    const go = button('Go', 'small', () => { const n = Number(input.value); if (n >= 1 && n <= S.rows.length) goTo(n - 1); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
    box.append(el('span', 'muted', 'Go to applicant'), input, go);
    return box;
  }

  function chairControls(sv, a, i) {
    let main;
    if (S.client && !S.activity) {
      const row = el('div', 'small-row');
      row.append(button('Open the main stage', 'small', async () => { await openStage(); render(); }));
      const out = [];
      if (S.stageError) out.push(el('p', 'error', 'The main stage did not open: ' + S.stageError));
      out.push(row);
      return out.concat(chairControlsInner(sv, a, i));
    }
    return chairControlsInner(sv, a, i);
  }

  function chairControlsInner(sv, a, i) {
    let main;
    const small = [];
    if (sv.recorded) {
      main = button('Next applicant', 'filled', () => goNextUndecided(i));
    } else if (!sv.revealed) {
      main = button('Reveal votes', 'filled', () => act(() => S.session.reveal()));
    } else {
      main = button(S.pick ? 'Record ' + S.pick : 'Pick the decision', 'filled', () => record(a, i));
      main.disabled = !S.pick || S.busy;
      small.push(button('Vote again', 'small', () => act(() => S.session.voteAgain())));
    }
    const prev = button('Previous', 'small', () => goTo(i - 1));
    prev.disabled = i <= 0 || S.busy;
    const next = button('Skip', 'small', () => goTo(i + 1));
    next.disabled = i >= S.rows.length - 1 || S.busy;
    small.push(prev, next);
    const row = el('div', 'small-row');
    row.append(...small);
    return [main, row];
  }

  function renderConfirm(a) {
    const c = S.confirm;
    show([el('p', null, 'The sheet changed since this applicant opened.'),
      el('p', null, 'It now says: ' + (c.current || '(empty)')),
      el('p', null, 'Replace it with ' + ACR.decisionToCell(c.decision) + ' (' + c.decision + ')?')],
    [button('Replace', 'filled', () => { const d = S.confirm; S.confirm = null; write(d.a, d.i, d.decision); }),
      button('Cancel', '', () => { S.confirm = null; render(); })]);
  }

  async function record(a, i) {
    const decision = S.pick;
    if (!decision) return;
    const col = ACR.columnIndex(S.headers).get(ACR.headerKey(ACR.DECISION_COLUMN));
    if (col === undefined) return viewError('This tab has no "' + ACR.DECISION_COLUMN + '" column');
    S.busy = true; render();
    try {
      const current = (await API.getCell(SID, S.tab, S.rows[i].sheetRow, col)).trim();
      S.busy = false;
      if (current !== a.decisionCell.trim()) { S.confirm = { a, i, decision, current }; return render(); }
      await write(a, i, decision);
    } catch (e) { S.busy = false; viewError(e.message); }
  }

  async function write(a, i, decision) {
    const col = ACR.columnIndex(S.headers).get(ACR.headerKey(ACR.DECISION_COLUMN));
    S.busy = true; render();
    try {
      const value = ACR.decisionToCell(decision);
      await API.writeCell(SID, S.tab, S.sheetTabId, S.rows[i].sheetRow, col, value, ACR.decisionNote(S.me.name));
      setCell(i, col, value);
      S.pick = null;
      S.busy = false;
      await S.session.recorded(decision);
    } catch (e) { S.busy = false; viewError(e.message); }
  }

  function setCell(i, col, value) {
    const r = S.rows[i].r;
    while (r.length <= col) r.push('');
    r[col] = value;
  }

  async function act(fn) {
    try { await fn(); } catch (e) { viewError(e.message); }
  }

  function applicantRef(i) {
    return { tab: S.tab, sheetRow: S.rows[i].sheetRow, n: i + 1, total: S.rows.length };
  }

  function goTo(i) {
    if (i < 0 || i >= S.rows.length) return;
    S.pick = null; S.confirm = null;
    act(() => S.session.goTo(applicantRef(i)));
  }

  function goNextUndecided(i) {
    const n = ACR.nextUndecided(S.rows.map(x => x.r), S.headers, i + 1);
    if (n < 0) { S.pick = null; act(() => S.session.goTo({ tab: S.tab, sheetRow: -1, n: S.rows.length, total: S.rows.length })); return; }
    goTo(n);
  }

  // ---------- data ----------
  async function loadTab(title) {
    const values = await API.getValues(SID, ACR.quoteTab(title));
    const h = ACR.findHeaderRow(values);
    if (h < 0) throw new Error('No "Unique ID" column on ' + title);
    S.tab = title;
    S.headers = values[h];
    S.sheetTabId = (S.sheet.tabs.find(t => t.title === title) || {}).sheetId;
    S.rows = ACR.applicantRows(values.slice(h + 1), S.headers).map(x => ({ r: x.r, sheetRow: h + 1 + x.i }));
  }

  // Opens the main stage for everyone (startActivity). Measured 2026-11-19:
  // trusting getActivityStartingState skipped this and no stage opened.
  async function openStage() {
    if (!S.client) return;
    try {
      await S.client.startActivity({
        mainStageUrl: new URL('stage/', location.href).href,
        sidePanelUrl: location.href.split('?')[0],
      });
      S.activity = true; S.stageError = null;
    } catch (e) {
      const m = String((e && e.message) || e);
      if (/ongoing/i.test(m)) { S.activity = true; S.stageError = null; return; }
      S.activity = false;
      S.stageError = /Policy/i.test(m) ? "The call's host settings don't allow add-on activities." : m;
    }
  }

  async function startReview(title) {
    show([el('p', 'muted', 'Loading ' + title + '…')]);
    try {
      await loadTab(title);
      await openStage();
      const first = ACR.nextUndecided(S.rows.map(x => x.r), S.headers, 0);
      const ref = first < 0 ? { tab: title, sheetRow: -1, n: S.rows.length, total: S.rows.length } : applicantRef(first);
      await S.session.start(ref);
    } catch (e) {
      viewError(e.message);
    }
  }

  async function checkAccess() {
    try {
      S.sheet = await API.getSpreadsheet(SID);
    } catch (e) {
      const kind = ACR.refusalKind(e.status, e.reason, e.message);
      if (kind === 'noaccess') { if (S.picked || MOCK) viewNoAccess(); else viewPick(); return false; }
      if (kind === 'scope') {
        show([el('p', null, 'ACR Helper needs permission to open the review spreadsheet.'),
          el('p', 'muted', 'Sign in again and allow access on Google\u2019s screen.')],
        [button('Sign in again', 'filled', () => signIn(false, true))]);
        return false;
      }
      throw e;
    }
    $sub.textContent = S.sheet.title;
    return true;
  }

  async function openSession() {
    let keyB64 = await API.getAcrKey(SID);
    if (!keyB64) {
      keyB64 = ACRCrypto.newGroupKey();
      try { await API.createAcrKey(SID, keyB64); } catch (e) {
        if (e.status === 403) throw new Error('A chair with edit access must open ACR Helper first, to set up the review');
        throw e;
      }
    }
    const groupKey = await ACRCrypto.importGroupKey(keyB64);
    const channel = await ACRCrypto.channelName(keyB64, S.meetingCode || 'no-meeting');
    const transport = ACRTransport.make(channel, { local: HARNESS || MOCK });
    S.transport = transport;
    S.session = new ACRSession.Session({
      me: S.me, groupKey, channel, transport,
      onChange: v => {
        if (S.sv && v && v.round !== S.sv.round) { S.pick = null; S.confirm = null; }
        const reread = S.sv && v && v.rowRev !== S.sv.rowRev && S.tab === v.tab;
        S.sv = v;
        if (reread) loadTab(v.tab).then(render, e => { S.lastError = e.message; render(); });
        else render();
      },
    });
    if (transport.onReconnect) transport.onReconnect(() => S.session.join().catch(() => {}));
    await S.session.join();
    setInterval(() => S.session.heartbeat().catch(() => {}), 15000);
  }

  // Sign-in (REQUIREMENTS R1-R3; Ben, 2026-11-19: everything from the sidebar).
  // Google's token client opens Google's own window straight from this press,
  // and closes it itself; after the first Allow it finishes without asking.
  // Google's sign-in page cannot be framed, so one Google window is the floor.
  // If that window is refused, fall back to the sign-in tab on our origin.
  let tokenClient = null;
  let pendingAgain = false;
  function initTokenClient() {
    if (tokenClient || !window.google || !google.accounts || !google.accounts.oauth2 || !ACR_CONFIG.oauthClientId) return tokenClient;
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: ACR_CONFIG.oauthClientId,
      scope: ACR_CONFIG.scopes,
      include_granted_scopes: false,
      prompt: '',
      callback: r => {
        if (r.error) return viewError('Sign-in did not finish: ' + r.error);
        if (!google.accounts.oauth2.hasGrantedAllScopes(r, DRIVE_FILE)) {
          show([el('p', null, 'ACR Helper needs permission to open the review spreadsheet.'),
            el('p', 'muted', 'Sign in again and allow access on Google\u2019s screen.')],
          [button('Sign in again', 'filled', () => signIn(false, true))]);
          return;
        }
        gotToken(r.access_token, Number(r.expires_in) || 3600, pendingAgain);
      },
      error_callback: e => {
        if (e && e.type === 'popup_failed_to_open') return signInTab(pendingAgain);
        if (e && e.type === 'popup_closed') return viewSignIn();
        viewError('Sign-in did not finish: ' + ((e && (e.type || e.message)) || 'unknown'));
      },
    });
    return tokenClient;
  }

  function signIn(again, consent) {
    if (!ACR_CONFIG.oauthClientId) return viewError('Google sign-in is not set up yet (needs the OAuth client ID).');
    pendingAgain = !!again;
    const c = initTokenClient();
    if (!c) return signInTab(again);
    // The last account used here is a per-person convenience (no sheet data),
    // so Google can skip its account chooser. Storage can be refused; that is fine.
    let hint = '';
    try { hint = localStorage.getItem('acr-hint') || ''; } catch (_) {}
    const opts = consent ? { prompt: 'consent' } : {};
    if (hint) opts.hint = hint;
    c.requestAccessToken(opts);
  }

  function gotToken(token, expiresIn, again) {
    API.setToken(token);
    S.tokenExpiresAt = Date.now() + expiresIn * 1000;
    S.expiring = false;
    if (again && S.session) return render();
    afterSignIn();
  }

  function signInTab(again) {
    const popup = window.open('signin/?v=' + ACR_CONFIG.version, 'acr-signin');
    if (!popup) return viewError('The sign-in window was blocked. Allow pop-ups for Meet and try again.');
    const onMsg = e => {
      if (e.origin !== location.origin || e.source !== popup || !e.data || !e.data.acrToken) return;
      window.removeEventListener('message', onMsg);
      gotToken(e.data.acrToken, e.data.expiresIn, again);
    };
    window.addEventListener('message', onMsg);
  }

  async function afterSignIn() {
    try {
      S.me = await API.getUserInfo();
      try { if (S.me && S.me.email) localStorage.setItem('acr-hint', S.me.email); } catch (_) {}
      if (!(await checkAccess())) return;
      if (!S.session) await openSession();
      setTimeout(() => { if (!S.sv) viewLobby(); }, 2500);
      show([el('p', 'muted', 'Looking for a review in this call…')]);
    } catch (e) {
      if (e.status === 401) return viewSignIn();
      viewError(e.message || String(e));
    }
  }

  setInterval(() => {
    if (!S.tokenExpiresAt || S.expiring) return;
    if (S.tokenExpiresAt - Date.now() < 5 * 60000) { S.expiring = true; render(); }
  }, 30000);

  function diag() {
    if (!DIAG) return;
    $diag.hidden = false;
    const sv = S.sv;
    $diag.textContent = 'v' + ACR_CONFIG.version + (MOCK ? ' MOCK' : '') + ' me=' + (S.me ? S.me.name : '-') +
      ' chair=' + (sv ? sv.isChair : '-') + ' activity=' + S.activity + ' tab=' + (S.tab || '-') +
      ' row=' + (sv ? sv.sheetRow : '-') + ' present=' + (sv ? sv.present : '-') +
      ' channel=' + (S.transport ? S.transport.kind + (S.transport.state ? ':' + S.transport.state : '') : '-') +
      (S.tokenExpiresAt ? ' token=' + Math.round((S.tokenExpiresAt - Date.now()) / 60000) + 'm' : '') +
      (S.session && S.session.lastError ? '\nsession: ' + S.session.lastError : '') +
      (S.lastError ? '\nlast error: ' + S.lastError : '');
  }

  // ---------- boot ----------
  async function boot() {
    try {
      if (MOCK) {
        await loadScript('../assets/mock.js?v=' + ACR_CONFIG.version);
        const who = params.get('as') || 'Test Chair';
        API.useMock(window.ACR_MOCK, { name: who, email: who.toLowerCase().replace(/\W+/g, '.') + '@example.invalid' });
      }
      if (!HARNESS) await connectMeet();
      if (!MOCK) { viewSignIn(); return; }
      await afterSignIn();
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
        try { const msg = JSON.parse(m.payload); if (msg.type === 'stage-ready') render(); } catch (_) {}
      });
      try { const info = await S.client.getMeetingInfo(); S.meetingCode = info.meetingCode || info.meetingId || null; } catch (_) {}
    } catch (e) {
      S.lastError = 'Meet: ' + (e.message || e);
    }
  }

  window.ACR_PANEL = { S, openPicker };
  boot();
})();
