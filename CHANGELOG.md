# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
versioning selon [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Unreleased]

> Les corrections listées dans `KNOWN_ISSUES.md` sont en cours de traitement.
> Elles seront déplacées ici une fois appliquées et validées.

# Backend
- Validation des variables d'environnement au démarrage (`MONGO_URI`, `JWT_SECRET`)
- Suppression des logs de tokens sensibles (`authMiddleware`)
- Correction `req.body` → `req.params` dans `orderController` (`deleteOrder`, `validateOrder`)
- Ajout des `try/catch` manquants dans `productController`

# Frontend
- Ajout d'un fallback / assertion pour `REACT_APP_API_BASE_URL`
- Suppression des logs sensibles (token dans `createOrder`)
- Ajout uniquement pour les admin d'un lien de redirection a la page `/admin`
- Une fois déconnecter le cart se détruit


# Gateway
- Validation de `NOTIFI_SERVICE_URL` / `STOCK_SERVICE_URL` au démarrage
- Remplacement des appels `localhost:8000` par la variable `GATEWAY_URL`

# Microservices
- Suppression des logs de credentials dans `notifications/index.js`
- Mise en place d'un logger avec niveaux pour tous les microservices

---

## [1.0.0] - 2026-06-09

### Added

# Backend
- Mise en place du serveur Express et connexion MongoDB
- Authentification JWT via `authController`
- Gestion des commandes (`orderController`, `orderRoutes`)
- Gestion des produits (`productController`)
- Middleware d'authentification (`authMiddleware`)

# Frontend
- Initialisation de l'application React
- Service API centralisé (`frontend/src/services/api.js`)

# Gateway
- Proxy gateway vers les services notifications et stock via `express-http-proxy`

# Microservices
- Microservice de notifications par email (Gmail)
- Microservice de gestion du stock

---

<!--
  Template pour les prochaines versions :

## [x.y.z] - YYYY-MM-DD

### Fixed
# Backend
- ...
# Frontend
- ...

### Added
# Backend
- ...

### Changed / Removed / Security
- ...
-->