# Deploiement Render

Le projet est deploye sur Render.

```txt
https://port-russell-charly-api.onrender.com
```

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

## Valeurs du livrable

Les valeurs a rendre sont :

```txt
Lien application : https://port-russell-charly-api.onrender.com
Email : admin@portrussell.local
Mot de passe : Password123!
```

## Depannage Render gratuit

Si le lien `Consulter la documentation API` affiche temporairement `Not Found`,
essayer directement :

```txt
https://port-russell-charly-api.onrender.com/documentation
```

Si la connexion redirige vers une page `Not Found`, essayer directement :

```txt
https://port-russell-charly-api.onrender.com/dashboard
```

Render gratuit peut mettre quelques minutes a stabiliser une application juste
apres sa creation. Attendre 1 a 2 minutes, faire Ctrl + F5, puis au besoin
lancer `Manual Deploy -> Deploy latest commit` dans Render.
