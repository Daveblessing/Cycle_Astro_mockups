// node tests/cycle-calc.test.js — plain node assert, no deps
'use strict';
const assert = require('assert');
const C = require('../cycle-calc.js');
const D = C.parseYMD, Y = C.toYMD;
let n = 0;
function test(name, fn) { fn(); n++; console.log('ok', n, '-', name); }

const today = D('2026-10-14'); // mercredi 14 octobre 2026 (today réel)
const sept23 = D('2026-09-23');
test('v1.4.0 D0=1 sept, C=28, P=5, today 14 oct → jour 16 lutéale, next 27 oct', () => {
  const r = C.computeCalc('2026-09-01', 5, 28, today);
  assert.strictEqual(r.dayInCycle, 16);
  assert.strictEqual(r.phase.key, 'luteale');
  assert.strictEqual(Y(r.cycleStart), '2026-09-29');
  assert.strictEqual(Y(r.nextStart), '2026-10-27');
  assert.strictEqual(r.nextStart.getDay(), 2); // mardi
  assert.strictEqual(r.daysUntil, 13);
  assert.strictEqual(Y(r.nextEnd), '2026-10-31');
});
test('legacy sept 23 projection still sound', () => {
  const r = C.computeCalc('2026-09-01', 5, 28, sept23);
  assert.strictEqual(r.dayInCycle, 23);
  assert.strictEqual(Y(r.nextStart), '2026-09-29');
  assert.strictEqual(r.daysUntil, 6);
});
test('demo phases 1–5, 6–12, 13–15, 16–28', () => {
  assert.deepStrictEqual(C.phaseSegments(5, 28).map((s) => [s.key, s.start, s.end]),
    [['menstruelle', 1, 5], ['folliculaire', 6, 12], ['ovulatoire', 13, 15], ['luteale', 16, 28]]);
});
test('C=21 P=3', () => {
  assert.deepStrictEqual(C.phaseSegments(3, 21).map((s) => [s.start, s.end]), [[1, 3], [4, 5], [6, 8], [9, 21]]);
  const r = C.computeCalc('2026-09-01', 3, 21, today);
  assert.strictEqual(r.dayInCycle, 2); assert.strictEqual(r.phase.key, 'menstruelle');
  assert.strictEqual(Y(r.cycleStart), '2026-10-13'); assert.strictEqual(Y(r.nextStart), '2026-11-03');
});
test('C=35 P=8', () => {
  assert.deepStrictEqual(C.phaseSegments(8, 35).map((s) => [s.start, s.end]), [[1, 8], [9, 19], [20, 22], [23, 35]]);
  const r = C.computeCalc('2026-09-01', 8, 35, today);
  // delta=43 → day 9 folliculaire, next = Sep1+35 = Oct6
  assert.strictEqual(r.dayInCycle, 9); assert.strictEqual(r.phase.key, 'folliculaire'); assert.strictEqual(Y(r.nextStart), '2026-11-10');
});
test('C=30 P=5', () => {
  assert.deepStrictEqual(C.phaseSegments(5, 30).map((s) => [s.start, s.end]), [[1, 5], [6, 14], [15, 17], [18, 30]]);
  const r = C.computeCalc('2026-09-01', 5, 30, today);
  // delta=43 → day 14 folliculaire, next = Sep1+60 = Oct31
  assert.strictEqual(r.dayInCycle, 14); assert.strictEqual(Y(r.nextStart), '2026-10-31'); assert.strictEqual(r.daysUntil, 17);
});
test('D0 at end of month (31 août)', () => {
  const r = C.computeCalc('2026-08-31', 5, 28, today);
  // delta=44 → day 17 luteale, cycleStart Aug31+28=Sep28, next Oct26
  assert.strictEqual(r.dayInCycle, 17); assert.strictEqual(Y(r.cycleStart), '2026-09-28'); assert.strictEqual(Y(r.nextStart), '2026-10-26');
});
test('leap year Feb 2028', () => {
  const r = C.computeCalc('2028-02-01', 5, 28, D('2028-02-28'));
  assert.strictEqual(Y(r.nextStart), '2028-02-29');
  assert.strictEqual(C.computeCalc('2028-02-01', 5, 28, D('2028-02-29')).dayInCycle, 1);
  assert.strictEqual(Y(C.computeCalc('2028-02-15', 5, 28, D('2028-02-20')).nextStart), '2028-03-14');
  assert.strictEqual(C.parseYMD('2027-02-29'), null);
  assert.strictEqual(C.monthGrid(2028, 1).daysInMonth, 29);
});
test('D0 in the future is refused (no day, no phase)', () => {
  const r = C.computeCalc('2026-10-20', 5, 28, today);
  assert.strictEqual(r.future, true); assert.strictEqual(r.dayInCycle, null); assert.strictEqual(r.phase, null);
});
test('clamps', () => {
  assert.strictEqual(C.clampCycle(40), 35); assert.strictEqual(C.clampCycle(10), 21); assert.strictEqual(C.clampCycle(''), 28);
  assert.strictEqual(C.clampPeriod(12), 8); assert.strictEqual(C.clampPeriod(1), 2); assert.strictEqual(C.clampPeriod(null), 5);
});
test('calendar septembre: 1–5 menstr, 23 luteale, 29–30 = jours 1–2 du NOUVEAU cycle', () => {
  const k = (d) => C.phaseOnDate('2026-09-01', 5, 28, D(d));
  assert.strictEqual(k('2026-09-05').key, 'menstruelle');
  assert.strictEqual(k('2026-09-06').key, 'folliculaire');
  assert.strictEqual(k('2026-09-13').key, 'ovulatoire');
  assert.strictEqual(k('2026-09-16').key, 'luteale');
  assert.strictEqual(k('2026-09-28').day, 28);
  assert.deepStrictEqual(k('2026-09-29'), { day: 1, key: 'menstruelle' });
  assert.deepStrictEqual(k('2026-09-30'), { day: 2, key: 'menstruelle' });
});
test('calendar octobre: 1–3 menstr (cycle du 29 sept), 14 = jour 16 lutéale, 27 = jour 1', () => {
  const k = (d) => C.phaseOnDate('2026-09-01', 5, 28, D(d));
  assert.strictEqual(k('2026-10-03').key, 'menstruelle'); assert.strictEqual(k('2026-10-03').day, 5);
  assert.strictEqual(k('2026-10-04').key, 'folliculaire');
  assert.deepStrictEqual(k('2026-10-14'), { day: 16, key: 'luteale' });
  assert.deepStrictEqual(k('2026-10-27'), { day: 1, key: 'menstruelle' });
});
test('month grid + navigation', () => {
  assert.deepStrictEqual(C.monthGrid(2026, 8), { offset: 1, daysInMonth: 30, prevDays: 31 });
  assert.deepStrictEqual(C.monthGrid(2026, 9), { offset: 3, daysInMonth: 31, prevDays: 30 });
  assert.deepStrictEqual(C.shiftMonth(2026, 11, 1), { year: 2027, month: 0 });
  assert.deepStrictEqual(C.shiftMonth(2026, 0, -1), { year: 2025, month: 11 });
});
test('DST / timezone: no off-by-one across 25 oct 2026 and late-evening dates', () => {
  assert.strictEqual(C.daysBetween(D('2026-10-20'), D('2026-10-30')), 10);
  assert.strictEqual(C.daysBetween(new Date(2026, 8, 1, 23, 59), new Date(2026, 8, 2, 0, 1)), 1);
  assert.strictEqual(Y(C.addDays(D('2026-03-28'), 1)), '2026-03-29');
  assert.strictEqual(Y(C.addDays(D('2026-03-29'), 1)), '2026-03-30');
});
test('ics ranges (all-day, end exclusive)', () => {
  const r = C.computeCalc('2026-09-01', 5, 28, today);
  const m = C.icsRanges(r, false);
  assert.strictEqual(m.length, 3);
  assert.deepStrictEqual(m.map((e) => [Y(e.start), Y(e.endExcl)]),
    [['2026-10-27', '2026-11-01'], ['2026-11-24', '2026-11-29'], ['2026-12-22', '2026-12-27']]);
  const all = C.icsRanges(r, true);
  assert.strictEqual(all.length, 12);
  // ovulatoire of first upcoming cycle: Oct27 + (13-1) = Nov8 → Nov11 excl
  assert.deepStrictEqual([Y(all[2].start), Y(all[2].endExcl)], ['2026-11-08', '2026-11-11']);
});
const H = [{ start: '2026-07-07', end: '2026-07-11' }, { start: '2026-08-04', len: 6 }, { start: '2026-09-01', end: '2026-09-04' }];
test('history averages, min/max, rows newest first', () => {
  const s = C.periodStats(H);
  assert.deepStrictEqual(s.cycles, [28, 28]);
  assert.strictEqual(s.avgCycle, 28); assert.strictEqual(s.avgPeriod, 5);
  assert.strictEqual(s.minPeriod, 4); assert.strictEqual(s.maxPeriod, 6);
  assert.deepStrictEqual(s.rows.map((r) => [r.start, r.end, r.len, r.cycleLen]),
    [['2026-09-01', '2026-09-04', 4, null], ['2026-08-04', '2026-08-09', 6, 28], ['2026-07-07', '2026-07-11', 5, 28]]);
});
test('history irregular gaps', () => {
  const s = C.periodStats([{ start: '2026-06-01', end: '2026-06-05' }, { start: '2026-06-27', end: '2026-07-01' }, { start: '2026-07-29', end: '2026-08-02' }]);
  assert.deepStrictEqual(s.cycles, [26, 32]); assert.strictEqual(s.avgCycle, 29);
  assert.strictEqual(s.minCycle, 26); assert.strictEqual(s.maxCycle, 32);
});
test('predictNext from averages (≥2) else settings', () => {
  assert.strictEqual(Y(C.predictNext(H, null, today).date), '2026-10-27');
  const one = C.predictNext([{ start: '2026-09-01', end: '2026-09-05' }], { lastStart: '2026-09-01', periodLen: 5, cycleLen: 30 }, today);
  assert.strictEqual(one.source, 'settings'); assert.strictEqual(Y(one.date), '2026-10-31');
});
test('phase of past check-ins uses the logged cycle', () => {
  assert.strictEqual(C.phaseFromHistory(H, D('2026-08-05')).key, 'menstruelle');
  assert.strictEqual(C.phaseFromHistory(H, D('2026-08-17')).key, 'ovulatoire');
  assert.strictEqual(C.phaseFromHistory(H, D('2026-09-23'), { lastStart: '2026-09-01', periodLen: 5, cycleLen: 28 }).key, 'luteale');
});
test('normPeriod rejects end before start', () => {
  assert.strictEqual(C.normPeriod({ start: '2026-09-05', end: '2026-09-01' }), null);
});
console.log('\n' + n + ' tests passed');
