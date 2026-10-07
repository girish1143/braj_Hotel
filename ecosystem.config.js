module.exports = {
  apps: [
    {
      name: 'brijnidhi-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'brijnidhi-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'brijnidhi-rust-admin',
      cwd: './backend-rust',
      script: './target/release/brijnidhi-admin-backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env_production: {
        PORT: 5001
      }
    }
  ]
};
