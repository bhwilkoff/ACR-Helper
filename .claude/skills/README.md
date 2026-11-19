# Skills

Each folder holds a `SKILL.md`. The "How we build" table in `AGENTS.md`
says when to use each one. They came from UniversalAppTemplate on
November 19, 2026; some mention native platforms in passing, and those
parts do not apply here. A few name skills that were left out because
they are for native apps, TV, or feeds (`device-observation-harness`,
`cross-platform-multiplayer`, `per-ecosystem-sync-islands`,
`values-based-feed-ranking`); they are in UniversalAppTemplate if ever
needed.

| Skill | For |
|---|---|
| `3d-feature-debug-loop` | Use when iterating on a complex visual / 3D feature where user feedback keeps surfacing the same kind of bug after several "fix" attempts. |
| `architectural-decision-log` | Use when a project has a DECISIONS.md (or ADR log) capturing architecture choices. |
| `autonomous-loop-cadence` | Use when running an autonomous /loop on a multi-platform codebase, or picking one up after compaction. |
| `binding-design-doc-discipline` | Use when a project has a binding design doc (DESIGN.md, WEB-DESIGN.md, STYLE_GUIDE.md, etc.) that governs UI/IA decisions. |
| `canonical-entity-identity` | Use when a catalog/corpus needs stable per-entity identifiers, when designing or evolving a composite ID formula, when two records collide on the current ID, when migrating IDs across bundles + databases, or when an asse |
| `ci-fleet-engineering` | Use when adding, editing, or debugging ANY GitHub Actions workflow that mutates shared data, publishes an artifact, reports, or runs on a cron, and when diagnosing CI failures, cancelled runs, lock contention, lost work, |
| `evidence-gated-catalog-curation` | Use when an app serves a catalog it did not author (public-domain media, an archive, user uploads, third-party metadata) and must decide what to show, hide, recommend, or say about each item. |
| `feature-shipping-discipline` | Use as the end-to-end workflow for shipping any feature change. |
| `frontend-design` | Create distinctive, production-grade frontend interfaces with high design quality. |
| `github-and-google-learning-infrastructure` | Use when a learning platform (or any free community app) leans on GitHub and Google for identity, storage, notifications, and scheduling instead of running its own: GitHub sign-in through a GitHub App, an organization wi |
| `google-meet-addon` | Use when building, testing, or debugging a Google Meet add-on (Meet Add-ons SDK: side panel + main stage, activities, frame-to-frame messages) or any web app meant to run inside Meet. |
| `human-shaped-review` | Use when the builder asks for feedback on their app the human-shaped way: 'review my app', 'is this human-shaped?', 'give me feedback before I share it', 'check my declaration', before a cohort show-and-tell, or before f |
| `learner-experience-design` | Use when designing what a person sees once they are signed in, enrolled, or otherwise "in" (a home, dashboard, account page, header, or role-based view), and whenever an app serves learners and the people who teach them. |
| `learning-orientation-design` | Use before implementing any new feature, and when starting a new app. |
| `live-learning-sessions` | Use when building or running live class sessions on a shared backend (cohorts, workshops, a classroom in a video call): a run of show everyone follows, questions answered live, guests who join by link, breakout rooms, re |
| `mobile-first-density-design` | Use when designing or reviewing any UI — the principle is that visual density comes from REMOVING chrome, not adding decoration. |
| `native-platform-first` | Use before building any custom UI component, animation, gesture, modal, dropdown, or interaction. |
| `provenance-honest-market-data` | Use when an app displays prices, valuations, comps, or any market signal (collectibles, resale, tickets, real-estate comps, marketplace data), when the sold-data API you wanted doesn't exist or won't grant access, when m |
| `shared-data-plane-contract` | Use when multiple clients consume the same content/data (a catalog, feed, corpus, or library), when designing how published data reaches the apps, when a browser client needs the shared data (CORS/Range realities), or wh |
| `third-party-revocation-resilience` | Use when the app depends on a third party's data, images, or API (a price guide, a metadata provider, a scraping target, a partner feed) — both BEFORE the dependency becomes load-bearing (design the exit path) and the da |
| `two-agent-handoff` | Use when TWO AI agent surfaces with different capabilities collaborate on one project — a repo-access coding agent paired with a research/data-authoring agent that has no repo access, or any asymmetric pair — and their w |
| `universal-feature-states` | Use when designing any list, grid, search, sheet, or feature with content that loads. |
| `web-content-extraction` | Use when an app needs to fetch and render THIRD-PARTY page content the app doesn't control — a reader mode, article extraction, OG/link-preview cards — from a static-hosted web app (CORS wall) or a native app (no CORS, d |
| `web-platform-patterns` | Use before any web (vanilla HTML/CSS/JS, no build step, static hosting) UI / routing / data / offline / image work. |
| `zero-cost-hosted-backend` | Use when an app needs SHARED user data — accounts, public profiles, cross-user features (shared collections, moderation, matching, social rows) — the case per-ecosystem-sync-islands explicitly does not cover. |
