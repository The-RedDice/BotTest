require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    ActivityType,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// Configuration initiale
const CONFIG_PATH = path.join(__dirname, 'config.json');
let config = {
    targetUserId: process.env.TARGET_USER_ID || '1401153828195139757',
    logChannelId: null
};

function loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        } catch (err) {
            console.error("Erreur lors de la lecture de config.json:", err);
        }
    }
}

function saveConfig() {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (err) {
        console.error("Erreur lors de la sauvegarde de config.json:", err);
    }
}

loadConfig();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers,
    ],
});

const REMINDER_INTERVAL = 30 * 60 * 1000; // 30 minutes

const GAME_CONFIGS = [
    {
        key: 'cyberpunk',
        searchTerms: ['cyberpunk'],
        messages: [
            "Soldat ! L'Empire Français compte sur vous. Cessez vos activités futiles dans Night City et reprenez immédiatement le développement du bot de l'EF !",
            "L'Empereur Napoléon lui-même serait déçu de vous voir perdre votre temps sur Cyberpunk. Au travail !"
        ]
    },
    {
        key: 'minecraft',
        searchTerms: ['minecraft'],
        messages: [
            "Soldat ! Cessez de poser des blocs de terre et venez bâtir les fondations numériques de l'Empire !",
            "L'Empire ne s'est pas construit en minant des cubes. Posez votre pioche !"
        ]
    },
    {
        key: 'repo',
        searchTerms: ['r.e.p.o', 'repo'],
        messages: [
            "Soldat ! Récupérer des objets pour une corporation ? L'Empire est la seule entité digne de votre dévouement !",
            "L'Empereur n'accepte aucun retard. Cessez vos expéditions dans R.E.P.O !"
        ]
    },
    {
        key: 'phasmophobia',
        searchTerms: ['phasmophobia'],
        messages: [
            "Soldat ! Les seuls fantômes qui doivent vous préoccuper sont les bugs du bot de l'EF !",
            "L'Empire n'a pas peur des esprits. Quittez cette chasse aux fantômes !"
        ]
    }
];

const activeReminders = new Map(); // userId -> { gameKey, intervalId }

// --- LOGGING ---
async function logToChannel(message) {
    if (!config.logChannelId) return;
    try {
        const channel = await client.channels.fetch(config.logChannelId);
        if (channel && channel.isTextBased()) {
            await channel.send(`📜 **[LOGS EMPIRE]** ${message}`);
        }
    } catch (err) {
        console.error("Erreur lors de l'envoi des logs:", err);
    }
}

// --- UTILS ---
function getGameConfig(activities) {
    if (!activities) return null;
    for (const game of GAME_CONFIGS) {
        if (activities.some(activity =>
            activity.type === ActivityType.Playing &&
            activity.name &&
            game.searchTerms.some(term => activity.name.toLowerCase().includes(term))
        )) {
            return game;
        }
    }
    return null;
}

// --- SLASH COMMANDS REGISTRATION ---
const commands = [
    new SlashCommandBuilder()
        .setName('config-target')
        .setDescription('Configure l\'ID de l\'utilisateur à surveiller')
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('L\'ID Discord de la cible')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('config-logs')
        .setDescription('Configure le salon de logs')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le salon où envoyer les logs')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Affiche la configuration actuelle du bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Début du rafraîchissement des slash commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('Slash commands enregistrées avec succès.');
    } catch (error) {
        console.error(error);
    }
}

// --- HANDLERS ---
async function handlePresenceChange(oldPresence, newPresence) {
    if (!newPresence || newPresence.userId !== config.targetUserId) return;

    const gameConfig = getGameConfig(newPresence.activities);
    const currentReminder = activeReminders.get(newPresence.userId);

    if (gameConfig) {
        if (!currentReminder || currentReminder.gameKey !== gameConfig.key) {
            if (currentReminder) clearInterval(currentReminder.intervalId);

            await logToChannel(`L'utilisateur <@${newPresence.userId}> a commencé à jouer à **${gameConfig.key}**.`);

            sendReminder(newPresence.userId, gameConfig);
            const intervalId = setInterval(() => {
                sendReminder(newPresence.userId, gameConfig);
            }, REMINDER_INTERVAL);

            activeReminders.set(newPresence.userId, { gameKey: gameConfig.key, intervalId });
        }
    } else {
        if (currentReminder) {
            await logToChannel(`L'utilisateur <@${newPresence.userId}> a arrêté de jouer à **${currentReminder.gameKey}**.`);
            clearInterval(currentReminder.intervalId);
            activeReminders.delete(newPresence.userId);
        }
    }
}

async function sendReminder(userId, config) {
    try {
        const user = await client.users.fetch(userId);
        if (user) {
            const message = config.messages[Math.floor(Math.random() * config.messages.length)];
            await user.send(`🇫🇷 **MESSAGE DE L'EMPIRE** 🇫🇷\n\n${message}`);
            console.log(`Rappel [${config.key}] envoyé à ${user.tag}`);
        }
    } catch (error) {
        console.error(`Erreur d'envoi MP à ${userId}:`, error);
    }
}

// --- BOT EVENTS ---
client.once('ready', async () => {
    console.log(`Bot prêt : ${client.user.tag}`);
    if (process.env.CLIENT_ID) await registerCommands();

    // Init check
    try {
        const guilds = await client.guilds.fetch();
        for (const [guildId] of guilds) {
            const guild = await client.guilds.fetch(guildId);
            try {
                const member = await guild.members.fetch(config.targetUserId);
                if (member && member.presence) {
                    handlePresenceChange(null, member.presence);
                    break;
                }
            } catch (e) {}
        }
    } catch (err) { console.error(err); }
});

client.on('presenceUpdate', handlePresenceChange);

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'config-target') {
        const newId = interaction.options.getString('user_id');
        config.targetUserId = newId;
        saveConfig();

        // Reset reminders if target changed
        for (const [uid, rem] of activeReminders) {
            clearInterval(rem.intervalId);
        }
        activeReminders.clear();

        await interaction.reply({ content: `✅ Cible mise à jour : <@${newId}> (${newId})`, ephemeral: true });
        await logToChannel(`Nouvelle cible configurée par ${interaction.user.tag} : <@${newId}>`);
    }

    if (interaction.commandName === 'config-logs') {
        const channel = interaction.options.getChannel('channel');
        config.logChannelId = channel.id;
        saveConfig();
        await interaction.reply({ content: `✅ Salon de logs mis à jour : ${channel}`, ephemeral: true });
        await logToChannel(`Ce salon a été configuré pour les logs par ${interaction.user.tag}.`);
    }

    if (interaction.commandName === 'status') {
        await interaction.reply({
            content: `📊 **Statut de l'Empire** :\n- **Cible** : <@${config.targetUserId}>\n- **Logs** : ${config.logChannelId ? `<#${config.logChannelId}>` : 'Non configuré'}\n- **Intervalle** : 30 minutes`,
            ephemeral: true
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
