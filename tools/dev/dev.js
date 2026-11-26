// Three panels and one stage on one page. Panels talk over BroadcastChannel;
// the stage shows the panel picked by ?stageof=N (default 1, a member).
// Frames on one page are not Meet: anything verified here still needs a real call.
const q = new URLSearchParams(location.search);
const extra = q.get('diag') === '1' ? '&diag=1' : '';
const names = ['Test Chair', 'Test Member 1', 'Test Member 2'];
const stageOf = Number(q.get('stageof') || 1);
// ?noaccess=N: that panel's sheet reads as unshared until someone shares it.
const locked = q.get('noaccess');
names.forEach((n, i) => {
  document.getElementById('p' + i).src = '/addon/?harness=1&mock=1&as=' + encodeURIComponent(n) + extra + (locked === String(i) ? '&noaccess=1' : '');
});
document.getElementById('stagelabel').textContent = 'stage of ' + names[stageOf];
document.getElementById('stage').src = '/addon/stage/?harness=1' + extra;
window.addEventListener('message', e => {
  if (e.origin !== location.origin || !e.data || e.data.to !== 'stage') return;
  if (e.source !== document.getElementById('p' + stageOf).contentWindow) return;
  document.getElementById('stage').contentWindow.postMessage(e.data.data, location.origin);
});
