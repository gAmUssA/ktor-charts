package com.example.routes

import com.example.models.ChartData
import com.example.services.DataService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.html.*

fun Routing.configureChartRoutes() {
    val dataService = DataService()
    
    route("/charts") {
        get {
            call.respondHtml(HttpStatusCode.OK) {
                head {
                    title("Ktor Trading - Interactive Charts")
                    meta(charset = "UTF-8")
                    meta(name = "viewport", content = "width=device-width, initial-scale=1.0")
                    link(rel = "stylesheet", href = "/static/css/styles.css")
                    // Include ECharts library
                    script(src = "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js") {}
                }
                body {
                    div {
                        id = "header"
                        h1 { +"Ktor Trading - Interactive Charts" }
                        p { +"Interactive data visualizations powered by Apache ECharts" }
                    }
                    
                    div {
                        id = "chart-controls"
                        div {
                            id = "data-selector"
                            label {
                                htmlFor = "chart-type"
                                +"Select Chart Type: "
                            }
                            select {
                                id = "chart-type"
                                option { value = "line"; +"Line Chart" }
                                option { value = "bar"; +"Bar Chart" }
                                option { value = "pie"; +"Pie Chart" }
                                option { value = "scatter"; +"Scatter Plot" }
                            }
                        }
                        button {
                            id = "refresh-btn"
                            +"Refresh Data"
                        }
                    }
                    
                    div {
                        id = "chart-container"
                        style = "width: 100%; height: 600px;"
                    }
                    
                    script(src = "/static/js/charts.js") {}
                }
            }
        }
        
        get("/data") {
            val chartType = call.request.queryParameters["type"] ?: "line"
            val data = dataService.fetchData(chartType)
            call.respond(data)
        }
    }
}
