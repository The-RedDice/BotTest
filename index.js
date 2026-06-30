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

const activeReminders = new Map();

const patrioticMessages = [
    "Soldat ! L'Empire Français compte sur vous. Cessez vos activités futiles dans Night City et reprenez immédiatement le développement du bot de l'EF ! Le sort de la nation est entre vos mains.",
    "L'Empereur Napoléon lui-même serait déçu de vous voir perdre votre temps sur Cyberpunk alors que le bot de l'EF n'attend que votre code. Au travail, pour la Gloire de l'Empire !",
    "Citoyen ! La technologie de 2077 est une illusion. La seule réalité qui compte est le développement du bot de l'EF. Quittez ce jeu et servez la patrie !",
    "Pendant que vous jouez, les ennemis de l'Empire progressent. Montrez votre dévouement : fermez Cyberpunk et développez le bot de l'EF !",
    "Le drapeau tricolore flotte, mais il ne flottera pas éternellement sans votre contribution au bot de l'EF. Déposez cette manette et reprenez le clavier !",
];

function getRandomMessage() {
    return patrioticMessages[Math.floor(Math.random() * patrioticMessages.length)];
}

client.once('ready', () => {
    console.log(`Bot prêt en tant que ${client.user.tag}`);
    console.log(`Cible surveillée : ${TARGET_USER_ID}`);
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (!newPresence || newPresence.userId !== TARGET_USER_ID) return;

    const activities = newPresence.activities;
    const isPlayingCyberpunk = activities.some(activity =>
        activity.type === ActivityType.Playing &&
        activity.name.toLowerCase().includes('cyberpunk')
    );

    if (isPlayingCyberpunk) {
        if (!activeReminders.has(newPresence.userId)) {
            console.log(`L'utilisateur ${newPresence.userId} a commencé à jouer à Cyberpunk. Lancement de la procédure de rappel.`);

            // Premier rappel immédiat
            sendReminder(newPresence.userId);

            // Configuration de l'intervalle pour les suivants
            const interval = setInterval(() => {
                sendReminder(newPresence.userId);
            }, REMINDER_INTERVAL);

            activeReminders.set(newPresence.userId, interval);
        }
    } else {
        // Si l'utilisateur n'est plus en train de jouer à Cyberpunk
        if (activeReminders.has(newPresence.userId)) {
            console.log(`L'utilisateur ${newPresence.userId} a arrêté de jouer à Cyberpunk. Fin de la procédure de rappel.`);
            clearInterval(activeReminders.get(newPresence.userId));
            activeReminders.delete(newPresence.userId);
        }
    }
});

async function sendReminder(userId) {
    try {
        const user = await client.users.fetch(userId);
        if (user) {
            await user.send(`🇫🇷 **MESSAGE DE L'EMPIRE** 🇫🇷\n\n${getRandomMessage()}`);
            console.log(`Rappel patriotique envoyé à ${user.tag} (${new Date().toLocaleTimeString()})`);
        }
    } catch (error) {
        console.error(`Erreur lors de l'envoi du message à l'utilisateur ${userId} :`, error);
    }
}

// Gestion des erreurs non capturées
client.on('error', console.error);
process.on('unhandledRejection', error => {
    console.error('Promesse non gérée :', error);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Échec de la connexion au bot Discord. Vérifiez votre jeton dans le fichier .env');
});
