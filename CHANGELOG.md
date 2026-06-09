(# Changelog des erreurs connues et solutions proposées)

Ce document recense les problèmes identifiés dans le projet et des solutions recommandées. 

## Backend

### 1) Variables d'environnement manquantes ou non vérifiées
- Fichiers / endroits: backend/config/db.js, backend/seeder.js, backend/controllers/authController.js
- Problème: le code lit directement `process.env.*` (MONGO_URI, JWT_SECRET, etc.) sans validation. Si ces variables sont absentes, les appels échoueront ou produiront des valeurs `undefined`.
- Solution: documenter et fournir un `.env.example`; ajouter une validation au démarrage (logger + exit clair) ou des valeurs par défaut de développement ; vérifier et rendre explicites les messages d'erreur quand une variable requise est absente.

### 2) Fuites de log / informations sensibles
- Fichiers / endroits: backend/middlewares/authMiddleware.js, controllers/*.js
- Problème: `console.log`/`console.error` affichent des tokens et données sensibles (ex: token). Exemple: `authMiddleware.js` logge le token.
- Solution: supprimer les logs sensibles en production; utiliser un logger configuré (p.ex. `winston`) avec niveaux d'environnement; ne jamais logger de tokens, mots de passe, ou variables sensibles.

### 3) Incohérences route/controller (paramètres)
- Fichiers / endroits: backend/routes/orderRoutes.js vs backend/controllers/orderController.js
- Problème: les routes définissent des paramètres (`/:id`, `/:orderId/status`) mais certains contrôleurs lisent `req.body.orderId` ou `req.body`. Ex: `deleteOrder` lit `req.body.orderId` alors que la route est `DELETE /:id`.
- Solution: harmoniser - recommandé: modifier les contrôleurs pour utiliser `req.params.id`/`req.params.orderId`. Implémenter `Order.findByIdAndDelete(id)` pour `deleteOrder` et validation correcte pour `validateOrder`.

### 4) Gestion des erreurs et validations manquantes
- Fichiers / endroits: controllers (p.ex. productController.getProducts n'a pas de bloc try/catch)
- Problème: certaines routes n'enrobent pas les accès DB dans des try/catch, donc une erreur de DB peut provoquer une réponse non gérée.
- Solution: ajouter `try/catch` et renvoyer des réponses d'erreur cohérentes (JSON standardisé).

### 5) Entrées spécifiques (Backend)
- `backend/middlewares/authMiddleware.js`: Log du token (`console.log(token)`) — supprimer/masquer.

### 6) Ajout
- Fichier backend/controllers/orderController.js
- Ajout : J'&i ajouter des variables d'environnement pour les rêquetes de notification ainsi que de mis a jour des stocks

## Frontend

### 1) `REACT_APP_API_BASE_URL` non défini
- Fichiers / endroits: frontend/src/services/api.js et pages qui utilisent `http://localhost:5000`
- Problème: si le port utilisé est un autre il faudra changer manuellement partout ou ce sera en dure.
- Solution: documenter la variable (`.env.example`).

### 2) Fuites de logs côté client
- Fichiers / endroits: frontend (divers fichiers)
- Problème: `console.log` montre potentiellement des tokens ou données (ex: affichage du token dans `createOrder`).
- Solution: supprimer logs sensibles; utiliser une gestion d'erreur utilisateur-friendly.

### 3) Entrées spécifiques (Frontend)
- `frontend/src/services/api.js`: possible `API_BASE_URL` undefined — ajouter garde ou fallback.


## Gateway

### 1) Proxies sans validation
- Fichiers / endroits: gateway/routes/notifi.js, gateway/routes/stock.js, gateway/server.js
- Problème: `express-http-proxy` est initialisé avec `process.env.NOTIFI_SERVICE_URL` / `STOCK_SERVICE_URL` sans vérification — valeur `undefined` provoquera des erreurs au runtime. Le gateway utilise aussi `process.env.GATEWAY_PORT` et `PORT` sans validation.
- Solution: vérifier la présence des variables au démarrage et afficher une erreur claire si elles manquent ; fournir une valeur par défaut en dev ou désactiver la route proprement.

### 2) Appels réseau vs usage du gateway
- Fichiers / endroits: backend/controllers/orderController.js (appels directs à `http://localhost:8000/notify`)
- Problème: certains services appellent `localhost` au lieu d'appeler le gateway, contournant ainsi la couche de routage.
- Solution: utiliser le gateway via variables d'environnement (`GATEWAY_URL`) ou config docker-compose pour que tous les appels passent par le même point d'entrée.


## Microservices (Notifications, Stock Management)

### 1) Sécurité et configuration des emails
- Fichiers / endroits: microservices/notifications/index.js
- Problème: utilisation de Gmail avec mot de passe d'application; le code logge les identifiants et ne gère pas les erreurs de configuration.
- Solution: utiliser des secrets dans l'orchestrateur (docker secrets, variables CI), ne pas logger les credentials, documenter l'utilisation d'un mot de passe d'application Gmail ou d'un fournisseur d'envoi d'emails (SendGrid, Mailgun) et ajouter des tests de connexion au démarrage.

### 2) Logs et portée des services
- Fichiers / endroits: microservices/*
- Problème: logs verbeux qui peuvent exposer des secrets ou polluer la sortie en production.
- Solution: adopter un logger avec niveaux, réduire le bruit en production, et vérifier les variables d'environnement au démarrage.


## Recommandations globales
- Fournir un `.env.example` listant les variables requises pour chaque service (backend, frontend, gateway, microservices).
- Remplacer `console.log` par un logger structuré (`winston`, `pino`).
- Ajouter des tests d'intégration élémentaires pour les routes critiques (auth, orders, notifications).
- Fournir un `README.md` ou `CONTRIBUTING.md` avec étapes de démarrage local (variables env requises, commandes `npm install` et `npm run dev`) et un guide Docker/compose.



