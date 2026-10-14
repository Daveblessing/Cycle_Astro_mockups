/**
 * Cycle & Astro · Lune en temps réel (v1.5.0)
 * Pur, sans DOM. Calculs par astronomy-engine (vendored) : aucune table codée en dur.
 * Navigateur : window.MoonCalc (utilise window.Astronomy). Node : module.exports(A).
 * Zodiaque tropical. Lecture symbolique — pas une prédiction, pas un avis médical.
 */
(function (root) {
  'use strict';
  const SIGNS_FR = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
  const PHASES_FR = ['Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante', 'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'];
  const QUARTER_FR = ['Nouvelle lune', 'Premier quartier', 'Pleine lune', 'Dernier quartier'];
  const SYNODIC = 29.530588853;
  const LIMIT = new Date(Date.UTC(2029, 0, 1, 0, 0, 0)); // couverture garantie jusqu’au 31 déc. 2028 inclus

  const PHASE_MSG = [
    { text: 'Nouvelle lune : le ciel est sombre, c’est le moment de semer une intention simple, sans pression.', g: ['Écris une intention en une phrase.', 'Range un petit coin de ta maison.', 'Couche-toi un peu plus tôt.'] },
    { text: 'Premier croissant : une petite lumière revient. Avance d’un pas, même modeste.', g: ['Fais le premier pas d’un projet.', 'Dis oui à une idée qui te plaît.', 'Bois un grand verre d’eau au réveil.'] },
    { text: 'Premier quartier : la Lune demande un choix. Ce qui résiste montre ce qui compte pour toi.', g: ['Choisis une seule priorité aujourd’hui.', 'Règle une petite chose en attente.', 'Bouge dix minutes.'] },
    { text: 'Gibbeuse croissante : la lumière grandit. Ajuste, peaufine, nourris ce qui pousse.', g: ['Relis et améliore un travail en cours.', 'Remercie quelqu’un qui t’aide.', 'Prépare un repas nourrissant.'] },
    { text: 'Pleine lune : tout s’éclaire. Célèbre le chemin parcouru et observe ce qui se révèle.', g: ['Note trois choses accomplies ce mois-ci.', 'Prends l’air sous le ciel du soir.', 'Pardonne-toi une petite erreur.'] },
    { text: 'Gibbeuse décroissante : temps de partage et de gratitude. Transmets ce que tu as appris.', g: ['Partage un conseil avec une amie.', 'Écris un mot de gratitude.', 'Allège ton agenda d’une tâche.'] },
    { text: 'Dernier quartier : la Lune invite à trier. Laisse partir ce qui ne te sert plus.', g: ['Donne ou jette un objet inutile.', 'Dis non à une demande de trop.', 'Termine une tâche laissée de côté.'] },
    { text: 'Dernier croissant : repos et silence avant le nouveau cycle. Ralentis, écoute-toi.', g: ['Fais une pause sans écran.', 'Respire lentement trois minutes.', 'Prends un bain ou une douche tiède.'] },
  ];
  const SIGN_MSG = [
    'Lune en Bélier : élan et courage, attention à l’impatience.',
    'Lune en Taureau : besoin de confort, de beauté et de lenteur.',
    'Lune en Gémeaux : curiosité, échanges, messages à envoyer.',
    'Lune en Cancer : sensibilité, famille, douceur du foyer.',
    'Lune en Lion : envie de briller, de créer et d’être vue.',
    'Lune en Vierge : ordre, soin du corps, petits détails utiles.',
    'Lune en Balance : harmonie, relations, recherche d’équilibre.',
    'Lune en Scorpion : émotions profondes, vérité, transformation.',
    'Lune en Sagittaire : horizon, apprentissage, optimisme.',
    'Lune en Capricorne : sérieux, structure, objectifs concrets.',
    'Lune en Verseau : liberté, amitiés, idées nouvelles.',
    'Lune en Poissons : intuition, rêves, compassion.',
  ];
  const SIGN_GESTURE = [
    'Canalise ton énergie dans un sport ou une marche rapide.', 'Savoure un repas en pleine conscience.', 'Appelle une personne que tu n’as pas entendue depuis longtemps.',
    'Offre-toi un moment cocooning chez toi.', 'Fais une chose créative juste pour le plaisir.', 'Range ton sac ou ton bureau.',
    'Embellis ton espace avec une fleur ou une bougie.', 'Écris ce que tu ressens, sans te censurer.', 'Lis ou écoute quelque chose qui t’ouvre l’esprit.',
    'Planifie ta semaine en trois points.', 'Partage une idée avec un groupe ou une amie.', 'Écoute une musique douce et laisse venir les images.',
  ];
  const ASPECTS = [
    { a: 0, name: 'Conjonction Lune-Soleil', text: 'Lune et Soleil unis : cœur et volonté vont dans le même sens.' },
    { a: 60, name: 'Sextile Lune-Soleil', text: 'Sextile Lune-Soleil : une occasion facile se présente, saisis-la.' },
    { a: 90, name: 'Carré Lune-Soleil', text: 'Carré Lune-Soleil : une tension qui pousse à agir avec tact.' },
    { a: 120, name: 'Trigone Lune-Soleil', text: 'Trigone Lune-Soleil : fluidité, les choses avancent sans forcer.' },
    { a: 180, name: 'Opposition Lune-Soleil', text: 'Opposition Lune-Soleil : cherche l’équilibre entre toi et les autres.' },
  ];

  function make(A) {
    if (!A) return null;
    const n360 = (x) => ((x % 360) + 360) % 360;
    const toDate = (t) => (t && t.date ? t.date : t);

    function moonSignAt(date) { return Math.floor(n360(A.EclipticGeoMoon(date).lon) / 30); }
    function sunLonAt(date) { return n360(A.SunPosition(date).elon); }

    function state(date) {
      const angle = n360(A.MoonPhase(date)); // élongation écliptique Lune − Soleil
      const phaseIdx = Math.floor(n360(angle + 22.5) / 45) % 8;
      const illum = A.Illumination('Moon', date).phase_fraction;
      const prevNew = A.SearchMoonPhase(0, new Date(date.getTime() - 31 * 86400000), 31);
      const prevNewD = prevNew ? prevNew.date : null;
      const age = prevNewD && prevNewD <= date ? (date - prevNewD) / 86400000 : angle / 360 * SYNODIC;
      const moonLon = n360(A.EclipticGeoMoon(date).lon);
      const sunLon = sunLonAt(date);
      const sep = Math.min(angle, 360 - angle);
      let aspect = null;
      ASPECTS.forEach((x) => { if (Math.abs(sep - x.a) <= 6 && !aspect) aspect = x; });
      const q = A.SearchMoonQuarter(date);
      const nn = A.SearchMoonPhase(0, date, 40);
      const nf = A.SearchMoonPhase(180, date, 40);
      return {
        date: date, angle: angle, phaseIdx: phaseIdx, phase: PHASES_FR[phaseIdx], illum: illum, illumPct: Math.round(illum * 100),
        age: age, waxing: angle < 180, moonLon: moonLon, moonSign: Math.floor(moonLon / 30), sunSign: Math.floor(sunLon / 30),
        signFr: SIGNS_FR[Math.floor(moonLon / 30)], aspect: aspect,
        nextQuarter: { quarter: q.quarter, name: QUARTER_FR[q.quarter], date: toDate(q.time) },
        nextNew: toDate(nn), nextFull: toDate(nf),
        nextSignChange: nextSignChange(date),
      };
    }

    /** Prochaine entrée de la Lune dans un signe (recherche par pas d’1 h puis bissection). */
    function nextSignChange(date) {
      const s0 = moonSignAt(date);
      let a = date.getTime(), b = a;
      for (let i = 0; i < 80; i++) { b = a + 3600000; if (moonSignAt(new Date(b)) !== s0) break; a = b; }
      for (let i = 0; i < 20; i++) { const m = (a + b) / 2; if (moonSignAt(new Date(m)) === s0) a = m; else b = m; }
      const d = new Date(b);
      return { date: d, sign: moonSignAt(new Date(b + 60000)), signFr: SIGNS_FR[moonSignAt(new Date(b + 60000))] };
    }

    function message(st) {
      const p = PHASE_MSG[st.phaseIdx];
      const parts = [p.text, SIGN_MSG[st.moonSign]];
      if (st.aspect) parts.push(st.aspect.text);
      return { text: parts.join(' '), gestures: [p.g[0], SIGN_GESTURE[st.moonSign], p.g[2]], phaseText: p.text, signText: SIGN_MSG[st.moonSign] };
    }

    /** Quartiers (nouvelle, 1er q., pleine, dernier q.) d’un mois civil local, avec signe et message. */
    function monthQuarters(year, month) {
      const start = new Date(year, month, 1, 0, 0, 0);
      const end = new Date(year, month + 1, 1, 0, 0, 0);
      const out = [];
      let q = A.SearchMoonQuarter(new Date(start.getTime() - 86400000));
      for (let i = 0; i < 8 && q; i++) {
        const d = toDate(q.time);
        if (d >= end) break;
        if (d >= start) {
          const sg = moonSignAt(d);
          const idx = q.quarter * 2;
          out.push({ quarter: q.quarter, name: QUARTER_FR[q.quarter], date: d, sign: sg, signFr: SIGNS_FR[sg], text: PHASE_MSG[idx].text + ' ' + SIGN_MSG[sg] });
        }
        q = A.NextMoonQuarter(q);
      }
      return out;
    }

    return { state, message, monthQuarters, moonSignAt, nextSignChange, SIGNS_FR, PHASES_FR, QUARTER_FR, PHASE_MSG, SIGN_MSG, LIMIT };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = make;
  else root.MoonCalc = make(root.Astronomy);
})(typeof window !== 'undefined' ? window : this);
