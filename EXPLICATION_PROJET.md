# Explication du projet Port Russell

## Objectif du devoir

Le but du projet est de créer une application web pour le Port de Plaisance
Russell. Cette application permet à la capitainerie de gérer les catways, les
réservations et les utilisateurs.

Le projet répond au brief avec :

- une application Express connectée à MongoDB ;
- des pages réalisées avec le moteur de modèles EJS ;
- un système d'authentification ;
- un tableau de bord privé ;
- des opérations CRUD sur les catways, les réservations et les utilisateurs ;
- une documentation API accessible depuis l'application ;
- du code commenté avec JSDOC.

## Technologies utilisées

- Node.js : environnement JavaScript côté serveur.
- Express : framework serveur pour créer les routes.
- EJS : moteur de modèles pour générer les pages HTML.
- MongoDB : base de données NoSQL.
- Mongoose : outil pour créer les modèles et communiquer avec MongoDB.
- bcrypt : hachage sécurisé des mots de passe.
- express-session : gestion de la session utilisateur.
- connect-mongo : stockage des sessions dans MongoDB.
- method-override : permet aux formulaires HTML d'envoyer des actions PUT et DELETE.

## Fonctionnement général

Quand l'utilisateur arrive sur la page d'accueil `/`, il voit une présentation
rapide de l'application, un formulaire de connexion et un lien vers la
documentation de l'API.

Après connexion, l'utilisateur est redirigé vers `/dashboard`. Le tableau de
bord affiche :

- le nom et l'adresse email de l'utilisateur connecté ;
- la date du jour ;
- le nombre de catways, de réservations et d'utilisateurs ;
- les réservations en cours.

Depuis le menu, l'utilisateur peut accéder aux pages :

- `/catways` pour gérer les catways ;
- `/reservations` pour gérer les réservations ;
- `/users` pour gérer les utilisateurs ;
- `/documentation` pour lire les routes de l'API ;
- `/logout` pour se déconnecter.

## Gestion des catways

Les catways possèdent trois informations :

- `catwayNumber` : numéro unique du catway ;
- `catwayType` : type du catway, soit `long`, soit `short` ;
- `catwayState` : description de l'état du catway.

Routes principales :

```txt
GET    /catways
GET    /catways/:id
POST   /catways
PUT    /catways/:id
DELETE /catways/:id
```

Le numéro et le type ne sont pas modifiables après création. Seule la
description de l'état du catway peut être modifiée, comme demandé dans le brief.

## Gestion des réservations

Les réservations sont liées à un catway. Elles contiennent :

- `catwayNumber` : numéro du catway réservé ;
- `clientName` : nom du client ;
- `boatName` : nom du bateau ;
- `startDate` : date de début ;
- `endDate` : date de fin.

Routes principales :

```txt
GET    /reservations
GET    /catways/:id/reservations
GET    /catways/:id/reservations/:reservationId
POST   /catways/:id/reservations
PUT    /catways/:id/reservations
PUT    /catways/:id/reservations/:reservationId
DELETE /catways/:id/reservations/:reservationId
```

Le projet vérifie que la date de fin est après la date de début. Il vérifie
aussi qu'une réservation ne chevauche pas une autre réservation sur le même
catway.

La route `PUT /catways/:id/reservations` correspond à la route indiquée dans le
brief. Dans ce cas, l'identifiant de la réservation est transmis dans le corps
de la requête avec le champ `reservationId`.

## Gestion des utilisateurs

Les utilisateurs possèdent :

- `username` : nom d'utilisateur ;
- `email` : adresse email unique ;
- `password` : mot de passe haché avec bcrypt.

Routes principales :

```txt
GET    /users
GET    /users/:email
POST   /users
PUT    /users/:email
DELETE /users/:email
```

Les mots de passe ne sont jamais stockés en clair dans MongoDB. Ils sont hachés
avec bcrypt avant l'enregistrement.

## Sécurité mise en place

Le projet contient plusieurs protections :

- les routes privées demandent une session connectée ;
- le mot de passe est haché avec bcrypt ;
- l'email utilisateur est unique ;
- les entrées sont vérifiées avant d'être enregistrées ;
- les dates de réservation sont contrôlées ;
- les sessions sont stockées dans MongoDB avec `connect-mongo` ;
- les variables sensibles sont dans `.env`, qui n'est pas envoyé sur GitHub.

## Import des données

Les fichiers fournis par le devoir sont dans le dossier `data` :

```txt
data/catways.json
data/reservations.json
```

Pour importer les données dans MongoDB, on utilise :

```bash
npm run seed
```

Cette commande ajoute ou met à jour les catways et les réservations. Elle crée
aussi un compte de démonstration pour se connecter.

## Compte de démonstration

```txt
Email : admin@portrussell.local
Mot de passe : Password123!
```

Ces identifiants peuvent être changés dans les variables d'environnement avant
de lancer l'import.

## Documentation API

La documentation API est disponible dans l'application à l'adresse :

```txt
/documentation
```

Elle liste les routes principales pour les catways, les réservations, les
utilisateurs et l'authentification.

## Fichiers importants

```txt
src/app.js                      configuration principale Express
src/server.js                   lancement du serveur
src/config/database.js          connexion MongoDB
src/models/Catway.js            modèle Mongoose des catways
src/models/Reservation.js       modèle Mongoose des réservations
src/models/User.js              modèle Mongoose des utilisateurs
src/controllers/                logique métier
src/routes/                     routes Express
src/views/                      pages EJS
src/public/css/styles.css       style de l'application
scripts/seed.js                 import des données initiales
README.md                       documentation technique
LIVRABLE.md                     liens à rendre
DEPLOIEMENT.md                  aide au déploiement Render
```

## Ce qu'il faut dire simplement à l'oral

J'ai développé une application Express pour gérer les catways du Port Russell.
L'application utilise MongoDB pour stocker les catways, les réservations et les
utilisateurs. Les pages sont générées avec EJS. L'utilisateur se connecte depuis
la page d'accueil, puis il accède à un tableau de bord privé. Depuis ce tableau
de bord, il peut créer, lire, modifier et supprimer les catways, les
réservations et les utilisateurs.

J'ai aussi mis en place des contrôles de sécurité : les routes privées demandent
une session connectée, les mots de passe sont hachés avec bcrypt, les données
sont validées avant l'enregistrement et les variables sensibles sont stockées
dans le fichier `.env`.

Enfin, j'ai ajouté une documentation API accessible depuis l'application et un
script `npm run seed` pour importer les fichiers JSON fournis dans la base
MongoDB.
