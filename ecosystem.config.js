module.exports = {
  apps: [
    {
      name: 'kholod-strapi',
      cwd: './kholod-strapi',
      script: './start.sh',
      interpreter: 'bash',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'kholod-frontend',
      cwd: './kholod-rr',
      script: './start.sh',
      interpreter: 'bash',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
