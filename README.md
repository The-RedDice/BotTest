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
- **Mode Adaptatif (Énervement)** : Si activé, le bot devient de plus en plus agressif/patriotique à mesure que le temps passe sans que l'utilisateur n'arrête de jouer.
- **Félicitations** : Le bot envoie un message de félicitations quand l'utilisateur quitte enfin son jeu.
- **Logs de l'Empire** : Envoie des notifications dans un salon de logs.
- **Configuration Dynamique** : Modifiez les réglages via des commandes Slash.

## Commandes Slash (Admin seulement)

- `/config-target [user_id]` : Définit l'utilisateur à surveiller.
- `/config-logs [#channel]` : Définit le salon de logs.
- `/config-adaptive [true/false]` : Active ou désactive le mode adaptatif (énervement progressif).
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
   ```
4. Lancez le bot : `node index.js`

Vive l'Empire ! 🇫🇷
