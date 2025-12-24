require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    // Stats commands
    {
        name: 'stats',
        description: 'Display server statistics',
        options: [{
            type: 3, // STRING
            name: 'type',
            description: 'Type of stats to display',
            required: false,
            choices: [
                { name: 'Overview', value: 'overview' },
                { name: 'CPU', value: 'cpu' },
                { name: 'Memory', value: 'memory' },
                { name: 'Disk', value: 'disk' },
                { name: 'Network', value: 'network' },
                { name: 'Detailed', value: 'detailed' },
                { name: 'History', value: 'history' }
            ]
        }]
    },
    {
        name: 'play',
        description: 'Play music from YouTube, Spotify, or SoundCloud',
        options: [{
            type: 3,
            name: 'query',
            description: 'Song name or URL',
            required: true
        }]
    },
    {
        name: 'skip',
        description: 'Skip the current track'
    },
    {
        name: 'pause',
        description: 'Pause music playback'
    },
    {
        name: 'resume',
        description: 'Resume music playback'
    },
    {
        name: 'stop',
        description: 'Stop music and clear the queue'
    },
    {
        name: 'queue',
        description: 'Show the current music queue'
    },
    {
        name: 'kick',
        description: 'Kick a member from the server',
        default_member_permissions: '2', // KICK_MEMBERS
        options: [{
            type: 6, // USER
            name: 'user',
            description: 'User to kick',
            required: true
        }, {
            type: 3,
            name: 'reason',
            description: 'Reason for kick',
            required: false
        }]
    },
    {
        name: 'ban',
        description: 'Ban a member from the server',
        default_member_permissions: '4', // BAN_MEMBERS
        options: [{
            type: 6,
            name: 'user',
            description: 'User to ban',
            required: true
        }, {
            type: 3,
            name: 'reason',
            description: 'Reason for ban',
            required: false
        }, {
            type: 4, // INTEGER
            name: 'delete_days',
            description: 'Days of messages to delete (0-7)',
            required: false,
            min_value: 0,
            max_value: 7
        }]
    },
    {
        name: 'unban',
        description: 'Unban a user',
        default_member_permissions: '4',
        options: [{
            type: 3,
            name: 'user_id',
            description: 'User ID to unban',
            required: true
        }, {
            type: 3,
            name: 'reason',
            description: 'Reason for unban',
            required: false
        }]
    },
    {
        name: 'timeout',
        description: 'Timeout a member',
        default_member_permissions: '1099511627776', // MODERATE_MEMBERS
        options: [{
            type: 6,
            name: 'user',
            description: 'User to timeout',
            required: true
        }, {
            type: 4,
            name: 'duration',
            description: 'Duration in minutes',
            required: true
        }, {
            type: 3,
            name: 'reason',
            description: 'Reason for timeout',
            required: false
        }]
    },
    {
        name: 'warn',
        description: 'Warn a member',
        default_member_permissions: '1099511627776',
        options: [{
            type: 6,
            name: 'user',
            description: 'User to warn',
            required: true
        }, {
            type: 3,
            name: 'reason',
            description: 'Reason for warning',
            required: true
        }]
    },
    {
        name: 'warnings',
        description: 'Check warnings for a user',
        default_member_permissions: '1099511627776',
        options: [{
            type: 6,
            name: 'user',
            description: 'User to check',
            required: true
        }]
    },
    {
        name: 'clear',
        description: 'Clear messages in the channel',
        default_member_permissions: '8192', // MANAGE_MESSAGES
        options: [{
            type: 4,
            name: 'amount',
            description: 'Number of messages to clear (1-100)',
            required: true,
            min_value: 1,
            max_value: 100
        }]
    },
    {
        name: 'slowmode',
        description: 'Set channel slowmode',
        default_member_permissions: '16', // MANAGE_CHANNELS
        options: [{
            type: 4,
            name: 'seconds',
            description: 'Slowmode duration in seconds (0 to disable)',
            required: true,
            min_value: 0,
            max_value: 21600
        }]
    },
    {
        name: 'lock',
        description: 'Lock the current channel',
        default_member_permissions: '16'
    },
    {
        name: 'unlock',
        description: 'Unlock the current channel',
        default_member_permissions: '16'
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('🗑️  Deleting all existing commands...');
        
        // Delete all global commands
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        
        console.log('✅ Deleted all existing commands');
        console.log(`📝 Registering ${commands.length} new commands...`);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ Successfully registered ${commands.length} slash commands!`);
        console.log('\nRegistered commands:');
        commands.forEach(cmd => console.log(`  • /${cmd.name} - ${cmd.description}`));
        console.log('\n⏳ Please wait up to 1 hour for commands to appear globally.');
        console.log('💡 Commands may appear instantly in some servers.');

    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
})();
