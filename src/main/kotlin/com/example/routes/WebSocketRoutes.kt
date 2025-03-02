package com.example.routes

import com.example.services.TradeService
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.onEach
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Configure WebSocket routes for trading data
 */
fun Route.configureWebSocketRoutes(tradeService: TradeService) {
    // WebSocket endpoint for trade updates
    webSocket {
        println("🔌 WebSocket connection established")

        try {
            // Send trade updates to the client
            tradeService.tradeUpdates()
                .onEach { tradeUpdate ->
                    // Convert trade update to JSON
                    val json = Json.encodeToString(tradeUpdate)
                    // Send to client
                    send(Frame.Text(json))
                    println("📡 Sent trade update for ${tradeUpdate.ticker.symbol} with ${tradeUpdate.trades.size} trades")
                }
                .collect()
        } catch (e: Exception) {
            // Log the error
            println("❌ Error in WebSocket: ${e.message}")
        } finally {
            println("🔌 WebSocket connection closed")
        }
    }
}
