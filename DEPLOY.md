# VPS Deployment Guide

Deploy your application to a VPS using native Node.js/PM2 (no Docker).

**Supported Operating Systems:**
- Ubuntu/Debian
- AlmaLinux/Rocky Linux/CentOS/RHEL
- Fedora

The deployment scripts automatically detect your OS and use the appropriate package manager.

## Quick Start

### From Your PC (Recommended)

```bash
# 1. Configure VPS connection (first time only)
cp .deploy-config.example .deploy-config
nano .deploy-config  # Add your VPS IP, user, etc.

# 2. Deploy
./deploy-remote.sh
```

Then choose option 1 (Full Deploy) from the menu.

### Directly on VPS

```bash
# SSH to VPS and clone repo
git clone <your-repo> /var/www/kholod-site
cd /var/www/kholod-site

# Deploy
./deploy.sh
```

## What Gets Installed

- Node.js 20
- Bun (for building and running backend)
- PM2 (process manager)
- Your application

## Application Architecture

The deployment uses:
- **ecosystem.config.js**: PM2 configuration file that manages both apps
- **kholod-strapi/start.sh**: Bash script that loads .env and starts Strapi with bun
- **kholod-rr/start.sh**: Bash script that loads .env and starts React Router server

These start scripts ensure environment variables from `.env` files are properly loaded.

## Configuration

### .deploy-config (for remote deployment)

```bash
VPS_HOST="123.45.67.89"              # Your VPS IP
VPS_USER="root"                      # SSH user
VPS_PORT="22"                        # SSH port
VPS_DEPLOY_PATH="/var/www/kholod-site"
SSH_KEY=""                           # Optional SSH key path
DOMAIN="example.com"                 # Optional domain (auto-configures Caddy HTTPS)
```

If you set `DOMAIN`, the deployment script will automatically configure Caddyfile with your domain and enable HTTPS.

### Environment Variables

**kholod-strapi/.env:**
```env
HOST=0.0.0.0
PORT=1337
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

**kholod-rr/.env:**
```env
PORT=3006
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=your_admin_email
SYSTEM_EMAIL=your_system_email
VITE_STRAPI_URL=http://localhost:1337
```

## After Deployment

### Setup Caddy Reverse Proxy

Caddy automatically handles HTTPS with Let's Encrypt - no manual SSL setup needed!

#### Option 1: Automatic Setup (Recommended)

```bash
# From your PC
./deploy-remote.sh
# Choose option 4 (Setup Caddy)
```

Then follow the on-screen instructions.

#### Option 2: Manual Setup

```bash
# SSH to VPS
ssh user@your-vps

# Copy Caddyfile
sudo cp /var/www/kholod-site/Caddyfile /etc/caddy/Caddyfile

# Edit with your domain
sudo nano /etc/caddy/Caddyfile
# Replace "yourdomain.com www.yourdomain.com" with your actual domain

# Validate configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Restart Caddy
sudo systemctl restart caddy
```

**For AlmaLinux/RHEL/CentOS only:**
```bash
# Allow Caddy to connect to backend services
sudo setsebool -P httpd_can_network_connect 1
```

**For IP-only access (no domain):**
Edit `/etc/caddy/Caddyfile` and uncomment the HTTP-only section, replacing the domain section.

That's it! Caddy will automatically:
- ✅ Get SSL certificates from Let's Encrypt
- ✅ Redirect HTTP to HTTPS
- ✅ Renew certificates automatically
- ✅ Handle all proxy configuration

Your site will be accessible at:
- **Frontend**: https://yourdomain.com (HTTP auto-redirects to HTTPS)
- **Strapi Admin**: https://yourdomain.com/admin
- **Strapi API**: https://yourdomain.com/api

**Note:** First time SSL setup may take 1-2 minutes. Check status: `sudo systemctl status caddy`

### Configure Firewall

#### Debian/Ubuntu (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

#### AlmaLinux/RHEL/CentOS (firewalld)
```bash
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Management Commands

### Using deploy-remote.sh (from your PC)

```bash
./deploy-remote.sh

# Menu options:
# 1) Full Deploy - Sync files and deploy
# 2) Sync files only
# 3) Deploy only (using existing files)
# 4) Setup Caddy (reverse proxy with auto-HTTPS)
# 5) View deployment status
# 6) View logs
# 7) Open SSH session
# 8) Check prerequisites
```

### On VPS (after SSH)

```bash
# View status
pm2 status

# View logs
pm2 logs
pm2 logs kholod-strapi
pm2 logs kholod-frontend

# Restart services
pm2 restart kholod-strapi
pm2 restart kholod-frontend
pm2 restart all

# Stop services
pm2 stop all

# Update app
cd /var/www/kholod-site
git pull
./deploy.sh
```

## Database Setup (PostgreSQL)

For production, switch from SQLite to PostgreSQL:

### Install PostgreSQL

#### Debian/Ubuntu
```bash
sudo apt install postgresql postgresql-contrib
```

#### AlmaLinux/RHEL/CentOS
```bash
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Create Database (All Systems)

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE kholod;
CREATE USER kholod WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE kholod TO kholod;
\q

# Update kholod-strapi/.env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=kholod
DATABASE_USERNAME=kholod
DATABASE_PASSWORD=your-secure-password

# Rebuild and restart
cd /var/www/kholod-site/kholod-strapi
bun run build
pm2 restart kholod-strapi
```

## Troubleshooting

### "bun: command not found" error

Bun installs to `~/.bun/bin` and adds itself to `~/.bashrc`. The scripts now automatically source your shell profile, but if you still see this error:

```bash
# SSH to VPS
ssh user@your-vps

# Check if bun is installed
ls ~/.bun/bin/bun

# If it exists, add to PATH manually
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
bun --version
```

### Services not starting

```bash
pm2 logs  # View error messages
pm2 restart all
```

### Port already in use

```bash
sudo netstat -tlnp | grep -E ':(1337|3006)'
sudo kill <PID>
pm2 restart all
```

### Update deployment

```bash
# From your PC
./deploy-remote.sh
# Choose option 1

# Or on VPS
cd /var/www/kholod-site
git pull
./deploy.sh
```

## Backup

```bash
# Database (SQLite)
cp /var/www/kholod-site/kholod-strapi/.tmp/data.db ~/backup.db

# Database (PostgreSQL)
pg_dump -U kholod kholod > ~/backup.sql

# Uploads
tar -czf ~/uploads-backup.tar.gz /var/www/kholod-site/kholod-strapi/public/uploads
```

## Ports

**Application Ports (direct access):**
- Frontend: 3006
- Strapi Backend/Admin: 1337

**Caddy Ports:**
- HTTP: 80
- HTTPS: 443 (automatic with domain)

**Access URLs:**

Before Caddy setup:
- Frontend: http://your-server-ip:3006
- Strapi Admin: http://your-server-ip:1337/admin
- Strapi API: http://your-server-ip:1337/api

After Caddy setup (automatic HTTPS):
- Frontend: https://yourdomain.com
- Strapi Admin: https://yourdomain.com/admin
- Strapi API: https://yourdomain.com/api

IP-only access (HTTP):
- Frontend: http://your-server-ip
- Strapi Admin: http://your-server-ip/admin
- Strapi API: http://your-server-ip/api
