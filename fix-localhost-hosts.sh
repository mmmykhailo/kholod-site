#!/bin/bash

# Fix localhost not resolving to 127.0.0.1
# Run this on your VPS with sudo

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_msg() { echo -e "${GREEN}[FIX]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_info() { echo -e "${YELLOW}[INFO]${NC} $1"; }

print_msg "=== Fixing localhost Resolution ==="
echo ""

# Check current /etc/hosts
print_info "Current /etc/hosts content:"
cat /etc/hosts
echo ""

# Test localhost resolution before fix
print_info "Testing localhost resolution before fix:"
ping -c 1 localhost 2>&1 | head -1 || true
echo ""

# Backup /etc/hosts
print_msg "Creating backup of /etc/hosts..."
sudo cp /etc/hosts /etc/hosts.backup.$(date +%s)

# Check if localhost entry exists
if grep -q "^127.0.0.1.*localhost" /etc/hosts; then
    print_msg "localhost entry already exists in /etc/hosts"
else
    print_msg "Adding localhost entry to /etc/hosts..."
    echo "127.0.0.1 localhost" | sudo tee -a /etc/hosts > /dev/null
fi

# Ensure IPv6 localhost is also set
if grep -q "^::1.*localhost" /etc/hosts; then
    print_msg "IPv6 localhost entry already exists"
else
    print_msg "Adding IPv6 localhost entry..."
    echo "::1 localhost" | sudo tee -a /etc/hosts > /dev/null
fi

# Show updated /etc/hosts
echo ""
print_msg "Updated /etc/hosts:"
cat /etc/hosts
echo ""

# Test resolution after fix
print_info "Testing localhost resolution after fix:"
ping -c 1 localhost 2>&1 | head -1

# Test with curl
echo ""
print_info "Testing localhost with curl:"
echo -n "localhost resolves to: "
ping -c 1 localhost 2>&1 | grep "PING" | awk '{print $3}' | tr -d '()'

echo ""
print_msg "=== Fix Complete ==="
echo ""
print_info "Now restart your services:"
print_info "  pm2 restart all"
print_info "  sudo systemctl restart caddy"
