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
    initPriceChart();
    initVolumeChart();
    
    // Initialize UI controls
    initControls();
    
    // Initialize WebSocket connection
    initWebSocket();
    
    // Initialize ticker display
    createTickerElements();
});

// Initialize WebSocket connection
function initWebSocket() {
    wsClient = new TradeWebSocketClient(
        // Trade update handler
        (tradeUpdate) => {
            // Update ticker display with stock info
            if (tradeUpdate.ticker) {
                updateTicker(tradeUpdate.ticker);
            }
            
            // Process each individual trade
            if (tradeUpdate.trades && Array.isArray(tradeUpdate.trades)) {
                tradeUpdate.trades.forEach(trade => {
                    // Add trade to table
                    addTradeToTable(trade, tradeUpdate.ticker);
                });
                
                // Update charts
                updateCharts(tradeUpdate.ticker, tradeUpdate.trades);
            }
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
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (priceChart) priceChart.resize();
        if (volumeChart) volumeChart.resize();
    });
}

// Function to format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// Function to format large numbers with commas
function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
}

// Function to format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

// Function to create stock ticker elements
function createTickerElements() {
    const tickerContainer = document.getElementById('ticker-container');
    
    // Clear existing tickers
    tickerContainer.innerHTML = '';
    
    // Create a ticker for each stock
    ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'].forEach(symbol => {
        const tickerElement = document.createElement('div');
        tickerElement.className = 'stock-ticker';
        tickerElement.style.padding = '10px';
        tickerElement.style.borderRadius = '5px';
        tickerElement.style.backgroundColor = 'white';
        tickerElement.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        tickerElement.style.minWidth = '200px';
        
        tickerElement.innerHTML = `
            <div class="ticker-symbol" style="font-weight: bold; font-size: 1.2rem;">${symbol}</div>
            <div class="ticker-price">--</div>
            <div class="ticker-change">--</div>
        `;
        
        tickerContainer.appendChild(tickerElement);
        
        // Store reference to the ticker element
        tickerElements[symbol] = {
            element: tickerElement,
            priceElement: tickerElement.querySelector('.ticker-price'),
            changeElement: tickerElement.querySelector('.ticker-change')
        };
    });
}

// Function to update ticker with new data
function updateTicker(ticker) {
    const tickerElement = tickerElements[ticker.symbol];
    if (!tickerElement) return;
    
    // Update price
    tickerElement.priceElement.textContent = formatCurrency(ticker.currentPrice);
    
    // Update change
    const changeText = `${ticker.change > 0 ? '+' : ''}${ticker.change.toFixed(2)} (${ticker.changePercent.toFixed(2)}%)`;
    tickerElement.changeElement.textContent = changeText;
    
    // Set color based on change
    if (ticker.change > 0) {
        tickerElement.changeElement.style.color = 'green';
    } else if (ticker.change < 0) {
        tickerElement.changeElement.style.color = 'red';
    } else {
        tickerElement.changeElement.style.color = 'gray';
    }
}

// Function to add a trade to the table
function addTradeToTable(trade, ticker) {
    const tradesBody = document.getElementById('trades-body');
    
    // Only show trades for the selected stock or all stocks
    if (selectedStock !== 'ALL' && trade.ticker !== selectedStock) {
        return;
    }
    
    // Create a new row
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid #ddd';
    
    // Add cells
    row.innerHTML = `
        <td>${formatTime(trade.timestamp)}</td>
        <td>${trade.ticker}</td>
        <td>${formatCurrency(trade.price)}</td>
        <td>${formatNumber(trade.volume)}</td>
        <td style="color: ${trade.type === 'BUY' ? 'green' : 'red'}">${trade.type}</td>
    `;
    
    // Add to the top of the table
    if (tradesBody.firstChild) {
        tradesBody.insertBefore(row, tradesBody.firstChild);
    } else {
        tradesBody.appendChild(row);
    }
    
    // Limit the number of rows
    while (tradesBody.children.length > 100) {
        tradesBody.removeChild(tradesBody.lastChild);
    }
}

// Function to initialize the price chart
function initPriceChart() {
    const chartContainer = document.getElementById('price-chart');
    
    priceChart = echarts.init(chartContainer);
    
    const option = {
        title: {
            text: 'Stock Prices',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const param = params[0];
                return `${param.seriesName}<br/>
                        ${param.name}: ${formatCurrency(param.value)}`;
            }
        },
        legend: {
            data: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'],
            bottom: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: [],
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: function(value) {
                    return '$' + value.toFixed(2);
                }
            }
        },
        series: [
            { name: 'AAPL', type: 'line', data: [], showSymbol: false, smooth: true },
            { name: 'MSFT', type: 'line', data: [], showSymbol: false, smooth: true },
            { name: 'GOOGL', type: 'line', data: [], showSymbol: false, smooth: true },
            { name: 'AMZN', type: 'line', data: [], showSymbol: false, smooth: true },
            { name: 'TSLA', type: 'line', data: [], showSymbol: false, smooth: true },
            { name: 'META', type: 'line', data: [], showSymbol: false, smooth: true },
            { name: 'NVDA', type: 'line', data: [], showSymbol: false, smooth: true },
            { name: 'NFLX', type: 'line', data: [], showSymbol: false, smooth: true }
        ]
    };
    
    priceChart.setOption(option);
}

// Function to initialize the volume chart
function initVolumeChart() {
    const chartContainer = document.getElementById('volume-chart');
    
    volumeChart = echarts.init(chartContainer);
    
    const option = {
        title: {
            text: 'Trading Volume',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const param = params[0];
                return `${param.seriesName}<br/>
                        ${param.name}: ${formatNumber(param.value)}`;
            }
        },
        legend: {
            data: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'],
            bottom: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: [],
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: function(value) {
                    return formatNumber(value);
                }
            }
        },
        series: [
            { name: 'AAPL', type: 'bar', data: [], stack: 'volume' },
            { name: 'MSFT', type: 'bar', data: [], stack: 'volume' },
            { name: 'GOOGL', type: 'bar', data: [], stack: 'volume' },
            { name: 'AMZN', type: 'bar', data: [], stack: 'volume' },
            { name: 'TSLA', type: 'bar', data: [], stack: 'volume' },
            { name: 'META', type: 'bar', data: [], stack: 'volume' },
            { name: 'NVDA', type: 'bar', data: [], stack: 'volume' },
            { name: 'NFLX', type: 'bar', data: [], stack: 'volume' }
        ]
    };
    
    volumeChart.setOption(option);
}

// Function to update charts with new data
function updateCharts(ticker, trades) {
    const stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
    const now = formatTime(Date.now());
    
    // Initialize data for this stock if it doesn't exist
    if (!tradeData[ticker.symbol]) {
        tradeData[ticker.symbol] = {
            prices: [],
            volumes: [],
            times: []
        };
    }
    
    // Add new data point
    tradeData[ticker.symbol].prices.push(ticker.currentPrice);
    
    // Calculate total volume from all trades
    const totalVolume = trades.reduce((sum, trade) => sum + trade.volume, 0);
    tradeData[ticker.symbol].volumes.push(totalVolume);
    tradeData[ticker.symbol].times.push(now);
    
    // Limit the number of data points
    if (tradeData[ticker.symbol].prices.length > maxDataPoints) {
        tradeData[ticker.symbol].prices.shift();
        tradeData[ticker.symbol].volumes.shift();
        tradeData[ticker.symbol].times.shift();
    }
    
    // Get the index of the stock in the series
    if (priceChart && volumeChart) {
        // Update price chart
        priceChart.setOption({
            xAxis: {
                data: tradeData[ticker.symbol].times
            },
            series: stockSymbols.map((symbol, index) => {
                return {
                    name: symbol,
                    data: tradeData[symbol] ? tradeData[symbol].prices : []
                };
            })
        });
        
        // Update volume chart
        volumeChart.setOption({
            xAxis: {
                data: tradeData[ticker.symbol].times
            },
            series: stockSymbols.map((symbol, index) => {
                return {
                    name: symbol,
                    data: tradeData[symbol] ? tradeData[symbol].volumes : []
                };
            })
        });
    }
}

// Ticker elements storage
const tickerElements = {};
