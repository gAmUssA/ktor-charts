val ktor_version = "2.3.7"
val kotlin_version = "1.9.22"
val logback_version = "1.4.11"
val exposed_version = "0.44.1"
val h2_version = "2.2.224"

plugins {
    kotlin("jvm") version "1.9.22"
    id("io.ktor.plugin") version "2.3.7"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.22"
}

group = "com.example"
version = "0.0.1"

application {
    mainClass.set("com.example.ApplicationKt")

    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

// Add JVM target compatibility
kotlin {
    jvmToolchain(21) // Using 21 as the highest Kotlin-supported JVM target
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21)) // Using 21 as the highest Kotlin-supported JVM target
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Ktor core dependencies
    implementation("io.ktor:ktor-server-core-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-netty-jvm:$ktor_version")
    implementation("io.ktor:ktor-server-content-negotiation:$ktor_version")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktor_version")
    implementation("io.ktor:ktor-server-html-builder:$ktor_version")
    implementation("io.ktor:ktor-server-status-pages:$ktor_version")
    implementation("io.ktor:ktor-server-call-logging:$ktor_version")
    implementation("io.ktor:ktor-server-default-headers:$ktor_version")
    implementation("io.ktor:ktor-server-cors:$ktor_version")
    
    // WebSockets support
    implementation("io.ktor:ktor-server-websockets:$ktor_version")
    
    // HTTP client for fetching public data
    implementation("io.ktor:ktor-client-core:$ktor_version")
    implementation("io.ktor:ktor-client-cio:$ktor_version")
    implementation("io.ktor:ktor-client-content-negotiation:$ktor_version")
    
    // Logging
    implementation("ch.qos.logback:logback-classic:$logback_version")
    
    // HTML templating
    implementation("org.jetbrains.kotlinx:kotlinx-html-jvm:0.9.1")
    
    // Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    
    // Testing
    testImplementation("io.ktor:ktor-server-tests-jvm:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$kotlin_version")
}
