# Cycle & Astro — Maquettes HTML · v3.3

**Marque :** King Daveblessing · nuit cosmique noir/or  
**Viewport cible :** 390 × 844 (shell téléphone dans la page)  
**Langue UI :** Français · ton bienveillant, non médical  
**Version :** v3.3 · polish premium + manipulation simplifiée  
**Date :** 23 septembre 2026

## Ouvrir

### Option A — fichier local
Ouvre dans le navigateur :

```
file:///workspace/cycle-astro/mockups/index.html
```

Ou double-clic sur `index.html`.

### Option B — serveur local (recommandé pour fonts Google)

```bash
cd /workspace/cycle-astro/mockups
python3 -m http.server 8765
```

Puis : [http://127.0.0.1:8765/](http://127.0.0.1:8765/)  
Hash exemples : `#/splash` · `#/today` · `#/cycle` · `#/calculator` · `#/moon` · `#/astro` · `#/path` · `#/reading` · `#/journal` · `#/profile`

## Fichiers

| Fichier | Rôle |
|---------|------|
| `index.html` | Shell mobile + 11 écrans (+ stub Market, calculateur, lecture complète) |
| `styles.css` | Tokens KD, stars, cards, typo Cinzel/Inter, bottom nav, calendriers |
| `app.js` | Router hash, calendriers démo, micro-interactions, données Aïcha |
| `README.md` | Ce fichier |

## Écrans obligatoires (navigables)

1. **Splash / Welcome** — marque KD + 4 piliers + CTA Commencer  
2. **Onboarding disclaimer** — texte santé bien-être, checkbox bloquante, Continuer  
3. **Hub Aujourd’hui** — résumé jour + 4 cartes piliers + check-in + ← Market  
4. **Cycle** — calendrier mois, phase lutéale soft, estimation prochaines règles, disclaimer  
5. **Lune** — phase du jour + énergie douce + calendrier lunaire simplifié  
6. **Astro** — message du jour + natal lite + énergies + tags favorables  
7. **Chemin de vie** — nombre 8 + lecture + invitations + CTA lecture complète  
8. **Profil complet** `#/reading` (alias `#/profil-complet`) — formulaire multi-personnes (prénom, nom, genre, date, heure, ville) · chemin · astro · numérique · chiffres/couleurs/parfums de chance · plan 7j · Krizoua verbatim  
9. **Journal / check-in** — humeur, symptômes soft, énergie, historique  
10. **Profil / Réglages** — disclaimer relisible + Retour au Market  
11. **Calculateur de menstruation** — estimations prochaines règles + phase soft (entrée Cycle / Hub / Plus)  

Bottom nav : **Aujourd’hui · Cycle · Journal · Plus**.  
Sélecteur d’écrans au-dessus du téléphone (desktop) pour revue rapide Chef / Dave.

## Différenciation vs refs (`../refs/*.jpg`)

Les 6 images refs inspirent uniquement l’astro / Lune (signes, message du jour, calendrier astro, cartes). Ces maquettes **surpassent** :

1. **4 piliers égaux** — Cycle menstruel + Lune + Astro + Chemin de vie (les refs n’ont pas le cycle soft ni le chemin).  
2. **Phases cycle soft** — menstruelle / folliculaire / ovulatoire / lutéale ; **jamais** fertile / infertile / diagnostic.  
3. **Disclaimer santé** visible à l’onboarding **et** dans Profil → Santé & disclaimer.  
4. **Charte King Daveblessing** stricte — tokens `#0a0a0a` / `#c9a227` / `#f7f0d8`, serif Cinzel or, Inter corps.  
5. **Hub Aujourd’hui** unifié (résumé + 4 cartes + insight doux + CTA check-in + retour Market).  
6. **Journal soft** (humeurs + symptômes non cliniques) absent des refs.  
7. **Chemin de vie** comme pilier natif (nombre + invitations, anti-fatalisme).  
8. **Micro-interactions** — glow or sélection, chips, transitions, toast check-in.  
9. **Intégration Market** anticipée (`#/cycle-astro`, stub retour) sans toucher le repo Market.  
10. **Remix premium** — esthétique nuit cosmique proche des refs, mais layout & copy KD, pas de copie pixel-perfect.

### Galerie inspiration (hors UI)

Ne pas coller en fond UI. Références moodboard :

- `../refs/01-signes-phases.jpg`  
- `../refs/02-energies-prudence.jpg`  
- `../refs/03-message-jour.jpg`  
- `../refs/04-calendrier-detail.jpg`  
- `../refs/05-cartes-calendrier.jpg`  
- `../refs/06-calendrier-astro.jpg`  

## Hors scope de ce livrable

- Pas de backend / sync cloud  
- Pas de Hostinger / go-live  
- Pas de modification de `/workspace/king-daveblessing-market`  
- Données 100 % démo (persona Aïcha)

## Alignement docs

Bible · wireframes · features P0 · PLAN-P0 · **TEMPLATE-LECTURE-CHEMIN-v0** dans `/workspace/cycle-astro/docs/`.

---

*King Daveblessing · Cycle & Astro · v3.3 · septembre 2026*



## Changelog v3.3+

- **Nouvelle personne / Remise à zéro** — hub · Profil · Lecture ; vide formulaire, résultats, `ca_profile_v1`, `ca_calc_v1` ; récents gardés ; → `#/reading`.
- **Mois forcé septembre 2026** — hub, calendriers, check-ins, défaut calculateur (23 sept. = mercredi, jour 23).
- **Profil complet multi-personnes** — toute personne entre ses données → profil soigné ; `ca_profile_v1` + récents (max 5) ; chance (chiffres/couleurs/parfums) ; genre elle/il/iel ; pas de faux ascendant.

## Changelog v3.3

**Focus :** plus sophistiqué (premium KD) **et** plus simple à manipuler.

- Identité **Cycle & Astro · v3.3** (badge, meta, splash ligne discrète)
- Hub : 4 CTA piliers plus grands ; Cycle menstruel reste hero #1
- Raccourcis chips **Calculateur** + **Lecture** en 1 tap
- Bottom nav clarifiée (Aujourd’hui · Cycle · Journal · Plus) + or glow actif
- Lecture : formulaire Nom / Date / Lieu + gros **Générer** ; toggle Krizoua évident
- Calculateur : 3 champs + gros **Calculer** ; résultats sticky visibles
- Retours cohérents ← Aujourd’hui / ← Market
- Feedback tactile léger (ripple CSS + toasts)
- Cards glass/nuit, typo Cinzel/Inter renforcée, micro-transitions 150–250 ms
- Ne casse pas : `#/calculator`, `#/reading` (Krizoua verbatim + Gemini), 4 piliers, disclaimer, bottom nav

## Screenshots

Captures headless Chrome (révision visuelle) dans `screenshots/*.png` — splash, onboarding, today, cycle, moon, astro, path, journal, profile.

Serveur démo local (si encore actif) : `http://127.0.0.1:8765/`
