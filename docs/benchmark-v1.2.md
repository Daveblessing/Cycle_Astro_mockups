# Benchmark Cycle & Astro · v1.2.0 (6 octobre 2026)

But : voir ce que proposent les grandes applis de cycle menstruel et d’astrologie, puis ajouter à Cycle & Astro ce qui marche **entièrement sur le téléphone** (localStorage, aucun serveur, aucun paiement). Bien-être seulement, pas un avis médical.

## Applis de cycle menstruel

**Flo**
- Prévisions de règles et d’ovulation, calendrier, historique des cycles (durée moyenne, variation).
- 70+ symptômes et humeurs, motifs du corps, rapport de fin de cycle, rapport médecin (iOS).
- Rappels liés au cycle, assistant santé (IA), auto-évaluation SOPK/endométriose (Premium).
- Sources : https://flo.health/product-tour/tracking-cycle · https://help.flo.health/hc/en-us/articles/4407228784276-Analyzing-your-cycles-and-symptoms · https://flo.health/flo-premium

**Clue**
- « Cycle Phase Insights » : fiche de la phase en cours (humeur, énergie, concentration).
- Onglet Analyse : statistiques de cycle, symptômes récurrents par phase, comparaison des cycles.
- Rappels : règles bientôt, règles prévues, retard, changement de phase, check-in quotidien.
- Sources : https://support.helloclue.com/hc/en-us/articles/30091944010141 · https://support.helloclue.com/hc/en-us/articles/14561714219677 · https://helloclue.com/articles/how-to-use-clue/how-to-use-clue-plus

**Stardust**
- Cycle relié aux phases de la Lune, calendrier lunaire, horoscope du jour mêlant thème et phase.
- Tarot quotidien, partage du cycle avec amies/partenaire, conseils par phase (alimentation, travail, mouvement).
- Sources : https://www.stardust.app/faq · https://www.stardust.app/app-features · https://apps.apple.com/us/app/stardust-period-tracker/id1495829322

**Natural Cycles** (fonctions seulement)
- Température pour situer l’ovulation, graphique du cycle, « Cycle Insights » : durée moyenne, phases folliculaire/lutéale, tendances, suivi des symptômes, rapport PDF.
- Sources : https://help.naturalcycles.com/hc/en-us/articles/12124980280477 · https://help.naturalcycles.com/hc/en-us/articles/9209631867933

**Ovia / Period Tracker (Period Calendar)**
- Saisie règles, flux, humeurs, symptômes par catégories, sommeil, notes ; invites quotidiennes ; rappels règles/ovulation ; sauvegarde.
- Sources : https://ovuline.helpshift.com/hc/en/3-ovia/faq/923-how-should-i-track-my-fertility/ · https://www.oviahealth.com/guide/105891/health-tracking-symptoms/ · https://play.google.com/store/apps/details?id=com.popularapp.periodcalendar

## Applis d’astrologie

**Co–Star** : horoscope du jour personnalisé, transits mis en avant, compatibilité avec des amis, « Ask the stars » (IA, payant).
Source : https://www.costarastrology.com/faq

**The Pattern** : portrait de personnalité, cycles en cours (transits), « Bonds » (compatibilité), « Time Travel » (voir le ciel d’une date passée ou future), conversation IA.
Sources : https://www.thepattern.com/app-features · https://thepattern.zendesk.com/hc/en-us/articles/4409939517972-What-is-the-Time-Travel-feature

**CHANI** : horoscopes du jour, lecture de la phase et du signe de la Lune, méditations, journal avec questions de réflexion.
Source : https://www.chani.com/app

**Sanctuary** : horoscope du jour, transits, tarot, lectures en direct avec des astrologues (payant).
Source : https://shop.sanctuaryworld.co/pages/our-app

**TimePassages** : ciel du moment (Soleil, Lune, phase lunaire, Mercure rétrograde), horoscope par transits, thème natal, compatibilité, révolutions solaires.
Source : https://astrograph.com/timepassages/mobile

## Ce qu’on a ajouté dans la v1.2.0

| Option ajoutée | Inspirée de | Verrou |
|---|---|---|
| Calendrier de septembre en 4 couleurs foncées + légende + repère du jour | Clue, Flo (calendrier) | Cycle |
| Frise des 4 phases avec « tu es ici » (écran Cycle et calculateur) | Clue (vue cycle), Natural Cycles | Cycle |
| Phases de la Lune sur le calendrier du cycle (calculées) | Stardust | Cycle |
| Conseils par phase : énergie, humeur, soin de soi, alimentation, mouvement | Clue Cycle Phase Insights, Stardust | Cycle |
| Rappels agenda : fichier .ics (règles sur 3 cycles + phases, rappel la veille) | Clue, Flo (rappels) | Cycle |
| Historique des règles + cycle moyen, règles moyennes, min–max, « utiliser dans le calculateur » | Flo, Clue, Natural Cycles | Cycle |
| Tendances par phase depuis le journal (énergie, humeur, sensations) + check-in à une date choisie | Clue Analyse, Flo, Natural Cycles | Cycle |
| Question du jour du journal selon la phase et la Lune | CHANI | Cycle (journal) |
| Horoscope du jour par signe solaire | Co–Star, Sanctuary, CHANI | Astro |
| Ciel du jour · voyage dans le temps (planète du jour, Soleil, Lune, phase, % éclairé) | TimePassages, The Pattern | Astro |
| Compatibilité des signes solaires (note sur 5 + texte) | Co–Star, The Pattern Bonds, TimePassages | Astro |

## Ce qu’on n’a pas pris, et pourquoi

| Option | Raison |
|---|---|
| Assistant santé IA, « Ask the stars », conversation IA | Demande un serveur ; risque d’avis médical |
| Auto-évaluation SOPK / endométriose, rapport médecin | Médical : hors bien-être |
| Fenêtre fertile, température, tests d’ovulation, mode contraception | Jamais contraception ni conseil de fertilité ; l’ovulation reste une estimation |
| Partage avec amies / partenaire, communauté | Comptes et serveur nécessaires |
| Lectures en direct avec astrologues | Serveur et paiement |
| Notifications push | Pas de serveur : remplacées par le fichier .ics |
| Montres connectées, sommeil, pas | Pas de capteurs dans une page web |
| Mode grossesse | Hors périmètre, médical |
| Tarot, méditations audio | Contenu à produire ; possible plus tard |
| Thème natal complet, transits des autres planètes | Demande des éphémérides lourdes ; seuls Soleil et Lune sont calculés |
