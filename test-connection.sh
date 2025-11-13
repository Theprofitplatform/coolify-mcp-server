#!/bin/bash
# Test Coolify API Connection

echo "🧪 Testing Coolify Connection"
echo "=============================="
echo

# Load environment
if [ -f .env ]; then
    source .env
else
    echo "❌ No .env file found. Run quick-start.sh first."
    exit 1
fi

# Check variables
if [ -z "$COOLIFY_BASE_URL" ] || [ -z "$COOLIFY_TOKEN" ]; then
    echo "❌ Environment variables not set"
    exit 1
fi

echo "Testing connection to: $COOLIFY_BASE_URL"
echo

# Test version endpoint
echo "1. Testing /api/v1/version..."
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $COOLIFY_TOKEN" \
    "$COOLIFY_BASE_URL/api/v1/version")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo "   ✅ Success! Coolify version: $body"
else
    echo "   ❌ Failed with status: $http_code"
    echo "   Response: $body"
    exit 1
fi

echo

# Test servers endpoint
echo "2. Testing /api/v1/servers..."
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $COOLIFY_TOKEN" \
    "$COOLIFY_BASE_URL/api/v1/servers")

http_code=$(echo "$response" | tail -n1)

if [ "$http_code" = "200" ]; then
    echo "   ✅ Success! API is accessible"
else
    echo "   ❌ Failed with status: $http_code"
fi

echo
echo "🎉 Connection test complete!"
echo
echo "Next steps:"
echo "  1. Run: ./quick-start.sh"
echo "  2. Configure Claude Desktop (see LOCAL-SETUP-GUIDE.md)"
echo "  3. Test the 37 tools!"
