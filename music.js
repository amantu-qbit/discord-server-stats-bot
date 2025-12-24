require('dotenv').config();
const { Player } = require('discord-player');

let player;

function initializePlayer(client) {
    player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }
    });

    player.extractors.loadDefault();

    // Player events
    player.events.on('playerStart', (queue, track) => {
        queue.metadata.channel.send(`🎵 Now playing: **${track.title}** by **${track.author}**`);
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        queue.metadata.channel.send(`✅ Added to queue: **${track.title}**`);
    });

    player.events.on('playerError', (queue, error) => {
        console.error('Player error:', error);
        queue.metadata.channel.send('❌ An error occurred while playing music.');
    });

    player.events.on('error', (queue, error) => {
        console.error('Queue error:', error);
        queue.metadata.channel.send('❌ An error occurred with the queue.');
    });

    return player;
}

async function playMusic(interaction, query) {
    try {
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel!', ephemeral: true });
        }

        await interaction.deferReply();

        const result = await player.search(query, {
            requestedBy: interaction.user,
        });

        if (!result || !result.tracks.length) {
            return interaction.editReply('❌ No results found!');
        }

        const queue = player.nodes.create(interaction.guild, {
            metadata: {
                channel: interaction.channel,
                client: interaction.guild.members.me,
                requestedBy: interaction.user
            },
            selfDeaf: true,
            volume: 80,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 300000,
            leaveOnEnd: true,
            leaveOnEndCooldown: 300000
        });

        try {
            if (!queue.connection) await queue.connect(channel);
        } catch {
            player.nodes.delete(interaction.guildId);
            return interaction.editReply('❌ Could not join your voice channel!');
        }

        if (result.playlist) {
            queue.addTrack(result.tracks);
            await interaction.editReply(`✅ Added **${result.tracks.length}** tracks from **${result.playlist.title}**`);
        } else {
            queue.addTrack(result.tracks[0]);
            await interaction.editReply(`✅ Added **${result.tracks[0].title}** to the queue`);
        }

        if (!queue.isPlaying()) await queue.node.play();

    } catch (error) {
        console.error('Error in playMusic:', error);
        await interaction.editReply('❌ An error occurred while trying to play music.');
    }
}

async function skipTrack(interaction) {
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue || !queue.isPlaying()) {
        return interaction.reply({ content: '❌ No music is currently playing!', ephemeral: true });
    }

    const channel = interaction.member.voice.channel;
    if (!channel || channel.id !== queue.channel.id) {
        return interaction.reply({ content: '❌ You need to be in the same voice channel!', ephemeral: true });
    }

    queue.node.skip();
    return interaction.reply('⏭️ Skipped to the next track!');
}

async function pauseMusic(interaction) {
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue || !queue.isPlaying()) {
        return interaction.reply({ content: '❌ No music is currently playing!', ephemeral: true });
    }

    queue.node.pause();
    return interaction.reply('⏸️ Music paused!');
}

async function resumeMusic(interaction) {
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue) {
        return interaction.reply({ content: '❌ No music in queue!', ephemeral: true });
    }

    queue.node.resume();
    return interaction.reply('▶️ Music resumed!');
}

async function stopMusic(interaction) {
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue) {
        return interaction.reply({ content: '❌ No music in queue!', ephemeral: true });
    }

    queue.node.stop();
    queue.delete();
    return interaction.reply('⏹️ Music stopped and queue cleared!');
}

async function getQueue(interaction) {
    const queue = player.nodes.get(interaction.guildId);
    
    if (!queue || !queue.currentTrack) {
        return interaction.reply({ content: '❌ No music in queue!', ephemeral: true });
    }

    const tracks = queue.tracks.toArray();
    const current = queue.currentTrack;

    let queueString = `**Now Playing:**\n🎵 ${current.title} - ${current.author}\n\n`;

    if (tracks.length > 0) {
        queueString += '**Up Next:**\n';
        tracks.slice(0, 10).forEach((track, i) => {
            queueString += `${i + 1}. ${track.title} - ${track.author}\n`;
        });

        if (tracks.length > 10) {
            queueString += `\n...and ${tracks.length - 10} more tracks`;
        }
    }

    return interaction.reply(queueString);
}

module.exports = {
    initializePlayer,
    playMusic,
    skipTrack,
    pauseMusic,
    resumeMusic,
    stopMusic,
    getQueue
};
