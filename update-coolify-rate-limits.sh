#!/bin/bash

# Script to update Coolify API rate limits
# This script safely updates the Coolify .env file with custom rate limits

set -e

echo "🔧 Coolify Rate Limit Configuration Script"
echo "=========================================="
echo ""

# Configuration
RATE_LIMIT=${1:-1000}
CONTAINER_NAME="coolify"

echo "📋 Configuration:"
echo "  Rate Limit: $RATE_LIMIT requests/minute"
echo "  Container: $CONTAINER_NAME"
echo ""

# Check if container exists
if ! sudo docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Error: $CONTAINER_NAME container not found or not running"
    exit 1
fi

echo "✅ Container found"
echo ""

# Backup current .env
echo "📦 Creating backup..."
sudo docker cp $CONTAINER_NAME:/var/www/html/.env /tmp/coolify.env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created in /tmp"
echo ""

# Copy .env file out
echo "📤 Extracting current .env..."
sudo docker cp $CONTAINER_NAME:/var/www/html/.env /tmp/coolify.env.temp
echo "✅ File extracted"
echo ""

# Check if already configured
if grep -q "API_RATE_LIMIT_PER_MINUTE" /tmp/coolify.env.temp; then
    echo "⚠️  Rate limit configuration already exists"
    echo "   Updating existing values..."
    sed -i "s/API_RATE_LIMIT_PER_MINUTE=.*/API_RATE_LIMIT_PER_MINUTE=$RATE_LIMIT/" /tmp/coolify.env.temp
    sed -i "s/API_RATE_LIMIT_ENABLED=.*/API_RATE_LIMIT_ENABLED=true/" /tmp/coolify.env.temp
else
    echo "➕ Adding new rate limit configuration..."
    cat >> /tmp/coolify.env.temp << EOF

# Custom API Rate Limits for MCP Integration - Added $(date)
API_RATE_LIMIT_PER_MINUTE=$RATE_LIMIT
API_RATE_LIMIT_ENABLED=true
EOF
fi

echo "✅ Configuration updated"
echo ""

# Show the changes
echo "📄 New configuration:"
echo "---"
tail -5 /tmp/coolify.env.temp
echo "---"
echo ""

# Stop container temporarily to update file
echo "⏸️  Stopping Coolify container..."
sudo docker stop $CONTAINER_NAME

echo "📥 Copying updated configuration..."
sudo docker cp /tmp/coolify.env.temp $CONTAINER_NAME:/var/www/html/.env

echo "▶️  Starting Coolify container..."
sudo docker start $CONTAINER_NAME

echo "⏳ Waiting for container to be healthy..."
sleep 5

# Clear Laravel cache
echo "🗑️  Clearing Laravel cache..."
sudo docker exec $CONTAINER_NAME php artisan config:clear || true
sudo docker exec $CONTAINER_NAME php artisan cache:clear || true

echo ""
echo "✅ Rate limit configuration completed!"
echo ""
echo "📊 Current settings:"
echo "  - Rate Limit: $RATE_LIMIT requests/minute"
echo "  - Status: Enabled"
echo ""
echo "🧪 Test with:"
echo "  curl -H \"Authorization: Bearer \$COOLIFY_TOKEN\" \\"
echo "       \"https://coolify.theprofitplatform.com.au/api/v1/version\""
echo ""

# Cleanup
rm -f /tmp/coolify.env.temp
