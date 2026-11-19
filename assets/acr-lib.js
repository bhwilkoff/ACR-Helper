(function (root) {
  const STAGE_GROUPS = [
    { title: 'Profile', columns: ['First Name', 'Last Name', 'Has a Minerva Family Member', 'Citizenship Country', 'Intended Concentration'] },
    { title: 'Scores', columns: [
      'Math Score', 'Understanding Score', 'Reasoning Score', 'Creativity Score',
      'Average on first 4 challenges', 'Original Transcript Score', 'Four Point Transcript Score',
      'Written Score', 'Expression Score', 'Accomplishment 1', 'Accomplishment 2', 'Accomplishment 3',
      'Average Accomplishment score', 'Overall Score'] },
    { title: 'Financial aid', columns: [
      'FA App Status', 'Estimated FA Tier', 'FA Status', 'EFC', 'FA Tier',
      'Scholarship/Grant', 'Loan', 'WS'] },
    { title: 'Notes', columns: ['Notes from Admissions', 'Notes from Enrollment team', 'Notes from Financial Aid'] },
  ];

  const ID_COLUMN = 'Unique ID';
  const PK_COLUMN = 'User ID';
  const DECISION_COLUMN = 'App Review Committee recommends admit?';
  const NOTES_COLUMN = 'Notes from Admissions';
  const COUNTRY_COLUMN = 'Citizenship Country';

  const DECISIONS = ['Admit', 'Waitlist', 'Reject'];
  const VOTES = ['Admit', 'Waitlist', 'Reject', 'Discuss'];
  const DECISION_TO_CELL = { Admit: 'Yes', Waitlist: 'Maybe', Reject: 'No' };
  const CELL_TO_DECISION = { yes: 'Admit', maybe: 'Waitlist', no: 'Reject' };

  const ID_SHAPE = /^\d{4}-[A-Z]{4}-\d{4}$/;
  const PK_SHAPE = /^\d+$/;

  function isEmpty(v) {
    if (v === null || v === undefined) return true;
    const s = String(v).trim();
    return s === '' || s.toUpperCase() === 'NULL';
  }

  function headerKey(h) {
    return String(h || '').split('\n')[0].replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function headerLabel(h) {
    return String(h || '').split('\n')[0].replace(/\s+/g, ' ').trim();
  }

  function findHeaderRow(rows) {
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      if ((rows[i] || []).some(c => headerKey(c) === headerKey(ID_COLUMN))) return i;
    }
    return -1;
  }

  function columnIndex(headers) {
    const map = new Map();
    headers.forEach((h, i) => {
      const k = headerKey(h);
      if (k && !map.has(k)) map.set(k, i);
    });
    return map;
  }

  function cell(row, idx) {
    return idx === undefined ? '' : (row[idx] === undefined ? '' : String(row[idx]));
  }

  function buildApplicant(headers, row, groups) {
    groups = groups || STAGE_GROUPS;
    const idx = columnIndex(headers);
    const missing = [];
    const out = [];
    for (const g of groups) {
      const fields = [];
      for (const c of g.columns) {
        const i = idx.get(headerKey(c));
        if (i === undefined) { missing.push(c); continue; }
        const v = cell(row, i);
        if (isEmpty(v)) continue;
        const value = headerKey(c) === headerKey(COUNTRY_COLUMN) ? countryLabel(v) : v.trim();
        fields.push({ label: headerLabel(headers[i]), value });
      }
      if (fields.length) out.push({ title: g.title, fields });
    }
    const id = cell(row, idx.get(headerKey(ID_COLUMN))).trim();
    const pk = cell(row, idx.get(headerKey(PK_COLUMN))).trim();
    const first = cell(row, idx.get(headerKey('First Name'))).trim();
    const last = cell(row, idx.get(headerKey('Last Name'))).trim();
    const name = [first, last].filter(s => !isEmpty(s)).join(' ');
    const decisionCell = cell(row, idx.get(headerKey(DECISION_COLUMN))).trim();
    return { id, pk, name, groups: out, decisionCell, decision: cellToDecision(decisionCell), missing };
  }

  function buildLinks(id, pk) {
    const links = [];
    const idOk = ID_SHAPE.test(id || '');
    const pkOk = PK_SHAPE.test(pk || '');
    const e = encodeURIComponent;
    links.push(idOk
      ? { key: 'overview', label: 'Applicant overview', url: `https://www.minerva.edu/admin/application/applicantoverview/?q=${e(id)}&evaluation_ready_on=All&matriculation_date=All` }
      : { key: 'overview', label: 'Applicant overview', error: "Column A doesn't look like a Minerva ID" });
    links.push(pkOk
      ? { key: 'fast', label: 'Fast review', url: `https://www.minerva.edu/admin/applicants/${e(pk)}?pks=${e(pk)}` }
      : { key: 'fast', label: 'Fast review', error: "Column B doesn't look like an applicant number" });
    links.push(idOk
      ? { key: 'integrity', label: 'Integrity check', url: `https://www.minerva.edu/admin/integrity_check/?unique_id=${e(id)}` }
      : { key: 'integrity', label: 'Integrity check', error: "Column A doesn't look like a Minerva ID" });
    return links;
  }

  function decisionToCell(d) {
    if (!DECISION_TO_CELL[d]) throw new Error('Not a decision: ' + d);
    return DECISION_TO_CELL[d];
  }

  function cellToDecision(v) {
    return CELL_TO_DECISION[String(v || '').trim().toLowerCase()] || null;
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function decisionNote(chairName, date) {
    const d = date || new Date();
    return `Recorded by ${chairName}, ${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()} in ACR Helper`;
  }

  // A two-letter ISO 3166 code becomes its flag and English name ("BR" ->
  // "🇧🇷 Brazil"), from the browser's own region names. Anything else is
  // shown as the sheet has it.
  function countryLabel(v) {
    const s = String(v || '').trim();
    if (!/^[A-Za-z]{2}$/.test(s)) return s;
    const code = s.toUpperCase();
    let name = code;
    try { name = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' }).of(code) || code; } catch (_) {}
    if (name === code || /unknown/i.test(name)) return code;
    const flag = String.fromCodePoint(...[...code].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
    return flag + ' ' + name;
  }

  // Notes from the sidebar go on a new line with the date and the writer's name.
  function noteLine(text, name, date) {
    const d = date || new Date();
    return `${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}, ${name} (ACR): ${String(text).trim()}`;
  }
  function appendNote(existing, text, name, date) {
    const line = noteLine(text, name, date);
    const before = String(existing || '');
    return isEmpty(before) ? line : before.replace(/\s+$/, '') + '\n' + line;
  }

  // rows: data rows only (header removed); returns index or -1
  function nextUndecided(rows, headers, from) {
    const di = columnIndex(headers).get(headerKey(DECISION_COLUMN));
    const ii = columnIndex(headers).get(headerKey(ID_COLUMN));
    for (let i = Math.max(0, from); i < rows.length; i++) {
      if (isEmpty(cell(rows[i], ii))) continue;
      if (di === undefined || isEmpty(cell(rows[i], di))) return i;
    }
    return -1;
  }

  function applicantRows(rows, headers) {
    const ii = columnIndex(headers).get(headerKey(ID_COLUMN));
    return rows.map((r, i) => ({ r, i })).filter(x => !isEmpty(cell(x.r, ii)));
  }

  function tally(votes) {
    const t = { Admit: 0, Waitlist: 0, Reject: 0, Discuss: 0 };
    for (const v of votes) if (t[v.choice] !== undefined) t[v.choice]++;
    return t;
  }

  function columnLetter(i) {
    let s = '';
    i += 1;
    while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
    return s;
  }

  function quoteTab(t) {
    return "'" + String(t).replace(/'/g, "''") + "'";
  }

  // Why Google refused a request: only a plain permission refusal means the
  // sheet is not shared with this person.
  function refusalKind(status, reason, message) {
    const r = String(reason || '') + ' ' + String(message || '');
    if (/SCOPE_INSUFFICIENT|insufficient authentication scopes/i.test(r)) return 'scope';
    if (/SERVICE_DISABLED|has not been used|is disabled/i.test(r)) return 'api';
    if (status === 404 || status === 403) return 'noaccess';
    return 'other';
  }

  const lib = {
    refusalKind,
    STAGE_GROUPS, ID_COLUMN, PK_COLUMN, DECISION_COLUMN, NOTES_COLUMN, DECISIONS, VOTES, countryLabel, appendNote,
    isEmpty, headerKey, headerLabel, findHeaderRow, columnIndex, buildApplicant, buildLinks,
    decisionToCell, cellToDecision, decisionNote, nextUndecided, applicantRows, tally,
    columnLetter, quoteTab,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = lib;
  else root.ACR = lib;
})(typeof window !== 'undefined' ? window : globalThis);
