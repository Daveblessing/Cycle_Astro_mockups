/**
 * Cycle & Astro — maquettes HF P0
 * Navigation hash légère + données démo (pas de backend)
 * King Daveblessing · Abidjan · FR
 */
(function () {
  'use strict';

  const DEMO = {
    displayName: 'Aïcha',
    birthDate: '1998-09-04',
    sunSign: 'Vierge',
    moonSign: 'Cancer',
    risingSign: 'Scorpion',
    lifePath: {
      number: 8,
      title: 'La maîtrise',
      summary:
        'Ton chemin de vie 8 évoque la maîtrise, l’abondance et la responsabilité — des axes à explorer, librement.',
    },
    cycle: {
      phase: 'lutéale',
      phaseLabel: 'Ralentir et ressentir',
      dayInCycle: 22,
      avgCycle: 28,
      avgPeriod: 5,
      lastPeriodStart: '2026-09-01',
      lastPeriodEnd: '2026-09-05',
      nextPeriodEst: '2026-10-02',
    },
    moon: {
      phase: 'Gibbeuse décroissante',
      illumination: 62,
    },
    today: '2026-09-22',
  };

  const SCREENS = [
    'splash',
    'onboarding',
    'today',
    'cycle',
    'moon',
    'astro',
    'path',
    'journal',
    'profile',
    'calculator',
  ];

  const SCREEN_ALIASES = {
    calc: 'calculator',
  };

  const NAV_MAP = {
    today: 'today',
    cycle: 'cycle',
    moon: 'today',
    astro: 'today',
    path: 'today',
    journal: 'journal',
    profile: 'profile',
    calculator: 'profile',
  };

  const views = document.getElementById('views');
  const bottomNav = document.getElementById('bottomNav');
  const toastEl = document.getElementById('toast');
  const picker = document.getElementById('screenPicker');
  const clockEl = document.getElementById('clock');

  function parseHash() {
    const raw = (location.hash || '#/splash').replace(/^#\/?/, '');
    let screen = raw.split('/')[0] || 'splash';
    if (SCREEN_ALIASES[screen]) screen = SCREEN_ALIASES[screen];
    return SCREENS.includes(screen) || screen === 'market' ? screen : 'splash';
  }

  function go(screen, push) {
    if (!screen) return;
    if (SCREEN_ALIASES[screen]) screen = SCREEN_ALIASES[screen];
    if (screen === 'market') {
      show('market');
      if (push !== false) location.hash = '#/market';
      return;
    }
    if (!SCREENS.includes(screen) && screen !== 'market') screen = 'splash';
    show(screen);
    if (push !== false) location.hash = '#/' + screen;
  }

  function show(screen) {
    const all = views.querySelectorAll('.view');
    all.forEach((v) => {
      const id = v.dataset.screen;
      const active = id === screen;
      v.classList.toggle('active', active);
      if (active) v.scrollTop = 0;
    });

    const view = document.getElementById('view-' + screen);
    const hideNav = !view || view.classList.contains('no-nav');
    bottomNav.classList.toggle('hidden', hideNav);

    const navKey = NAV_MAP[screen] || null;
    bottomNav.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.go === navKey);
    });

    picker.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.go === screen);
    });
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* —— Calendars —— */
  function buildCycleCalendar(container) {
    if (!container) return;
    const dows = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
    container.innerHTML = '';
    dows.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      container.appendChild(el);
    });

    // Sept 2026 starts Tuesday → offset 1 (Mon=0)
    const offset = 1;
    const daysInMonth = 30;
    const periodDays = new Set([1, 2, 3, 4, 5]);
    const today = 22;

    for (let i = 0; i < offset; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day muted';
      blank.textContent = String(31 - offset + 1 + i);
      container.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      if (periodDays.has(d)) cell.classList.add('period');
      if (d === today) cell.classList.add('today');
      cell.textContent = String(d);
      cell.title = d === today ? 'Aujourd’hui' : periodDays.has(d) ? 'Règles (saisie)' : '';
      container.appendChild(cell);
    }
  }

  function buildMoonCalendar(container) {
    if (!container) return;
    const dows = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
    container.innerHTML = '';
    dows.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      container.appendChild(el);
    });

    const offset = 1;
    const daysInMonth = 30;
    const today = 22;
    // Simple phase markers for demo
    const phases = {
      12: 'new',
      14: 'half',
      18: 'gib',
      22: 'gib',
      26: 'full',
    };

    for (let i = 0; i < offset; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day muted';
      blank.innerHTML = '<span></span>';
      container.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      if (d === today) cell.classList.add('today');
      const moon = phases[d];
      const moonHtml = moon
        ? `<span class="moon-dot ${moon}" aria-hidden="true"></span>`
        : '';
      cell.innerHTML = `<span>${d}</span>${moonHtml}`;
      container.appendChild(cell);
    }
  }


  /* —— Calculateur de menstruation —— */
  const CALC_KEY = 'ca_calc_v1';
  const FR_MONTHS = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];

  function parseYMD(str) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str || '');
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function toYMD(d) {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return y + '-' + mo + '-' + da;
  }

  function addDays(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }

  function formatFR(d) {
    return d.getDate() + ' ' + FR_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function daysBetween(a, b) {
    const ms = 24 * 60 * 60 * 1000;
    return Math.round((b.getTime() - a.getTime()) / ms);
  }

  function softPhase(dayInCycle, periodLen, cycleLen) {
    const mid = Math.max(periodLen + 2, Math.round(cycleLen / 2));
    const ovuStart = Math.max(periodLen + 1, mid - 1);
    const ovuEnd = Math.min(cycleLen, mid + 1);
    if (dayInCycle >= 1 && dayInCycle <= periodLen) {
      return { key: 'menstruelle', label: 'Menstruelle' };
    }
    if (dayInCycle > periodLen && dayInCycle < ovuStart) {
      return { key: 'folliculaire', label: 'Folliculaire' };
    }
    if (dayInCycle >= ovuStart && dayInCycle <= ovuEnd) {
      return { key: 'ovulatoire', label: 'Ovulatoire' };
    }
    return { key: 'luteale', label: 'Lutéale' };
  }

  function loadCalcInputs() {
    try {
      const raw = localStorage.getItem(CALC_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return {
      lastStart: DEMO.cycle.lastPeriodStart,
      periodLen: DEMO.cycle.avgPeriod,
      cycleLen: DEMO.cycle.avgCycle,
    };
  }

  function saveCalcInputs(data) {
    try {
      localStorage.setItem(CALC_KEY, JSON.stringify(data));
    } catch (_) { /* ignore */ }
  }

  function computeCalc(lastStart, periodLen, cycleLen, today) {
    const start = parseYMD(lastStart);
    if (!start) return null;
    const p = Math.min(10, Math.max(2, Number(periodLen) || 5));
    const c = Math.min(45, Math.max(21, Number(cycleLen) || 28));
    const todayD = today || parseYMD(DEMO.today) || new Date();
    todayD.setHours(0, 0, 0, 0);

    // Advance last start to most recent cycle start on or before today when possible
    let cycleStart = start;
    if (start.getTime() <= todayD.getTime()) {
      const elapsed = daysBetween(start, todayD);
      const cyclesPassed = Math.floor(elapsed / c);
      cycleStart = addDays(start, cyclesPassed * c);
    }

    const nextPeriod = addDays(cycleStart, c);
    // If cycleStart is in the future (user entered future date), next = that start
    const nextStart =
      cycleStart.getTime() > todayD.getTime() ? cycleStart : nextPeriod;
    // Prefer: nextPeriod = lastStart + cycleLength from the original lastStart chain
    // Spec: nextPeriod = lastStart + cycleLength — show that first occurrence after lastStart
    // Also show current day if lastStart in past
    const firstNext = addDays(start, c);
    // For "prochaines règles": if firstNext still in past, keep adding cycles
    let upcomingStart = firstNext;
    while (upcomingStart.getTime() <= todayD.getTime()) {
      upcomingStart = addDays(upcomingStart, c);
    }
    const upcomingEnd = addDays(upcomingStart, p - 1);

    let dayInCycle = null;
    let phase = null;
    if (start.getTime() <= todayD.getTime()) {
      const elapsed = daysBetween(start, todayD);
      dayInCycle = (elapsed % c) + 1;
      phase = softPhase(dayInCycle, p, c);
    }

    const periods = [];
    let cursor = upcomingStart;
    for (let i = 0; i < 3; i++) {
      periods.push({
        start: new Date(cursor),
        end: addDays(cursor, p - 1),
      });
      cursor = addDays(cursor, c);
    }

    return {
      periodLen: p,
      cycleLen: c,
      nextStart: upcomingStart,
      nextEnd: upcomingEnd,
      dayInCycle,
      phase,
      periods,
    };
  }

  function renderCalcResults(res) {
    const box = document.getElementById('calcResults');
    const always = document.getElementById('calcDisclaimerAlways');
    if (!box || !res) return;
    box.hidden = false;
    if (always) always.hidden = true;

    const dayNum = document.getElementById('calcDayNum');
    const dayLine = document.getElementById('calcDayLine');
    const phaseLabel = document.getElementById('calcPhaseLabel');
    const nextStart = document.getElementById('calcNextStart');
    const nextEnd = document.getElementById('calcNextEnd');
    const upcoming = document.getElementById('calcUpcoming');
    const ring = document.getElementById('calcRingProgress');

    if (nextStart) nextStart.textContent = formatFR(res.nextStart);
    if (nextEnd) nextEnd.textContent = formatFR(res.nextEnd);

    if (res.dayInCycle != null) {
      if (dayNum) dayNum.textContent = String(res.dayInCycle);
      if (dayLine) {
        dayLine.textContent =
          'Jour ' + res.dayInCycle + ' / ' + res.cycleLen + ' (estimation)';
      }
      if (phaseLabel) {
        phaseLabel.textContent = 'Phase ' + res.phase.label.toLowerCase();
      }
      if (ring) {
        const circ = 2 * Math.PI * 30;
        const frac = Math.min(1, res.dayInCycle / res.cycleLen);
        ring.setAttribute(
          'stroke-dasharray',
          (circ * frac).toFixed(2) + ' ' + circ.toFixed(2)
        );
      }
    } else {
      if (dayNum) dayNum.textContent = '—';
      if (dayLine) {
        dayLine.textContent = 'Date de début dans le futur — jour non calculé';
      }
      if (phaseLabel) phaseLabel.textContent = 'Phase estimée';
      if (ring) ring.setAttribute('stroke-dasharray', '0 188.5');
    }

    if (upcoming) {
      upcoming.innerHTML = '';
      res.periods.forEach((per, i) => {
        const li = document.createElement('li');
        li.innerHTML =
          '<span class="n">#' +
          (i + 1) +
          '</span><span class="r">' +
          formatFR(per.start) +
          ' → ' +
          formatFR(per.end) +
          '</span>';
        upcoming.appendChild(li);
      });
    }
  }

  function bindCalculator() {
    const form = document.getElementById('calcForm');
    if (!form) return;
    const lastEl = document.getElementById('calcLastStart');
    const perEl = document.getElementById('calcPeriodLen');
    const cycEl = document.getElementById('calcCycleLen');
    const saved = loadCalcInputs();
    if (lastEl && saved.lastStart) lastEl.value = saved.lastStart;
    if (perEl && saved.periodLen) perEl.value = saved.periodLen;
    if (cycEl && saved.cycleLen) cycEl.value = saved.cycleLen;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const lastStart = lastEl && lastEl.value;
      const periodLen = perEl && perEl.value;
      const cycleLen = cycEl && cycEl.value;
      if (!lastStart) {
        toast('Indique le début des dernières règles');
        return;
      }
      const data = {
        lastStart: lastStart,
        periodLen: Number(periodLen) || 5,
        cycleLen: Number(cycleLen) || 28,
      };
      saveCalcInputs(data);
      const res = computeCalc(data.lastStart, data.periodLen, data.cycleLen);
      if (!res) {
        toast('Date invalide');
        return;
      }
      renderCalcResults(res);
      toast('Estimation mise à jour ✦');
    });
  }

  /* —— Interactions —— */
  function bindClicks() {
    document.body.addEventListener('click', (e) => {
      const goEl = e.target.closest('[data-go]');
      if (goEl && goEl.dataset.go) {
        e.preventDefault();
        go(goEl.dataset.go);
      }
    });

    // Disclaimer gate
    const check = document.getElementById('disclaimerCheck');
    const btn = document.getElementById('btnAcceptDisclaimer');
    if (check && btn) {
      check.addEventListener('change', () => {
        btn.disabled = !check.checked;
      });
      btn.addEventListener('click', () => {
        if (!check.checked) return;
        try {
          localStorage.setItem(
            'ca_mock_disclaimer',
            JSON.stringify({ accepted: true, at: new Date().toISOString() })
          );
        } catch (_) { /* ignore */ }
        toast('Disclaimer accepté · bienvenue');
      });
    }

    // Mood chips
    const moodChips = document.getElementById('moodChips');
    if (moodChips) {
      moodChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        moodChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    }

    // Symptoms
    document.querySelectorAll('#symptomList .symptom-item').forEach((item) => {
      item.addEventListener('change', () => {
        const input = item.querySelector('input');
        item.classList.toggle('selected', input && input.checked);
      });
      item.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        const input = item.querySelector('input');
        if (input) {
          input.checked = !input.checked;
          item.classList.toggle('selected', input.checked);
        }
      });
    });

    // Energy
    const energySlider = document.getElementById('energySlider');
    const energyLabel = document.getElementById('energyLabel');
    if (energySlider) {
      energySlider.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-e]');
        if (!b) return;
        energySlider.querySelectorAll('button').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        if (energyLabel) energyLabel.textContent = b.dataset.e + ' / 5';
      });
    }

    // Save check-in
    const saveBtn = document.getElementById('btnSaveCheckin');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        toast('Check-in enregistré ✦');
      });
    }

    // History toggle
    const hist = document.getElementById('historyPanel');
    const form = document.getElementById('checkinForm');
    const toggleHistory = document.getElementById('toggleHistory');
    const backToCheckin = document.getElementById('backToCheckin');
    if (toggleHistory && hist && form) {
      toggleHistory.addEventListener('click', () => {
        hist.hidden = false;
        form.hidden = true;
      });
    }
    if (backToCheckin && hist && form) {
      backToCheckin.addEventListener('click', () => {
        hist.hidden = true;
        form.hidden = false;
      });
    }

    // Disclaimer reread
    const disc = document.getElementById('disclaimerReread');
    const showD = document.getElementById('btnShowDisclaimer');
    const hideD = document.getElementById('btnHideDisclaimer');
    if (showD && disc) {
      showD.addEventListener('click', () => {
        disc.hidden = false;
        disc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
    if (hideD && disc) {
      hideD.addEventListener('click', () => {
        disc.hidden = true;
      });
    }

    // Period edit stub
    const editPeriod = document.getElementById('btnEditPeriod');
    if (editPeriod) {
      editPeriod.addEventListener('click', () => {
        toast('Sheet édition période (démo)');
      });
    }
  }

  function buildPicker() {
    const labels = {
      splash: '1 · Splash',
      onboarding: '2 · Disclaimer',
      today: '3 · Aujourd’hui',
      cycle: '4 · Cycle menstruel',
      moon: '5 · Lune',
      astro: '6 · Astro',
      path: '7 · Chemin',
      journal: '8 · Journal',
      profile: '9 · Profil',
      calculator: '10 · Calculateur',
    };
    SCREENS.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.go = s;
      b.textContent = labels[s] || s;
      picker.appendChild(b);
    });
  }

  function tickClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    if (clockEl) clockEl.textContent = h + ':' + m;
  }

  function init() {
    buildPicker();
    buildCycleCalendar(document.getElementById('cycleCalendar'));
    buildMoonCalendar(document.getElementById('moonCalendar'));
    bindClicks();
    bindCalculator();
    tickClock();
    setInterval(tickClock, 30000);

    window.addEventListener('hashchange', () => show(parseHash()));
    const initial = parseHash();
    show(initial);
    if (!location.hash) location.hash = '#/' + initial;

    // Expose demo for console inspection
    window.CycleAstroDemo = DEMO;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
