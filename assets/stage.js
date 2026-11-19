// The main stage draws only what this person's own panel sends it.
(function () {
  const params = new URLSearchParams(location.search);
  const HARNESS = params.get('harness') === '1';
  const DIAG = params.get('diag') === '1';
  const root = document.getElementById('root');
  const diagEl = document.getElementById('diag');
  let lastView = null;
  let lastMsgAt = null;

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function msg(text) {
    root.replaceChildren(el('div', 'stage-msg', text));
  }

  function renderApplicant(v) {
    const a = v.applicant;
    const wrap = el('div', 'stage-view');
    const head = el('div', 'app-head');
    head.append(el('h1', 'app-name', a.name || a.id));
    head.append(el('span', 'app-id', a.id));
    if (v.tab) head.append(el('span', 'app-tab', v.tab));
    if (v.position) head.append(el('span', 'app-pos', v.position.n + ' of ' + v.position.total));
    wrap.append(head);

    const links = el('div', 'links');
    for (const l of ACR.buildLinks(a.id, a.pk)) {
      if (l.url) {
        const link = el('a', 'link-btn', l.label);
        link.href = l.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.referrerPolicy = 'no-referrer';
        links.append(link);
      } else {
        links.append(el('span', 'link-btn bad', l.label + ': ' + l.error));
      }
    }
    wrap.append(links);

    const groups = el('div', 'groups');
    for (const g of a.groups) {
      const box = el('section', 'group g-' + g.title.toLowerCase().replace(/\W+/g, '-') + (g.title === 'Notes' ? ' notes' : ''));
      box.append(el('h2', null, g.title));
      const dl = el('dl');
      for (const f of g.fields) { dl.append(el('dt', null, f.label), el('dd', null, f.value)); }
      box.append(dl);
      groups.append(box);
    }
    wrap.append(groups);

    if (v.votes) wrap.append(renderVotes(v.votes));
    if (v.recorded) wrap.append(el('div', 'recorded c-' + v.recorded, 'Recorded: ' + v.recorded));
    else if (a.decisionCell && !v.votes) wrap.append(el('div', 'recorded muted', 'In the sheet: ' + a.decisionCell + (a.decision ? ' (' + a.decision + ')' : '')));
    root.replaceChildren(wrap);
  }

  function renderVotes(vs) {
    const box = el('section', 'votes');
    if (!vs.revealed) {
      box.append(el('div', 'votes-line', vs.voters.length + ' of ' + vs.total + ' have voted'));
      const row = el('div', 'voters');
      for (const n of vs.voters) row.append(el('span', 'chip', n));
      if (vs.voters.length) box.append(row);
    } else {
      const counts = el('div', 'counts');
      const t = ACR.tally(vs.revealed);
      for (const c of ACR.VOTES) counts.append(el('span', 'c-' + c, c + ' ' + t[c]));
      box.append(counts);
      const row = el('div', 'voters');
      for (const r of vs.revealed) {
        const chip = el('span', 'chip', r.name + ' ');
        chip.append(el('b', 'c-' + r.choice, r.choice));
        row.append(chip);
      }
      box.append(row);
    }
    return box;
  }

  function render(v) {
    lastView = v;
    root.style.zoom = '';
    switch (v && v.type) {
      case 'applicant': renderApplicant(v); break;
      case 'noaccess': msg("This review's spreadsheet isn't shared with you."); break;
      case 'signin': msg('Sign in from the side panel to see the review.'); break;
      case 'waiting': msg('Waiting for the chair to start the review.'); break;
      case 'done': msg('Every applicant on this tab has a decision.'); break;
      case 'error': msg('Something went wrong: ' + v.message); break;
      default: msg('Joining the review…');
    }
    fit();
    updateDiag();
  }

  function fit() {
    const view = root.firstElementChild;
    if (!view || view.classList.contains('stage-msg')) return;
    const avail = window.innerHeight - (DIAG ? 40 : 0);
    root.style.zoom = '1';
    const h = view.getBoundingClientRect().height;
    const z = h > avail ? Math.max(0.45, avail / h) : 1;
    root.style.zoom = String(z);
  }

  function updateDiag() {
    if (!DIAG) return;
    diagEl.hidden = false;
    diagEl.textContent = 'v' + ACR_CONFIG.version + ' view=' + (lastView ? lastView.type : 'none') +
      ' lastMsg=' + (lastMsgAt ? Math.round((Date.now() - lastMsgAt) / 1000) + 's ago' : 'never') +
      ' zoom=' + (root.style.zoom || '1');
  }

  function onMessage(text) {
    lastMsgAt = Date.now();
    try { render(JSON.parse(text)); } catch (e) { render({ type: 'error', message: 'Bad message from panel' }); }
  }

  window.addEventListener('resize', () => { if (lastView) render(lastView); });
  window.ACR_STAGE = { render, onMessage };

  if (HARNESS) {
    window.addEventListener('message', e => { if (e.source === window.parent) onMessage(e.data); });
    if (params.get('mock') === '1') harnessMock();
    return;
  }

  // Inside the panel (an iframe of this page) the panel posts messages directly.
  if (window.parent !== window && params.get('inpanel') === '1') {
    window.addEventListener('message', e => {
      if (e.source === window.parent && e.origin === location.origin) onMessage(e.data);
    });
    return;
  }

  const s = document.createElement('script');
  s.src = 'https://www.gstatic.com/meetjs/addons/1.2.0/meet.addons.js';
  s.onload = async () => {
    try {
      const session = await meet.addon.createAddonSession({ cloudProjectNumber: ACR_CONFIG.cloudProjectNumber });
      const client = await session.createMainStageClient();
      client.on('frameToFrameMessage', m => onMessage(m.payload));
      client.notifySidePanel(JSON.stringify({ type: 'stage-ready' }));
    } catch (e) {
      render({ type: 'error', message: e.message || String(e) });
    }
  };
  s.onerror = () => render({ type: 'error', message: "Meet's add-on script did not load" });
  document.head.append(s);

  function harnessMock() {
    const sc = document.createElement('script');
    sc.src = '../../assets/mock.js?v=' + ACR_CONFIG.version;
    sc.onload = () => {
      const rows = ACR_MOCK.tabs['Early Action'];
      const headers = rows[0];
      const i = Number(params.get('row') || 1);
      const a = ACR.buildApplicant(headers, rows[i]);
      const state = params.get('votes');
      const v = { type: 'applicant', applicant: a, tab: 'Early Action', position: { n: i, total: rows.length - 1 } };
      const names = ['Test Chair', 'Test Member A', 'Test Member B', 'Test Member C', 'Test Member D'];
      const choices = ['Admit', 'Waitlist', 'Admit', 'Discuss', 'Reject'];
      if (state === 'hidden') v.votes = { total: 5, voters: names.slice(0, 3) };
      if (state === 'revealed' || state === 'recorded') v.votes = { total: 5, voters: names, revealed: names.map((n, k) => ({ name: n, choice: choices[k] })) };
      if (state === 'recorded') v.recorded = 'Admit';
      render(v);
    };
    document.head.append(sc);
  }
})();
