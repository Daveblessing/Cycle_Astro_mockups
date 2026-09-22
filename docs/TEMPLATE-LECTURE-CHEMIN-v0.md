# Template Lecture complète — Chemin de vie / Astro (P0)

**Produit :** Cycle & Astro · King Daveblessing  
**Pilier :** Chemin de vie (+ natal lite soleil / décan)  
**Version :** v0.12 enrichi (Gemini) · septembre 2026  
**Ton :** bienveillant, non dogmatique — **boussole**, pas destin figé  
**Langue :** FR

---

## Intention éditoriale

Cette lecture est un **miroir doux** : chiffres et signe solaire sont des *invitations à explorer*, jamais des verdicts.  
Formulations à privilégier : « évoque », « peut suggérer », « invitation », « axe à ressentir ».  
À éviter : « tu es condamné·e à », « tu dois », « destin », ton médical / clinique.

---

## Structure obligatoire — niveau **Gemini** (9 blocs riches)

> **Style cible :** long, structuré, nuancé, pédagogique — phrases complètes, vocabulaire riche mais accessible, ton premium bienveillant.  
> **Pas** de textes courts de 2 phrases. Chaque section tient en **cards** UI distinctes (mode généré).

| # | Section | Contenu minimum (densité Gemini) |
|---|---------|----------------------------------|
| 1 | **En-tête identité** | Prénom / nom · date · lieu (si fournis) |
| 2 | **Tableau synthèse** | Chemin · Jour (vibration) · Signe · Décan |
| 3 | **Chemin de vie (détail)** | Titre + **rappel de calcul** · **Mission d’âme** (1 § dense) · **Forces** (5–7 puces détaillées) · **Défis / ombres** (4–6 puces + transformation) · **En relations / en travail / en énergie perso** (3 mini-§) |
| 4 | **Vibration du jour** | Sens du nombre · **alliance avec le chemin** · implication concrète |
| 5 | **Signe + décan** | Élément · modalités · planète · note de décan · **alliance avec le chemin** · style relationnel |
| 6 | **Domaines de compétences** | 6–10 pistes concrètes adaptées **chemin × signe** |
| 7 | **Plan d’exploration 7 jours** | Actions douces, non dogmatiques (1 / jour) |
| 8 | **Questions miroir** | 5 questions d’introspection |
| 9 | **Disclaimer** | Bien-être · pas destin figé · pas avis médical / diagnostic |

UI cible maquettes : hash **`#/reading`** (« **Lecture détaillée** » · sous-titre « Analyse approfondie · style guide KD »), accessible depuis `#/path` et (optionnel) `#/astro`.

### Deux modes d’affichage

| Mode | Quand | Rendu |
|------|-------|-------|
| **Krizoua verbatim** | Persona « Exemple KD · Krizoua » (17/10/1983) | Texte Dave **tel quel** (`KRIZOUA_VERBATIM_TEXT`) — `textContent` / pre-wrap · **ne pas reformuler** |
| **Générateur structuré** | Toute autre date / Aïcha | Cards HTML riches (sections ci-dessus) via `buildReading` + `renderReading` |

---

## Règles de calcul (vanilla, P0)

### 1. Chemin de vie (`lifePath`)

1. Prendre la date au format `YYYY-MM-DD` (ou équivalent).  
2. Sommer **tous les chiffres** de `YYYYMMDD`.  
3. Réduire à un chiffre **1–9** (somme des chiffres du résultat tant que > 9).  
4. **P0 :** pas de master numbers (11 / 22 / 33) — on réduit toujours.

**Exemple Krizoua** — 17 oct. 1983 → `19831017`  
`1+9+8+3+1+0+1+7 = 30` → `3+0 = 3` → **Chemin 3**.

### 2. Vibration du jour (`dayVibe`)

1. Prendre le **jour du mois** (1–31).  
2. Réduire à 1–9 (ex. 17 → 1+7 = **8**).  
3. Master numbers ignorés en P0.

### 3. Signe solaire (approx. dates FR standard)

| Signe | Début ≈ | Fin ≈ |
|-------|---------|-------|
| Bélier | 21 mars | 19 avr. |
| Taureau | 20 avr. | 20 mai |
| Gémeaux | 21 mai | 20 juin |
| Cancer | 21 juin | 22 juil. |
| Lion | 23 juil. | 22 août |
| Vierge | 23 août | 22 sept. |
| **Balance** | **23 sept.** | **22 oct.** |
| Scorpion | 23 oct. | 21 nov. |
| Sagittaire | 22 nov. | 21 déc. |
| Capricorne | 22 déc. | 19 jan. |
| Verseau | 20 jan. | 18 fév. |
| Poissons | 19 fév. | 20 mars |

*Approximation tropique ; pas de maisons / ascendant sans heure.*

### 4. Décan (tiers du signe)

Chaque signe ≈ 30 jours → **3 décans** d’environ 10 jours :

1. **1er décan** — premiers ~10 jours du signe  
2. **2e décan** — milieu  
3. **3e décan** — derniers ~10 jours  

**Exemple :** Balance du 23 sept. au 22 oct.  
- 1er : 23 sept. → 2 oct.  
- 2e : 3 oct. → 12 oct.  
- 3e : 13 oct. → 22 oct.  

→ **17 oct.** = **Balance 3e décan**.

---

## Dictionnaires FR (référence P0)

### Chemins 1–9 — titres

| N° | Titre |
|----|--------|
| 1 | L’élan / le pionnier |
| 2 | L’harmonie / la coopération |
| 3 | L’expression / la créativité |
| 4 | La structure / la fondation |
| 5 | Le mouvement / la liberté |
| 6 | Le soin / la responsabilité douce |
| 7 | La profondeur / l’introspection |
| 8 | La maîtrise / l’abondance |
| 9 | L’humanisme / le grand cœur |

*(Textes longs stockés dans le générateur JS / contenus éditoriaux KD.)*

### Vibrations du jour 1–9 — sens (générateur : versions longues + alliance + concret)

| N° | Sens (invitation) |
|----|-------------------|
| 1 | Initiative, démarrer, oser le premier pas |
| 2 | Écoute, diplomatie, tisser des liens |
| 3 | Expression, joie, partage créatif |
| 4 | Stabilité, méthode, bâtir concrètement |
| 5 | Curiosité, adaptation, respiration |
| 6 | Soin, présence, harmonie relationnelle |
| 7 | Silence intérieur, analyse, intuition |
| 8 | Ambition juste, responsabilité, impact |
| 9 | Compassion, clôture, vision large |

---

## Exemple rempli — Krizoua Yako Jean (texte Dave **verbatim**)

> Source Chef / Dave — à afficher **tel quel** dans l’UI (toggle « Exemple KD · Krizoua »).  
> Orthographe lieu : **Sinfra** (Côte d'Ivoire), comme dans le texte source.

```
Voici l'analyse numérologique et astrologique complète pour Krizoua Yako Jean, né le 17 octobre 1983 à Sinfra (Côte d'Ivoire).

🔑 1. Le Chemin de Vie : Le Nombre 3 (Le Communicateur / Le Créateur)

(Calcul : 17 + 10 + 1983 → (1+7) + (1+0) + (1+9+8+3) = 8 + 1 + 21 → 8 + 1 + 3 = 12 → 1 + 2 = 3)

(Méthode alternative : 17 + 10 + 1983 = 2010 → 2 + 0 + 1 + 0 = 3)

Le Chemin de Vie 3 est celui du Verbe, de la Communication, de la Créativité et du Rayonnement social.

 * Mission d'Âme : Jean est venu pour exprimer sa pensée, impacter par la parole ou l'écrit, créer des ponts entre les gens et apporter de l'enthousiasme. C'est un canal naturel de transmission.
 * Forces : Éloquence, créativité, charme relationnel, optimisme, capacité à simplifier les idées complexes et à inspirer son entourage.
 * Défis : Éviter l'éparpillement ou la dispersion de son énergie dans trop de projets à la fois ; il doit apprendre à canaliser son flux créatif vers des objectifs précis.

🎭 2. La Vibration du Jour de Naissance : Le 17 (Vibration 8 / Saturne & Étoile)

Né un 17, il porte une sous-vibration de puissance matérielle et spirituelle :

 * Le 17 (1+7 = 8) : Dans la tradition, le 17 est la carte de l'Étoile (la protection divine et la bonne étoile) associée au chiffre 8 (le pouvoir, l'ambition, la maîtrise financière et la justice).
 * Impact : Le 1 apporte la décision, le 7 apporte la sagesse/l'esprit, et le 8 concrétise le tout dans la matière. Cela donne à Jean un sens des affaires aiguisé et une forte résilience financière.

♎ 3. Ancrage Astrologique : Balance ♎ (3ème Décan - Gouverné par Mercure & Vénus)

 * Signe Solaire : Balance ♎ (Né le 17 octobre) : En tant que Balance du 3ème décan, l'influence de Mercure renforce considérablement son agilité intellectuelle, son sens de la stratégie et son aisance dans le commerce des idées.
 * Alliance Balance (Air) & Chemin de Vie 3 (Verbe/Expression) : C'est la signature d'un stratège de la communication. Il possède un sens inné de la diplomatie, de la négociation et du partenariat. Il sait comment présenter n'importe quel projet pour le rendre attractif et convaincant.

🎯 Domaines de Compétences de Krizoua Yako Jean

 * Relations Publiques, Négociation & Commerce
 * Conseil, Coaching & Enseignement / Animation
 * Stratégie d'Entreprise & Management Relationnel

📊 Synthèse : Chemin 3 · Jour 17 (8) · Balance ♎
```

### Disclaimer (obligatoire sous la lecture)

Ces éléments sont proposés à titre informatif et de bien-être personnel. Ce n'est pas un destin figé, ni un avis médical, ni un diagnostic. Pour toute question de santé, consulte un·e professionnel·le de santé.

### Synthèse chiffres (rappel calcul P0)

| Élément | Valeur |
|---------|--------|
| Chemin de vie | **3** (Communicateur / Créateur) |
| Jour de naissance | **17** → vibration **8** |
| Signe solaire | **Balance**, **3e décan** |
| Compétences (texte) | RP / Négociation & Commerce · Conseil, Coaching & Enseignement · Stratégie d'Entreprise & Management Relationnel |

---

## Mapping maquettes

| Fichier | Rôle |
|---------|------|
| `mockups/index.html` | Écran `#/reading` + CTA depuis `#/path` / `#/astro` |
| `mockups/app.js` | `reduceDigits`, `lifePath`, `dayVibe`, `sunSignDecan`, `PATH_COPY` / `SIGN_COPY` / `DAY_VIBE_COPY` enrichis, `buildReading`, `renderReading` (cards Gemini), Krizoua verbatim |
| `mockups/styles.css` | Blocs lecture, synthèse, toggle persona |

**Personas démo :**

- **Aïcha** (profil app) — chemin 8, Vierge…  
- **Exemple KD : Krizoua** — toggle / chargement prérempli 17/10/1983 · Sinfra

---

## Hors scope P0

- Master numbers  
- Thème natal complet (heure / maisons)  
- Export PDF / partage social  
- Contenu payant Hostinger  

---

*Template Lecture Chemin v0 — Cycle & Astro · King Daveblessing · Abidjan*
