# Ktor Trading - Interactive Charts

A Kotlin-based web application built with Ktor that displays interactive charts using various visualization libraries. The application fetches data from public sources and visualizes it in various chart types.

## Features

- Interactive data visualizations 
- Multiple chart types: Line, Bar, Pie, and Scatter
- Real-time data updates
- Responsive design for desktop and mobile devices
- Built with Kotlin and Ktor

## Prerequisites

- JDK 11 or higher
- Gradle

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ktor-kandy.git
   cd ktor-kandy
   ```

2. Run the application:
   ```
   ./gradlew run
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Project Structure

- `src/main/kotlin/com/example/` - Kotlin source files
  - `Application.kt` - Main application entry point
  - `plugins/` - Ktor plugins configuration
  - `routes/` - HTTP route definitions
  - `services/` - Data services
  - `models/` - Data models
- `src/main/resources/` - Static resources and templates
  - `static/css/` - CSS stylesheets
  - `static/js/` - JavaScript files for chart rendering

## Real-time Stock Data

The application uses the [Alpha Vantage API](https://www.alphavantage.co/) to fetch real-time stock data for popular tech companies. By default, it uses the "demo" API key, which has limited functionality. To use your own API key:

1. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Run the application with your API key:
   ```
   make run-with-api-key
   ```
   
   Or set the environment variable manually:
   ```
   ALPHAVANTAGE_API_KEY=your_api_key make run
   ```

## Customizing Data Sources

The application currently uses sample data for demonstration purposes. To connect to real public data sources:

1. Open `src/main/kotlin/com/example/services/DataService.kt`
2. Uncomment and modify the API endpoint methods
3. Add your API keys if required

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Ktor](https://ktor.io/) - Kotlin asynchronous web framework
- [Kotlin](https://kotlinlang.org/) - A modern programming language for the JVM
