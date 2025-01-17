FROM node:18-alpine AS base

# The web Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update this Dockerfile, the Dockerfile in the web workspace, and copy it over to Dockerfile in the docs.

FROM base AS builder
# Install required dependencies
RUN apk update && apk add --no-cache \
  openssl \
  libressl \
  libc6-compat

# Set environment variable
ENV NODE_ENV=production

# Set working directory and install turbo
WORKDIR /app
RUN npm i -g turbo

# Copy only necessary files for pruning
COPY package.json package-lock.json ./
RUN turbo prune api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Copy pruned dependencies and install
COPY --from=builder /app/out/json/ .
RUN npm ci --production

# Copy full application source and generate Prisma client
COPY --from=builder /app/out/full/ .
RUN npx prisma generate

# Build the application
RUN npm run build

FROM base AS runner
WORKDIR /app

# Create and use a non-root user
RUN addgroup --system --gid 1001 nestjs \
    && adduser --system --uid 1001 nestjs
USER nestjs

# Copy built application
COPY --from=installer /app .

# Expose application port and start
EXPOSE 8080
CMD ["npm", "run", "start:prod"]
