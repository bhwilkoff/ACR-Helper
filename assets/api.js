// The one network client (AGENTS.md, Hard rules). Views never call fetch.
(function () {
  const SHEETS = 'https://sheets.googleapis.com/v4/spreadsheets/';
  let token = null;
  let mock = null;
  let mockUser = null;

  function useMock(data, user) { mock = JSON.parse(JSON.stringify(data)); mockUser = user; }
  function setToken(t) { token = t; }
  function clear() { token = null; }

  class ApiError extends Error {
    constructor(status, message, reason) { super(message); this.status = status; this.reason = reason || ''; }
  }

  async function call(url, opts) {
    if (!token) throw new ApiError(401, 'Not signed in');
    let res;
    try {
      res = await fetch(url, Object.assign({
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        signal: AbortSignal.timeout(15000),
      }, opts || {}));
    } catch (e) {
      throw new ApiError(0, navigator.onLine === false ? 'You are offline' : 'Could not reach Google');
    }
    if (!res.ok) {
      let msg = 'Google said ' + res.status;
      let reason = '';
      try {
        const j = await res.json();
        if (j.error && j.error.message) msg = j.error.message;
        const d = (j.error && j.error.details) || [];
        reason = (d.find(x => x && x.reason) || {}).reason || (j.error && j.error.status) || '';
      } catch (_) {}
      throw new ApiError(res.status, msg, reason);
    }
    return res.json();
  }

  // 200 = can open; 403/404 = cannot (thrown with that status).
  async function getSpreadsheet(id) {
    if (mock) {
      return { title: mock.title, tabs: Object.keys(mock.tabs).map((t, i) => ({ title: t, sheetId: i })) };
    }
    const j = await call(SHEETS + encodeURIComponent(id) + '?fields=properties.title,sheets.properties(sheetId,title)');
    return { title: j.properties.title, tabs: j.sheets.map(s => ({ title: s.properties.title, sheetId: s.properties.sheetId })) };
  }

  async function getValues(id, range) {
    if (mock) {
      const tab = range.replace(/^'(.*)'.*$/, '$1').replace(/''/g, "'");
      return (mock.tabs[tab] || []).map(r => r.slice());
    }
    const j = await call(SHEETS + encodeURIComponent(id) + '/values/' + encodeURIComponent(range) + '?valueRenderOption=FORMATTED_VALUE');
    return j.values || [];
  }

  // Writes one cell's value and note together.
  async function writeCell(id, tab, sheetId, rowIndex, colIndex, value, note) {
    if (mock) {
      const rows = mock.tabs[tab];
      while (rows[rowIndex].length <= colIndex) rows[rowIndex].push('');
      rows[rowIndex][colIndex] = value;
      return { mock: true, note };
    }
    return call(SHEETS + encodeURIComponent(id) + ':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({ requests: [{ updateCells: {
        start: { sheetId, rowIndex, columnIndex: colIndex },
        rows: [{ values: [{ userEnteredValue: { stringValue: value }, note }] }],
        fields: 'userEnteredValue,note',
      } }] }),
    });
  }

  async function getUserInfo() {
    if (mock) return mockUser;
    return call('https://www.googleapis.com/oauth2/v3/userinfo');
  }

  // The group key for the encrypted channel lives in the hidden _acr tab (REQUIREMENTS P5).
  async function getAcrKey(id) {
    if (mock) return mock.acrKey || null;
    try {
      const v = await getValues(id, "'_acr'!A1");
      return (v[0] && v[0][0]) || null;
    } catch (e) {
      if (e.status === 400) return null;
      throw e;
    }
  }

  // Chair only (needs edit access). Creates the hidden tab if it is missing.
  async function createAcrKey(id, keyB64) {
    if (mock) { mock.acrKey = keyB64; return; }
    const meta = await getSpreadsheet(id);
    if (!meta.tabs.some(t => t.title === '_acr')) {
      await call(SHEETS + encodeURIComponent(id) + ':batchUpdate', {
        method: 'POST',
        body: JSON.stringify({ requests: [{ addSheet: { properties: { title: '_acr', hidden: true } } }] }),
      });
    }
    await call(SHEETS + encodeURIComponent(id) + '/values/' + encodeURIComponent("'_acr'!A1:B1") + '?valueInputOption=RAW', {
      method: 'PUT',
      body: JSON.stringify({ values: [[keyB64, 'ACR Helper channel key. Do not edit; replacing it locks out everyone in a review.']] }),
    });
  }

  async function getCell(id, tab, rowIndex, colIndex) {
    const a1 = ACR.quoteTab(tab) + '!' + ACR.columnLetter(colIndex) + (rowIndex + 1);
    const v = await getValues(id, a1);
    if (mock) { const r = v[rowIndex] || []; return r[colIndex] === undefined ? '' : String(r[colIndex]); }
    return (v[0] && v[0][0] !== undefined) ? String(v[0][0]) : '';
  }

  function mockSet(tab, rowIndex, colIndex, value) {
    if (!mock) throw new Error('mock only');
    mock.tabs[tab][rowIndex][colIndex] = value;
  }

  window.API = { mockSet, useMock, setToken, clear, getSpreadsheet, getValues, getCell, writeCell, getUserInfo, getAcrKey, createAcrKey, ApiError };
})();
