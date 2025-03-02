#!/bin/bash

# Check if Gradle is installed
if ! command -v gradle &> /dev/null; then
    echo "Gradle is not installed. Please install Gradle first."
    echo "You can install it using Homebrew with: brew install gradle"
    echo "Or visit https://gradle.org/install/ for other installation methods."
    exit 1
fi

# Create Gradle wrapper
echo "Creating Gradle wrapper..."
gradle wrapper

# Build the project
echo "Building the project..."
./gradlew build

# Run the application
echo "Running the application..."
./gradlew run

# The application will be available at http://localhost:8080
echo "Once the application starts, visit http://localhost:8080 in your browser."
