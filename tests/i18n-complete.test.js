// node tests/i18n-complete.test.js — v1.7.0 : registre + packs complets, aucune fuite de français (plain node assert)
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const I = require('../i18n.js');
const REG = require('../i18n/langs.js');
const APP = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
let n = 0;
function test(name, fn) { fn(); n++; console.log('ok', n, '-', name); }
const NON_FR = I.CODES.filter((c) => c !== 'fr');
const keys = Object.keys(I.DICT);

test('registre : exactement les 7 langues du Market, ar en RTL', () => {
  assert.deepStrictEqual(REG.map((l) => l.code), ['fr', 'en', 'es', 'pt', 'zh', 'de', 'ar']);
  assert.deepStrictEqual(I.CODES, REG.map((l) => l.code));
  REG.forEach((l) => { assert.ok(l.name && l.label && l.html, l.code); assert.strictEqual(l.dir, l.code === 'ar' ? 'rtl' : 'ltr'); });
});
test('chaque langue a un pack cohérent (mois, jours, gabarit de date, html)', () => {
  const htmlKeys = Object.keys(I.PACKS.fr.html).sort();
  I.CODES.forEach((c) => {
    const p = I.PACKS[c];
    assert.strictEqual(p.code, c);
    assert.strictEqual(p.months.length, 12, c); assert.strictEqual(p.weekdays.length, 7, c); assert.strictEqual(p.dows.length, 7, c);
    assert.ok(p.datePattern.full && p.datePattern.short && p.datePattern.wd, c);
    assert.deepStrictEqual(Object.keys(p.html).sort(), htmlKeys, c + ' html');
  });
});
test('chaque clé i18n existe dans les 7 langues (' + keys.length + ' clés)', () => {
  const missing = [];
  keys.forEach((k) => I.CODES.forEach((c) => { if (typeof I.DICT[k][c] !== 'string' || !I.DICT[k][c].trim()) missing.push(c + ': ' + k.slice(0, 60)); }));
  assert.deepStrictEqual(missing, []);
  NON_FR.forEach((c) => assert.strictEqual(Object.keys(I.PACKS[c].strings).length, keys.length, c));
});
test('les gabarits gardent leurs {variables} dans chaque langue', () => {
  const bad = [];
  keys.forEach((k) => {
    const vars = (k.match(/\{[a-z]+\}/gi) || []).sort().join();
    NON_FR.forEach((c) => { if ((I.DICT[k][c].match(/\{[a-z]+\}/gi) || []).sort().join() !== vars) bad.push(c + ': ' + k.slice(0, 50)); });
  });
  assert.deepStrictEqual(bad, []);
});
test('aucun texte long resté en français (valeur ≠ clé FR pour > 40 caractères)', () => {
  const leak = [];
  keys.filter((k) => k.length > 40).forEach((k) => NON_FR.forEach((c) => { if (I.DICT[k][c] === k) leak.push(c + ': ' + k.slice(0, 50)); }));
  assert.deepStrictEqual(leak, []);
});
test('pas de mots français typiques dans les traductions longues', () => {
  const FR = /(^|[\s«(])(les|des|une|avec|dans|pour|c’est|qu’|ton|tes|cette|aujourd’hui)(?=[\s,.;:!?»)])/gi;
  const leak = [];
  keys.filter((k) => k.length > 40).forEach((k) => NON_FR.forEach((c) => {
    if (c === 'es' || c === 'pt') return; // « des », « une »… existent en es/pt : contrôle dédié ci-dessous
    const v = I.DICT[k][c].replace(/Krizoua Yako Jean|Côte d’Ivoire|Côte d'Ivoire/g, '');
    const hits = (v.match(FR) || []).filter((w) => !(c === 'de' && /des$/i.test(w)));
    if (hits.length >= 2) leak.push(c + ': ' + v.slice(0, 60));
  }));
  assert.deepStrictEqual(leak, []);
});
test('es / pt / zh / ar : pas de tournures françaises (« tu peux », « n’est pas », « c’est »)', () => {
  const leak = [];
  keys.filter((k) => k.length > 40).forEach((k) => ['es', 'pt', 'zh', 'ar'].forEach((c) => { if (/\btu peux\b|n’est pas|\bc’est\b|\bavec\b/i.test(I.DICT[k][c])) leak.push(c + ': ' + k.slice(0, 50)); }));
  assert.deepStrictEqual(leak, []);
});
test('zh et ar sont dans leur écriture (CJK / arabe) pour les textes longs', () => {
  keys.filter((k) => k.length > 40 && k.indexOf('Krizoua Yako') < 0).forEach((k) => {
    assert.ok(/[\u4e00-\u9fff]/.test(I.DICT[k].zh), 'zh: ' + k.slice(0, 40));
    assert.ok(/[\u0600-\u06ff]/.test(I.DICT[k].ar), 'ar: ' + k.slice(0, 40));
  });
});
function grab(re) { const m = APP.match(re); assert.ok(m, String(re)); return m[1]; }
function strings(block) { return [...block.matchAll(/'((?:[^'\\]|\\.)+)'/g)].map((m) => m[1].replace(/\\'/g, "'")); }
test('22 arcanes : nom, clés, texte, question traduits ; tirage 3 cartes', () => {
  const tarot = grab(/const TAROT = \[([\s\S]*?)\n  \];/);
  const cards = [...tarot.matchAll(/\{ name: '([^']+)', keys: '([^']+)', text: '((?:[^'\\]|\\.)+)', q: '((?:[^'\\]|\\.)+)' \}/g)];
  assert.strictEqual(cards.length, 22);
  cards.forEach((m) => [m[1], m[2], m[3], m[4]].forEach((s) => NON_FR.forEach((c) => assert.ok(I.DICT[s] && I.DICT[s][c] && I.DICT[s][c] !== s || /^(La Force|Le Monde)$/.test(s) && I.DICT[s], c + ': ' + s.slice(0, 40)))));
  strings(grab(/const SPREAD_POS = \[([\s\S]*?)\];/)).forEach((s) => NON_FR.forEach((c) => assert.ok(I.DICT[s] && I.DICT[s][c], c + ': ' + s)));
});
test('méditations (phases du cycle + phases lunaires) traduites', () => {
  ['MEDIT_CYCLE', 'MEDIT_MOON'].forEach((name) => {
    const list = strings(grab(new RegExp('const ' + name + ' = [\\[{]([\\s\\S]*?)\\n  [\\]}];'))).filter((s) => s.length > 30);
    assert.ok(list.length >= 8, name);
    list.forEach((s) => NON_FR.forEach((c) => assert.ok(I.DICT[s] && I.DICT[s][c] && I.DICT[s][c] !== s, name + ' ' + c + ': ' + s.slice(0, 40))));
  });
});
test('thème natal : 12 styles de signe + thèmes des planètes + gabarit « {theme} se vit {style}. »', () => {
  const styles = strings(grab(/const SIGN_STYLE = \[([\s\S]*?)\];/));
  assert.strictEqual(styles.length, 12);
  styles.forEach((s) => NON_FR.forEach((c) => assert.ok(I.DICT[s] && I.DICT[s][c] !== s, c + ': ' + s)));
  NON_FR.forEach((c) => assert.ok(I.DICT['{theme} se vit {style}.'][c]));
});
test('verbatim Krizoua traduit en entier dans chaque langue', () => {
  const KZ = JSON.parse(grab(/const KRIZOUA_VERBATIM_TEXT = ("(?:[^"\\]|\\.)*");/));
  NON_FR.forEach((c) => { const v = I.DICT[KZ] && I.DICT[KZ][c]; assert.ok(v && v.length > KZ.length * (c === 'zh' ? 0.2 : 0.4), c); assert.ok(v.indexOf('Chemin de Vie') < 0, c); });
});
test('chemins de vie 1–9 : titres et missions traduits', () => {
  const block = grab(/const PATH_COPY = \{([\s\S]*?)\n  \};/);
  const titles = [...block.matchAll(/title: ("(?:[^"\\]|\\.)+")/g)].map((m) => JSON.parse(m[1]));
  const missions = [...block.matchAll(/mission:\s*("(?:[^"\\]|\\.)+")/g)].map((m) => JSON.parse(m[1]));
  assert.ok(titles.length >= 9 && missions.length >= 9);
  titles.concat(missions).forEach((s) => NON_FR.forEach((c) => assert.ok(I.DICT[s] && I.DICT[s][c] && I.DICT[s][c] !== s, c + ': ' + s.slice(0, 40))));
});
test('plus aucune note « le texte détaillé est en français »', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(!/data-fr-note|readingFrNote|est en français/.test(html));
  assert.ok(!/frNoteSync|readingFrNote/.test(APP));
});
test('index.html charge le registre puis chaque pack avant i18n.js', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const at = (s) => html.indexOf(s);
  assert.ok(at('i18n/langs.js') > 0 && at('i18n/langs.js') < at('src="i18n.js'));
  REG.forEach((l) => assert.ok(at('i18n/' + l.code + '.js') > 0 && at('i18n/' + l.code + '.js') < at('src="i18n.js'), l.code));
  const swPath = path.join(__dirname, '..', 'sw.js');
  if (!fs.existsSync(swPath)) return; // instantané releases/ : pas de service worker
  const sw = fs.readFileSync(swPath, 'utf8');
  REG.forEach((l) => assert.ok(sw.indexOf('./i18n/' + l.code + '.js') > 0, 'sw ' + l.code));
});
console.log(n + ' tests passed');
