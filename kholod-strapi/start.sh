#!/bin/bash
# Strapi start script for PM2

# Load environment from .env file
set -a
[ -f .env ] && source .env
set +a

# Find bun executable
if [ -f "$HOME/.bun/bin/bun" ]; then
    BUN="$HOME/.bun/bin/bun"
elif command -v bun &> /dev/null; then
    BUN="bun"
else
    echo "Error: bun not found"
    exit 1
fi

# Start Strapi
exec "$BUN" run start
