#!/bin/bash
# Troubleshooting script for deployment issues

echo "=== Kholod Site Troubleshooting ==="
echo ""

# Check if PM2 processes are running
echo "1. Checking PM2 processes..."
pm2 status
echo ""

# Check if apps are listening on their ports
echo "2. Checking if applications are listening on ports..."
echo "  Strapi (port 1337):"
netstat -tlnp 2>/dev/null | grep :1337 || ss -tlnp 2>/dev/null | grep :1337 || echo "  Not listening"
echo "  Frontend (port 3006):"
netstat -tlnp 2>/dev/null | grep :3006 || ss -tlnp 2>/dev/null | grep :3006 || echo "  Not listening"
echo ""

# Check Nginx status
echo "3. Checking Nginx status..."
if command -v nginx &> /dev/null; then
    systemctl status nginx --no-pager -l || service nginx status
else
    echo "  Nginx not installed"
fi
echo ""

# Check if Nginx is listening on port 80
echo "4. Checking if Nginx is listening on port 80..."
netstat -tlnp 2>/dev/null | grep :80 || ss -tlnp 2>/dev/null | grep :80 || echo "  Not listening"
echo ""

# Test local connections
echo "5. Testing local connections..."
echo "  Testing Strapi (http://localhost:1337):"
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" http://localhost:1337 || echo "  Failed to connect"
echo "  Testing Frontend (http://localhost:3006):"
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" http://localhost:3006 || echo "  Failed to connect"
echo ""

# Check firewall status
echo "6. Checking firewall..."
if command -v ufw &> /dev/null; then
    echo "  UFW status:"
    sudo ufw status
elif command -v firewall-cmd &> /dev/null; then
    echo "  Firewalld status:"
    sudo firewall-cmd --list-all
else
    echo "  No firewall detected (ufw/firewalld)"
fi
echo ""

# Check SELinux (for RHEL-based systems)
echo "7. Checking SELinux..."
if command -v getenforce &> /dev/null; then
    echo "  SELinux status: $(getenforce)"
    if [ "$(getenforce)" = "Enforcing" ]; then
        echo "  Checking httpd_can_network_connect:"
        getsebool httpd_can_network_connect
    fi
else
    echo "  SELinux not present (Debian/Ubuntu)"
fi
echo ""

# Check Nginx configuration
echo "8. Checking Nginx configuration..."
if command -v nginx &> /dev/null; then
    echo "  Testing nginx config:"
    sudo nginx -t
    echo ""
    echo "  Checking if kholod-site config is enabled:"
    if [ -f /etc/nginx/sites-enabled/kholod-site ]; then
        echo "  ✓ Found at /etc/nginx/sites-enabled/kholod-site"
    elif [ -f /etc/nginx/conf.d/kholod-site.conf ]; then
        echo "  ✓ Found at /etc/nginx/conf.d/kholod-site.conf"
    else
        echo "  ✗ Not found - Nginx not configured!"
    fi
fi
echo ""

# Check PM2 logs for errors
echo "9. Recent PM2 logs (last 20 lines)..."
pm2 logs --lines 20 --nostream
echo ""

echo "=== Troubleshooting Complete ==="
echo ""
echo "Common fixes:"
echo "  - If apps not running: pm2 restart ecosystem.config.js"
echo "  - If Nginx not running: sudo systemctl start nginx"
echo "  - If Nginx not configured: Run ./deploy-remote.sh and choose option 4"
echo "  - If firewall blocking: sudo firewall-cmd --add-service=http --permanent && sudo firewall-cmd --reload"
echo "  - If SELinux blocking: sudo setsebool -P httpd_can_network_connect 1"
