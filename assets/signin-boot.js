// CSP forbids inline handlers; wait for Google's script, then start.
(function wait(n) {
  if (window.google && google.accounts && google.accounts.oauth2) return ACRSignIn.start();
  if (n > 100) { document.getElementById('main').textContent = "Google's sign-in script did not load."; return; }
  setTimeout(() => wait(n + 1), 100);
})(0);
