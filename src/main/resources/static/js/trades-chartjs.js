// Chart.js Implementation for Stock Trades

// Global variables
const maxDataPoints = 50;
const tradeData = {};
let priceChart, volumeChart;
let selectedStock = 'ALL';
let isPaused = false;
let wsClient;

// Color mapping for different stocks
const stockColors = {
    'AAPL': '#FF6384',
    'MSFT': '#36A2EB',
    'GOOGL': '#FFCE56',
    'AMZN': '#4BC0C0',
    'TSLA': '#9966FF',
    'META': '#FF9F40',
    'NVDA': '#C9CBCF',
    'NFLX': '#7CFC00'
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    initCharts();
    
    // Initialize UI controls
    initControls();
    
    // Initialize WebSocket connection
    initWebSocket();
});

// Initialize WebSocket connection
function initWebSocket() {
    wsClient = new TradeWebSocketClient(
        // Trade update handler
        (tradeUpdate) => {
            // Update ticker display with stock info
            if (tradeUpdate.ticker) {
                const ticker = tradeUpdate.ticker;
                updateTickerDisplay(ticker.symbol, ticker.currentPrice, ticker.change);
            }
            
            // Process each individual trade
            tradeUpdate.trades.forEach(trade => {
                processTrade(trade);
            });
        },
        // Connection open handler
        () => {
            console.log('WebSocket connection established');
            document.getElementById('connection-status').textContent = 'Connected';
            document.getElementById('connection-status').style.color = 'green';
        },
        // Connection close handler
        () => {
            console.log('WebSocket connection closed');
            document.getElementById('connection-status').textContent = 'Disconnected';
            document.getElementById('connection-status').style.color = 'red';
        },
        // Connection error handler
        (error) => {
            console.error('WebSocket error:', error);
            document.getElementById('connection-status').textContent = 'Error';
            document.getElementById('connection-status').style.color = 'red';
        }
    );
    
    wsClient.connect();
}

// Process incoming trade data
function processTrade(trade) {
    // Add trade to ticker data
    if (!tradeData[trade.ticker]) {
        tradeData[trade.ticker] = {
            prices: [],
            volumes: [],
            timestamps: []
        };
    }
    
    // Add new data point
    tradeData[trade.ticker].prices.push(trade.price);
    tradeData[trade.ticker].volumes.push(trade.volume);
    tradeData[trade.ticker].timestamps.push(new Date(trade.timestamp));
    
    // Limit data points
    if (tradeData[trade.ticker].prices.length > maxDataPoints) {
        tradeData[trade.ticker].prices.shift();
        tradeData[trade.ticker].volumes.shift();
        tradeData[trade.ticker].timestamps.shift();
    }
    
    // Add trade to table
    addTradeToTable(trade);
    
    // Update charts
    updateCharts();
}

// Update ticker display
function updateTickerDisplay(ticker, price, priceChange) {
    // Ensure we have valid values
    if (price === undefined || price === null) {
        console.error('Invalid price value for ticker:', ticker);
        return;
    }
    
    // Default priceChange to 0 if undefined
    priceChange = priceChange !== undefined ? priceChange : 0;
    
    let tickerElement = document.getElementById(`ticker-${ticker}`);
    
    // Create ticker element if it doesn't exist
    if (!tickerElement) {
        tickerElement = document.createElement('div');
        tickerElement.id = `ticker-${ticker}`;
        tickerElement.className = 'ticker';
        tickerElement.style.padding = '10px';
        tickerElement.style.borderRadius = '5px';
        tickerElement.style.backgroundColor = '#f8f9fa';
        tickerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        tickerElement.style.minWidth = '120px';
        tickerElement.style.textAlign = 'center';
        
        document.getElementById('ticker-container').appendChild(tickerElement);
    }
    
    // Update ticker content
    const changeClass = priceChange >= 0 ? 'positive-change' : 'negative-change';
    const changeSymbol = priceChange >= 0 ? '▲' : '▼';
    
    tickerElement.innerHTML = `
        <div style="font-weight: bold; font-size: 1.2em;">${ticker}</div>
        <div style="font-size: 1.1em;">$${price.toFixed(2)}</div>
        <div class="${changeClass}" style="color: ${priceChange >= 0 ? 'green' : 'red'}">
            ${changeSymbol} ${Math.abs(priceChange).toFixed(2)}
        </div>
    `;
}

// Initialize charts
function initCharts() {
    // Price chart
    const priceCtx = document.getElementById('price-chart').getContext('2d');
    priceChart = new Chart(priceCtx, {
        type: 'line',
        data: {
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Stock Prices'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second',
                        displayFormats: {
                            second: 'HH:mm:ss'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price ($)'
                    }
                }
            },
            animation: {
                duration: 0 // Disable animation for better performance
            }
        }
    });
    
    // Volume chart
    const volumeCtx = document.getElementById('volume-chart').getContext('2d');
    volumeChart = new Chart(volumeCtx, {
        type: 'bar',
        data: {
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Trading Volume'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second',
                        displayFormats: {
                            second: 'HH:mm:ss'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Volume'
                    }
                }
            },
            animation: {
                duration: 0 // Disable animation for better performance
            }
        }
    });
}

// Update charts based on selected stock
function updateCharts() {
    // Clear existing datasets
    priceChart.data.datasets = [];
    volumeChart.data.datasets = [];
    
    // Add datasets based on selected stock
    if (selectedStock === 'ALL') {
        // Add all stocks
        for (const ticker in tradeData) {
            addStockToCharts(ticker);
        }
    } else if (tradeData[selectedStock]) {
        // Add only selected stock
        addStockToCharts(selectedStock);
    }
    
    // Update charts
    priceChart.update();
    volumeChart.update();
}

// Add stock data to charts
function addStockToCharts(ticker) {
    if (!tradeData[ticker] || tradeData[ticker].timestamps.length === 0) return;
    
    const color = stockColors[ticker] || '#000000';
    
    // Add to price chart
    priceChart.data.datasets.push({
        label: ticker,
        data: tradeData[ticker].timestamps.map((time, i) => ({
            x: time,
            y: tradeData[ticker].prices[i]
        })),
        borderColor: color,
        backgroundColor: color + '33', // Add transparency
        borderWidth: 2,
        pointRadius: 0, // Hide points for better performance
        tension: 0.1 // Slight curve for better visualization
    });
    
    // Add to volume chart
    volumeChart.data.datasets.push({
        label: ticker,
        data: tradeData[ticker].timestamps.map((time, i) => ({
            x: time,
            y: tradeData[ticker].volumes[i]
        })),
        backgroundColor: color + '80', // Add transparency
        borderColor: color,
        borderWidth: 1
    });
}

// Initialize UI controls
function initControls() {
    // Stock selector
    document.getElementById('selected-stock').addEventListener('change', (e) => {
        selectedStock = e.target.value;
        updateCharts();
    });
    
    // Pause button
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.addEventListener('click', () => {
        isPaused = wsClient.togglePause();
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });
}

// Add trade to table
function addTradeToTable(trade) {
    // Validate trade data
    if (!trade || !trade.ticker || trade.price === undefined) {
        console.error('Invalid trade data:', trade);
        return;
    }

    const tbody = document.getElementById('trades-body');
    const row = document.createElement('tr');
    
    // Format timestamp
    const timestamp = trade.timestamp ? new Date(trade.timestamp) : new Date();
    const timeString = timestamp.toLocaleTimeString();
    
    // Set row content
    row.innerHTML = `
        <td>${timeString}</td>
        <td>${trade.ticker}</td>
        <td>$${trade.price.toFixed(2)}</td>
        <td>${trade.volume ? trade.volume.toLocaleString() : '0'}</td>
        <td>${trade.type || 'UNKNOWN'}</td>
    `;
    
    // Add class based on trade type
    if (trade.type) {
        row.className = trade.type === 'BUY' ? 'buy-trade' : 'sell-trade';
        row.style.color = trade.type === 'BUY' ? 'green' : 'red';
    }
    
    // Add to table
    tbody.prepend(row);
    
    // Limit number of rows
    while (tbody.children.length > 20) {
        tbody.removeChild(tbody.lastChild);
    }
}
