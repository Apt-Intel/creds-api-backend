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
      env: {
        NODE_ENV: process.env.NODE_ENV || "development",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
