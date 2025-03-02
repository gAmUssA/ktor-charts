package com.example.services

import com.example.models.StockTicker
import com.example.models.TradeData
import com.example.models.TradeType
import com.example.models.TradeUpdate
import io.ktor.server.config.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.Instant
import kotlin.random.Random

class TradeService(config: ApplicationConfig? = null) {
    // Use AlphaVantage service for real stock data
    private val alphaVantageService = AlphaVantageService(config)

    // Generate a flow of trade updates based on real stock data
    fun tradeUpdates(): Flow<TradeUpdate> = alphaVantageService.stockUpdates().map { stocks ->
        // For each stock, generate some random trades
        val stockUpdates = stocks.map { stock ->
            // Generate 1-3 random trades for this stock
            val numTrades = Random.nextInt(1, 4)
            val trades = (1..numTrades).map {
                generateTrade(stock)
            }

            TradeUpdate(
                ticker = stock,
                trades = trades
            )
        }

        // Return a random stock update
        stockUpdates.random()
    }

    // Generate a random trade for a stock
    private fun generateTrade(stock: StockTicker): TradeData {
        val tradeType = if (Random.nextBoolean()) TradeType.BUY else TradeType.SELL
        val volume = Random.nextInt(10, 1000)

        // Add a small random variation to the price
        val priceVariation = stock.currentPrice * Random.nextDouble(-0.001, 0.001)
        val tradePrice = stock.currentPrice + priceVariation

        return TradeData(
            ticker = stock.symbol,
            price = tradePrice,
            volume = volume,
            timestamp = Instant.now().toEpochMilli(),
            type = tradeType
        )
    }
}
