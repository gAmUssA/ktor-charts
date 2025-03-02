# Ktor Trading Makefile

# Colors
YELLOW := \033[1;33m
GREEN := \033[1;32m
CYAN := \033[1;36m
RED := \033[1;31m
RESET := \033[0m

# Default target
.PHONY: all
all: help

# Help target
.PHONY: help
help:
	@echo "${CYAN}🚀 Ktor Trading - Visualization Comparison${RESET}"
	@echo ""
	@echo "${YELLOW}Available commands:${RESET}"
	@echo "  ${GREEN}make run${RESET}       - 🏃 Run the application"
	@echo "  ${GREEN}make build${RESET}     - 🔨 Build the application"
	@echo "  ${GREEN}make clean${RESET}     - 🧹 Clean build artifacts"
	@echo "  ${GREEN}make test${RESET}      - 🧪 Run tests"
	@echo "  ${GREEN}make run-with-api-key${RESET} - 🔑 Run with custom API key"
	@echo ""
	@echo "${YELLOW}Visualization Libraries:${RESET}"
	@echo "  ${CYAN}• Apache ECharts${RESET} - Default implementation"
	@echo "  ${CYAN}• Chart.js${RESET}      - Simple and lightweight"
	@echo "  ${CYAN}• Plotly.js${RESET}     - Scientific-grade visualizations"
	@echo "  ${CYAN}• D3.js${RESET}         - Powerful and flexible"
	@echo ""

# Run target
.PHONY: run
run:
	@echo "${GREEN}🚀 Starting Ktor Trading application...${RESET}"
	@echo "${CYAN}📊 Access visualization comparison at http://localhost:8080${RESET}"
	@./gradlew run

# Run with API key
.PHONY: run-with-api-key
run-with-api-key:
	@echo "${GREEN}🔑 Enter your Alpha Vantage API key:${RESET}"
	@read API_KEY; \
	echo "${GREEN}🚀 Starting Ktor Trading application with custom API key...${RESET}"; \
	echo "${CYAN}📊 Access visualization comparison at http://localhost:8080${RESET}"; \
	ALPHAVANTAGE_API_KEY=$$API_KEY ./gradlew run

# Build target
.PHONY: build
build:
	@echo "${GREEN}🔨 Building Ktor Trading application...${RESET}"
	@./gradlew build
	@echo "${GREEN}✅ Build completed successfully!${RESET}"

# Clean target
.PHONY: clean
clean:
	@echo "${YELLOW}🧹 Cleaning build artifacts...${RESET}"
	@./gradlew clean
	@echo "${GREEN}✅ Clean completed!${RESET}"

# Test target
.PHONY: test
test:
	@echo "${CYAN}🧪 Running tests...${RESET}"
	@./gradlew test
	@echo "${GREEN}✅ Tests completed!${RESET}"
