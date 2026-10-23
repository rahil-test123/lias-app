# Gestion du stock, des demandes et des affectations

## Utilisation

Ouvrir **Matériels & stocks** dans la navigation, ou `/materiels`. Les administrateurs et directeurs accèdent aux six vues de gestion. Les autres membres conservent la consultation du matériel sans accès aux dossiers des demandeurs ni aux commandes de distribution.

1. **Stock** : créer une référence avec nom, catégorie libre, état, description, date et quantité initiale. Les catégories proposées ne sont pas limitatives. Utiliser la même catégorie pour les références pouvant répondre au même besoin. La recherche et le filtre de catégorie couvrent tout le stock des responsables.
2. **Bénéficiaires** : enregistrer une personne externe ou sélectionner un membre existant, avec son service ou département. Le lien au membre permet de prendre en compte ses anciennes attributions pour la même catégorie.
3. **Demandes** : choisir le bénéficiaire, le matériel, la quantité, la priorité et la nécessité de 1 à 5, la date et le motif. Le critère spécifique de 0 à 100 permet de traduire un critère local de l'administrateur, à justifier dans le motif. Une demande est conservée même si le stock est nul.
4. **Réception** : enregistrer un nouveau lot. Le stock augmente, la réception est historisée, puis une proposition de répartition est affichée. Aucune distribution n'est enregistrée automatiquement.
5. **Répartition** : examiner l'ordre des personnes, leur besoin restant et ce qu'elles ont déjà reçu dans la catégorie. Ajuster les quantités, puis ouvrir le récapitulatif et confirmer explicitement les affectations.
6. **Historique & archives** : retrouver les anciennes et nouvelles affectations, réceptions, décisions et changements d'ordre. Refuser ou annuler une demande exige un motif. L'annulation d'une affectation exige un motif et correspond à un retour physique du matériel : la quantité redevient disponible.
7. **Statistiques** : consulter les indicateurs réels, les dernières opérations et les distributions par mois et catégorie. Les filtres couvrent le matériel, la catégorie, le bénéficiaire via la recherche, le service, les dates et le statut, selon les données applicables à chaque vue. Les indicateurs de tête sont globaux ; les tableaux de statistiques appliquent les filtres.

La fiche d'un membre montre son historique de matériel, avec les affectations actives et annulées. Les anciennes fonctions d'attribution directe sont conservées, sécurisées et tracées ; leurs résultats apparaissent dans le même historique.

## Priorisation

Le score utilise les poids configurables suivants :

`nécessité × poids + priorité × poids + ancienneté (jours, maximum 365) × poids + critère spécifique × poids − quantités déjà reçues dans cette catégorie × pénalité`

Valeurs initiales : besoin 30, priorité 20, ancienneté 1, critère spécifique 1, pénalité par unité déjà reçue 50. Les affectations annulées ne pénalisent plus le bénéficiaire. Une personne déjà servie peut déposer de nouvelles demandes ; elle n'est jamais exclue automatiquement.

L'ordre est : rang manuel éventuel, score décroissant, date de demande, date de création, identifiant. Un motif est obligatoire pour modifier le rang ou les règles. Un rang vide rétablit le classement automatique. Les changements sont conservés dans le journal.

Les demandes peuvent être en attente, partiellement satisfaites, satisfaites, refusées ou annulées. Une demande déjà partiellement servie conserve son identité et ses quantités ; pour exprimer un nouveau besoin, créer une nouvelle demande plutôt que réécrire l'ancienne.

## Fiabilité et préservation des données

- Les opérations utilisent des transactions et des verrous sur le stock et les demandes. Les quantités disponibles et les besoins restants sont revérifiés à la confirmation.
- Une validation en lot est atomique : si une ligne échoue, aucune ligne du lot n'est conservée.
- Des clés d'opération uniques empêchent une double soumission de réception ou d'affectation d'augmenter le stock ou de créer une affectation supplémentaire.
- Les anciennes attributions et les nouvelles affectations utilisent le même calcul de disponibilité. Deux stocks distincts de la même catégorie ne peuvent pas surservir une demande commune.
- L'action d'ancienne suppression du matériel archive désormais la référence et conserve toutes les opérations. Une référence archivée ne peut plus recevoir de stock ou être distribuée ; elle peut être restaurée depuis les archives.
- Les anciennes révocations conservent désormais l'attribution annulée. Les nouvelles affectations enregistrent le bénéficiaire, le matériel et la catégorie au moment de l'opération ainsi que le responsable, la date, le statut et les remarques.
- Les modifications du stock sont tracées avec leurs valeurs précédentes et suivantes. Une correction de quantité exige un motif dans les remarques ; les nouveaux lots doivent passer par **Enregistrer une réception**.
- Le changement de type d'une référence déjà associée à des demandes est refusé afin de ne pas casser leur correspondance ; créer une référence pour un autre type.

Les huit références et les dix-sept attributions historiques qui existaient avant les essais ont été conservées. Les anciens responsables et anciennes réceptions non enregistrés ne sont pas inventés. Les références anciennes sans catégorie utilisent leur nom comme catégorie de repli ; compléter leur type et leur état dans l'écran de modification avant de créer les nouvelles demandes.

## Configuration

Aucune nouvelle dépendance ni configuration locale n'est nécessaire. Les nouvelles tables sont ajoutées par la configuration Hibernate `ddl-auto=update` existante : bénéficiaires, demandes, réceptions, affectations, règles et journal. Les tables historiques sont enrichies sans réinitialisation. Les nouvelles fonctionnalités utilisent le même backend Spring Boot, MySQL et React Query.

## Vérifications

- `mvn test` : huit tests réussis, dont cinq couvrant le stock, les règles, les demandes partielles, l'archivage, la compatibilité historique et les permissions.
- `npm run build` et `npm run lint` : compilation et vérification frontend réussies.
- Scénario 10 équipements / 15 personnes : 10 affectations, 5 demandes conservées ; après une nouvelle réception, les 5 personnes restantes sont proposées et servies.
- Répétition d'une réception et d'une affectation avec la même clé : aucune double comptabilisation.
- Essais HTTP simultanés sur une seule unité : une validation réussit, l'autre est refusée ; le stock ne devient pas négatif.
- Lot excessif : refus complet sans affectation partielle conservée.
- Essais simultanés sur deux références d'une même catégorie pour une demande de trois unités : une première affectation de deux est acceptée, une seconde de deux est refusée ; le complément d'une unité satisfait exactement la demande.
- Navigateur : création de demande sans stock, réception, proposition automatique et confirmation explicite testées.
- Affichage mobile contrôlé à 390 × 844, sans débordement horizontal de la page ; navigation mobile accessible par un bouton Menu.

Les scripts dans `docs/verification/stock-concurrence.ps1` et `stock-multi-reference.ps1` créent des données temporaires identifiées dans un fichier JSON. Ils sont destinés à une base locale de test et nécessitent le nettoyage ciblé de ces données après exécution. Les données créées durant cette intervention ont été retirées après les vérifications.
