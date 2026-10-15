/* Cycle & Astro — pack de langue « fr » (Français). Clé = texte français source ; valeur = traduction. */
(function () {
  const PACK = {
 "code": "fr",
 "months": [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre"
 ],
 "weekdays": [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi"
 ],
 "dows": [
  "Lu",
  "Ma",
  "Me",
  "Je",
  "Ve",
  "Sa",
  "Di"
 ],
 "datePattern": {
  "full": "{d} {M} {Y}",
  "short": "{d} {M}",
  "wd": "{W} {s}",
  "first": "1er"
 },
 "html": {
  "disc2": "Les informations sur le cycle, la Lune, l’astrologie et le chemin de vie sont proposées à titre <strong>informatif et de bien-être personnel</strong>.",
  "disc3": "Elles ne constituent <strong>ni un diagnostic, ni un conseil médical, ni un moyen de contraception ou de conception</strong>.",
  "q1": "1<sup>er</sup> quartier"
 },
 "strings": {}
};
  if (typeof window !== 'undefined') { window.CA_I18N_PACKS = window.CA_I18N_PACKS || {}; window.CA_I18N_PACKS[PACK.code] = PACK; }
  if (typeof module !== 'undefined' && module.exports) module.exports = PACK;
})();
