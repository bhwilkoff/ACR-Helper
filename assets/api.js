// The one network client (AGENTS.md, Hard rules). Views never call fetch.
(function () {
  const SHEETS = 'https://sheets.googleapis.com/v4/spreadsheets/';
  let token = null;
  let mock = null;

  function useMock(data) { mock = JSON.parse(JSON.stringify(data)); }
  function setToken(t) { token = t; }
  function clear() { token = null; }

  class ApiError extends Error {
    constructor(status, message) { super(message); this.status = status; }
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
      try { const j = await res.json(); if (j.error && j.error.message) msg = j.error.message; } catch (_) {}
      throw new ApiError(res.status, msg);
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
    if (mock) return { name: 'Test Chair', email: 'chair@example.invalid' };
    return call('https://www.googleapis.com/oauth2/v3/userinfo');
  }

  window.API = { useMock, setToken, clear, getSpreadsheet, getValues, writeCell, getUserInfo, ApiError };
})();
