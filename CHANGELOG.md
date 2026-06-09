(# Changelog des erreurs connues et solutions proposées)

Ce document recense les problèmes identifiés dans le projet et des solutions recommandées. 

## 1) Variables d'environnement manquantes ou non vérifiées
- Fichiers / endroits: backend/config/db.js, backend/seeder.js, backend/controllers/authController.js, gateway/routes/*.js, microservices/notifications/index.js, frontend/src/services/api.js
- Problème: le code lit directement `process.env.*` (MONGO_URI, JWT_SECRET, NOTIFI_SERVICE_URL, STOCK_SERVICE_URL, EMAIL_USER, EMAIL_APPLICATION_PASSWORD, REACT_APP_API_BASE_URL, etc.) sans validation. Si ces variables sont absentes, les appels échoueront ou produiront des valeurs `undefined` (ex: `undefined/api`).
- Solution: documenter et fournir un `.env.example`; ajouter une validation au démarrage (logger + exit clair) ou des valeurs par défaut de développement ; vérifier et rendre explicites les messages d'erreur quand une variable requise est absente.

## 2) Fuites de log / informations sensibles
- Fichiers / endroits: backend/middlewares/authMiddleware.js, controllers/*.js, microservices/notifications/index.js, frontend logs
- Problème: de nombreux `console.log`/`console.error` affichent des tokens, variables d'environnement et informations potentiellement sensibles (ex: `console.log(process.env.EMAIL_APPLICATION_PASSWORD)`).
- Solution: supprimer les logs sensibles en production; utiliser un logger configuré (p.ex. `winston`) avec niveaux d'environnement; ne jamais logger de tokens, mots de passe, ou variables sensibles.

## 3) Incohérences route/controller (paramètres)
- Fichiers / endroits: backend/routes/orderRoutes.js vs backend/controllers/orderController.js
- Problème: les routes utilisent des paramètres de chemin (`/:id`, `/:orderId/status`, `/:id/validate`) mais certains contrôleurs lisent `req.body.orderId` ou `req.body` au lieu de `req.params`. Par exemple `deleteOrder` lit `req.body.orderId` alors que la route est `DELETE /:id`. De même `validateOrder` attend `orderId` dans le body alors que la route fournit `:id`.
- Solution: harmoniser - soit changer les routes pour envoyer les identifiants dans le body, soit (recommandé) modifier les contrôleurs pour utiliser `req.params.id`/`req.params.orderId`. Implémenter les opérations réelles (p.ex. `Order.findByIdAndDelete(id)` pour `deleteOrder`).

## 4) Appels réseau hardcodés et portabilité Docker
- Fichiers / endroits: backend/controllers/orderController.js (appel à `http://localhost:8000/notify` et `http://localhost:8000/update-stock`), microservices
- Problème: appels vers `localhost` fonctionnent en développement local mais échouent dans des conteneurs Docker où les services sont accessibles par nom de service ou via un gateway. De plus, appel direct au port 8000 peut contourner le gateway prévu.
- Solution: utiliser des variables d'environnement pour l'URL du gateway/service (ex: `GATEWAY_URL` ou `NOTIFI_URL`) et construire les URLs dynamiquement. Dans un environnement docker-compose, utiliser les noms de services (ex: `http://gateway:8000/notify`) ou appeler le gateway si c'est l'intention.

## 5) Proxies du gateway sans validation
- Fichiers / endroits: gateway/routes/notifi.js, gateway/routes/stock.js
- Problème: `express-http-proxy` est initialisé avec `process.env.NOTIFI_SERVICE_URL` / `STOCK_SERVICE_URL` sans vérification — valeur `undefined` provoquera des erreurs au runtime.
- Solution: vérifier la présence des variables au démarrage et afficher une erreur claire si elles manquent ; fournir une valeur par défaut en dev ou désactiver la route proprement.

## 6) Frontend: `REACT_APP_API_BASE_URL` non défini
- Fichiers / endroits: frontend/src/services/api.js et pages qui utilisent `process.env.REACT_APP_API_BASE_URL`
- Problème: si la variable d'environnement de build n'est pas définie, `API_BASE_URL` devient `undefined/api` et les requêtes échouent.
- Solution: documenter la variable (`.env.example`), ajouter une assertion au démarrage (ou un fallback `http://localhost:5000` en dev), et gérer proprement les erreurs réseau côté frontend.

## 7) Gestion des erreurs et validations manquantes
- Fichiers / endroits: controllers (p.ex. productController.getProducts n'a pas de bloc try/catch), route handlers en général
- Problème: certaines routes n'enrobent pas les accès DB dans des try/catch, donc une erreur de DB peut provoquer une réponse non gérée.
- Solution: ajouter `try/catch` et renvoyer des réponses d'erreur cohérentes (JSON standardisé). Centraliser un middleware d'erreur pour uniformiser les réponses.

## 8) Sécurité des envois d'email
- Fichiers / endroits: microservices/notifications/index.js
- Problème: utilisation de Gmail avec mot de passe d'application; le code logge les identifiants et ne gère pas les erreurs de configuration.
- Solution: utiliser des secrets dans l'orchestrateur (docker secrets, variables CI), ne pas logger les credentials, documenter l'utilisation d'un mot de passe d'application Gmail ou d'un fournisseur d'envoi d'emails (SendGrid, Mailgun) et ajouter des tests de connexion au démarrage.

## 9) Bonnes pratiques recommandées (non bloquantes mais utiles)
- Remplacer `console.log` par un logger structuré (`winston`, `pino`).
- Ajouter des tests d'intégration élémentaires pour les routes critiques (auth, orders, notifications).
- Fournir un `README.md` ou `CONTRIBUTING.md` avec étapes de démarrage local (variables env requises, commandes `npm install` et `npm run dev`), et un `.env.example`.

## 10) Entrées spécifiques détectées (exemples rapides)
- `backend/middlewares/authMiddleware.js`: Log du token (`console.log(token)`) — supprimer/masquer.
- `backend/controllers/orderController.js`: `deleteOrder` et `validateOrder` incomplètes — corriger utilisation de `req.params` et implémenter suppression/validation.
- `microservices/notifications/index.js`: logs de `process.env.EMAIL_*` — supprimer.
- `frontend/src/services/api.js`: possible `API_BASE_URL` undefined — ajouter garde ou fallback.

---

Si vous voulez, je peux:
- Générer un `.env.example` listant les variables requises.
- Rédiger des correctifs ciblés (pull requests) sans exécuter le code de production.
- Mettre en place une checklist de démarrage pour Docker/Local.

Faites-moi savoir la suite souhaitée.

