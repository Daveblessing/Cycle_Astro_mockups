/* Cycle & Astro — moteur i18n v1.7.0 (piloté par les données).
 * Les langues sont décrites dans i18n/langs.js (code, nom, label, html, dir) et chaque langue a son pack i18n/<code>.js :
 *   { code, months[12], weekdays[7] (dimanche d’abord), dows[7] (lundi d’abord), datePattern, html{}, strings{ texteFR: traduction } }
 * Ce fichier ne contient aucune traduction : il assemble les packs chargés avant lui (navigateur) ou via require (node).
 */
(function () {
  'use strict';
  const isNode = typeof module !== 'undefined' && module.exports && typeof require === 'function' && typeof window === 'undefined';
  let registry = (typeof window !== 'undefined' && window.CA_LANG_REGISTRY) || null;
  let packs = (typeof window !== 'undefined' && window.CA_I18N_PACKS) || {};
  if (isNode) {
    const path = require('path');
    const dir = path.join(__dirname, 'i18n');
    registry = require(path.join(dir, 'langs.js'));
    packs = {};
    registry.forEach((l) => { try { packs[l.code] = require(path.join(dir, l.code + '.js')); } catch (_) { /* pack absent */ } });
  }
  if (!registry) registry = [{ code: 'fr', label: 'FR', name: 'Français', html: 'fr', dir: 'ltr' }];

  /* Seules les langues dont le pack est chargé sont proposées (le français est la langue source). */
  const LANGS = registry.filter((l) => l.code === 'fr' || packs[l.code]).map((l) => {
    const o = { code: l.code, label: l.label, name: l.name, html: l.html || l.code };
    if (l.dir === 'rtl') o.dir = 'rtl';
    return o;
  });
  const CODES = LANGS.map((l) => l.code);

  /* DICT[texteFR] = { fr, en, es, … } ; HTML[clé] = { fr, en, … } */
  const DICT = Object.create(null);
  const HTML = Object.create(null);
  const MONTHS = {};
  const WEEKDAYS = {};
  const DOWS = {};
  const PATTERNS = {};
  CODES.forEach((c) => {
    const p = packs[c] || {};
    MONTHS[c] = p.months;
    WEEKDAYS[c] = p.weekdays;
    DOWS[c] = p.dows;
    PATTERNS[c] = p.datePattern;
    Object.keys(p.html || {}).forEach((k) => { (HTML[k] = HTML[k] || {})[c] = p.html[k]; });
    if (c === 'fr') return;
    const s = p.strings || {};
    Object.keys(s).forEach((fr) => {
      const e = DICT[fr] || (DICT[fr] = { fr: fr });
      e[c] = s[fr];
    });
  });

  /**
   * formatDate(d, lang, { weekday, year, cap, ordinal })
   * Gabarits du pack : full / short (sans année) / wd (avec jour de semaine) ; fr : « 1er ».
   */
  function formatDate(d, lang, opts) {
    opts = opts || {};
    const L = MONTHS[lang] && PATTERNS[lang] ? lang : 'fr';
    const P = PATTERNS[L];
    const day = d.getDate();
    const dayTxt = day === 1 && P.first && opts.ordinal !== false ? P.first : String(day);
    let s = (opts.year === false ? P.short : P.full)
      .replace('{d}', dayTxt).replace('{M}', MONTHS[L][d.getMonth()]).replace('{Y}', String(d.getFullYear()));
    if (opts.weekday) s = P.wd.replace('{W}', WEEKDAYS[L][d.getDay()]).replace('{s}', s);
    if (opts.cap) s = s.charAt(0).toUpperCase() + s.slice(1);
    return s;
  }

  /* Normalisation et priorité de langue (contrat Market, inchangé depuis v1.6.0). */
  function normalizeLang(v) {
    if (!v) return null;
    const c = String(v).trim().toLowerCase().replace('_', '-').split('-')[0];
    return CODES.indexOf(c) >= 0 ? c : null;
  }
  /** Priorité : 1) ?lang= (search ou hash) 2) message (géré par l’app) 3) localStorage 'lang' puis ca_lang_v1 4) navigator 5) fr */
  function resolveLang(o) {
    o = o || {};
    const fromQuery = (q) => {
      if (!q) return null;
      const m = /[?&]lang=([^&#]+)/.exec(q);
      return m ? decodeURIComponent(m[1]) : null;
    };
    const urlRaw = fromQuery(o.search) || fromQuery(o.hash && o.hash.indexOf('?') >= 0 ? o.hash.slice(o.hash.indexOf('?')) : '');
    if (urlRaw) return { lang: normalizeLang(urlRaw) || 'fr', source: 'url' };
    const ls = normalizeLang(o.lsLang) || normalizeLang(o.lsCa);
    if (ls) return { lang: ls, source: 'storage' };
    const navs = [].concat(o.navigatorLanguages || [], o.navigatorLanguage || []);
    for (let i = 0; i < navs.length; i++) { const n = normalizeLang(navs[i]); if (n) return { lang: n, source: 'navigator' }; }
    return { lang: 'fr', source: 'default' };
  }

  const API = {
    LANGS: LANGS,
    CODES: CODES,
    DICT: DICT,
    HTML: HTML,
    MONTHS: MONTHS,
    WEEKDAYS: WEEKDAYS,
    DOWS: DOWS,
    PACKS: packs,
    formatDate: formatDate,
    normalizeLang: normalizeLang,
    resolveLang: resolveLang,
  };
  if (typeof window !== 'undefined') window.CA_I18N = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
