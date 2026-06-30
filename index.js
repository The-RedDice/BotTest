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

// --- PERSISTENCE ---
const CONFIG_PATH = path.join(__dirname, 'config.json');
let config = {
    targetUserId: process.env.TARGET_USER_ID || '1401153828195139757',
    logChannelId: null,
    adaptiveMode: false
};

function loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            config = { ...config, ...JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) };
        } catch (err) { console.error("Erreur lecture config.json:", err); }
    }
}
function saveConfig() {
    try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2)); }
    catch (err) { console.error("Erreur sauvegarde config.json:", err); }
}
loadConfig();

// --- BOT SETUP ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers],
});

const REMINDER_INTERVAL = 30 * 60 * 1000;

// --- MESSAGES & CONFIG JEUX ---
const GAME_CONFIGS = [
    {
        key: 'Cyberpunk',
        searchTerms: ['cyberpunk'],
        congrats: "Félicitations soldat ! Vous avez quitté Night City. L'Empire est fier de votre retour au travail sur le bot de l'EF.",
        levels: [
            ["Soldat ! Cessez vos activités futiles dans Night City et reprenez le bot de l'EF !"],
            ["Caporal ! L'Empereur s'impatiente. Cyberpunk n'est pas une excuse. Au travail !"],
            ["TRAHISON ! Votre obsession pour Night City nuit à l'Empire ! CESSEZ IMMÉDIATEMENT !"]
        ]
    },
    {
        key: 'Minecraft',
        searchTerms: ['minecraft'],
        congrats: "Repos, mineur ! Vous avez enfin posé votre pioche. Place au code pour la France !",
        levels: [
            ["L'Empire ne s'est pas construit en minant des cubes. Posez votre pioche !"],
            ["Vos châteaux de sable numériques n'aideront pas la nation. Revenez au bot !"],
            ["VOUS CREEZ DES CUBES ALORS QUE L'EMPIRE S'EFFONDRE ? REPRENEZ LE CLAVIER !"]
        ]
    },
    {
        key: 'R.E.P.O',
        searchTerms: ['r.e.p.o', 'repo'],
        congrats: "Quota atteint... ou abandonné ? Peu importe, votre devoir envers l'Empire reprend maintenant !",
        levels: [
            ["L'Empire est la seule corporation qui mérite votre temps. Quittez R.E.P.O !"],
            ["Le quota de code pour l'EF est en retard ! Laissez ces objets et codez !"],
            ["VOUS PREFEREZ SERVIR UNE MACHINE PLUTÔT QUE L'EMPEREUR ? AU TRAVAIL !"]
        ]
    },
    {
        key: 'Phasmophobia',
        searchTerms: ['phasmophobia'],
        congrats: "Les spectres sont partis. Revenez dans la lumière de l'Empire et terminez le bot de l'EF !",
        levels: [
            ["Les seuls fantômes autorisés sont les bugs du bot de l'EF ! Lâchez cette lampe !"],
            ["Votre peur des esprits vous rend faible. L'Empire demande de la force et du code !"],
            ["ESPRIT, ES-TU LÀ ? OUI, ET IL VEUT QUE TU ARRÊTES DE JOUER ET QUE TU BOSSES !"]
        ]
    }
];

const activeReminders = new Map(); // userId -> { gameKey, intervalId, count }

// --- LOGGING ---
async function logToChannel(message) {
    if (!config.logChannelId) return;
    try {
        const channel = await client.channels.fetch(config.logChannelId);
        if (channel?.isTextBased()) await channel.send(`📜 **[LOGS EMPIRE]** ${message}`);
    } catch (err) { console.error("Erreur logs:", err); }
}

// --- UTILS ---
function getGameConfig(activities) {
    if (!activities) return null;
    for (const game of GAME_CONFIGS) {
        if (activities.some(act => act.type === ActivityType.Playing && act.name && game.searchTerms.some(t => act.name.toLowerCase().includes(t)))) return game;
    }
    return null;
}

// --- SLASH COMMANDS ---
const commands = [
    new SlashCommandBuilder().setName('config-target').setDescription('ID de l\'utilisateur à surveiller').addStringOption(o => o.setName('user_id').setDescription('ID Discord').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('config-logs').setDescription('Salon de logs').addChannelOption(o => o.setName('channel').setDescription('Salon textuel').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('config-adaptive').setDescription('Active/Désactive le mode adaptatif (énervement)').addBooleanOption(o => o.setName('enabled').setDescription('Activer ?').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('status').setDescription('Affiche la configuration').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(c => c.toJSON());

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Commands enregistrées.');
    } catch (e) { console.error(e); }
}

// --- HANDLERS ---
async function handlePresenceChange(oldPresence, newPresence) {
    if (!newPresence || newPresence.userId !== config.targetUserId) return;

    const gameConfig = getGameConfig(newPresence.activities);
    const current = activeReminders.get(newPresence.userId);

    if (gameConfig) {
        if (!current || current.gameKey !== gameConfig.key) {
            if (current) clearInterval(current.intervalId);

            await logToChannel(`Début de session : **${gameConfig.key}** pour <@${newPresence.userId}>.`);

            // Premier rappel
            sendReminder(newPresence.userId, gameConfig, 1);

            const intervalId = setInterval(() => {
                const session = activeReminders.get(newPresence.userId);
                if (session) {
                    session.count++;
                    sendReminder(newPresence.userId, gameConfig, session.count);
                }
            }, REMINDER_INTERVAL);

            activeReminders.set(newPresence.userId, { gameKey: gameConfig.key, intervalId, count: 1 });
        }
    } else if (current) {
        // Félicitations
        try {
            const user = await client.users.fetch(newPresence.userId);
            const game = GAME_CONFIGS.find(g => g.key === current.gameKey);
            await user.send(`🇫🇷 **VICTOIRE DE L'EMPIRE** 🇫🇷\n\n${game ? game.congrats : "Bien joué pour avoir arrêté de jouer !"}`);
            await logToChannel(`Fin de session (**${current.gameKey}**). Utilisateur félicité.`);
        } catch (e) {}

        clearInterval(current.intervalId);
        activeReminders.delete(newPresence.userId);
    }
}

async function sendReminder(userId, game, count) {
    try {
        const user = await client.users.fetch(userId);
        if (!user) return;

        let content = "";
        if (config.adaptiveMode) {
            // Choix du niveau de colère
            const levelIdx = count >= 3 ? 2 : (count >= 2 ? 1 : 0);
            const msgs = game.levels[levelIdx];
            content = msgs[Math.floor(Math.random() * msgs.length)];
        } else {
            // Mode normal : mélange de tous les niveaux
            const allMsgs = game.levels.flat();
            content = allMsgs[Math.floor(Math.random() * allMsgs.length)];
        }

        await user.send(`🇫🇷 **MESSAGE DE L'EMPIRE** 🇫🇷\n\n${content}`);
        console.log(`Rappel [${game.key}] #${count} envoyé à ${user.tag} (Mode: ${config.adaptiveMode ? 'Adaptatif' : 'Normal'})`);
    } catch (e) { console.error("Erreur envoi MP:", e); }
}

// --- EVENTS ---
client.once('ready', async () => {
    console.log(`Bot prêt : ${client.user.tag}`);
    if (process.env.CLIENT_ID) await registerCommands();

    const guilds = await client.guilds.fetch();
    for (const [gid] of guilds) {
        const g = await client.guilds.fetch(gid);
        try {
            const m = await g.members.fetch(config.targetUserId);
            if (m?.presence) { handlePresenceChange(null, m.presence); break; }
        } catch (e) {}
    }
});

client.on('presenceUpdate', handlePresenceChange);

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'config-target') {
        config.targetUserId = interaction.options.getString('user_id');
        saveConfig();
        for (const [_, rem] of activeReminders) clearInterval(rem.intervalId);
        activeReminders.clear();
        await interaction.reply({ content: `✅ Cible : <@${config.targetUserId}>`, ephemeral: true });
    }

    if (interaction.commandName === 'config-logs') {
        const channel = interaction.options.getChannel('channel');
        config.logChannelId = channel.id;
        saveConfig();
        await interaction.reply({ content: `✅ Logs : ${channel}`, ephemeral: true });
    }

    if (interaction.commandName === 'config-adaptive') {
        config.adaptiveMode = interaction.options.getBoolean('enabled');
        saveConfig();
        await interaction.reply({ content: `✅ Mode adaptatif : **${config.adaptiveMode ? 'Activé' : 'Désactivé'}**`, ephemeral: true });
    }

    if (interaction.commandName === 'status') {
        await interaction.reply({
            content: `📊 **Statut Empire** :\n- **Cible** : <@${config.targetUserId}>\n- **Logs** : ${config.logChannelId ? `<#${config.logChannelId}>` : 'Non configuré'}\n- **Mode Adaptatif** : ${config.adaptiveMode ? 'Activé' : 'Désactivé'}`,
            ephemeral: true
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
