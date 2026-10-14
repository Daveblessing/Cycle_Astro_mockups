/**
 * Cycle & Astro · moteur de calcul du cycle (v1.4.0)
 * Pur, sans DOM : utilisé par app.js (window.CycleCalc) et par tests/cycle-calc.test.js (node).
 * Toutes les dates sont des dates LOCALES à midi (évite les décalages UTC / heure d’été).
 * Bien-être seulement : l’ovulation est une estimation, jamais une contraception ni un conseil de fertilité.
 */
(function (root) {
  'use strict';
  const DAY_MS = 86400000;

  function atNoon(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0); }

  function parseYMD(str) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || ''));
    if (!m) return null;
    const y = Number(m[1]), mo = Number(m[2]) - 1, da = Number(m[3]);
    const d = new Date(y, mo, da, 12, 0, 0, 0);
    if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== da) return null; // 2027-02-29 refusé
    return d;
  }
  function toYMD(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12, 0, 0, 0); }
  function daysBetween(a, b) { return Math.round((atNoon(b).getTime() - atNoon(a).getTime()) / DAY_MS); }

  function clampCycle(n) {
    const v = Number(n);
    if (!v || Number.isNaN(v)) return 28;
    return Math.min(35, Math.max(21, Math.round(v)));
  }
  function clampPeriod(n) {
    const v = Number(n);
    if (!v || Number.isNaN(v)) return 5;
    return Math.min(8, Math.max(2, Math.round(v)));
  }

  /** menstruelle 1..P ; folliculaire P+1..(C−14)−2 ; ovulatoire (C−14)−1..(C−14)+1 ; lutéale (C−14)+2..C */
  function softPhase(day, P, C) {
    const o = C - 14;
    if (day >= 1 && day <= P) return { key: 'menstruelle', label: 'Règles' };
    if (day >= o - 1 && day <= o + 1) return { key: 'ovulatoire', label: 'Milieu de cycle' };
    if (day > P && day < o - 1) return { key: 'folliculaire', label: 'Avant le milieu' };
    return { key: 'luteale', label: 'Après le milieu' };
  }
  function phaseSegments(P, C) {
    const segs = [];
    for (let d = 1; d <= C; d++) {
      const key = softPhase(d, P, C).key;
      const last = segs[segs.length - 1];
      if (last && last.key === key) last.end = d;
      else segs.push({ key: key, start: d, end: d });
    }
    return segs;
  }

  /** Jour du cycle (1..C) et phase pour n’importe quelle date (projection avant/après D0). */
  function dayOfCycle(D0, C, date) {
    let m = daysBetween(D0, date) % C;
    if (m < 0) m += C;
    return m + 1;
  }
  function phaseOnDate(lastStart, P, C, date) {
    const D0 = typeof lastStart === 'string' ? parseYMD(lastStart) : lastStart;
    if (!D0 || !date) return null;
    const p = clampPeriod(P), c = clampCycle(C);
    const day = dayOfCycle(D0, c, date);
    return { day: day, key: softPhase(day, p, c).key };
  }

  /**
   * delta = today − D0 ; jour = delta mod C + 1 ; nextStart = D0 + C·(k+1), k = floor(delta / C).
   * D0 dans le futur : refusé (future: true, pas de jour ni de phase), nextStart = D0.
   */
  function computeCalc(lastStart, periodLen, cycleLen, today) {
    const start = typeof lastStart === 'string' ? parseYMD(lastStart) : (lastStart ? atNoon(lastStart) : null);
    if (!start || !today) return null;
    const P = clampPeriod(periodLen), C = clampCycle(cycleLen);
    const T = atNoon(today);
    const delta = daysBetween(start, T);
    const periodsFrom = (first) => {
      const out = [];
      for (let i = 0; i < 3; i++) {
        const s = addDays(first, C * i);
        out.push({ start: s, end: addDays(s, P - 1) });
      }
      return out;
    };
    if (delta < 0) {
      return { future: true, periodLen: P, cycleLen: C, delta: delta, k: -1, dayInCycle: null, phase: null,
        cycleStart: start, nextStart: start, nextEnd: addDays(start, P - 1), daysUntil: -delta, periods: periodsFrom(start) };
    }
    const k = Math.floor(delta / C);
    const dayInCycle = (delta % C) + 1;
    const cycleStart = addDays(start, C * k);
    const nextStart = addDays(start, C * (k + 1));
    return {
      future: false, periodLen: P, cycleLen: C, delta: delta, k: k, dayInCycle0: dayInCycle - 1, dayInCycle: dayInCycle,
      phase: softPhase(dayInCycle, P, C), cycleStart: cycleStart, nextStart: nextStart, nextEnd: addDays(nextStart, P - 1),
      daysUntil: daysBetween(T, nextStart), periods: periodsFrom(nextStart),
    };
  }

  /** Grille mensuelle (lundi = 0). */
  function monthGrid(year, month) {
    const first = new Date(year, month, 1, 12);
    return {
      offset: (first.getDay() + 6) % 7,
      daysInMonth: new Date(year, month + 1, 0, 12).getDate(),
      prevDays: new Date(year, month, 0, 12).getDate(),
    };
  }
  function shiftMonth(year, month, delta) {
    const d = new Date(year, month + delta, 1, 12);
    return { year: d.getFullYear(), month: d.getMonth() };
  }

  /* —— Historique —— */
  /** Normalise une entrée : {start, end} (accepte l’ancien format v1.2 {start, len}). */
  function normPeriod(p) {
    if (!p) return null;
    const s = parseYMD(p.start);
    if (!s) return null;
    let e = parseYMD(p.end);
    if (!e) e = addDays(s, Math.max(1, Math.round(Number(p.len) || 5)) - 1);
    if (e < s) return null;
    return { start: toYMD(s), end: toYMD(e), len: daysBetween(s, e) + 1 };
  }

  /**
   * Moyenne du cycle = moyenne des écarts entre débuts consécutifs ;
   * moyenne des règles = moyenne des durées notées ; min / max sur les écarts.
   * rows : du plus récent au plus ancien, avec la longueur du cycle jusqu’aux règles suivantes.
   */
  function periodStats(list) {
    const clean = [];
    const seen = {};
    (list || []).forEach((p) => {
      const n = normPeriod(p);
      if (n && !seen[n.start]) { seen[n.start] = 1; clean.push(n); }
    });
    clean.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
    const cycles = [];
    for (let i = 1; i < clean.length; i++) cycles.push(daysBetween(parseYMD(clean[i - 1].start), parseYMD(clean[i].start)));
    const lens = clean.map((p) => p.len);
    const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
    const rows = clean.map((p, i) => Object.assign({}, p, { cycleLen: i < cycles.length ? cycles[i] : null })).reverse();
    return {
      sorted: clean, rows: rows, cycles: cycles, count: clean.length, cycleCount: cycles.length,
      avgCycle: avg(cycles), avgPeriod: avg(lens),
      minCycle: cycles.length ? Math.min.apply(null, cycles) : null,
      maxCycle: cycles.length ? Math.max.apply(null, cycles) : null,
      minPeriod: lens.length ? Math.min.apply(null, lens) : null,
      maxPeriod: lens.length ? Math.max.apply(null, lens) : null,
    };
  }

  /** Prochaine date : moyennes de l’historique si ≥ 2 débuts, sinon réglages. */
  function predictNext(list, settings, today) {
    const st = periodStats(list);
    if (st.count >= 2) {
      const C = Math.round(st.avgCycle);
      const last = parseYMD(st.sorted[st.sorted.length - 1].start);
      let next = addDays(last, C);
      while (today && daysBetween(today, next) <= 0) next = addDays(next, C);
      return { date: next, source: 'history', cycleLen: C, periodLen: Math.round(st.avgPeriod) };
    }
    const s = settings || {};
    const res = computeCalc(s.lastStart, s.periodLen, s.cycleLen, today);
    return res ? { date: res.nextStart, source: 'settings', cycleLen: res.cycleLen, periodLen: res.periodLen } : null;
  }

  /** Phase d’un jour à partir de l’historique : cycle qui contient la date (sinon projection des réglages). */
  function phaseFromHistory(list, date, settings) {
    const st = periodStats(list);
    for (let i = st.sorted.length - 1; i >= 0; i--) {
      const s = parseYMD(st.sorted[i].start);
      if (daysBetween(s, date) >= 0) {
        const C = i < st.cycles.length ? st.cycles[i] : null;
        if (C == null) break; // dernier cycle : réglages
        const day = daysBetween(s, date) + 1;
        return { day: day, key: softPhase(day, st.sorted[i].len, C).key };
      }
    }
    const x = settings || {};
    return phaseOnDate(x.lastStart, x.periodLen, x.cycleLen, date);
  }

  /** Événements .ics : dates de début incluses et fin exclusive (all-day). */
  function icsRanges(res, includePhases) {
    const segs = phaseSegments(res.periodLen, res.cycleLen);
    const out = [];
    res.periods.forEach((per) => {
      segs.forEach((s) => {
        if (s.key !== 'menstruelle' && !includePhases) return;
        out.push({ key: s.key, start: addDays(per.start, s.start - 1), endExcl: addDays(per.start, s.end) });
      });
    });
    return out;
  }

  const api = { parseYMD, toYMD, addDays, daysBetween, clampCycle, clampPeriod, softPhase, phaseSegments, dayOfCycle,
    phaseOnDate, computeCalc, monthGrid, shiftMonth, normPeriod, periodStats, predictNext, phaseFromHistory, icsRanges };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CycleCalc = api;
})(typeof window !== 'undefined' ? window : this);
