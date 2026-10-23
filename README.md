# LIAS — Application Web de Gestion de Laboratoire

Plateforme web fullstack pour la gestion administrative et scientifique du **Laboratoire d'Informatique et Applications (LIAS)** — Faculté Ben M'sik, Université Hassan II, Casablanca.

## Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 · Vite 8 · TailwindCSS 3 · React Query |
| Backend | Spring Boot 3.5 · Java 17 · Spring Security · JWT |
| Base de données | MySQL 8 · Spring Data JPA · Hibernate |

## Modules

- **Tableau de bord** — statistiques annuelles en temps réel
- **Membres** — gestion des membres (Permanent, Doctorant, Associé)
- **Équipes** — équipes de recherche et affiliations
- **Publications** — articles, conférences, thèses
- **Événements** — conférences, workshops, séminaires
- **Matériels** — inventaire et attribution
- **Adhésions** — traitement des demandes d'adhésion
- **Notifications** — alertes automatiques
- **Historique** — journal d'audit des actions

## Installation

### Backend
```bash
cd lias-backend
# Copier et configurer le fichier de propriétés
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Renseigner vos identifiants MySQL dans application.properties
# Définir DB_PASSWORD (mot de passe MySQL) et JWT_SECRET (secret aléatoire d'au moins 32 caractères)
mvn spring-boot:run
```

### Frontend
```bash
cd lias-frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:3000`  
L'API backend tourne sur `http://localhost:8081`

Les fichiers `application.properties`, les dossiers `uploads/` (CV/PV) et les captures de vérification restent locaux et ne sont pas publiés.
La base MySQL n'est pas incluse dans Git : Hibernate crée ou met à jour le schéma et `data.sql` fournit les données d'exemple.
Les comptes de `data.sql` sont destinés au développement. Pour une base vide sans ces données, configurer `app.bootstrap-admin.email` et `app.bootstrap-admin.password` pour initialiser l'administrateur ; un compte existant est conservé.

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | rahil.msouhli123@gmail.com | [voir encadrant] |
| Directeur | directeur@lias.ma | [voir encadrant] |
| Membre | wafaa@gmail.com | [voir encadrant] |

## Auteur

**Rahil Msouhli** — Projet de Fin d'Études · 2025–2026  
Faculté des Sciences Ben M'sik — Université Hassan II, Casablanca
