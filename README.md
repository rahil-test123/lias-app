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
mvn spring-boot:run
```

### Frontend
```bash
cd lias-frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`  
L'API backend tourne sur `http://localhost:8081`

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@lias.ma | [voir encadrant] |
| Directeur | directeur@lias.ma | [voir encadrant] |
| Membre | membre@lias.ma | [voir encadrant] |

## Auteur

**Rahil Msouhli** — Projet de Fin d'Études · 2025–2026  
Faculté des Sciences Ben M'sik — Université Hassan II, Casablanca
