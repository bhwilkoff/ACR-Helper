// Relays panel -> stage like Meet's notifyMainStage. Two frames on one page are
// not Meet: anything verified here still needs a real call.
const q = new URLSearchParams(location.search);
const extra = q.get('diag') === '1' ? '&diag=1' : '';
document.getElementById('panel').src = '/addon/?harness=1&mock=1' + extra;
document.getElementById('stage').src = '/addon/stage/?harness=1' + extra;
window.addEventListener('message', e => {
  if (e.origin !== location.origin || !e.data || e.data.to !== 'stage') return;
  document.getElementById('stage').contentWindow.postMessage(e.data.data, location.origin);
});
