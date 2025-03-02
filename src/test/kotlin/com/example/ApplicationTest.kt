package com.example

import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ApplicationTest {
    @Test
    fun testRoot() = testApplication {
        application {
            module()
        }
        client.config {
            expectSuccess = true
            followRedirects = false
        }
        val response = client.get("/")
        assertEquals(200, response.status.value)
        // We're now checking for a 200 OK response, so we don't expect a Location header
    }

    @Test
    fun testCharts() = testApplication {
        application {
            module()
        }

        client.get("/charts").apply {
            assertEquals(HttpStatusCode.OK, status)
            assertTrue(bodyAsText().contains("Ktor Trading - Interactive Charts"))
        }
    }

    @Test
    fun testChartData() = testApplication {
        application {
            module()
        }

        client.get("/charts/data").apply {
            assertEquals(HttpStatusCode.OK, status)
            assertTrue(bodyAsText().contains("title"))
            assertTrue(bodyAsText().contains("series"))
        }
    }
}
