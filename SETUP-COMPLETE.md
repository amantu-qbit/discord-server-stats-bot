# Discord Server Stats Bot - Setup Complete! 🎉

## ✅ Bot Configuration
- **Bot Token**: Configured ✓
- **Client ID**: 1453465542269603963 ✓
- **Guild ID**: 1427695928948559906 ✓
- **Channel ID**: 1453468264154796178 ✓
- **Auto-Update Interval**: Every 2 minutes ✓

## 📋 IMPORTANT: Re-invite the Bot with Correct Permissions

Your bot needs proper permissions to post in the channel. Please use this invite link:

### 🔗 Bot Invite Link:
```
https://discord.com/api/oauth2/authorize?client_id=1453465542269603963&permissions=274877991936&scope=bot%20applications.commands
```

**Required Permissions:**
- ✅ Send Messages
- ✅ Embed Links  
- ✅ Attach Files
- ✅ Read Message History
- ✅ View Channels
- ✅ Use Slash Commands

## 🚀 Starting the Bot

After re-inviting with proper permissions:

```bash
cd /root/discord-server-stats
./start.sh
```

Or:
```bash
npm start
```

## 📊 Features Enabled

### Auto-Updating Stats
- ✅ Automatically posts detailed stats with charts to channel `1453468264154796178`
- ✅ Updates the SAME message every 2 minutes (edits in place)
- ✅ Shows CPU, Memory, Disk usage with visual bar chart
- ✅ Color-coded status indicators

### Available Commands
- `/stats` - Quick overview
- `/stats type:cpu` - Detailed CPU stats
- `/stats type:memory` - Memory details
- `/stats type:disk` - Disk information
- `/stats type:network` - Network stats
- `/stats type:detailed` - Full stats with chart
- `/stats type:history` - Performance trends

## 🌐 GitHub Repository

Your project is now live at:
**https://github.com/amantu-qbit/discord-server-stats-bot**

## 📝 What Happens After You Re-invite

1. Bot will immediately post initial stats embed with chart
2. Every 2 minutes, the bot will **edit** that same message with updated stats
3. The embed will show real-time CPU, RAM, and disk usage
4. All slash commands will work in any channel

## 🔧 Troubleshooting

### If bot still can't post:
1. Make sure bot has "View Channel" permission for channel 1453468264154796178
2. Ensure bot role is above @everyone in role hierarchy
3. Check channel permissions specifically allow the bot to post

### To change update interval:
Edit `.env` file:
```
UPDATE_INTERVAL=5  # Change to 5 minutes
```

### To change which channel receives updates:
Edit `.env` file:
```
STATUS_CHANNEL_ID=your_channel_id_here
```

## 📂 Project Structure
```
discord-server-stats/
├── bot.js              # Main bot logic
├── chartGenerator.js   # Chart creation with Chart.js
├── utils.js           # Helper functions
├── package.json       # Dependencies
├── .env              # Your configuration
└── start.sh          # Easy startup script
```

---

**Next Steps:**
1. Click the invite link above to re-invite the bot with permissions
2. Run `./start.sh` to start the bot
3. Watch your stats channel for the auto-updating embed!

🎉 **Your bot is ready to monitor your server!**
