const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const si = require('systeminformation');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'web-panel')));

// Store for connected clients
let discordClient = null;
let connectedUsers = new Set();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Default admin credentials (CHANGE THIS!)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);

// Initialize web panel with Discord client
function initializeWebPanel(client) {
    discordClient = client;
    
    // Authentication middleware
    const authenticateToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access denied' });
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ error: 'Invalid token' });
            req.user = user;
            next();
        });
    };

    // Login endpoint
    app.post('/api/login', async (req, res) => {
        const { username, password } = req.body;

        if (username === ADMIN_USERNAME && await bcrypt.compare(password, ADMIN_PASSWORD_HASH)) {
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ 
                success: true, 
                token,
                username 
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });

    // Get bot info
    app.get('/api/bot-info', authenticateToken, (req, res) => {
        if (!discordClient) {
            return res.status(503).json({ error: 'Bot not connected' });
        }

        res.json({
            username: discordClient.user.tag,
            id: discordClient.user.id,
            avatar: discordClient.user.displayAvatarURL(),
            guilds: discordClient.guilds.cache.size,
            users: discordClient.users.cache.size,
            uptime: process.uptime(),
            ping: discordClient.ws.ping
        });
    });

    // Get servers
    app.get('/api/servers', authenticateToken, (req, res) => {
        if (!discordClient) {
            return res.status(503).json({ error: 'Bot not connected' });
        }

        const servers = discordClient.guilds.cache.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL(),
            memberCount: guild.memberCount,
            owner: guild.ownerId
        }));

        res.json(servers);
    });

    // Get server details
    app.get('/api/servers/:id', authenticateToken, async (req, res) => {
        if (!discordClient) {
            return res.status(503).json({ error: 'Bot not connected' });
        }

        const guild = discordClient.guilds.cache.get(req.params.id);
        if (!guild) {
            return res.status(404).json({ error: 'Server not found' });
        }

        res.json({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL(),
            memberCount: guild.memberCount,
            channelCount: guild.channels.cache.size,
            roleCount: guild.roles.cache.size,
            owner: guild.ownerId,
            createdAt: guild.createdAt
        });
    });

    // Get system stats
    app.get('/api/system-stats', authenticateToken, async (req, res) => {
        try {
            const [cpu, mem, disk, osInfo, time] = await Promise.all([
                si.currentLoad(),
                si.mem(),
                si.fsSize(),
                si.osInfo(),
                si.time()
            ]);

            const mainDisk = disk[0] || {};

            res.json({
                cpu: {
                    usage: cpu.currentLoad.toFixed(2),
                    cores: cpu.cpus.length
                },
                memory: {
                    total: mem.total,
                    used: mem.used,
                    free: mem.free,
                    percentage: ((mem.used / mem.total) * 100).toFixed(2)
                },
                disk: {
                    total: mainDisk.size,
                    used: mainDisk.used,
                    free: mainDisk.available,
                    percentage: ((mainDisk.used / mainDisk.size) * 100).toFixed(2)
                },
                system: {
                    platform: osInfo.platform,
                    distro: osInfo.distro,
                    release: osInfo.release,
                    uptime: time.uptime
                }
            });
        } catch (error) {
            console.error('Error fetching system stats:', error);
            res.status(500).json({ error: 'Failed to fetch system stats' });
        }
    });

    // Update bot status
    app.post('/api/bot-status', authenticateToken, async (req, res) => {
        if (!discordClient) {
            return res.status(503).json({ error: 'Bot not connected' });
        }

        const { status, activity } = req.body;

        try {
            await discordClient.user.setPresence({
                status: status,
                activities: activity ? [{ name: activity }] : []
            });

            res.json({ success: true });
        } catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({ error: 'Failed to update status' });
        }
    });

    // Send message to channel
    app.post('/api/send-message', authenticateToken, async (req, res) => {
        if (!discordClient) {
            return res.status(503).json({ error: 'Bot not connected' });
        }

        const { channelId, message } = req.body;

        try {
            const channel = await discordClient.channels.fetch(channelId);
            if (!channel) {
                return res.status(404).json({ error: 'Channel not found' });
            }

            await channel.send(message);
            res.json({ success: true });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    });

    // Get bot logs
    const logs = [];
    const maxLogs = 1000;

    app.get('/api/logs', authenticateToken, (req, res) => {
        res.json(logs.slice(-100)); // Return last 100 logs
    });

    // Socket.IO for real-time updates
    io.on('connection', (socket) => {
        console.log('Web panel client connected');
        connectedUsers.add(socket.id);

        socket.on('authenticate', (token) => {
            jwt.verify(token, JWT_SECRET, (err) => {
                if (err) {
                    socket.emit('auth-error', 'Invalid token');
                    socket.disconnect();
                } else {
                    socket.emit('authenticated');
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('Web panel client disconnected');
            connectedUsers.delete(socket.id);
        });
    });

    // Function to broadcast stats to all connected clients
    async function broadcastStats() {
        if (connectedUsers.size === 0) return;

        try {
            const [cpu, mem] = await Promise.all([
                si.currentLoad(),
                si.mem()
            ]);

            io.emit('stats-update', {
                cpu: cpu.currentLoad.toFixed(2),
                memory: ((mem.used / mem.total) * 100).toFixed(2),
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error broadcasting stats:', error);
        }
    }

    // Broadcast stats every 5 seconds
    setInterval(broadcastStats, 5000);

    // Add log function
    global.webPanelLog = (message, level = 'info') => {
        const log = {
            message,
            level,
            timestamp: new Date().toISOString()
        };
        logs.push(log);
        if (logs.length > maxLogs) logs.shift();
        io.emit('new-log', log);
    };

    return server;
}

function startWebPanel(port = 3000) {
    server.listen(port, () => {
        console.log(`🌐 Web panel running on http://localhost:${port}`);
        console.log(`👤 Default login: admin / admin123 (CHANGE THIS!)`);
    });
}

module.exports = {
    initializeWebPanel,
    startWebPanel
};
