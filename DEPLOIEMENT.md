# Deploiement Render

Le projet est pret pour Render avec le fichier `render.yaml`.

## Etapes

1. Aller sur `https://dashboard.render.com`.
2. Se connecter au compte Render.
3. Choisir `New` puis `Blueprint`.
4. Connecter le depot GitHub :

```txt
https://github.com/charlyoff/OFFRY_Charly_Devoir_Applique_Port_Russell
```

5. Selectionner le fichier `render.yaml`.
6. Renseigner les variables d'environnement :

```txt
MONGODB_URI=...
SESSION_SECRET=une-longue-phrase-secrete
SEED_ADMIN_USERNAME=capitainerie
SEED_ADMIN_EMAIL=admin@portrussell.local
SEED_ADMIN_PASSWORD=Password123!
```

7. Deployer.
8. Ouvrir le shell Render ou une commande one-off, puis lancer :

```bash
npm run seed
```

## Valeurs a remettre dans le livrable

Une fois Render deploye, completer `LIVRABLE.md` avec :

```txt
Lien application : https://...
Email : admin@portrussell.local
Mot de passe : Password123!
```

