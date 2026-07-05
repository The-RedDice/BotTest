# Bot de Rappel Patriotique de l'EF

Ce bot Discord surveille un utilisateur spécifique et lui rappelle de cesser de jouer à des jeux futiles pour se consacrer au développement du bot de l'EF, pour la gloire de l'Empire Français.

## Jeux Surveillés

- **Mode Normal** : Cyberpunk 2077, Minecraft, R.E.P.O, Phasmophobia, Geometry Dash.
- **Mode IA (Puter)** : **TOUS** les jeux détectés par Discord sont supportés !

## Fonctionnalités

- **Surveillance de Présence** : Détecte quand la cible joue à un jeu.
- **Rappels en MP** : Envoie un message patriotique toutes les 30 minutes.
- **Mode IA (Puter.js)** : Utilise l'IA de Puter pour générer des messages uniques et créatifs pour n'importe quel jeu.
- **Mode Adaptatif (Énervement)** : Le bot devient de plus en plus agressif/patriotique à mesure que le temps passe (compatible avec l'IA).
- **Félicitations** : Le bot envoie un message de félicitations quand l'utilisateur quitte son jeu.
- **Logs de l'Empire** : Notifications dans un salon de logs.
- **Configuration Dynamique** : Modifiez les réglages via des commandes Slash.

## Commandes Slash (Admin seulement)

- `/config-target [user_id]` : Définit l'utilisateur à surveiller.
- `/config-logs [#channel]` : Définit le salon de logs.
- `/config-adaptive [true/false]` : Active/désactive l'énervement progressif.
- `/config-ai [enabled] [model]` : Active l'IA Puter (modèle par défaut: `gpt-4o-mini`).
- `/status` : Affiche la configuration actuelle.

## Installation et Lancement

1. Clonez ce dépôt.
2. Installez les dépendances : `npm install`
3. Créez un fichier `.env` basé sur `.env.example` :
   ```env
   DISCORD_TOKEN=votre_token
   CLIENT_ID=votre_application_id
   TARGET_USER_ID=1401153828195139757
   PUTER_AUTH_TOKEN=votre_token_puter
   ```
4. Lancez le bot : `node index.js`

## Setup sur Oracle Cloud (Ubuntu)

1. **Installation de Node.js** :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
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
