package com.example.routes

import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.server.routing.*
import kotlinx.html.*

/**
 * Configure routes for the visualization comparison page
 */
fun Route.configureComparisonRoutes() {
    // Main comparison page
    get {
        call.respondHtml {
            head {
                title("Ktor Trading - Visualization Comparison")
                meta(charset = "UTF-8")
                meta(name = "viewport", content = "width=device-width, initial-scale=1.0")
                link(rel = "stylesheet", href = "/static/css/styles.css")
            }
            body {
                div {
                    id = "header"
                    h1 { +"Ktor Trading - Visualization Comparison" }
                    p { +"Compare different visualization libraries for real-time trading data" }
                }
                
                div {
                    id = "library-selector"
                    style = "display: flex; justify-content: center; gap: 20px; margin: 20px 0;"
                    
                    a(href = "/trades/echarts") {
                        classes = setOf("lib-button")
                        +"Apache ECharts"
                    }
                    
                    a(href = "/trades/chartjs") {
                        classes = setOf("lib-button")
                        +"Chart.js"
                    }
                    
                    a(href = "/trades/plotly") {
                        classes = setOf("lib-button")
                        +"Plotly.js"
                    }
                    
                    a(href = "/trades/d3") {
                        classes = setOf("lib-button")
                        +"D3.js"
                    }
                }
                
                div {
                    id = "comparison-info"
                    style = "max-width: 800px; margin: 0 auto; padding: 20px;"
                    
                    h2 { +"Visualization Library Comparison" }
                    
                    div {
                        classes = setOf("comparison-cards")
                        
                        div {
                            classes = setOf("comparison-card")
                            h3 { +"ECharts" }
                            p { +"Apache ECharts is a powerful charting library with rich features." }
                            ul {
                                li { +"Pros: Feature-rich, beautiful defaults, good performance" }
                                li { +"Cons: Larger file size, steeper learning curve" }
                                li { +"Best for: Complex dashboards, interactive charts" }
                            }
                            a(href = "/trades/echarts", classes = "view-btn") { +"View Demo" }
                        }
                        
                        div {
                            classes = setOf("comparison-card")
                            h3 { +"Chart.js" }
                            p { +"Simple and flexible JavaScript charting library." }
                            ul {
                                li { +"Pros: Lightweight, easy to use, responsive" }
                                li { +"Cons: Limited chart types, less customization" }
                                li { +"Best for: Simple charts, quick implementation" }
                            }
                            a(href = "/trades/chartjs", classes = "view-btn") { +"View Demo" }
                        }
                        
                        div {
                            classes = setOf("comparison-card")
                            h3 { +"Plotly.js" }
                            p { +"Scientific and technical charting library based on D3.js." }
                            ul {
                                li { +"Pros: Scientific-grade charts, interactive features" }
                                li { +"Cons: Larger file size, can be complex" }
                                li { +"Best for: Data science, technical charts" }
                            }
                            a(href = "/trades/plotly", classes = "view-btn") { +"View Demo" }
                        }
                        
                        div {
                            classes = setOf("comparison-card")
                            h3 { +"D3.js" }
                            p { +"Powerful, low-level visualization library for custom visualizations." }
                            ul {
                                li { +"Pros: Extremely flexible, powerful animations, fine-grained control" }
                                li { +"Cons: Steep learning curve, more code required" }
                                li { +"Best for: Custom, unique visualizations" }
                            }
                            a(href = "/trades/d3", classes = "view-btn") { +"View Demo" }
                        }
                    }
                }
            }
        }
    }
}
