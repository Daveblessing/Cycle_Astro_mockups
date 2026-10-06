/**
 * Cycle & Astro · v1.3.0
 * Navigation hash légère + profil complet multi-personnes (pas de backend)
 * King Daveblessing · Abidjan · FR + EN/ES/PT/中文 · bien-être, pas un avis médical
 */
(function () {
  'use strict';

  /* —— Configuration (un seul endroit) ——
   * MARKET_URL : adresse du King Daveblessing Market pour « Retour au Market ».
   * Tunnel TEMPORAIRE : à remplacer par le domaine définitif quand il sera en ligne.
   */
  const MARKET_URL = 'https://followed-electronic-midwest-arrange.trycloudflare.com/#/';
  const APP_VERSION = '1.3.0';

  /* Clés localStorage (tout reste sur le téléphone, aucun serveur). */
  const LANG_KEY = 'ca_lang_v1';
  const CONSENT_KEY = 'ca_consent_cycle_v1';
  const JOURNAL_KEY = 'ca_journal_v1';
  /* Données de cycle effacées par « Supprimer mes données de cycle » (jamais ca_plan_v1). */
  const CYCLE_DATA_KEYS = ['ca_calc_v1', JOURNAL_KEY, 'ca_period_edits_v1', 'ca_periods_v1', CONSENT_KEY];

  const I18N = window.CA_I18N || null;
  let currentLang = 'fr';

  function getLang() {
    try {
      const v = localStorage.getItem(LANG_KEY);
      if (I18N && I18N.CODES.includes(v)) return v;
    } catch (_) { /* ignore */ }
    return 'fr';
  }

  /** t('Texte français', { d: '...' }) → traduction dans la langue choisie. */
  function t(fr, vars) {
    let out = fr;
    if (I18N && currentLang !== 'fr') {
      const e = I18N.DICT[fr];
      if (e && e[currentLang]) out = e[currentLang];
    }
    if (vars) {
      Object.keys(vars).forEach((k) => {
        out = out.split('{' + k + '}').join(vars[k]);
      });
    }
    return out;
  }

  function fmtDate(d, opts) {
    if (I18N) return I18N.formatDate(d, currentLang, opts);
    return d.getDate() + ' ' + d.getMonth() + ' ' + d.getFullYear();
  }

  /** Mois de référence démo forcé : septembre 2026 (même si Date() réelle dérive). */
  const DEMO_REF_MONTH = { year: 2026, month: 8, label: 'Septembre 2026' }; // month 0-index

  const DEMO = {
    displayName: 'Aïcha',
    birthDate: '1998-09-17',
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
      dayInCycle: 23,
      avgCycle: 28,
      avgPeriod: 5,
      lastPeriodStart: '2026-09-01',
      lastPeriodEnd: '2026-09-05',
      nextPeriodEst: '2026-09-29',
    },
    moon: {
      phase: 'Gibbeuse croissante', // calculée : 23 sept. 2026, Lune en Verseau
      illumination: 89,
    },
    today: '2026-09-23',
  };

  /* —— Forfaits (paiement branché plus tard par le Market) ——
   * localStorage key: ca_plan_v1
   * values: aucun | astro | cycle | les_deux
   * window.CycleAstroPlan.set est réservé au pont paiement / Market — ne pas l’appeler depuis l’UI.
   */
  const PLAN_KEY = 'ca_plan_v1';
  const PLAN_VALUES = ['aucun', 'astro', 'cycle', 'les_deux'];
  const PLAN_NONE = 'aucun';
  let lockIntent = 'astro'; // 'astro' | 'cycle' — domaine demandé quand verrouillé

  const ASTRO_SCREENS = ['astro', 'path', 'reading'];
  const CYCLE_SCREENS = ['cycle', 'calculator', 'journal'];

  function getPlan() {
    try {
      const v = localStorage.getItem(PLAN_KEY);
      if (PLAN_VALUES.includes(v)) return v;
    } catch (_) { /* ignore */ }
    return PLAN_NONE;
  }

  function setPlan(next) {
    const v = PLAN_VALUES.includes(next) ? next : PLAN_NONE;
    try {
      localStorage.setItem(PLAN_KEY, v);
    } catch (_) { /* ignore */ }
    return v;
  }

  function canAccessAstro() {
    const p = getPlan();
    return p === 'astro' || p === 'les_deux';
  }

  function canAccessCycle() {
    const p = getPlan();
    return p === 'cycle' || p === 'les_deux';
  }

  function setLockIntent(domain) {
    lockIntent = domain === 'cycle' ? 'cycle' : 'astro';
  }

  function resolveView(screen) {
    if (ASTRO_SCREENS.includes(screen) && !canAccessAstro()) {
      setLockIntent('astro');
      return 'plans';
    }
    if (CYCLE_SCREENS.includes(screen) && !canAccessCycle()) {
      setLockIntent('cycle');
      return 'plans';
    }
    return screen;
  }

  function updatePlansView() {
    const view = document.getElementById('view-plans');
    if (!view) return;
    const title = document.getElementById('plansTitle');
    const lead = document.getElementById('plansLead');
    const badge = document.getElementById('plansBadge');
    const domain = lockIntent === 'cycle' ? 'Cycle menstruel' : 'Astrologie';
    if (title) title.textContent = t('Contenu verrouillé');
    if (lead) {
      lead.textContent =
        lockIntent === 'cycle'
          ? t('Cet espace Cycle menstruel demande un forfait actif.')
          : t('Cet espace Astrologie demande un forfait actif.');
    }
    if (badge) badge.textContent = t(domain);
    const plan = getPlan();
    view.querySelectorAll('[data-plan-id]').forEach((card) => {
      card.classList.toggle('is-current', card.dataset.planId === plan && plan !== PLAN_NONE);
    });
    const status = document.getElementById('plansStatus');
    if (status) {
      const labels = {
        aucun: 'Aucun forfait actif',
        astro: 'Forfait Astrologie actif',
        cycle: 'Forfait Cycle menstruel actif',
        les_deux: 'Forfait Astro + Cycle actif',
      };
      status.textContent = t(labels[plan] || labels.aucun);
    }
  }

  const SCREENS = [
    'splash',
    'onboarding',
    'today',
    'cycle',
    'moon',
    'astro',
    'path',
    'reading',
    'journal',
    'profile',
    'calculator',
    'plans',
  ];

  const SCREEN_ALIASES = {
    calc: 'calculator',
    'profil-complet': 'reading',
    profil: 'reading',
  };

  const NAV_MAP = {
    today: 'today',
    cycle: 'cycle',
    moon: 'today',
    astro: 'today',
    path: 'today',
    reading: 'today',
    journal: 'journal',
    profile: 'profile',
    calculator: 'profile',
    plans: 'splash',
  };

  const views = document.getElementById('views');
  const bottomNav = document.getElementById('bottomNav');
  const toastEl = document.getElementById('toast');
  const picker = document.getElementById('screenPicker');
  const clockEl = document.getElementById('clock');

  function parseHash() {
    const raw = (location.hash || '#/today').replace(/^#\/?/, '');
    let screen = raw.split('/')[0] || 'today';
    if (SCREEN_ALIASES[screen]) screen = SCREEN_ALIASES[screen];
    return SCREENS.includes(screen) ? screen : 'today';
  }

  function go(screen, push) {
    if (!screen) return;
    if (SCREEN_ALIASES[screen]) screen = SCREEN_ALIASES[screen];
    if (screen === 'market') {
      backToMarket();
      return;
    }
    if (!SCREENS.includes(screen)) screen = 'splash';
    show(screen);
    if (push !== false) location.hash = '#/' + screen;
  }

  function show(screen) {
    const requested = screen;
    const viewScreen = resolveView(screen);
    if (viewScreen === 'plans') updatePlansView();

    const all = views.querySelectorAll('.view');
    all.forEach((v) => {
      const id = v.dataset.screen;
      const active = id === viewScreen;
      v.classList.toggle('active', active);
      if (active) v.scrollTop = 0;
    });

    const view = document.getElementById('view-' + viewScreen);
    const hideNav = !view || view.classList.contains('no-nav');
    bottomNav.classList.toggle('hidden', hideNav);

    const navKey = NAV_MAP[viewScreen] || null;
    bottomNav.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.go === navKey);
    });

    picker.querySelectorAll('button').forEach((btn) => {
      const goTarget = btn.dataset.go;
      btn.classList.toggle('active', goTarget === requested || (viewScreen === 'plans' && goTarget === 'plans'));
    });

    applyAmbiance(viewScreen === 'plans' ? 'gate' : viewScreen);
    applyI18n();
  }

  const AMBIANCE = {
    splash: 'gate',
    plans: 'gate',
    cycle: 'cycle',
    calculator: 'cycle',
    journal: 'cycle',
    astro: 'astro',
    reading: 'astro',
    moon: 'astro',
    path: 'astro',
  };

  function applyAmbiance(screen) {
    const phone = document.querySelector('.phone');
    if (!phone) return;
    const mode = AMBIANCE[screen] || 'night';
    phone.classList.remove('ambiance-gate', 'ambiance-cycle', 'ambiance-astro', 'ambiance-night');
    phone.classList.add('ambiance-' + mode);
  }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = t(msg);
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  function rippleAt(el, evt) {
    /* Designer : rien ne bouge sous le doigt. Pas d'onde au tap. */
    return;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const wave = document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.width = wave.style.height = size + 'px';
    const x = (evt && evt.clientX != null ? evt.clientX : rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (evt && evt.clientY != null ? evt.clientY : rect.top + rect.height / 2) - rect.top - size / 2;
    wave.style.left = x + 'px';
    wave.style.top = y + 'px';
    const style = getComputedStyle(el);
    if (style.position === 'static') el.style.position = 'relative';
    if (style.overflow === 'visible') el.style.overflow = 'hidden';
    el.appendChild(wave);
    setTimeout(() => wave.remove(), 480);
  }

  /* —— Calendars —— */
  function buildCycleCalendar(container) {
    if (!container) return;
    const dows = I18N ? I18N.DOWS[currentLang] : ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
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
    const today = 23;

    for (let i = 0; i < offset; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day muted';
      blank.textContent = String(31 - offset + 1 + i);
      container.appendChild(blank);
    }

    // v1.2.0 : chaque jour prend la couleur foncée de sa phase (moteur D0, P, C),
    // + repère « aujourd’hui » + phases principales de la Lune (calculées).
    for (let d = 1; d <= daysInMonth; d++) {
      const date = parseYMD('2026-09-' + String(d).padStart(2, '0'));
      const snap = computeCalc(DEMO.cycle.lastPeriodStart, DEMO.cycle.avgPeriod, DEMO.cycle.avgCycle, date);
      const key = snap ? snap.phase.key : 'luteale';
      const cell = document.createElement('div');
      cell.className = 'cal-day ph-day ph-' + key;
      if (d === today) cell.classList.add('today');
      const moon = majorMoonOn(date);
      cell.innerHTML =
        '<span class="cd-num">' + d + '</span>' +
        (d === today ? '<span class="cd-today" aria-hidden="true">' + escapeHtml(t('auj.')) + '</span>' : '') +
        (moon ? '<span class="moon-mini ' + moon + '" aria-hidden="true"></span>' : '');
      const label = [fmtDate(date, { year: false }), t(PHASE_META[key].full)];
      if (d === today) label.push(t('Aujourd’hui'));
      if (moon) label.push(t(MAJOR_MOON_FR[moon]));
      cell.title = label.join(' · ');
      cell.setAttribute('aria-label', label.join(' · '));
      cell.setAttribute('role', 'gridcell');
      container.appendChild(cell);
    }
  }

  function buildMoonCalendar(container) {
    if (!container) return;
    const dows = I18N ? I18N.DOWS[currentLang] : ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
    container.innerHTML = '';
    dows.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      container.appendChild(el);
    });

    const offset = 1;
    const daysInMonth = 30;
    const today = 23;
    // v1.2.0 : phases principales calculées (Soleil + Lune), septembre 2026
    const phases = {};
    const cls = { new: 'new', fq: 'half', full: 'full', lq: 'lq' };
    for (let d = 1; d <= daysInMonth; d++) {
      const m = majorMoonOn(new Date(2026, 8, d));
      if (m) phases[d] = cls[m];
    }
    if (!phases[today]) phases[today] = 'gib';

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



  /* —— Lecture complète Chemin / Astro (générateur P0) —— */
  function reduceDigits(n) {
    n = Math.abs(Math.floor(Number(n) || 0));
    while (n > 9) {
      n = String(n)
        .split('')
        .reduce((a, d) => a + Number(d), 0);
    }
    return n || 9;
  }

  function lifePathFromDate(iso) {
    // Sum all digits of YYYYMMDD, reduce 1–9 (no masters in P0)
    const compact = String(iso || '').replace(/\D/g, '');
    if (compact.length < 8) return null;
    const sum = compact.split('').reduce((a, d) => a + Number(d), 0);
    return reduceDigits(sum);
  }

  function dayVibeFromDate(iso) {
    const parts = String(iso || '').split('-');
    if (parts.length < 3) return null;
    const day = Number(parts[2]);
    if (!day) return null;
    return { day: day, vibe: reduceDigits(day) };
  }

  /** Tropic approx FR — returns { sign, decan 1|2|3, startLabel } */
  function sunSignDecan(iso) {
    const parts = String(iso || '').split('-').map(Number);
    if (parts.length < 3) return null;
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];
    // (month, day) inclusive ranges — last day of each sign
    const table = [
      { sign: 'Capricorne', from: [12, 22], to: [1, 19] },
      { sign: 'Verseau', from: [1, 20], to: [2, 18] },
      { sign: 'Poissons', from: [2, 19], to: [3, 20] },
      { sign: 'Bélier', from: [3, 21], to: [4, 19] },
      { sign: 'Taureau', from: [4, 20], to: [5, 20] },
      { sign: 'Gémeaux', from: [5, 21], to: [6, 20] },
      { sign: 'Cancer', from: [6, 21], to: [7, 22] },
      { sign: 'Lion', from: [7, 23], to: [8, 22] },
      { sign: 'Vierge', from: [8, 23], to: [9, 22] },
      { sign: 'Balance', from: [9, 23], to: [10, 22] },
      { sign: 'Scorpion', from: [10, 23], to: [11, 21] },
      { sign: 'Sagittaire', from: [11, 22], to: [12, 21] },
    ];

    function md(m0, d0) {
      return m0 * 100 + d0;
    }
    const cur = md(m, d);
    let sign = null;
    let fromMD = null;
    let toMD = null;
    for (const row of table) {
      const f = md(row.from[0], row.from[1]);
      const t = md(row.to[0], row.to[1]);
      let hit;
      if (f <= t) hit = cur >= f && cur <= t;
      else hit = cur >= f || cur <= t; // Capricorne wraps year
      if (hit) {
        sign = row.sign;
        fromMD = row.from;
        toMD = row.to;
        break;
      }
    }
    if (!sign) return null;

    // Build day index 0..~29 within sign
    const days = [];
    let mm = fromMD[0];
    let dd = fromMD[1];
    // iterate up to 32 days
    for (let i = 0; i < 32; i++) {
      days.push([mm, dd]);
      if (mm === toMD[0] && dd === toMD[1]) break;
      const dim = new Date(y, mm, 0).getDate(); // days in month mm
      dd += 1;
      if (dd > dim) {
        dd = 1;
        mm += 1;
        if (mm > 12) mm = 1;
      }
    }
    let idx = days.findIndex(([a, b]) => a === m && b === d);
    if (idx < 0) idx = 0;
    const third = Math.max(1, Math.ceil(days.length / 3));
    let decan = 1;
    if (idx >= third * 2) decan = 3;
    else if (idx >= third) decan = 2;
    return { sign: sign, decan: decan, dayIndex: idx, signLen: days.length };
  }

  const PATH_COPY = {
    1: {
      title: "L’élan / le pionnier",
      mission: "Ta mission d’âme, sur le chemin 1, évoque celle de l’initiatrice et de l’initiateur : ouvrir des portes que personne n’avait encore franchies, formuler une vision claire, puis oser le premier pas sans attendre une permission extérieure. Ce n’est pas une injonction à tout porter seul·e ni à dominer — c’est une invitation à honorer ton feu intérieur, à te faire confiance assez pour démarrer, puis à laisser la collaboration enrichir ce que tu as commencé. Le 1 rappelle que l’élan naît souvent d’une écoute fine de soi, avant même d’être visible pour les autres.",
      strengths: ["Capacité à démarrer là où d’autres hésitent encore — tu sens le « timing » du premier pas.", "Vision claire : tu sais souvent formuler l’essentiel d’un projet en peu de mots.", "Leadership doux : tu inspires plus par l’exemple et la cohérence que par la contrainte.", "Autonomie saine : tu sais te ressourcer sans dépendre excessivement de la validation.", "Courage relationnel : tu peux nommer ce qui ne va pas, avec franchise et respect.", "Créativité d’action : tu transformes une idée floue en micro-protocole concret.", "Résilience de démarrage : après un arrêt, tu sais relancer sans dramatiser l’échec."],
      shadows: ["Tout porter seul·e → transformer en : demander une aide ciblée sur une seule étape.", "Impatience / brusquerie → transformer en : laisser 24 h entre l’élan et la décision définitive.", "Besoin de contrôle → transformer en : clarifier le cadre, puis déléguer le « comment ».", "Peur de dépendre → transformer en : choisir des alliances courtes et réversibles pour tester la confiance.", "Comparaison avec les « leaders » bruyants → transformer en : honorer ton style d’élan (discret ou visible)."],
      inRelations: "En relations, le 1 aime la clarté et le respect de l’espace. Tu te sens vivant·e quand l’autre reconnaît ton initiative sans la concurrencer. L’invitation : pratiquer l’écoute aussi attentivement que tu pratiques l’élan — le lien se nourrit d’un va-et-vient, pas d’une course.",
      inWork: "Au travail, tu excelles souvent à lancer, cadrer, décider. Les environnements trop figés peuvent t’étouffer ; ceux trop chaotiques te fatiguent. Cherche des rôles où tu peux ouvrir une voie, puis transmettre le flambeau sans t’effacer.",
      inEnergy: "Ton énergie personnelle aime les démarrages nets et les rituels de « première page ». Quand tu te sens dispersé·e, un seul micro-objectif clair (15 minutes) suffit souvent à rallumer la flamme — sans exiger la perfection du jour 1.",
      domains: ["Entrepreneuriat / lancement de projet", "Direction de produit ou d’équipe légère", "Conseil en stratégie de démarrage", "Création de contenu « pionnier » (essais, manifeste)", "Animation d’ateliers d’idéation", "Sport / coaching de performance douce", "Innovation sociale locale", "Négociation de nouveaux partenariats"],
      weekPlan: ["Jour 1 — Nomme un projet qui n’attend que ton premier pas (une phrase).", "Jour 2 — Pose une micro-action de 20 minutes liée à ce projet.", "Jour 3 — Demande un avis à une personne de confiance (une question précise).", "Jour 4 — Observe où tu veux tout contrôler ; relâche une seule variable.", "Jour 5 — Célèbre un petit démarrage (même imparfait) dans ton journal.", "Jour 6 — Offre-toi un vrai repos actif (marche, silence, corps) sans « productivité ».", "Jour 7 — Reformule ta vision en 3 mots ; garde-les visibles cette semaine."],
      mirrors: ["Qu’est-ce que je n’ose démarrer que parce que j’attends une permission ?", "Où mon leadership pourrait-il devenir plus doux sans perdre sa clarté ?", "De quelle autonomie ai-je vraiment besoin — et laquelle est une armure ?", "Qui pourrais-je laisser m’aider sur une seule étape cette semaine ?", "Quel « premier pas » serait déjà un succès, même s’il est minuscule ?"],
      paras: ["Ta mission d’âme, sur le chemin 1, évoque celle de l’initiatrice et de l’initiateur : ouvrir des portes que personne n’avait encore franchies, formuler une vision claire, puis oser le premier pas sans attendre une permission extérieure. Ce n’est pas une injonction à tout porter seul·e ni à dominer — c’est une invitation à honorer ton feu intérieur, à te faire confiance assez pour démarrer, puis à laisser la collaboration enrichir ce que tu as commencé. Le 1 rappelle que l’élan naît souvent d’une écoute fine de soi, avant même d’être visible pour les autres."],
      invites: ["Jour 1 — Nomme un projet qui n’attend que ton premier pas (une phrase).", "Jour 2 — Pose une micro-action de 20 minutes liée à ce projet.", "Jour 3 — Demande un avis à une personne de confiance (une question précise).", "Jour 4 — Observe où tu veux tout contrôler ; relâche une seule variable.", "Jour 5 — Célèbre un petit démarrage (même imparfait) dans ton journal."],
      gifts: ["Entrepreneuriat / lancement de projet", "Direction de produit ou d’équipe légère", "Conseil en stratégie de démarrage", "Création de contenu « pionnier » (essais, manifeste)"],
    },
    2: {
      title: "L’harmonie / la coopération",
      mission: "Sur le chemin 2, ta mission d’âme évoque l’art de tisser des ponts : sentir les climats relationnels, créer de l’alliance, et faire émerger des solutions que personne n’aurait trouvées seul·e. Ce n’est pas une obligation d’effacement ni de « paix à tout prix » — c’est une invitation à l’harmonie juste, celle qui inclut tes besoins. Le 2 rappelle que la sensibilité peut être une stratégie fine : écouter, temporiser, puis proposer le geste qui relie.",
      strengths: ["Diplomatie naturelle : tu désamorces souvent les tensions avant qu’elles n’explosent.", "Écoute profonde : tu entends ce qui n’est pas dit et tu sais le reformuler avec tact.", "Sens du timing relationnel : tu sais quand avancer et quand laisser mûrir.", "Capacité à co-créer : tu excelles dans les duos, binômes et collectifs souples.", "Médiation : tu aides les points de vue opposés à se rencontrer sans perdant·e.", "Empathie opérationnelle : tu traduis les émotions en besoins concrets.", "Esthétique du lien : tu soignes les détails qui font se sentir accueilli·e."],
      shadows: ["S’effacer pour « garder la paix » → transformer en : poser un non doux et daté.", "Absorption émotionnelle → transformer en : rituels de décharge (marche, journal, eau).", "Attente que l’autre devine → transformer en : formuler un besoin en une phrase claire.", "Indécision prolongée → transformer en : choisir une option pour 7 jours, puis réévaluer.", "Peur du conflit → transformer en : voir le désaccord comme information, pas comme rupture."],
      inRelations: "En relations, tu te sens nourri·e par la réciprocité et la douceur du rythme. Tu donnes beaucoup ; l’invitation est d’oser recevoir autant. Les partenariats qui te voient vraiment te stabilisent plus que les liens « utiles » mais froids.",
      inWork: "Au travail, tu brilles dans la coordination, le support client sensible, la médiation d’équipe, les projets à plusieurs voix. Attention aux environnements hyper compétitifs qui nient le soin : ton talent y est précieux, mais il demande un cadre protecteur.",
      inEnergy: "Ton énergie aime les binômes et les espaces calmes. Quand tu te sens « trop poreux·se », réduis les stimuli et choisis une seule conversation profonde plutôt que dix échanges superficiels.",
      domains: ["Médiation / facilitation de dialogue", "Ressources humaines & culture d’équipe", "Accompagnement relationnel / coaching de couple (non clinique)", "Coordination de projets collaboratifs", "Service client premium / expérience utilisateur", "Arts du soin de l’espace (accueil, hospitalité)", "Écriture diplomatique / communication institutionnelle", "Partenariats & alliances stratégiques"],
      weekPlan: ["Jour 1 — Liste 3 liens qui te nourrissent vraiment (et 1 qui te vide).", "Jour 2 — Pose un « non » bienveillant sur une sollicitation légère.", "Jour 3 — Offre une écoute de 15 minutes sans conseiller (juste accueillir).", "Jour 4 — Formule un besoin à quelqu’un·e en une phrase claire.", "Jour 5 — Crée un petit rituel de duo (thé, marche, appel) avec une personne choisie.", "Jour 6 — Décharge émotionnelle : journal ou marche sans téléphone.", "Jour 7 — Remercie quelqu’un·e pour un geste précis qui t’a aidé·e."],
      mirrors: ["Où est-ce que je confonds harmonie et silence sur mes besoins ?", "Quel conflit évité pourrait, nommé avec douceur, libérer de l’espace ?", "Comment puis-je recevoir sans me sentir redevable ?", "Quelle alliance actuelle me grandit — et laquelle me réduit ?", "De quelle solitude nourrissante ai-je besoin pour mieux relier ensuite ?"],
      paras: ["Sur le chemin 2, ta mission d’âme évoque l’art de tisser des ponts : sentir les climats relationnels, créer de l’alliance, et faire émerger des solutions que personne n’aurait trouvées seul·e. Ce n’est pas une obligation d’effacement ni de « paix à tout prix » — c’est une invitation à l’harmonie juste, celle qui inclut tes besoins. Le 2 rappelle que la sensibilité peut être une stratégie fine : écouter, temporiser, puis proposer le geste qui relie."],
      invites: ["Jour 1 — Liste 3 liens qui te nourrissent vraiment (et 1 qui te vide).", "Jour 2 — Pose un « non » bienveillant sur une sollicitation légère.", "Jour 3 — Offre une écoute de 15 minutes sans conseiller (juste accueillir).", "Jour 4 — Formule un besoin à quelqu’un·e en une phrase claire.", "Jour 5 — Crée un petit rituel de duo (thé, marche, appel) avec une personne choisie."],
      gifts: ["Médiation / facilitation de dialogue", "Ressources humaines & culture d’équipe", "Accompagnement relationnel / coaching de couple (non clinique)", "Coordination de projets collaboratifs"],
    },
    3: {
      title: "L’expression / la créativité",
      mission: "Ta mission d’âme, sur le chemin 3, évoque celle du Verbe incarné : laisser circuler idées, humour, présence et projets partagés, pour créer des ponts entre les personnes. Ce n’est pas une obligation de « performer » ni d’être toujours brillant·e — c’est une invitation à exprimer ce qui cherche à s’offrir, avec authenticité. Beaucoup de personnes sur ce chemin ressentent un besoin naturel de communiquer, d’inspirer, de mettre de la lumière dans les échanges. Explorer le 3, c’est aussi apprendre à canaliser l’élan : trop de directions disperse ; une expression claire et incarnée devient un cadeau.",
      strengths: ["Éloquence naturelle : tu sais rendre une idée complexe accessible et vivante.", "Créativité relationnelle : tu inventes des formats pour faire se rencontrer les gens.", "Optimisme contagieux : ta présence peut alléger un climat sans nier la réalité.", "Agilité mentale : tu rebondis, associes, improvises avec finesse.", "Charme du partage : tu invites à participer plutôt qu’à consommer passivement.", "Sens du rythme : tu sens quand une phrase, une pause ou une image touche juste.", "Capacité à inspirer : tu allumes souvent chez l’autre l’envie d’essayer."],
      shadows: ["Éparpillement multi-projets → transformer en : une priorité claire pour 7 jours.", "Peur du silence / du vide → transformer en : 10 minutes de non-production volontaire.", "Performance sociale → transformer en : une expression « vraie » même imparfaite.", "Promesses trop nombreuses → transformer en : dire « je te reviens sous 48 h ».", "Fuite dans le divertissement → transformer en : canaliser la joie vers un livrable concret.", "Sensibilité aux critiques → transformer en : filtrer les retours utiles vs les projections."],
      inRelations: "En relations, tu rayonnés quand le dialogue est vivant, ludique et sincère. Tu as besoin d’être entendu·e autant que d’entendre. L’invitation : laisser aussi de la place au silence partagé — il nourrit la créativité du lien.",
      inWork: "Au travail, tu excelles en communication, animation, création de contenu, enseignement léger, relations publiques. Les cadres trop rigides sans espace d’expression te vident ; un canal créatif régulier te recentre.",
      inEnergy: "Ton énergie monte avec le partage et baisse avec la dispersion. Un format unique (voix, écrit, atelier) tenu avec constance te donne plus de puissance qu’une avalanche d’idées non abouties.",
      domains: ["Relations publiques, négociation & commerce d’idées", "Conseil, coaching & enseignement / animation", "Création de contenu (écrit, audio, vidéo)", "Storytelling de marque & communication", "Facilitation d’ateliers créatifs", "Arts vivants / performance douce", "Stratégie d’entreprise relationnelle", "Community building & événements", "Traduction d’idées complexes pour le grand public"],
      weekPlan: ["Jour 1 — Choisis un seul canal d’expression pour la semaine (voix, écrit, image…).", "Jour 2 — Produis un micro-contenu de 10 minutes sans viser la perfection.", "Jour 3 — Partage-le à une personne (pas à tout le monde).", "Jour 4 — Note 3 idées « en trop » et mets-les en liste d’attente (pas à la poubelle).", "Jour 5 — Offre-toi 20 minutes de silence créatif (marche ou regard sans écran).", "Jour 6 — Anime un échange court : une question ouverte à quelqu’un·e.", "Jour 7 — Relis ce que tu as créé ; célèbre le mouvement, pas seulement le résultat."],
      mirrors: ["Qu’est-ce que je n’exprime pas encore, par peur d’être « trop » ?", "Où mon élan créatif se disperse-t-il — et quelle priorité me recentrerait ?", "Comment la joie peut-elle devenir une stratégie, pas une façade ?", "À qui pourrais-je offrir une parole vraie cette semaine ?", "Quel silence me serait aujourd’hui aussi créatif qu’une publication ?"],
      paras: ["Ta mission d’âme, sur le chemin 3, évoque celle du Verbe incarné : laisser circuler idées, humour, présence et projets partagés, pour créer des ponts entre les personnes. Ce n’est pas une obligation de « performer » ni d’être toujours brillant·e — c’est une invitation à exprimer ce qui cherche à s’offrir, avec authenticité. Beaucoup de personnes sur ce chemin ressentent un besoin naturel de communiquer, d’inspirer, de mettre de la lumière dans les échanges. Explorer le 3, c’est aussi apprendre à canaliser l’élan : trop de directions disperse ; une expression claire et incarnée devient un cadeau."],
      invites: ["Jour 1 — Choisis un seul canal d’expression pour la semaine (voix, écrit, image…).", "Jour 2 — Produis un micro-contenu de 10 minutes sans viser la perfection.", "Jour 3 — Partage-le à une personne (pas à tout le monde).", "Jour 4 — Note 3 idées « en trop » et mets-les en liste d’attente (pas à la poubelle).", "Jour 5 — Offre-toi 20 minutes de silence créatif (marche ou regard sans écran)."],
      gifts: ["Relations publiques, négociation & commerce d’idées", "Conseil, coaching & enseignement / animation", "Création de contenu (écrit, audio, vidéo)", "Storytelling de marque & communication"],
    },
    4: {
      title: "La structure / la fondation",
      mission: "Sur le chemin 4, ta mission d’âme évoque celle de la bâtisseuse et du bâtisseur : poser des fondations solides, des routines vivantes, des systèmes qui soutiennent la vie plutôt que de l’enfermer. Ce n’est pas une prison de rigidité — c’est une invitation à la fiabilité juste, celle qui libère de l’énergie pour créer. Le 4 rappelle que le travail invisible (méthode, constance, entretien) est aussi noble que l’éclat visible.",
      strengths: ["Organisation concrète : tu transformes le chaos en étapes claires.", "Fiabilité : on peut compter sur toi pour tenir un cadre dans la durée.", "Persévérance : tu avances même quand l’enthousiasme initial s’estompe.", "Sens du réel : tu vois ce qui est faisable et ce qui est fantasme.", "Qualité du détail utile : tu perfectionnes ce qui sert vraiment.", "Capacité à transmettre des méthodes : tu documentes et tu formes.", "Sécurité affective via la structure : tu crées des espaces stables pour les autres."],
      shadows: ["Rigidité excessive → transformer en : une règle « flexible à 20 % » chaque semaine.", "Surcharge de devoirs → transformer en : prioriser 3 blocs, pas 30 tâches.", "Peur de l’imprévu → transformer en : prévoir un créneau « buffer » volontaire.", "Critique de soi / des autres → transformer en : feedback factuel, sans jugement de valeur.", "Travail sans repos → transformer en : ritualiser la coupure (fin de journée nette)."],
      inRelations: "En relations, tu offres stabilité et présence concrète. Tu te sens aimé·e quand l’autre respecte tes engagements et tes rythmes. L’invitation : laisser aussi de la place au spontané — l’amour n’est pas qu’un planning.",
      inWork: "Au travail, tu excelles en opérations, gestion de projet, artisanat de qualité, finance pratique, construction de process. Les pivots constants sans cadre te fatiguent ; un projet long te nourrit.",
      inEnergy: "Ton énergie aime les rituels répétables. Quand tu te sens figé·e, change une seule variable (lieu, musique, durée) — pas tout le système.",
      domains: ["Gestion de projet / opérations", "Artisanat & métiers de précision", "Comptabilité / administration claire", "Architecture d’information / documentation", "Construction / aménagement d’espaces", "Formation méthodologique", "Qualité & processus d’amélioration continue", "Jardinage / permaculture / entretien vivant"],
      weekPlan: ["Jour 1 — Choisis une fondation à renforcer (sommeil, budget, espace de travail).", "Jour 2 — Crée une checklist simple de 5 points pour cette fondation.", "Jour 3 — Applique la checklist une fois, sans viser 100 %.", "Jour 4 — Identifie une rigidité ; assouplis-la volontairement aujourd’hui.", "Jour 5 — Documente ce qui marche (3 lignes) pour ton « futur toi ».", "Jour 6 — Jour buffer : laisse un créneau vide dans ton agenda.", "Jour 7 — Remercie le travail invisible que tu as fait cette semaine."],
      mirrors: ["Quelle structure me soutient vraiment — et laquelle m’enferme ?", "Où confonds-je solidité et contrôle ?", "Quel imprévu pourrais-je accueillir sans tout faire basculer ?", "Comment honorer mon besoin d’ordre sans juger celui des autres ?", "De quel repos la fiabilité a-t-elle besoin pour durer ?"],
      paras: ["Sur le chemin 4, ta mission d’âme évoque celle de la bâtisseuse et du bâtisseur : poser des fondations solides, des routines vivantes, des systèmes qui soutiennent la vie plutôt que de l’enfermer. Ce n’est pas une prison de rigidité — c’est une invitation à la fiabilité juste, celle qui libère de l’énergie pour créer. Le 4 rappelle que le travail invisible (méthode, constance, entretien) est aussi noble que l’éclat visible."],
      invites: ["Jour 1 — Choisis une fondation à renforcer (sommeil, budget, espace de travail).", "Jour 2 — Crée une checklist simple de 5 points pour cette fondation.", "Jour 3 — Applique la checklist une fois, sans viser 100 %.", "Jour 4 — Identifie une rigidité ; assouplis-la volontairement aujourd’hui.", "Jour 5 — Documente ce qui marche (3 lignes) pour ton « futur toi »."],
      gifts: ["Gestion de projet / opérations", "Artisanat & métiers de précision", "Comptabilité / administration claire", "Architecture d’information / documentation"],
    },
    5: {
      title: "Le mouvement / la liberté",
      mission: "Sur le chemin 5, ta mission d’âme évoque celle de l’exploratrice et de l’explorateur : apprendre par l’expérience, respirer large, faire circuler les idées et les horizons. Ce n’est pas une fuite permanente — c’est une invitation à la liberté responsable, celle qui choisit le mouvement plutôt que de le subir. Le 5 rappelle que la curiosité est une intelligence : elle élargit le monde, à condition de trouver aussi des ancres mobiles.",
      strengths: ["Adaptabilité vive : tu pivotes sans perdre ton centre trop longtemps.", "Curiosité fertile : tu apprends vite et tu connectes des mondes éloignés.", "Communication mobile : tu racontes le voyage et tu inspires le mouvement.", "Tolérance à l’incertitude : tu tiens mieux que beaucoup dans le flou temporaire.", "Sens de l’aventure juste : tu oses des expériences qui enrichissent vraiment.", "Agilité sociale : tu te glisses dans des cercles variés avec aisance.", "Créativité du changement : tu inventes des solutions quand le plan A tombe."],
      shadows: ["Dispersion / FOMO → transformer en : une exploration choisie, une seule à la fois.", "Fuite dès que ça devient sérieux → transformer en : rester 7 jours de plus avant de quitter.", "Excès de stimuli → transformer en : journée « basse entrée » (peu d’écrans).", "Engagements brisés → transformer en : promettre moins, tenir mieux.", "Restlessness corporelle → transformer en : mouvement conscient (marche, danse, sport doux)."],
      inRelations: "En relations, tu as besoin d’espace et de nouveauté partagée. Tu t’épanouis avec des partenaires qui voyagent (au sens large) avec toi, sans te posséder. L’invitation : offrir aussi de la constance émotionnelle — la liberté aime un port d’attache.",
      inWork: "Au travail, tu brilles dans le commercial terrain, le voyage, les médias, la formation mobile, le freelancing varié. Les routines ultra-rigides te figent ; un cadre souple avec des missions changeantes te vivifie.",
      inEnergy: "Ton énergie monte avec la variété et baisse avec l’ennui forcé. Des ancres légères (même heure de réveil, amitié stable, journal) te permettent d’explorer sans te perdre.",
      domains: ["Voyage / tourisme responsable / guides", "Journalisme / reportage / podcasts", "Formation & facilitation mobile", "Vente & développement commercial", "Événementiel & expériences immersives", "Langues & interculturel", "Design de services évolutifs", "Sport outdoor / coaching d’aventure douce"],
      weekPlan: ["Jour 1 — Choisis une seule exploration pour la semaine (lieu, livre, personne, compétence).", "Jour 2 — Pose une ancre mobile : un rituel de 10 minutes qui te suit partout.", "Jour 3 — Dis non à une distraction qui n’est que du bruit.", "Jour 4 — Parle à quelqu’un·e d’un milieu différent du tien (vraie curiosité).", "Jour 5 — Bouge ton corps 20 minutes sans objectif de perf.", "Jour 6 — Note ce que le changement t’a appris (3 insights).", "Jour 7 — Renouvelle un engagement simple pour 7 jours de plus."],
      mirrors: ["Est-ce que je bouge pour m’ouvrir — ou pour éviter de ressentir ?", "Quelle liberté responsable voudrais-je incarner cette semaine ?", "De quelle ancre ai-je besoin pour explorer sans me disperser ?", "Quel engagement léger pourrais-je tenir 7 jours ?", "Qu’est-ce que la curiosité me demande d’apprendre maintenant ?"],
      paras: ["Sur le chemin 5, ta mission d’âme évoque celle de l’exploratrice et de l’explorateur : apprendre par l’expérience, respirer large, faire circuler les idées et les horizons. Ce n’est pas une fuite permanente — c’est une invitation à la liberté responsable, celle qui choisit le mouvement plutôt que de le subir. Le 5 rappelle que la curiosité est une intelligence : elle élargit le monde, à condition de trouver aussi des ancres mobiles."],
      invites: ["Jour 1 — Choisis une seule exploration pour la semaine (lieu, livre, personne, compétence).", "Jour 2 — Pose une ancre mobile : un rituel de 10 minutes qui te suit partout.", "Jour 3 — Dis non à une distraction qui n’est que du bruit.", "Jour 4 — Parle à quelqu’un·e d’un milieu différent du tien (vraie curiosité).", "Jour 5 — Bouge ton corps 20 minutes sans objectif de perf."],
      gifts: ["Voyage / tourisme responsable / guides", "Journalisme / reportage / podcasts", "Formation & facilitation mobile", "Vente & développement commercial"],
    },
    6: {
      title: "Le soin / la responsabilité douce",
      mission: "Sur le chemin 6, ta mission d’âme évoque celle de la gardienne et du gardien du foyer — au sens large : créer des climats où l’on se sent en sécurité, aimé·e, digne. Ce n’est pas une obligation de tout porter ni de se sacrifier — c’est une invitation à aimer sans s’oublier. Le 6 rappelle que la beauté du quotidien, la présence et le soin partagé sont des arts à part entière.",
      strengths: ["Empathie incarnée : tu sens ce dont l’autre a besoin et tu y réponds concrètement.", "Sens du foyer : tu crées des espaces (physiques ou relationnels) accueillants.", "Responsabilité douce : tu assumes sans dramatiser, avec cœur.", "Goût de l’harmonie esthétique : tu soignes les détails qui apaisent.", "Fidélité aux engagements affectifs : tu es une présence sur qui l’on peut compter.", "Médiation familiale / communautaire : tu sais rassembler autour d’une table.", "Capacité à transmettre le soin : tu enseignes en montrant."],
      shadows: ["Hyper-responsabilité → transformer en : partager une charge précise cette semaine.", "Oublier ses besoins → transformer en : un rendez-vous avec soi non négociable.", "Perfectionnisme du « foyer idéal » → transformer en : « assez bon » et vivant.", "Contrôle affectueux → transformer en : faire confiance au processus de l’autre.", "Culpabilité à dire non → transformer en : un non qui protège la relation sur le long terme."],
      inRelations: "En relations, tu donnes beaucoup de présence. Tu te sens aimé·e quand on te choisit vraiment et qu’on prend soin de toi en retour. L’invitation : recevoir n’est pas un luxe — c’est ce qui rend ton don durable.",
      inWork: "Au travail, tu excelles dans le care, l’éducation, l’hospitalité, le design d’espaces, les métiers du bien-être non médical, la coordination communautaire. Attention aux rôles qui te demandent de tout absorber sans reconnaissance.",
      inEnergy: "Ton énergie se recharge dans la beauté simple et les liens sûrs. Quand tu te sens vidé·e, réduis les « pour les autres » et augmente un geste de soin pour toi (bain, repas, silence, nature).",
      domains: ["Éducation / accompagnement bienveillant", "Hospitalité & design d’espaces accueillants", "Métiers du soin non médical (bien-être, présence)", "Coordination communautaire / associations", "Arts de la table & du quotidien", "Conseil en organisation familiale / vie pratique", "Médiation de conflits proches", "Création de contenus « chez-soi » / lifestyle conscient"],
      weekPlan: ["Jour 1 — Soigne un coin de ton espace (10 minutes suffisent).", "Jour 2 — Offre-toi un geste de soin uniquement pour toi.", "Jour 3 — Partage une charge avec quelqu’un·e (demande concrète).", "Jour 4 — Pose une limite affectueuse (une phrase claire).", "Jour 5 — Crée un moment de beauté partagée (repas, musique, lumière).", "Jour 6 — Remercie ton corps pour ce qu’il porte chaque jour.", "Jour 7 — Reçois volontairement (accepte une aide, un compliment, un cadeau)."],
      mirrors: ["Où est-ce que je confonds aimer et me sacrifier ?", "Quel besoin à moi ai-je remis à plus tard trop longtemps ?", "Comment puis-je partager la charge sans culpabilité ?", "Quelle beauté du quotidien voudrais-je cultiver ?", "Qui prend soin de moi — et comment puis-je faciliter cela ?"],
      paras: ["Sur le chemin 6, ta mission d’âme évoque celle de la gardienne et du gardien du foyer — au sens large : créer des climats où l’on se sent en sécurité, aimé·e, digne. Ce n’est pas une obligation de tout porter ni de se sacrifier — c’est une invitation à aimer sans s’oublier. Le 6 rappelle que la beauté du quotidien, la présence et le soin partagé sont des arts à part entière."],
      invites: ["Jour 1 — Soigne un coin de ton espace (10 minutes suffisent).", "Jour 2 — Offre-toi un geste de soin uniquement pour toi.", "Jour 3 — Partage une charge avec quelqu’un·e (demande concrète).", "Jour 4 — Pose une limite affectueuse (une phrase claire).", "Jour 5 — Crée un moment de beauté partagée (repas, musique, lumière)."],
      gifts: ["Éducation / accompagnement bienveillant", "Hospitalité & design d’espaces accueillants", "Métiers du soin non médical (bien-être, présence)", "Coordination communautaire / associations"],
    },
    7: {
      title: "La profondeur / l’introspection",
      mission: "Sur le chemin 7, ta mission d’âme évoque celle de la chercheuse et du chercheur : plonger sous la surface, analyser, écouter l’intuition, et ramener des insights utiles au monde. Ce n’est pas un retrait forcé — c’est une invitation à honorer ton monde intérieur, puis à le partager quand tu es prêt·e. Le 7 rappelle que le silence peut être fertile, et que la vérité se révèle souvent dans la nuance.",
      strengths: ["Analyse fine : tu vois les motifs que d’autres survolent.", "Intuition cultivée : tu sens ce qui « sonne juste » au-delà des apparences.", "Discernement : tu sépares le signal du bruit avec patience.", "Recherche de sens : tu poses les questions qui ouvrent des portes.", "Capacité à solituder fructueusement : tu te ressources dans le calme.", "Rigueur intellectuelle douce : tu aimes comprendre vraiment, pas seulement paraître.", "Transmission d’insights : tu peux vulgariser la profondeur sans la trahir."],
      shadows: ["Sur-analyse paralysante → transformer en : décider avec 70 % d’info, puis ajuster.", "Isolement prolongé → transformer en : une sortie sociale courte et choisie.", "Perfectionnisme mental → transformer en : publier / partager une version « brouillon utile ».", "Méfiance excessive → transformer en : tester la confiance par petites doses.", "Spiritualité hors-sol → transformer en : ancrer chaque insight dans un geste concret."],
      inRelations: "En relations, tu as besoin de profondeur et de vérité. Les échanges superficiels te fatiguent ; une conversation réelle te nourrit pour des jours. L’invitation : laisser aussi de la légèreté — tout n’a pas à être une thèse.",
      inWork: "Au travail, tu excelles en recherche, analyse, stratégie, écriture de fond, conseil expert, métiers de la donnée qualitative. Les open-spaces bruyants sans refuge te drainent ; un temps de focus protégé te rend brillant·e.",
      inEnergy: "Ton énergie aime le silence et la concentration. Quand tu te sens « dans ta tête », reviens au corps (marche, respiration, eau) avant de forcer une nouvelle réflexion.",
      domains: ["Recherche & analyse (qualitative / stratégique)", "Écriture de fond / édition", "Conseil expert / audit de clarté", "Philosophie appliquée / éthique de projet", "Développement spirituel non dogmatique (facilitation)", "Data storytelling & synthèse", "Formation à la pensée critique", "Design de rituels d’introspection"],
      weekPlan: ["Jour 1 — Offre-toi 20 minutes de solitude sans écran.", "Jour 2 — Écris 1 insight et 1 action concrète qui en découle.", "Jour 3 — Partage un insight à une personne de confiance.", "Jour 4 — Décide quelque chose avec « assez » d’information (pas 100 %).", "Jour 5 — Marche en silence 15 minutes ; note 3 sensations corporelles.", "Jour 6 — Relie spiritualité / analyse à un geste utile pour quelqu’un·e.", "Jour 7 — Lis ou écoute une source qui t’élève (pas qui t’angoisse)."],
      mirrors: ["Qu’est-ce que mon silence me dit en ce moment ?", "Où mon analyse protège-t-elle — et où empêche-t-elle d’agir ?", "Quel insight suis-je prêt·e à partager cette semaine ?", "De quelle solitude ai-je besoin — et de quelle présence ?", "Comment puis-je ancrer ma profondeur dans le concret ?"],
      paras: ["Sur le chemin 7, ta mission d’âme évoque celle de la chercheuse et du chercheur : plonger sous la surface, analyser, écouter l’intuition, et ramener des insights utiles au monde. Ce n’est pas un retrait forcé — c’est une invitation à honorer ton monde intérieur, puis à le partager quand tu es prêt·e. Le 7 rappelle que le silence peut être fertile, et que la vérité se révèle souvent dans la nuance."],
      invites: ["Jour 1 — Offre-toi 20 minutes de solitude sans écran.", "Jour 2 — Écris 1 insight et 1 action concrète qui en découle.", "Jour 3 — Partage un insight à une personne de confiance.", "Jour 4 — Décide quelque chose avec « assez » d’information (pas 100 %).", "Jour 5 — Marche en silence 15 minutes ; note 3 sensations corporelles."],
      gifts: ["Recherche & analyse (qualitative / stratégique)", "Écriture de fond / édition", "Conseil expert / audit de clarté", "Philosophie appliquée / éthique de projet"],
    },
    8: {
      title: "La maîtrise / l’abondance",
      mission: "Sur le chemin 8, ta mission d’âme évoque celle de la stratège incarnée : structurer, diriger avec cœur, faire circuler les ressources (temps, argent, influence, talent) de façon juste. Ce n’est pas un destin figé ni une pression à « réussir » — c’est une invitation à la maîtrise de soi avant la maîtrise des autres, et à voir l’abondance comme circulation, pas comme accumulation anxieuse. L’ambition juste se cultive aussi dans le repos.",
      strengths: ["Leadership stratégique : tu vois le jeu d’ensemble et les leviers utiles.", "Sens des ressources : tu sais allouer, négocier, faire fructifier.", "Impact concret : tu aimes que les idées deviennent résultats tangibles.", "Résilience face aux enjeux : tu tiens dans les conversations « sérieuses ».", "Justice pragmatique : tu cherches l’équité dans les échanges.", "Capacité à structurer une vision : tu transformes une ambition en plan.", "Présence d’autorité douce : tu inspires le respect sans écraser."],
      shadows: ["Surinvestissement dans le statut → transformer en : mesurer le succès aussi au calme intérieur.", "Workaholisme → transformer en : blocs de repos non négociables dans l’agenda.", "Contrôle excessif → transformer en : déléguer avec un cadre clair + confiance.", "Peur de manquer → transformer en : pratiquer la circulation (donner / investir conscient).", "Dureté sous pression → transformer en : une pause corps avant toute décision tendue."],
      inRelations: "En relations, tu valorises le respect mutuel et la loyauté dans les actes. Tu te sens en sécurité quand les engagements sont clairs. L’invitation : laisser aussi la vulnérabilité — la force relationnelle n’est pas que la maîtrise.",
      inWork: "Au travail, tu excelles en direction, finance, entrepreneuriat, négociation, management, stratégie d’impact. Les environnements sans enjeu te sous-stimulent ; ceux toxiquement compétitifs te demandent une éthique claire pour ne pas te durcir.",
      inEnergy: "Ton énergie monte avec les défis structurés et baisse avec le chaos sans cadre. Le repos n’est pas une récompense après la performance — c’est une partie de la maîtrise.",
      domains: ["Leadership & management d’équipe", "Entrepreneuriat / direction de business", "Finance éthique & gestion de ressources", "Négociation & deals stratégiques", "Conseil en stratégie d’impact", "Immobilier / actifs tangibles (approche consciente)", "Production & opérations à grande échelle", "Philanthropie structurée / mécénat"],
      weekPlan: ["Jour 1 — Clarifie une ambition juste (résultat + valeur humaine).", "Jour 2 — Alloue tes ressources : temps / énergie / argent (3 lignes).", "Jour 3 — Délègue ou demande de l’aide sur une tâche contrôlée.", "Jour 4 — Bloc repos conscient (sans « rattrapage productif »).", "Jour 5 — Pratique la circulation : un geste d’abondance partagée.", "Jour 6 — Revue éthique : une décision à réaligner avec tes valeurs.", "Jour 7 — Célèbre un impact concret, même petit, sans le minimiser."],
      mirrors: ["Quelle maîtrise de soi me manque encore plus que la maîtrise des projets ?", "Où mon ambition sert-elle la vie — et où sert-elle seulement l’image ?", "Comment l’abondance peut-elle circuler à travers moi cette semaine ?", "De quel repos ma force a-t-elle besoin pour rester juste ?", "Quel contrôle puis-je relâcher sans perdre mon cadre ?"],
      paras: ["Sur le chemin 8, ta mission d’âme évoque celle de la stratège incarnée : structurer, diriger avec cœur, faire circuler les ressources (temps, argent, influence, talent) de façon juste. Ce n’est pas un destin figé ni une pression à « réussir » — c’est une invitation à la maîtrise de soi avant la maîtrise des autres, et à voir l’abondance comme circulation, pas comme accumulation anxieuse. L’ambition juste se cultive aussi dans le repos."],
      invites: ["Jour 1 — Clarifie une ambition juste (résultat + valeur humaine).", "Jour 2 — Alloue tes ressources : temps / énergie / argent (3 lignes).", "Jour 3 — Délègue ou demande de l’aide sur une tâche contrôlée.", "Jour 4 — Bloc repos conscient (sans « rattrapage productif »).", "Jour 5 — Pratique la circulation : un geste d’abondance partagée."],
      gifts: ["Leadership & management d’équipe", "Entrepreneuriat / direction de business", "Finance éthique & gestion de ressources", "Négociation & deals stratégiques"],
    },
    9: {
      title: "L’humanisme / le grand cœur",
      mission: "Sur le chemin 9, ta mission d’âme évoque celle de la passeuse et du passeur : contribuer à plus grand que soi, avec compassion et vision large, tout en t’incluant dans le cercle de soin. Ce n’est pas un devoir de sauver le monde — c’est une invitation à offrir ta mesure juste, à clôturer ce qui est achevé, et à laisser l’idéal devenir des gestes concrets. Le 9 rappelle que la générosité durable commence souvent par soi.",
      strengths: ["Compassion large : tu ressens l’humain au-delà des frontières proches.", "Vision d’ensemble : tu relies les causes, les cultures, les horizons.", "Capacité à transmettre : tu enseignes, inspires, ouvres des perspectives.", "Sens des fins de cycle : tu sais clôturer pour faire de la place au neuf.", "Idéalisme incarnable : tu veux du sens, pas seulement du confort.", "Ouverture interculturelle : tu te sens chez toi dans la diversité.", "Présence consolante : tu accompagnes les transitions avec douceur."],
      shadows: ["Hyper-empathie épuisante → transformer en : choisir une cause, pas toutes.", "Messie intérieur → transformer en : contribuer sans porter le résultat seul·e.", "Difficulté à terminer → transformer en : rituel de clôture (liste « achevé »).", "Idéal vs réel → transformer en : une action petite mais tenue cette semaine.", "Oublier ses limites → transformer en : compassion qui commence par ton corps."],
      inRelations: "En relations, tu aimes les liens qui ont du sens et de l’ouverture. Tu te sens vivant·e quand on partage une vision ou un service. L’invitation : ne pas diluer ton intimité dans le collectif — garde des cercles proches et vrais.",
      inWork: "Au travail, tu excelles dans l’associatif, l’éducation populaire, les arts engagé·e·s, l’humanitaire de proximité, la médiation culturelle, le mentoring. Les missions sans sens te vident ; une contribution claire te vivifie.",
      inEnergy: "Ton énergie monte avec le sens partagé et baisse avec la dispersion compassionnelle. Des frontières douces te permettent d’aimer longtemps.",
      domains: ["Associations & projets à impact social", "Éducation / mentoring / transmission", "Arts & culture engagés", "Médiation interculturelle", "Communication de causes (storytelling éthique)", "Accompagnement de transitions (non médical)", "Voyage conscient / échanges internationaux", "Écriture humaniste & témoignages"],
      weekPlan: ["Jour 1 — Choisis une seule contribution pour la semaine (claire et bornée).", "Jour 2 — Clôture une petite boucle ouverte (message, dossier, objet).", "Jour 3 — Offre de la compassion… à toi d’abord (geste concret).", "Jour 4 — Partage une idée qui élargit le regard de quelqu’un·e.", "Jour 5 — Dis non à une cause « en trop » pour protéger ton élan.", "Jour 6 — Relie idéal et action : 1 geste tangible de 15 minutes.", "Jour 7 — Remercie ce qui s’achève ; accueille l’espace qui s’ouvre."],
      mirrors: ["Quelle contribution juste (ni trop petite, ni écrasante) m’appelle ?", "Qu’est-ce que je dois clôturer pour laisser entrer du neuf ?", "Comment la compassion peut-elle commencer par moi aujourd’hui ?", "Où mon idéalisme a-t-il besoin d’un ancrage concret ?", "Qui sont mes cercles proches — et comment les nourrir vraiment ?"],
      paras: ["Sur le chemin 9, ta mission d’âme évoque celle de la passeuse et du passeur : contribuer à plus grand que soi, avec compassion et vision large, tout en t’incluant dans le cercle de soin. Ce n’est pas un devoir de sauver le monde — c’est une invitation à offrir ta mesure juste, à clôturer ce qui est achevé, et à laisser l’idéal devenir des gestes concrets. Le 9 rappelle que la générosité durable commence souvent par soi."],
      invites: ["Jour 1 — Choisis une seule contribution pour la semaine (claire et bornée).", "Jour 2 — Clôture une petite boucle ouverte (message, dossier, objet).", "Jour 3 — Offre de la compassion… à toi d’abord (geste concret).", "Jour 4 — Partage une idée qui élargit le regard de quelqu’un·e.", "Jour 5 — Dis non à une cause « en trop » pour protéger ton élan."],
      gifts: ["Associations & projets à impact social", "Éducation / mentoring / transmission", "Arts & culture engagés", "Médiation interculturelle"],
    },
  };

  const DAY_VIBE_COPY = {
    1: {
      short: "La vibration 1 du jour de naissance évoque l’initiative, le feu du commencement et le courage de tracer une ligne là où il n’y en avait pas.",
      sense: "La vibration 1 du jour de naissance évoque l’initiative, le feu du commencement et le courage de tracer une ligne là où il n’y en avait pas. Elle colore ta manière d’entrer dans la vie : souvent directe, décidée, prête à ouvrir.",
      concrete: "Implication concrète : dans tes journées, tu peux t’appuyer sur des « premiers pas » clairs — une décision nette, un message envoyé, un chantier ouvert — plutôt que d’attendre le plan parfait.",
    },
    2: {
      short: "La vibration 2 évoque l’écoute, la diplomatie et le tissage de liens.",
      sense: "La vibration 2 évoque l’écoute, la diplomatie et le tissage de liens. Elle nuance ta présence d’une sensibilité au climat relationnel et au bon timing.",
      concrete: "Implication concrète : privilégie les duos, les médiations, les pauses avant de trancher — et ose aussi nommer ton besoin pour ne pas t’effacer.",
    },
    3: {
      short: "La vibration 3 évoque l’expression, la joie de partager et la créativité du Verbe.",
      sense: "La vibration 3 évoque l’expression, la joie de partager et la créativité du Verbe. Elle colore ta journée natale d’une invitation à faire circuler idées et présence.",
      concrete: "Implication concrète : donne une forme (voix, écrit, image) à ce qui bouillonne — même courte — plutôt que de tout garder en tête.",
    },
    4: {
      short: "La vibration 4 évoque la stabilité, la méthode et le goût de bâtir concrètement.",
      sense: "La vibration 4 évoque la stabilité, la méthode et le goût de bâtir concrètement. Elle ancre ta naissance dans le réel et le durable.",
      concrete: "Implication concrète : pose une fondation simple (routine, budget, espace rangé) qui soutient tes élans plus grands.",
    },
    5: {
      short: "La vibration 5 évoque la curiosité, l’adaptation et le besoin de respiration.",
      sense: "La vibration 5 évoque la curiosité, l’adaptation et le besoin de respiration. Elle colore ton entrée dans la vie d’un goût pour le mouvement et l’expérience.",
      concrete: "Implication concrète : choisis une exploration consciente et une ancre légère — liberté avec port d’attache.",
    },
    6: {
      short: "La vibration 6 évoque le soin, la présence et l’harmonie relationnelle.",
      sense: "La vibration 6 évoque le soin, la présence et l’harmonie relationnelle. Elle nuance ta naissance d’une responsabilité douce envers le foyer (au sens large).",
      concrete: "Implication concrète : soigne un lien ou un espace — et inclus-toi dans le cercle de soin.",
    },
    7: {
      short: "La vibration 7 évoque le silence intérieur, l’analyse et l’intuition.",
      sense: "La vibration 7 évoque le silence intérieur, l’analyse et l’intuition. Elle colore ta naissance d’une profondeur qui cherche le sens sous la surface.",
      concrete: "Implication concrète : protège des plages de solitude fertile, puis ramène un insight dans le concret.",
    },
    8: {
      short: "La vibration 8 évoque l’ambition juste, la responsabilité et l’impact dans la matière.",
      sense: "La vibration 8 évoque l’ambition juste, la responsabilité et l’impact dans la matière. Elle colore ta naissance d’une capacité à structurer ressources et décisions.",
      concrete: "Implication concrète : traite une question « sérieuse » (argent, cadre, engagement) avec éthique et repos — la maîtrise inclut le calme.",
    },
    9: {
      short: "La vibration 9 évoque la compassion, la clôture de cycles et la vision large.",
      sense: "La vibration 9 évoque la compassion, la clôture de cycles et la vision large. Elle colore ta naissance d’une ouverture humaniste.",
      concrete: "Implication concrète : contribue à ta mesure et termine une petite boucle pour laisser entrer du neuf.",
    },
  };

  const SIGN_COPY = {
    "Bélier": {
      glyph: "♈",
      element: "Feu",
      modality: "Cardinal",
      planet: "Mars",
      intro: "Le Bélier évoque l’élan, le courage et la franchise du démarrage. C’est une teinte de feu inaugural : oser, initier, traverser la peur du premier pas — sans forcément brûler toutes les étapes.",
      relational: "Style relationnel : direct·e, enthousiaste, parfois impatient·e. Tu aimes les liens qui avancent. Invitation : écouter aussi le rythme de l’autre.",
      boost: ["lancement de projets", "sport & coaching d’élan", "négociation franche", "création audacieuse"],
    },
    "Taureau": {
      glyph: "♉",
      element: "Terre",
      modality: "Fixe",
      planet: "Vénus",
      intro: "Le Taureau évoque l’ancrage, la sensualité et la constance. C’est une teinte de terre fertile : bâtir dans la durée, savourer, sécuriser sans figer.",
      relational: "Style relationnel : loyal·e, tactile, patient·e. Tu aimes la stabilité partagée. Invitation : laisser entrer un peu de changement choisi.",
      boost: ["artisanat", "finance pratique", "arts sensoriels", "immobilier / espaces"],
    },
    "Gémeaux": {
      glyph: "♊",
      element: "Air",
      modality: "Mutable",
      planet: "Mercure",
      intro: "Les Gémeaux évoquent la curiosité, le verbe et la mobilité mentale. C’est une teinte d’air vif : relier les idées, apprendre, communiquer.",
      relational: "Style relationnel : spirituel·le d’esprit, joueur·se, parfois dispersé·e. Tu aimes l’échange. Invitation : approfondir un lien au-delà du bavardage.",
      boost: ["écriture", "enseignement léger", "médias", "vente d’idées"],
    },
    "Cancer": {
      glyph: "♋",
      element: "Eau",
      modality: "Cardinal",
      planet: "Lune",
      intro: "Le Cancer évoque la sensibilité, la protection et la mémoire du cœur. C’est une teinte d’eau lunaire : sécuriser sans enfermer, nourrir les racines.",
      relational: "Style relationnel : attentionné·e, intuitif·ve, parfois défensif·ve. Tu aimes le nid. Invitation : poser des frontières douces.",
      boost: ["care & hospitalité", "mémoire familiale", "arts émotionnels", "cuisine / foyer"],
    },
    "Lion": {
      glyph: "♌",
      element: "Feu",
      modality: "Fixe",
      planet: "Soleil",
      intro: "Le Lion évoque le rayonnement, la créativité et une fierté saine. C’est une teinte de feu solaire : briller sans dominer, offrir sa présence comme un cadeau.",
      relational: "Style relationnel : généreux·se, théâtral·e parfois, loyal·e. Tu aimes être vu·e. Invitation : partager la lumière.",
      boost: ["arts de scène", "leadership créatif", "branding personnel", "animation"],
    },
    "Vierge": {
      glyph: "♍",
      element: "Terre",
      modality: "Mutable",
      planet: "Mercure",
      intro: "La Vierge évoque le discernement, le soin du détail et le service juste. C’est une teinte de terre fine : perfectionner sans se juger, utilement.",
      relational: "Style relationnel : attentif·ve, discret·ète, parfois critique. Tu aimes être utile. Invitation : accueillir l’imperfection vivante.",
      boost: ["analyse & process", "édition", "santé douce / routines", "qualité de service"],
    },
    "Balance": {
      glyph: "♎",
      element: "Air",
      modality: "Cardinal",
      planet: "Vénus",
      intro: "La Balance évoque l’équilibre, l’esthétique relationnelle et la diplomatie. C’est une teinte d’air vénusien : choisir après avoir écouté, créer de l’harmonie sans s’effacer.",
      relational: "Style relationnel : diplomate, charmeur·se, parfois indécis·e. Tu aimes le partenariat. Invitation : trancher aussi pour toi.",
      boost: ["négociation", "relations publiques", "design & esthétique", "médiation", "partenariats"],
    },
    "Scorpion": {
      glyph: "♏",
      element: "Eau",
      modality: "Fixe",
      planet: "Pluton / Mars",
      intro: "Le Scorpion évoque l’intensité, la transformation et une loyauté profonde. C’est une teinte d’eau volcanique : traverser sans se consumer, métamorphoser.",
      relational: "Style relationnel : intense, loyal·e, parfois testeur·se. Tu aimes la vérité nue. Invitation : laisser aussi la légèreté.",
      boost: ["accompagnement de crises (non médical)", "enquête / recherche", "finance profonde", "arts de la métamorphose"],
    },
    "Sagittaire": {
      glyph: "♐",
      element: "Feu",
      modality: "Mutable",
      planet: "Jupiter",
      intro: "Le Sagittaire évoque l’horizon, le sens et l’enthousiasme. C’est une teinte de feu philosophique : explorer avec sagesse, élargir la carte.",
      relational: "Style relationnel : enthousiaste, franc·he, parfois évasif·ve. Tu aimes grandir ensemble. Invitation : tenir aussi le quotidien.",
      boost: ["voyage & interculturel", "enseignement", "édition d’idées", "sport d’aventure"],
    },
    "Capricorne": {
      glyph: "♑",
      element: "Terre",
      modality: "Cardinal",
      planet: "Saturne",
      intro: "Le Capricorne évoque l’ambition structurée, la responsabilité et la patience. C’est une teinte de terre saturnienne : gravir sans se durcir, bâtir l’héritage.",
      relational: "Style relationnel : sérieux·se, fiable, parfois réservé·e. Tu aimes le respect. Invitation : montrer aussi la tendresse.",
      boost: ["stratégie long terme", "gestion", "institution building", "mentorat de métier"],
    },
    "Verseau": {
      glyph: "♒",
      element: "Air",
      modality: "Fixe",
      planet: "Uranus / Saturne",
      intro: "Le Verseau évoque l’originalité, la vision collective et la liberté d’esprit. C’est une teinte d’air uranien : innover avec cœur, penser le « nous ».",
      relational: "Style relationnel : amical·e, atypique, parfois distant·e. Tu aimes l’égalité. Invitation : laisser l’intimité émotionnelle.",
      boost: ["innovation sociale", "tech consciente", "communautés", "futurs désirables"],
    },
    "Poissons": {
      glyph: "♓",
      element: "Eau",
      modality: "Mutable",
      planet: "Neptune / Jupiter",
      intro: "Les Poissons évoquent l’empathie, l’imagination et une porosité douce. C’est une teinte d’eau neptunienne : rêver en restant présent·e, créer depuis l’invisible.",
      relational: "Style relationnel : compatissant·e, artistique, parfois flou·e. Tu aimes fusionner. Invitation : des frontières douces qui protègent le rêve.",
      boost: ["arts & musique", "accompagnement empathique", "spiritualité douce", "création immersive"],
    },
  };

  const DECAN_NOTE = {
    1: {
      label: "1er décan",
      note: "Teinte plus « pure » / inaugurale du signe — souvent plus directe, plus proche de l’archétype solaire du signe. Invitation à démarrer dans le style du signe, avec fraîcheur.",
    },
    2: {
      label: "2e décan",
      note: "Milieu du signe — nuances de maturité et d’équilibre interne. On sent souvent un raffinement, une capacité à nuancer l’élan premier du signe.",
    },
    3: {
      label: "3e décan",
      note: "Fin du signe — souvent plus affirmé·e, capable de trancher après avoir écouté, et de porter une maturité du signe vers le signe suivant. Invitation à synthétiser et à transmettre.",
    },
  };

  const DECAN_RULERS = {
    "Bélier": { 1: "Mars", 2: "Soleil", 3: "Jupiter" },
    "Taureau": { 1: "Mercure", 2: "Lune", 3: "Saturne" },
    "Gémeaux": { 1: "Jupiter", 2: "Mars", 3: "Soleil" },
    "Cancer": { 1: "Vénus", 2: "Mercure", 3: "Lune" },
    "Lion": { 1: "Saturne", 2: "Jupiter", 3: "Mars" },
    "Vierge": { 1: "Soleil", 2: "Vénus", 3: "Mercure" },
    "Balance": { 1: "Lune", 2: "Saturne", 3: "Mercure & Vénus" },
    "Scorpion": { 1: "Mars", 2: "Soleil", 3: "Vénus" },
    "Sagittaire": { 1: "Mercure", 2: "Lune", 3: "Saturne" },
    "Capricorne": { 1: "Jupiter", 2: "Mars", 3: "Soleil" },
    "Verseau": { 1: "Vénus", 2: "Mercure", 3: "Lune" },
    "Poissons": { 1: "Saturne", 2: "Jupiter", 3: "Mars" },
  };


  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function lifePathCalcReminder(iso) {
    const digits = String(iso).replace(/\D/g, '');
    if (!digits) return '';
    const sum = digits.split('').reduce((a, d) => a + Number(d), 0);
    let n = sum;
    const steps = [String(sum)];
    while (n > 9) {
      n = String(n)
        .split('')
        .reduce((a, d) => a + Number(d), 0);
      steps.push(String(n));
    }
    return (
      'Rappel du calcul : on additionne tous les chiffres de ta date (' +
      digits.split('').join('+') +
      ' = ' +
      sum +
      ')' +
      (steps.length > 1 ? ' → ' + steps.slice(1).join(' → ') : '') +
      '. En P0, on réduit toujours à 1–9 (pas de master numbers).'
    );
  }

  function allianceDayPath(dayVibe, lifePath, pathTitle) {
    if (dayVibe === lifePath) {
      return (
        'Alliance avec ton chemin ' +
        lifePath +
        ' (« ' +
        pathTitle +
        ' ») : la vibration du jour et le chemin résonnent sur la même note — une cohérence forte. Invitation à incarner ce thème avec nuance, sans le forcer en identité figée.'
      );
    }
    return (
      'Alliance avec ton chemin ' +
      lifePath +
      ' (« ' +
      pathTitle +
      ' ») : la vibration ' +
      dayVibe +
      ' du jour colore et dialogue avec ton chemin. Ce n’est pas une contradiction : c’est une polyphonie. Tu peux laisser le jour nuancer le chemin — ou le chemin cadrer le jour — selon ce dont tu as besoin maintenant.'
    );
  }

  function alliancePathSign(lifePath, pathTitle, signMeta) {
    if (!signMeta) return '';
    return (
      'Alliance chemin ' +
      lifePath +
      ' (« ' +
      pathTitle +
      ' ») × ' +
      'signe ' +
      signMeta.element +
      ' / ' +
      signMeta.modality +
      ' (gouverné·e traditionnellement par ' +
      signMeta.planet +
      ') : une signature où la boussole numérologique rencontre le climat solaire. Ce dialogue peut suggérer un style d’expression particulier — à explorer comme carte, pas comme contrat.'
    );
  }

  function suggestDomains(path, signMeta) {
    const base = (path.domains || path.gifts || []).slice();
    const boost = (signMeta && signMeta.boost) || [];
    const out = [];
    const seen = new Set();
    function push(x) {
      const k = String(x).toLowerCase();
      if (!k || seen.has(k)) return;
      seen.add(k);
      out.push(x);
    }
    base.forEach(push);
    boost.forEach((b) => push(b.charAt(0).toUpperCase() + b.slice(1)));
    // ensure 6–10
    const fillers = [
      'Accompagnement bienveillant (non médical)',
      'Création de contenus pédagogiques',
      'Facilitation de cercles / ateliers',
      'Conseil en clarté de projet',
    ];
    for (const f of fillers) {
      if (out.length >= 10) break;
      push(f);
    }
    return out.slice(0, 10);
  }

  function ulHtml(items, className) {
    const cls = className ? ' class="' + className + '"' : '';
    return (
      '<ul' +
      cls +
      '>' +
      (items || [])
        .map((x) => '<li>' + escapeHtml(x) + '</li>')
        .join('') +
      '</ul>'
    );
  }

  /** Texte Dave TEL QUEL — Exemple KD Krizoua (Sinfra). Ne pas reformuler. */
  const KRIZOUA_VERBATIM_TEXT = "Voici l'analyse numérologique et astrologique complète pour Krizoua Yako Jean, né le 17 octobre 1983 à Sinfra (Côte d'Ivoire).\n\n🔑 1. Le Chemin de Vie : Le Nombre 3 (Le Communicateur / Le Créateur)\n\n(Calcul : 17 + 10 + 1983 → (1+7) + (1+0) + (1+9+8+3) = 8 + 1 + 21 → 8 + 1 + 3 = 12 → 1 + 2 = 3)\n\n(Méthode alternative : 17 + 10 + 1983 = 2010 → 2 + 0 + 1 + 0 = 3)\n\nLe Chemin de Vie 3 est celui du Verbe, de la Communication, de la Créativité et du Rayonnement social.\n\n * Mission d'Âme : Jean est venu pour exprimer sa pensée, impacter par la parole ou l'écrit, créer des ponts entre les gens et apporter de l'enthousiasme. C'est un canal naturel de transmission.\n * Forces : Éloquence, créativité, charme relationnel, optimisme, capacité à simplifier les idées complexes et à inspirer son entourage.\n * Défis : Éviter l'éparpillement ou la dispersion de son énergie dans trop de projets à la fois ; il doit apprendre à canaliser son flux créatif vers des objectifs précis.\n\n🎭 2. La Vibration du Jour de Naissance : Le 17 (Vibration 8 / Saturne & Étoile)\n\nNé un 17, il porte une sous-vibration de puissance matérielle et spirituelle :\n\n * Le 17 (1+7 = 8) : Dans la tradition, le 17 est la carte de l'Étoile (la protection divine et la bonne étoile) associée au chiffre 8 (le pouvoir, l'ambition, la maîtrise financière et la justice).\n * Impact : Le 1 apporte la décision, le 7 apporte la sagesse/l'esprit, et le 8 concrétise le tout dans la matière. Cela donne à Jean un sens des affaires aiguisé et une forte résilience financière.\n\n♎ 3. Ancrage Astrologique : Balance ♎ (3ème Décan - Gouverné par Mercure & Vénus)\n\n * Signe Solaire : Balance ♎ (Né le 17 octobre) : En tant que Balance du 3ème décan, l'influence de Mercure renforce considérablement son agilité intellectuelle, son sens de la stratégie et son aisance dans le commerce des idées.\n * Alliance Balance (Air) & Chemin de Vie 3 (Verbe/Expression) : C'est la signature d'un stratège de la communication. Il possède un sens inné de la diplomatie, de la négociation et du partenariat. Il sait comment présenter n'importe quel projet pour le rendre attractif et convaincant.\n\n🎯 Domaines de Compétences de Krizoua Yako Jean\n\n * Relations Publiques, Négociation & Commerce\n * Conseil, Coaching & Enseignement / Animation\n * Stratégie d'Entreprise & Management Relationnel\n\n📊 Synthèse : Chemin 3 · Jour 17 (8) · Balance ♎";

  const PERSONAS = {
    aicha: {
      firstName: 'Aïcha',
      lastName: '',
      name: 'Aïcha',
      gender: 'femme',
      birth: '1998-09-17',
      birthTime: '',
      place: 'Abidjan (CI)',
      gifts: null,
    },
    krizoua: {
      firstName: 'Krizoua',
      lastName: 'Yako Jean',
      name: 'Krizoua Yako Jean',
      gender: 'homme',
      birth: '1983-10-17',
      birthTime: '',
      place: "Sinfra (Côte d'Ivoire)",
      gifts: ['Relations publiques (RP)', 'Négociation', 'Coaching', 'Stratégie'],
      extraInvites: [
        'Associer créativité (3) et structure / impact (8) dans tes projets.',
        'Utiliser ton sens relationnel Balance pour ouvrir des portes, pas pour t’oublier.',
        'Explorer le coaching / la stratégie comme terrains naturels de ton 3+8.',
      ],
    },
  };

  const PROFILE_KEY = 'ca_profile_v1';
  const RECENT_KEY = 'ca_profiles_recent_v1';
  const RECENT_MAX = 5;

  const LUCK_BY_PATH = {
    1: { colors: ['Rouge vif', 'Or', 'Blanc éclat'], scents: ['Poivre rose', 'Bois de cèdre', 'Agrumes zestés'] },
    2: { colors: ['Blanc nacré', 'Rose poudré', 'Argent doux'], scents: ['Rose', 'Vanille douce', 'Thé blanc'] },
    3: { colors: ['Jaune soleil', 'Turquoise', 'Corail'], scents: ['Fleur d’oranger', 'Bergamote', 'Mangue légère'] },
    4: { colors: ['Vert forêt', 'Brun terre', 'Bleu ardoise'], scents: ['Vétiver', 'Bois de santal', 'Romarin'] },
    5: { colors: ['Orange vif', 'Bleu ciel', 'Multicolore'], scents: ['Menthe', 'Gingembre', 'Citron vert'] },
    6: { colors: ['Rose profond', 'Vert jade', 'Crème'], scents: ['Jasmin', 'Lavande', 'Miel floral'] },
    7: { colors: ['Violet indigo', 'Blanc lunaire', 'Bleu nuit'], scents: ['Encens doux', 'Sauge', 'Myrrhe légère'] },
    8: { colors: ['Noir profond', 'Or antique', 'Pourpre'], scents: ['Oud', 'Cuir doux', 'Patchouli'] },
    9: { colors: ['Rouge rubis', 'Blanc pur', 'Or rose'], scents: ['Rose de Damas', 'Ambre', 'Encens floral'] },
  };

  const LUCK_BY_ELEMENT = {
    Feu: { colors: ['Rouge', 'Orange', 'Or'], scents: ['Cannelle', 'Poivre', 'Gingembre'] },
    Terre: { colors: ['Vert olive', 'Brun', 'Beige'], scents: ['Vétiver', 'Terre humide', 'Cèdre'] },
    Air: { colors: ['Bleu ciel', 'Jaune pâle', 'Blanc'], scents: ['Bergamote', 'Menthe', 'Fleur d’oranger'] },
    Eau: { colors: ['Bleu océan', 'Vert d’eau', 'Argent'], scents: ['Lotus', 'Pluie', 'Jasmin'] },
  };

  function genderVoice(gender) {
    const g = gender || 'unspecified';
    if (g === 'femme') {
      return {
        key: 'femme',
        subject: 'elle',
        Subject: 'Elle',
        object: 'la',
        poss: 'sa',
        possM: 'son',
        neo: 'née',
        adj: 'e',
        pronounLine: 'elle',
      };
    }
    if (g === 'homme') {
      return {
        key: 'homme',
        subject: 'il',
        Subject: 'Il',
        object: 'le',
        poss: 'sa',
        possM: 'son',
        neo: 'né',
        adj: '',
        pronounLine: 'il',
      };
    }
    return {
      key: 'unspecified',
      subject: 'iel',
      Subject: 'Iel',
      object: 'leu',
      poss: 'sa',
      possM: 'son',
      neo: 'né·e',
      adj: '·e',
      pronounLine: 'iel',
    };
  }

  function letterValue(ch) {
    const c = ch.toUpperCase();
    if (c >= 'A' && c <= 'Z') return c.charCodeAt(0) - 64;
    // accents FR simplifiés
    const map = {
      À: 1, Á: 1, Â: 1, Ä: 1, Ã: 1,
      È: 5, É: 5, Ê: 5, Ë: 5,
      Ì: 9, Í: 9, Î: 9, Ï: 9,
      Ò: 15, Ó: 15, Ô: 15, Ö: 15,
      Ù: 21, Ú: 21, Û: 21, Ü: 21,
      Ý: 25, Ÿ: 25,
      Ç: 3, Ñ: 14,
    };
    return map[c] || 0;
  }

  function isVowelLetter(ch) {
    const c = ch.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return 'AEIOUY'.indexOf(c) >= 0;
  }

  function nameNumber(str, vowelsOnly) {
    const s = String(str || '');
    let sum = 0;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (!/[A-Za-zÀ-ÿ]/.test(ch)) continue;
      if (vowelsOnly && !isVowelLetter(ch)) continue;
      sum += letterValue(ch);
    }
    return sum ? reduceDigits(sum) : null;
  }

  function expressionNumber(fullName) {
    return nameNumber(fullName, false);
  }

  function soulNumber(fullName) {
    return nameNumber(fullName, true);
  }

  function luckyNumbersFrom(lp, day, dayVibe, birthIso) {
    const parts = String(birthIso || '').split('-');
    const month = parts.length >= 2 ? Number(parts[1]) : 0;
    const year = parts.length >= 1 ? Number(parts[0]) : 0;
    const yearV = year ? reduceDigits(year) : null;
    const set = [];
    function push(n) {
      if (n == null || n === 0) return;
      const v = Number(n);
      if (!set.includes(v)) set.push(v);
    }
    push(lp);
    push(dayVibe);
    push(day);
    push(month);
    push(yearV);
    push(reduceDigits((lp || 0) + (dayVibe || 0)));
    // keep max 6 symbolic numbers
    return set.slice(0, 6);
  }

  function luckyStyle(lp, element) {
    const byPath = LUCK_BY_PATH[lp] || LUCK_BY_PATH[8];
    const byEl = LUCK_BY_ELEMENT[element] || { colors: [], scents: [] };
    const colors = [];
    const scents = [];
    (byPath.colors || []).forEach((c) => { if (!colors.includes(c)) colors.push(c); });
    (byEl.colors || []).forEach((c) => { if (!colors.includes(c)) colors.push(c); });
    (byPath.scents || []).forEach((c) => { if (!scents.includes(c)) scents.push(c); });
    (byEl.scents || []).forEach((c) => { if (!scents.includes(c)) scents.push(c); });
    return { colors: colors.slice(0, 5), scents: scents.slice(0, 5) };
  }

  function loadLastProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveLastProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) { /* ignore */ }
    pushRecentProfile(profile);
  }

  function loadRecentProfiles() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function pushRecentProfile(profile) {
    if (!profile || !profile.birthIso) return;
    let list = loadRecentProfiles().filter((p) => {
      return !(
        p.birthIso === profile.birthIso &&
        (p.firstName || '') === (profile.firstName || '') &&
        (p.lastName || '') === (profile.lastName || '')
      );
    });
    list.unshift({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      name: profile.name || '',
      gender: profile.gender || 'unspecified',
      birthIso: profile.birthIso,
      birthTime: profile.birthTime || '',
      place: profile.place || '',
      lifePath: profile.lifePath,
      sign: profile.sign,
      savedAt: Date.now(),
    });
    list = list.slice(0, RECENT_MAX);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (e) { /* ignore */ }
    renderRecentProfiles();
  }

  function renderRecentProfiles() {
    const wrap = document.getElementById('recentProfiles');
    const listEl = document.getElementById('recentProfilesList');
    if (!wrap || !listEl) return;
    const list = loadRecentProfiles();
    if (!list.length) {
      wrap.hidden = true;
      listEl.innerHTML = '';
      return;
    }
    wrap.hidden = false;
    listEl.innerHTML = list
      .map((p, i) => {
        const label =
          escapeHtml((p.firstName || p.name || 'Profil') + (p.lastName ? ' ' + p.lastName : '')) +
          ' · ' +
          escapeHtml(p.birthIso || '') +
          (p.lifePath ? ' · chemin ' + p.lifePath : '');
        return (
          '<li><button type="button" class="recent-item" data-recent-index="' +
          i +
          '" data-ripple>' +
          label +
          '</button></li>'
        );
      })
      .join('');
  }

  function formatBirthFr(iso) {
    const parts = String(iso).split('-');
    if (parts.length < 3) return iso;
    const months = [
      '',
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];
    return Number(parts[2]) + ' ' + months[Number(parts[1])] + ' ' + parts[0];
  }

  function buildReading(input, birthIso, place, giftsOverride, extraInvites) {
    // Compat: buildReading(name, ...) OR buildReading({ firstName, lastName, gender, birthTime, ... })
    let firstName = '';
    let lastName = '';
    let gender = 'unspecified';
    let birthTime = '';
    let name = '';
    if (input && typeof input === 'object') {
      firstName = (input.firstName || '').trim();
      lastName = (input.lastName || '').trim();
      gender = input.gender || 'unspecified';
      birthTime = (input.birthTime || '').trim();
      place = input.place != null ? input.place : place;
      birthIso = input.birthIso || input.birth || birthIso;
      giftsOverride = input.giftsOverride != null ? input.giftsOverride : giftsOverride;
      extraInvites = input.extraInvites != null ? input.extraInvites : extraInvites;
      name = (input.name || [firstName, lastName].filter(Boolean).join(' ')).trim();
    } else {
      name = String(input || '').trim();
      const parts = name.split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ');
    }

    const lp = lifePathFromDate(birthIso);
    const dv = dayVibeFromDate(birthIso);
    const ss = sunSignDecan(birthIso);
    if (!lp || !dv || !ss) return null;
    const path = PATH_COPY[lp];
    const dayCopy = DAY_VIBE_COPY[dv.vibe] || { short: '', sense: '', concrete: '' };
    const signMeta = SIGN_COPY[ss.sign] || null;
    const decanMeta = DECAN_NOTE[ss.decan] || { label: ss.decan + 'e décan', note: '' };
    const ruler =
      (DECAN_RULERS[ss.sign] && DECAN_RULERS[ss.sign][ss.decan]) ||
      (signMeta && signMeta.planet) ||
      '—';
    const voice = genderVoice(gender);
    const fullName = name || firstName || 'Lecteur·rice';

    const weekPlan = (path.weekPlan || path.invites || []).slice();
    if (extraInvites && extraInvites.length) {
      extraInvites.forEach((x) => {
        if (!weekPlan.includes(x)) weekPlan.push(x);
      });
    }

    const domains =
      giftsOverride && giftsOverride.length
        ? giftsOverride
        : suggestDomains(path, signMeta);

    const signLine =
      (signMeta ? signMeta.glyph + ' ' : '') +
      ss.sign +
      ' · ' +
      (decanMeta.label || ss.decan + 'e décan') +
      ' · ' +
      (signMeta ? signMeta.element + ' · ' + signMeta.modality : '') +
      ' · planète ' +
      (signMeta ? signMeta.planet : '—') +
      ' · décan : ' +
      ruler;

    const expr = expressionNumber(fullName);
    const soul = soulNumber(fullName);
    const luckNums = luckyNumbersFrom(lp, dv.day, dv.vibe, birthIso);
    const luckStyle = luckyStyle(lp, signMeta ? signMeta.element : '');

    const cultivate = (path.strengths || []).slice(0, 4).map((s) => {
      return 'Cultiver : ' + s.replace(/\s*—\s*.*$/, '').trim();
    });
    if (!cultivate.length) {
      cultivate.push('Cultiver la clarté de ton intention cette semaine.');
    }

    const attention = (path.shadows || []).slice(0, 4).map((s) => {
      const parts = String(s).split('→');
      if (parts.length > 1) return 'Attention : ' + parts[0].trim() + ' — piste : ' + parts[1].trim();
      return 'Attention : ' + s;
    });
    if (!attention.length) {
      attention.push('Attention : éviter de figer cette lecture comme un destin.');
    }

    // Légères adaptations de ton selon le genre (phrases courtes)
    const forceLead =
      voice.key === 'femme'
        ? 'Elle peut s’appuyer sur ses forces naturelles tout en restant libre de choisir.'
        : voice.key === 'homme'
          ? 'Il peut s’appuyer sur ses forces naturelles tout en restant libre de choisir.'
          : 'Iel peut s’appuyer sur ses forces naturelles tout en restant libre de choisir.';

    const whatCanDo =
      voice.key === 'femme'
        ? 'Ce qu’elle peut faire : explorer les domaines suggérés comme des terrains de jeu, pas des obligations.'
        : voice.key === 'homme'
          ? 'Ce qu’il peut faire : explorer les domaines suggérés comme des terrains de jeu, pas des obligations.'
          : 'Ce qu’iel peut faire : explorer les domaines suggérés comme des terrains de jeu, pas des obligations.';

    const ascNote = birthTime
      ? 'Heure saisie : ' +
        birthTime +
        ' — l’ascendant précis nécessite aussi un lieu géolocalisé et une éphéméride ; non calculé dans cette maquette (signe solaire + décan seulement).'
      : 'Ascendant non calculé sans heure de naissance — signe solaire et décan uniquement.';

    return {
      firstName: firstName,
      lastName: lastName,
      name: fullName,
      gender: gender,
      voice: voice,
      birthIso: birthIso,
      birthFr: formatBirthFr(birthIso),
      birthTime: birthTime,
      place: place || '',
      lifePath: lp,
      pathTitle: path.title,
      pathCalc: lifePathCalcReminder(birthIso),
      mission: path.mission || (path.paras && path.paras[0]) || '',
      strengths: path.strengths || [],
      shadows: path.shadows || [],
      inRelations: path.inRelations || '',
      inWork: path.inWork || '',
      inEnergy: path.inEnergy || '',
      pathParas: path.paras || [],
      forceLead: forceLead,
      whatCanDo: whatCanDo,
      day: dv.day,
      dayVibe: dv.vibe,
      dayVibeShort: typeof dayCopy === 'string' ? dayCopy : dayCopy.short || '',
      dayVibeSense: typeof dayCopy === 'string' ? dayCopy : dayCopy.sense || '',
      dayVibeConcrete: typeof dayCopy === 'string' ? '' : dayCopy.concrete || '',
      dayPathAlliance: allianceDayPath(dv.vibe, lp, path.title),
      sign: ss.sign,
      decan: ss.decan,
      signGlyph: signMeta ? signMeta.glyph : '',
      signElement: signMeta ? signMeta.element : '',
      signModality: signMeta ? signMeta.modality : '',
      signPlanet: signMeta ? signMeta.planet : '',
      signIntro: signMeta ? signMeta.intro : '',
      signRelational: signMeta ? signMeta.relational : '',
      decanNote: decanMeta.note || '',
      decanRuler: ruler,
      signLine: signLine,
      pathSignAlliance: alliancePathSign(lp, path.title, signMeta),
      ascNote: ascNote,
      expression: expr,
      soul: soul,
      luckyNumbers: luckNums,
      luckyColors: luckStyle.colors,
      luckyScents: luckStyle.scents,
      cultivate: cultivate,
      attention: attention,
      domains: domains,
      gifts: domains,
      weekPlan: weekPlan.slice(0, 7),
      invites: weekPlan.slice(0, 5),
      mirrors: path.mirrors || [],
    };
  }

  function setReadingMode(mode) {
    const v = document.getElementById('readVerbatimWrap');
    const s = document.getElementById('readStructuredWrap');
    if (v) v.hidden = mode !== 'verbatim';
    if (s) s.hidden = mode !== 'structured';
  }

  function renderKrizouaVerbatim() {
    const out = document.getElementById('readingOutput');
    const body = document.getElementById('readVerbatimBody');
    if (!out || !body) return;
    out.hidden = false;
    setReadingMode('verbatim');
    body.textContent = KRIZOUA_VERBATIM_TEXT;
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderReading(data) {
    const out = document.getElementById('readingOutput');
    if (!out || !data) return;
    out.hidden = false;
    setReadingMode('structured');

    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    const neo = (data.voice && data.voice.neo) || 'né·e';
    set('outName', data.name);
    let meta = neo + ' le ' + data.birthFr;
    if (data.place) meta += ' à ' + data.place;
    if (data.birthTime) meta += ' · ' + data.birthTime;
    set('outBirthPlace', meta);

    set('outLifePath', data.lifePath + ' · ' + data.pathTitle);
    set('outDayVibe', data.day + ' → vibration ' + data.dayVibe);
    set(
      'outSignDecan',
      (data.signGlyph ? data.signGlyph + ' ' : '') +
        data.sign +
        ' · ' +
        data.decan +
        'e décan'
    );
    set('outElement', data.signElement || '—');

    const pills = document.getElementById('outSynthPills');
    if (pills) {
      const items = [
        { k: 'Chemin', v: String(data.lifePath) },
        { k: 'Signe', v: (data.signGlyph ? data.signGlyph + ' ' : '') + data.sign },
        { k: 'Vib. jour', v: String(data.dayVibe) },
        { k: 'Élément', v: data.signElement || '—' },
      ];
      pills.innerHTML = items
        .map(
          (it) =>
            '<span class="synth-pill"><span class="pk">' +
            escapeHtml(it.k) +
            '</span><span class="pv">' +
            escapeHtml(it.v) +
            '</span></span>'
        )
        .join('');
    }

    set('outPathNum', String(data.lifePath));
    set('outPathTitle', data.pathTitle);
    set('outPathCalc', data.pathCalc || '');

    setHtml(
      'outPathBody',
      '<div class="read-sec">' +
        '<h4 class="read-subh">Mission d’âme</h4>' +
        '<p class="body">' +
        escapeHtml(data.mission) +
        '</p>' +
        '<p class="body" style="margin-top:8px;">' +
        escapeHtml(data.forceLead || '') +
        '</p>' +
        '</div>' +
        '<div class="read-sec">' +
        '<h4 class="read-subh">Forces</h4>' +
        ulHtml(data.strengths, 'read-bullets') +
        '</div>' +
        '<div class="read-sec">' +
        '<h4 class="read-subh">Défis / ombres — et comment les transformer</h4>' +
        ulHtml(data.shadows, 'read-bullets') +
        '</div>' +
        '<div class="read-sec">' +
        '<p class="body">' +
        escapeHtml(data.whatCanDo || '') +
        '</p>' +
        '</div>' +
        '<div class="read-sec read-tri">' +
        '<h4 class="read-subh">En relations</h4>' +
        '<p class="body">' +
        escapeHtml(data.inRelations) +
        '</p>' +
        '<h4 class="read-subh">En travail</h4>' +
        '<p class="body">' +
        escapeHtml(data.inWork) +
        '</p>' +
        '<h4 class="read-subh">En énergie personnelle</h4>' +
        '<p class="body">' +
        escapeHtml(data.inEnergy) +
        '</p>' +
        '</div>'
    );

    set('outVibeNum', 'Jour ' + data.day + ' · vibration ' + data.dayVibe);
    setHtml(
      'outVibeText',
      '<p class="body" style="margin-bottom:10px;">' +
        escapeHtml(data.dayVibeSense) +
        '</p>' +
        '<p class="body" style="margin-bottom:10px;"><strong class="gold-em">Alliance avec le chemin</strong> — ' +
        escapeHtml(data.dayPathAlliance) +
        '</p>' +
        '<p class="body">' +
        escapeHtml(data.dayVibeConcrete) +
        '</p>'
    );

    set('outNumPath', String(data.lifePath) + ' · ' + data.pathTitle);
    set('outNumDay', data.day + ' → ' + data.dayVibe);
    set('outNumExpr', data.expression != null ? String(data.expression) : '— (nom requis)');
    set('outNumSoul', data.soul != null ? String(data.soul) : '— (nom requis)');

    set('outSignLine', data.signLine || data.sign + ' · ' + data.decan + 'e décan');
    setHtml(
      'outSignTraits',
      '<p class="body" style="margin-bottom:10px;">' +
        escapeHtml(data.signIntro) +
        '</p>' +
        '<p class="body" style="margin-bottom:10px;"><strong class="gold-em">Décan</strong> — ' +
        escapeHtml(data.decanNote) +
        ' Influence traditionnelle du décan : ' +
        escapeHtml(data.decanRuler) +
        '.</p>' +
        '<p class="body" style="margin-bottom:10px;"><strong class="gold-em">Alliance avec le chemin</strong> — ' +
        escapeHtml(data.pathSignAlliance) +
        '</p>' +
        '<p class="body">' +
        escapeHtml(data.signRelational) +
        '</p>'
    );

    const ascEl = document.getElementById('outAscNote');
    if (ascEl) {
      ascEl.hidden = false;
      ascEl.textContent = data.ascNote || '';
    }

    const luckN = document.getElementById('outLuckyNumbers');
    if (luckN) {
      luckN.innerHTML = (data.luckyNumbers || [])
        .map((n) => '<span class="luck-chip num">' + escapeHtml(String(n)) + '</span>')
        .join('');
    }
    const luckC = document.getElementById('outLuckyColors');
    if (luckC) {
      luckC.innerHTML = (data.luckyColors || [])
        .map((n) => '<span class="luck-chip color">' + escapeHtml(n) + '</span>')
        .join('');
    }
    const luckS = document.getElementById('outLuckyScents');
    if (luckS) {
      luckS.innerHTML = (data.luckyScents || [])
        .map((n) => '<span class="luck-chip scent">' + escapeHtml(n) + '</span>')
        .join('');
    }

    const cult = document.getElementById('outCultivate');
    if (cult) {
      cult.innerHTML = (data.cultivate || []).map((g) => '<li>' + escapeHtml(g) + '</li>').join('');
    }
    const att = document.getElementById('outAttention');
    if (att) {
      att.innerHTML = (data.attention || []).map((g) => '<li>' + escapeHtml(g) + '</li>').join('');
    }

    const gifts = document.getElementById('outGifts');
    if (gifts) {
      gifts.className = 'read-bullets domains-list';
      gifts.innerHTML = (data.domains || data.gifts || [])
        .map((g) => '<li>' + escapeHtml(g) + '</li>')
        .join('');
    }

    const week = document.getElementById('outWeekPlan');
    if (week) {
      week.innerHTML = (data.weekPlan || [])
        .map((g) => '<li>' + escapeHtml(g) + '</li>')
        .join('');
    }

    const mirrors = document.getElementById('outMirrors');
    if (mirrors) {
      mirrors.innerHTML = (data.mirrors || [])
        .map((g) => '<li>' + escapeHtml(g) + '</li>')
        .join('');
    }

    const invites = document.getElementById('outInvites');
    if (invites) {
      invites.innerHTML = (data.weekPlan || data.invites || [])
        .map((g) => '<li>' + escapeHtml(g) + '</li>')
        .join('');
    }

    saveLastProfile(data);
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function fillReadingForm(personaKey) {
    const p = PERSONAS[personaKey] || PERSONAS.aicha;
    const first = document.getElementById('readFirstName');
    const last = document.getElementById('readLastName');
    const gender = document.getElementById('readGender');
    const birthEl = document.getElementById('readBirth');
    const timeEl = document.getElementById('readBirthTime');
    const placeEl = document.getElementById('readPlace');
    const nameEl = document.getElementById('readName');
    if (first) first.value = p.firstName || p.name || '';
    if (last) last.value = p.lastName || '';
    if (gender) gender.value = p.gender || 'unspecified';
    if (birthEl) birthEl.value = p.birth;
    if (timeEl) timeEl.value = p.birthTime || '';
    if (placeEl) placeEl.value = p.place;
    if (nameEl) nameEl.value = p.name || [p.firstName, p.lastName].filter(Boolean).join(' ');
  }

  function fillReadingFormFromProfile(p) {
    if (!p) return;
    const first = document.getElementById('readFirstName');
    const last = document.getElementById('readLastName');
    const gender = document.getElementById('readGender');
    const birthEl = document.getElementById('readBirth');
    const timeEl = document.getElementById('readBirthTime');
    const placeEl = document.getElementById('readPlace');
    const nameEl = document.getElementById('readName');
    if (first) first.value = p.firstName || '';
    if (last) last.value = p.lastName || '';
    if (gender) gender.value = p.gender || 'unspecified';
    if (birthEl) birthEl.value = p.birthIso || p.birth || '';
    if (timeEl) timeEl.value = p.birthTime || '';
    if (placeEl) placeEl.value = p.place || '';
    if (nameEl) {
      nameEl.value =
        p.name || [p.firstName, p.lastName].filter(Boolean).join(' ');
    }
  }

  function readFormPayload() {
    const firstName = ((document.getElementById('readFirstName') || {}).value || '').trim();
    const lastName = ((document.getElementById('readLastName') || {}).value || '').trim();
    const gender = ((document.getElementById('readGender') || {}).value || 'unspecified');
    const birth = ((document.getElementById('readBirth') || {}).value || '').trim();
    const birthTime = ((document.getElementById('readBirthTime') || {}).value || '').trim();
    const place = ((document.getElementById('readPlace') || {}).value || '').trim();
    const name = [firstName, lastName].filter(Boolean).join(' ');
    const nameEl = document.getElementById('readName');
    if (nameEl) nameEl.value = name;
    return {
      firstName: firstName,
      lastName: lastName,
      name: name,
      gender: gender,
      birthIso: birth,
      birthTime: birthTime,
      place: place,
    };
  }

  function setPersonaActive(key) {
    document.querySelectorAll('.persona-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.persona === key);
    });
  }

  function withReadingLoading(done) {
    const loading = document.getElementById('readingLoading');
    const formCard = document.getElementById('readingFormCard');
    const btn = document.getElementById('btnGenerateReading');
    if (loading) loading.hidden = false;
    if (formCard) formCard.style.opacity = '0.55';
    if (btn) btn.disabled = true;
    setTimeout(() => {
      try {
        done();
      } finally {
        if (loading) loading.hidden = true;
        if (formCard) formCard.style.opacity = '';
        if (btn) btn.disabled = false;
      }
    }, 280);
  }

  function generateFromForm() {
    const payload = readFormPayload();
    if (!payload.firstName) {
      toast('Indique un prénom');
      const el = document.getElementById('readFirstName');
      if (el) el.focus();
      return;
    }
    if (!payload.birthIso) {
      toast('Indique une date de naissance');
      return;
    }
    const k = PERSONAS.krizoua;
    // Exemple KD : texte Dave verbatim — pas de reconstruction
    if (
      payload.birthIso === k.birth &&
      (payload.name === k.name ||
        payload.firstName.toLowerCase().includes('krizoua') ||
        payload.name.toLowerCase().includes('krizoua'))
    ) {
      withReadingLoading(() => {
        setPersonaActive('krizoua');
        renderKrizouaVerbatim();
        // Persist form identity anyway for multi-person UX
        saveLastProfile({
          firstName: payload.firstName,
          lastName: payload.lastName,
          name: payload.name || k.name,
          gender: payload.gender || 'homme',
          birthIso: payload.birthIso,
          birthTime: payload.birthTime,
          place: payload.place || k.place,
          lifePath: 3,
          sign: 'Balance',
        });
        toast('Exemple KD · Krizoua ✦');
      });
      return;
    }
    const data = buildReading(payload);
    if (!data) {
      toast('Date invalide');
      return;
    }
    withReadingLoading(() => {
      setPersonaActive('aicha');
      renderReading(data);
      toast('Profil complet généré ✦');
    });
  }

  function bindReading() {
    const form = document.getElementById('readingForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateFromForm();
      });
    }

    const btnA = document.getElementById('btnPersonaAicha');
    const btnK = document.getElementById('btnPersonaKrizoua');
    if (btnA) {
      btnA.addEventListener('click', () => {
        setPersonaActive('aicha');
        fillReadingForm('aicha');
        const p = PERSONAS.aicha;
        const data = buildReading({
          firstName: p.firstName,
          lastName: p.lastName,
          name: p.name,
          gender: p.gender,
          birthIso: p.birth,
          birthTime: p.birthTime || '',
          place: p.place,
        });
        renderReading(data);
      });
    }
    if (btnK) {
      btnK.addEventListener('click', () => {
        setPersonaActive('krizoua');
        fillReadingForm('krizoua');
        renderKrizouaVerbatim();
      });
    }

    const recentList = document.getElementById('recentProfilesList');
    if (recentList) {
      recentList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-recent-index]');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-recent-index'));
        const list = loadRecentProfiles();
        const p = list[idx];
        if (!p) return;
        fillReadingFormFromProfile(p);
        setPersonaActive('aicha');
        if (
          p.birthIso === PERSONAS.krizoua.birth &&
          ((p.name || '').toLowerCase().includes('krizoua') ||
            (p.firstName || '').toLowerCase().includes('krizoua'))
        ) {
          renderKrizouaVerbatim();
          return;
        }
        const data = buildReading({
          firstName: p.firstName,
          lastName: p.lastName,
          name: p.name,
          gender: p.gender,
          birthIso: p.birthIso,
          birthTime: p.birthTime || '',
          place: p.place,
        });
        if (data) renderReading(data);
      });
    }

    // Prefill: last saved profile, else Aïcha seed
    const last = loadLastProfile();
    if (last && last.birthIso) {
      fillReadingFormFromProfile(last);
    } else {
      fillReadingForm('aicha');
    }
    renderRecentProfiles();
  }

  /* —— Calculateur de menstruation —— */
  const CALC_KEY = 'ca_calc_v1';
  let lastCalcRes = null;
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

  function formatFRSpoken(d) {
    const n = d.getDate() === 1 ? '1er' : String(d.getDate());
    return n + ' ' + FR_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function weekdayFR(d) {
    return ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][d.getDay()];
  }

  function syncCalcWords() {
    const lastEl = document.getElementById('calcLastStart');
    const words = document.getElementById('calcLastStartWords');
    if (!words) return;
    const d = lastEl && parseYMD(lastEl.value);
    words.textContent = d ? fmtDate(d) : '';
  }

  function daysBetween(a, b) {
    const ms = 24 * 60 * 60 * 1000;
    return Math.round((b.getTime() - a.getTime()) / ms);
  }

  /**
   * Phase bien-être, à partir du jour affiché 1..C (pas un diagnostic).
   * Interne : règles sur 1..P, puis folliculaire, milieu autour de C−14 (±1), puis lutéale.
   * À l'écran : « Règles », « Avant le milieu », « Milieu de cycle », « Après le milieu ».
   * Le milieu n'est jamais libellé fertile.
   */
  function softPhase(dayInCycle, periodLen, cycleLen) {
    const P = periodLen;
    const C = cycleLen;
    const center = C - 14; // autour de C−14
    const winStart = center - 1; // fenêtre ±1
    const winEnd = center + 1;
    if (dayInCycle >= 1 && dayInCycle <= P) {
      return { key: 'menstruelle', label: 'Règles' }; // libellés traduits à l’affichage
    }
    if (dayInCycle >= winStart && dayInCycle <= winEnd) {
      return { key: 'ovulatoire', label: 'Milieu de cycle' };
    }
    if (dayInCycle > P && dayInCycle < winStart) {
      return { key: 'folliculaire', label: 'Avant le milieu' };
    }
    return { key: 'luteale', label: 'Après le milieu' };
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

  /**
   * Moteur algébrique (commentaires FR). Aucune estimation magique.
   * C = cycleLength, jours, défaut 28, borné 21–35.
   * P = periodLength, défaut 5, borné 2–8.
   * D0 = lastStart (date des dernières règles).
   * Aujourd'hui produit forcé : mercredi 23 septembre 2026 (DEMO.today),
   * même si le calendrier réel a avancé. Jamais new Date() pour ce calcul.
   *
   * delta = (today − D0) en jours (peut être négatif).
   * k = floor(delta / C)
   * dayInCycle0 = delta mod C ; si négatif, on ajoute C → [0, C−1].
   * Jour affiché (1..C) = dayInCycle0 + 1
   *   (D0 est le jour 1. Ex. D0 = 1er sept. 2026, today = 23 sept. → jour 23.)
   * nextStart = D0 + C × (k + 1)
   *   (C = 28 et D0 = 2026-09-01 → k = floor(22/28) = 0 → 29 septembre 2026.)
   * Prochaine date = dernières règles + longueur du cycle (répétée k+1 fois).
   */
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

  function productToday() {
    const d = parseYMD(DEMO.today);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function computeCalc(lastStart, periodLen, cycleLen, today) {
    const start = parseYMD(lastStart); // D0
    if (!start) return null;
    const P = clampPeriod(periodLen);
    const C = clampCycle(cycleLen);
    const todayD = today ? new Date(today.getFullYear(), today.getMonth(), today.getDate()) : productToday();
    todayD.setHours(0, 0, 0, 0);

    const delta = daysBetween(start, todayD); // (today − D0) en jours
    const k = Math.floor(delta / C);
    // mod algébrique : si négatif, ajouter C
    let dayInCycle0 = delta % C;
    if (dayInCycle0 < 0) dayInCycle0 += C;
    const dayInCycle = dayInCycle0 + 1; // 1..C
    const phase = softPhase(dayInCycle, P, C);

    // nextStart = D0 + C * (k+1)
    const nextStart = addDays(start, C * (k + 1));
    const nextEnd = addDays(nextStart, P - 1);

    const periods = [];
    let cursor = nextStart;
    for (let i = 0; i < 3; i++) {
      periods.push({
        start: new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()),
        end: addDays(cursor, P - 1),
      });
      cursor = addDays(cursor, C);
    }

    return {
      periodLen: P,
      cycleLen: C,
      delta: delta,
      k: k,
      dayInCycle0: dayInCycle0,
      nextStart: nextStart,
      nextEnd: nextEnd,
      dayInCycle: dayInCycle,
      phase: phase,
      periods: periods,
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

    if (nextStart) nextStart.textContent = fmtDate(res.nextStart, { ordinal: false });
    if (nextEnd) nextEnd.textContent = fmtDate(res.nextEnd, { ordinal: false });

    const formula = document.getElementById('calcFormula');
    if (formula) {
      formula.hidden = false;
      formula.textContent = t('Prochaine date = dernières règles + longueur du cycle');
    }
    if (res.dayInCycle != null) {
      if (dayNum) dayNum.textContent = String(res.dayInCycle);
      if (dayLine) {
        dayLine.textContent = t('Jour {n} sur {c}', { n: res.dayInCycle, c: res.cycleLen });
      }
      if (phaseLabel) {
        phaseLabel.textContent = t(PHASE_META[res.phase.key].full);
        phaseLabel.className = 'calc-phase phase-chip ph-' + res.phase.key;
      }
      const start = res.nextStart ? addDays(res.nextStart, -res.cycleLen) : null;
      renderPhaseTimeline(document.getElementById('calcTimeline'), res);
      if (start) renderPhaseList(document.getElementById('calcPhaseList'), res, start);
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
        dayLine.textContent = t('Date de début dans le futur — jour non calculé');
      }
      if (phaseLabel) phaseLabel.textContent = '—';
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
          fmtDate(per.start, { ordinal: false }) +
          ' → ' +
          fmtDate(per.end, { ordinal: false }) +
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
    syncCalcWords();
    if (lastEl) lastEl.addEventListener('change', syncCalcWords);

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
      const res = computeCalc(data.lastStart, data.periodLen, data.cycleLen);
      if (!res) {
        toast('Date invalide');
        return;
      }
      lastCalcRes = res;
      sessionCalcInputs = data;
      renderCalcResults(res);
      guidePhase = null;
      renderPhaseGuide();
      renderTrends();
      const results = document.getElementById('calcResults');
      if (results) results.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      // Enregistrer seulement avec consentement explicite (sinon : session uniquement).
      requireCycleConsent((ok) => {
        if (ok) {
          saveCalcInputs(data);
          toast('Ta date est prête');
        } else {
          toast('Ta date est prête · non enregistrée');
        }
      });
    });
  }


  /* —— Remise à zéro / Nouvelle personne —— */
  function clearReadingFormEmpty() {
    const ids = ['readFirstName', 'readLastName', 'readBirth', 'readBirthTime', 'readPlace', 'readName'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const gender = document.getElementById('readGender');
    if (gender) gender.value = 'unspecified';
  }

  function hideReadingOutput() {
    const out = document.getElementById('readingOutput');
    if (out) out.hidden = true;
    const loading = document.getElementById('readingLoading');
    if (loading) loading.hidden = true;
    const formCard = document.getElementById('readingFormCard');
    if (formCard) formCard.style.opacity = '';
    const v = document.getElementById('readVerbatimWrap');
    if (v) v.hidden = true;
    const s = document.getElementById('readStructuredWrap');
    if (s) s.hidden = false;
    setPersonaActive('aicha');
  }

  function clearCheckinDemo() {
    const mood = document.getElementById('moodChips');
    if (mood) mood.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
    document.querySelectorAll('#symptomList .symptom-item').forEach((item) => {
      item.classList.remove('selected');
      const input = item.querySelector('input');
      if (input) input.checked = false;
    });
    const energy = document.getElementById('energySlider');
    if (energy) {
      energy.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
    }
    const energyLabel = document.getElementById('energyLabel');
    if (energyLabel) energyLabel.textContent = '— / 5';
    const note = document.getElementById('noteField');
    if (note) note.value = '';
    const hist = document.getElementById('historyPanel');
    const form = document.getElementById('checkinForm');
    if (hist) hist.hidden = true;
    if (form) form.hidden = false;
  }

  function clearCalcForNewPerson() {
    try {
      localStorage.removeItem(CALC_KEY);
    } catch (_) { /* ignore */ }
    const last = document.getElementById('calcLastStart');
    const period = document.getElementById('calcPeriodLen');
    const cycle = document.getElementById('calcCycleLen');
    // Défaut cohérent septembre 2026 (prêt à recalculer, écran résultats vidé)
    if (last) last.value = DEMO.cycle.lastPeriodStart;
    if (period) period.value = String(DEMO.cycle.avgPeriod);
    if (cycle) cycle.value = String(DEMO.cycle.avgCycle);
    syncCalcWords();
    const results = document.getElementById('calcResults');
    if (results) results.hidden = true;
    sessionCalcInputs = null;
  }

  function resetCurrentPerson(opts) {
    opts = opts || {};
    const skipConfirm = !!opts.skipConfirm;
    if (!skipConfirm) {
      const ok = window.confirm(
        t('Nouvelle personne / Remise à zéro ?\n\nLe formulaire, les résultats et le profil courant seront vidés. Les profils récents restent disponibles.')
      );
      if (!ok) return false;
    }
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(CALC_KEY);
    } catch (_) { /* ignore */ }

    clearReadingFormEmpty();
    hideReadingOutput();
    clearCheckinDemo();
    clearCalcForNewPerson();
    renderRecentProfiles();

    const hello = document.getElementById('hubHello');
    if (hello) hello.textContent = 'Bonjour ✦';
    const hubDate = document.getElementById('hubDate');
    if (hubDate) hubDate.textContent = fmtDate(productToday(), { weekday: true, cap: true });
    const avatar = document.getElementById('profileAvatar');
    if (avatar) avatar.textContent = '?';
    const pname = document.getElementById('profileName');
    if (pname) pname.textContent = 'Nouvelle personne';
    const ptags = document.getElementById('profileTags');
    if (ptags) ptags.textContent = 'Profil prêt à saisir · septembre 2026';

    toast('Remise à zéro · prêt pour une nouvelle personne');
    go('reading');
    const first = document.getElementById('readFirstName');
    if (first) setTimeout(() => first.focus(), 120);
    return true;
  }


  function renderProductSurfaces() {
    const res = computeCalc(
      DEMO.cycle.lastPeriodStart,
      DEMO.cycle.avgPeriod,
      DEMO.cycle.avgCycle
    );
    if (!res) return;
    const msg = document.getElementById('hubMessage');
    if (msg) {
      const d = res.nextStart;
      msg.textContent = t('Prochaines règles · vers le {d}', { d: fmtDate(d, { year: false }) });
    }
    const today = productToday();
    const start = parseYMD(DEMO.cycle.lastPeriodStart);
    const cycleLine = document.getElementById('cycleTodayLine');
    if (cycleLine) {
      cycleLine.textContent = t('Aujourd’hui · {d}', { d: fmtDate(today, { weekday: true }) });
    }
    const cycleNext = document.getElementById('cycleNextLine');
    if (cycleNext) {
      cycleNext.textContent = t('Prochaine date · {d}', { d: fmtDate(res.nextStart) });
    }
    const d0 = document.getElementById('cycleD0Line');
    if (d0 && start) {
      d0.textContent = t('Dernières règles · {d} · cycle de {n} jours', { d: fmtDate(start), n: res.cycleLen });
    }
  }

  function bindResetPerson() {
    const ids = [
      'btnResetPersonHome',
      'btnResetPersonHub',
      'btnResetPersonProfile',
      'btnResetPersonReading',
      'btnResetPersonReadingHdr',
    ];
    ids.forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetCurrentPerson();
      });
    });
  }

  /* —— Interactions —— */
  function bindClicks() {
    document.body.addEventListener('click', (e) => {
      const rippleEl = e.target.closest('[data-ripple], .btn-primary, .nav-item, .hub-chip, .pillar-cta');
      if (rippleEl) rippleAt(rippleEl, e);

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
        moodChips.querySelectorAll('.chip').forEach((c) => {
          c.classList.remove('selected');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('selected');
        chip.setAttribute('aria-pressed', 'true');
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
        energySlider.querySelectorAll('button').forEach((x) => {
          x.classList.remove('selected');
          x.setAttribute('aria-pressed', 'false');
        });
        b.classList.add('selected');
        b.setAttribute('aria-pressed', 'true');
        if (energyLabel) energyLabel.textContent = b.dataset.e + ' / 5';
      });
    }

    // Save check-in
    const saveBtn = document.getElementById('btnSaveCheckin');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const entry = readCheckinEntry();
        requireCycleConsent((ok) => {
          if (ok) {
            saveJournalEntry(entry);
            renderJournalHistory();
            renderTrends();
            toast('Check-in enregistré ✦');
          } else {
            toast('Check-in noté pour cette session · non enregistré');
          }
        });
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
        // Correction de période : rien n’est enregistré sans consentement.
        // v1.2.0 : ouvre « Mon historique de règles » (rien n’est enregistré sans consentement).
        const sec = document.getElementById('secHistory');
        if (sec) sec.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
        const f = document.getElementById('histStart');
        if (f) setTimeout(() => f.focus({ preventScroll: true }), 350);
      });
    }

    // Forfaits : « Choisir » n’active rien (paiement plus tard)
    document.querySelectorAll('[data-plan-choose]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Ne JAMAIS appeler setPlan ici — réservé au pont paiement / Market.
        toast('Les forfaits se choisissent sur King Daveblessing Market');
        setTimeout(backToMarket, 900);
      });
    });
  }

  /* —— Retour au Market ——
   * Dans un cadre (iframe du Market) : message au parent, puis navigation haute si autorisée.
   * Seule : navigation vers MARKET_URL.
   */
  function backToMarket() {
    let inFrame = false;
    try {
      inFrame = window.self !== window.top;
    } catch (_) {
      inFrame = true;
    }
    if (inFrame) {
      try {
        window.parent.postMessage({ type: 'cycle-astro:back-to-market' }, '*');
      } catch (_) { /* ignore */ }
      try {
        window.top.location.href = MARKET_URL;
      } catch (_) { /* navigation haute refusée : le Market gère le message */ }
      return;
    }
    window.location.href = MARKET_URL;
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  }

  /* —— Consentement données de cycle —— */
  let consentRefusedThisSession = false;
  let consentCallback = null;
  let consentReturnFocus = null;

  function getConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const c = JSON.parse(raw);
        if (c && c.accepted) return c;
      }
    } catch (_) { /* ignore */ }
    return null;
  }

  function requireCycleConsent(cb) {
    if (getConsent()) return cb(true);
    if (consentRefusedThisSession) return cb(false);
    openConsentSheet(cb);
  }

  function openConsentSheet(cb) {
    const sheet = document.getElementById('consentSheet');
    if (!sheet) return cb(false);
    consentCallback = cb;
    consentReturnFocus = document.activeElement;
    sheet.hidden = false;
    applyI18n();
    const yes = document.getElementById('btnConsentYes');
    if (yes) setTimeout(() => yes.focus(), 30);
  }

  function closeConsentSheet(accepted) {
    const sheet = document.getElementById('consentSheet');
    if (sheet) sheet.hidden = true;
    if (accepted) {
      try {
        localStorage.setItem(
          CONSENT_KEY,
          JSON.stringify({ accepted: true, at: new Date().toISOString(), version: APP_VERSION })
        );
      } catch (_) { /* ignore */ }
      toast('Merci · tes données restent sur ce téléphone');
    } else {
      consentRefusedThisSession = true;
    }
    const cb = consentCallback;
    consentCallback = null;
    if (consentReturnFocus && consentReturnFocus.focus) {
      try { consentReturnFocus.focus(); } catch (_) { /* ignore */ }
    }
    renderConsentStatus();
    if (cb) setTimeout(() => cb(!!accepted), accepted ? 900 : 0);
  }

  function bindConsent() {
    const yes = document.getElementById('btnConsentYes');
    const no = document.getElementById('btnConsentNo');
    const sheet = document.getElementById('consentSheet');
    if (yes) yes.addEventListener('click', () => closeConsentSheet(true));
    if (no) no.addEventListener('click', () => closeConsentSheet(false));
    if (sheet) {
      sheet.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeConsentSheet(false);
        } else if (e.key === 'Tab') {
          // Garder le focus dans la feuille
          const items = [yes, no].filter(Boolean);
          const i = items.indexOf(document.activeElement);
          if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
          else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
        }
      });
    }
  }

  function renderConsentStatus() {
    const el = document.getElementById('consentStatus');
    if (!el) return;
    const c = getConsent();
    if (c && c.at) {
      const d = new Date(c.at);
      el.textContent = t('Consentement : accepté le {d}', { d: fmtDate(d) });
    } else {
      el.textContent = t('Consentement : pas encore donné');
    }
  }

  /* —— Journal (check-in) : stocké seulement avec consentement —— */
  function readCheckinEntry() {
    const mood = document.querySelector('#moodChips .chip.selected');
    const symptoms = [];
    document.querySelectorAll('#symptomList .symptom-item').forEach((item) => {
      const input = item.querySelector('input');
      if (input && input.checked) symptoms.push(item.dataset.fr || item.textContent.trim());
    });
    const energyBtn = document.querySelector('#energySlider button.selected');
    const note = document.getElementById('noteField');
    return {
      date: toYMD(checkinDate()),
      mood: mood ? mood.dataset.mood : null,
      symptoms: symptoms,
      energy: energyBtn ? Number(energyBtn.dataset.e) : null,
      note: note ? note.value : '',
      savedAt: new Date().toISOString(),
    };
  }

  function loadJournal() {
    try {
      const raw = localStorage.getItem(JOURNAL_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function saveJournalEntry(entry) {
    const list = loadJournal().filter((e) => e.date !== entry.date);
    list.unshift(entry);
    try {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(list.slice(0, 120)));
    } catch (_) { /* ignore */ }
  }

  const MOOD_FR = {
    sereine: 'Sereine',
    fatiguee: 'Fatiguée',
    energique: 'Énergique',
    sensible: 'Sensible',
    motivee: 'Motivée',
    calme: 'Besoin de calme',
  };

  function renderJournalHistory() {
    const box = document.getElementById('historyList');
    if (!box) return;
    box.querySelectorAll('.history-item.saved').forEach((n) => n.remove());
    const list = loadJournal();
    list.slice(0, 5).reverse().forEach((e) => {
      const d = parseYMD(e.date);
      if (!d) return;
      const row = document.createElement('div');
      row.className = 'history-item saved';
      const dd = document.createElement('span');
      dd.className = 'd';
      dd.textContent = fmtDate(d, { year: false, ordinal: false });
      const cc = document.createElement('span');
      cc.className = 'c';
      const parts = [];
      if (e.mood && MOOD_FR[e.mood]) parts.push(t(MOOD_FR[e.mood]));
      if (e.symptoms && e.symptoms.length) parts.push(e.symptoms.map((x) => t(x)).join(', '));
      cc.textContent = parts.join(' · ') || '—';
      const ee = document.createElement('span');
      ee.className = 'e';
      ee.textContent = e.energy ? e.energy + '/5' : '—';
      row.appendChild(dd);
      row.appendChild(cc);
      row.appendChild(ee);
      box.insertBefore(row, box.firstChild);
    });
  }

  /* —— Mes données : export / suppression —— */
  function exportData() {
    const data = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf('ca_') === 0) {
          const raw = localStorage.getItem(k);
          try { data[k] = JSON.parse(raw); } catch (_) { data[k] = raw; }
        }
      }
    } catch (_) { /* ignore */ }
    const payload = {
      app: 'Cycle & Astro',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      note: 'Données stockées uniquement sur ce téléphone (localStorage). Bien-être, pas un avis médical.',
      data: data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cycle-astro-mes-donnees-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 500);
    toast('Export prêt · fichier téléchargé');
  }

  function deleteCycleData() {
    const ok = window.confirm(
      t('Supprimer tes données de cycle ?\n\nDates, calculs et journal enregistrés sur ce téléphone seront effacés. Ton forfait ne change pas.')
    );
    if (!ok) return;
    CYCLE_DATA_KEYS.forEach((k) => {
      try { localStorage.removeItem(k); } catch (_) { /* ignore */ }
    });
    consentRefusedThisSession = false;
    sessionPeriods = null;
    clearCalcForNewPerson();
    renderJournalHistory();
    renderHistory();
    renderTrends();
    renderConsentStatus();
    toast('Données de cycle supprimées');
  }

  function bindDataAndMarket() {
    document.querySelectorAll('[data-market-back]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        backToMarket();
      });
    });
    const ex = document.getElementById('btnExportData');
    if (ex) ex.addEventListener('click', exportData);
    const del = document.getElementById('btnDeleteCycleData');
    if (del) del.addEventListener('click', deleteCycleData);
    const ver = document.getElementById('appVersion');
    if (ver) ver.textContent = APP_VERSION;
  }

  /* —— Traductions ——
   * Le français du HTML est la source. Chaque nœud texte garde son original
   * pour pouvoir revenir au français. Les lectures longues restent en français.
   */
  const I18N_SKIP = '#readingOutput, .verbatim-body, textarea, script, style, #recentProfilesList, .lang-select';
  const textOrig = new WeakMap();
  const I18N_ATTRS = ['placeholder', 'aria-label', 'title'];

  function translateString(fr) {
    if (!I18N || currentLang === 'fr') return fr;
    const e = I18N.DICT[fr];
    return e && e[currentLang] ? e[currentLang] : null;
  }

  function applyI18n() {
    if (!I18N) return;
    const root = document.querySelector('.phone');
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const parent = n.parentElement;
      if (!parent || parent.closest(I18N_SKIP) || parent.closest('[data-i18n-html]')) continue;
      let orig = textOrig.get(n);
      const cur = n.nodeValue;
      const trimmed = cur.trim();
      if (!trimmed) continue;
      if (orig === undefined) {
        // Premier passage : on ne mémorise que les textes connus (source FR).
        if (!I18N.DICT[trimmed]) continue;
        orig = trimmed;
        textOrig.set(n, orig);
      }
      const tr = currentLang === 'fr' ? orig : (I18N.DICT[orig] && I18N.DICT[orig][currentLang]) || orig;
      const lead = cur.match(/^\s*/)[0];
      const tail = cur.match(/\s*$/)[0];
      const next = lead + tr + tail;
      if (cur !== next) n.nodeValue = next;
    }
    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const entry = I18N.HTML[key];
      if (entry) el.innerHTML = entry[currentLang] || entry.fr;
    });
    I18N_ATTRS.forEach((attr) => {
      root.querySelectorAll('[' + attr + ']').forEach((el) => {
        const store = 'i18nOrig' + attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase());
        let orig = el.dataset[store];
        if (orig === undefined) {
          const v = el.getAttribute(attr);
          if (!v || !I18N.DICT[v.trim()]) return;
          orig = v.trim();
          el.dataset[store] = orig;
        }
        const tr = currentLang === 'fr' ? orig : (I18N.DICT[orig] && I18N.DICT[orig][currentLang]) || orig;
        if (el.getAttribute(attr) !== tr) el.setAttribute(attr, tr);
      });
    });
    const note = document.getElementById('readingFrNote');
    if (note) note.hidden = currentLang === 'fr';
  }

  function fillLangSelects() {
    if (!I18N) return;
    document.querySelectorAll('[data-lang-select]').forEach((sel) => {
      if (!sel.options.length) {
        I18N.LANGS.forEach((l) => {
          const o = document.createElement('option');
          o.value = l.code;
          o.textContent = l.label;
          o.lang = l.html;
          sel.appendChild(o);
        });
        sel.addEventListener('change', () => setLang(sel.value));
      }
      sel.value = currentLang;
    });
  }

  function setLang(code, silent) {
    if (!I18N || !I18N.CODES.includes(code)) code = 'fr';
    currentLang = code;
    if (!silent) {
      try { localStorage.setItem(LANG_KEY, code); } catch (_) { /* ignore */ }
    }
    const meta = I18N ? I18N.LANGS.find((l) => l.code === code) : null;
    document.documentElement.lang = meta ? meta.html : 'fr';
    document.documentElement.setAttribute('data-lang', code);
    fillLangSelects();
    // Re-rendu des textes dynamiques puis des textes statiques
    buildCycleCalendar(document.getElementById('cycleCalendar'));
    buildMoonCalendar(document.getElementById('moonCalendar'));
    renderProductSurfaces();
    syncCalcWords();
    if (lastCalcRes) {
      const box = document.getElementById('calcResults');
      if (box && !box.hidden) renderCalcResults(lastCalcRes);
    }
    updatePlansView();
    renderConsentStatus();
    renderJournalHistory();
    renderAllV12();
    applyI18n();
  }

  /* —— Hors connexion : service worker (pas dans les instantanés figés) —— */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (/\/releases\//.test(location.pathname)) return; // instantané figé : pas de SW
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js?v=' + APP_VERSION, { scope: './' }).catch(() => { /* ignore */ });
    });
  }

  function buildPicker() {
    const labels = {
      splash: '1 · Accueil',
      onboarding: '2 · Disclaimer',
      today: '3 · Aujourd’hui',
      cycle: '4 · Mes règles',
      moon: '5 · Lune',
      astro: '6 · Astro',
      path: '7 · Chemin',
      reading: '8 · Lecture complète',
      journal: '9 · Journal',
      profile: '10 · Profil',
      calculator: '11 · Calculateur',
      plans: '12 · Forfaits',
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


  /* ================================================================
   * v1.2.0 — Options inspirées du benchmark (Flo, Clue, Stardust,
   * Natural Cycles, Ovia, Co–Star, The Pattern, CHANI, Sanctuary,
   * TimePassages). Tout tourne sur le téléphone : aucun serveur,
   * aucun paiement. Bien-être seulement, pas un avis médical.
   * ================================================================ */

  /* —— Phases : couleurs foncées (texte blanc, contraste AA) —— */
  const PHASE_ORDER = ['menstruelle', 'folliculaire', 'ovulatoire', 'luteale'];
  const PHASE_META = {
    menstruelle: { name: 'Menstruelle', full: 'Phase menstruelle', color: '#7A1F3D' },
    folliculaire: { name: 'Folliculaire', full: 'Phase folliculaire', color: '#1F5E4A' },
    ovulatoire: { name: 'Ovulatoire (estimée)', full: 'Phase ovulatoire (estimée)', color: '#8A5200' },
    luteale: { name: 'Lutéale', full: 'Phase lutéale', color: '#4A2C5E' },
  };

  /** Segments du cycle (jours 1..C groupés par phase, même moteur que softPhase). */
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

  /** Entrées actives du calculateur : session > enregistrées > démo. */
  let sessionCalcInputs = null;
  function activeCalcInputs() {
    const src = sessionCalcInputs || loadCalcInputs();
    return {
      lastStart: src.lastStart || DEMO.cycle.lastPeriodStart,
      periodLen: clampPeriod(src.periodLen),
      cycleLen: clampCycle(src.cycleLen),
    };
  }

  function phaseOfDate(date) {
    const inp = activeCalcInputs();
    const res = computeCalc(inp.lastStart, inp.periodLen, inp.cycleLen, date);
    return res ? res.phase.key : null;
  }

  /** Frise des 4 phases + repère « aujourd’hui ». */
  function renderPhaseTimeline(container, res) {
    if (!container || !res) return;
    const C = res.cycleLen;
    const segs = phaseSegments(res.periodLen, C);
    const bar = segs
      .map((s) => {
        const n = s.end - s.start + 1;
        const range = s.start === s.end ? String(s.start) : s.start + '–' + s.end;
        // Si le repère du jour tombe au milieu du segment, le libellé passe à gauche pour rester lisible.
        const rel = (res.dayInCycle - s.start + 0.5) / n;
        const side = res.dayInCycle >= s.start && res.dayInCycle <= s.end && n >= 6 && rel > 0.3 && rel < 0.8 ? ' pt-left' : '';
        return (
          '<span class="pt-seg ph-' + s.key + side + '" style="flex:' + n + ' 1 0" title="' +
          escapeHtml(t(PHASE_META[s.key].full)) + '"><span class="pt-range">' + range + '</span></span>'
        );
      })
      .join('');
    const pct = ((res.dayInCycle - 0.5) / C) * 100;
    let shift = -50;
    if (pct > 65) shift = -Math.min(95, 50 + (pct - 65) * 1.3);
    if (pct < 35) shift = -Math.max(5, 50 - (35 - pct) * 1.3);
    container.innerHTML =
      '<div class="pt-marker" style="left:' + pct.toFixed(2) + '%"><span class="pt-marker-label" style="transform:translateX(' + shift.toFixed(1) + '%)">' +
      escapeHtml(t('Aujourd’hui · jour {n}', { n: res.dayInCycle })) + '</span><span class="pt-marker-arrow" aria-hidden="true"></span></div>' +
      '<div class="pt-bar" role="img" aria-label="' +
      escapeHtml(t('Frise du cycle : {p}', { p: segs.map((s) => t(PHASE_META[s.key].name) + ' ' + s.start + '–' + s.end).join(', ') })) +
      '">' + bar + '</div>' +
      '<div class="pt-scale" aria-hidden="true"><span>' + escapeHtml(t('Jour 1')) + '</span><span>' +
      escapeHtml(t('Jour {n}', { n: C })) + '</span></div>';
  }

  function renderPhaseList(container, res, startDate) {
    if (!container || !res) return;
    const segs = phaseSegments(res.periodLen, res.cycleLen);
    container.innerHTML = '';
    segs.forEach((s) => {
      const li = document.createElement('li');
      li.className = 'pl-item' + (s.key === res.phase.key ? ' is-current' : '');
      const a = addDays(startDate, s.start - 1);
      const b = addDays(startDate, s.end - 1);
      const days = s.start === s.end
        ? t('jour {a}', { a: s.start })
        : t('jours {a} à {b}', { a: s.start, b: s.end });
      li.innerHTML =
        '<span class="pl-sw ph-' + s.key + '" aria-hidden="true"></span>' +
        '<span class="pl-txt"><strong>' + escapeHtml(t(PHASE_META[s.key].name)) + '</strong>' +
        '<span class="pl-sub">' + escapeHtml(days) + ' · ' +
        escapeHtml(fmtDate(a, { year: false }) + ' → ' + fmtDate(b, { year: false })) + '</span></span>' +
        (s.key === res.phase.key ? '<span class="pl-here">' + escapeHtml(t('tu es ici')) + '</span>' : '');
      container.appendChild(li);
    });
  }

  /* —— Ciel : Soleil et Lune calculés sur le téléphone (précision ~1°) —— */
  const SIGNS = [
    { fr: 'Bélier', glyph: '♈\uFE0E', el: 'Feu' },
    { fr: 'Taureau', glyph: '♉\uFE0E', el: 'Terre' },
    { fr: 'Gémeaux', glyph: '♊\uFE0E', el: 'Air' },
    { fr: 'Cancer', glyph: '♋\uFE0E', el: 'Eau' },
    { fr: 'Lion', glyph: '♌\uFE0E', el: 'Feu' },
    { fr: 'Vierge', glyph: '♍\uFE0E', el: 'Terre' },
    { fr: 'Balance', glyph: '♎\uFE0E', el: 'Air' },
    { fr: 'Scorpion', glyph: '♏\uFE0E', el: 'Eau' },
    { fr: 'Sagittaire', glyph: '♐\uFE0E', el: 'Feu' },
    { fr: 'Capricorne', glyph: '♑\uFE0E', el: 'Terre' },
    { fr: 'Verseau', glyph: '♒\uFE0E', el: 'Air' },
    { fr: 'Poissons', glyph: '♓\uFE0E', el: 'Eau' },
  ];
  const MOON_NAMES = [
    'Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante',
    'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant',
  ];

  function skyAt(utcMs) {
    const rad = Math.PI / 180;
    const n360 = (x) => ((x % 360) + 360) % 360;
    const d = utcMs / 86400000 + 2440587.5 - 2451545.0;
    const L = 218.316 + 13.176396 * d;
    const M = 134.963 + 13.064993 * d;
    const F = 93.272 + 13.22935 * d;
    const Ms = 357.529 + 0.98560028 * d;
    const D = 297.85 + 12.190749 * d;
    const moon = n360(
      L + 6.289 * Math.sin(M * rad) + 1.274 * Math.sin((2 * D - M) * rad) + 0.658 * Math.sin(2 * D * rad) +
      0.214 * Math.sin(2 * M * rad) - 0.186 * Math.sin(Ms * rad) - 0.114 * Math.sin(2 * F * rad)
    );
    const q = 280.459 + 0.98564736 * d;
    const sun = n360(q + 1.915 * Math.sin(Ms * rad) + 0.02 * Math.sin(2 * Ms * rad));
    const elong = n360(moon - sun);
    return {
      sunLon: sun,
      moonLon: moon,
      elong: elong,
      illum: (1 - Math.cos(elong * rad)) / 2,
      sunSign: Math.floor(sun / 30),
      moonSign: Math.floor(moon / 30),
      phaseIdx: Math.floor(n360(elong + 22.5) / 45),
    };
  }

  /** Midi UTC du jour (Abidjan = UTC+0). */
  function noonUtc(d) {
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  }

  /** Phase lunaire principale qui tombe ce jour-là : new | fq | full | lq | null. */
  function majorMoonOn(d) {
    const t0 = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    const a = skyAt(t0).elong;
    const b = skyAt(t0 + 86400000).elong;
    const keys = { 0: 'new', 90: 'fq', 180: 'full', 270: 'lq' };
    for (const tgt of [0, 90, 180, 270]) {
      const da = (((a - tgt) % 360) + 360) % 360;
      const db = (((b - tgt) % 360) + 360) % 360;
      if (db < da && da > 180) return keys[tgt];
    }
    return null;
  }
  const MAJOR_MOON_FR = { new: 'Nouvelle lune', fq: 'Premier quartier', full: 'Pleine lune', lq: 'Dernier quartier' };

  function moonGroup(elong) {
    if (elong < 22.5 || elong >= 337.5) return 'new';
    if (elong < 157.5) return 'waxing';
    if (elong < 202.5) return 'full';
    return 'waning';
  }

  /* —— Conseils par phase (bien-être, inspiré de Clue / Stardust) —— */
  const PHASE_GUIDE = {
    menstruelle: {
      energy: 'Énergie plus basse : c’est normal de vouloir ralentir.',
      mood: 'Besoin de calme et d’intériorité. Sois douce avec toi.',
      care: 'Chaleur sur le ventre, sieste, bain tiède, coucher plus tôt.',
      food: 'Repas chauds et simples, bien boire, aliments riches en fer (légumes verts, haricots).',
      move: 'Marche lente, étirements, respiration. Rien d’obligatoire.',
    },
    folliculaire: {
      energy: 'L’énergie remonte jour après jour.',
      mood: 'Curiosité et envie de nouveau : bon moment pour lancer des projets.',
      care: 'Organise ta semaine, essaie une nouvelle routine.',
      food: 'Assiettes fraîches et colorées : fruits, légumes, céréales complètes.',
      move: 'Danse, cardio léger, activités qui donnent de l’élan.',
    },
    ovulatoire: {
      energy: 'Souvent le pic d’énergie du cycle (estimation).',
      mood: 'Plus d’aisance pour parler, partager, rencontrer.',
      care: 'Moments à deux ou entre amies, prises de parole.',
      food: 'Fibres, légumes crus, beaucoup d’eau.',
      move: 'Séances plus soutenues si ton corps en a envie.',
    },
    luteale: {
      energy: 'L’énergie baisse peu à peu, surtout en fin de phase.',
      mood: 'Sensibilité plus forte : écoute-la sans te juger.',
      care: 'Finir plutôt que commencer, ranger, poser des limites douces.',
      food: 'Repas réguliers, céréales complètes, moins de sel si tu te sens gonflée.',
      move: 'Yoga, marche, renforcement doux.',
    },
  };
  const GUIDE_FIELDS = [
    ['energy', 'Énergie'],
    ['mood', 'Humeur'],
    ['care', 'Soin de soi'],
    ['food', 'Alimentation'],
    ['move', 'Mouvement'],
  ];
  let guidePhase = null;

  function renderPhaseGuide() {
    const tabs = document.getElementById('phaseTabs');
    const box = document.getElementById('phaseGuide');
    if (!tabs || !box) return;
    const inp = activeCalcInputs();
    const res = computeCalc(inp.lastStart, inp.periodLen, inp.cycleLen);
    const current = res ? res.phase.key : 'luteale';
    if (!guidePhase) guidePhase = current;
    tabs.innerHTML = '';
    PHASE_ORDER.forEach((key) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'phase-tab ph-' + key + (key === guidePhase ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', key === guidePhase ? 'true' : 'false');
      b.setAttribute('aria-controls', 'phaseGuide');
      b.dataset.phase = key;
      b.textContent = t(PHASE_META[key].name).replace(/\s*[（(].*[)）]$/, '');
      tabs.appendChild(b);
    });
    const g = PHASE_GUIDE[guidePhase];
    const seg = res ? phaseSegments(res.periodLen, res.cycleLen).find((s) => s.key === guidePhase) : null;
    const days = seg
      ? (seg.start === seg.end ? t('jour {a}', { a: seg.start }) : t('jours {a} à {b}', { a: seg.start, b: seg.end }))
      : '';
    box.innerHTML =
      '<p class="pg-head ph-' + guidePhase + '">' + escapeHtml(t(PHASE_META[guidePhase].full)) +
      (days ? ' · ' + escapeHtml(days) : '') +
      (guidePhase === current ? ' · ' + escapeHtml(t('maintenant')) : '') + '</p>' +
      '<dl class="pg-list">' +
      GUIDE_FIELDS.map((f) => '<div class="pg-row"><dt>' + escapeHtml(t(f[1])) + '</dt><dd>' + escapeHtml(t(g[f[0]])) + '</dd></div>').join('') +
      '</dl>' +
      (guidePhase === 'ovulatoire'
        ? '<p class="tiny pg-note">' + escapeHtml(t('L’ovulation est une estimation. Ce n’est ni une contraception, ni un conseil de fertilité.')) + '</p>'
        : '');
  }

  /* —— Historique des règles + moyennes (Flo, Clue, Natural Cycles) —— */
  const PERIODS_KEY = 'ca_periods_v1';
  const DEMO_PERIODS = [
    { start: '2026-07-07', len: 5 },
    { start: '2026-08-04', len: 5 },
    { start: '2026-09-01', len: 5 },
  ];

  function loadPeriods() {
    try {
      const raw = localStorage.getItem(PERIODS_KEY);
      const list = raw ? JSON.parse(raw) : null;
      if (Array.isArray(list)) return list.filter((p) => p && parseYMD(p.start));
    } catch (_) { /* ignore */ }
    return null;
  }
  let sessionPeriods = null; // si consentement refusé : session uniquement

  function currentPeriods() {
    const stored = loadPeriods();
    if (stored && stored.length) return { list: stored, example: false };
    if (sessionPeriods && sessionPeriods.length) return { list: sessionPeriods, example: false };
    return { list: DEMO_PERIODS.slice(), example: true };
  }

  function periodStats(list) {
    const sorted = list.slice().sort((a, b) => (a.start < b.start ? -1 : 1));
    const cycles = [];
    for (let i = 1; i < sorted.length; i++) {
      cycles.push(daysBetween(parseYMD(sorted[i - 1].start), parseYMD(sorted[i].start)));
    }
    const lens = sorted.map((p) => Number(p.len) || 0).filter((n) => n > 0);
    const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
    return {
      sorted: sorted,
      cycles: cycles,
      avgCycle: avg(cycles),
      avgPeriod: avg(lens),
      minCycle: cycles.length ? Math.min.apply(null, cycles) : null,
      maxCycle: cycles.length ? Math.max.apply(null, cycles) : null,
    };
  }

  function fmtNum(x) {
    if (x == null) return '—';
    const r = Math.round(x * 10) / 10;
    const s = String(r);
    return currentLang === 'fr' || currentLang === 'es' || currentLang === 'pt' ? s.replace('.', ',') : s;
  }

  function renderHistory() {
    const list = document.getElementById('histList');
    const stats = document.getElementById('histStats');
    const note = document.getElementById('histExampleNote');
    if (!list || !stats) return;
    const cur = currentPeriods();
    const st = periodStats(cur.list);
    stats.innerHTML =
      '<div class="hs-tile"><span class="hs-k">' + escapeHtml(t('Cycle moyen')) + '</span><strong>' +
      escapeHtml(st.avgCycle == null ? '—' : t('{n} j', { n: fmtNum(st.avgCycle) })) + '</strong></div>' +
      '<div class="hs-tile"><span class="hs-k">' + escapeHtml(t('Règles moyennes')) + '</span><strong>' +
      escapeHtml(st.avgPeriod == null ? '—' : t('{n} j', { n: fmtNum(st.avgPeriod) })) + '</strong></div>' +
      '<div class="hs-tile"><span class="hs-k">' + escapeHtml(t('Cycles min–max')) + '</span><strong>' +
      escapeHtml(st.minCycle == null ? '—' : (st.minCycle === st.maxCycle ? t('{n} j', { n: st.minCycle }) : st.minCycle + '–' + t('{n} j', { n: st.maxCycle }))) + '</strong></div>';
    list.innerHTML = '';
    st.sorted.slice().reverse().forEach((p, idxRev) => {
      const i = st.sorted.length - 1 - idxRev;
      const li = document.createElement('li');
      li.className = 'hist-item';
      const d = parseYMD(p.start);
      const cyc = i < st.cycles.length ? st.cycles[i] : null;
      const parts = [t('{n} j de règles', { n: p.len })];
      if (cyc != null) parts.push(t('cycle de {n} j', { n: cyc }));
      li.innerHTML =
        '<span class="pl-sw ph-menstruelle" aria-hidden="true"></span>' +
        '<span class="pl-txt"><strong>' + escapeHtml(fmtDate(d)) + '</strong><span class="pl-sub">' +
        escapeHtml(parts.join(' · ')) + '</span></span>' +
        (cur.example ? '' : '<button type="button" class="hist-del" data-del="' + escapeHtml(p.start) + '" aria-label="' +
          escapeHtml(t('Supprimer cette période')) + '">×</button>');
      list.appendChild(li);
    });
    if (note) note.hidden = !cur.example;
  }

  function savePeriods(list, persist) {
    const clean = list
      .filter((p) => parseYMD(p.start))
      .sort((a, b) => (a.start < b.start ? -1 : 1))
      .slice(-24);
    if (persist) {
      try { localStorage.setItem(PERIODS_KEY, JSON.stringify(clean)); } catch (_) { /* ignore */ }
    } else {
      sessionPeriods = clean;
    }
  }

  function bindHistory() {
    const form = document.getElementById('histForm');
    const startEl = document.getElementById('histStart');
    const lenEl = document.getElementById('histLen');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const start = startEl && startEl.value;
        const d = parseYMD(start);
        if (!d) { toast('Date invalide'); return; }
        if (d > productToday()) { toast('Choisis une date passée'); return; }
        const len = Math.min(10, Math.max(1, Math.round(Number(lenEl && lenEl.value) || 5)));
        const cur = currentPeriods();
        const base = cur.example ? [] : cur.list.filter((p) => p.start !== start);
        base.push({ start: start, len: len });
        requireCycleConsent((ok) => {
          savePeriods(base, ok);
          renderHistory();
          toast(ok ? 'Période ajoutée ✦' : 'Période notée pour cette session · non enregistrée');
        });
      });
    }
    const list = document.getElementById('histList');
    if (list) {
      list.addEventListener('click', (e) => {
        const b = e.target.closest('[data-del]');
        if (!b) return;
        const start = b.dataset.del;
        const stored = loadPeriods();
        if (stored) savePeriods(stored.filter((p) => p.start !== start), true);
        if (sessionPeriods) sessionPeriods = sessionPeriods.filter((p) => p.start !== start);
        renderHistory();
        toast('Période supprimée');
      });
    }
    const use = document.getElementById('btnUseAverages');
    if (use) {
      use.addEventListener('click', () => {
        const cur = currentPeriods();
        const st = periodStats(cur.list);
        const last = st.sorted[st.sorted.length - 1];
        const cEl = document.getElementById('calcCycleLen');
        const pEl = document.getElementById('calcPeriodLen');
        const lEl = document.getElementById('calcLastStart');
        if (cEl && st.avgCycle != null) cEl.value = String(clampCycle(st.avgCycle));
        if (pEl && st.avgPeriod != null) pEl.value = String(clampPeriod(st.avgPeriod));
        if (lEl && last) lEl.value = last.start;
        syncCalcWords();
        go('calculator');
        toast('Moyennes reprises · appuie sur « Voir ma date »');
      });
    }
  }

  /* —— Tendances par phase (Clue Analyse, Flo, Natural Cycles) —— */
  const TREND_EXAMPLE = {
    menstruelle: { n: 4, energy: 2.3, sym: ['Crampes légères', 'Fatigue'], mood: 'calme' },
    folliculaire: { n: 6, energy: 3.8, sym: ['Motivation'], mood: 'motivee' },
    ovulatoire: { n: 2, energy: 4.5, sym: ['Motivation'], mood: 'energique' },
    luteale: { n: 9, energy: 2.9, sym: ['Ballonnements', 'Sensibilité émotionnelle'], mood: 'sensible' },
  };

  function computeTrends() {
    const entries = loadJournal();
    if (!entries.length) return { data: TREND_EXAMPLE, example: true };
    const acc = {};
    PHASE_ORDER.forEach((k) => { acc[k] = { n: 0, eSum: 0, eN: 0, sym: {}, mood: {} }; });
    entries.forEach((e) => {
      const d = parseYMD(e.date);
      if (!d) return;
      const k = phaseOfDate(d);
      if (!acc[k]) return;
      const a = acc[k];
      a.n++;
      if (e.energy) { a.eSum += Number(e.energy); a.eN++; }
      (e.symptoms || []).forEach((s) => { a.sym[s] = (a.sym[s] || 0) + 1; });
      if (e.mood) a.mood[e.mood] = (a.mood[e.mood] || 0) + 1;
    });
    const top = (obj, n) => Object.keys(obj).sort((x, y) => obj[y] - obj[x]).slice(0, n);
    const data = {};
    PHASE_ORDER.forEach((k) => {
      const a = acc[k];
      data[k] = { n: a.n, energy: a.eN ? a.eSum / a.eN : null, sym: top(a.sym, 2), mood: top(a.mood, 1)[0] || null };
    });
    return { data: data, example: false };
  }

  function renderTrends() {
    const box = document.getElementById('trendsGrid');
    const note = document.getElementById('trendsExample');
    if (!box) return;
    const tr = computeTrends();
    box.innerHTML = '';
    PHASE_ORDER.forEach((k) => {
      const d = tr.data[k];
      const row = document.createElement('div');
      row.className = 'tr-row';
      const ePct = d.energy == null ? 0 : Math.round((d.energy / 5) * 100);
      const details = [];
      if (d.mood && MOOD_FR[d.mood]) details.push(t('Humeur : {m}', { m: t(MOOD_FR[d.mood]) }));
      if (d.sym && d.sym.length) details.push(t('Sensations : {s}', { s: d.sym.map((x) => t(x)).join(', ') }));
      row.innerHTML =
        '<p class="tr-head ph-' + k + '"><span>' + escapeHtml(t(PHASE_META[k].name)) + '</span><span class="tr-n">' +
        escapeHtml(d.n > 1 ? t('{n} check-ins', { n: d.n }) : t('{n} check-in', { n: d.n })) + '</span></p>' +
        '<div class="tr-energy"><span class="tr-k">' + escapeHtml(t('Énergie')) + '</span>' +
        '<span class="tr-track" aria-hidden="true"><span class="tr-fill ph-' + k + '" style="width:' + ePct + '%"></span></span>' +
        '<span class="tr-v">' + escapeHtml(d.energy == null ? '—' : fmtNum(d.energy) + ' / 5') + '</span></div>' +
        '<p class="tr-detail">' + (details.length ? details.map(escapeHtml).join('<br>') : escapeHtml(t('Pas encore de check-in dans cette phase'))) + '</p>';
      box.appendChild(row);
    });
    if (note) note.hidden = !tr.example;
  }

  /* —— Rappels agenda .ics (Clue, Flo) — sans serveur ni notification push —— */
  function icsEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }
  function icsFold(line) {
    const out = [];
    let cur = line;
    while (cur.length > 60) {
      out.push(cur.slice(0, 60));
      cur = ' ' + cur.slice(60);
    }
    out.push(cur);
    return out.join('\r\n');
  }
  function icsDate(d) {
    return toYMD(d).replace(/-/g, '');
  }

  function buildIcs(includePhases) {
    const inp = activeCalcInputs();
    const res = computeCalc(inp.lastStart, inp.periodLen, inp.cycleLen);
    if (!res) return null;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const segs = phaseSegments(res.periodLen, res.cycleLen);
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//King Daveblessing//Cycle & Astro ' + APP_VERSION + '//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:' + icsEscape('Cycle & Astro'),
    ];
    const disc = t('Estimation bien-être. Pas un avis médical.');
    const ev = (uid, start, endExcl, summary, desc, alarm) => {
      lines.push('BEGIN:VEVENT');
      lines.push('UID:' + uid + '@cycle-astro.king-daveblessing');
      lines.push('DTSTAMP:' + stamp);
      lines.push('DTSTART;VALUE=DATE:' + icsDate(start));
      lines.push('DTEND;VALUE=DATE:' + icsDate(endExcl));
      lines.push('SUMMARY:' + icsEscape(summary));
      lines.push('DESCRIPTION:' + icsEscape(desc));
      lines.push('TRANSP:TRANSPARENT');
      if (alarm) {
        lines.push('BEGIN:VALARM');
        lines.push('ACTION:DISPLAY');
        lines.push('TRIGGER:-PT15H');
        lines.push('DESCRIPTION:' + icsEscape(alarm));
        lines.push('END:VALARM');
      }
      lines.push('END:VEVENT');
    };
    res.periods.forEach((per, i) => {
      const cycleStart = per.start;
      segs.forEach((s) => {
        const a = addDays(cycleStart, s.start - 1);
        const bEx = addDays(cycleStart, s.end);
        const id = 'ca-' + s.key + '-' + icsDate(a);
        if (s.key === 'menstruelle') {
          ev(id, a, bEx, t('Règles prévues · Cycle & Astro'), disc, t('Règles prévues demain'));
        } else if (includePhases) {
          const desc = s.key === 'ovulatoire'
            ? disc + ' ' + t('L’ovulation est une estimation. Ce n’est ni une contraception, ni un conseil de fertilité.')
            : disc;
          ev(id, a, bEx, t(PHASE_META[s.key].full) + ' · Cycle & Astro', desc, null);
        }
      });
      if (i === res.periods.length - 1) return;
    });
    lines.push('END:VCALENDAR');
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }

  function downloadIcs() {
    const inc = document.getElementById('icsPhases');
    const ics = buildIcs(!inc || inc.checked);
    if (!ics) { toast('Date invalide'); return; }
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cycle-astro-rappels.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
    toast('Fichier agenda prêt · ouvre-le pour ajouter les rappels');
  }

  /* —— Question de journal selon la phase et la Lune (CHANI) —— */
  const PROMPTS_PHASE = {
    menstruelle: [
      'De quoi ai-je besoin pour me reposer vraiment aujourd’hui ?',
      'Qu’est-ce que je peux laisser partir ce mois-ci ?',
      'Quel petit geste doux puis-je m’offrir ce soir ?',
    ],
    folliculaire: [
      'Quelle idée nouvelle me donne envie d’avancer ?',
      'Quel premier pas simple puis-je faire cette semaine ?',
      'Qu’est-ce qui me rend curieuse en ce moment ?',
    ],
    ovulatoire: [
      'Avec qui ai-je envie de partager quelque chose ?',
      'Qu’est-ce que j’ose dire ou demander aujourd’hui ?',
      'Où est-ce que je me sens rayonnante ?',
    ],
    luteale: [
      'Qu’est-ce qui me demande plus de douceur en ce moment ?',
      'Quelle tâche puis-je terminer pour me sentir plus légère ?',
      'À quoi ai-je besoin de dire non, gentiment ?',
    ],
  };
  const PROMPTS_MOON = {
    new: 'Nouvelle lune : quelle intention simple je pose pour ce cycle ?',
    waxing: 'Lune croissante : qu’est-ce que je veux nourrir et faire grandir ?',
    full: 'Pleine lune : qu’est-ce qui s’éclaire pour moi en ce moment ?',
    waning: 'Lune décroissante : de quoi puis-je me délester ?',
  };
  let promptIdx = 0;

  function checkinDate() {
    const el = document.getElementById('checkinDate');
    const d = el && parseYMD(el.value);
    if (d && d <= productToday()) return d;
    return productToday();
  }

  function promptList(d) {
    const phase = phaseOfDate(d) || 'luteale';
    const sky = skyAt(noonUtc(d));
    return { list: [PROMPTS_MOON[moonGroup(sky.elong)]].concat(PROMPTS_PHASE[phase]), phase: phase, sky: sky };
  }

  function renderPrompt() {
    const txt = document.getElementById('promptText');
    const meta = document.getElementById('promptMeta');
    const chip = document.getElementById('checkinPhase');
    const d = checkinDate();
    const p = promptList(d);
    if (txt) txt.textContent = t(p.list[promptIdx % p.list.length]);
    if (meta) meta.textContent = t(PHASE_META[p.phase].full) + ' · ' + t(MOON_NAMES[p.sky.phaseIdx]);
    if (chip) {
      chip.className = 'phase-chip ph-' + p.phase;
      chip.textContent = t(PHASE_META[p.phase].full);
    }
  }

  function bindJournalV12() {
    const el = document.getElementById('checkinDate');
    if (el) {
      el.max = DEMO.today;
      if (!el.value) el.value = DEMO.today;
      el.addEventListener('change', () => { promptIdx = 0; renderPrompt(); });
    }
    const next = document.getElementById('btnPromptNext');
    if (next) next.addEventListener('click', () => { promptIdx++; renderPrompt(); });
    const use = document.getElementById('btnPromptUse');
    if (use) {
      use.addEventListener('click', () => {
        const note = document.getElementById('noteField');
        const txt = document.getElementById('promptText');
        if (!note || !txt) return;
        const q = txt.textContent.trim();
        note.value = (note.value ? note.value.replace(/\s+$/, '') + '\n\n' : '') + q + '\n';
        note.focus();
        toast('Question ajoutée à ta note');
      });
    }
  }

  /* —— Astro : horoscope du jour, ciel du jour, compatibilité —— */
  const HORO_TEXT = {
    'Bélier': 'Le Soleil passe face à ton signe : les relations demandent écoute et compromis. Avance, mais à deux.',
    'Taureau': 'Journée pour remettre de l’ordre dans ton quotidien. Un rythme plus doux te rend plus efficace.',
    'Gémeaux': 'La Lune en Verseau réveille ton envie d’apprendre. Note les idées qui arrivent, trie demain.',
    'Cancer': 'Ton foyer a besoin d’harmonie. Un petit rangement ou une conversation apaisée fera du bien.',
    'Lion': 'Tes mots portent aujourd’hui. Un message sincère peut rapprocher quelqu’un de toi.',
    'Vierge': 'Ta saison se termine : fais le bilan de ce que tu as construit et reconnais tes efforts.',
    'Balance': 'Le Soleil entre dans ton signe : nouveau départ personnel. Choisis une chose qui te ressemble.',
    'Scorpion': 'Moment de recul. Le repos et le silence t’aident à voir plus clair.',
    'Sagittaire': 'Tes amitiés et tes projets de groupe sont favorisés. Propose, rassemble, partage.',
    'Capricorne': 'Ton travail est sous les projecteurs. Montre ce que tu sais faire, sans te surcharger.',
    'Verseau': 'La Lune est dans ton signe : tes émotions parlent fort. Une envie d’ailleurs peut naître.',
    'Poissons': 'Journée pour lâcher un poids ancien. Ce qui part laisse de la place au neuf.',
  };
  const PLANET_DAY = [
    ['Soleil', 'Jour du Soleil : rayonner, se montrer, se faire plaisir.'],
    ['Lune', 'Jour de la Lune : écouter ses émotions, prendre soin du foyer.'],
    ['Mars', 'Jour de Mars : agir, oser, bouger le corps.'],
    ['Mercure', 'Jour de Mercure : échanger, écrire, apprendre.'],
    ['Jupiter', 'Jour de Jupiter : voir grand, partager, remercier.'],
    ['Vénus', 'Jour de Vénus : beauté, douceur, relations.'],
    ['Saturne', 'Jour de Saturne : structurer, finir, se reposer.'],
  ];
  const COMPAT = [
    { title: 'Miroir', score: 4, text: 'Même signe : vous vous comprenez vite. Le défi : ne pas amplifier les mêmes travers.' },
    { title: 'Apprentissage', score: 3, text: 'Signes voisins : vous êtes très différents, chacun apprend de l’autre avec patience.' },
    { title: 'Complicité', score: 4, text: 'Lien fluide et amical : vous vous stimulez sans effort.' },
    { title: 'Friction créative', score: 2, text: 'Tensions possibles : en parlant franchement, elles deviennent un moteur.' },
    { title: 'Harmonie naturelle', score: 5, text: 'Même élément : vous partagez le même rythme et les mêmes valeurs.' },
    { title: 'Ajustement', score: 2, text: 'Peu de points communs au départ : le lien demande des ajustements réguliers.' },
    { title: 'Attraction des contraires', score: 3, text: 'Signes opposés : forte attirance, à équilibrer par l’écoute.' },
  ];

  function signIndexFromFr(fr) {
    const i = SIGNS.findIndex((s) => s.fr === fr);
    return i < 0 ? 5 : i;
  }

  function defaultSunSignIdx() {
    try {
      const p = loadLastProfile();
      if (p) {
        let sign = p.sign || null;
        if (!sign && p.birthIso) {
          const sd = sunSignDecan(p.birthIso);
          sign = sd && sd.sign;
        }
        const i = SIGNS.findIndex((s) => s.fr === sign);
        if (i >= 0) return i;
      }
    } catch (_) { /* ignore */ }
    return signIndexFromFr(DEMO.sunSign);
  }

  function fillSignSelect(sel, selectedIdx) {
    if (!sel) return;
    const keep = sel.value !== '' && sel.options.length ? Number(sel.value) : selectedIdx;
    sel.innerHTML = '';
    SIGNS.forEach((s, i) => {
      const o = document.createElement('option');
      o.value = String(i);
      o.textContent = s.glyph + ' ' + t(s.fr);
      sel.appendChild(o);
    });
    sel.value = String(keep);
  }

  function renderHoroscope() {
    const sel = document.getElementById('horoSign');
    if (!sel) return;
    fillSignSelect(sel, defaultSunSignIdx());
    const s = SIGNS[Number(sel.value)] || SIGNS[5];
    const title = document.getElementById('horoTitle');
    const text = document.getElementById('horoText');
    const sky = document.getElementById('horoSky');
    if (title) title.textContent = s.glyph + ' ' + t(s.fr) + ' · ' + t(s.el);
    if (text) text.textContent = t(HORO_TEXT[s.fr]);
    if (sky) {
      const k = skyAt(noonUtc(productToday()));
      sky.textContent = t('Ciel du {d} : Soleil en {s}, Lune en {m} ({p}).', {
        d: fmtDate(productToday(), { year: false }),
        s: t(SIGNS[k.sunSign].fr),
        m: t(SIGNS[k.moonSign].fr),
        p: t(MOON_NAMES[k.phaseIdx]).toLowerCase(),
      });
    }
  }

  function renderSky() {
    const el = document.getElementById('skyDate');
    const list = document.getElementById('skyList');
    const txt = document.getElementById('skyText');
    const words = document.getElementById('skyDateWords');
    if (!el || !list) return;
    if (!el.value) el.value = DEMO.today;
    const d = parseYMD(el.value) || productToday();
    const k = skyAt(noonUtc(d));
    const pd = PLANET_DAY[d.getDay()];
    if (words) words.textContent = fmtDate(d, { weekday: true });
    const row = (a, b) => '<span class="k">' + escapeHtml(a) + '</span><span class="v">' + escapeHtml(b) + '</span>';
    list.innerHTML =
      row(t('Planète du jour'), t(pd[0])) +
      row(t('Soleil'), t('en {s}', { s: t(SIGNS[k.sunSign].fr) })) +
      row(t('Lune'), t('en {s}', { s: t(SIGNS[k.moonSign].fr) })) +
      row(t('Phase'), t(MOON_NAMES[k.phaseIdx]) + ' · ' + Math.round(k.illum * 100) + ' %');
    if (txt) txt.textContent = t(pd[1]);
  }

  function renderCompat(show) {
    const a = document.getElementById('compatA');
    const b = document.getElementById('compatB');
    const out = document.getElementById('compatOut');
    if (!a || !b || !out) return;
    fillSignSelect(a, defaultSunSignIdx());
    fillSignSelect(b, 6);
    if (!show && out.hidden) return;
    const ia = Number(a.value);
    const ib = Number(b.value);
    let k = Math.abs(ia - ib);
    if (k > 6) k = 12 - k;
    const c = COMPAT[k];
    const stars = '★★★★★'.slice(0, c.score) + '☆☆☆☆☆'.slice(0, 5 - c.score);
    out.hidden = false;
    out.innerHTML =
      '<p class="compat-stars" role="img" aria-label="' + escapeHtml(t('{n} sur 5', { n: c.score })) + '">' + stars + '</p>' +
      '<p class="h-serif compat-title">' + escapeHtml(t(c.title)) + '</p>' +
      '<p class="tiny compat-pair">' + escapeHtml(SIGNS[ia].glyph + ' ' + t(SIGNS[ia].fr) + ' (' + t(SIGNS[ia].el) + ') · ' +
        SIGNS[ib].glyph + ' ' + t(SIGNS[ib].fr) + ' (' + t(SIGNS[ib].el) + ')') + '</p>' +
      '<p class="body">' + escapeHtml(t(c.text)) + '</p>';
  }

  function bindAstroV12() {
    const sel = document.getElementById('horoSign');
    if (sel) sel.addEventListener('change', renderHoroscope);
    const sd = document.getElementById('skyDate');
    if (sd) sd.addEventListener('change', renderSky);
    const reset = document.getElementById('btnSkyToday');
    if (reset && sd) reset.addEventListener('click', () => { sd.value = DEMO.today; renderSky(); });
    const btn = document.getElementById('btnCompat');
    if (btn) btn.addEventListener('click', () => renderCompat(true));
    ['compatA', 'compatB'].forEach((id) => {
      const s = document.getElementById(id);
      if (s) s.addEventListener('change', () => {
        const out = document.getElementById('compatOut');
        if (out && !out.hidden) renderCompat(true);
      });
    });
  }

  /* —— Écran Cycle : frise, liste, sauts de section —— */
  function renderCycleV12() {
    const inp = { lastStart: DEMO.cycle.lastPeriodStart, periodLen: DEMO.cycle.avgPeriod, cycleLen: DEMO.cycle.avgCycle };
    const res = computeCalc(inp.lastStart, inp.periodLen, inp.cycleLen);
    renderPhaseTimeline(document.getElementById('cycleTimeline'), res);
    renderPhaseList(document.getElementById('cyclePhaseList'), res, parseYMD(inp.lastStart));
    renderPhaseGuide();
    renderHistory();
    renderTrends();
  }

  function bindCycleV12() {
    document.querySelectorAll('[data-jump]').forEach((b) => {
      b.addEventListener('click', () => {
        const target = document.getElementById(b.dataset.jump);
        if (target) target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      });
    });
    const tabs = document.getElementById('phaseTabs');
    if (tabs) {
      tabs.addEventListener('click', (e) => {
        const b = e.target.closest('[data-phase]');
        if (!b) return;
        guidePhase = b.dataset.phase;
        renderPhaseGuide();
        const again = tabs.querySelector('[data-phase="' + guidePhase + '"]');
        if (again) again.focus();
      });
      tabs.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = PHASE_ORDER.indexOf(guidePhase);
        guidePhase = PHASE_ORDER[(i + (e.key === 'ArrowRight' ? 1 : 3)) % 4];
        renderPhaseGuide();
        const again = tabs.querySelector('[data-phase="' + guidePhase + '"]');
        if (again) again.focus();
        e.preventDefault();
      });
    }
    const ics = document.getElementById('btnIcs');
    if (ics) ics.addEventListener('click', downloadIcs);
    bindHistory();
  }

  function renderAllV12() {
    renderCycleV12();
    renderPrompt();
    renderHoroscope();
    renderSky();
    renderCompat(false);
    renderAllV13();
  }

  /* ================================================================
   * v1.3.0 — Rituel du jour, tarot, méditations à lire, souffle guidé,
   * thème natal complet (astronomy-engine, MIT). Tout reste sur le
   * téléphone : aucun serveur, aucun paiement. Lecture symbolique,
   * bien-être seulement, pas un avis médical, aucune prédiction.
   * ================================================================ */
  const TAROT_KEY = 'ca_tarot_v1';
  const NATAL_KEY = 'ca_natal_v1';
  /* Données astro effacées par « Supprimer mes données astro ». */
  const ASTRO_DATA_KEYS = [TAROT_KEY, NATAL_KEY];

  const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

  /* 22 arcanes majeurs (ordre de Marseille). Textes originaux, ton bien-être :
   * une piste pour réfléchir, jamais une sentence ni une prédiction. */
  const TAROT = [
    { name: 'Le Mat', keys: 'Élan · liberté · confiance', text: 'Le Mat avance sans tout savoir, et c’est sa force. Aujourd’hui, une petite part d’inconnu peut devenir une aventure plutôt qu’une inquiétude.', q: 'Quel petit pas puis-je faire sans attendre le moment parfait ?' },
    { name: 'Le Bateleur', keys: 'Commencement · habileté · initiative', text: 'Tout est déjà sur la table : tes idées, tes mains, ton envie. La carte invite à commencer avec ce que tu as, sans attendre la perfection.', q: 'Quelle ressource ai-je déjà sous la main ?' },
    { name: 'La Papesse', keys: 'Intuition · silence · savoir intérieur', text: 'La Papesse lit lentement. Elle rappelle que certaines réponses arrivent dans le calme, quand on cesse de chercher au-dehors.', q: 'Que me dit ma petite voix quand je fais silence ?' },
    { name: 'L’Impératrice', keys: 'Créativité · douceur · abondance', text: 'Énergie de création et de soin. Bon moment pour embellir un coin de ta vie, exprimer une idée ou te traiter avec tendresse.', q: 'Qu’ai-je envie de faire fleurir ?' },
    { name: 'L’Empereur', keys: 'Structure · stabilité · cadre', text: 'L’Empereur pose des fondations. Il invite à mettre un peu d’ordre et à tenir une décision avec calme et fermeté.', q: 'Quel cadre simple me rendrait plus serein·e ?' },
    { name: 'Le Pape', keys: 'Transmission · sens · valeurs', text: 'Carte des conseils et des valeurs. Écoute les personnes qui t’inspirent, et souviens-toi de ce qui compte vraiment pour toi.', q: 'Quelle valeur ai-je envie d’honorer aujourd’hui ?' },
    { name: 'L’Amoureux', keys: 'Choix · lien · cœur', text: 'Un choix se présente, petit ou grand. La carte invite à écouter ton cœur autant que ta raison, et à choisir ce qui te ressemble.', q: 'Si je m’écoutais vraiment, que choisirais-je ?' },
    { name: 'Le Chariot', keys: 'Avancée · volonté · direction', text: 'Le Chariot avance quand ses deux chevaux tirent dans le même sens. Accorde ton envie et ton action, puis avance à ton allure.', q: 'Où ai-je envie d’aller, concrètement ?' },
    { name: 'La Justice', keys: 'Équilibre · clarté · justesse', text: 'La Justice pèse avec honnêteté. Moment pour rééquilibrer donner et recevoir, et dire les choses simplement.', q: 'Où ai-je besoin de plus d’équilibre ?' },
    { name: 'L’Hermite', keys: 'Recul · sagesse · lumière intérieure', text: 'L’Hermite marche avec sa petite lanterne. Il invite à ralentir, à prendre du recul et à faire confiance à ton propre rythme.', q: 'Qu’est-ce qui s’éclaire quand je ralentis ?' },
    { name: 'La Roue de Fortune', keys: 'Cycles · mouvement · souplesse', text: 'Tout tourne, rien n’est figé. Les saisons changent, et l’on peut s’y adapter avec souplesse plutôt qu’avec crispation.', q: 'Quel changement puis-je accueillir plus doucement ?' },
    { name: 'La Force', keys: 'Courage doux · patience · maîtrise', text: 'La vraie force est tranquille : elle apprivoise plutôt qu’elle ne combat. Ta douceur est une puissance.', q: 'Où puis-je être fort·e avec douceur ?' },
    { name: 'Le Pendu', keys: 'Pause · autre regard · lâcher-prise', text: 'Le Pendu voit le monde à l’envers et découvre autre chose. Une pause peut ouvrir une perspective nouvelle.', q: 'Et si je regardais la situation autrement ?' },
    { name: 'L’Arcane sans nom', keys: 'Transformation · fin d’un cycle · renouveau', text: 'Cet arcane parle de transformation, pas de malheur. Quelque chose se termine pour laisser la place au neuf, comme une saison qui passe.', q: 'Qu’est-ce que j’accepte de laisser derrière moi ?' },
    { name: 'Tempérance', keys: 'Harmonie · juste mesure · apaisement', text: 'Tempérance mélange l’eau de deux coupes avec patience. Elle invite au juste dosage : ni trop, ni trop peu.', q: 'Où ai-je besoin de plus de mesure ?' },
    { name: 'Le Diable', keys: 'Attachements · désir · énergie brute', text: 'Le Diable montre ce qui nous retient : habitudes, envies, peurs. Le voir clairement, c’est déjà retrouver un peu de liberté.', q: 'Quel lien me retient, et ai-je envie de le desserrer ?' },
    { name: 'La Maison Dieu', keys: 'Déclic · libération · vérité', text: 'Une structure trop rigide se fissure pour laisser passer la lumière. Un déclic peut libérer ce qui était coincé.', q: 'Qu’est-ce qui demande à être dit ou changé ?' },
    { name: 'L’Étoile', keys: 'Espoir · inspiration · ressourcement', text: 'L’Étoile verse son eau avec confiance. Carte d’espoir et de ressourcement : prends soin de tes rêves.', q: 'Quel rêve ai-je envie de nourrir ?' },
    { name: 'La Lune', keys: 'Imaginaire · émotions · intuition', text: 'La Lune n’éclaire qu’à moitié. Tout n’est pas clair, et ce n’est pas grave : écoute tes rêves et tes émotions sans te presser de conclure.', q: 'Quelle émotion demande mon attention ?' },
    { name: 'Le Soleil', keys: 'Joie · clarté · chaleur', text: 'Le Soleil réchauffe et rassemble. Journée pour partager, rire, et reconnaître ce qui va bien.', q: 'Qu’est-ce qui m’a fait sourire récemment ?' },
    { name: 'Le Jugement', keys: 'Appel · renouveau · réveil', text: 'Le Jugement est un réveil : une envie ancienne revient, un appel se fait entendre. Écoute ce qui te remet debout.', q: 'Qu’est-ce qui m’appelle en ce moment ?' },
    { name: 'Le Monde', keys: 'Accomplissement · plénitude · intégration', text: 'Le Monde referme un cycle avec réussite. Prends le temps de célébrer le chemin parcouru avant le suivant.', q: 'Qu’ai-je accompli et que je peux célébrer ?' },
  ];
  const SPREAD_POS = [
    ['Passé', 'ce qui t’a construit·e'],
    ['Présent', 'ce qui est là'],
    ['Avenir', 'ce qui peut s’ouvrir'],
  ];

  /* Méditations courtes à lire (textes originaux). */
  const MEDIT_CYCLE = {
    menstruelle: {
      title: 'Revenir au calme',
      text: [
        'Allonge-toi ou assieds-toi bien soutenue, une main posée sur le ventre. Sens la chaleur de ta paume.',
        'Inspire doucement par le nez et laisse le ventre se gonfler. Expire longuement, comme si tu soufflais sur une bougie sans l’éteindre.',
        'Ton corps fait un travail discret : tu as le droit de ralentir. À chaque expiration, laisse partir un peu de tension dans le bas du dos et les épaules.',
      ],
    },
    folliculaire: {
      title: 'Accueillir l’élan',
      text: [
        'Assieds-toi le dos droit, les épaules relâchées. Imagine une lumière fraîche du matin qui entre à chaque inspiration.',
        'Sens l’énergie qui revient, jour après jour. Expire et laisse un léger sourire venir sur ton visage.',
        'Laisse arriver une idée nouvelle, sans la juger. Note-la ensuite si tu veux : c’est une graine pour les jours qui viennent.',
      ],
    },
    ovulatoire: {
      title: 'Rayonner en douceur',
      text: [
        'Debout ou assise, ouvre légèrement la poitrine. Inspire en imaginant une chaleur dorée au centre de toi.',
        'Expire en la laissant rayonner vers les épaules, les bras, le visage.',
        'Pense à une personne avec qui tu as envie de partager quelque chose, et envoie-lui une pensée bienveillante. Phase estimée : écoute surtout ce que tu ressens vraiment aujourd’hui.',
      ],
    },
    luteale: {
      title: 'Poser des limites douces',
      text: [
        'Installe-toi dans un endroit calme. Inspire lentement et remarque, sans jugement, ce qui te pèse aujourd’hui.',
        'Retiens un instant. Expire longuement en relâchant la mâchoire et le front.',
        'Imagine un cercle de lumière autour de toi : à l’intérieur, ce qui te fait du bien ; à l’extérieur, ce qui peut attendre. Tu as le droit de dire non, gentiment.',
      ],
    },
  };
  /* Index = MOON_NAMES (0 nouvelle lune … 7 dernier croissant). */
  const MEDIT_MOON = [
    { title: 'Semer une intention', text: ['Installe-toi, les pieds bien posés au sol. Le ciel est sombre : c’est le temps des graines.', 'Inspire, et laisse venir un seul mot pour ce nouveau cycle. Expire, et dépose ce mot dans ton cœur comme une graine dans la terre.', 'Rien à forcer : une graine pousse à son rythme.'] },
    { title: 'Protéger ce qui naît', text: ['Un fin croissant apparaît. Pense à ton intention comme à une petite flamme.', 'À chaque inspiration, tu l’abrites dans tes mains. À chaque expiration, tes épaules descendent un peu.', 'Demande-toi quel premier geste simple pourrait la nourrir cette semaine.'] },
    { title: 'Oser avancer', text: ['La Lune est à moitié éclairée : l’élan se mêle aux doutes, et c’est normal.', 'Respire dans ton ventre. Inspire le courage, expire l’hésitation.', 'Visualise un seul pas concret, et vois-toi le faire avec calme.'] },
    { title: 'Ajuster avec douceur', text: ['La lumière grandit, presque pleine. C’est le temps des petits réglages.', 'Inspire en remarquant ce qui fonctionne déjà. Expire en relâchant le besoin que tout soit parfait.', 'Ce qui grandit a besoin de patience plus que de pression.'] },
    { title: 'Accueillir la lumière', text: ['La Lune est pleine, tout est éclairé. Pose une main sur ton cœur.', 'Inspire la gratitude pour le chemin parcouru. Expire ce qui est devenu trop lourd.', 'Laisse la lumière te montrer une chose que tu sais déjà, sans jugement.'] },
    { title: 'Remercier et partager', text: ['La lumière commence à décroître. Respire lentement.', 'Pense à trois choses reçues ce mois-ci. À chaque expiration, envoie un merci silencieux.', 'Ce que tu as appris peut maintenant être partagé.'] },
    { title: 'Trier et lâcher', text: ['La moitié de la Lune s’efface. Imagine une pièce que tu ranges doucement.', 'Inspire en choisissant ce que tu gardes. Expire en déposant ce qui ne te sert plus.', 'Sens la place qui se libère en toi.'] },
    { title: 'Se reposer avant le renouveau', text: ['Un mince croissant, juste avant la nuit noire. C’est le temps du repos.', 'Laisse le corps devenir lourd et la respiration ralentir d’elle-même.', 'Tu n’as rien à produire ce soir. Le vide prépare le prochain départ.'] },
  ];

  /* Thème natal : planètes, glyphes, sens courts (planète × signe). */
  const NATAL_BODIES = [
    { key: 'Sun', fr: 'Soleil', glyph: '☉', theme: 'Ton identité profonde' },
    { key: 'Moon', fr: 'Lune', glyph: '☽', theme: 'Ta vie émotionnelle' },
    { key: 'Mercury', fr: 'Mercure', glyph: '☿', theme: 'Ta façon de penser et de parler' },
    { key: 'Venus', fr: 'Vénus', glyph: '♀', theme: 'Ta manière d’aimer' },
    { key: 'Mars', fr: 'Mars', glyph: '♂', theme: 'Ton énergie d’action' },
    { key: 'Jupiter', fr: 'Jupiter', glyph: '♃', theme: 'Ton élan de croissance' },
    { key: 'Saturn', fr: 'Saturne', glyph: '♄', theme: 'Ton sens de l’effort' },
    { key: 'Uranus', fr: 'Uranus', glyph: '♅', theme: 'Ton besoin de liberté', slow: true },
    { key: 'Neptune', fr: 'Neptune', glyph: '♆', theme: 'Ta part de rêve', slow: true },
    { key: 'Pluto', fr: 'Pluton', glyph: '♇', theme: 'Ta force de transformation', slow: true },
  ];
  const SIGN_STYLE = [
    'avec élan, franchise et envie de commencer',
    'avec calme, constance et goût du concret',
    'avec curiosité, légèreté et besoin d’échanger',
    'avec tendresse, mémoire et envie de protéger',
    'avec chaleur, générosité et envie de briller',
    'avec précision, soin du détail et envie d’être utile',
    'avec élégance, sens de l’harmonie et goût du lien',
    'avec intensité, profondeur et loyauté',
    'avec enthousiasme, optimisme et soif d’horizons',
    'avec sérieux, persévérance et sens des responsabilités',
    'avec originalité, indépendance et esprit d’équipe',
    'avec intuition, empathie et imagination',
  ];

  /* Villes avec coordonnées et fuseau (heure locale → UTC, heure d’été comprise). */
  const NATAL_CITIES = [
    { id: 'abidjan', fr: 'Abidjan', lat: 5.36, lon: -4.0083, tz: 'Africa/Abidjan', off: 0 },
    { id: 'bouake', fr: 'Bouaké', lat: 7.6906, lon: -5.0303, tz: 'Africa/Abidjan', off: 0 },
    { id: 'yamoussoukro', fr: 'Yamoussoukro', lat: 6.8276, lon: -5.2893, tz: 'Africa/Abidjan', off: 0 },
    { id: 'dakar', fr: 'Dakar', lat: 14.7167, lon: -17.4677, tz: 'Africa/Dakar', off: 0 },
    { id: 'lome', fr: 'Lomé', lat: 6.1319, lon: 1.2228, tz: 'Africa/Lome', off: 0 },
    { id: 'cotonou', fr: 'Cotonou', lat: 6.3654, lon: 2.4183, tz: 'Africa/Porto-Novo', off: 60 },
    { id: 'douala', fr: 'Douala', lat: 4.0511, lon: 9.7679, tz: 'Africa/Douala', off: 60 },
    { id: 'yaounde', fr: 'Yaoundé', lat: 3.848, lon: 11.5021, tz: 'Africa/Douala', off: 60 },
    { id: 'kinshasa', fr: 'Kinshasa', lat: -4.3217, lon: 15.3125, tz: 'Africa/Kinshasa', off: 60 },
    { id: 'libreville', fr: 'Libreville', lat: 0.4162, lon: 9.4673, tz: 'Africa/Libreville', off: 60 },
    { id: 'bamako', fr: 'Bamako', lat: 12.6392, lon: -8.0029, tz: 'Africa/Bamako', off: 0 },
    { id: 'ouagadougou', fr: 'Ouagadougou', lat: 12.3714, lon: -1.5197, tz: 'Africa/Ouagadougou', off: 0 },
    { id: 'accra', fr: 'Accra', lat: 5.6037, lon: -0.187, tz: 'Africa/Accra', off: 0 },
    { id: 'lagos', fr: 'Lagos', lat: 6.5244, lon: 3.3792, tz: 'Africa/Lagos', off: 60 },
    { id: 'paris', fr: 'Paris', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris', off: 60 },
    { id: 'bruxelles', fr: 'Bruxelles', lat: 50.8503, lon: 4.3517, tz: 'Europe/Brussels', off: 60 },
    { id: 'montreal', fr: 'Montréal', lat: 45.5019, lon: -73.5674, tz: 'America/Toronto', off: -300 },
  ];
  const NATAL_DEMO = { date: DEMO.birthDate, time: '09:30', city: 'abidjan' };

  /* —— Petits outils —— */
  function hashStr(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seededRandom(a) {
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }
  function readJson(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }
  function writeJson(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) { /* ignore */ }
  }
  let svgUid = 0;
  function icon(id, cls) {
    return '<svg class="ico ' + (cls || '') + '" aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>';
  }
  function frNoteSync() {
    document.querySelectorAll('[data-fr-note]').forEach((n) => { n.hidden = currentLang === 'fr'; });
  }

  /* —— Petite icône de phase lunaire (SVG) —— */
  function moonIconSvg(idx, size) {
    const s = size || 22;
    const r = 9;
    const c = 11;
    const elong = idx * 45;
    let lit = '';
    if (idx === 4) {
      lit = '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="#F3E3B5"/>';
    } else if (idx !== 0) {
      const rx = Math.abs(Math.cos((elong * Math.PI) / 180)) * r;
      const waxing = elong < 180;
      const first = waxing ? 1 : 0;
      let term;
      if (waxing) term = elong < 90 ? 0 : 1;
      else term = elong < 270 ? 0 : 1;
      lit = '<path fill="#F3E3B5" d="M' + c + ' ' + (c - r) + ' A' + r + ' ' + r + ' 0 0 ' + first + ' ' + c + ' ' + (c + r) +
        ' A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + term + ' ' + c + ' ' + (c - r) + 'Z"/>';
    }
    return '<svg class="moon-ico" viewBox="0 0 22 22" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="#3B2A4A"/>' + lit +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="#7A5A14" stroke-width="1"/></svg>';
  }

  /* —— Tarot : symboles dessinés (trait or foncé, 100×100) —— */
  function starPath(cx, cy, n, R, r) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2;
      const rr = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }
  function tarotSymbol(i) {
    switch (i) {
      case 0: return '<circle cx="50" cy="56" r="22"/><path d="' + starPath(50, 22, 4, 9, 3) + '" fill="currentColor" stroke="none"/>';
      case 1: return '<path d="M50 52c-9-13-28-13-28 0s19 13 28 0 28-13 28 0-19 13-28 0z"/><path d="M50 70v14M42 84h16"/>';
      case 2: return '<circle cx="50" cy="50" r="12"/><path d="M33 30a22 22 0 0 0 0 40a18 18 0 0 1 0-40z"/><path d="M67 30a22 22 0 0 1 0 40a18 18 0 0 0 0-40z"/>';
      case 3: return '<circle cx="50" cy="40" r="16"/><path d="M50 56v28M39 72h22"/><path d="' + starPath(50, 40, 4, 5, 1.8) + '" fill="currentColor" stroke="none"/>';
      case 4: return '<rect x="32" y="42" width="36" height="36" rx="1"/><path d="M33 36l7-14 10 9 10-9 7 14z"/><path d="M50 50v20M40 60h20"/>';
      case 5: return '<path d="M50 16v68M38 30h24M34 43h32M30 56h40"/><circle cx="50" cy="84" r="3" fill="currentColor"/>';
      case 6: return '<circle cx="40" cy="52" r="18"/><circle cx="60" cy="52" r="18"/><path d="M50 22l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="currentColor" stroke="none"/>';
      case 7: return '<path d="M26 38h48l-6 24H32z"/><circle cx="34" cy="72" r="8"/><circle cx="66" cy="72" r="8"/><path d="M50 22v16M44 22h12"/>';
      case 8: return '<path d="M50 20v58M30 30h40M38 82h24"/><path d="M30 30l-10 22h20zM70 30l-10 22h20z"/><path d="M20 52h20M60 52h20"/>';
      case 9: return '<path d="M42 32h16l7 10v24l-7 10H42l-7-10V42z"/><path d="M50 16v16"/><path d="' + starPath(50, 54, 6, 8, 3.5) + '" fill="currentColor" stroke="none"/>';
      case 10: return '<circle cx="50" cy="50" r="27"/><circle cx="50" cy="50" r="6"/><path d="M50 23v54M23 50h54M30.9 30.9l38.2 38.2M69.1 30.9L30.9 69.1"/>';
      case 11: return '<path d="M50 30c-7-9-20-9-20 0s13 9 20 0 20-9 20 0-13 9-20 0z"/><circle cx="50" cy="62" r="17"/><path d="M42 62h16"/>';
      case 12: return '<path d="M28 18h44M50 18v14"/><path d="M36 38h28L50 62z"/><path d="M50 62v20M42 74h16"/>';
      case 13: {
        let d = '';
        for (let k = 0; k <= 64; k++) {
          const a = k * 0.27;
          const rr = 2 + a * 3.6;
          d += (k ? 'L' : 'M') + (50 + rr * Math.cos(a)).toFixed(1) + ' ' + (52 + rr * Math.sin(a)).toFixed(1);
        }
        return '<path d="' + d + '"/>';
      }
      case 14: return '<path d="M22 28h22l-4 16H26z"/><path d="M56 58h22l-4 16H60z"/><path d="M40 44c8 2 6 10 12 12s8 0 12 2"/><path d="M33 44v6M67 52v6"/>';
      case 15: return '<rect x="20" y="40" width="32" height="20" rx="10"/><rect x="48" y="40" width="32" height="20" rx="10"/><path d="M50 22v10M50 68v10"/>';
      case 16: return '<path d="M38 84V38h24v46"/><path d="M34 38l4-10h24l4 10"/><path d="M68 12l-9 14h8l-9 14"/><path d="M45 50h10M45 64h10"/>';
      case 17: return '<path d="' + starPath(50, 46, 8, 26, 9) + '"/><path d="' + starPath(50, 46, 8, 9, 4) + '" fill="currentColor" stroke="none"/><path d="M30 82c8-5 32-5 40 0"/>';
      case 18: return '<path d="M58 22a26 26 0 1 0 0 52a20 20 0 1 1 0-52z"/><circle cx="72" cy="58" r="2.5" fill="currentColor"/><circle cx="66" cy="70" r="2" fill="currentColor"/><circle cx="76" cy="44" r="1.8" fill="currentColor"/>';
      case 19: {
        let rays = '';
        for (let k = 0; k < 12; k++) {
          const a = (Math.PI * k) / 6;
          rays += 'M' + (50 + 21 * Math.cos(a)).toFixed(1) + ' ' + (50 + 21 * Math.sin(a)).toFixed(1) + 'L' + (50 + (k % 2 ? 29 : 33) * Math.cos(a)).toFixed(1) + ' ' + (50 + (k % 2 ? 29 : 33) * Math.sin(a)).toFixed(1);
        }
        return '<circle cx="50" cy="50" r="15"/><path d="' + rays + '"/>';
      }
      case 20: return '<path d="M24 68a26 26 0 0 1 52 0z"/><path d="M50 36V18M36 40l-7-13M64 40l7-13M26 50l-10-6M74 50l10-6"/><path d="M18 78h64"/>';
      default: return '<ellipse cx="50" cy="50" rx="21" ry="31"/><ellipse cx="50" cy="50" rx="27" ry="37" stroke-dasharray="2 4"/><path d="' + starPath(50, 50, 4, 9, 3) + '" fill="currentColor" stroke="none"/>';
    }
  }
  function tarotFrontSvg(i) {
    const id = 'tg' + (++svgUid);
    const name = t(TAROT[i].name);
    const fit = name.length > 12 ? ' textLength="96" lengthAdjust="spacingAndGlyphs"' : '';
    const corner = (x, y) => '<path d="' + starPath(x, y, 4, 3.4, 1.1) + '" fill="#C5A059"/>';
    return '<svg class="tarot-svg" viewBox="0 0 120 200" role="img" aria-label="' + escapeHtml(t('Arcane {r} · {n}', { r: ROMAN[i], n: name })) + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#F3EBDA"/></linearGradient></defs>' +
      '<rect x="1" y="1" width="118" height="198" rx="9" fill="url(#' + id + ')" stroke="#C5A059" stroke-width="1"/>' +
      '<rect x="7" y="7" width="106" height="186" rx="5" fill="none" stroke="#C5A059" stroke-width=".7"/>' +
      '<rect x="10.5" y="10.5" width="99" height="179" rx="3" fill="none" stroke="#C5A059" stroke-width=".4" stroke-dasharray="1 2.2"/>' +
      corner(15, 15) + corner(105, 15) + corner(15, 185) + corner(105, 185) +
      '<text x="60" y="33" text-anchor="middle" class="tarot-roman">' + ROMAN[i] + '</text>' +
      '<path d="M44 40h32" stroke="#C5A059" stroke-width=".6"/>' +
      '<circle cx="60" cy="96" r="38" fill="none" stroke="#C5A059" stroke-width=".45"/>' +
      '<circle cx="60" cy="96" r="34" fill="#FBF5E8" stroke="#C5A059" stroke-width=".3"/>' +
      '<g transform="translate(28 64) scale(.64)" fill="none" stroke="#7A5A14" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" color="#7A5A14">' + tarotSymbol(i) + '</g>' +
      '<path d="M44 150h32" stroke="#C5A059" stroke-width=".6"/>' +
      '<text x="60" y="169" text-anchor="middle" class="tarot-name-svg"' + fit + '>' + escapeHtml(name) + '</text>' +
      '</svg>';
  }
  function tarotBackSvg() {
    const id = 'tb' + (++svgUid);
    let dots = '';
    for (let k = 0; k < 24; k++) {
      const a = (Math.PI * k) / 12;
      dots += '<circle cx="' + (60 + 44 * Math.cos(a)).toFixed(1) + '" cy="' + (100 + 44 * Math.sin(a)).toFixed(1) + '" r="' + (k % 2 ? 0.8 : 1.4) + '" fill="#C5A059"/>';
    }
    return '<svg class="tarot-svg" viewBox="0 0 120 200" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="' + id + '" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#4A2C5E"/><stop offset="1" stop-color="#24132F"/></radialGradient></defs>' +
      '<rect x="1" y="1" width="118" height="198" rx="9" fill="url(#' + id + ')" stroke="#C5A059" stroke-width="1"/>' +
      '<rect x="7" y="7" width="106" height="186" rx="5" fill="none" stroke="#C5A059" stroke-width=".7"/>' +
      '<rect x="11" y="11" width="98" height="178" rx="3" fill="none" stroke="#C5A059" stroke-width=".35" stroke-dasharray="1 2.4"/>' +
      '<circle cx="60" cy="100" r="34" fill="none" stroke="#C5A059" stroke-width=".8"/>' +
      '<circle cx="60" cy="100" r="28" fill="none" stroke="#C5A059" stroke-width=".4"/>' + dots +
      '<path d="' + starPath(60, 100, 8, 22, 8) + '" fill="none" stroke="#C5A059" stroke-width=".9"/>' +
      '<path d="' + starPath(60, 100, 4, 8, 2.6) + '" fill="#C5A059"/>' +
      '<path d="M54 30a8 8 0 1 0 12 0a6.4 6.4 0 1 1-12 0z" fill="#C5A059" transform="rotate(180 60 33)"/>' +
      '<path d="M54 166a8 8 0 1 0 12 0a6.4 6.4 0 1 1-12 0z" fill="#C5A059"/>' +
      '</svg>';
  }

  /* —— Tarot du jour : une carte par jour (date + profil), tirage 3 cartes une fois par jour —— */
  function tarotSeedString() {
    const p = loadLastProfile();
    const who = p && (p.birthIso || p.firstName)
      ? String(p.firstName || '') + '|' + String(p.birthIso || '')
      : DEMO.displayName + '|' + DEMO.birthDate;
    return DEMO.today + '|' + who.toLowerCase();
  }
  function tarotState() {
    const seedStr = tarotSeedString();
    const seed = hashStr(seedStr);
    let st = readJson(TAROT_KEY);
    if (!st || st.date !== DEMO.today || st.seed !== seed) st = { date: DEMO.today, seed: seed, flipped: false, spread: null };
    st.card = hashStr('carte|' + seedStr) % 22;
    return st;
  }
  function saveTarotState(st) {
    writeJson(TAROT_KEY, { date: st.date, seed: st.seed, flipped: !!st.flipped, spread: st.spread || null });
  }
  function drawSpread(st, exclude) {
    const rnd = seededRandom(hashStr('tirage|' + tarotSeedString()));
    const pool = [];
    for (let i = 0; i < 22; i++) if (i !== exclude) pool.push(i);
    const out = [];
    while (out.length < 3) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    return out;
  }

  function renderTarot() {
    const front = document.getElementById('tarotFront');
    const back = document.getElementById('tarotBack');
    const flip = document.getElementById('tarotFlip');
    if (!front || !back || !flip) return;
    const st = tarotState();
    const c = TAROT[st.card];
    front.innerHTML = tarotFrontSvg(st.card);
    if (!back.firstChild) back.innerHTML = tarotBackSvg();
    flip.classList.toggle('is-flipped', !!st.flipped);
    flip.setAttribute('aria-pressed', st.flipped ? 'true' : 'false');
    flip.setAttribute('aria-label', st.flipped ? t('Arcane {r} · {n}', { r: ROMAN[st.card], n: t(c.name) }) : t('Retourner la carte du jour'));
    const hint = document.getElementById('tarotHint');
    if (hint) hint.textContent = st.flipped ? t('Touche la carte pour la retourner à nouveau.') : t('Touche la carte pour la retourner.');
    const mean = document.getElementById('tarotMeaning');
    if (mean) {
      mean.hidden = !st.flipped;
      document.getElementById('tarotName').textContent = ROMAN[st.card] + ' · ' + t(c.name);
      document.getElementById('tarotKeys').textContent = c.keys;
      document.getElementById('tarotText').textContent = c.text + ' ' + 'Une piste, pas une sentence.';
      document.getElementById('tarotQuestion').textContent = c.q;
    }
    renderSpread(st, false);
  }

  function renderSpread(st, animate) {
    const box = document.getElementById('tarotSpread');
    const btn = document.getElementById('btnSpread');
    if (!box || !btn) return;
    if (!st.spread) {
      box.hidden = true;
      box.innerHTML = '';
      btn.disabled = false;
      btn.textContent = t('Tirer mes 3 cartes');
      return;
    }
    btn.disabled = true;
    btn.textContent = t('Tirage du jour fait ✦ · à refaire demain');
    box.hidden = false;
    box.innerHTML = st.spread.map((ci, k) => {
      const c = TAROT[ci];
      return '<article class="spread-item' + (animate ? '' : ' is-in') + '" style="--d:' + (k * 260) + 'ms">' +
        '<p class="spread-pos"><strong>' + escapeHtml(t(SPREAD_POS[k][0])) + '</strong><span>' + escapeHtml(t(SPREAD_POS[k][1])) + '</span></p>' +
        '<div class="spread-card">' + tarotFrontSvg(ci) + '</div>' +
        '<p class="spread-name">' + escapeHtml(ROMAN[ci] + ' · ' + t(c.name)) + '</p>' +
        '<p class="spread-keys">' + escapeHtml(c.keys) + '</p>' +
        '<p class="spread-text">' + escapeHtml(c.text) + '</p>' +
        '</article>';
    }).join('');
    if (animate) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        box.querySelectorAll('.spread-item').forEach((n) => n.classList.add('is-in'));
      }));
    }
  }

  function bindTarot() {
    const flip = document.getElementById('tarotFlip');
    if (flip) {
      flip.addEventListener('click', () => {
        const st = tarotState();
        st.flipped = !flip.classList.contains('is-flipped');
        saveTarotState(st);
        renderTarot();
        renderRituel();
        if (st.flipped) toast('Ta carte du jour ✦');
      });
    }
    const btn = document.getElementById('btnSpread');
    if (btn) {
      btn.addEventListener('click', () => {
        const st = tarotState();
        if (st.spread) return;
        st.spread = drawSpread(st, st.card);
        saveTarotState(st);
        renderSpread(st, !prefersReducedMotion());
        toast('Ton tirage du jour ✦');
      });
    }
  }

  /* —— Souffle guidé : cercle 4-4-6, minuteur 1 / 3 / 5 min, sans son —— */
  const BREATH_STEPS = [
    { key: 'in', label: 'Inspire', s: 4 },
    { key: 'hold', label: 'Retiens', s: 4 },
    { key: 'out', label: 'Expire', s: 6 },
  ];
  const BREATH_CYCLE = 14;
  let breathRun = null;
  const breathDone = { cycle: false, moon: false };

  function fmtClock(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.max(0, Math.floor(sec % 60));
    return m + ':' + String(s).padStart(2, '0');
  }

  function buildBreath(root) {
    if (!root || (breathRun && breathRun.root === root)) return;
    const min = Number(root.dataset.min || 3);
    root.dataset.min = String(min);
    root.innerHTML =
      '<div class="breath-stage">' +
        '<span class="breath-ring" aria-hidden="true"></span>' +
        '<span class="breath-circle" data-step="idle" aria-hidden="true"></span>' +
        '<span class="breath-text"><span class="breath-label" aria-live="polite">' + escapeHtml(t('Quand tu veux')) + '</span>' +
        '<span class="breath-count" aria-hidden="true"></span></span>' +
      '</div>' +
      '<div class="breath-durations" role="radiogroup" aria-label="' + escapeHtml(t('Durée')) + '">' +
        [1, 3, 5].map((m) => '<button type="button" role="radio" class="breath-dur' + (m === min ? ' is-on' : '') + '" aria-checked="' + (m === min) + '" data-min="' + m + '">' +
          escapeHtml(t('{n} min', { n: m })) + '</button>').join('') +
      '</div>' +
      '<button type="button" class="btn btn-primary breath-start">' + escapeHtml(t('Commencer le souffle')) + '</button>' +
      '<p class="breath-time" aria-hidden="true">' + fmtClock(min * 60) + '</p>' +
      '<p class="tiny breath-help">' + escapeHtml(t('Inspire 4 s · retiens 4 s · expire 6 s. Respire sans forcer, et arrête-toi si tu ne te sens pas bien.')) + '</p>';
  }

  function stopBreath(completed) {
    if (!breathRun) return;
    const run = breathRun;
    clearInterval(run.timer);
    breathRun = null;
    if (completed) {
      breathDone[run.root.dataset.breath] = true;
      toast('Séance terminée ✦ merci pour ce moment');
      renderRituel();
    }
    buildBreath(run.root);
  }

  function startBreath(root) {
    if (breathRun) stopBreath(false);
    const total = Number(root.dataset.min || 3) * 60;
    const circle = root.querySelector('.breath-circle');
    const label = root.querySelector('.breath-label');
    const count = root.querySelector('.breath-count');
    const time = root.querySelector('.breath-time');
    const btn = root.querySelector('.breath-start');
    root.classList.add('is-running');
    if (btn) btn.textContent = t('Arrêter');
    const start = Date.now();
    let lastStep = -1;
    const tick = () => {
      const el = (Date.now() - start) / 1000;
      if (el >= total) { root.classList.remove('is-running'); stopBreath(true); return; }
      const inCycle = el % BREATH_CYCLE;
      let acc = 0;
      let idx = 0;
      for (; idx < BREATH_STEPS.length; idx++) {
        if (inCycle < acc + BREATH_STEPS[idx].s) break;
        acc += BREATH_STEPS[idx].s;
      }
      const step = BREATH_STEPS[idx];
      if (idx !== lastStep) {
        lastStep = idx;
        circle.style.transitionDuration = step.s + 's';
        circle.dataset.step = step.key;
        label.textContent = t(step.label);
      }
      count.textContent = String(Math.ceil(acc + step.s - inCycle));
      time.textContent = fmtClock(total - el);
    };
    breathRun = { root: root, timer: setInterval(tick, 200) };
    tick();
  }

  function bindBreath() {
    document.addEventListener('click', (e) => {
      const root = e.target.closest('[data-breath]');
      if (!root) return;
      const dur = e.target.closest('.breath-dur');
      if (dur) {
        if (breathRun && breathRun.root === root) return;
        root.dataset.min = dur.dataset.min;
        buildBreath(root);
        const again = root.querySelector('.breath-dur[data-min="' + dur.dataset.min + '"]');
        if (again) again.focus();
        return;
      }
      if (e.target.closest('.breath-start')) {
        if (breathRun && breathRun.root === root) {
          root.classList.remove('is-running');
          stopBreath(false);
          const b = root.querySelector('.breath-start');
          if (b) b.focus();
        } else {
          startBreath(root);
        }
      }
    });
  }

  /* —— Méditations : phase du cycle (Cycle) et phase lunaire (Astro) —— */
  let meditCyclePhase = null;
  let meditMoonIdx = null;
  function currentCyclePhase() {
    const inp = activeCalcInputs();
    const res = computeCalc(inp.lastStart, inp.periodLen, inp.cycleLen);
    return res ? res.phase.key : 'luteale';
  }
  function todayMoonIdx() {
    return skyAt(noonUtc(productToday())).phaseIdx;
  }
  function meditBodyHtml(m, head, cls) {
    return '<p class="medit-head ' + (cls || '') + '">' + head + '</p>' +
      '<p class="medit-title">' + escapeHtml(t(m.title)) + '</p>' +
      m.text.map((p, i) => '<p class="body medit-p' + (i ? '' : ' medit-first') + '">' + escapeHtml(p) + '</p>').join('');
  }
  function renderMeditCycle() {
    const tabs = document.getElementById('meditCycleTabs');
    const body = document.getElementById('meditCycleBody');
    if (!tabs || !body) return;
    const cur = currentCyclePhase();
    if (!meditCyclePhase) meditCyclePhase = cur;
    tabs.innerHTML = PHASE_ORDER.map((k) =>
      '<button type="button" role="tab" class="phase-tab ph-' + k + (k === meditCyclePhase ? ' is-active' : '') + '" aria-selected="' + (k === meditCyclePhase) +
      '" aria-controls="meditCycleBody" data-mphase="' + k + '">' + escapeHtml(t(PHASE_META[k].name).replace(/\s*[（(].*[)）]$/, '')) + '</button>'
    ).join('');
    const head = escapeHtml(t(PHASE_META[meditCyclePhase].full)) + (meditCyclePhase === cur ? ' · ' + escapeHtml(t('maintenant')) : '');
    body.innerHTML = meditBodyHtml(MEDIT_CYCLE[meditCyclePhase], head, 'ph-' + meditCyclePhase);
  }
  function renderMeditMoon() {
    const tabs = document.getElementById('meditMoonTabs');
    const body = document.getElementById('meditMoonBody');
    if (!tabs || !body) return;
    const cur = todayMoonIdx();
    if (meditMoonIdx == null) meditMoonIdx = cur;
    tabs.innerHTML = MOON_NAMES.map((n, i) =>
      '<button type="button" role="tab" class="moon-tab' + (i === meditMoonIdx ? ' is-active' : '') + '" aria-selected="' + (i === meditMoonIdx) +
      '" aria-controls="meditMoonBody" aria-label="' + escapeHtml(t(n)) + '" title="' + escapeHtml(t(n)) + '" data-moon="' + i + '">' + moonIconSvg(i, 24) + '</button>'
    ).join('');
    const head = moonIconSvg(meditMoonIdx, 18) + '<span>' + escapeHtml(t(MOON_NAMES[meditMoonIdx])) + (meditMoonIdx === cur ? ' · ' + escapeHtml(t('ce soir')) : '') + '</span>';
    body.innerHTML = meditBodyHtml(MEDIT_MOON[meditMoonIdx], head, 'moon-head');
  }
  function bindMedit() {
    const ct = document.getElementById('meditCycleTabs');
    if (ct) {
      ct.addEventListener('click', (e) => {
        const b = e.target.closest('[data-mphase]');
        if (!b) return;
        meditCyclePhase = b.dataset.mphase;
        renderMeditCycle();
        const again = ct.querySelector('[data-mphase="' + meditCyclePhase + '"]');
        if (again) again.focus();
      });
      ct.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = PHASE_ORDER.indexOf(meditCyclePhase);
        meditCyclePhase = PHASE_ORDER[(i + (e.key === 'ArrowRight' ? 1 : 3)) % 4];
        renderMeditCycle();
        const again = ct.querySelector('[data-mphase="' + meditCyclePhase + '"]');
        if (again) again.focus();
        e.preventDefault();
      });
    }
    const mt = document.getElementById('meditMoonTabs');
    if (mt) {
      mt.addEventListener('click', (e) => {
        const b = e.target.closest('[data-moon]');
        if (!b) return;
        meditMoonIdx = Number(b.dataset.moon);
        renderMeditMoon();
        const again = mt.querySelector('[data-moon="' + meditMoonIdx + '"]');
        if (again) again.focus();
      });
      mt.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        meditMoonIdx = (meditMoonIdx + (e.key === 'ArrowRight' ? 1 : 7)) % 8;
        renderMeditMoon();
        const again = mt.querySelector('[data-moon="' + meditMoonIdx + '"]');
        if (again) again.focus();
        e.preventDefault();
      });
    }
  }

  /* —— Thème natal (astronomy-engine, MIT) —— */
  const ASTRO = window.Astronomy || null;
  const n360 = (x) => ((x % 360) + 360) % 360;

  function tzOffsetMin(zone, utcMs) {
    const f = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const parts = {};
    f.formatToParts(new Date(utcMs)).forEach((p) => { parts[p.type] = p.value; });
    const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second);
    return Math.round((asUtc - utcMs) / 60000);
  }
  /** Heure locale de naissance → instant UTC (fuseau IANA, heure d’été comprise ; repli : décalage fixe). */
  function localToUtc(y, mo, d, hh, mi, zone, fixedMin) {
    const guess = Date.UTC(y, mo, d, hh, mi);
    if (zone) {
      try {
        const off = tzOffsetMin(zone, guess);
        let utc = guess - off * 60000;
        const off2 = tzOffsetMin(zone, utc);
        if (off2 !== off) utc = guess - off2 * 60000;
        return { utc: utc, off: off2 };
      } catch (_) { /* fuseau inconnu : décalage fixe */ }
    }
    return { utc: guess - (fixedMin || 0) * 60000, off: fixedMin || 0 };
  }

  function natalCompute(inp) {
    if (!ASTRO) return null;
    const rad = Math.PI / 180;
    const deg = 180 / Math.PI;
    const time = ASTRO.MakeTime(new Date(inp.utcMs));
    const t2 = ASTRO.MakeTime(new Date(inp.utcMs + 3600000));
    const lonOf = (b, tm) => {
      if (b === 'Sun') return ASTRO.SunPosition(tm).elon;
      if (b === 'Moon') return ASTRO.EclipticGeoMoon(tm).lon;
      return ASTRO.Ecliptic(ASTRO.GeoVector(b, tm, true)).elon;
    };
    const planets = NATAL_BODIES.map((b) => {
      const l = n360(lonOf(b.key, time));
      let dl = n360(lonOf(b.key, t2)) - l;
      if (dl > 180) dl -= 360;
      if (dl < -180) dl += 360;
      return { key: b.key, lon: l, retro: b.key !== 'Sun' && b.key !== 'Moon' && dl < 0 };
    });
    const out = { planets: planets, asc: null, mc: null, cusps: null, houseSystem: null };
    if (inp.hasTime && inp.hasPlace) {
      const T = time.tt / 36525;
      const eps = (23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T) * rad;
      const ramcDeg = n360(ASTRO.SiderealTime(time) * 15 + inp.lon);
      const ramc = ramcDeg * rad;
      const phi = inp.lat * rad;
      out.mc = n360(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) * deg);
      out.asc = n360(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * deg);
      const raToLon = (ra) => n360(Math.atan2(Math.sin(ra * rad), Math.cos(ra * rad) * Math.cos(eps)) * deg);
      const cusp = (offset, frac) => {
        let lam = raToLon(ramcDeg + offset + 30);
        for (let i = 0; i < 80; i++) {
          const dec = Math.asin(Math.sin(eps) * Math.sin(lam * rad));
          const x = -Math.tan(phi) * Math.tan(dec);
          if (x < -1 || x > 1) return NaN;
          const next = raToLon(ramcDeg + offset + frac(Math.acos(x) * deg));
          const diff = Math.abs(((next - lam + 540) % 360) - 180);
          lam = next;
          if (diff < 1e-7) break;
        }
        return lam;
      };
      const c11 = cusp(0, (s) => s / 3);
      const c12 = cusp(0, (s) => (2 * s) / 3);
      const c2 = cusp(60, (s) => (2 * s) / 3);
      const c3 = cusp(120, (s) => s / 3);
      if ([c11, c12, c2, c3].some((v) => !isFinite(v))) {
        out.houseSystem = 'egales';
        out.cusps = Array.from({ length: 12 }, (_, i) => n360(out.asc + 30 * i));
      } else {
        out.houseSystem = 'placidus';
        out.cusps = [out.asc, c2, c3, n360(out.mc + 180), n360(c11 + 180), n360(c12 + 180), n360(out.asc + 180), n360(c2 + 180), n360(c3 + 180), out.mc, c11, c12];
      }
    }
    return out;
  }
  function houseOf(lon, cusps) {
    for (let i = 0; i < 12; i++) {
      const a = cusps[i];
      const b = cusps[(i + 1) % 12];
      if (n360(lon - a) < n360(b - a)) return i + 1;
    }
    return 1;
  }
  /** 24°18′ Vierge (arrondi à la minute d’arc). */
  function lonParts(lon) {
    const m = Math.round(n360(lon) * 60) % 21600;
    const sign = Math.floor(m / 1800);
    const w = m % 1800;
    return { sign: sign, d: Math.floor(w / 60), m: w % 60 };
  }
  function fmtLon(lon, withSign) {
    const p = lonParts(lon);
    const dm = p.d + '°' + String(p.m).padStart(2, '0') + '′';
    return withSign === false ? dm : dm + ' ' + t(SIGNS[p.sign].fr);
  }

  function natalInputFromForm() {
    const dEl = document.getElementById('natalDate');
    const tEl = document.getElementById('natalTime');
    const cEl = document.getElementById('natalCity');
    const date = dEl && dEl.value;
    const d = parseYMD(date);
    if (!d) return { error: 'Indique une date de naissance' };
    const time = (tEl && tEl.value) || '';
    const cityId = cEl ? cEl.value : 'abidjan';
    let lat = null;
    let lon = null;
    let zone = null;
    let off = 0;
    let placeLabel = '';
    if (cityId === 'manual') {
      const la = parseFloat(document.getElementById('natalLat').value);
      const lo = parseFloat(document.getElementById('natalLon').value);
      off = Number(document.getElementById('natalTz').value || 0);
      if (isFinite(la) && isFinite(lo) && Math.abs(la) <= 66 && Math.abs(lo) <= 180) {
        lat = la;
        lon = lo;
        placeLabel = la.toFixed(2) + ', ' + lo.toFixed(2);
      } else {
        placeLabel = t('lieu non précisé');
      }
    } else {
      const c = NATAL_CITIES.find((x) => x.id === cityId) || NATAL_CITIES[0];
      lat = c.lat;
      lon = c.lon;
      zone = c.tz;
      off = c.off;
      placeLabel = c.fr;
    }
    const hasTime = /^\d{1,2}:\d{2}$/.test(time);
    const hh = hasTime ? Number(time.split(':')[0]) : 12;
    const mi = hasTime ? Number(time.split(':')[1]) : 0;
    const conv = localToUtc(d.getFullYear(), d.getMonth(), d.getDate(), hh, mi, zone, off);
    return {
      date: date, time: time, city: cityId, lat: lat, lon: lon, tzOff: off, placeLabel: placeLabel,
      utcMs: conv.utc, offMin: conv.off, hasTime: hasTime, hasPlace: lat != null && lon != null, d: d,
    };
  }

  function natalDefaults() {
    const saved = readJson(NATAL_KEY);
    if (saved && saved.date) return saved;
    const p = loadLastProfile();
    if (p && p.birthIso && parseYMD(p.birthIso)) {
      const place = String(p.place || '').trim().toLowerCase();
      const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const c = place ? NATAL_CITIES.find((x) => norm(place).indexOf(norm(x.fr)) === 0) : null;
      return { date: p.birthIso, time: p.birthTime || '', city: c ? c.id : 'abidjan', fromProfile: true };
    }
    return Object.assign({ demo: true }, NATAL_DEMO);
  }

  function fillNatalForm() {
    const sel = document.getElementById('natalCity');
    const tz = document.getElementById('natalTz');
    if (!sel) return;
    const keep = sel.value;
    sel.innerHTML = NATAL_CITIES.map((c) => '<option value="' + c.id + '">' + escapeHtml(c.fr) + '</option>').join('') +
      '<option value="manual">' + escapeHtml(t('Autre lieu (latitude / longitude)')) + '</option>';
    if (tz && !tz.options.length) {
      const offs = [];
      for (let h = -12; h <= 14; h += 0.5) offs.push(h);
      tz.innerHTML = offs.map((h) => {
        const sign = h < 0 ? '−' : '+';
        const a = Math.abs(h);
        const lab = 'UTC ' + sign + Math.floor(a) + (a % 1 ? ':30' : '');
        return '<option value="' + Math.round(h * 60) + '"' + (h === 0 ? ' selected' : '') + '>' + lab + '</option>';
      }).join('');
    }
    if (keep) sel.value = keep;
  }

  function applyNatalDefaults() {
    const def = natalDefaults();
    const dEl = document.getElementById('natalDate');
    const tEl = document.getElementById('natalTime');
    const sel = document.getElementById('natalCity');
    if (dEl) dEl.value = def.date;
    if (tEl) tEl.value = def.time || '';
    if (sel) sel.value = def.city || 'abidjan';
    if (def.city === 'manual') {
      if (def.lat != null) document.getElementById('natalLat').value = def.lat;
      if (def.lon != null) document.getElementById('natalLon').value = def.lon;
      if (def.tzOff != null) document.getElementById('natalTz').value = String(def.tzOff);
    }
    syncNatalManual();
    return def;
  }
  function syncNatalManual() {
    const sel = document.getElementById('natalCity');
    const man = document.getElementById('natalManual');
    if (sel && man) man.hidden = sel.value !== 'manual';
    const dEl = document.getElementById('natalDate');
    const words = document.getElementById('natalDateWords');
    const d = dEl && parseYMD(dEl.value);
    if (words) words.textContent = d ? fmtDate(d) : '';
  }

  let natalLast = null;
  function renderNatal(inp, who) {
    const out = document.getElementById('natalOut');
    if (!out) return;
    const res = inp && !inp.error ? natalCompute(inp) : null;
    const whoEl = document.getElementById('natalWho');
    const list = document.getElementById('natalList');
    const note = document.getElementById('natalAscNote');
    const wheel = document.getElementById('natalWheel');
    if (!res) {
      if (whoEl) whoEl.textContent = ASTRO ? t('Indique une date de naissance') : t('Calcul indisponible sur cet appareil.');
      if (list) list.innerHTML = '';
      if (wheel) wheel.innerHTML = '';
      return;
    }
    natalLast = { inp: inp, res: res, who: who };
    if (whoEl) {
      const offH = inp.offMin / 60;
      const offTxt = 'UTC' + (offH >= 0 ? '+' : '−') + Math.abs(offH).toString().replace('.5', ':30');
      whoEl.innerHTML = (who ? '<strong>' + escapeHtml(who) + '</strong> · ' : '') + escapeHtml(fmtDate(inp.d)) +
        (inp.hasTime ? ' · ' + escapeHtml(inp.time) + ' (' + offTxt + ')' : '') + ' · ' + escapeHtml(inp.placeLabel);
    }
    drawNatalWheel(wheel, res);
    if (note) {
      const msgs = [];
      if (!inp.hasTime) msgs.push(t('Heure inconnue : ascendant et maisons non calculés. Planètes calculées pour midi.'));
      else if (!inp.hasPlace) msgs.push(t('Lieu inconnu : ascendant et maisons non calculés.'));
      if (!inp.hasTime) {
        const moon = res.planets[1].lon % 30;
        if (moon < 6.6 || moon > 23.4) msgs.push(t('Sans l’heure, la Lune peut se trouver dans le signe voisin.'));
      }
      if (res.houseSystem === 'egales') msgs.push(t('Latitude extrême : maisons égales à partir de l’ascendant.'));
      note.hidden = !msgs.length;
      note.textContent = msgs.join(' ');
    }
    if (list) {
      const items = [];
      if (res.asc != null) {
        const a = lonParts(res.asc);
        items.push(natalItem('AS', t('Ascendant'), fmtLon(res.asc), t('Maison {n}', { n: 1 }), 'Ta manière d’aborder le monde se vit ' + SIGN_STYLE[a.sign] + '.', 'is-angle'));
        const m = lonParts(res.mc);
        items.push(natalItem('MC', t('Milieu du ciel'), fmtLon(res.mc), t('Maison {n}', { n: 10 }), 'Ta direction de vie se vit ' + SIGN_STYLE[m.sign] + '.', 'is-angle'));
      }
      res.planets.forEach((p, i) => {
        const b = NATAL_BODIES[i];
        const lp = lonParts(p.lon);
        const sub = [];
        if (res.cusps) sub.push(t('Maison {n}', { n: houseOf(p.lon, res.cusps) }));
        if (p.retro) sub.push(t('rétrograde'));
        if (b.slow) sub.push(t('planète lente, commune à une génération'));
        items.push(natalItem(b.glyph + '\uFE0E', t(b.fr), fmtLon(p.lon), sub.join(' · '), b.theme + ' se vit ' + SIGN_STYLE[lp.sign] + '.', ''));
      });
      list.innerHTML = items.join('');
    }
  }
  function natalItem(glyph, name, pos, sub, meaning, cls) {
    return '<li class="nl-item ' + cls + '"><span class="nl-glyph" aria-hidden="true">' + glyph + '</span>' +
      '<span class="nl-txt"><span class="nl-line"><strong>' + escapeHtml(name) + '</strong><span class="nl-pos">' + escapeHtml(pos) + '</span></span>' +
      (sub ? '<span class="nl-sub">' + escapeHtml(sub) + '</span>' : '') +
      '<span class="nl-mean">' + escapeHtml(meaning) + '</span></span></li>';
  }

  function drawNatalWheel(svg, res) {
    if (!svg) return;
    const C = 170;
    const R0 = 162;
    const R1 = 134;
    const R2 = 92;
    const R3 = 60;
    const ref = res.asc != null ? res.asc : 0;
    const ang = (lon) => ((180 + (lon - ref)) * Math.PI) / 180;
    const P = (lon, r) => [C + r * Math.cos(ang(lon)), C - r * Math.sin(ang(lon))];
    const f = (n) => n.toFixed(1);
    let g = '<desc id="natalWheelDesc">' + escapeHtml(t('Roue du thème natal')) + '</desc>';
    g += '<circle cx="' + C + '" cy="' + C + '" r="' + R0 + '" class="nw-bg"/>';
    // Secteurs des signes
    for (let s = 0; s < 12; s++) {
      const a0 = s * 30;
      const a1 = a0 + 30;
      const p0 = P(a0, R0), p1 = P(a1, R0), q1 = P(a1, R1), q0 = P(a0, R1);
      g += '<path class="nw-sign ' + (s % 2 ? 'alt' : '') + ' el-' + SIGNS[s].el.toLowerCase() + '" d="M' + f(p0[0]) + ' ' + f(p0[1]) +
        ' A' + R0 + ' ' + R0 + ' 0 0 0 ' + f(p1[0]) + ' ' + f(p1[1]) + ' L' + f(q1[0]) + ' ' + f(q1[1]) +
        ' A' + R1 + ' ' + R1 + ' 0 0 1 ' + f(q0[0]) + ' ' + f(q0[1]) + 'Z"/>';
      const gp = P(a0 + 15, (R0 + R1) / 2);
      g += '<text class="nw-glyph" x="' + f(gp[0]) + '" y="' + f(gp[1]) + '">' + SIGNS[s].glyph + '</text>';
    }
    // Graduations tous les 5°
    for (let d = 0; d < 360; d += 5) {
      const a = P(d, R1), b = P(d, R1 - (d % 30 === 0 ? 0 : d % 10 === 0 ? 5 : 3));
      if (d % 30) g += '<line class="nw-tick" x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '"/>';
    }
    g += '<circle cx="' + C + '" cy="' + C + '" r="' + R1 + '" class="nw-ring"/>';
    g += '<circle cx="' + C + '" cy="' + C + '" r="' + R2 + '" class="nw-ring thin"/>';
    g += '<circle cx="' + C + '" cy="' + C + '" r="' + R3 + '" class="nw-core"/>';
    // Maisons
    if (res.cusps) {
      res.cusps.forEach((c, i) => {
        const angle = i === 0 || i === 3 || i === 6 || i === 9;
        const a = P(c, R3), b = P(c, angle ? R0 + 2 : R1);
        g += '<line class="nw-cusp' + (angle ? ' angle' : '') + '" x1="' + f(a[0]) + '" y1="' + f(a[1]) + '" x2="' + f(b[0]) + '" y2="' + f(b[1]) + '"/>';
        const next = res.cusps[(i + 1) % 12];
        const mid = c + n360(next - c) / 2;
        const hp = P(mid, R3 + 13);
        g += '<text class="nw-house" x="' + f(hp[0]) + '" y="' + f(hp[1]) + '">' + (i + 1) + '</text>';
      });
      const as = P(res.asc + 4, R2 - 10), mc = P(res.mc - 5, R2 - 10);
      g += '<text class="nw-angle" x="' + f(as[0]) + '" y="' + f(as[1]) + '">AS</text>';
      g += '<text class="nw-angle" x="' + f(mc[0]) + '" y="' + f(mc[1]) + '">MC</text>';
    }
    // Aspects majeurs (centre)
    const ASPECTS = [[180, 'opp'], [120, 'tri'], [90, 'sq'], [60, 'sex']];
    const pl = res.planets;
    for (let i = 0; i < pl.length; i++) {
      for (let j = i + 1; j < pl.length; j++) {
        let dlt = Math.abs(pl[i].lon - pl[j].lon);
        if (dlt > 180) dlt = 360 - dlt;
        const lum = i < 2 || j < 2;
        for (const [a, k] of ASPECTS) {
          if (Math.abs(dlt - a) <= (lum ? 7 : 5)) {
            const p1 = P(pl[i].lon, R3), p2 = P(pl[j].lon, R3);
            g += '<line class="nw-asp ' + k + '" x1="' + f(p1[0]) + '" y1="' + f(p1[1]) + '" x2="' + f(p2[0]) + '" y2="' + f(p2[1]) + '"/>';
            break;
          }
        }
      }
    }
    // Planètes (écartées si trop proches)
    const order = pl.map((p, i) => ({ i: i, lon: p.lon, disp: p.lon })).sort((a, b) => a.lon - b.lon);
    const MIN = 10;
    for (let pass = 0; pass < 30; pass++) {
      let moved = false;
      for (let k = 0; k < order.length; k++) {
        const a = order[k], b = order[(k + 1) % order.length];
        let gap = n360(b.disp - a.disp);
        if (order.length > 1 && gap < MIN) {
          const push = (MIN - gap) / 2;
          a.disp = n360(a.disp - push);
          b.disp = n360(b.disp + push);
          moved = true;
        }
      }
      if (!moved) break;
    }
    order.forEach((o) => {
      const p = pl[o.i];
      const t0 = P(p.lon, R1), t1 = P(p.lon, R1 - 7);
      g += '<line class="nw-ptick" x1="' + f(t0[0]) + '" y1="' + f(t0[1]) + '" x2="' + f(t1[0]) + '" y2="' + f(t1[1]) + '"/>';
      const gp = P(o.disp, (R1 + R2) / 2 + 2);
      if (Math.abs(n360(o.disp - p.lon + 180) - 180) > 1.5) {
        g += '<line class="nw-lead" x1="' + f(t1[0]) + '" y1="' + f(t1[1]) + '" x2="' + f(P(o.disp, R1 - 13)[0]) + '" y2="' + f(P(o.disp, R1 - 13)[1]) + '"/>';
      }
      g += '<text class="nw-planet" x="' + f(gp[0]) + '" y="' + f(gp[1]) + '">' + NATAL_BODIES[o.i].glyph + '\uFE0E</text>';
      if (p.retro) g += '<text class="nw-retro" x="' + f(gp[0] + 8) + '" y="' + f(gp[1] + 8) + '">r</text>';
    });
    g += '<path class="nw-center" d="' + starPath(C, C, 4, 9, 3) + '"/>';
    svg.innerHTML = g;
    const desc = res.planets.map((p, i) => t(NATAL_BODIES[i].fr) + ' ' + fmtLon(p.lon)).join(', ') +
      (res.asc != null ? ', ' + t('Ascendant') + ' ' + fmtLon(res.asc) : '');
    svg.setAttribute('aria-label', t('Roue du thème natal') + ' : ' + desc);
  }

  function natalWho(def) {
    if (def && def.demo) return t('Exemple : Aïcha');
    const p = loadLastProfile();
    if (def && def.fromProfile && p && p.firstName) return p.firstName;
    return '';
  }

  function bindNatal() {
    const form = document.getElementById('natalForm');
    if (!form) return;
    fillNatalForm();
    const def = applyNatalDefaults();
    const sel = document.getElementById('natalCity');
    if (sel) sel.addEventListener('change', syncNatalManual);
    const dEl = document.getElementById('natalDate');
    if (dEl) dEl.addEventListener('change', syncNatalManual);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = natalInputFromForm();
      if (inp.error) { toast(inp.error); return; }
      writeJson(NATAL_KEY, { date: inp.date, time: inp.time, city: inp.city, lat: inp.lat, lon: inp.lon, tzOff: inp.tzOff });
      renderNatal(inp, '');
      toast('Ton thème natal est prêt ✦');
      const out = document.getElementById('natalOut');
      if (out) out.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    });
    renderNatal(natalInputFromForm(), natalWho(def));
  }

  /* —— Ciel du jour : planètes calculées (astronomy-engine) —— */
  function planetSignAt(key, utcMs) {
    if (!ASTRO) return null;
    const tm = ASTRO.MakeTime(new Date(utcMs));
    let l;
    if (key === 'Sun') l = ASTRO.SunPosition(tm).elon;
    else if (key === 'Moon') l = ASTRO.EclipticGeoMoon(tm).lon;
    else l = ASTRO.Ecliptic(ASTRO.GeoVector(key, tm, true)).elon;
    return Math.floor(n360(l) / 30);
  }
  function renderPositionsV13() {
    const box = document.getElementById('positionsList');
    if (box && ASTRO) {
      const ms = noonUtc(productToday());
      box.innerHTML = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].map((k) => {
        const b = NATAL_BODIES.find((x) => x.key === k);
        return '<span class="k">' + escapeHtml(t(b.fr)) + '</span><span class="v">' + escapeHtml(t('en {s}', { s: t(SIGNS[planetSignAt(k, ms)].fr) })) + '</span>';
      }).join('');
    }
    const list = document.getElementById('skyList');
    const el = document.getElementById('skyDate');
    if (list && el && ASTRO) {
      const d = parseYMD(el.value) || productToday();
      const ms = noonUtc(d);
      list.querySelectorAll('.v13-row').forEach((n) => n.remove());
      ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].forEach((k) => {
        const b = NATAL_BODIES.find((x) => x.key === k);
        const kk = document.createElement('span');
        kk.className = 'k v13-row';
        kk.textContent = t(b.fr);
        const vv = document.createElement('span');
        vv.className = 'v v13-row';
        vv.textContent = t('en {s}', { s: t(SIGNS[planetSignAt(k, ms)].fr) });
        list.appendChild(kk);
        list.appendChild(vv);
      });
      const note = document.getElementById('skyNote');
      if (note) note.textContent = t('Soleil, Lune et planètes calculés sur le téléphone (bibliothèque astronomy-engine).');
    }
    const glyph = document.querySelector('#view-astro .moon-glyph');
    if (glyph) glyph.innerHTML = moonIconSvg(todayMoonIdx(), 30);
  }

  /* —— Hub : rituel du jour (respecte les verrous) —— */
  function renderRituel() {
    const box = document.getElementById('rituelList');
    if (!box) return;
    const dateEl = document.getElementById('rituelDate');
    if (dateEl) dateEl.textContent = fmtDate(productToday(), { weekday: true, year: false });
    const astro = canAccessAstro();
    const cycle = canAccessCycle();
    const st = tarotState();
    const phase = currentCyclePhase();
    const moonIdx = todayMoonIdx();
    const prompt = promptList(productToday()).list[0];
    const rows = [
      {
        id: 'tarot', screen: 'astro', sub: 'tarot', locked: !astro, lockLabel: 'Forfait Astrologie', done: st.flipped,
        ico: '<span class="ri-card" aria-hidden="true">' + (st.flipped && astro ? tarotFrontSvg(st.card) : tarotBackSvg()) + '</span>',
        title: 'Tarot du jour',
        text: st.flipped ? ROMAN[st.card] + ' · ' + t(TAROT[st.card].name) : t('Ta carte t’attend, retourne-la'),
      },
      {
        id: 'medit-cycle', screen: 'cycle', sub: 'meditation', locked: !cycle, lockLabel: 'Forfait Cycle menstruel', done: breathDone.cycle,
        ico: '<span class="ri-ico ph-' + phase + '">' + icon('i-breath') + '</span>',
        title: 'Méditation de phase',
        text: t(PHASE_META[phase].full) + ' · ' + t(MEDIT_CYCLE[phase].title),
      },
      {
        id: 'medit-moon', screen: 'astro', sub: 'meditation', locked: !astro, lockLabel: 'Forfait Astrologie', done: breathDone.moon,
        ico: '<span class="ri-ico ri-moon">' + moonIconSvg(moonIdx, 26) + '</span>',
        title: 'Méditation lunaire',
        text: t(MOON_NAMES[moonIdx]) + ' · ' + t(MEDIT_MOON[moonIdx].title),
      },
      {
        id: 'question', screen: 'journal', sub: 'question', locked: !cycle, lockLabel: 'Forfait Cycle menstruel', done: false,
        ico: '<span class="ri-ico">' + icon('i-question') + '</span>',
        title: 'Question du jour',
        text: t(prompt),
      },
    ];
    box.innerHTML = rows.map((r) =>
      '<button type="button" class="rituel-row' + (r.locked ? ' is-locked' : '') + (r.done && !r.locked ? ' is-done' : '') + '" data-rscreen="' + r.screen + '" data-rsub="' + r.sub + '">' +
        r.ico +
        '<span class="ri-txt"><span class="ri-title">' + escapeHtml(t(r.title)) +
          (r.done && !r.locked ? '<span class="ri-done">' + escapeHtml(t('fait')) + '</span>' : '') + '</span>' +
          '<span class="ri-sub">' + (r.locked ? icon('i-lock', 'ri-lock') + escapeHtml(t(r.lockLabel)) : escapeHtml(r.text)) + '</span></span>' +
        icon('i-chev', 'ri-chev') +
      '</button>'
    ).join('');
  }

  /* Sous-sections atteignables par lien : #/astro/tarot, #/cycle/meditation, #/astro/natal… */
  const SUB_SECTIONS = {
    astro: { tarot: 'secTarot', meditation: 'secMeditMoon', natal: 'secNatal', horoscope: 'secHoroscope', compatibilite: 'secCompat' },
    cycle: { meditation: 'secMeditCycle', conseils: 'secConseils', agenda: 'secAgenda', historique: 'secHistory' },
    journal: { question: 'promptCard' },
  };
  function scrollToSubHash() {
    const parts = (location.hash || '').replace(/^#\/?/, '').split('/');
    if (parts.length < 2 || !parts[1]) return;
    const map = SUB_SECTIONS[parts[0]];
    const id = map && map[parts[1]];
    const view = document.querySelector('.view.active');
    if (!id || !view || view.dataset.screen !== parts[0]) return;
    const el = document.getElementById(id);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'auto', block: 'start' }), 30);
  }
  function goSection(screen, sub) {
    const next = '#/' + screen + '/' + sub;
    if (location.hash === next) {
      show(screen);
      scrollToSubHash();
    } else {
      location.hash = next;
    }
  }

  function bindRituel() {
    const box = document.getElementById('rituelList');
    if (!box) return;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rscreen]');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      goSection(b.dataset.rscreen, b.dataset.rsub);
    });
  }

  function deleteAstroData() {
    const ok = window.confirm(t('Supprimer tes données astro ?\n\nTirage de tarot et thème natal enregistrés sur ce téléphone seront effacés. Ton forfait ne change pas.'));
    if (!ok) return;
    ASTRO_DATA_KEYS.forEach((k) => {
      try { localStorage.removeItem(k); } catch (_) { /* ignore */ }
    });
    const def = applyNatalDefaults();
    renderNatal(natalInputFromForm(), natalWho(def));
    renderTarot();
    renderRituel();
    toast('Données astro supprimées');
  }

  function bindV13() {
    bindTarot();
    bindBreath();
    bindMedit();
    bindNatal();
    bindRituel();
    const del = document.getElementById('btnDeleteAstroData');
    if (del) del.addEventListener('click', deleteAstroData);
  }

  function renderAllV13() {
    renderTarot();
    renderMeditCycle();
    renderMeditMoon();
    document.querySelectorAll('[data-breath]').forEach((r) => buildBreath(r));
    renderPositionsV13();
    fillNatalForm();
    syncNatalManual();
    if (natalLast) renderNatal(natalLast.inp, natalLast.who);
    renderRituel();
    frNoteSync();
  }

  function init() {
    currentLang = getLang();
    document.documentElement.lang = (I18N && (I18N.LANGS.find((l) => l.code === currentLang) || {}).html) || 'fr';
    document.querySelectorAll('#symptomList .symptom-item').forEach((item) => {
      item.dataset.fr = item.textContent.trim();
    });
    document.querySelectorAll('#moodChips .chip').forEach((c) => {
      c.setAttribute('aria-pressed', c.classList.contains('selected') ? 'true' : 'false');
    });
    document.querySelectorAll('#energySlider button').forEach((b) => {
      b.setAttribute('aria-pressed', b.classList.contains('selected') ? 'true' : 'false');
    });
    buildPicker();
    buildCycleCalendar(document.getElementById('cycleCalendar'));
    buildMoonCalendar(document.getElementById('moonCalendar'));
    bindClicks();
    bindCalculator();
    bindReading();
    bindResetPerson();
    bindConsent();
    bindDataAndMarket();
    bindCycleV12();
    bindJournalV12();
    bindAstroV12();
    bindV13();
    const skyD = document.getElementById('skyDate');
    if (skyD) skyD.addEventListener('change', renderPositionsV13);
    const skyT = document.getElementById('btnSkyToday');
    if (skyT) skyT.addEventListener('click', renderPositionsV13);
    fillLangSelects();
    renderProductSurfaces();
    renderConsentStatus();
    renderJournalHistory();
    registerServiceWorker();
    tickClock();
    setInterval(tickClock, 30000);

    window.addEventListener('hashchange', () => {
      stopBreath(false);
      if (parseHash() === 'today') renderRituel();
      show(parseHash());
      scrollToSubHash();
    });
    const initial = parseHash();
    setLang(currentLang, true);
    show(initial);
    if (!location.hash) location.hash = '#/' + initial;
    else scrollToSubHash();

    // Expose demo for console inspection
    window.CycleAstroDemo = DEMO;
    window.CycleAstroCalc = computeCalc;
    window.CycleAstroReset = resetCurrentPerson;
    window.CycleAstroReading = {
      lifePathFromDate: lifePathFromDate,
      dayVibeFromDate: dayVibeFromDate,
      sunSignDecan: sunSignDecan,
      buildReading: buildReading,
      PERSONAS: PERSONAS,
      renderKrizouaVerbatim: renderKrizouaVerbatim,
      KRIZOUA_VERBATIM_TEXT: KRIZOUA_VERBATIM_TEXT,
    };
    /* Pont paiement / Market : set() uniquement après paiement réel — jamais depuis l’UI. */
    window.CycleAstroPlan = {
      get: getPlan,
      set: setPlan,
      canAccessAstro: canAccessAstro,
      canAccessCycle: canAccessCycle,
      key: PLAN_KEY,
      values: PLAN_VALUES.slice(),
    };
    window.CycleAstroApp = {
      version: APP_VERSION,
      marketUrl: MARKET_URL,
      setLang: setLang,
      getLang: () => currentLang,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
