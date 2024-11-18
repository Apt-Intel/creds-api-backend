# PM2 Implementation Guide

## Overview

PM2 is implemented solely for automatic server restart functionality. It monitors the Node.js process and restarts it if it crashes, without interfering with the application's existing logging or other functionalities.

## Configuration

`ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "creds-api-backend",
      script: "app.js",
      watch: false,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "1m",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "logs/pm2/error.log",
      out_file: "logs/pm2/out.log",
      merge_logs: true,
      log_type: "raw",
    },
  ],
};
```

## Setup Instructions

### Installation

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 log directory
mkdir -p logs/pm2

# Start application
pm2 start ecosystem.config.js

# Enable startup script (run as root/sudo)
pm2 startup
pm2 save
```

## Basic Commands

### Process Management

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop creds-api-backend

# Restart
pm2 restart creds-api-backend

# Delete from PM2
pm2 delete creds-api-backend
```

### Monitoring

```bash
# View process list
pm2 list

# View logs
pm2 logs creds-api-backend --raw

# Monitor CPU/Memory
pm2 monit
```

## Logs

- PM2 logs are stored separately in:
  - `logs/pm2/out.log`
  - `logs/pm2/error.log`
- Application's existing logging system remains unchanged

## Troubleshooting

### Common Issues

1. **Process won't start:**

   ```bash
   pm2 logs creds-api-backend
   ```

2. **Check process status:**

   ```bash
   pm2 show creds-api-backend
   ```

3. **Clean PM2 logs:**
   ```bash
   pm2 flush
   ```

## Notes

- PM2 only handles process monitoring and automatic restarts
- Existing application logs, monitoring, and other functionalities remain unchanged
- PM2's role is strictly limited to process management

---

For detailed PM2 documentation, visit: [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
