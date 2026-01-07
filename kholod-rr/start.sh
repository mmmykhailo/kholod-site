#!/bin/bash
# Frontend start script for PM2

# Load environment from .env file
set -a
[ -f .env ] && source .env
set +a

# Set port if not already set
export PORT=${PORT:-3006}

# Start React Router server
exec node ./node_modules/.bin/react-router-serve ./build/server/index.js
