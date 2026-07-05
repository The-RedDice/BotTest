# Bot de Rappel Patriotique de l'EF

Ce bot Discord surveille un utilisateur spécifique et lui rappelle de cesser de jouer à des jeux futiles pour se consacrer au développement du bot de l'EF, pour la gloire de l'Empire Français.

## Jeux Surveillés

Le bot détecte et envoie des messages personnalisés pour :
- **Cyberpunk 2077**
- **Minecraft**
- **R.E.P.O**
- **Phasmophobia**
- **Geometry Dash**

## Fonctionnalités

- **Surveillance de Présence** : Détecte quand la cible joue à un jeu surveillé.
- **Rappels en MP** : Envoie un message patriotique toutes les 30 minutes.
- **Mode IA (OpenRouter)** : Si activé, utilise une IA pour générer des messages uniques et créatifs. Utilise des modèles gratuits par défaut.
- **Mode Adaptatif (Énervement)** : Le bot devient de plus en plus agressif/patriotique à mesure que le temps passe (compatible avec l'IA).
- **Félicitations** : Le bot envoie un message de félicitations (IA ou manuel) quand l'utilisateur quitte son jeu.
- **Logs de l'Empire** : Notifications dans un salon de logs.
- **Configuration Dynamique** : Modifiez les réglages via des commandes Slash.

## Commandes Slash (Admin seulement)

- `/config-target [user_id]` : Définit l'utilisateur à surveiller.
- `/config-logs [#channel]` : Définit le salon de logs.
- `/config-adaptive [true/false]` : Active/désactive l'énervement progressif.
- `/config-ai [enabled] [model]` : Active l'IA et définit le modèle OpenRouter (ex: `google/gemma-7b-it:free`).
- `/status` : Affiche la configuration actuelle.

## Configuration du Bot Discord

1. Allez sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. Créez une nouvelle application et un bot.
3. **Privileged Gateway Intents** : Activez **"Presence Intent"** et **"Server Members Intent"**.
4. **OAuth2 URL Generator** : Sélectionnez les scopes `bot` et `applications.commands`.
5. Invitez le bot sur votre serveur.

## Installation et Lancement

1. Clonez ce dépôt.
2. Installez les dépendances : `npm install`
3. Créez un fichier `.env` :
   ```env
   DISCORD_TOKEN=votre_token
   CLIENT_ID=votre_application_id
   TARGET_USER_ID=1401153828195139757
   OPENROUTER_API_KEY=votre_cle_openrouter
   ```
4. Lancez le bot : `node index.js`

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
