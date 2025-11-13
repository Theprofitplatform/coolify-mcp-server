#!/bin/bash
# Quick Start Script for Coolify MCP Server

echo "🚀 Coolify MCP Server - Quick Start"
echo "===================================="
echo

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo
    echo "Creating .env from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo
    echo "📝 Please edit .env and add your:"
    echo "   - COOLIFY_BASE_URL"
    echo "   - COOLIFY_TOKEN"
    echo
    echo "Then run this script again."
    exit 1
fi

echo "✅ Found .env file"
echo

# Load environment
source .env

# Check if variables are set
if [ -z "$COOLIFY_BASE_URL" ] || [ "$COOLIFY_BASE_URL" = "https://your-coolify-instance.com" ]; then
    echo "⚠️  COOLIFY_BASE_URL not configured in .env"
    echo "   Please edit .env and set your Coolify URL"
    exit 1
fi

if [ -z "$COOLIFY_TOKEN" ] || [ "$COOLIFY_TOKEN" = "your-api-token-here" ]; then
    echo "⚠️  COOLIFY_TOKEN not configured in .env"
    echo "   Please edit .env and set your API token"
    exit 1
fi

echo "✅ Environment configured"
echo "   URL: $COOLIFY_BASE_URL"
echo

# Build if needed
if [ ! -d "build" ]; then
    echo "🏗️  Building project..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed!"
        exit 1
    fi
    echo "✅ Build successful"
    echo
fi

echo "🚀 Starting Coolify MCP Server..."
echo "   Press Ctrl+C to stop"
echo
npm start
