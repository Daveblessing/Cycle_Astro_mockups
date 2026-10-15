// node tests/lang.test.js — résolution de langue (contrat Market), plain node assert
'use strict';
const assert = require('assert');
const I = require('../i18n.js');
let n = 0;
function test(name, fn) { fn(); n++; console.log('ok', n, '-', name); }
const R = (o) => I.resolveLang(o);

test('7 langues supportées', () => assert.deepStrictEqual(I.CODES, ['fr', 'en', 'es', 'pt', 'zh', 'de', 'ar']));
test('normalisation en-US → en, pt_BR → pt, ZH-Hans → zh, xx → null', () => {
  assert.strictEqual(I.normalizeLang('en-US'), 'en'); assert.strictEqual(I.normalizeLang('pt_BR'), 'pt');
  assert.strictEqual(I.normalizeLang('ZH-Hans'), 'zh'); assert.strictEqual(I.normalizeLang('de-AT'), 'de');
  assert.strictEqual(I.normalizeLang('ar-CI'), 'ar'); assert.strictEqual(I.normalizeLang('xx'), null); assert.strictEqual(I.normalizeLang(''), null);
});
test('1) ?lang= dans search gagne sur tout', () => {
  assert.deepStrictEqual(R({ search: '?lang=de', lsLang: 'en', lsCa: 'es', navigatorLanguage: 'pt-BR' }), { lang: 'de', source: 'url' });
});
test('1) ?lang= dans la query du hash', () => {
  assert.deepStrictEqual(R({ hash: '#/astro?lang=ar', lsCa: 'en' }), { lang: 'ar', source: 'url' });
  assert.strictEqual(R({ search: '?x=1&lang=en-GB' }).lang, 'en');
});
test('1) ?lang inconnu → fr', () => assert.deepStrictEqual(R({ search: '?lang=klingon', lsCa: 'de' }), { lang: 'fr', source: 'url' }));
test("3) localStorage 'lang' avant ca_lang_v1", () => {
  assert.deepStrictEqual(R({ lsLang: 'zh', lsCa: 'es' }), { lang: 'zh', source: 'storage' });
  assert.deepStrictEqual(R({ lsLang: 'nope', lsCa: 'es' }), { lang: 'es', source: 'storage' });
});
test('4) navigator.language(s)', () => {
  assert.deepStrictEqual(R({ navigatorLanguages: ['it-IT', 'de-DE'] }), { lang: 'de', source: 'navigator' });
  assert.deepStrictEqual(R({ navigatorLanguage: 'en-US' }), { lang: 'en', source: 'navigator' });
});
test('5) défaut fr', () => {
  assert.deepStrictEqual(R({}), { lang: 'fr', source: 'default' });
  assert.deepStrictEqual(R({ navigatorLanguage: 'ja-JP' }), { lang: 'fr', source: 'default' });
});
test('toutes les lignes ont les 7 langues, placeholders conservés', () => {
  Object.keys(I.DICT).forEach((k) => {
    const ph = (k.match(/\{\w+\}/g) || []).sort().join();
    I.CODES.forEach((c) => {
      assert.ok(I.DICT[k][c], c + ' manquant : ' + k);
      assert.strictEqual((I.DICT[k][c].match(/\{\w+\}/g) || []).sort().join(), ph, c + ' placeholder : ' + k);
    });
  });
});
test('messages lunaires v1.5 et historique v1.4 traduits (pas de repli FR)', () => {
  ['Lune en Sagittaire : horizon, apprentissage, optimisme.', 'Bouge dix minutes.', 'Historique du cycle', 'Règles notées', 'Prochaine pleine lune'].forEach((k) => {
    ['en', 'es', 'pt', 'zh', 'de', 'ar'].forEach((c) => assert.notStrictEqual(I.DICT[k][c], k, c + ' : ' + k));
  });
});
test('dates de / ar', () => {
  const d = new Date(2026, 9, 14, 12);
  assert.strictEqual(I.formatDate(d, 'de', { weekday: true }), 'Mittwoch, 14. Oktober 2026');
  assert.strictEqual(I.formatDate(d, 'ar', { weekday: true }), 'الأربعاء 14 أكتوبر 2026');
  assert.strictEqual(I.LANGS.find((l) => l.code === 'ar').dir, 'rtl');
});
console.log('\n' + n + ' tests passed');
