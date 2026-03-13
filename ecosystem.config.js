module.exports = {
  apps: [
    {
      name: 'bakso-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 9000,
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
    },
    {
      name: 'bakso-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
      watch: false,
      instances: 1,
      autorestart: true,
    },
  ],
};
