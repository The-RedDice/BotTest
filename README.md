# Bot de Rappel Patriotique de l'EF

Ce bot Discord surveille un utilisateur spécifique et lui rappelle de cesser de jouer à Cyberpunk 2077 pour se consacrer au développement du bot de l'EF, pour la gloire de l'Empire Français.

## Fonctionnalités

- Surveille le statut (Presence) d'un utilisateur spécifique.
- Détecte quand l'utilisateur joue à Cyberpunk 2077.
- Envoie un message de rappel patriotique en MP dès le début du jeu.
- Répète le rappel toutes les 20 minutes tant que l'utilisateur continue de jouer.
- Aléatise les messages pour un impact patriotique maximal.

## Prérequis

- Node.js (version 16.9.0 ou supérieure)
- Un jeton (token) de bot Discord

## Configuration du Bot Discord

1. Allez sur le [Discord Developer Portal](https://discord.com/developers/applications).
2. Créez une nouvelle application et un bot.
3. **IMPORTANT** : Dans la section "Bot", activez l'option **"Presence Intent"** sous "Privileged Gateway Intents". Sans cela, le bot ne pourra pas voir à quoi joue l'utilisateur.
4. Activez également "Server Members Intent" pour permettre la récupération des informations utilisateur.
5. Invitez le bot sur un serveur où l'utilisateur cible est présent.

## Installation et Lancement

1. Clonez ce dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine du projet (copiez `.env.example`) :
   ```bash
   cp .env.example .env
   ```
4. Remplissez le `.env` avec votre jeton de bot et l'ID de l'utilisateur cible :
   ```env
   DISCORD_TOKEN=votre_token_ici
   TARGET_USER_ID=1401153828195139757
   ```
5. Lancez le bot :
   ```bash
   node index.js
   ```

## Structure des fichiers

- `index.js` : Le code source principal du bot.
- `.env` : Fichier de configuration (non inclus dans Git).
- `package.json` : Dépendances et scripts.

Vive l'Empire ! 🇫🇷
