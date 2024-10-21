# Logging in Creds API Backend

## 1. Overview of Logging Implementation

Our Creds API Backend uses a centralized logging system based on Winston, a versatile logging library for Node.js. The logging system is designed to provide detailed, traceable logs across the entire application, including:

- Application-wide events (startup, shutdown, database connections)
- HTTP request logging
- Error logging
- Custom application logs

Key features of our logging implementation:

- Centralized logger configuration
- Request ID tracking for better traceability
- Log rotation to manage log file sizes
- Environment-specific log levels

## 2. Logger Configuration

The logger is configured in `config/logger.js`. Here are the key components:

### 2.1 Log Levels

Log levels are determined based on the `NODE_ENV` environment variable:

- Development: 'debug'
- Test: 'info'
- Production: 'warn'
- Default: 'info'

### 2.2 Transports

The logger uses three transports:

1. Console: For immediate feedback during development
2. Daily Rotate File (all levels): For comprehensive logging
3. Daily Rotate File (error level): For focused error tracking

### 2.3 Log Format

Logs are formatted as JSON with the following fields:

- timestamp
- level
- message
- requestId
- Any additional metadata

## 3. Request ID Implementation

Request IDs are implemented using the `cls-hooked` library, which provides a way to set and retrieve values that are specific to each request.

### 3.1 How it works

1. The `requestIdMiddleware` in `middlewares/requestIdMiddleware.js` generates a unique ID for each request using `uuid`.
2. This ID is stored in a continuation-local storage namespace.
3. The logger retrieves this ID for each log message, ensuring traceability across the request lifecycle.

### 3.2 System-wide Request ID

For logs generated outside of a request context (e.g., during app startup), a system-wide request ID is used.

## 4. Log Rotation

Log rotation is implemented using `winston-daily-rotate-file` transport. This helps manage log file sizes and organize logs by date.

### 4.1 Configuration

- Logs are rotated daily
- Each log file is limited to 20MB
- Logs are kept for 14 days
- Old log files are automatically compressed

## 5. How to Use the Logger

The logger can be used throughout the application by importing it from `config/logger.js`.

### 5.1 Basic Usage
