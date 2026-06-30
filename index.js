require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
    ],
});

const TARGET_USER_ID = process.env.TARGET_USER_ID;
const REMINDER_INTERVAL = 20 * 60 * 1000; // 20 minutes

// Configuration des jeux et messages
const GAME_CONFIGS = [
    {
        key: 'cyberpunk',
        searchTerms: ['cyberpunk'],
        messages: [
            "Soldat ! L'Empire Français compte sur vous. Cessez vos activités futiles dans Night City et reprenez immédiatement le développement du bot de l'EF ! Le sort de la nation est entre vos mains.",
            "L'Empereur Napoléon lui-même serait déçu de vous voir perdre votre temps sur Cyberpunk alors que le bot de l'EF n'attend que votre code. Au travail, pour la Gloire de l'Empire !",
            "Citoyen ! La technologie de 2077 est une illusion. La seule réalité qui compte est le développement du bot de l'EF. Quittez ce jeu et servez la patrie !"
        ]
    },
    {
        key: 'minecraft',
        searchTerms: ['minecraft'],
        messages: [
            "Soldat ! Cessez de poser des blocs de terre et venez bâtir les fondations numériques de l'Empire ! Le bot de l'EF a besoin de vous.",
            "L'Empire ne s'est pas construit en minant des cubes. Posez votre pioche et reprenez votre clavier pour le bot de l'EF !",
            "Citoyen ! Les ressources de Minecraft sont virtuelles, mais le code du bot de l'EF est le moteur de notre souveraineté. Au travail !"
        ]
    },
    {
        key: 'repo',
        searchTerms: ['r.e.p.o', 'repo'],
        messages: [
            "Soldat ! Récupérer des objets pour une corporation ? L'Empire est la seule entité digne de votre dévouement ! Revenez sur le bot de l'EF.",
            "L'Empereur n'accepte aucun retard. Cessez vos expéditions dans R.E.P.O et concentrez-vous sur l'objectif principal : le bot de l'EF !",
            "Citoyen ! Votre quota de code pour l'Empire n'est pas atteint. Quittez R.E.P.O et servez la France sur le bot de l'EF !"
        ]
    }
];

const activeReminders = new Map(); // userId -> { gameKey, intervalId }

function getGameConfig(activities) {
    if (!activities) return null;
    for (const config of GAME_CONFIGS) {
        if (activities.some(activity =>
            activity.type === ActivityType.Playing &&
            activity.name &&
            config.searchTerms.some(term => activity.name.toLowerCase().includes(term))
        )) {
            return config;
        }
    }
    return null;
}

client.once('ready', async () => {
    console.log(`Bot prêt en tant que ${client.user.tag}`);
    console.log(`Cible surveillée : ${TARGET_USER_ID}`);

    // Vérification initiale de la présence au démarrage
    try {
        const guilds = await client.guilds.fetch();
        for (const [guildId] of guilds) {
            const guild = await client.guilds.fetch(guildId);
            try {
                const member = await guild.members.fetch(TARGET_USER_ID);
                if (member && member.presence) {
                    console.log(`Présence initiale détectée pour ${TARGET_USER_ID} dans le serveur ${guild.name}`);
                    handlePresenceChange(null, member.presence);
                    break; // On a trouvé l'utilisateur, on peut arrêter la boucle
                }
            } catch (e) {
                // L'utilisateur n'est probablement pas sur ce serveur
            }
        }
    } catch (error) {
        console.error("Erreur lors de la vérification initiale de présence :", error);
    }
});

async function handlePresenceChange(oldPresence, newPresence) {
    if (!newPresence || newPresence.userId !== TARGET_USER_ID) return;

    const gameConfig = getGameConfig(newPresence.activities);
    const currentReminder = activeReminders.get(newPresence.userId);

    if (gameConfig) {
        // Si l'utilisateur commence à jouer ou change pour un autre jeu surveillé
        if (!currentReminder || currentReminder.gameKey !== gameConfig.key) {

            // Si un rappel pour un autre jeu tournait déjà, on l'arrête
            if (currentReminder) {
                clearInterval(currentReminder.intervalId);
            }

            console.log(`L'utilisateur ${newPresence.userId} joue à ${gameConfig.key}. Lancement des rappels.`);

            // Premier rappel immédiat
            sendReminder(newPresence.userId, gameConfig);

            // Intervalle
            const intervalId = setInterval(() => {
                sendReminder(newPresence.userId, gameConfig);
            }, REMINDER_INTERVAL);

            activeReminders.set(newPresence.userId, { gameKey: gameConfig.key, intervalId });
        }
    } else {
        // Si l'utilisateur n'est plus sur un jeu surveillé
        if (currentReminder) {
            console.log(`L'utilisateur ${newPresence.userId} a arrêté de jouer. Fin des rappels.`);
            clearInterval(currentReminder.intervalId);
            activeReminders.delete(newPresence.userId);
        }
    }
}

client.on('presenceUpdate', handlePresenceChange);

async function sendReminder(userId, config) {
    try {
        const user = await client.users.fetch(userId);
        if (user) {
            const message = config.messages[Math.floor(Math.random() * config.messages.length)];
            await user.send(`🇫🇷 **MESSAGE DE L'EMPIRE** 🇫🇷\n\n${message}`);
            console.log(`Rappel [${config.key}] envoyé à ${user.tag} (${new Date().toLocaleTimeString()})`);
        }
    } catch (error) {
        console.error(`Erreur lors de l'envoi du message :`, error);
    }
}

client.on('error', console.error);
process.on('unhandledRejection', error => console.error('Promesse non gérée :', error));

client.login(process.env.DISCORD_TOKEN);
