const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Create stats bar chart
async function createStatsChart(data) {
    const width = 800;
    const height = 400;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: '#2C2F33' });

    const configuration = {
        type: 'bar',
        data: {
            labels: ['CPU Usage', 'Memory Usage', 'Disk Usage'],
            datasets: [{
                label: 'Usage (%)',
                data: [data.cpu, data.memory, data.disk],
                backgroundColor: [
                    data.cpu > 80 ? 'rgba(231, 76, 60, 0.8)' : data.cpu > 60 ? 'rgba(241, 196, 15, 0.8)' : 'rgba(46, 204, 113, 0.8)',
                    data.memory > 80 ? 'rgba(231, 76, 60, 0.8)' : data.memory > 60 ? 'rgba(241, 196, 15, 0.8)' : 'rgba(52, 152, 219, 0.8)',
                    data.disk > 80 ? 'rgba(231, 76, 60, 0.8)' : data.disk > 60 ? 'rgba(241, 196, 15, 0.8)' : 'rgba(155, 89, 182, 0.8)',
                ],
                borderColor: [
                    data.cpu > 80 ? 'rgba(231, 76, 60, 1)' : data.cpu > 60 ? 'rgba(241, 196, 15, 1)' : 'rgba(46, 204, 113, 1)',
                    data.memory > 80 ? 'rgba(231, 76, 60, 1)' : data.memory > 60 ? 'rgba(241, 196, 15, 1)' : 'rgba(52, 152, 219, 1)',
                    data.disk > 80 ? 'rgba(231, 76, 60, 1)' : data.disk > 60 ? 'rgba(241, 196, 15, 1)' : 'rgba(155, 89, 182, 1)',
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'System Resource Usage',
                    color: '#FFFFFF',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#FFFFFF',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFFFFF',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    };

    return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Create historical line chart
async function createHistoryChart(historyData) {
    const width = 1000;
    const height = 500;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: '#2C2F33' });

    const labels = historyData.timestamps.map((time, index) => {
        if (index % 5 === 0) {
            return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return '';
    });

    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'CPU Usage (%)',
                    data: historyData.cpu,
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 2,
                    pointHoverRadius: 5
                },
                {
                    label: 'Memory Usage (%)',
                    data: historyData.memory,
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 2,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Performance History',
                    color: '#FFFFFF',
                    font: {
                        size: 18,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#FFFFFF',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFFFFF',
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    };

    return await chartJSNodeCanvas.renderToBuffer(configuration);
}

module.exports = {
    createStatsChart,
    createHistoryChart
};
