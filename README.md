# Bot de Rappel Patriotique de l'EF

Ce bot Discord surveille un utilisateur spécifique et lui rappelle de cesser de jouer à des jeux futiles pour se consacrer au développement du bot de l'EF, pour la gloire de l'Empire Français.

## Jeux Surveillés

- **Mode Normal** : Cyberpunk 2077, Minecraft, R.E.P.O, Phasmophobia, Geometry Dash.
- **Mode IA (OpenRouter)** : **TOUS** les jeux détectés par Discord sont supportés !

## Fonctionnalités

- **Surveillance de Présence** : Détecte quand la cible joue à un jeu.
- **Rappels en MP** : Envoie un message patriotique toutes les 30 minutes.
- **Mode IA (OpenRouter)** : Utilise l'IA pour générer des messages uniques et créatifs pour n'importe quel jeu.
- **Mode Adaptatif (Énervement)** : Le bot devient de plus en plus agressif/patriotique à mesure que le temps passe (compatible avec l'IA et le mode manuel).
- **Félicitations** : Le bot envoie un message de félicitations quand l'utilisateur quitte son jeu.
- **Logs de l'Empire** : Notifications dans un salon de logs.
- **Configuration Dynamique** : Modifiez les réglages via des commandes Slash.

## Commandes Slash (Admin seulement)

- `/config-target [user_id]` : Définit l'utilisateur à surveiller.
- `/config-logs [#channel]` : Définit le salon de logs.
- `/config-adaptive [true/false]` : Active/désactive l'énervement progressif.
- `/config-ai [enabled] [model]` : Active l'IA pour tous les jeux détectés.
- `/status` : Affiche la configuration actuelle.

## Configuration du Bot Discord

1. Allez sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. **Privileged Gateway Intents** : Activez **"Presence Intent"** et **"Server Members Intent"**.
3. **OAuth2 URL Generator** : Scopes `bot` et `applications.commands`.

## Installation et Lancement

1. Clonez ce dépôt et `npm install`.
2. Créez un fichier `.env` :
   ```env
   DISCORD_TOKEN=votre_token
   CLIENT_ID=votre_application_id
   TARGET_USER_ID=1401153828195139757
   OPENROUTER_API_KEY=votre_cle_openrouter
   ```
3. Lancez le bot : `node index.js`

Vive l'Empire ! 🇫🇷
