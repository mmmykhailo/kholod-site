# Stage 1: Bun base for fast dependency installation
FROM oven/bun:1.3-alpine AS bun-base
WORKDIR /app

# Stage 2: Install all dependencies with Bun (fast)
FROM bun-base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 3: Build with Bun
FROM bun-base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Stage 4: Install production dependencies with Bun
FROM bun-base AS prod-deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Stage 5: Production runtime with Node.js (for React 19 SSR compatibility)
FROM node:20-alpine AS runner

# Set production environment
ENV NODE_ENV=production

WORKDIR /app

# Copy production dependencies from Bun stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy build artifacts
COPY --from=build /app/build ./build

# Copy package.json for start script
COPY package.json ./

# Expose application port
EXPOSE 3006

# Start application with Node.js
CMD ["node", "./node_modules/.bin/react-router-serve", "./build/server/index.js"]
