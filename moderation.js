const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Store warnings
const warnings = new Map();

// Kick member
async function kickMember(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
        return interaction.reply({ content: '❌ User not found in this server!', ephemeral: true });
    }

    if (!member.kickable) {
        return interaction.reply({ content: '❌ I cannot kick this user!', ephemeral: true });
    }

    try {
        await member.kick(reason);
        
        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🦶 Member Kicked')
            .addFields(
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error kicking member:', error);
        return interaction.reply({ content: '❌ Failed to kick member!', ephemeral: true });
    }
}

// Ban member
async function banMember(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteMessages = interaction.options.getInteger('delete_days') || 0;

    try {
        await interaction.guild.members.ban(target, {
            deleteMessageSeconds: deleteMessages * 86400,
            reason: reason
        });

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🔨 Member Banned')
            .addFields(
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error banning member:', error);
        return interaction.reply({ content: '❌ Failed to ban member!', ephemeral: true });
    }
}

// Unban member
async function unbanMember(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
        await interaction.guild.members.unban(userId, reason);

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('✅ Member Unbanned')
            .addFields(
                { name: 'User ID', value: userId, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error unbanning member:', error);
        return interaction.reply({ content: '❌ Failed to unban member! User may not be banned.', ephemeral: true });
    }
}

// Timeout member
async function timeoutMember(interaction) {
    const target = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.guild.members.cache.get(target.id);

    if (!member) {
        return interaction.reply({ content: '❌ User not found in this server!', ephemeral: true });
    }

    if (!member.moderatable) {
        return interaction.reply({ content: '❌ I cannot timeout this user!', ephemeral: true });
    }

    try {
        await member.timeout(duration * 60 * 1000, reason);

        const embed = new EmbedBuilder()
            .setColor('#f39c12')
            .setTitle('⏱️ Member Timed Out')
            .addFields(
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Duration', value: `${duration} minutes`, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error timing out member:', error);
        return interaction.reply({ content: '❌ Failed to timeout member!', ephemeral: true });
    }
}

// Warn member
async function warnMember(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const guildWarnings = warnings.get(interaction.guildId) || new Map();
    const userWarnings = guildWarnings.get(target.id) || [];
    
    userWarnings.push({
        reason: reason,
        moderator: interaction.user.tag,
        timestamp: Date.now()
    });

    guildWarnings.set(target.id, userWarnings);
    warnings.set(interaction.guildId, guildWarnings);

    const embed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle('⚠️ Member Warned')
        .addFields(
            { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
            { name: 'Total Warnings', value: `${userWarnings.length}`, inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: true },
            { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

    try {
        await target.send(`⚠️ You have been warned in **${interaction.guild.name}**\n**Reason:** ${reason}\n**Total Warnings:** ${userWarnings.length}`);
    } catch (error) {
        console.log('Could not DM user about warning');
    }

    return interaction.reply({ embeds: [embed] });
}

// Check warnings
async function checkWarnings(interaction) {
    const target = interaction.options.getUser('user');
    const guildWarnings = warnings.get(interaction.guildId);

    if (!guildWarnings || !guildWarnings.has(target.id)) {
        return interaction.reply({ content: `${target.tag} has no warnings!`, ephemeral: true });
    }

    const userWarnings = guildWarnings.get(target.id);
    
    let warningList = '';
    userWarnings.forEach((warn, index) => {
        const date = new Date(warn.timestamp).toLocaleDateString();
        warningList += `**${index + 1}.** ${warn.reason}\n*By: ${warn.moderator} | Date: ${date}*\n\n`;
    });

    const embed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle(`⚠️ Warnings for ${target.tag}`)
        .setDescription(warningList || 'No warnings')
        .addFields({ name: 'Total Warnings', value: `${userWarnings.length}` })
        .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
}

// Clear messages
async function clearMessages(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
        return interaction.reply({ content: '❌ Please provide a number between 1 and 100!', ephemeral: true });
    }

    try {
        const deleted = await interaction.channel.bulkDelete(amount, true);

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🧹 Messages Cleared')
            .setDescription(`Successfully deleted ${deleted.size} messages!`)
            .setFooter({ text: `Cleared by ${interaction.user.tag}` })
            .setTimestamp();

        const reply = await interaction.reply({ embeds: [embed] });
        
        setTimeout(() => reply.delete().catch(() => {}), 5000);
    } catch (error) {
        console.error('Error clearing messages:', error);
        return interaction.reply({ content: '❌ Failed to clear messages! Messages may be older than 14 days.', ephemeral: true });
    }
}

// Slowmode
async function setSlowmode(interaction) {
    const seconds = interaction.options.getInteger('seconds');

    try {
        await interaction.channel.setRateLimitPerUser(seconds);

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🐌 Slowmode Updated')
            .setDescription(seconds === 0 ? 'Slowmode disabled' : `Slowmode set to ${seconds} seconds`)
            .setFooter({ text: `Set by ${interaction.user.tag}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error setting slowmode:', error);
        return interaction.reply({ content: '❌ Failed to set slowmode!', ephemeral: true });
    }
}

// Lock channel
async function lockChannel(interaction) {
    try {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: false
        });

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🔒 Channel Locked')
            .setDescription('This channel has been locked.')
            .setFooter({ text: `Locked by ${interaction.user.tag}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error locking channel:', error);
        return interaction.reply({ content: '❌ Failed to lock channel!', ephemeral: true });
    }
}

// Unlock channel
async function unlockChannel(interaction) {
    try {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
            SendMessages: null
        });

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('🔓 Channel Unlocked')
            .setDescription('This channel has been unlocked.')
            .setFooter({ text: `Unlocked by ${interaction.user.tag}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error unlocking channel:', error);
        return interaction.reply({ content: '❌ Failed to unlock channel!', ephemeral: true });
    }
}

module.exports = {
    kickMember,
    banMember,
    unbanMember,
    timeoutMember,
    warnMember,
    checkWarnings,
    clearMessages,
    setSlowmode,
    lockChannel,
    unlockChannel
};
