#!/bin/bash

# Qdrant Docker Setup Script

# Configuration
QDRANT_PORT="${QDRANT_PORT:-6333}"
CONTAINER_NAME="${CONTAINER_NAME:-qdrant}"

# SECURITY: Require explicit API key (no default fallback)
if [ -z "$QDRANT_API_KEY" ]; then
  echo "❌ ERROR: QDRANT_API_KEY environment variable is required"
  echo ""
  echo "Usage:"
  echo "  QDRANT_API_KEY=your-key ./qdrant-docker.sh"
  echo ""
  echo "Never use production credentials in scripts!"
  exit 1
fi

# Run Qdrant container
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$QDRANT_PORT:6333" \
  -e QDRANT_API_KEY="$QDRANT_API_KEY" \
  qdrant/qdrant

echo "✅ Qdrant started on port $QDRANT_PORT"
