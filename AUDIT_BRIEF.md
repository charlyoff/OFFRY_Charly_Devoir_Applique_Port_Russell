# Audit du brief PDF

Ce fichier reprend le brief point par point et indique ou chaque demande est
couverte dans le projet.

## Mission generale

| Exigence du PDF | Statut | Ou c'est couvert |
| --- | --- | --- |
| Application web de gestion des reservations de catway | OK | Application Express/EJS complete |
| API privee pour la capitainerie | OK | Routes protegees par session dans `src/middleware/auth.js` |
| Partie frontend simple pour gerer les informations | OK | Vues EJS dans `src/views/` |
| Application Express avec MongoDB | OK | `src/app.js`, `src/config/database.js`, modeles Mongoose |
| Systeme d'authentification | OK | `POST /login`, `GET /logout`, sessions, bcrypt |
| Alimenter MongoDB avec catways et reservations fournies | OK | `data/*.json` et `scripts/seed.js` |
| API conforme aux fonctionnalites demandees | OK | Routes catways, reservations et users |
| Page d'accueil avec connexion et documentation API | OK | `GET /`, `src/views/index.ejs` |
| Tableau de bord utilisateur connecte | OK | `GET /dashboard`, `src/views/dashboard.ejs` |
| Depot GitHub | OK | `https://github.com/charlyoff/OFFRY_Charly_Devoir_Applique_Port_Russell` |
| Documentation API | OK | `GET /documentation`, `src/views/api-docs.ejs` |
| Deploiement | A finaliser | Projet pret pour Render, voir `DEPLOIEMENT.md` |

## Donnees

| Exigence du PDF | Statut | Ou c'est couvert |
| --- | --- | --- |
| User: `username` | OK | `src/models/User.js` |
| User: `email` | OK | `src/models/User.js`, unique et format email |
| User: `password` | OK | `src/models/User.js`, hash bcrypt |
| Controle email unique | OK | Index unique Mongoose |
| Longueur minimale du mot de passe | OK | `src/controllers/userController.js` |
| Catway: `catwayNumber` unique | OK | `src/models/Catway.js` |
| Catway: `catwayType` long ou short | OK | Enum Mongoose + controle controleur |
| Catway: `catwayState` | OK | `src/models/Catway.js` |
| Reservation: `catwayNumber` | OK | `src/models/Reservation.js` |
| Reservation: `clientName` | OK | `src/models/Reservation.js` |
| Reservation: `boatName` | OK | `src/models/Reservation.js` |
| Reservation: `startDate` | OK | `src/models/Reservation.js` |
| Reservation: `endDate` | OK | Controle date de fin apres date de debut |
| Import des fichiers JSON fournis | OK | `npm run seed` |

## Fonctionnalites catways

| Route demandee | Statut | Route du projet |
| --- | --- | --- |
| `GET /catways` | OK | `src/routes/catwayRoutes.js` |
| `GET /catways/:id` | OK | `src/routes/catwayRoutes.js` |
| `POST /catways` | OK | `src/routes/catwayRoutes.js` |
| `PUT /catways/:id` | OK | Modifie seulement `catwayState` |
| `DELETE /catways/:id` | OK | Supprime aussi les reservations liees |

Le PDF precise que `id` represente le numero de catway. Le projet utilise bien
`catwayNumber` pour ces routes.

## Fonctionnalites reservations

| Route demandee | Statut | Route du projet |
| --- | --- | --- |
| `GET /catways/:id/reservations` | OK | `src/routes/reservationRoutes.js` |
| `GET /catway/:id/reservations/:idReservation` | OK | Alias singulier ajoute |
| `POST /catways/:id/reservations` | OK | `src/routes/reservationRoutes.js` |
| `PUT /catways/:id/reservations` | OK | Attend `reservationId` dans le corps |
| `DELETE /catway/:id/reservations/:idReservation` | OK | Alias singulier ajoute |

Le projet ajoute aussi la variante plus pratique
`PUT /catways/:id/reservations/:reservationId`.

## Fonctionnalites utilisateurs

| Route demandee | Statut | Route du projet |
| --- | --- | --- |
| `GET /users/` | OK | `GET /users` |
| `GET /users/:email` | OK | `src/routes/userRoutes.js` |
| `POST /users/` | OK | `POST /users` |
| `PUT /users/:email` | OK | `src/routes/userRoutes.js` |
| `DELETE /users/:email` | OK | `src/routes/userRoutes.js` |
| `POST /login` | OK | `src/routes/authRoutes.js` |
| `GET /logout` | OK | `src/routes/authRoutes.js` |

Express accepte `/users` et `/users/` avec la configuration par defaut.

## Pages attendues

| Page demandee | Statut | Route du projet |
| --- | --- | --- |
| Page d'accueil `/` | OK | Presentation, formulaire de connexion, lien documentation |
| Page CRUD catways | OK | `/catways` + `/catways/:id` |
| Page CRUD reservations | OK | `/reservations` + details par catway |
| Page CRUD utilisateurs | OK | `/users` + `/users/:email` |
| Tableau de bord | OK | `/dashboard` |
| Menu vers pages et deconnexion | OK | `src/views/partials/nav.ejs` |
| Lien documentation API dans le menu | OK | `src/views/partials/nav.ejs` |
| Nom et email utilisateur connecte | OK | Sidebar et session |
| Date du jour | OK | Dashboard |
| Tableau des reservations en cours | OK | Dashboard |
| Pages listes/details/formulaires | OK | Dossiers `src/views/catways`, `reservations`, `users` |

## Exigences ajoutees dans le texte utilisateur

| Exigence | Statut | Ou c'est couvert |
| --- | --- | --- |
| Moteur de modeles EJS/Pug/Handlebars | OK | EJS |
| Code commente avec JSDOC | OK | Controleurs, modeles, middleware, seed, serveur |
| Documentation API manuelle ou Swagger | OK | Documentation manuelle `/documentation` |
| Lien GitHub | OK | `LIVRABLE.md` |
| Lien application hebergee + identifiants | A finaliser | Le lien heberge reste a remplir apres Render |

## Conclusion

Le brief est couvert. Le seul element qui reste externe au code est le lien de
l'application hebergee, car il depend de la connexion au compte Render ou
Netlify.
