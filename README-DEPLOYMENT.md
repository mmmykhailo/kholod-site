# Deployment

## Quick Start

Deploy from your PC to VPS:

```bash
# 1. Setup (first time only)
cp .deploy-config.example .deploy-config
nano .deploy-config  # Add your VPS IP and SSH details

# 2. Deploy
./deploy-remote.sh
```

Choose option 1 from the menu.

## What You Have

- **deploy-remote.sh** - Deploy from your PC to VPS via SSH (interactive menu)
- **deploy.sh** - Deploy script that runs on VPS
- **nginx.conf** - Nginx reverse proxy configuration
- **DEPLOY.md** - Full deployment documentation

## How It Works

1. Syncs files from your PC to VPS via rsync
2. Installs Node.js, Bun, PM2 on VPS
3. Builds both apps (Strapi backend + React Router frontend)
4. Starts them with PM2

## After Deployment

Without Nginx (direct port access):
- Frontend: http://your-vps-ip:3006
- Strapi Admin: http://your-vps-ip:1337/admin
- Strapi API: http://your-vps-ip:1337/api

With Nginx (recommended - all on port 80):
- Frontend: http://yourdomain.com
- Strapi Admin: http://yourdomain.com/admin
- Strapi API: http://yourdomain.com/api

Setup Nginx reverse proxy (see DEPLOY.md for step-by-step instructions).
For production, add SSL with certbot (automatic setup).

## Common Commands

```bash
# Deploy
./deploy-remote.sh

# View logs
./deploy-remote.sh  # option 6

# SSH to VPS
./deploy-remote.sh  # option 7

# On VPS:
pm2 status
pm2 logs
pm2 restart all
```

See **DEPLOY.md** for full documentation.
