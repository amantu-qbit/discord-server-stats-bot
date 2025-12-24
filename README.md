# Discord Server Statistics Bot

A powerful Discord bot that monitors and displays real-time server statistics with beautiful embedded graphics and detailed metrics.

## Features

### 📊 Comprehensive Statistics
- **CPU Monitoring**: Real-time CPU usage, load distribution, core count, speed, and temperature
- **Memory Tracking**: RAM usage, available memory, active memory, and module information
- **Disk Space**: Storage usage across all drives, file systems, and physical disks
- **Network Stats**: Upload/download speeds, total data transfer, and network interfaces
- **Historical Data**: Performance trends with beautiful line charts showing CPU and memory over time

### 🎨 Visual Features
- Color-coded status indicators (🟢 🟡 🟠 🔴)
- Dynamic charts using Chart.js
- Beautiful Discord embeds
- Real-time updates

### 🚀 Commands

#### `/stats` - Display server statistics
Options:
- `overview` (default) - Quick overview of CPU, memory, and disk
- `cpu` - Detailed CPU information
- `memory` - Detailed memory statistics
- `disk` - Disk usage and storage information
- `network` - Network statistics and speeds
- `detailed` - Comprehensive stats with visual chart
- `history` - Historical performance data with trend chart

#### `/autostat` - Toggle automatic updates
- `enable: true` - Enable automatic status updates in current channel
- `enable: false` - Disable automatic updates

## Setup Instructions

### Prerequisites
- Node.js 16.x or higher
- A Discord Bot Token
- Discord Application Client ID

### 1. Create Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it
3. Go to "Bot" section and click "Add Bot"
4. Copy the Bot Token
5. Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent (optional)
6. Go to "OAuth2" → "General" and copy the Client ID

### 2. Install Dependencies
```bash
cd discord-server-stats
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env
```

Edit the `.env` file:
```env
DISCORD_BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# Optional: Auto-update settings
STATUS_CHANNEL_ID=
UPDATE_INTERVAL=5
```

### 4. Invite Bot to Server
Create an invite link:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274877991936&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your actual Client ID.

Required Permissions:
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Use Slash Commands

### 5. Run the Bot
```bash
npm start
```

Or for development:
```bash
npm run dev
```

## Usage Examples

### Basic Usage
```
/stats
```
Shows overview with CPU, memory, and disk usage

### Detailed Statistics
```
/stats type:detailed
```
Shows comprehensive stats with a visual chart

### View Performance History
```
/stats type:history
```
Shows historical CPU and memory trends

### Enable Auto-Updates
```
/autostat enable:true
```
Bot will post updates every 5 minutes in current channel

## Screenshots & Examples

### Overview Command
- 🖥️ CPU, Memory, Disk usage percentages
- 💾 Detailed memory breakdown
- 💿 Disk space information
- ⏱️ System uptime
- 🖥️ OS information

### Detailed Command
- All overview information
- Visual bar chart showing resource usage
- Color-coded indicators
- Process information

### History Command
- Line chart with CPU and memory trends
- Average and peak statistics
- Time-series data

## Advanced Configuration

### Custom Update Interval
Edit `.env`:
```env
UPDATE_INTERVAL=10  # Updates every 10 minutes
```

### Manual Channel Configuration
After enabling autostat, the channel ID is stored in `STATUS_CHANNEL_ID`

## Troubleshooting

### Bot not responding
- Verify bot token is correct
- Check bot has proper permissions
- Ensure slash commands are registered (wait up to 1 hour for global commands)

### Chart generation errors
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 16+)
- Install canvas dependencies (Linux):
  ```bash
  sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
  ```

### Missing statistics
- Some stats may not be available on all systems
- Temperature readings require hardware sensors
- Network stats may vary by OS

## System Requirements

- **OS**: Linux, Windows, macOS
- **Node.js**: 16.x or higher
- **RAM**: ~50MB for bot operation
- **Dependencies**: Cairo, Pango (for chart generation)

## Performance

- Lightweight: Uses ~30-50MB RAM
- Fast: Stats collected in under 1 second
- Efficient: Historical data limited to 60 data points
- Non-blocking: All operations are asynchronous

## Security Notes

- Never commit `.env` file to version control
- Keep bot token secret
- Use appropriate channel permissions for auto-updates
- Bot only reads system stats, no modifications

## License

MIT License - Feel free to modify and distribute

## Support

For issues or questions:
1. Check troubleshooting section
2. Verify all dependencies are installed
3. Check Discord bot permissions
4. Review console logs for errors

## Contributing

Feel free to fork and submit pull requests for:
- Additional statistics
- New chart types
- UI improvements
- Bug fixes

---

**Made with ❤️ for system monitoring on Discord**
