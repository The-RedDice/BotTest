# Bot de Rappel Patriotique de l'EF

Ce bot Discord surveille un utilisateur spécifique et lui rappelle de cesser de jouer à des jeux futiles pour se consacrer au développement du bot de l'EF, pour la gloire de l'Empire Français.

## Jeux Surveillés

Le bot détecte et envoie des messages personnalisés pour :
- **Cyberpunk 2077**
- **Minecraft**
- **R.E.P.O**

## Fonctionnalités

- Surveille le statut (Presence) d'un utilisateur spécifique.
- Envoie un message de rappel patriotique adapté au jeu détecté dès le début de la session.
- Répète le rappel toutes les 20 minutes tant que l'utilisateur continue de jouer.
- Aléatise les messages pour un impact patriotique maximal.

## Prérequis

- Node.js (version 16.9.0 ou supérieure)
- Un jeton (token) de bot Discord

## Configuration du Bot Discord

1. Allez sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. Créez une nouvelle application et un bot.
3. **IMPORTANT** : Dans la section "Bot", activez l'option **"Presence Intent"** sous "Privileged Gateway Intents". Sans cela, le bot ne pourra pas voir à quoi joue l'utilisateur.
4. Activez également "Server Members Intent".
5. Invitez le bot sur un serveur où l'utilisateur cible est présent.

## Installation et Lancement

1. Clonez ce dépôt (ou copiez les fichiers `index.js`, `package.json`, `.env.example`).
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine du projet :
   ```env
   DISCORD_TOKEN=votre_token_ici
   TARGET_USER_ID=1401153828195139757
   ```
4. Lancez le bot :
   ```bash
   node index.js
   ```

## Setup sur Oracle Cloud (Ubuntu)

Voici la marche à suivre pour héberger le bot sur une instance Oracle Cloud Ubuntu :

1. **Installation de Node.js** :
   ```bash
   sudo apt update
   sudo apt install -y ca-certificates curl gnupg
   sudo mkdir -p /etc/apt/keyrings
   curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
   NODE_MAJOR=20
   echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
   sudo apt update
   sudo apt install nodejs -y
   ```

2. **Récupération du code** :
   Clonez votre dépôt ou transférez les fichiers via SCP/SFTP.

3. **Installation des dépendances** :
   ```bash
   cd chemin/vers/le/bot
   npm install
   ```

4. **Configuration** :
   Créez le fichier `.env` comme expliqué plus haut.

5. **Gestion du processus avec PM2** (pour que le bot tourne 24h/24) :
   ```bash
   sudo npm install -g pm2
   pm2 start index.js --name "bot-ef"
   pm2 save
   pm2 startup
   ```

Note : Le dossier `node_modules` contient les bibliothèques nécessaires au fonctionnement du bot mais ne doit pas être modifié ou inclus dans vos transferts de code (utilisez `npm install` pour le régénérer).

Vive l'Empire ! 🇫🇷
