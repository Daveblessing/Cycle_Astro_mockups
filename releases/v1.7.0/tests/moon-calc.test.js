// node tests/moon-calc.test.js — plain node assert, astronomy-engine vendored, no deps
'use strict';
const assert = require('assert');
const M = require('../moon-calc.js')(require('../assets/vendor/astronomy.browser.min.js'));
let n = 0;
function test(name, fn) { fn(); n++; console.log('ok', n, '-', name); }
const U = (s) => new Date(s);
const near = (d, iso, minutes) => assert.ok(Math.abs(d - U(iso)) < minutes * 60000, d.toISOString() + ' vs ' + iso);

test('14 oct 2026 15:00 UTC : premier croissant ~15 %, Lune en Sagittaire, âge ~4 j', () => {
  const s = M.state(U('2026-10-14T15:00:00Z'));
  assert.strictEqual(s.phase, 'Premier croissant'); assert.ok(s.illumPct >= 12 && s.illumPct <= 18);
  assert.strictEqual(s.signFr, 'Sagittaire'); assert.ok(s.age > 3.5 && s.age < 4.5);
  near(s.nextQuarter.date, '2026-10-18T16:13Z', 30); assert.strictEqual(s.nextQuarter.name, 'Premier quartier');
  near(s.nextFull, '2026-10-26T04:12Z', 30); near(s.nextNew, '2026-11-09T07:02Z', 30);
});
test('octobre 2026 : DQ 3, NL 10 (Balance), PQ 18, PL 26 (Taureau)', () => {
  const q = M.monthQuarters(2026, 9);
  assert.deepStrictEqual(q.map((x) => [x.name, x.date.getUTCDate()]), [['Dernier quartier', 3], ['Nouvelle lune', 10], ['Premier quartier', 18], ['Pleine lune', 26]]);
  assert.strictEqual(q[1].signFr, 'Balance'); assert.strictEqual(q[3].signFr, 'Taureau');
});
test('nouvelle lune 7 janv. 2027 en Capricorne', () => {
  const q = M.monthQuarters(2027, 0).find((x) => x.quarter === 0);
  near(q.date, '2027-01-07T20:24Z', 30); assert.strictEqual(q.signFr, 'Capricorne');
});
test('2 août 2027 (éclipse totale de Soleil) = nouvelle lune en Lion', () => {
  const s = M.state(U('2027-08-02T10:07:00Z'));
  assert.strictEqual(s.phase, 'Nouvelle lune'); assert.strictEqual(s.signFr, 'Lion'); assert.ok(s.illumPct <= 1);
});
test('29 fév. 2028 (bissextile) calculé ; pleine lune 31 déc. 2028 en Cancer', () => {
  assert.ok(M.state(U('2028-02-29T12:00:00Z')).phase);
  const q = M.monthQuarters(2028, 11);
  assert.strictEqual(q.length, 5);
  const last = q[q.length - 1]; assert.strictEqual(last.name, 'Pleine lune'); assert.strictEqual(last.signFr, 'Cancer');
  near(last.date, '2028-12-31T16:48Z', 30);
});
test('couverture continue oct. 2026 → déc. 2028 : 3 à 5 quartiers/mois, ordre 0-1-2-3', () => {
  let prev = null, months = 0;
  for (let y = 2026, m = 9; y < 2029; m++, (m > 11 && (m = 0, y++))) {
    const q = M.monthQuarters(y, m); months++;
    assert.ok(q.length >= 3 && q.length <= 5, y + '-' + m);
    q.forEach((x) => { if (prev != null) assert.strictEqual(x.quarter, (prev + 1) % 4); prev = x.quarter; assert.ok(x.text.length > 20); });
  }
  assert.strictEqual(months, 27);
});
test('message combine phase + signe et donne 3 gestes', () => {
  const s = M.state(U('2026-10-14T15:00:00Z'));
  const m = M.message(s);
  assert.ok(/Premier croissant/.test(m.text) && /Sagittaire/.test(m.text)); assert.strictEqual(m.gestures.length, 3);
  assert.strictEqual(M.PHASE_MSG.length, 8); assert.strictEqual(M.SIGN_MSG.length, 12);
});
test('changement de signe : 16 oct. 2026 → Capricorne', () => {
  const c = M.nextSignChange(U('2026-10-14T15:00:00Z'));
  assert.strictEqual(c.signFr, 'Capricorne'); assert.strictEqual(c.date.getUTCDate(), 16);
});
console.log('\n' + n + ' tests passed');
