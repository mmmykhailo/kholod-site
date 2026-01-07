#!/bin/bash

# Kholod Site Deployment Script (Native/PM2)
# Run this script on your VPS to deploy the application
# Usage: ./deploy.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="$(pwd)"
BACKEND_DIR="$APP_DIR/kholod-strapi"
FRONTEND_DIR="$APP_DIR/kholod-rr"

# Print colored message
print_msg() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_msg "Checking requirements..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js >= 18."
        exit 1
    fi
    # Check for bun (use full path since it's installed per-user)
    BUN_PATH="$HOME/.bun/bin/bun"
    if [ ! -f "$BUN_PATH" ]; then
        # Try command -v as fallback
        if command -v bun &> /dev/null; then
            BUN_PATH="bun"
        else
            print_error "Bun is not installed. Install it from https://bun.sh"
            print_error "Expected location: $HOME/.bun/bin/bun"
            exit 1
        fi
    fi
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 is not installed. Installing globally..."
        npm install -g pm2
    fi
}

# Setup environment files
setup_env_files() {
    print_msg "Setting up environment files..."

    # Root .env (for docker-compose)
    if [ ! -f "$APP_DIR/.env" ]; then
        if [ -f "$APP_DIR/.env.example" ]; then
            print_warning "No .env file found. Copying from .env.example..."
            cp "$APP_DIR/.env.example" "$APP_DIR/.env"
            print_warning "Please edit .env file with your production values!"
        else
            print_error "No .env.example file found!"
            exit 1
        fi
    fi

    # Backend .env
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        if [ -f "$BACKEND_DIR/.env.example" ]; then
            print_warning "No backend .env file found. Copying from .env.example..."
            cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"

            # Set production defaults
            if [ "$ENVIRONMENT" = "production" ]; then
                sed -i.bak 's/HOST=.*/HOST=0.0.0.0/' "$BACKEND_DIR/.env"
                sed -i.bak 's/PORT=.*/PORT=1337/' "$BACKEND_DIR/.env"
                rm -f "$BACKEND_DIR/.env.bak"
            fi
        fi
    fi

    # Frontend .env
    if [ ! -f "$FRONTEND_DIR/.env" ]; then
        if [ -f "$FRONTEND_DIR/.env.example" ]; then
            print_warning "No frontend .env file found. Copying from .env.example..."
            cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"

            # Set Strapi URL based on deployment mode
            if [ "$DEPLOY_MODE" = "docker" ]; then
                echo "VITE_STRAPI_URL=http://strapi:1337" >> "$FRONTEND_DIR/.env"
            else
                echo "VITE_STRAPI_URL=http://localhost:1337" >> "$FRONTEND_DIR/.env"
            fi
        fi
    fi
}

# Generate Strapi secrets
generate_strapi_secrets() {
    print_msg "Checking Strapi secrets..."

    ENV_FILE="$BACKEND_DIR/.env"

    # Function to generate a random 32-char base64 string
    generate_secret() {
        openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
    }

    # Check and generate APP_KEYS (4 keys)
    if ! grep -q "^APP_KEYS=" "$ENV_FILE" || [ -z "$(grep "^APP_KEYS=" "$ENV_FILE" | cut -d= -f2)" ]; then
        print_msg "Generating APP_KEYS..."
        KEY1=$(generate_secret)
        KEY2=$(generate_secret)
        KEY3=$(generate_secret)
        KEY4=$(generate_secret)
        echo "APP_KEYS=$KEY1,$KEY2,$KEY3,$KEY4" >> "$ENV_FILE"
    fi

    # Generate other secrets
    for SECRET in "API_TOKEN_SALT" "ADMIN_JWT_SECRET" "TRANSFER_TOKEN_SALT" "JWT_SECRET"; do
        if ! grep -q "^$SECRET=" "$ENV_FILE" || [ -z "$(grep "^$SECRET=" "$ENV_FILE" | cut -d= -f2)" ]; then
            print_msg "Generating $SECRET..."
            echo "$SECRET=$(generate_secret)" >> "$ENV_FILE"
        fi
    done
}

# Native deployment
deploy_native() {
    print_msg "Deploying natively with PM2..."

    # Pull latest changes (if git repo)
    if [ -d ".git" ]; then
        print_msg "Pulling latest changes..."
        git pull
    fi

    # Build backend
    print_msg "Building Strapi backend..."
    cd "$BACKEND_DIR"

    # Create required directories
    mkdir -p public/uploads
    mkdir -p .tmp

    npm install
    npm run build

    # Build frontend
    print_msg "Building React Router frontend..."
    cd "$FRONTEND_DIR"
    $BUN_PATH install
    $BUN_PATH run build

    # Make start scripts executable
    print_msg "Setting up start scripts..."
    chmod +x "$BACKEND_DIR/start.sh"
    chmod +x "$FRONTEND_DIR/start.sh"

    # Stop existing PM2 processes
    print_msg "Stopping existing PM2 processes..."
    cd "$APP_DIR"
    pm2 delete ecosystem.config.js 2>/dev/null || true
    pm2 delete kholod-strapi 2>/dev/null || true
    pm2 delete kholod-frontend 2>/dev/null || true

    # Start applications with PM2 using ecosystem file
    print_msg "Starting applications with PM2..."
    cd "$APP_DIR"
    pm2 start ecosystem.config.js

    # Save PM2 process list
    pm2 save

    # Setup PM2 startup script
    print_msg "Setting up PM2 startup..."
    pm2 startup

    print_msg "Native deployment completed!"
    print_msg "Frontend: http://localhost:3006"
    print_msg "Strapi Backend: http://localhost:1337"
    print_msg "Strapi Admin: http://localhost:1337/admin"

    cd "$APP_DIR"
}

# Main deployment flow
main() {
    print_msg "=== Kholod Site Deployment (Native/PM2) ==="
    print_msg ""

    check_requirements
    setup_env_files
    generate_strapi_secrets
    deploy_native

    print_msg ""
    print_msg "=== Deployment Complete! ==="
    print_warning "Don't forget to:"
    print_warning "1. Configure your reverse proxy (nginx) if needed"
    print_warning "2. Set up SSL certificates (Let's Encrypt)"
    print_warning "3. Configure your firewall"
    print_warning "4. Create your first Strapi admin user at /admin"
}

# Run main function
main
