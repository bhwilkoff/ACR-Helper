const test = require('node:test');
const assert = require('node:assert');
const ACR = require('../assets/acr-lib.js');

const H = ['Unique ID', 'User ID', 'First Name', 'Last Name', 'Has a Minerva Family Member',
  'Citizenship Country', 'Math Score', 'Overall Score\n(7 and > is above)', 'EFC',
  'App Review Committee recommends admit?', 'Notes from Admissions'];

test('empty, whitespace and NULL cells are left out, label and all', () => {
  const row = ['2026-TEST-0001', '900001', 'Test-Ada', 'Applicant', 'NULL', '  ', '7.5', '8.3', '', '', 'null'];
  const a = ACR.buildApplicant(H, row);
  const labels = a.groups.flatMap(g => g.fields.map(f => f.label));
  assert.deepStrictEqual(labels, ['First Name', 'Last Name', 'Math Score', 'Overall Score']);
  assert.ok(!a.groups.some(g => g.title === 'Notes'));
  assert.ok(!a.groups.some(g => g.title === 'Financial aid'));
});

test('family member shows only when present', () => {
  const row = ['2026-TEST-0001', '900001', 'A', 'B', 'Yes (TEST sibling)'];
  const a = ACR.buildApplicant(H, row);
  assert.strictEqual(a.groups[0].fields[2].value, 'Yes (TEST sibling)');
});

test('columns found by header name, not letter', () => {
  const H2 = ['User ID', 'Math Score', 'Unique ID', 'First Name'];
  const a = ACR.buildApplicant(H2, ['900009', '6.1', '2026-TEST-0009', 'Test-Ivo']);
  assert.strictEqual(a.id, '2026-TEST-0009');
  assert.strictEqual(a.pk, '900009');
  assert.strictEqual(a.groups[0].fields[0].value, 'Test-Ivo');
  assert.ok(a.missing.includes('EFC'));
});

test('links are built from A and B', () => {
  const [o, f, i] = ACR.buildLinks('2026-KDOX-4805', '508301');
  assert.strictEqual(o.url, 'https://www.minerva.edu/admin/application/applicantoverview/?q=2026-KDOX-4805&evaluation_ready_on=All&matriculation_date=All');
  assert.strictEqual(f.url, 'https://www.minerva.edu/admin/applicants/508301?pks=508301');
  assert.strictEqual(i.url, 'https://www.minerva.edu/admin/integrity_check/?unique_id=2026-JXPN-7884'.replace('2026-JXPN-7884', '2026-KDOX-4805'));
});

test('a malformed ID or number gives an error, never a URL', () => {
  const links = ACR.buildLinks('2026-kdox-4805"><x', '50&8');
  assert.ok(links.every(l => !l.url && l.error));
});

test('decisions map to the sheet words Yes / Maybe / No and back', () => {
  assert.strictEqual(ACR.decisionToCell('Admit'), 'Yes');
  assert.strictEqual(ACR.decisionToCell('Waitlist'), 'Maybe');
  assert.strictEqual(ACR.decisionToCell('Reject'), 'No');
  assert.throws(() => ACR.decisionToCell('Discuss'));
  assert.strictEqual(ACR.cellToDecision(' maybe '), 'Waitlist');
  assert.strictEqual(ACR.cellToDecision('Strong yes'), null);
});

test('decision note names the chair and date, nothing about votes', () => {
  const n = ACR.decisionNote('Test Chair', new Date(2026, 10, 20));
  assert.strictEqual(n, 'Recorded by Test Chair, Nov 20 2026 in ACR Helper');
});

test('next undecided skips decided and blank rows', () => {
  const rows = [
    ['2026-TEST-0001', '1', '', '', '', '', '', '', '', 'Yes'],
    ['', '', '', '', '', '', '', '', '', ''],
    ['2026-TEST-0003', '3', '', '', '', '', '', '', '', 'NULL'],
  ];
  assert.strictEqual(ACR.nextUndecided(rows, H, 0), 2);
  assert.strictEqual(ACR.nextUndecided(rows, H, 3), -1);
});

test('header row is found below a title row', () => {
  assert.strictEqual(ACR.findHeaderRow([['Fall 2027'], H]), 1);
  assert.strictEqual(ACR.findHeaderRow([['x']]), -1);
});

test('column letters', () => {
  assert.strictEqual(ACR.columnLetter(0), 'A');
  assert.strictEqual(ACR.columnLetter(27), 'AB');
  assert.strictEqual(ACR.quoteTab("Rob's tab"), "'Rob''s tab'");
});
