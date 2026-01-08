#!/bin/bash

# Fix Caddy logging issues
# Run this on your VPS if you see "permission denied" log errors

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_msg() { echo -e "${GREEN}[FIX]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

print_msg "Fixing Caddy logging configuration..."
echo ""

# Option 1: Update Caddyfile to use systemd journal (recommended)
print_info "Updating Caddyfile to use systemd journal logging..."
sudo cp /var/www/kholod-site/Caddyfile /etc/caddy/Caddyfile

# Validate configuration
print_info "Validating Caddyfile..."
if sudo caddy validate --config /etc/caddy/Caddyfile; then
    print_msg "Caddyfile is valid!"
else
    print_error "Caddyfile validation failed!"
    exit 1
fi

# Restart Caddy
print_info "Restarting Caddy..."
sudo systemctl restart caddy

# Wait a moment
sleep 2

# Check status
print_info "Checking Caddy status..."
if sudo systemctl is-active --quiet caddy; then
    print_msg "Caddy is running!"
else
    print_error "Caddy failed to start. Checking logs..."
    sudo journalctl -u caddy -n 20 --no-pager
    exit 1
fi

echo ""
print_msg "=== Fix Applied Successfully! ==="
echo ""
print_info "Caddy is now using systemd journal for logging."
print_info "View logs with: sudo journalctl -u caddy -f"
echo ""
print_info "Access logs will show requests in real-time:"
print_info "  sudo journalctl -u caddy -f | grep 'handled request'"
echo ""
