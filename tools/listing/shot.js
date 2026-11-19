document.getElementById('panel').src = '/addon/?harness=1&mock=1&as=' + encodeURIComponent('Test Chair');
document.getElementById('stage').src = '/addon/stage/?harness=1';
window.addEventListener('message', e => {
  if (e.origin !== location.origin || !e.data || e.data.to !== 'stage') return;
  document.getElementById('stage').contentWindow.postMessage(e.data.data, location.origin);
});
