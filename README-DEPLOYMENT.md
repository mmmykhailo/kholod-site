# Deployment

## Quick Start

Deploy from your PC to VPS:

```bash
# 1. Setup (first time only)
cp .deploy-config.example .deploy-config
nano .deploy-config
# Add your VPS IP, SSH details, and optionally your domain
# If you set DOMAIN, Caddy will auto-configure HTTPS!

# 2. Deploy
./deploy-remote.sh
```

Choose option 1 from the menu.

## What You Have

- **deploy-remote.sh** - Deploy from your PC to VPS via SSH (interactive menu)
- **deploy.sh** - Deploy script that runs on VPS
- **Caddyfile** - Caddy reverse proxy configuration (automatic HTTPS!)
- **DEPLOY.md** - Full deployment documentation

## How It Works

1. Syncs files from your PC to VPS via rsync
2. Installs Node.js, Bun, PM2 on VPS
3. Builds both apps (Strapi backend + React Router frontend)
4. Starts them with PM2

## After Deployment

Without Caddy (direct port access):
- Frontend: http://your-vps-ip:3006
- Strapi Admin: http://your-vps-ip:1337/admin
- Strapi API: http://your-vps-ip:1337/api

With Caddy (recommended - automatic HTTPS):
- Frontend: https://yourdomain.com
- Strapi Admin: https://yourdomain.com/admin
- Strapi API: https://yourdomain.com/api

Setup Caddy reverse proxy (see DEPLOY.md for step-by-step instructions).
Caddy automatically handles SSL certificates with Let's Encrypt - no manual setup needed!

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
