# Stage 1: Base image with build tools
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies for better-sqlite3 native module compilation
RUN apk add --no-cache python3 make g++

# Stage 2: Install all dependencies (dev + prod)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 3: Build Strapi admin panel
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 4: Install production dependencies only
FROM base AS prod-deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Stage 5: Production runtime
FROM base AS runner

# Set production environment
ENV NODE_ENV=production

# Keep build tools for potential runtime native module needs
RUN apk add --no-cache python3 make g++

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built admin panel
COPY --from=build /app/dist ./dist

# Copy source files (required by Strapi at runtime)
COPY . .

# Clean up cache
RUN rm -rf node_modules/.cache

# Expose Strapi port
EXPOSE 1337

# Declare volumes for persistent data
VOLUME ["/app/.tmp", "/app/public/uploads"]

# Start Strapi
CMD ["npm", "run", "start"]
