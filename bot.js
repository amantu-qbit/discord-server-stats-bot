require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, SlashCommandBuilder, REST, Routes, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const si = require('systeminformation');
const { createStatsChart, createHistoryChart } = require('./chartGenerator');
const { formatBytes, formatUptime, getStatusEmoji, getUsageColor } = require('./utils');
const { initializeWebPanel, startWebPanel } = require('./webPanel');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

// Store historical data
const historyData = {
    cpu: [],
    memory: [],
    timestamps: [],
    maxDataPoints: 60 // Last 60 readings
};

// Commands definition
const commands = [
    new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Display server statistics')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of stats to display')
                .setRequired(false)
                .addChoices(
                    { name: 'Overview', value: 'overview' },
                    { name: 'CPU', value: 'cpu' },
                    { name: 'Memory', value: 'memory' },
                    { name: 'Disk', value: 'disk' },
                    { name: 'Network', value: 'network' },
                    { name: 'Detailed', value: 'detailed' },
                    { name: 'History', value: 'history' }
                )),
    new SlashCommandBuilder()
        .setName('autostat')
        .setDescription('Toggle automatic status updates in this channel')
        .addBooleanOption(option =>
            option.setName('enable')
                .setDescription('Enable or disable auto-updates')
                .setRequired(true)),
].map(command => command.toJSON());

// Register slash commands
async function registerCommands() {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Successfully registered slash commands!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// Collect historical data
function collectHistoricalData() {
    setInterval(async () => {
        try {
            const cpuData = await si.currentLoad();
            const memData = await si.mem();

            historyData.cpu.push(cpuData.currentLoad);
            historyData.memory.push((memData.used / memData.total) * 100);
            historyData.timestamps.push(new Date());

            // Keep only last N data points
            if (historyData.cpu.length > historyData.maxDataPoints) {
                historyData.cpu.shift();
                historyData.memory.shift();
                historyData.timestamps.shift();
            }
        } catch (error) {
            console.error('Error collecting historical data:', error);
        }
    }, 60000); // Every minute
}

// Get overview stats
async function getOverviewStats() {
    const [cpu, mem, disk, osInfo, time] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.osInfo(),
        si.time()
    ]);

    const mainDisk = disk[0] || {};
    const memUsagePercent = ((mem.used / mem.total) * 100).toFixed(1);
    const diskUsagePercent = ((mainDisk.used / mainDisk.size) * 100).toFixed(1);

    const embed = new EmbedBuilder()
        .setColor(getUsageColor(Math.max(cpu.currentLoad, memUsagePercent)))
        .setTitle('🖥️ Server Statistics - Overview')
        .setDescription('Real-time system performance metrics')
        .addFields(
            {
                name: `${getStatusEmoji(cpu.currentLoad)} CPU Usage`,
                value: `\`\`\`${cpu.currentLoad.toFixed(1)}%\`\`\``,
                inline: true
            },
            {
                name: `${getStatusEmoji(memUsagePercent)} Memory Usage`,
                value: `\`\`\`${memUsagePercent}%\`\`\``,
                inline: true
            },
            {
                name: `${getStatusEmoji(diskUsagePercent)} Disk Usage`,
                value: `\`\`\`${diskUsagePercent}%\`\`\``,
                inline: true
            },
            {
                name: '💾 Memory',
                value: `${formatBytes(mem.used)} / ${formatBytes(mem.total)}`,
                inline: true
            },
            {
                name: '💿 Disk Space',
                value: `${formatBytes(mainDisk.used)} / ${formatBytes(mainDisk.size)}`,
                inline: true
            },
            {
                name: '⏱️ Uptime',
                value: formatUptime(time.uptime),
                inline: true
            },
            {
                name: '🖥️ Operating System',
                value: `${osInfo.distro} ${osInfo.release}`,
                inline: false
            }
        )
        .setFooter({ text: '💡 Use /stats detailed for more information' })
        .setTimestamp();

    return { embeds: [embed] };
}

// Get CPU stats
async function getCPUStats() {
    const [cpu, cpuTemp, cpuSpeed] = await Promise.all([
        si.currentLoad(),
        si.cpuTemperature(),
        si.cpuCurrentSpeed()
    ]);

    const cpuInfo = await si.cpu();

    const embed = new EmbedBuilder()
        .setColor(getUsageColor(cpu.currentLoad))
        .setTitle('⚙️ CPU Statistics')
        .addFields(
            {
                name: '🔧 Processor',
                value: `${cpuInfo.manufacturer} ${cpuInfo.brand}`,
                inline: false
            },
            {
                name: '📊 Overall Load',
                value: `\`\`\`${cpu.currentLoad.toFixed(2)}%\`\`\``,
                inline: true
            },
            {
                name: '🔢 Cores',
                value: `\`\`\`${cpuInfo.cores} (${cpuInfo.physicalCores} physical)\`\`\``,
                inline: true
            },
            {
                name: '⚡ Speed',
                value: `\`\`\`${cpuSpeed.avg.toFixed(2)} GHz\`\`\``,
                inline: true
            },
            {
                name: '👤 User',
                value: `${cpu.currentLoadUser.toFixed(1)}%`,
                inline: true
            },
            {
                name: '🔐 System',
                value: `${cpu.currentLoadSystem.toFixed(1)}%`,
                inline: true
            },
            {
                name: '😴 Idle',
                value: `${cpu.currentLoadIdle.toFixed(1)}%`,
                inline: true
            }
        )
        .setTimestamp();

    if (cpuTemp.main !== null && cpuTemp.main > 0) {
        embed.addFields({
            name: '🌡️ Temperature',
            value: `${cpuTemp.main}°C`,
            inline: true
        });
    }

    return { embeds: [embed] };
}

// Get Memory stats
async function getMemoryStats() {
    const mem = await si.mem();
    const memLayout = await si.memLayout();

    const usagePercent = ((mem.used / mem.total) * 100).toFixed(1);

    const embed = new EmbedBuilder()
        .setColor(getUsageColor(usagePercent))
        .setTitle('🧠 Memory Statistics')
        .addFields(
            {
                name: '📊 Usage',
                value: `\`\`\`${usagePercent}%\`\`\``,
                inline: true
            },
            {
                name: '💾 Total',
                value: `\`\`\`${formatBytes(mem.total)}\`\`\``,
                inline: true
            },
            {
                name: '✅ Available',
                value: `\`\`\`${formatBytes(mem.available)}\`\`\``,
                inline: true
            },
            {
                name: '🔴 Used',
                value: formatBytes(mem.used),
                inline: true
            },
            {
                name: '🟢 Free',
                value: formatBytes(mem.free),
                inline: true
            },
            {
                name: '🔵 Active',
                value: formatBytes(mem.active),
                inline: true
            }
        );

    if (memLayout.length > 0) {
        const ramInfo = memLayout.map(m => 
            `${m.manufacturer || 'Unknown'} ${formatBytes(m.size)} @ ${m.clockSpeed}MHz`
        ).join('\n');
        embed.addFields({
            name: '🎰 RAM Modules',
            value: ramInfo || 'N/A',
            inline: false
        });
    }

    embed.setTimestamp();

    return { embeds: [embed] };
}

// Get Disk stats
async function getDiskStats() {
    const disks = await si.fsSize();
    const diskLayout = await si.diskLayout();

    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('💿 Disk Statistics')
        .setTimestamp();

    disks.forEach((disk, index) => {
        const usagePercent = ((disk.used / disk.size) * 100).toFixed(1);
        embed.addFields({
            name: `${getStatusEmoji(usagePercent)} ${disk.mount} (${disk.fs})`,
            value: `**Usage:** ${usagePercent}%\n**Used:** ${formatBytes(disk.used)} / ${formatBytes(disk.size)}\n**Available:** ${formatBytes(disk.available)}`,
            inline: index % 2 === 0
        });
    });

    if (diskLayout.length > 0) {
        const diskInfo = diskLayout.map(d => 
            `${d.name}: ${d.type} ${formatBytes(d.size)}`
        ).join('\n');
        embed.addFields({
            name: '💽 Physical Disks',
            value: diskInfo || 'N/A',
            inline: false
        });
    }

    return { embeds: [embed] };
}

// Get Network stats
async function getNetworkStats() {
    const [netStats, netInterfaces] = await Promise.all([
        si.networkStats(),
        si.networkInterfaces()
    ]);

    const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('🌐 Network Statistics')
        .setTimestamp();

    if (netStats.length > 0) {
        const primary = netStats[0];
        embed.addFields(
            {
                name: '📡 Interface',
                value: `\`\`\`${primary.iface}\`\`\``,
                inline: true
            },
            {
                name: '⬇️ Download',
                value: `${formatBytes(primary.rx_sec)}/s`,
                inline: true
            },
            {
                name: '⬆️ Upload',
                value: `${formatBytes(primary.tx_sec)}/s`,
                inline: true
            },
            {
                name: '📥 Total Downloaded',
                value: formatBytes(primary.rx_bytes),
                inline: true
            },
            {
                name: '📤 Total Uploaded',
                value: formatBytes(primary.tx_bytes),
                inline: true
            }
        );
    }

    if (netInterfaces.length > 0) {
        const interfaceInfo = netInterfaces
            .filter(iface => iface.ip4)
            .map(iface => `**${iface.iface}:** ${iface.ip4}`)
            .join('\n');
        
        if (interfaceInfo) {
            embed.addFields({
                name: '🔌 Network Interfaces',
                value: interfaceInfo,
                inline: false
            });
        }
    }

    return { embeds: [embed] };
}

// Create refresh button
function createRefreshButton() {
    const refreshButton = new ButtonBuilder()
        .setCustomId('refresh_stats')
        .setLabel('🔄 Refresh Now')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
        .addComponents(refreshButton);

    return row;
}

// Get detailed stats with charts
async function getDetailedStats(includeButton = true) {
    const [cpu, mem, disk, osInfo, time, processes] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.osInfo(),
        si.time(),
        si.processes()
    ]);

    const mainDisk = disk[0] || {};
    const memUsagePercent = ((mem.used / mem.total) * 100).toFixed(1);
    const diskUsagePercent = ((mainDisk.used / mainDisk.size) * 100).toFixed(1);

    // Create chart
    const chartBuffer = await createStatsChart({
        cpu: cpu.currentLoad,
        memory: memUsagePercent,
        disk: diskUsagePercent
    });

    const attachment = new AttachmentBuilder(chartBuffer, { name: 'stats-chart.png' });

    const embed = new EmbedBuilder()
        .setColor(getUsageColor(Math.max(cpu.currentLoad, memUsagePercent)))
        .setTitle('📊 Detailed Server Statistics')
        .setDescription('Comprehensive system performance analysis')
        .addFields(
            {
                name: '⚙️ CPU Details',
                value: `**Load:** ${cpu.currentLoad.toFixed(2)}%\n**User:** ${cpu.currentLoadUser.toFixed(2)}%\n**System:** ${cpu.currentLoadSystem.toFixed(2)}%\n**Idle:** ${cpu.currentLoadIdle.toFixed(2)}%`,
                inline: true
            },
            {
                name: '🧠 Memory Details',
                value: `**Usage:** ${memUsagePercent}%\n**Used:** ${formatBytes(mem.used)}\n**Free:** ${formatBytes(mem.free)}\n**Available:** ${formatBytes(mem.available)}`,
                inline: true
            },
            {
                name: '💿 Disk Details',
                value: `**Usage:** ${diskUsagePercent}%\n**Used:** ${formatBytes(mainDisk.used)}\n**Free:** ${formatBytes(mainDisk.available)}\n**Total:** ${formatBytes(mainDisk.size)}`,
                inline: true
            },
            {
                name: '🖥️ System Information',
                value: `**OS:** ${osInfo.distro} ${osInfo.release}\n**Platform:** ${osInfo.platform}\n**Arch:** ${osInfo.arch}\n**Hostname:** ${osInfo.hostname}`,
                inline: false
            },
            {
                name: '⏱️ Uptime & Processes',
                value: `**Uptime:** ${formatUptime(time.uptime)}\n**Processes:** ${processes.all}\n**Running:** ${processes.running}\n**Blocked:** ${processes.blocked}`,
                inline: false
            }
        )
        .setImage('attachment://stats-chart.png')
        .setFooter({ text: `Auto-updates every ${process.env.UPDATE_INTERVAL || 5} minutes • Click refresh for instant update` })
        .setTimestamp();

    const response = { embeds: [embed], files: [attachment] };
    
    if (includeButton) {
        response.components = [createRefreshButton()];
    }

    return response;
}

// Get history stats with chart
async function getHistoryStats() {
    if (historyData.cpu.length < 2) {
        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('📈 Historical Data')
            .setDescription('Not enough data collected yet. Please wait a few minutes and try again.')
            .setTimestamp();
        return { embeds: [embed] };
    }

    const chartBuffer = await createHistoryChart(historyData);
    const attachment = new AttachmentBuilder(chartBuffer, { name: 'history-chart.png' });

    const avgCPU = (historyData.cpu.reduce((a, b) => a + b, 0) / historyData.cpu.length).toFixed(2);
    const avgMemory = (historyData.memory.reduce((a, b) => a + b, 0) / historyData.memory.length).toFixed(2);
    const maxCPU = Math.max(...historyData.cpu).toFixed(2);
    const maxMemory = Math.max(...historyData.memory).toFixed(2);

    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('📈 Historical Performance Data')
        .setDescription(`Last ${historyData.cpu.length} minutes of system performance`)
        .addFields(
            {
                name: '📊 CPU Statistics',
                value: `**Average:** ${avgCPU}%\n**Peak:** ${maxCPU}%\n**Current:** ${historyData.cpu[historyData.cpu.length - 1].toFixed(2)}%`,
                inline: true
            },
            {
                name: '🧠 Memory Statistics',
                value: `**Average:** ${avgMemory}%\n**Peak:** ${maxMemory}%\n**Current:** ${historyData.memory[historyData.memory.length - 1].toFixed(2)}%`,
                inline: true
            }
        )
        .setImage('attachment://history-chart.png')
        .setFooter({ text: 'Historical trend analysis' })
        .setTimestamp();

    return { embeds: [embed], files: [attachment] };
}

// Handle button interactions
client.on('interactionCreate', async interaction => {
    // Handle button clicks
    if (interaction.isButton()) {
        if (interaction.customId === 'refresh_stats') {
            try {
                await interaction.deferUpdate();
                
                const stats = await getDetailedStats(true);
                await interaction.editReply(stats);
                
                console.log(`🔄 Manual refresh triggered by ${interaction.user.tag} at ${new Date().toLocaleTimeString()}`);
            } catch (error) {
                console.error('Error handling refresh button:', error);
                try {
                    await interaction.followUp({ 
                        content: '❌ Error refreshing stats. Please try again.', 
                        ephemeral: true 
                    });
                } catch (e) {
                    console.error('Error sending error message:', e);
                }
            }
        }
        return;
    }

    // Handle slash commands
    if (!interaction.isChatInputCommand()) return;

    try {
        if (interaction.commandName === 'stats') {
            await interaction.deferReply();

            const type = interaction.options.getString('type') || 'overview';
            let response;

            switch (type) {
                case 'cpu':
                    response = await getCPUStats();
                    break;
                case 'memory':
                    response = await getMemoryStats();
                    break;
                case 'disk':
                    response = await getDiskStats();
                    break;
                case 'network':
                    response = await getNetworkStats();
                    break;
                case 'detailed':
                    response = await getDetailedStats();
                    break;
                case 'history':
                    response = await getHistoryStats();
                    break;
                default:
                    response = await getOverviewStats();
            }

            await interaction.editReply(response);
        } else if (interaction.commandName === 'autostat') {
            const enable = interaction.options.getBoolean('enable');
            
            if (enable) {
                // Store channel ID for auto-updates
                process.env.STATUS_CHANNEL_ID = interaction.channelId;
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#2ecc71')
                            .setTitle('✅ Auto-Stats Enabled')
                            .setDescription(`Automatic status updates will be posted in this channel every ${process.env.UPDATE_INTERVAL || 5} minutes.`)
                    ]
                });
            } else {
                process.env.STATUS_CHANNEL_ID = '';
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#e74c3c')
                            .setTitle('❌ Auto-Stats Disabled')
                            .setDescription('Automatic status updates have been disabled.')
                    ]
                });
            }
        }
    } catch (error) {
        console.error('Error handling command:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('❌ Error')
            .setDescription('An error occurred while fetching statistics.')
            .setTimestamp();

        if (interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

// Store the message ID for editing
let statusMessageId = null;
let updateInterval = null;

// Function to update stats
async function updateStats() {
    try {
        const channel = await client.channels.fetch(process.env.STATUS_CHANNEL_ID);
        if (!channel) {
            console.error('❌ Could not find channel');
            return;
        }

        const stats = await getDetailedStats(true);
        
        // Try to edit existing message, otherwise send new one
        if (statusMessageId) {
            try {
                const message = await channel.messages.fetch(statusMessageId);
                await message.edit(stats);
                console.log(`🔄 Stats auto-updated at ${new Date().toLocaleTimeString()}`);
            } catch (editError) {
                console.log('Could not edit message, sending new one...');
                const newMessage = await channel.send(stats);
                statusMessageId = newMessage.id;
                console.log(`📊 New stats message sent at ${new Date().toLocaleTimeString()}`);
            }
        } else {
            const newMessage = await channel.send(stats);
            statusMessageId = newMessage.id;
            console.log(`📊 Stats message sent at ${new Date().toLocaleTimeString()}`);
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log('🤖 Bot is ready to monitor server statistics!');
    
    // Initialize web panel
    initializeWebPanel(client);
    startWebPanel(process.env.WEB_PANEL_PORT || 3067);
    
    // Start collecting historical data
    collectHistoricalData();
    
    // Register commands
    registerCommands();

    // Auto-update if channel is configured
    if (process.env.STATUS_CHANNEL_ID) {
        const intervalMinutes = parseInt(process.env.UPDATE_INTERVAL) || 5;
        console.log(`📊 Auto-updates enabled for channel ${process.env.STATUS_CHANNEL_ID}`);
        console.log(`⏱️  Update interval: ${intervalMinutes} minutes`);
        console.log(`🔄 Refresh button: Enabled for instant updates`);
        
        // Send initial message
        await updateStats();
        
        // Update periodically
        updateInterval = setInterval(updateStats, intervalMinutes * 60 * 1000);
        
        console.log(`✅ Auto-update scheduled! Next update in ${intervalMinutes} minutes`);
    } else {
        console.log('⚠️  No STATUS_CHANNEL_ID configured - auto-updates disabled');
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
