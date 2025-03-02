package com.example.plugins

import com.example.routes.configureChartRoutes
import com.example.routes.configureTradeRoutes
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.utils.io.*

fun Application.configureRouting() {
    routing {
        get("/") {
            // This is a workaround to ensure we get a 302 status code
            call.response.header(HttpHeaders.Location, "/trades")
            call.respond(HttpStatusCode.Found)
        }

        configureChartRoutes()
        configureTradeRoutes()
    }
}
