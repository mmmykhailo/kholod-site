# Domain Setup Guide

## Automatic Domain Configuration

The deployment script can automatically configure your domain in Caddyfile!

### Step 1: Configure Domain in .deploy-config

```bash
# Edit your deployment config
nano .deploy-config
```

Add your domain:
```bash
DOMAIN="example.com"                    # Single domain

# Or multiple domains:
DOMAIN="example.com www.example.com"    # Main + www subdomain
```

### Step 2: Deploy

```bash
./deploy-remote.sh
# Choose option 1 (Full Deploy)
```

The script will automatically:
- ✅ Replace placeholder in Caddyfile with your domain
- ✅ Sync configured Caddyfile to VPS
- ✅ Deploy your application

### Step 3: Setup Caddy

```bash
./deploy-remote.sh
# Choose option 4 (Setup Caddy)
```

This will:
- ✅ Install Caddy on VPS
- ✅ Copy Caddyfile to /etc/caddy/Caddyfile
- ✅ Show you the final setup commands

Then just run on VPS:
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

Caddy will automatically get SSL certificates from Let's Encrypt!

## DNS Setup Required

**Before deploying with a domain, configure DNS:**

### A Record (Required)
Point your domain to your VPS IP:

```
Type: A
Name: @
Value: your.vps.ip.address
TTL: 3600
```

### WWW Subdomain (Recommended)
```
Type: A
Name: www
Value: your.vps.ip.address
TTL: 3600
```

**Wait 5-60 minutes** for DNS to propagate before deploying.

### Verify DNS

```bash
# Check if DNS is ready
dig example.com +short
# Should return your VPS IP

dig www.example.com +short
# Should return your VPS IP
```

## No Domain? Use IP Only

If you don't have a domain or want to test first:

**Option 1: Leave DOMAIN empty in .deploy-config**
```bash
DOMAIN=""  # Empty = no auto-configuration
```

Then manually edit Caddyfile on VPS to use HTTP-only mode:
```bash
ssh user@your-vps
sudo nano /etc/caddy/Caddyfile
# Uncomment the HTTP-only section at the bottom
```

**Option 2: Use VPS IP directly**
```bash
DOMAIN="http://123.45.67.89"  # Use IP with http://
```

This will configure Caddy for HTTP-only (no HTTPS).

## Troubleshooting

### SSL Certificate Fails

**Error:** `certificate request failed`

**Cause:** DNS not pointing to VPS or port 80/443 blocked

**Fix:**
```bash
# 1. Verify DNS
dig yourdomain.com +short
# Should show your VPS IP

# 2. Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 3. Check Caddy logs
sudo journalctl -u caddy -f
```

### Domain Not Resolving

**Error:** `connection refused` when accessing domain

**Fix:**
```bash
# Check if Caddy is running
sudo systemctl status caddy

# Restart Caddy
sudo systemctl restart caddy

# View logs
sudo journalctl -u caddy -n 50
```

### Wrong Domain in Caddyfile

If you need to change the domain:

```bash
# 1. Update .deploy-config on your PC
nano .deploy-config
# Change DOMAIN="newdomain.com"

# 2. Sync files again
./deploy-remote.sh
# Choose option 2 (Sync files only)

# 3. Update Caddy
./deploy-remote.sh
# Choose option 4 (Setup Caddy)
```

## Example: Complete Setup

```bash
# On your PC
cp .deploy-config.example .deploy-config
nano .deploy-config
```

Set these values:
```bash
VPS_HOST="123.45.67.89"
VPS_USER="root"
VPS_PORT="22"
DOMAIN="mysite.com www.mysite.com"  # Your actual domain
```

```bash
# Deploy
./deploy-remote.sh
# Choose 1 (Full Deploy)
# Then choose 4 (Setup Caddy)
```

```bash
# On VPS (final steps)
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy

# Check status
sudo systemctl status caddy
curl -I https://mysite.com  # Should return 200 OK
```

Done! Your site is now live at https://mysite.com with automatic HTTPS! 🎉
