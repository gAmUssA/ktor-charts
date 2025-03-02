/**
 * WebSocket client for trading data
 * This utility provides a standardized way to connect to the WebSocket server
 * and handle trade updates across different visualization libraries.
 */

class TradeWebSocketClient {
    /**
     * Create a new WebSocket client
     * @param {Function} onTradeUpdate - Callback function to handle trade updates
     * @param {Function} onConnectionOpen - Callback function when connection opens
     * @param {Function} onConnectionClose - Callback function when connection closes
     * @param {Function} onConnectionError - Callback function when connection errors
     */
    constructor(onTradeUpdate, onConnectionOpen, onConnectionClose, onConnectionError) {
        this.onTradeUpdate = onTradeUpdate;
        this.onConnectionOpen = onConnectionOpen || (() => console.log('WebSocket connection opened'));
        this.onConnectionClose = onConnectionClose || (() => console.log('WebSocket connection closed'));
        this.onConnectionError = onConnectionError || ((error) => console.error('WebSocket error:', error));
        
        this.isPaused = false;
        this.socket = null;
    }
    
    /**
     * Connect to the WebSocket server
     */
    connect() {
        // Determine the WebSocket protocol (ws or wss) based on the current page protocol
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${protocol}://${window.location.host}/trades/ws`;
        
        // Create WebSocket connection
        this.socket = new WebSocket(wsUrl);
        
        // Connection opened
        this.socket.addEventListener('open', (event) => {
            this.onConnectionOpen(event);
        });
        
        // Listen for messages
        this.socket.addEventListener('message', (event) => {
            if (!this.isPaused) {
                try {
                    const tradeUpdate = JSON.parse(event.data);
                    
                    // Process trade update if valid
                    if (tradeUpdate && tradeUpdate.trades && Array.isArray(tradeUpdate.trades)) {
                        this.onTradeUpdate(tradeUpdate);
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            }
        });
        
        // Connection closed
        this.socket.addEventListener('close', (event) => {
            this.onConnectionClose(event);
        });
        
        // Connection error
        this.socket.addEventListener('error', (event) => {
            this.onConnectionError(event);
        });
    }
    
    /**
     * Disconnect from the WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
    
    /**
     * Pause receiving updates
     */
    pause() {
        this.isPaused = true;
    }
    
    /**
     * Resume receiving updates
     */
    resume() {
        this.isPaused = false;
    }
    
    /**
     * Toggle pause state
     * @returns {boolean} New pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }
}
