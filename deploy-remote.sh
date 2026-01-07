#!/bin/bash

# Remote VPS Deployment Script (Native/PM2)
# Run this on your LOCAL machine to deploy to VPS via SSH
# Usage: ./deploy-remote.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONFIG_FILE=".deploy-config"

# Default values (will be overridden by config file)
VPS_HOST=""
VPS_USER=""
VPS_PORT="22"
VPS_DEPLOY_PATH="/var/www/kholod-site"
SSH_KEY=""

# Print colored messages
print_msg() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Load configuration
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        print_msg "Loading configuration from $CONFIG_FILE..."
        source "$CONFIG_FILE"
    else
        print_warning "No configuration file found. Creating $CONFIG_FILE..."
        cat > "$CONFIG_FILE" << 'EOF'
# VPS Deployment Configuration
# Edit these values for your VPS

# SSH Connection Details
VPS_HOST="your-vps-ip-or-domain"        # e.g., 123.45.67.89 or vps.example.com
VPS_USER="your-username"                # e.g., root or ubuntu
VPS_PORT="22"                           # SSH port (default: 22)
VPS_DEPLOY_PATH="/var/www/kholod-site" # Path on VPS where app will be deployed

# SSH Key (optional, leave empty to use default ~/.ssh/id_rsa)
SSH_KEY=""                              # e.g., ~/.ssh/my-vps-key

# Git repository (optional, for remote build)
GIT_REPO=""                             # e.g., https://github.com/username/kholod-site.git
GIT_BRANCH="master"                     # Branch to deploy
EOF
        print_error "Please edit $CONFIG_FILE with your VPS details, then run this script again."
        exit 1
    fi

    # Validate required fields
    if [ -z "$VPS_HOST" ] || [ "$VPS_HOST" = "your-vps-ip-or-domain" ]; then
        print_error "VPS_HOST not configured in $CONFIG_FILE"
        exit 1
    fi

    if [ -z "$VPS_USER" ] || [ "$VPS_USER" = "your-username" ]; then
        print_error "VPS_USER not configured in $CONFIG_FILE"
        exit 1
    fi
}

# Build SSH command with key if specified
build_ssh_cmd() {
    local ssh_cmd="ssh -p $VPS_PORT"
    if [ -n "$SSH_KEY" ]; then
        ssh_cmd="$ssh_cmd -i $SSH_KEY"
    fi
    echo "$ssh_cmd $VPS_USER@$VPS_HOST"
}

# Build rsync command
build_rsync_cmd() {
    local rsync_cmd="rsync -avz --progress -e \"ssh -p $VPS_PORT"
    if [ -n "$SSH_KEY" ]; then
        rsync_cmd="$rsync_cmd -i $SSH_KEY"
    fi
    rsync_cmd="$rsync_cmd\""
    echo "$rsync_cmd"
}

# Test SSH connection
test_connection() {
    print_msg "Testing SSH connection to VPS..."

    local ssh_cmd=$(build_ssh_cmd)

    if $ssh_cmd "echo 'Connection successful'" > /dev/null 2>&1; then
        print_msg "SSH connection successful!"
        return 0
    else
        print_error "Cannot connect to VPS. Please check:"
        print_error "  - VPS_HOST: $VPS_HOST"
        print_error "  - VPS_USER: $VPS_USER"
        print_error "  - VPS_PORT: $VPS_PORT"
        if [ -n "$SSH_KEY" ]; then
            print_error "  - SSH_KEY: $SSH_KEY"
        fi
        print_error ""
        print_error "Try manually: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST"
        exit 1
    fi
}

# Detect OS and set package manager commands
detect_os() {
    local ssh_cmd=$(build_ssh_cmd)

    # Detect OS type
    if $ssh_cmd "command -v dnf" > /dev/null 2>&1; then
        PKG_MANAGER="dnf"
        PKG_UPDATE="sudo dnf check-update || true"
        PKG_INSTALL="sudo dnf install -y"
        OS_TYPE="rhel"
        print_info "Detected RHEL-based system (AlmaLinux/Rocky/CentOS/Fedora)"
    elif $ssh_cmd "command -v yum" > /dev/null 2>&1; then
        PKG_MANAGER="yum"
        PKG_UPDATE="sudo yum check-update || true"
        PKG_INSTALL="sudo yum install -y"
        OS_TYPE="rhel"
        print_info "Detected RHEL-based system (CentOS/RHEL)"
    elif $ssh_cmd "command -v apt-get" > /dev/null 2>&1; then
        PKG_MANAGER="apt"
        PKG_UPDATE="sudo apt-get update"
        PKG_INSTALL="sudo apt-get install -y"
        OS_TYPE="debian"
        print_info "Detected Debian-based system (Ubuntu/Debian)"
    else
        print_error "Could not detect package manager (apt/dnf/yum)"
        exit 1
    fi
}

# Check VPS prerequisites
check_vps_prerequisites() {
    print_msg "Checking VPS prerequisites..."

    local ssh_cmd=$(build_ssh_cmd)

    # Detect OS and set package manager
    detect_os

    # Check for rsync first (needed for file syncing)
    print_info "Checking for rsync..."
    if ! $ssh_cmd "command -v rsync" > /dev/null 2>&1; then
        print_warning "rsync not found on VPS. Installing..."
        $ssh_cmd "$PKG_UPDATE && $PKG_INSTALL rsync" || {
            print_error "Failed to install rsync. Please install it manually:"
            print_error "  ssh $VPS_USER@$VPS_HOST"
            print_error "  $PKG_UPDATE && $PKG_INSTALL rsync"
            exit 1
        }
        print_msg "rsync installed!"
    else
        print_msg "rsync is already installed"
    fi

    print_info "Checking for Node.js..."
    if ! $ssh_cmd "command -v node" > /dev/null 2>&1; then
        print_warning "Node.js not found. Installing Node.js 20..."
        if [ "$OS_TYPE" = "debian" ]; then
            $ssh_cmd "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs"
        else
            # For RHEL-based systems (AlmaLinux, Rocky, CentOS, Fedora)
            $ssh_cmd "curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - && $PKG_INSTALL nodejs"
        fi
    fi

    print_info "Checking for Bun..."
    # Check if bun exists at its default install location
    if ! $ssh_cmd "[ -f ~/.bun/bin/bun ]" > /dev/null 2>&1; then
        print_warning "Bun not found at ~/.bun/bin/bun. Installing..."
        $ssh_cmd "curl -fsSL https://bun.sh/install | bash"
        print_msg "Bun installed to ~/.bun/bin/bun"
    else
        print_msg "Bun is already installed at ~/.bun/bin/bun"
    fi

    print_info "Checking for PM2..."
    if ! $ssh_cmd "command -v pm2" > /dev/null 2>&1; then
        print_warning "PM2 not found. Installing..."
        $ssh_cmd "sudo npm install -g pm2"
    fi
}

# Create directory on VPS
setup_vps_directory() {
    print_msg "Setting up deployment directory on VPS..."

    local ssh_cmd=$(build_ssh_cmd)

    # Create directory if it doesn't exist
    $ssh_cmd "sudo mkdir -p $VPS_DEPLOY_PATH && sudo chown -R $VPS_USER:$VPS_USER $VPS_DEPLOY_PATH" || {
        print_error "Failed to create directory on VPS"
        exit 1
    }
}

# Sync files to VPS
sync_files() {
    print_msg "Syncing files to VPS..."

    # Create .rsyncignore if it doesn't exist
    if [ ! -f ".rsyncignore" ]; then
        print_info "Creating .rsyncignore file..."
        cat > .rsyncignore << 'EOF'
# Node modules and dependencies
node_modules/
**/node_modules/
.pnp
.pnp.js

# Build outputs
kholod-rr/build/
kholod-strapi/.tmp/
kholod-strapi/build/
dist/
.cache/

# Environment files (will be configured on VPS)
.env
.env.local
.env.production
**/.env
**/.env.local
**/.env.production

# Database files
*.db
*.db-shm
*.db-wal
database/

# Logs
logs/
*.log
npm-debug.log*

# IDEs
.idea/
.vscode/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Uploads (if you want to preserve them on VPS)
kholod-strapi/public/uploads/

# Lock files - KEEP THESE for Docker builds!
# package-lock.json and bun.lockb are needed for npm ci / bun install
# Only exclude yarn.lock since we don't use it
yarn.lock

# Temporary files
tmp/
temp/
*.tmp
EOF
    fi

    print_info "Transferring files (this may take a few minutes)..."

    # Use rsync to efficiently transfer files
    rsync -avz --progress \
        --exclude-from='.rsyncignore' \
        -e "ssh -p $VPS_PORT$([ -n "$SSH_KEY" ] && echo " -i $SSH_KEY")" \
        ./ "$VPS_USER@$VPS_HOST:$VPS_DEPLOY_PATH/" || {
        print_error "Failed to sync files to VPS"
        exit 1
    }

    print_msg "Files synced successfully!"
}

# Setup environment files on VPS
setup_env_files() {
    print_msg "Setting up environment files on VPS..."

    local ssh_cmd=$(build_ssh_cmd)

    # Check if .env files exist locally
    local has_local_env=false
    if [ -f ".env" ] && [ -f "kholod-strapi/.env" ] && [ -f "kholod-rr/.env" ]; then
        has_local_env=true
    fi

    if [ "$has_local_env" = true ]; then
        print_info "Uploading local .env files..."

        # Upload .env files
        scp -P $VPS_PORT $([ -n "$SSH_KEY" ] && echo "-i $SSH_KEY") \
            .env "$VPS_USER@$VPS_HOST:$VPS_DEPLOY_PATH/.env" 2>/dev/null || true
        scp -P $VPS_PORT $([ -n "$SSH_KEY" ] && echo "-i $SSH_KEY") \
            kholod-strapi/.env "$VPS_USER@$VPS_HOST:$VPS_DEPLOY_PATH/kholod-strapi/.env"
        scp -P $VPS_PORT $([ -n "$SSH_KEY" ] && echo "-i $SSH_KEY") \
            kholod-rr/.env "$VPS_USER@$VPS_HOST:$VPS_DEPLOY_PATH/kholod-rr/.env"

        print_msg "Environment files uploaded!"
    else
        print_warning "No local .env files found. They will be created from .env.example on VPS."
        print_warning "You may need to edit them manually on the VPS."
    fi
}

# Run deployment on VPS
run_deployment() {
    print_msg "Running deployment script on VPS..."

    local ssh_cmd=$(build_ssh_cmd)

    # Make deploy script executable
    $ssh_cmd "cd $VPS_DEPLOY_PATH && chmod +x deploy.sh"

    # Run deployment
    print_info "Executing: ./deploy.sh"
    $ssh_cmd "cd $VPS_DEPLOY_PATH && ./deploy.sh" || {
        print_error "Deployment failed on VPS"
        exit 1
    }

    print_msg "Deployment completed successfully!"
}

# Show deployment status
show_status() {
    print_msg "Checking deployment status..."

    local ssh_cmd=$(build_ssh_cmd)

    print_info "PM2 processes:"
    $ssh_cmd "pm2 status" || true
}

# Open SSH session to VPS
open_ssh_session() {
    print_msg "Opening SSH session to VPS..."
    local ssh_cmd=$(build_ssh_cmd)
    $ssh_cmd "cd $VPS_DEPLOY_PATH && bash"
}

# View logs on VPS
view_logs() {
    print_msg "Viewing application logs..."

    local ssh_cmd=$(build_ssh_cmd)

    print_info "PM2 logs (Ctrl+C to exit):"
    $ssh_cmd "pm2 logs"
}

# Setup Nginx on VPS
setup_nginx() {
    print_msg "Setting up Nginx on VPS..."

    local ssh_cmd=$(build_ssh_cmd)

    # Detect OS if not already detected
    if [ -z "$OS_TYPE" ]; then
        detect_os
    fi

    # Install Nginx if not present
    if ! $ssh_cmd "command -v nginx" > /dev/null 2>&1; then
        print_info "Installing Nginx..."
        $ssh_cmd "$PKG_UPDATE && $PKG_INSTALL nginx"

        # Start and enable nginx
        $ssh_cmd "sudo systemctl enable nginx && sudo systemctl start nginx"
    fi

    # Copy nginx config based on OS type
    print_info "Uploading Nginx configuration..."

    if [ "$OS_TYPE" = "debian" ]; then
        # Debian/Ubuntu uses sites-available/sites-enabled
        $ssh_cmd "sudo cp $VPS_DEPLOY_PATH/nginx.conf /etc/nginx/sites-available/kholod-site"

        print_msg "Next steps:"
        print_warning "1. Edit nginx config with your domain/IP:"
        print_warning "   sudo nano /etc/nginx/sites-available/kholod-site"
        print_warning "   (Replace 'yourdomain.com' with your domain or server IP)"
        print_warning ""
        print_warning "2. Enable the site:"
        print_warning "   sudo ln -s /etc/nginx/sites-available/kholod-site /etc/nginx/sites-enabled/"
        print_warning "   sudo rm /etc/nginx/sites-enabled/default"
        print_warning "   sudo nginx -t"
        print_warning "   sudo systemctl restart nginx"
        print_warning ""
        print_warning "3. (Optional) Add SSL with Let's Encrypt:"
        print_warning "   $PKG_INSTALL certbot python3-certbot-nginx"
        print_warning "   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
    else
        # RHEL/AlmaLinux uses conf.d
        $ssh_cmd "sudo cp $VPS_DEPLOY_PATH/nginx.conf /etc/nginx/conf.d/kholod-site.conf"

        print_msg "Next steps:"
        print_warning "1. Edit nginx config with your domain/IP:"
        print_warning "   sudo nano /etc/nginx/conf.d/kholod-site.conf"
        print_warning "   (Replace 'yourdomain.com' with your domain or server IP)"
        print_warning ""
        print_warning "2. Configure SELinux and restart nginx:"
        print_warning "   sudo setsebool -P httpd_can_network_connect 1"
        print_warning "   sudo nginx -t"
        print_warning "   sudo systemctl restart nginx"
        print_warning ""
        print_warning "3. (Optional) Add SSL with Let's Encrypt:"
        print_warning "   $PKG_INSTALL certbot python3-certbot-nginx"
        print_warning "   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   Kholod Site Remote Deployment       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "1) Full Deploy (sync files + deploy)"
    echo "2) Sync files only"
    echo "3) Run deployment only (use existing files)"
    echo "4) Setup Nginx"
    echo "5) View deployment status"
    echo "6) View logs"
    echo "7) Open SSH session"
    echo "8) Check VPS prerequisites"
    echo "9) Exit"
    echo ""
    read -p "Choose an option [1-9]: " choice

    case $choice in
        1) full_deploy ;;
        2) sync_files ;;
        3) run_deployment && show_status ;;
        4) setup_nginx ;;
        5) show_status ;;
        6) view_logs ;;
        7) open_ssh_session ;;
        8) check_vps_prerequisites ;;
        9) exit 0 ;;
        *) print_error "Invalid option"; show_menu ;;
    esac
}

# Full deployment workflow
full_deploy() {
    test_connection
    check_vps_prerequisites
    setup_vps_directory
    sync_files
    setup_env_files
    run_deployment
    show_status

    echo ""
    print_msg "═══════════════════════════════════════"
    print_msg "🎉 Deployment Complete!"
    print_msg "═══════════════════════════════════════"
    print_info "Direct access (no nginx):"
    print_info "  Frontend: http://$VPS_HOST:3006"
    print_info "  Strapi Backend: http://$VPS_HOST:1337"
    print_info "  Strapi Admin: http://$VPS_HOST:1337/admin"
    print_msg "═══════════════════════════════════════"
    echo ""
    print_warning "Next steps:"
    print_warning "1. Setup Nginx reverse proxy (option 4 in menu)"
    print_warning "2. Create Strapi admin user at /admin"
    print_warning "3. (Optional) Add SSL with certbot for HTTPS"
    echo ""
}

# Main execution
main() {
    print_msg "=== Kholod Site Remote Deployment (Native/PM2) ==="
    print_msg ""

    load_config

    # Show interactive menu
    show_menu
}

# Run main
main "$@"
