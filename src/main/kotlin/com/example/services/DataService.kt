package com.example.services

import com.example.models.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlin.random.Random

class DataService {
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }
    
    // For demo purposes, we'll generate sample data
    // In a real application, you would fetch from actual public APIs
    fun fetchData(chartType: String): ChartData = runBlocking {
        return@runBlocking when (chartType) {
            "bar" -> getBarChartData()
            "pie" -> getPieChartData()
            "scatter" -> getScatterChartData()
            else -> getLineChartData()
        }
    }
    
    private fun getLineChartData(): ChartData {
        // Simulating temperature data over time
        val months = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
        val temperatures = List(12) { 10 + Random.nextDouble(0.0, 20.0) }
        val rainfall = List(12) { Random.nextDouble(0.0, 100.0) }
        
        return ChartData(
            title = "Monthly Temperature and Rainfall",
            xAxis = XAxis(type = "category", data = months),
            yAxis = YAxis(type = "value", name = "Temperature (°C)"),
            series = listOf(
                Series(
                    name = "Temperature",
                    type = "line",
                    data = temperatures
                ),
                Series(
                    name = "Rainfall",
                    type = "line",
                    data = rainfall
                )
            ),
            legend = Legend(data = listOf("Temperature", "Rainfall"))
        )
    }
    
    private fun getBarChartData(): ChartData {
        // Simulating population data
        val countries = listOf("USA", "China", "India", "Indonesia", "Brazil", "Pakistan", "Nigeria", "Bangladesh", "Russia", "Mexico")
        val population = List(10) { Random.nextDouble(100.0, 1400.0) }
        
        return ChartData(
            title = "Population by Country (Millions)",
            xAxis = XAxis(type = "category", data = countries),
            yAxis = YAxis(type = "value"),
            series = listOf(
                Series(
                    name = "Population",
                    type = "bar",
                    data = population
                )
            )
        )
    }
    
    private fun getPieChartData(): ChartData {
        // Simulating energy consumption by source
        val sources = listOf("Coal", "Natural Gas", "Nuclear", "Hydro", "Wind", "Solar", "Other Renewables")
        val consumption = List(7) { Random.nextDouble(5.0, 30.0) }
        
        return ChartData(
            title = "Energy Consumption by Source",
            series = listOf(
                Series(
                    name = "Energy Source",
                    type = "pie",
                    data = consumption,
                    itemStyle = ItemStyle()
                )
            ),
            legend = Legend(data = sources)
        )
    }
    
    private fun getScatterChartData(): ChartData {
        // Simulating GDP vs Life Expectancy
        val countries = listOf("USA", "China", "India", "Japan", "Germany", "UK", "France", "Brazil", "Italy", "Canada")
        val gdpData = List(10) { 10000 + Random.nextDouble(0.0, 60000.0) }
        val lifeExpectancyData = List(10) { 60 + Random.nextDouble(0.0, 25.0) }
        
        // Combine the data for scatter plot
        val combinedData = gdpData.zip(lifeExpectancyData) { gdp, life -> gdp }
        
        return ChartData(
            title = "GDP vs Life Expectancy",
            xAxis = XAxis(type = "value", name = "GDP per Capita ($)"),
            yAxis = YAxis(type = "value", name = "Life Expectancy (years)"),
            series = listOf(
                Series(
                    name = "Countries",
                    type = "scatter",
                    data = combinedData
                )
            )
        )
    }
    
    // In a real application, you would implement methods to fetch from actual APIs
    // For example:
    
    /*
    private suspend fun fetchWeatherData(): List<WeatherData> {
        return client.get("https://api.openweathermap.org/data/2.5/forecast?q=London&appid=YOUR_API_KEY").body()
    }
    
    private suspend fun fetchStockData(): List<StockData> {
        return client.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=YOUR_API_KEY").body()
    }
    
    private suspend fun fetchPopulationData(): List<PopulationData> {
        return client.get("https://datausa.io/api/data?drilldowns=Nation&measures=Population").body()
    }
    */
}
