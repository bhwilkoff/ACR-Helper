# The web app

Read this before any web work: views, routing, CSS, data, offline,
images, or deploys.

The add-on is a web app with no build step. Read `docs/MEET-ADDON.md`
too: Meet's frames change several of these rules.

## Which skill

`web-platform-patterns` is the umbrella: view system,
  URL state, service worker, IndexedDB, image fallback chains, CSS
  gotchas, headless verification. `frontend-design` for component-level work.

## Web app

**Stack**: Vanilla HTML/JS. No framework, no build step. Custom
CSS, mobile-first. Google sign-in and the Sheets API with each person's own token; no server yet.
GitHub Pages static hosting, branch `main`, root `/`.

**Key directories**:
- `/`: root; AGENTS.md (CLAUDE.md imports it), SCRATCHPAD.md, DECISIONS.md
- `/addon/`: the side panel Meet frames (proposed)
- `/addon/stage/`: the main stage (proposed)
- `/assets/`: scripts, one stylesheet, images; `assets/api.js` is the one network client

**Run locally**: `python3 -m http.server 8080` → visit
http://localhost:8080. Deploy: push to `main`; GitHub Pages serves
automatically.

**Conventions** (the load-bearing ones; see skills for the rest):
- All network calls through `assets/api.js`, never `fetch` directly
  elsewhere
- CSS custom properties in `:root`, matching Meet's light and dark colors
- Mobile-first; all media queries use `min-width`
- No inline styles
- Error states must be user-visible (not just console logs)
- **URL-driven state is the web's superpower.** Every surface gets
  a shareable canonical URL; filters live in query params. Inside Meet the
  panel's address is fixed by the deployment, so state lives in the
  panel, never in the URL; and **no spreadsheet data ever goes in a
  URL** (AGENTS.md, Hard rules).
- **`cache:'no-store'` does not bypass a service worker**, and an
  author `display` rule beats `[hidden]` (write `.x:not([hidden])`).
- **Every `API.x` the JS calls must be exported by `assets/api.js`**,
  checked by a test.

**Safari layout pitfall** (codified in the bundled CSS):
`body { height: 100dvh; display: flex; flex-direction: column;
overflow: hidden; }` with `main { flex: 1; overflow-y: auto;
min-height: 0; }`. NO `viewport-fit=cover`. NO `position: fixed`
overlays; they break Safari's compositor at the Dynamic Island.

**Modern web APIs to reach for first** (skip the npm dep / custom
fallback):
- No modals in the panel (`docs/MEET-ADDON.md`); on a page outside
  Meet, `<dialog showModal>`
- Popover API (`popover="auto"`) for dropdowns + tooltips
- View Transitions API for cross-view animations
- Container Queries (`@container`) for component-level responsiveness
- CSS `:has()` to kill JS class-toggle patterns
- Not inside Meet's frames: clipboard, autoplay, fullscreen, camera,
  microphone, and screen capture are all denied there; a popup the
  panel opens has them
- `prefers-reduced-transparency` / `prefers-reduced-motion`
  overrides for every blur / animation
