// D3.js Implementation for Stock Trades

// WebSocket connection
let wsClient;
let isPaused = false;
let selectedStock = 'ALL';
let tradeData = {};
let maxDataPoints = 50;

// SVG dimensions
const margin = { top: 40, right: 80, bottom: 50, left: 60 };
const priceChartHeight = 400 - margin.top - margin.bottom;
const volumeChartHeight = 200 - margin.top - margin.bottom;
let width;

// Chart elements
let priceSvg, volumeSvg;
let priceG, volumeG;
let xScale, priceYScale, volumeYScale;
let priceLine, volumeBars;
let priceAxis, volumeAxis;
let tooltip;

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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeWebSocket();
    initializeCharts();
    setupEventListeners();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        updateChartDimensions();
        updateCharts();
    });
});

// Initialize WebSocket connection
function initializeWebSocket() {
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

// Initialize charts
function initializeCharts() {
    // Get container dimensions
    updateChartDimensions();
    
    // Create price chart SVG
    priceSvg = d3.select('#price-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', priceChartHeight + margin.top + margin.bottom);
    
    // Add title to price chart
    priceSvg.append('text')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Stock Prices');
    
    // Create price chart group
    priceG = priceSvg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create volume chart SVG
    volumeSvg = d3.select('#volume-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', volumeChartHeight + margin.top + margin.bottom);
    
    // Add title to volume chart
    volumeSvg.append('text')
        .attr('x', (width + margin.left + margin.right) / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Trading Volume');
    
    // Create volume chart group
    volumeG = volumeSvg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    xScale = d3.scaleTime().range([0, width]);
    priceYScale = d3.scaleLinear().range([priceChartHeight, 0]);
    volumeYScale = d3.scaleLinear().range([volumeChartHeight, 0]);
    
    // Create line generator for price chart
    priceLine = d3.line()
        .x(d => xScale(d.timestamp))
        .y(d => priceYScale(d.price))
        .curve(d3.curveMonotoneX);
    
    // Create axes
    priceG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${priceChartHeight})`)
        .style('font-size', '12px');
    
    priceG.append('g')
        .attr('class', 'y-axis')
        .style('font-size', '12px');
    
    volumeG.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${volumeChartHeight})`)
        .style('font-size', '12px');
    
    volumeG.append('g')
        .attr('class', 'y-axis')
        .style('font-size', '12px');
    
    // Add axis labels
    priceG.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -priceChartHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Price ($)');
    
    priceG.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', priceChartHeight + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Time');
    
    volumeG.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -volumeChartHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Volume');
    
    volumeG.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', volumeChartHeight + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Time');
    
    // Create legend group
    const legendG = priceSvg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width + margin.left + 10}, ${margin.top})`);
    
    // Create tooltip
    tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(255, 255, 255, 0.9)')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('box-shadow', '0 2px 5px rgba(0, 0, 0, 0.2)')
        .style('pointer-events', 'none')
        .style('opacity', 0);
}

// Update chart dimensions on resize
function updateChartDimensions() {
    // Get container width
    width = document.getElementById('price-chart').clientWidth - margin.left - margin.right;
    
    // Update SVG dimensions
    if (priceSvg) {
        priceSvg.attr('width', width + margin.left + margin.right);
        volumeSvg.attr('width', width + margin.left + margin.right);
        
        // Update scales
        xScale.range([0, width]);
    }
}

// Update charts based on selected stock
function updateCharts() {
    if (!priceSvg) return; // Charts not initialized yet
    
    // Prepare data for visualization
    const allData = [];
    
    if (selectedStock === 'ALL') {
        // Add all stocks
        for (const ticker in tradeData) {
            if (tradeData[ticker].timestamps.length > 0) {
                const stockData = prepareStockData(ticker);
                allData.push(stockData);
            }
        }
    } else if (tradeData[selectedStock] && tradeData[selectedStock].timestamps.length > 0) {
        // Add only selected stock
        const stockData = prepareStockData(selectedStock);
        allData.push(stockData);
    }
    
    // If no data, return
    if (allData.length === 0) return;
    
    // Update domains
    const allTimestamps = allData.flatMap(d => d.data.map(p => p.timestamp));
    const allPrices = allData.flatMap(d => d.data.map(p => p.price));
    const allVolumes = allData.flatMap(d => d.data.map(p => p.volume));
    
    xScale.domain(d3.extent(allTimestamps));
    priceYScale.domain([
        d3.min(allPrices) * 0.99, // Add 1% padding
        d3.max(allPrices) * 1.01
    ]);
    volumeYScale.domain([0, d3.max(allVolumes) * 1.05]);
    
    // Update axes
    priceG.select('.x-axis').call(
        d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    );
    priceG.select('.y-axis').call(d3.axisLeft(priceYScale).tickFormat(d => `$${d.toFixed(2)}`));
    
    volumeG.select('.x-axis').call(
        d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    );
    volumeG.select('.y-axis').call(d3.axisLeft(volumeYScale).tickFormat(d => d3.format('.2s')(d)));
    
    // Update price lines
    const priceLines = priceG.selectAll('.price-line')
        .data(allData, d => d.ticker);
    
    // Remove old lines
    priceLines.exit().remove();
    
    // Add new lines
    priceLines.enter()
        .append('path')
        .attr('class', 'price-line')
        .merge(priceLines)
        .attr('d', d => priceLine(d.data))
        .attr('fill', 'none')
        .attr('stroke', d => d.color)
        .attr('stroke-width', 2)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round');
    
    // Update volume bars
    // First, remove all existing bars
    volumeG.selectAll('.volume-bar').remove();
    
    // Then add new bars for each stock
    allData.forEach(stockData => {
        const barWidth = Math.max(2, width / (maxDataPoints * 1.5)); // Ensure bars are visible
        
        volumeG.selectAll(`.volume-bar-${stockData.ticker}`)
            .data(stockData.data)
            .enter()
            .append('rect')
            .attr('class', `volume-bar volume-bar-${stockData.ticker}`)
            .attr('x', d => xScale(d.timestamp) - barWidth / 2)
            .attr('y', d => volumeYScale(d.volume))
            .attr('width', barWidth)
            .attr('height', d => volumeChartHeight - volumeYScale(d.volume))
            .attr('fill', stockData.color + '80') // Add transparency
            .attr('stroke', stockData.color)
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                tooltip.html(`
                    <strong>${stockData.ticker}</strong><br/>
                    Time: ${d.timestamp.toLocaleTimeString()}<br/>
                    Volume: ${d.volume.toLocaleString()}<br/>
                    Price: $${d.price.toFixed(2)}
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    });
    
    // Update legend
    updateLegend(allData);
}

// Prepare stock data for visualization
function prepareStockData(ticker) {
    const data = tradeData[ticker].timestamps.map((timestamp, i) => ({
        timestamp,
        price: tradeData[ticker].prices[i],
        volume: tradeData[ticker].volumes[i]
    }));
    
    return {
        ticker,
        color: stockColors[ticker] || '#000000',
        data
    };
}

// Update legend
function updateLegend(allData) {
    // Remove existing legend
    priceSvg.select('.legend').remove();
    
    // Create new legend
    const legendG = priceSvg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width + margin.left + 10}, ${margin.top})`);
    
    // Add legend items
    allData.forEach((stockData, i) => {
        const legendItem = legendG.append('g')
            .attr('transform', `translate(0, ${i * 20})`);
        
        legendItem.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', stockData.color);
        
        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .style('font-size', '12px')
            .text(stockData.ticker);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Stock selector
    document.getElementById('selected-stock').addEventListener('change', function(e) {
        selectedStock = e.target.value;
        updateCharts();
    });
    
    // Pause button
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.addEventListener('click', function() {
        isPaused = wsClient.togglePause();
        pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });
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
