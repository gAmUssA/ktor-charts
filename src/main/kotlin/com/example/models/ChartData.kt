package com.example.models

import kotlinx.serialization.Serializable

@Serializable
data class ChartData(
    val title: String,
    val subtitle: String? = null,
    val xAxis: XAxis? = null,
    val yAxis: YAxis? = null,
    val series: List<Series>,
    val legend: Legend? = null
)

@Serializable
data class XAxis(
    val type: String,
    val data: List<String>? = null,
    val name: String? = null
)

@Serializable
data class YAxis(
    val type: String,
    val name: String? = null
)

@Serializable
data class Series(
    val name: String,
    val type: String,
    val data: List<Double>,
    val itemStyle: ItemStyle? = null
)

@Serializable
data class ItemStyle(
    val color: String? = null
)

@Serializable
data class Legend(
    val data: List<String>
)

// For raw data from public APIs
@Serializable
data class StockData(
    val date: String,
    val open: Double,
    val high: Double,
    val low: Double,
    val close: Double,
    val volume: Long
)

@Serializable
data class WeatherData(
    val date: String,
    val temperature: Double,
    val humidity: Double,
    val precipitation: Double
)

@Serializable
data class PopulationData(
    val country: String,
    val year: Int,
    val population: Long
)

// WebSocket Trade Data
@Serializable
data class TradeData(
    val ticker: String,
    val price: Double,
    val volume: Int,
    val timestamp: Long,
    val type: TradeType
)

@Serializable
enum class TradeType {
    BUY, SELL
}

@Serializable
data class StockTicker(
    val symbol: String,
    val name: String,
    val currentPrice: Double,
    val previousClose: Double,
    val change: Double,
    val changePercent: Double
)

@Serializable
data class TradeUpdate(
    val ticker: StockTicker,
    val trades: List<TradeData>
)
