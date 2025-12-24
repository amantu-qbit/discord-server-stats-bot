let token = localStorage.getItem('token');
let socket;
let performanceChart, resourceChart;

// Login handling
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            showDashboard();
        } else {
            document.getElementById('login-error').textContent = 'Invalid credentials';
        }
    } catch (error) {
        document.getElementById('login-error').textContent = 'Connection error';
    }
});

function showDashboard() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('dashboard-page').style.display = 'flex';
    
    initializeSocket();
    loadBotInfo();
    loadSystemStats();
    initializeCharts();
    
    setInterval(loadBotInfo, 10000);
}

function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        socket.emit('authenticate', token);
    });

    socket.on('stats-update', (data) => {
        updateCharts(data);
    });

    socket.on('new-log', (log) => {
        addLog(log);
    });
}

async function loadBotInfo() {
    try {
        const response = await fetch('/api/bot-info', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        document.getElementById('bot-name').textContent = data.username;
        document.getElementById('guild-count').textContent = data.guilds;
        document.getElementById('user-count').textContent = data.users;
        document.getElementById('ping').textContent = `${data.ping}ms`;
    } catch (error) {
        console.error('Error loading bot info:', error);
    }
}

async function loadSystemStats() {
    try {
        const response = await fetch('/api/system-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        const systemStatsDiv = document.getElementById('system-stats');
        systemStatsDiv.innerHTML = `
            <div class="system-card">
                <h3>CPU</h3>
                <div class="system-item"><span>Usage:</span><span>${data.cpu.usage}%</span></div>
                <div class="system-item"><span>Cores:</span><span>${data.cpu.cores}</span></div>
            </div>
            <div class="system-card">
                <h3>Memory</h3>
                <div class="system-item"><span>Usage:</span><span>${data.memory.percentage}%</span></div>
                <div class="system-item"><span>Used:</span><span>${formatBytes(data.memory.used)}</span></div>
                <div class="system-item"><span>Free:</span><span>${formatBytes(data.memory.free)}</span></div>
            </div>
            <div class="system-card">
                <h3>Disk</h3>
                <div class="system-item"><span>Usage:</span><span>${data.disk.percentage}%</span></div>
                <div class="system-item"><span>Used:</span><span>${formatBytes(data.disk.used)}</span></div>
                <div class="system-item"><span>Free:</span><span>${formatBytes(data.disk.free)}</span></div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading system stats:', error);
    }
}

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function initializeCharts() {
    const perfCtx = document.getElementById('performanceChart').getContext('2d');
    performanceChart = new Chart(perfCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'CPU %',
                data: [],
                borderColor: '#3498db',
                tension: 0.4
            }, {
                label: 'Memory %',
                data: [],
                borderColor: '#e74c3c',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

function updateCharts(data) {
    if (!performanceChart) return;

    const time = new Date(data.timestamp).toLocaleTimeString();
    
    performanceChart.data.labels.push(time);
    performanceChart.data.datasets[0].data.push(data.cpu);
    performanceChart.data.datasets[1].data.push(data.memory);

    if (performanceChart.data.labels.length > 20) {
        performanceChart.data.labels.shift();
        performanceChart.data.datasets[0].data.shift();
        performanceChart.data.datasets[1].data.shift();
    }

    performanceChart.update();
}

// Navigation
document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        document.getElementById(`${page}-section`).style.display = 'block';
        
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
        e.target.classList.add('active');

        if (page === 'servers') loadServers();
        if (page === 'logs') loadLogs();
    });
});

async function loadServers() {
    try {
        const response = await fetch('/api/servers', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const servers = await response.json();

        const serversList = document.getElementById('servers-list');
        serversList.innerHTML = servers.map(server => `
            <div class="server-card">
                <img src="${server.icon || 'https://via.placeholder.com/80'}" alt="${server.name}">
                <h3>${server.name}</h3>
                <p>👥 ${server.memberCount} members</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading servers:', error);
    }
}

async function loadLogs() {
    try {
        const response = await fetch('/api/logs', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const logs = await response.json();

        const logsContainer = document.getElementById('logs-container');
        logsContainer.innerHTML = logs.map(log => `
            <div class="log-entry">[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}</div>
        `).join('');
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

function addLog(log) {
    const logsContainer = document.getElementById('logs-container');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.textContent = `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`;
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Save settings
document.getElementById('save-settings')?.addEventListener('click', async () => {
    const status = document.getElementById('bot-status').value;
    const activity = document.getElementById('activity-text').value;

    try {
        await fetch('/api/bot-status', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, activity })
        });
        alert('Settings saved!');
    } catch (error) {
        alert('Error saving settings');
    }
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    location.reload();
});

// Check if already logged in
if (token) {
    showDashboard();
}
