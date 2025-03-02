// Plotly.js Implementation for Stock Trades

// Global variables
const maxDataPoints = 50;
const tradeData = {};
let priceChart, volumeChart;
let selectedStock = 'ALL';
let isPaused = false;
let wsClient;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    initCharts();
    
    // Initialize UI controls
    initControls();
    
    // Initialize WebSocket connection
    initWebSocket();
});

// Initialize charts
function initCharts() {
    // Create empty price chart
    priceChart = Plotly.newPlot('price-chart', [], {
        title: 'Stock Prices',
        xaxis: {
            title: 'Time',
            showgrid: true,
            zeroline: false
        },
        yaxis: {
            title: 'Price ($)',
            showline: false
        },
        margin: { t: 50, r: 10, l: 50, b: 40 },
        showlegend: true,
        hovermode: 'closest',
        uirevision: 'true' // Preserve UI state on updates
    });
    
    // Create empty volume chart
    volumeChart = Plotly.newPlot('volume-chart', [], {
        title: 'Trading Volume',
        xaxis: {
            title: 'Time',
            showgrid: true,
            zeroline: false
        },
        yaxis: {
            title: 'Volume',
            showline: false
        },
        margin: { t: 50, r: 10, l: 50, b: 40 },
        showlegend: true,
        hovermode: 'closest',
        uirevision: 'true' // Preserve UI state on updates
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

// Update charts based on selected stock
function updateCharts() {
    const priceTraces = [];
    const volumeTraces = [];
    
    // Add traces based on selected stock
    if (selectedStock === 'ALL') {
        // Add all stocks
        for (const ticker in tradeData) {
            if (tradeData[ticker].timestamps.length > 0) {
                addStockToTraces(ticker, priceTraces, volumeTraces);
            }
        }
    } else if (tradeData[selectedStock] && tradeData[selectedStock].timestamps.length > 0) {
        // Add only selected stock
        addStockToTraces(selectedStock, priceTraces, volumeTraces);
    }
    
    // Update price chart
    Plotly.react('price-chart', priceTraces, {
        title: 'Stock Prices',
        xaxis: {
            title: 'Time',
            showgrid: true,
            zeroline: false
        },
        yaxis: {
            title: 'Price ($)',
            showline: false
        },
        margin: { t: 50, r: 10, l: 50, b: 40 },
        showlegend: true,
        hovermode: 'closest',
        uirevision: 'true' // Preserve UI state on updates
    });
    
    // Update volume chart
    Plotly.react('volume-chart', volumeTraces, {
        title: 'Trading Volume',
        xaxis: {
            title: 'Time',
            showgrid: true,
            zeroline: false
        },
        yaxis: {
            title: 'Volume',
            showline: false
        },
        margin: { t: 50, r: 10, l: 50, b: 40 },
        showlegend: true,
        hovermode: 'closest',
        uirevision: 'true' // Preserve UI state on updates
    });
}

// Add stock data to traces
function addStockToTraces(ticker, priceTraces, volumeTraces) {
    const color = stockColors[ticker] || '#000000';
    
    // Add to price traces
    priceTraces.push({
        x: tradeData[ticker].timestamps,
        y: tradeData[ticker].prices,
        type: 'scatter',
        mode: 'lines',
        name: ticker,
        line: {
            color: color,
            width: 2
        },
        hovertemplate: '%{y:.2f} USD<extra>' + ticker + '</extra>'
    });
    
    // Add to volume traces
    volumeTraces.push({
        x: tradeData[ticker].timestamps,
        y: tradeData[ticker].volumes,
        type: 'bar',
        name: ticker,
        marker: {
            color: color + '80' // Add transparency
        },
        hovertemplate: '%{y:,} shares<extra>' + ticker + '</extra>'
    });
}

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
