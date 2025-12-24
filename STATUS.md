# ✅ Discord Server Stats Bot - FULLY OPERATIONAL

## 🎉 Status: ONLINE AND RUNNING

**Bot:** Amirus Server Status BOT#5750  
**GitHub:** https://github.com/amantu-qbit/discord-server-stats-bot  
**Last Started:** 2025-12-24 at 1:38:34 AM

---

## ✨ NEW FEATURES ADDED

### 🔄 Instant Refresh Button
- **Blue "🔄 Refresh Now" button** appears below the stats embed
- Click it anytime for instant stats update
- No cooldown - refresh as often as you want
- Updates the same message (no spam)

### ⏱️ Auto-Update Every 5 Minutes
- Stats automatically refresh every 5 minutes
- Edits the same message (clean, no clutter)
- Next update: 5 minutes from initial post
- Shows countdown in footer: "Auto-updates every 5 minutes"

---

## 📊 What's Currently Happening

1. ✅ **Initial stats posted** to channel `1453468264154796178`
2. 🔄 **Auto-updating every 5 minutes** - same message gets edited
3. 🖱️ **Refresh button active** - click for instant updates
4. 📈 **Historical data collecting** - building performance trends

---

## 🎮 How to Use

### Instant Refresh
Just click the **"🔄 Refresh Now"** button on the stats message!

### Manual Commands (Available Anywhere)
```
/stats                    → Quick overview
/stats type:detailed      → Full stats with chart (same as auto-update)
/stats type:history       → Performance trends over time
/stats type:cpu          → Detailed CPU information
/stats type:memory       → Memory breakdown
/stats type:disk         → Disk usage details
/stats type:network      → Network statistics
```

---

## 📈 What's Being Monitored

### Real-Time Metrics
- **CPU Usage** - Current load, user/system/idle breakdown
- **Memory Usage** - RAM used, free, available
- **Disk Usage** - Space used across all drives
- **System Info** - OS, platform, hostname
- **Uptime** - How long server has been running
- **Processes** - Total, running, blocked

### Visual Features
- 🟢 Green (0-50% usage)
- 🟡 Yellow (50-75% usage)  
- 🟠 Orange (75-90% usage)
- 🔴 Red (90%+ usage)
- **Bar Chart** showing CPU, Memory, Disk usage
- **Line Chart** for historical trends (after 2+ minutes)

---

## ⚙️ Configuration

Current settings in `.env`:
```
DISCORD_BOT_TOKEN=<your_token_here>
CLIENT_ID=1453465542269603963
GUILD_ID=1427695928948559906
STATUS_CHANNEL_ID=1453468264154796178
UPDATE_INTERVAL=5
```

### To Change Update Interval
Edit `.env` file:
```bash
UPDATE_INTERVAL=10  # Updates every 10 minutes
```
Then restart the bot: `./start.sh`

### To Change Target Channel
Edit `.env` file:
```bash
STATUS_CHANNEL_ID=your_new_channel_id
```
Then restart the bot: `./start.sh`

---

## 🔧 Bot Management

### Check if Running
```bash
ps aux | grep "node bot.js"
```

### View Logs (if running in background)
```bash
cd /root/discord-server-stats
tail -f bot.log  # If you redirect output to a log file
```

### Restart Bot
```bash
cd /root/discord-server-stats
pkill -f "node bot.js"  # Stop current
./start.sh              # Start fresh
```

### Keep Bot Running 24/7 (Optional)
Use PM2 process manager:
```bash
npm install -g pm2
cd /root/discord-server-stats
pm2 start bot.js --name discord-stats
pm2 save
pm2 startup
```

---

## 📊 Expected Behavior

### First Launch
1. Bot connects to Discord
2. Posts initial stats message with chart
3. Message includes refresh button
4. Logs: "Stats message sent at [TIME]"
5. Logs: "Auto-update scheduled! Next update in 5 minutes"

### Every 5 Minutes
1. Bot fetches fresh system stats
2. Generates new chart
3. **Edits the existing message** with new data
4. Logs: "Stats auto-updated at [TIME]"

### When Refresh Button Clicked
1. User clicks "🔄 Refresh Now"
2. Bot immediately fetches fresh stats
3. Updates the message instantly
4. Logs: "Manual refresh triggered by [USERNAME] at [TIME]"

---

## 🐛 Troubleshooting

### Bot Not Auto-Updating
- Check bot is still running: `ps aux | grep "node bot.js"`
- Check logs for errors
- Verify channel ID is correct in `.env`
- Ensure bot has permissions in the channel

### Refresh Button Not Working
- Make sure you re-invited the bot with the correct permissions
- Bot needs "Use Application Commands" permission
- Try clicking again (Discord can be slow sometimes)

### Charts Not Showing
- Canvas dependencies must be installed (already done)
- Check for errors in console logs
- Restart bot if needed

---

## 🎨 Customization Ideas

### Change Colors
Edit `chartGenerator.js` - modify the `backgroundColor` and `borderColor` arrays

### Add More Stats
Edit `bot.js` - add new fields to the embeds using `systeminformation` package

### Change Chart Type
Edit `chartGenerator.js` - change `type: 'bar'` to `type: 'line'`, `'pie'`, etc.

---

## 📱 Next Update Schedule

- **Next auto-update:** 1:43:34 AM (5 minutes from 1:38:34 AM)
- **Manual refresh:** Available anytime via button click
- **Historical data:** Updates every minute in background

---

## ✅ Checklist - Everything Working

- ✅ Bot online and connected
- ✅ Initial stats posted with chart
- ✅ Refresh button added and functional
- ✅ Auto-update scheduled (5 minutes)
- ✅ Slash commands registered
- ✅ Historical data collection active
- ✅ GitHub repository updated
- ✅ Proper permissions granted

---

**🎉 Your server monitoring system is fully operational!**

Check your Discord channel to see the stats and try clicking the refresh button!
