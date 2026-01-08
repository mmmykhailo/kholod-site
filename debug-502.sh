#!/bin/bash

# Debug 502 Bad Gateway errors
# Run this on your VPS

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_msg() { echo -e "${GREEN}[DEBUG]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }

echo ""
print_msg "=== Debugging 502 Bad Gateway ==="
echo ""

# 1. Check PM2 status
print_info "1. Checking PM2 processes..."
pm2 status
echo ""

# 2. Check if ports are listening
print_info "2. Checking if ports are listening..."
echo -n "Port 1337 (Strapi): "
if sudo netstat -tlnp 2>/dev/null | grep -q ":1337 " || sudo ss -tlnp 2>/dev/null | grep -q ":1337 "; then
    echo -e "${GREEN}LISTENING${NC}"
    sudo netstat -tlnp 2>/dev/null | grep ":1337 " || sudo ss -tlnp | grep ":1337 "
else
    echo -e "${RED}NOT LISTENING${NC}"
fi

echo -n "Port 3006 (Frontend): "
if sudo netstat -tlnp 2>/dev/null | grep -q ":3006 " || sudo ss -tlnp 2>/dev/null | grep -q ":3006 "; then
    echo -e "${GREEN}LISTENING${NC}"
    sudo netstat -tlnp 2>/dev/null | grep ":3006 " || sudo ss -tlnp | grep ":3006 "
else
    echo -e "${RED}NOT LISTENING${NC}"
fi
echo ""

# 3. Test localhost connections
print_info "3. Testing localhost connections..."

echo -n "Strapi API (localhost:1337/api): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/api 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}$HTTP_CODE${NC}"
else
    echo -e "${RED}FAILED ($HTTP_CODE)${NC}"
fi

echo -n "Strapi Admin (localhost:1337/admin): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/admin 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}$HTTP_CODE${NC}"
else
    echo -e "${RED}FAILED ($HTTP_CODE)${NC}"
fi

echo -n "Frontend (localhost:3006): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3006 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}$HTTP_CODE${NC}"
else
    echo -e "${RED}FAILED ($HTTP_CODE)${NC}"
fi
echo ""

# 4. Test 127.0.0.1 connections
print_info "4. Testing 127.0.0.1 connections..."

echo -n "Strapi (127.0.0.1:1337/api): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:1337/api 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}$HTTP_CODE${NC}"
else
    echo -e "${RED}FAILED ($HTTP_CODE)${NC}"
fi

echo -n "Frontend (127.0.0.1:3006): "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3006 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}$HTTP_CODE${NC}"
else
    echo -e "${RED}FAILED ($HTTP_CODE)${NC}"
fi
echo ""

# 5. Check Strapi logs
print_info "5. Recent Strapi logs (last 20 lines)..."
pm2 logs kholod-strapi --lines 20 --nostream
echo ""

# 6. Check Frontend logs
print_info "6. Recent Frontend logs (last 20 lines)..."
pm2 logs kholod-frontend --lines 20 --nostream
echo ""

# 7. Check Caddy status
print_info "7. Checking Caddy status..."
if sudo systemctl is-active --quiet caddy; then
    echo -e "${GREEN}Caddy is running${NC}"
else
    echo -e "${RED}Caddy is not running${NC}"
fi
echo ""

# 8. Check Caddy configuration
print_info "8. Validating Caddyfile..."
if sudo caddy validate --config /etc/caddy/Caddyfile 2>&1; then
    echo -e "${GREEN}Caddyfile is valid${NC}"
else
    echo -e "${RED}Caddyfile has errors${NC}"
fi
echo ""

# 9. Recent Caddy logs
print_info "9. Recent Caddy logs (last 20 lines)..."
sudo journalctl -u caddy -n 20 --no-pager
echo ""

# 10. Summary and recommendations
echo ""
print_msg "=== Summary ==="
echo ""

# Determine the issue
STRAPI_OK=false
FRONTEND_OK=false

if curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/api 2>/dev/null | grep -q "200\|404\|302"; then
    STRAPI_OK=true
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3006 2>/dev/null | grep -q "200\|404\|302"; then
    FRONTEND_OK=true
fi

if [ "$STRAPI_OK" = false ]; then
    print_error "Strapi is NOT responding on localhost:1337"
    print_warning "Fix: Restart Strapi"
    print_warning "  pm2 restart kholod-strapi"
    print_warning "  pm2 logs kholod-strapi"
fi

if [ "$FRONTEND_OK" = false ]; then
    print_error "Frontend is NOT responding on localhost:3006"
    print_warning "Fix: Restart Frontend"
    print_warning "  pm2 restart kholod-frontend"
    print_warning "  pm2 logs kholod-frontend"
fi

if [ "$STRAPI_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
    print_msg "Both services are responding correctly!"
    print_warning "If you still get 502, check Caddy configuration:"
    print_warning "  sudo journalctl -u caddy -f"
    print_warning "Then try accessing your site again"
fi
