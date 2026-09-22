/**
 * Cycle & Astro — maquettes HF P0
 * Navigation hash légère + données démo (pas de backend)
 * King Daveblessing · Abidjan · FR
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
      title: 'L’élan / le pionnier',
      paras: [
        'Ton chemin de vie 1 évoque l’initiative, le courage de commencer et la capacité à tracer ta propre voie. Ce n’est pas une injonction à tout porter seul·e : c’est une invitation à honorer ton élan intérieur.',
        'Beaucoup de personnes sur ce chemin ressentent un besoin d’autonomie et de clarté. Explorer le 1, c’est oser le premier pas — puis laisser la place à la collaboration quand elle nourrit le projet.',
        'Tu restes libre : le 1 est une boussole, pas un destin figé.',
      ],
      invites: [
        'Nommer un projet qui n’attend que ton premier pas.',
        'Équilibrer leadership et écoute.',
        'Célébrer les petits démarrages, sans attendre la perfection.',
        'Te rappeler que l’élan se repose aussi.',
      ],
      gifts: ['Initiative', 'Vision claire', 'Leadership doux', 'Autonomie'],
    },
    2: {
      title: 'L’harmonie / la coopération',
      paras: [
        'Ton chemin de vie 2 évoque la coopération, la sensibilité relationnelle et l’art de tisser des ponts. Ce n’est pas une obligation d’effacement : c’est une invitation à l’alliance juste.',
        'La diplomatie, l’écoute et le timing peuvent être des alliés puissants. Explorer le 2, c’est aussi apprendre à poser des limites douces pour ne pas te perdre dans l’autre.',
        'Tu restes libre : le 2 est une carte, pas un contrat.',
      ],
      invites: [
        'Honorer ta capacité à créer du lien.',
        'Pratiquer le « non » bienveillant quand tu en as besoin.',
        'Choisir des partenariats qui te nourrissent vraiment.',
        'Laisser la sensibilité être une force, pas un fardeau.',
      ],
      gifts: ['Diplomatie', 'Écoute', 'Médiation', 'Sens du timing'],
    },
    3: {
      title: 'L’expression / la créativité',
      paras: [
        'Ton chemin de vie 3 évoque une boussole tournée vers la parole, la créativité et le lien. Ce n’est pas une obligation de « performer » : c’est une invitation à laisser circuler ce qui cherche à s’exprimer — idées, humour, présence, projets partagés.',
        'Beaucoup de personnes sur ce chemin ressentent un besoin naturel de communiquer, d’inspirer, de mettre de la lumière dans les échanges. La joie et la légèreté peuvent être des alliées — sans nier les jours plus discrets, où le silence aussi nourrit la créativité.',
        'Explorer ce chemin, c’est aussi apprendre à canaliser l’élan : trop de directions à la fois disperse ; une expression claire et incarnée, au contraire, devient un véritable cadeau pour toi et pour les autres.',
        'Tu restes libre : le 3 est une carte, pas un contrat. Tu choisis comment l’habiter.',
      ],
      invites: [
        'Cultiver une expression authentique — sans forcer le spectacle.',
        'Canaliser la créativité dans un format concret (voix, écrit, atelier).',
        'Partager sans te vider : rythme et récupération comptent.',
        'Laisser la joie être une stratégie, pas une façade.',
        'Te rappeler : ceci est une boussole, pas un destin figé.',
      ],
      gifts: ['Communication', 'Créativité', 'Inspiration', 'Présence relationnelle'],
    },
    4: {
      title: 'La structure / la fondation',
      paras: [
        'Ton chemin de vie 4 évoque la structure, la fiabilité et le goût de bâtir concrètement. Ce n’est pas une prison de routines : c’est une invitation à poser des fondations qui te soutiennent.',
        'La méthode et la constance peuvent libérer autant que contraindre — quand elles servent ton bien-être et tes projets vivants.',
        'Tu restes libre : le 4 est une boussole, pas un destin figé.',
      ],
      invites: [
        'Construire une routine qui te nourrit vraiment.',
        'Distinguer solidité et rigidité.',
        'Honorer le travail invisible qui porte les résultats.',
        'Laisser de la place à l’imprévu sans tout faire basculer.',
      ],
      gifts: ['Organisation', 'Fiabilité', 'Méthode', 'Persévérance'],
    },
    5: {
      title: 'Le mouvement / la liberté',
      paras: [
        'Ton chemin de vie 5 évoque le mouvement, la curiosité et le besoin d’espace. Ce n’est pas une fuite permanente : c’est une invitation à respirer et à apprendre par l’expérience.',
        'Explorer le 5, c’est aussi trouver des ancres mobiles — des rituels légers qui te suivent dans le change.',
        'Tu restes libre : le 5 est une carte, pas un contrat.',
      ],
      invites: [
        'Nourrir ta curiosité sans te disperser.',
        'Choisir des libertés responsables.',
        'Créer des ancres simples (corps, journal, amitiés).',
        'Accueillir le changement comme information, pas comme menace.',
      ],
      gifts: ['Adaptabilité', 'Curiosité', 'Communication vive', 'Exploration'],
    },
    6: {
      title: 'Le soin / la responsabilité douce',
      paras: [
        'Ton chemin de vie 6 évoque le soin, la responsabilité douce et l’harmonie du foyer — au sens large. Ce n’est pas une obligation de tout porter : c’est une invitation à aimer sans t’oublier.',
        'La présence et la beauté du quotidien peuvent être des arts. Explorer le 6, c’est aussi recevoir autant que donner.',
        'Tu restes libre : le 6 est une boussole, pas un destin figé.',
      ],
      invites: [
        'Soigner ton espace et tes liens, y compris avec toi.',
        'Poser des limites affectueuses.',
        'Partager la charge — émotionnelle et concrète.',
        'Laisser la beauté entrer dans le quotidien.',
      ],
      gifts: ['Empathie', 'Soutien', 'Harmonie', 'Sens du devoir juste'],
    },
    7: {
      title: 'La profondeur / l’introspection',
      paras: [
        'Ton chemin de vie 7 évoque la profondeur, l’analyse et le besoin de silence intérieur. Ce n’est pas un retrait forcé : c’est une invitation à honorer ton monde intérieur.',
        'L’intuition et la recherche de sens peuvent guider — sans dogmatisme. Explorer le 7, c’est aussi revenir au monde avec des insights utiles.',
        'Tu restes libre : le 7 est une carte, pas un contrat.',
      ],
      invites: [
        'Préserver des plages de solitude nourrissante.',
        'Partager tes insights quand tu es prêt·e.',
        'Relier spiritualité / analyse à du concret.',
        'Te méfier du perfectionnisme mental.',
      ],
      gifts: ['Analyse', 'Intuition', 'Recherche', 'Discernement'],
    },
    8: {
      title: 'La maîtrise / l’abondance',
      paras: [
        'Ton chemin de vie 8 évoque la maîtrise, l’abondance et la responsabilité — des axes à explorer, librement. Ce n’est pas un destin figé : juste une boussole.',
        'Beaucoup de personnes sur ce chemin ressentent un appel à structurer, diriger avec cœur, et faire circuler les ressources. L’ambition juste se cultive aussi dans le repos.',
        'Explorer le 8, c’est choisir la maîtrise de soi avant la maîtrise des autres — et voir l’abondance comme circulation, pas comme pression.',
        'Tu restes libre : le 8 est une carte, pas un contrat.',
      ],
      invites: [
        'Honorer ta capacité à structurer et à diriger avec cœur.',
        'Équilibrer ambition et repos — la force se cultive aussi dans le calme.',
        'Voir l’abondance comme circulation, pas comme pression.',
        'Choisir la maîtrise de soi avant la maîtrise des autres.',
      ],
      gifts: ['Leadership', 'Stratégie', 'Gestion', 'Impact'],
    },
    9: {
      title: 'L’humanisme / le grand cœur',
      paras: [
        'Ton chemin de vie 9 évoque l’humanisme, la compassion et la vision large. Ce n’est pas un devoir de sauver le monde : c’est une invitation à contribuer à ta mesure.',
        'Les fins de cycle, le lâcher-prise et la générosité peuvent être des thèmes vivants. Explorer le 9, c’est aussi t’inclure dans la compassion que tu offres.',
        'Tu restes libre : le 9 est une boussole, pas un destin figé.',
      ],
      invites: [
        'Contribuer sans t’épuiser.',
        'Clôturer ce qui est achevé pour faire de la place.',
        'Laisser la compassion commencer par toi.',
        'Relier idéal et actions concrètes, petites mais vraies.',
      ],
      gifts: ['Compassion', 'Vision', 'Transmission', 'Ouverture'],
    },
  };

  const DAY_VIBE_COPY = {
    1: 'Initiative, démarrer, oser le premier pas — une vibration de commencement.',
    2: 'Écoute, diplomatie, tisser des liens — une vibration de coopération.',
    3: 'Expression, joie, partage créatif — une vibration de communication.',
    4: 'Stabilité, méthode, bâtir concrètement — une vibration de fondation.',
    5: 'Curiosité, adaptation, respiration — une vibration de mouvement.',
    6: 'Soin, présence, harmonie relationnelle — une vibration de responsabilité douce.',
    7: 'Silence intérieur, analyse, intuition — une vibration de profondeur.',
    8: 'Ambition juste, responsabilité, impact — une vibration de maîtrise.',
    9: 'Compassion, clôture, vision large — une vibration d’ouverture.',
  };

  const SIGN_COPY = {
    Bélier: 'Élan, courage, franchise. Invitation à démarrer sans brûler les étapes.',
    Taureau: 'Ancrage, sensualité, constance. Invitation à bâtir dans la durée.',
    Gémeaux: 'Curiosité, verbe, mobilité mentale. Invitation à relier les idées.',
    Cancer: 'Sensibilité, protection, mémoire du cœur. Invitation à sécuriser sans enfermer.',
    Lion: 'Rayonnement, créativité, fierté saine. Invitation à briller sans dominer.',
    Vierge: 'Discernement, soin du détail, service juste. Invitation à perfectionner sans se juger.',
    Balance: 'Équilibre, esthétique relationnelle, diplomatie. Invitation à choisir après avoir écouté.',
    Scorpion: 'Intensité, transformation, loyauté profonde. Invitation à traverser sans se consumer.',
    Sagittaire: 'Horizon, sens, enthousiasme. Invitation à explorer avec sagesse.',
    Capricorne: 'Ambition structurée, responsabilité, patience. Invitation à gravir sans se durcir.',
    Verseau: 'Originalité, vision collective, liberté d’esprit. Invitation à innover avec cœur.',
    Poissons: 'Empathie, imagination, porosité douce. Invitation à rêver en restant présent·e.',
  };

  const DECAN_NOTE = {
    1: '1er décan — teinte plus « pure » / inaugurale du signe, souvent plus directe.',
    2: '2e décan — milieu du signe, nuances de maturité et d’équilibre interne.',
    3: '3e décan — fin du signe, souvent plus affirmé·e, capable de trancher après avoir écouté.',
  };

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
      place: 'Sinfra (CI)',
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
    const invites = (path.invites || []).slice();
    if (extraInvites && extraInvites.length) {
      extraInvites.forEach((x) => {
        if (!invites.includes(x)) invites.push(x);
      });
    }
    // keep 3–5
    const finalInvites = invites.slice(0, 5);
    const gifts = giftsOverride && giftsOverride.length ? giftsOverride : path.gifts;
    return {
      name: name || 'Lecteur·rice',
      birthIso: birthIso,
      birthFr: formatBirthFr(birthIso),
      place: place || '',
      lifePath: lp,
      pathTitle: path.title,
      pathParas: path.paras,
      day: dv.day,
      dayVibe: dv.vibe,
      dayVibeText: DAY_VIBE_COPY[dv.vibe],
      sign: ss.sign,
      decan: ss.decan,
      signTraits:
        (SIGN_COPY[ss.sign] || '') +
        ' ' +
        (DECAN_NOTE[ss.decan] || ''),
      gifts: gifts,
      invites: finalInvites,
    };
  }

  function renderReading(data) {
    const out = document.getElementById('readingOutput');
    if (!out || !data) return;
    out.hidden = false;

    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    set('outName', data.name);
    set(
      'outBirthPlace',
      data.birthFr + (data.place ? ' · ' + data.place : '')
    );
    set('outLifePath', data.lifePath + ' · ' + data.pathTitle);
    set('outDayVibe', data.day + ' → ' + data.dayVibe);
    set('outSignDecan', data.sign + ' · ' + data.decan + 'e décan');
    set('outPathNum', String(data.lifePath));
    set('outPathTitle', data.pathTitle);

    const body = document.getElementById('outPathBody');
    if (body) {
      body.innerHTML = data.pathParas
        .map((p) => '<p class="body" style="margin-bottom:10px;">' + p + '</p>')
        .join('');
    }

    set('outVibeNum', 'Vibration ' + data.dayVibe);
    set('outVibeText', data.dayVibeText);
    set('outSignLine', data.sign + ' · ' + data.decan + 'e décan');
    set('outSignTraits', data.signTraits);

    const gifts = document.getElementById('outGifts');
    if (gifts) {
      gifts.innerHTML = data.gifts.map((g) => '<li>' + g + '</li>').join('');
    }
    const invites = document.getElementById('outInvites');
    if (invites) {
      invites.innerHTML = data.invites.map((g) => '<li>' + g + '</li>').join('');
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

  function generateFromForm() {
    const name = (document.getElementById('readName') || {}).value || '';
    const birth = (document.getElementById('readBirth') || {}).value || '';
    const place = (document.getElementById('readPlace') || {}).value || '';
    if (!birth) {
      toast('Indique une date de naissance');
      return;
    }
    // Detect krizoua hardcode gifts if matches
    let gifts = null;
    let extra = null;
    const k = PERSONAS.krizoua;
    if (
      birth === k.birth &&
      (name.trim() === k.name || name.toLowerCase().includes('krizoua'))
    ) {
      gifts = k.gifts;
      extra = k.extraInvites;
    }
    const data = buildReading(name.trim(), birth, place.trim(), gifts, extra);
    if (!data) {
      toast('Date invalide');
      return;
    }
    renderReading(data);
    toast('Lecture générée ✦');
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
        const p = PERSONAS.krizoua;
        const data = buildReading(
          p.name,
          p.birth,
          p.place,
          p.gifts,
          p.extraInvites
        );
        renderReading(data);
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
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
