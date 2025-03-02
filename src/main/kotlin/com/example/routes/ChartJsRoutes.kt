package com.example.routes

import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.server.routing.*
import kotlinx.html.*

/**
 * Configure routes for Chart.js trading visualization
 */
fun Route.configureChartJsRoutes() {
    // Chart.js implementation
    get {
        call.respondHtml {
            head {
                title("Ktor Trading - Chart.js Trading")
                meta(charset = "UTF-8")
                meta(name = "viewport", content = "width=device-width, initial-scale=1.0")
                link(rel = "stylesheet", href = "/static/css/styles.css")
                // Include Chart.js library
                script(src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js") {}
                // Include date adapter for Chart.js
                script(src = "https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js") {}
                // Include WebSocket client
                script(src = "/static/js/websocket-client.js") {}
            }
            body {
                div {
                    id = "header"
                    h1 { +"Ktor Trading - Chart.js Trading" }
                    p { +"Live trading data powered by WebSockets and Chart.js" }
                    a(href = "/trades") { +"← Back to comparison" }
                    div {
                        id = "connection-status"
                        style = "margin-top: 10px; font-weight: bold;"
                        +"Connecting..."
                    }
                }
                
                div {
                    id = "ticker-container"
                    style = "display: flex; flex-wrap: wrap; gap: 10px; margin: 20px; justify-content: center;"
                }
                
                div {
                    id = "chart-controls"
                    div {
                        id = "stock-selector"
                        label {
                            htmlFor = "selected-stock"
                            +"Select Stock: "
                        }
                        select {
                            id = "selected-stock"
                            option { value = "ALL"; +"All Stocks" }
                            option { value = "AAPL"; +"Apple (AAPL)" }
                            option { value = "MSFT"; +"Microsoft (MSFT)" }
                            option { value = "GOOGL"; +"Alphabet (GOOGL)" }
                            option { value = "AMZN"; +"Amazon (AMZN)" }
                            option { value = "TSLA"; +"Tesla (TSLA)" }
                            option { value = "META"; +"Meta (META)" }
                            option { value = "NVDA"; +"NVIDIA (NVDA)" }
                            option { value = "NFLX"; +"Netflix (NFLX)" }
                        }
                    }
                    button {
                        id = "pause-btn"
                        +"Pause"
                    }
                }
                
                div {
                    id = "trade-list"
                    style = "max-height: 200px; overflow-y: auto; margin: 20px; border: 1px solid #ddd; border-radius: 5px; padding: 10px;"
                    h3 { +"Recent Trades" }
                    table {
                        id = "trades-table"
                        style = "width: 100%; border-collapse: collapse;"
                        thead {
                            tr {
                                th { +"Time" }
                                th { +"Ticker" }
                                th { +"Price" }
                                th { +"Volume" }
                                th { +"Type" }
                            }
                        }
                        tbody {
                            id = "trades-body"
                        }
                    }
                }
                
                div {
                    style = "display: flex; flex-direction: column; gap: 20px; margin: 20px;"
                    
                    div {
                        style = "width: 100%; height: 400px; position: relative;"
                        canvas {
                            id = "price-chart"
                            style = "width: 100%; height: 100%;"
                        }
                    }
                    
                    div {
                        style = "width: 100%; height: 200px; position: relative;"
                        canvas {
                            id = "volume-chart"
                            style = "width: 100%; height: 100%;"
                        }
                    }
                }
                
                script(src = "/static/js/trades-chartjs.js") {}
            }
        }
    }
}
