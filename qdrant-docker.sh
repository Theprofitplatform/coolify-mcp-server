#!/bin/bash
#
# Qdrant Docker Network Executor
# Runs Qdrant commands through Docker network to access Qdrant container
#

set -e

# Qdrant network (from container inspection)
QDRANT_NETWORK="j4kss8084c008sskcko8oks0"

# Build image if needed (only once)
if ! docker images | grep -q "coolify-qdrant-cli"; then
  echo "🔨 Building Docker image..."
  cat > /tmp/Dockerfile.qdrant << 'DOCKERFILE'
FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
COPY coolify-qdrant.ts ./
RUN npm install -D typescript tsx
RUN npm run build || npm install -g tsx

CMD ["tsx", "coolify-qdrant.ts"]
DOCKERFILE

  docker build -f /tmp/Dockerfile.qdrant -t coolify-qdrant-cli . || {
    echo "❌ Failed to build Docker image"
    exit 1
  }
  rm /tmp/Dockerfile.qdrant
  echo "✅ Docker image built"
fi

# Run command in Docker network
echo "🚀 Executing: npm run qdrant $@"
echo ""

docker run --rm \
  --network "$QDRANT_NETWORK" \
  -e QDRANT_HOST=qdrant-j4kss8084c008sskcko8oks0 \
  -e QDRANT_PORT=6333 \
  -e QDRANT_API_KEY="${QDRANT_API_KEY:-***REMOVED***}" \
  -e COOLIFY_BASE_URL="${COOLIFY_BASE_URL:-https://coolify.theprofitplatform.com.au}" \
  -e COOLIFY_TOKEN="$COOLIFY_TOKEN" \
  coolify-qdrant-cli \
  tsx coolify-qdrant.ts "$@"
