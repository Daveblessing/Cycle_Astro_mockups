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
  ];

  const NAV_MAP = {
    today: 'today',
    cycle: 'cycle',
    moon: 'today',
    astro: 'today',
    path: 'today',
    journal: 'journal',
    profile: 'profile',
  };

  const views = document.getElementById('views');
  const bottomNav = document.getElementById('bottomNav');
  const toastEl = document.getElementById('toast');
  const picker = document.getElementById('screenPicker');
  const clockEl = document.getElementById('clock');

  function parseHash() {
    const raw = (location.hash || '#/splash').replace(/^#\/?/, '');
    const screen = raw.split('/')[0] || 'splash';
    return SCREENS.includes(screen) || screen === 'market' ? screen : 'splash';
  }

  function go(screen, push) {
    if (!screen) return;
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
