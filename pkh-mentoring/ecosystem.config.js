module.exports = {
  apps: [
    {
      name: "pkh-mentoring",
      script: "node_modules/.bin/next",
      args: "start --port 3099",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3099,
        TZ: "Europe/London",
      },
    },
  ],
};
