# Cycle & Astro — Features v1 (checklist priorisée)

**Statut :** backlog MVP v1  
**Priorités :** P0 = indispensable ship interne / démo · P1 = fort pour v1 complète · P2 = nice-to-have v1 ou early v2  
**Critères d’acceptation :** courts, testables, FR UI  
**Hors scope global v1 :** paiement Hostinger, go-live prod, sync cloud obligatoire, diagnostic médical

---

## Légende AC
- **AC** = critère d’acceptation  
- Données cycle / prédictions toujours marquées **estimation** + disclaimer accessible

---

## P0 — Must-have

### P0.1 Onboarding complet + disclaimer
- [ ] Splash / Welcome affiche marque + 4 piliers  
- [ ] Disclaimer santé **obligatoire** avant données cycle/astro  
- [ ] Collecte : prénom, date naissance, dernière période (ou skip), intentions, notifs opt-in  
- [ ] **AC :** impossible d’atteindre Home sans `accepted_health_disclaimer = true`  
- [ ] **AC :** disclaimer relisible dans Réglages → Santé & disclaimer  

### P0.2 Home / Aujourd’hui (hub)
- [ ] 4 cartes : Cycle, Lune, Astro, Chemin  
- [ ] Résumé du jour (phase soft, phase Lune, 1 ligne astro, n° chemin)  
- [ ] CTA check-in rapide  
- [ ] **AC :** tap carte → écran pilier correspondant  
- [ ] **AC :** lien / bouton retour Market visible (header ou Profil)  

### P0.3 Cycle — calendrier + phase
- [ ] Saisie / correction période (début, fin optionnelle)  
- [ ] Calendrier mois avec marquage règles + jour courant  
- [ ] Phase soft actuelle (4 libellés) + footnote non-médicale  
- [ ] Prédiction prochaines règles (**estimation**)  
- [ ] **AC :** sans date de période → empty state guidé (pas d’erreur brute)  
- [ ] **AC :** aucun libellé « fertile / infertile / diagnostic »  

### P0.4 Lune — phase du jour
- [ ] Affichage phase lunaire du jour + label FR  
- [ ] Lecture énergie courte (non dogmatique)  
- [ ] Accès calendrier lunaire mois (vue simple)  
- [ ] **AC :** copy = invitation, pas obligation (« tu dois… »)  

### P0.5 Astro du jour + natal lite
- [ ] Soleil depuis date de naissance  
- [ ] Lune / Ascendant si heure (+ lieu) fournis ; sinon message « compléter pour affiner »  
- [ ] Carte « Astro du jour » 1–3 phrases bienveillantes  
- [ ] **AC :** pas de prédiction absolue / langage fataliste  

### P0.6 Chemin de vie
- [ ] Calcul nombre (date de naissance)  
- [ ] Titre + résumé + 2–4 invitations  
- [ ] **AC :** disclaimer soft « pas un destin figé » visible sur l’écran  

### P0.7 Journal / check-in
- [ ] Humeur (chips soft)  
- [ ] Symptômes soft multi-select (liste non clinique)  
- [ ] Énergie 1–5 optionnelle + note libre  
- [ ] Historique liste simple  
- [ ] **AC :** enregistrement < 30 s parcours nominal  
- [ ] **AC :** aucun terme pathologique dans la liste v1  

### P0.8 Profil & réglages (socle)
- [ ] Affichage prénom, soleil, chemin  
- [ ] Accès disclaimer, notifs, à propos  
- [ ] CTA **Retour au Market**  
- [ ] **AC :** retour Market mène à la route Market convenue (`/#/cycle-astro` parent ou home)  

### P0.9 Charte nuit cosmique KD
- [ ] Tokens noir/or appliqués (fond `#0a0a0a`, gold `#c9a227`, etc.)  
- [ ] Mobile-first 390-friendly  
- [ ] Emplacements moodboard documentés (pas de faux assets finaux)  
- [ ] **AC :** pas de thème « pastel clinique » par défaut  

### P0.10 Données locales
- [ ] Persistance locale profil, périodes, check-ins, settings  
- [ ] **AC :** relancer l’app conserve onboarding + dernières saisies  

### P0.11 Calculateur de menstruation
- [x] Écran `#/calculator` (alias `#/calc`) — formulaire début dernières règles, durée règles, longueur cycle  
- [x] Résultats : prochaines règles, fin estimée, jour du cycle, phase soft (Menstruelle / Folliculaire / Ovulatoire / Lutéale)  
- [x] Liste courte des 3 prochaines périodes + disclaimer informatif / bien-être  
- [x] Entrées UI : CTA Cycle « Calculateur », lien hub sous hero cycle, Profil / Plus + picker desktop  
- [x] Persistance locale inputs `ca_calc_v1` · JS vanilla dans maquettes  
- [ ] **AC :** aucun libellé fertile / diagnostic / contraception  
- [ ] **AC :** disclaimer visible sur l’écran résultats  

---


### P0.12 Lecture complète Chemin / Astro
- [x] Template doc `docs/TEMPLATE-LECTURE-CHEMIN-v0.md` (structure 8 blocs + exemple Krizoua + règles calcul)
- [x] Écran maquette `#/reading` — Lecture complète (identité, synthèse, chemin, vibration jour, signe/décan, dons, axes, disclaimer)
- [x] CTA depuis `#/path` (« Voir la lecture complète ») + lien depuis Astro / Profil
- [x] Toggle persona **Aïcha** vs **Exemple KD : Krizoua** + générateur JS (autres dates)
- [x] Exemple Krizoua = **texte Dave verbatim** (Sinfra) dans UI `#/reading` + `TEMPLATE-LECTURE-CHEMIN-v0.md`
- [x] Ton boussole / anti-fatalisme + disclaimer bien-être sous la lecture
- [x] **AC :** Krizoua affiche le texte long mot pour mot (chemin 3 · jour 17/8 · Balance 3e décan · compétences RP/négo/coaching…)
- [x] **P0.12 enrichi (Gemini)** — générateur structuré : Mission d’âme, Forces 5–7, Ombres+transformation, Relations/Travail/Énergie, vibration (sens+alliance+concret), signe×décan riche, 6–10 domaines chemin×signe, plan 7 jours, 5 questions miroir — UI cards « Lecture détaillée »
- [x] Labels UI : « Lecture détaillée » / « Analyse approfondie · style guide KD » + CTA « Générer une lecture détaillée »
- [x] Docs : `TEMPLATE-LECTURE-CHEMIN-v0.md` niveau Gemini + note FEATURES P0.12 enrichi
- [x] **AC :** calculateur menstruation `#/calculator` inchangé / non régressé

## P1 — Should-have v1

### P1.1 Insights soft
- [ ] Au moins 1 type : cycle × lune **ou** motif humeur (si assez de data)  
- [ ] Empty insight si data insuffisante (copy encourageante)  
- [ ] **AC :** chaque insight affiche flag « suggestif, non médical »  

### P1.2 Calendrier lunaire mois interactif
- [ ] Tap jour → sheet lecture courte  
- [ ] **AC :** navigation mois précédent / suivant  

### P1.3 Édition profil post-onboarding
- [ ] Modifier prénom, naissance, heure/lieu, longueurs cycle  
- [ ] Recalcul chemin / natal lite après édition  
- [ ] **AC :** changement date naissance met à jour chemin affiché  

### P1.4 Suppression / reset données
- [ ] Supprimer check-in unitaire  
- [ ] Reset local (confirmation)  
- [ ] **AC :** après reset, retour état première utilisation / onboarding au choix produit  

### P1.5 Empty states par pilier
- [ ] Cycle, Journal, Insights, Natal incomplet  
- [ ] **AC :** chaque empty a 1 CTA utile  

### P1.6 Navigation bas 5 onglets
- [ ] Aujourd’hui · Cycle · Journal · Insights · Profil  
- [ ] **AC :** onglet actif = accent or  

### P1.7 Intégration Market (slot)
- [ ] Hypothèse route `/#/cycle-astro` ou `/apps/cycle-astro` documentée & branchée en stub  
- [ ] Deep link / retour Market testé en embed  
- [ ] **AC :** depuis Market, ouverture module sans casser shell (selon stack)  
- [ ] **Note :** ne pas modifier le repo Market sans brief Dave/Chef  

### P1.8 Notifications locales (si opt-in)
- [ ] Rappel check-in quotidien configurable  
- [ ] **AC :** refus OS → app reste utilisable, opt-in stocké false  

---

## P2 — Nice-to-have / early v2

### P2.1 Lier compte Market (auth partagée)
- [ ] Option « Continuer avec Market » si session dispo  
- [ ] **AC :** mode local reste possible sans compte  

### P2.2 Contenu éditorial KD (1–2 cartes)
- [ ] Carte « rituel » ou article teaser  
- [ ] **AC :** pas de claim médical  

### P2.3 Export journal (texte / PDF simple)
- [ ] **AC :** export contient disclaimer  

### P2.4 Widget / raccourci (plus tard)
- [ ] Hors v1 mobile web embed  

### P2.5 Mode accessibilité renforcé
- [ ] Contrastes, dynamic type  
- [ ] **AC :** gold sur noir reste lisible (ratio à vérifier)  

### P2.6 i18n EN
- [ ] Architecture strings prête ; FR only en v1  

### P2.7 Partage partenaire cycle
- [ ] Opt-in strict, hors v1 recommandée  

---

## Matrice piliers × priorité

| Pilier | P0 | P1 | P2 |
|--------|----|----|-----|
| Cycle | Calendrier, phase, prédiction estimation, édition période | Empty, édition longueurs | Partage partenaire |
| Lune | Phase jour + lecture | Calendrier mois interactif | — |
| Astro | Jour + natal lite | Complétion heure/lieu UX | Transits avancés |
| Chemin | Calcul + lecture + **Lecture complète** `#/reading` | Recalcul après edit | Lectures longues KD |
| Journal | Check-in + historique | Delete unitaire | Export |
| Insights | — | Soft patterns | ML / corrélations avancées |
| Market | Retour Market + charte | Slot route embed | Auth partagée, sous-domaine |

---



### P0.13 Profil complet multi-personnes (maquette)
- [x] Formulaire prénom / nom / genre / date / heure / ville sur `#/reading` (alias `#/profil-complet`)
- [x] Sortie profil complet : synthèse pills, chemin, astro+décan, numérique, chiffres de chance, couleurs & parfums, cultiver/axes, plan 7j, miroirs, disclaimer
- [x] Genre adapte le ton (elle / il / iel) — pas de contenu médical
- [x] Pas de faux ascendant sans heure (note explicite)
- [x] `localStorage ca_profile_v1` + profils récents (max 5)
- [x] Aïcha = seed démo ; générateur = données formulaire ; Krizoua verbatim conservé
- [x] Docs : `PROFILE-COMPLET-v0.md` + note TEMPLATE
- [x] **AC :** toute personne obtient un profil propre ; multi-profils OK sur le même téléphone

## Maquettes UX — v3.3
- [x] **v3.3 UX polish** — sophistiqué (glass/or/typo/transitions) + manipulation simplifiée (CTA piliers, chips hub, formulaires Lecture/Calculateur, nav glow, ripple/toast)

## Definition of Done v1 (interne)

- [ ] Tous les **P0** cochés avec AC validés  
- [ ] Disclaimer présent onboarding + réglages  
- [ ] Aucune copy médicale dogmatique (revue Dave / Chef)  
- [ ] Wireframes / bible respectés pour parcours nominal  
- [ ] Pas de paiement / pas de go-live Hostinger  
- [ ] Moodboard Dave intégré **ou** emplacements clairement « à venir »  

---

## Hors checklist (rappel)

| Interdit v1 | Raison |
|-------------|--------|
| Diagnostic / contraception / fertilité garantie | Éthique & santé |
| Paiement Hostinger / prod go-live | Brief explicite |
| Modifier `king-daveblessing-market` sans brief | Isolation module |
| Inventer métriques « prouvées » | Intégrité produit |

---

*Features v1 — Cycle & Astro — document vivant, aligné BIBLE-PRODUIT-v0.*
