# Bot de Rappel Patriotique de l'EF

Ce bot Discord surveille un utilisateur spécifique et lui rappelle de cesser de jouer à des jeux futiles pour se consacrer au développement du bot de l'EF, pour la gloire de l'Empire Français.

## Jeux Surveillés

Le bot détecte et envoie des messages personnalisés pour :
- **Cyberpunk 2077**
- **Minecraft**
- **R.E.P.O**
- **Phasmophobia**

## Fonctionnalités

- **Surveillance de Présence** : Détecte quand la cible joue à un jeu surveillé.
- **Rappels en MP** : Envoie un message patriotique toutes les 30 minutes.
- **Logs de l'Empire** : Envoie des notifications dans un salon de logs quand l'utilisateur commence/arrête de jouer.
- **Configuration Dynamique** : Modifiez la cible et le salon de logs via des commandes Slash.

## Commandes Slash (Admin seulement)

- `/config-target [user_id]` : Définit l'utilisateur à surveiller.
- `/config-logs [#channel]` : Définit le salon où envoyer les notifications d'activité.
- `/status` : Affiche la configuration actuelle.

## Configuration du Bot Discord

1. Allez sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. Créez une nouvelle application et un bot.
3. **Privileged Gateway Intents** : Activez **"Presence Intent"** et **"Server Members Intent"**.
4. **OAuth2 URL Generator** : Sélectionnez les scopes `bot` et `applications.commands`.
5. **Permissions du bot** : `Read Messages/View Channels`, `Send Messages`, `Embed Links`.
6. Invitez le bot sur votre serveur.

## Installation et Lancement

1. Clonez ce dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` basé sur `.env.example` :
   ```env
   DISCORD_TOKEN=votre_token
   CLIENT_ID=votre_application_id
   TARGET_USER_ID=1401153828195139757
   ```
4. Lancez le bot :
   ```bash
   node index.js
   ```

## Setup sur Oracle Cloud (Ubuntu)

1. **Installation de Node.js** :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
2. **Gestion avec PM2** :
   ```bash
   sudo npm install -g pm2
   pm2 start index.js --name "bot-ef"
   pm2 save
   pm2 startup
   ```

Vive l'Empire ! 🇫🇷
