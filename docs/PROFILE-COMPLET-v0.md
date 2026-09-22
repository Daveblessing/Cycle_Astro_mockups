# Profil complet — Cycle & Astro v0

**Date :** 22 septembre 2026 · **Hub :** v3.3  
**UI :** `#/reading` (alias `#/profil-complet`) · multi-personnes

## Objectif

Toute personne saisit **prénom**, **nom**, **genre** (optionnel), **date**, **heure** (optionnelle), **ville** → obtient un **profil complet** soigné (chemin, astro, numérique, chance, invitations).  
Pas de contenu médical · pas de destin figé · suggestions symboliques uniquement.

## Formulaire

| # | Champ | Requis | Notes |
|---|--------|--------|-------|
| 1 | Prénom | oui | |
| 2 | Nom | non | Affiné expression / âme |
| 3 | Genre | non | Femme / Homme / Non précisé → ton elle/il/iel |
| 4 | Date de naissance | oui | Chemin · signe · décan · vib. jour |
| 5 | Heure | non (recommandée) | Note ascendant ; **jamais** de faux ascendant |
| 6 | Ville | non | Affichage identité |

CTA : **Générer mon profil complet**  
Persistance : `localStorage.ca_profile_v1` + liste **Profils récents** (`ca_profiles_recent_v1`, max 5).

## Sections de sortie

1. Identité (prénom nom · né(e) le … à … · heure)  
2. Synthèse pills : Chemin · Signe · Vibration jour · Élément  
3. Chemin de vie détaillé (dictionnaires Gemini)  
4. Astro (signe + décan + note heure/ascendant)  
5. Profil numérique (chemin, jour, expression, âme A=1…)  
6. Chiffres de chance (symboliques)  
7. Couleurs & parfums de chance (chemin × élément)  
8. Ce que tu peux cultiver / Axes d’attention  
9. Domaines · Plan 7 jours · Questions miroir  
10. Disclaimer bien-être  

## Conservé

- Krizoua **verbatim** (toggle)  
- Calculateur menstruation  
- Hub v3.3 / 4 piliers  

## Interdit

Médical, fertile, destin figé, Hostinger, casser calculator/Krizoua.
