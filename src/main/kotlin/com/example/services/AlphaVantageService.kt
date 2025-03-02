package com.example.services

import com.example.models.StockTicker
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.config.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.time.Instant

/**
 * Service for fetching real-time stock data from Alpha Vantage API
 */
class AlphaVantageService(private val config: ApplicationConfig? = null) {
    // Get API key from config or use demo key as fallback
    private val apiKey = config?.propertyOrNull("api.alphavantage.key")?.getString() ?: "demo"
    
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }
    
    // List of stock symbols to track
    private val stockSymbols = listOf("AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX")
    
    // Map to store the latest data for each stock
    private val stockData = mutableMapOf<String, StockTicker>()
    
    // Initialize with some default values
    init {
        stockSymbols.forEach { symbol ->
            stockData[symbol] = StockTicker(
                symbol = symbol,
                name = getCompanyName(symbol),
                currentPrice = 0.0,
                previousClose = 0.0,
                change = 0.0,
                changePercent = 0.0
            )
        }
        
        println("🚀 AlphaVantage service initialized with API key: ${if (apiKey == "demo") "demo (limited usage)" else "custom key"}")
    }
    
    /**
     * Get company name based on symbol
     */
    private fun getCompanyName(symbol: String): String {
        return when (symbol) {
            "AAPL" -> "Apple Inc."
            "MSFT" -> "Microsoft Corporation"
            "GOOGL" -> "Alphabet Inc."
            "AMZN" -> "Amazon.com Inc."
            "TSLA" -> "Tesla, Inc."
            "META" -> "Meta Platforms, Inc."
            "NVDA" -> "NVIDIA Corporation"
            "NFLX" -> "Netflix, Inc."
            else -> symbol
        }
    }
    
    /**
     * Fetch real-time stock data for a symbol
     */
    private suspend fun fetchStockData(symbol: String): StockTicker {
        try {
            val response: GlobalQuoteResponse = client.get("https://www.alphavantage.co/query") {
                parameter("function", "GLOBAL_QUOTE")
                parameter("symbol", symbol)
                parameter("apikey", apiKey)
            }.body()
            
            val quote = response.globalQuote
            
            if (quote != null) {
                val currentPrice = quote.price
                val previousClose = quote.previousClose
                val change = quote.change
                val changePercent = quote.changePercent.removeSuffix("%").toDouble()
                
                val updatedStock = StockTicker(
                    symbol = symbol,
                    name = getCompanyName(symbol),
                    currentPrice = currentPrice,
                    previousClose = previousClose,
                    change = change,
                    changePercent = changePercent
                )
                
                // Update the cached data
                stockData[symbol] = updatedStock
                
                return updatedStock
            }
        } catch (e: Exception) {
            println("❌ Error fetching data for $symbol: ${e.message}")
        }
        
        // Return the cached data if the API call fails
        return stockData[symbol] ?: StockTicker(
            symbol = symbol,
            name = getCompanyName(symbol),
            currentPrice = 0.0,
            previousClose = 0.0,
            change = 0.0,
            changePercent = 0.0
        )
    }
    
    /**
     * Generate a flow of stock updates
     */
    fun stockUpdates(): Flow<List<StockTicker>> = flow {
        while (true) {
            val updatedStocks = withContext(Dispatchers.IO) {
                stockSymbols.mapNotNull { symbol ->
                    try {
                        fetchStockData(symbol)
                    } catch (e: Exception) {
                        println("❌ Error updating $symbol: ${e.message}")
                        null
                    }
                }
            }
            
            if (updatedStocks.isNotEmpty()) {
                emit(updatedStocks)
                println("📊 Emitted ${updatedStocks.size} stock updates")
            }
            
            // Delay for 1 second before the next update
            delay(1000)
        }
    }
}

@Serializable
data class GlobalQuoteResponse(
    @SerialName("Global Quote")
    val globalQuote: GlobalQuote? = null
)

@Serializable
data class GlobalQuote(
    @SerialName("01. symbol")
    val symbol: String,
    
    @SerialName("02. open")
    val open: Double,
    
    @SerialName("03. high")
    val high: Double,
    
    @SerialName("04. low")
    val low: Double,
    
    @SerialName("05. price")
    val price: Double,
    
    @SerialName("06. volume")
    val volume: Long,
    
    @SerialName("07. latest trading day")
    val latestTradingDay: String,
    
    @SerialName("08. previous close")
    val previousClose: Double,
    
    @SerialName("09. change")
    val change: Double,
    
    @SerialName("10. change percent")
    val changePercent: String
)
