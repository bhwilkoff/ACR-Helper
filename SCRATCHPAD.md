# Scratchpad

## Current state

- **Status**: STARTED, nothing built. The repository holds the method
  (AGENTS.md, skills, docs) and the Meet add-on playbook
  (`docs/MEET-ADDON.md`); there is no add-on code yet.
- **Active milestone**: M0, Ben says what ACR Helper is for and who uses it.
- **Last session**: 2026-11-19, repository made from UniversalAppTemplate
  and the Human Shaped add-on work, native-app context left out.
- **Next actions**:
  1. Ask Ben the open questions below and write his answers, in his
     words, into AGENTS.md ("What this app does").
  2. Ben does the one-time Google setup in `docs/MEET-ADDON.md`
     (Cloud project, Sheets API, consent screen, OAuth client,
     deployment, Install) and sends the project number and client ID.
  3. First prototype: a panel that signs a person in, checks the test
     sheet with their own token, and either shows the first row or says
     plainly that the sheet is not shared with them. Verified in a real
     call with two profiles, one with access and one without.
- **Open questions** (Ben's to answer):
  1. What does ACR stand for, and who is in the call when it is used?
  2. Which spreadsheet, which columns, and is there a test copy?
  3. What are the "other sources" for a row?
  4. What is a decision: its choices, and is it written back into the
     row (needs write access) or somewhere else?
  5. One Google Workspace organization (Internal consent, private
     listing) or anyone with access to the sheet?
  6. Should everyone in the call see the same row at once, and who moves
     it? (Routes in `docs/MEET-ADDON.md`, "One row, the whole call".)
  7. Hosting: GitHub Pages from a private repository needs a paid GitHub
     plan; a public repository is free and holds no sheet data. Which?

---

## Out of scope

- Native apps of any kind (iOS, macOS, tvOS, Android, Windows, TV).
  Ben, 2026-11-19: "we are not planning to build out any native apps in
  this new repository".

---

## Session log

### 2026-11-19: repository made

- **Found**: nothing; new repository.
- **Done**: copied the web, Meet, Google, data, and process skills and
  docs from UniversalAppTemplate; wrote AGENTS.md for a Meet add-on
  gated by a spreadsheet's sharing; wrote `docs/MEET-ADDON.md` from what
  was measured building the Human Shaped add-on.
- **Left**: every open question above; no code.
