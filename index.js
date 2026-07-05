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
const axios = require('axios');

// --- PERSISTENCE ---
const CONFIG_PATH = path.join(__dirname, 'config.json');
let config = {
    targetUserId: process.env.TARGET_USER_ID || '1401153828195139757',
    logChannelId: null,
    adaptiveMode: false,
    aiEnabled: false,
    aiModel: "google/gemma-7b-it:free"
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

// --- AI INTEGRATION (OPENROUTER) ---
async function generateAIMessage(prompt) {
    if (!process.env.OPENROUTER_API_KEY) return null;
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: config.aiModel,
            messages: [{ role: "user", content: prompt }]
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        return response.data.choices[0].message.content.trim();
    } catch (err) {
        console.error("Erreur OpenRouter:", err.response?.data || err.message);
        return null;
    }
}

// --- BOT SETUP ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers],
});

const REMINDER_INTERVAL = 30 * 60 * 1000;

// Configurations prédéfinies (fallback si pas d'IA ou si le jeu correspond)
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
    },
    {
        key: 'Geometry Dash',
        searchTerms: ['geometry dash'],
        congrats: "Le cube s'est arrêté. L'Empire espère que votre agilité se transportera maintenant sur le code du bot de l'EF !",
        levels: [
            ["Soldat ! Cessez de sauter par-dessus des triangles et venez coder le bot de l'EF !"],
            ["Caporal ! Votre rythme est mauvais. Le seul tempo qui compte est celui du développement impérial !"],
            ["TRAÎTRE ! Vous préférez un cube qui saute à la gloire de l'Empire ? AU TRAVAIL !"]
        ]
    }
];

const activeReminders = new Map();

async function logToChannel(message) {
    if (!config.logChannelId) return;
    try {
        const channel = await client.channels.fetch(config.logChannelId);
        if (channel?.isTextBased()) await channel.send(`📜 **[LOGS EMPIRE]** ${message}`);
    } catch (err) {}
}

function getGameConfig(activities) {
    if (!activities) return null;

    // 1. Chercher dans les configs prédéfinies
    for (const game of GAME_CONFIGS) {
        if (activities.some(act => act.type === ActivityType.Playing && act.name && game.searchTerms.some(t => act.name.toLowerCase().includes(t)))) {
            return game;
        }
    }

    // 2. Si IA activée, prendre n'importe quel jeu détecté
    if (config.aiEnabled) {
        const playingActivity = activities.find(act => act.type === ActivityType.Playing && act.name);
        if (playingActivity) {
            return {
                key: playingActivity.name,
                isGeneric: true,
                congrats: `L'Empire vous félicite d'avoir arrêté de jouer à ${playingActivity.name}.`,
                levels: [
                    [`Soldat ! Arrêtez de jouer à ${playingActivity.name} et venez développer le bot de l'EF !`],
                    [`Caporal ! ${playingActivity.name} est une perte de temps pour la nation. Au travail !`],
                    [`TRAHISON ! Délaisser le bot de l'EF pour ${playingActivity.name} est impardonnable ! CESSEZ !`]
                ]
            };
        }
    }

    return null;
}

const commands = [
    new SlashCommandBuilder().setName('config-target').setDescription('ID de l\'utilisateur à surveiller').addStringOption(o => o.setName('user_id').setDescription('ID Discord').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('config-logs').setDescription('Salon de logs').addChannelOption(o => o.setName('channel').setDescription('Salon textuel').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('config-adaptive').setDescription('Active/Désactive le mode adaptatif (énervement)').addBooleanOption(o => o.setName('enabled').setDescription('Activer ?').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('config-ai').setDescription('Configure l\'IA OpenRouter').addBooleanOption(o => o.setName('enabled').setDescription('Activer l\'IA pour TOUS les jeux ?').setRequired(true)).addStringOption(o => o.setName('model').setDescription('Modèle OpenRouter (ex: google/gemma-7b-it:free)')).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    new SlashCommandBuilder().setName('status').setDescription('Affiche la configuration').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(c => c.toJSON());

async function registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try { await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }); } catch (e) { console.error(e); }
}

async function handlePresenceChange(oldPresence, newPresence) {
    if (!newPresence || newPresence.userId !== config.targetUserId) return;
    const gameConfig = getGameConfig(newPresence.activities);
    const current = activeReminders.get(newPresence.userId);

    if (gameConfig) {
        if (!current || current.gameKey !== gameConfig.key) {
            if (current) clearInterval(current.intervalId);
            await logToChannel(`Début de session : **${gameConfig.key}** pour <@${newPresence.userId}>.`);
            sendReminder(newPresence.userId, gameConfig, 1);
            const intervalId = setInterval(() => {
                const session = activeReminders.get(newPresence.userId);
                if (session) { session.count++; sendReminder(newPresence.userId, gameConfig, session.count); }
            }, REMINDER_INTERVAL);
            activeReminders.set(newPresence.userId, { gameKey: gameConfig.key, intervalId, count: 1 });
        }
    } else if (current) {
        try {
            const user = await client.users.fetch(newPresence.userId);
            const game = GAME_CONFIGS.find(g => g.key === current.gameKey) || { key: current.gameKey, congrats: `L'Empire vous félicite d'avoir arrêté de jouer à ${current.gameKey}.` };

            let content = game.congrats;
            if (config.aiEnabled && process.env.OPENROUTER_API_KEY) {
                const aiMsg = await generateAIMessage(`Tu es un officier de l'Empire Français. L'utilisateur vient d'arrêter de jouer à ${current.gameKey}. Félicite-le très brièvement (1-2 phrases) et dis-lui de retourner développer le bot de l'EF pour la gloire de la nation.`);
                if (aiMsg) content = aiMsg;
            }

            await user.send(`🇫🇷 **VICTOIRE DE L'EMPIRE** 🇫🇷\n\n${content}`);
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
        if (config.aiEnabled && process.env.OPENROUTER_API_KEY) {
            let tone = "ferme, autoritaire et patriotique";
            if (config.adaptiveMode) {
                if (count >= 3) tone = "FURIEUX, HURLANT, ACCUSANT DE HAUTE TRAHISON ENVERS L'EMPEREUR";
                else if (count >= 2) tone = "très agacé, impatient et menaçant d'envoyer la garde impériale";
            }
            const prompt = `Tu es un officier de l'Empire Français. L'utilisateur joue à ${game.key} au lieu de développer le bot de l'EF. C'est son rappel n°${count}. Ton ton est ${tone}. Ordonne-lui brièvement de quitter ce jeu futil et de retourner au travail pour la gloire de l'Empire. Ne fais pas de longs discours.`;
            content = await generateAIMessage(prompt);
        }

        if (!content) {
            const levelIdx = count >= 3 ? 2 : (count >= 2 ? 1 : 0);
            const msgs = game.levels[levelIdx];
            content = msgs[Math.floor(Math.random() * msgs.length)];
        }

        await user.send(`🇫🇷 **MESSAGE DE L'EMPIRE** 🇫🇷\n\n${content}`);
        console.log(`Rappel [${game.key}] #${count} envoyé à ${user.tag} (AI: ${config.aiEnabled})`);
    } catch (e) { console.error(e); }
}

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
        config.logChannelId = interaction.options.getChannel('channel').id;
        saveConfig();
        await interaction.reply({ content: `✅ Logs configurés.`, ephemeral: true });
    }
    if (interaction.commandName === 'config-adaptive') {
        config.adaptiveMode = interaction.options.getBoolean('enabled');
        saveConfig();
        await interaction.reply({ content: `✅ Mode adaptatif : **${config.adaptiveMode}**`, ephemeral: true });
    }
    if (interaction.commandName === 'config-ai') {
        config.aiEnabled = interaction.options.getBoolean('enabled');
        const model = interaction.options.getString('model');
        if (model) config.aiModel = model;
        saveConfig();
        await interaction.reply({ content: `✅ IA **${config.aiEnabled ? 'Activée' : 'Désactivée'}** pour TOUS les jeux détectés (Modèle: ${config.aiModel})`, ephemeral: true });
    }
    if (interaction.commandName === 'status') {
        await interaction.reply({
            content: `📊 **Statut Empire** :\n- **Cible** : <@${config.targetUserId}>\n- **Logs** : ${config.logChannelId ? `<#${config.logChannelId}>` : 'Non'}\n- **Adaptatif** : ${config.adaptiveMode}\n- **IA** : ${config.aiEnabled} (${config.aiModel})`,
            ephemeral: true
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
