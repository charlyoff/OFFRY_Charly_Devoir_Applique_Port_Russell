# Port de Plaisance Russell

Application Express/EJS de gestion des catways et reservations du Port de
Plaisance Russell.

## Fonctionnalites

- Authentification par session.
- Tableau de bord prive.
- CRUD des catways.
- CRUD des reservations.
- CRUD des utilisateurs.
- Import des fichiers `catways.json` et `reservations.json`.
- Documentation API manuelle accessible depuis `/documentation`.
- Code commente avec JSDOC.

## Stack

- Node.js
- Express
- EJS
- MongoDB avec Mongoose
- bcrypt
- express-session
- connect-mongo
- method-override

## Installation

```bash
npm install
```

Copier `.env.example` vers `.env`, puis renseigner :

```txt
PORT=3000
MONGODB_URI=...
SESSION_SECRET=...
SEED_ADMIN_USERNAME=capitainerie
SEED_ADMIN_EMAIL=admin@portrussell.local
SEED_ADMIN_PASSWORD=Password123!
```

Importer les donnees fournies :

```bash
npm run seed
```

Lancer l'application :

```bash
npm start
```

Adresse locale :

```txt
http://localhost:3000
```

## Compte de demonstration

Apres `npm run seed`, le compte par defaut est :

```txt
Email : admin@portrussell.local
Mot de passe : Password123!
```

Ces valeurs peuvent etre changees dans `.env` avant l'import.

## Routes principales

### Accueil et session

```txt
GET  /
GET  /login
GET  /home
GET  /accueil
POST /login
GET  /logout
GET  /dashboard
GET  /documentation
```

### Catways

```txt
GET    /catways
GET    /catways/:id
POST   /catways
PUT    /catways/:id
DELETE /catways/:id
```

### Reservations

```txt
GET    /reservations
GET    /catways/:id/reservations
GET    /catways/:id/reservations/:reservationId
POST   /catways/:id/reservations
PUT    /catways/:id/reservations
PUT    /catways/:id/reservations/:reservationId
DELETE /catways/:id/reservations/:reservationId
```

Les alias suivants sont aussi disponibles pour respecter le brief :

```txt
GET    /catway/:id/reservations/:reservationId
DELETE /catway/:id/reservations/:reservationId
```

La route `PUT /catways/:id/reservations` est conservee pour respecter la route
du brief. Elle attend l'identifiant de reservation dans le champ
`reservationId` du formulaire ou du corps de requete.

### Utilisateurs

```txt
GET    /users
GET    /users/:email
POST   /users
PUT    /users/:email
DELETE /users/:email
```

## Verification

```bash
npm run check
```

## Deploiement

L'application peut etre deployee sur Render, Railway, Fly.io ou tout autre
hebergeur Node.js compatible avec MongoDB Atlas.

Variables d'environnement a configurer chez l'hebergeur :

```txt
PORT
MONGODB_URI
SESSION_SECRET
SEED_ADMIN_USERNAME
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
```
