# Use a lightweight Node.js base image (LTS, matches the sibling app/'s container base line)
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base

WORKDIR /app

# Pin the exact package manager declared in package.json ("packageManager": "pnpm@10.33.0")
# via Corepack, so the image always builds with the same pnpm the team develops with.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Copy package files first (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all dependencies (frozen lockfile keeps the image reproducible)
RUN pnpm install --frozen-lockfile

# Copy project files
COPY . .

# NEXT_PUBLIC_* variables are inlined into the client bundle at build time, so they
# must be supplied as build args (via docker-compose `build.args`), not just runtime
# env. Defaults match a self-hosted, always-on deployment (no NEXT_PUBLIC_API_URL
# needed; the browser calls same-origin through the Next.js proxy in next.config.ts).
ARG NEXT_PUBLIC_API_BASE_PATH=/api/v1
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_BASE_PATH=${NEXT_PUBLIC_API_BASE_PATH}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the Next.js app for production
RUN pnpm build

# Create cache directory with proper permissions
RUN mkdir -p .next/cache/images && \
    chown -R node:node .next

# Use non-root user for security
USER node

# Expose Next.js default port
EXPOSE 3000

# Start Next.js in production (BACKEND_ORIGIN is read at runtime by proxy.ts's
# middleware on every request, so it stays a normal environment variable, not a
# build arg)
CMD ["pnpm", "start"]
