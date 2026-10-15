/* Cycle & Astro — registre des langues (v1.7.0).
 * Ajouter une langue : 1) une entrée ici ; 2) un fichier i18n/<code>.js (copier en.js et traduire chaque valeur) ;
 * 3) une balise <script src="i18n/<code>.js"> dans index.html (+ sw.js CORE). Aucune autre modification de code.
 * dir: 'rtl' pour les langues écrites de droite à gauche. */
(function (root) {
  const LANG_REGISTRY = [
    {
      "code": "fr",
      "label": "FR",
      "html": "fr",
      "dir": "ltr",
      "name": "Français"
    },
    {
      "code": "en",
      "label": "EN",
      "html": "en",
      "dir": "ltr",
      "name": "English"
    },
    {
      "code": "es",
      "label": "ES",
      "html": "es",
      "dir": "ltr",
      "name": "Español"
    },
    {
      "code": "pt",
      "label": "PT",
      "html": "pt",
      "dir": "ltr",
      "name": "Português"
    },
    {
      "code": "zh",
      "label": "中文",
      "html": "zh-Hans",
      "dir": "ltr",
      "name": "中文"
    },
    {
      "code": "de",
      "label": "DE",
      "html": "de",
      "dir": "ltr",
      "name": "Deutsch"
    },
    {
      "code": "ar",
      "label": "العربية",
      "html": "ar",
      "dir": "rtl",
      "name": "العربية"
    }
  ];
  if (typeof window !== 'undefined') window.CA_LANG_REGISTRY = LANG_REGISTRY;
  if (typeof module !== 'undefined' && module.exports) module.exports = LANG_REGISTRY;
})();
