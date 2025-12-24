// Format bytes to human-readable format
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0 || !bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format uptime in a readable way
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '0m';
}

// Get status emoji based on usage percentage
function getStatusEmoji(usage) {
    if (usage >= 90) return '🔴';
    if (usage >= 75) return '🟠';
    if (usage >= 50) return '🟡';
    return '🟢';
}

// Get color based on usage percentage
function getUsageColor(usage) {
    if (usage >= 90) return '#e74c3c'; // Red
    if (usage >= 75) return '#e67e22'; // Orange
    if (usage >= 50) return '#f39c12'; // Yellow
    return '#2ecc71'; // Green
}

// Get progress bar
function getProgressBar(percentage, length = 10) {
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

module.exports = {
    formatBytes,
    formatUptime,
    getStatusEmoji,
    getUsageColor,
    getProgressBar
};
