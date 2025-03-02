package com.example.routes

import com.example.services.TradeService
import io.ktor.server.routing.*

/**
 * Configure all trade-related routes
 */
fun Routing.configureTradeRoutes() {
    val config = application.environment.config
    val tradeService = TradeService(config)
    
    route("/trades") {
        // Comparison page
        configureComparisonRoutes()
        
        // Individual visualization library routes
        route("/echarts") {
            configureEChartsRoutes()
        }
        
        route("/chartjs") {
            configureChartJsRoutes()
        }
        
        route("/plotly") {
            configurePlotlyRoutes()
        }
        
        route("/d3") {
            configureD3Routes()
        }
        
        // WebSocket routes
        route("/ws") {
            configureWebSocketRoutes(tradeService)
        }
    }
}
