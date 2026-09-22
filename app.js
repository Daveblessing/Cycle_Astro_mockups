/**
 * Cycle & Astro · v3.3
 * Navigation hash légère + données démo (pas de backend)
 * King Daveblessing · Abidjan · FR · polish premium / manipulation simple
 */
(function () {
  'use strict';

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
    'reading',
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
    reading: 'today',
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
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  function rippleAt(el, evt) {
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
      name: 'Aïcha',
      birth: '1998-09-17',
      place: 'Abidjan (CI)',
      gifts: null, // from path defaults
    },
    krizoua: {
      name: 'Krizoua Yako Jean',
      birth: '1983-10-17',
      place: 'Sinfra (Côte d\'Ivoire)',
      gifts: ['Relations publiques (RP)', 'Négociation', 'Coaching', 'Stratégie'],
      // Extra invites for KD example (merge with path)
      extraInvites: [
        'Associer créativité (3) et structure / impact (8) dans tes projets.',
        'Utiliser ton sens relationnel Balance pour ouvrir des portes, pas pour t’oublier.',
        'Explorer le coaching / la stratégie comme terrains naturels de ton 3+8.',
      ],
    },
  };

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

  function buildReading(name, birthIso, place, giftsOverride, extraInvites) {
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

    return {
      name: name || 'Lecteur·rice',
      birthIso: birthIso,
      birthFr: formatBirthFr(birthIso),
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

    set('outName', data.name);
    set(
      'outBirthPlace',
      data.birthFr + (data.place ? ' · ' + data.place : '')
    );
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
        '</div>' +
        '<div class="read-sec">' +
        '<h4 class="read-subh">Forces</h4>' +
        ulHtml(data.strengths, 'read-bullets') +
        '</div>' +
        '<div class="read-sec">' +
        '<h4 class="read-subh">Défis / ombres — et comment les transformer</h4>' +
        ulHtml(data.shadows, 'read-bullets') +
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

    // legacy invites container if still present
    const invites = document.getElementById('outInvites');
    if (invites) {
      invites.innerHTML = (data.weekPlan || data.invites || [])
        .map((g) => '<li>' + escapeHtml(g) + '</li>')
        .join('');
    }

    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function fillReadingForm(personaKey) {
    const p = PERSONAS[personaKey] || PERSONAS.aicha;
    const nameEl = document.getElementById('readName');
    const birthEl = document.getElementById('readBirth');
    const placeEl = document.getElementById('readPlace');
    if (nameEl) nameEl.value = p.name;
    if (birthEl) birthEl.value = p.birth;
    if (placeEl) placeEl.value = p.place;
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
      try { done(); } finally {
        if (loading) loading.hidden = true;
        if (formCard) formCard.style.opacity = '';
        if (btn) btn.disabled = false;
      }
    }, 280);
  }

  function generateFromForm() {
    const name = (document.getElementById('readName') || {}).value || '';
    const birth = (document.getElementById('readBirth') || {}).value || '';
    const place = (document.getElementById('readPlace') || {}).value || '';
    if (!birth) {
      toast('Indique une date de naissance');
      return;
    }
    const k = PERSONAS.krizoua;
    // Exemple KD : texte Dave verbatim — pas de reconstruction
    if (
      birth === k.birth &&
      (name.trim() === k.name || name.toLowerCase().includes('krizoua'))
    ) {
      withReadingLoading(() => {
        setPersonaActive('krizoua');
        renderKrizouaVerbatim();
        toast('Exemple KD · Krizoua ✦');
      });
      return;
    }
    const data = buildReading(name.trim(), birth, place.trim(), null, null);
    if (!data) {
      toast('Date invalide');
      return;
    }
    withReadingLoading(() => {
      setPersonaActive('aicha');
      renderReading(data);
      toast('Lecture générée ✦');
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
        const data = buildReading(p.name, p.birth, p.place, null, null);
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

    // Default: Aïcha filled, output hidden until generate OR auto on first visit
    fillReadingForm('aicha');
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
      const results = document.getElementById('calcResults');
      if (results) results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      toast('Estimation mise à jour ✦');
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
      reading: '8 · Lecture complète',
      journal: '9 · Journal',
      profile: '10 · Profil',
      calculator: '11 · Calculateur',
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
    bindReading();
    tickClock();
    setInterval(tickClock, 30000);

    window.addEventListener('hashchange', () => show(parseHash()));
    const initial = parseHash();
    show(initial);
    if (!location.hash) location.hash = '#/' + initial;

    // Expose demo for console inspection
    window.CycleAstroDemo = DEMO;
    window.CycleAstroReading = {
      lifePathFromDate: lifePathFromDate,
      dayVibeFromDate: dayVibeFromDate,
      sunSignDecan: sunSignDecan,
      buildReading: buildReading,
      PERSONAS: PERSONAS,
      renderKrizouaVerbatim: renderKrizouaVerbatim,
      KRIZOUA_VERBATIM_TEXT: KRIZOUA_VERBATIM_TEXT,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
