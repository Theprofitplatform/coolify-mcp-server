#!/bin/bash
#
# Install Coolify MCP as systemd service
# Usage: ./install-service.sh

set -euo pipefail

echo "🚀 Installing Coolify MCP as systemd service"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

SERVICE_FILE="coolify-mcp.service"
DEST="/etc/systemd/system/coolify-mcp.service"

# Check if service file exists
if [ ! -f "$SERVICE_FILE" ]; then
  echo "❌ Service file not found: $SERVICE_FILE"
  exit 1
fi

# Copy service file
echo "📋 Copying service file to $DEST"
cp "$SERVICE_FILE" "$DEST"
chmod 644 "$DEST"

# Reload systemd
echo "🔄 Reloading systemd daemon"
systemctl daemon-reload

# Enable service
echo "✅ Enabling coolify-mcp service"
systemctl enable coolify-mcp

# Start service
echo "🚀 Starting coolify-mcp service"
systemctl start coolify-mcp

# Show status
echo ""
echo "📊 Service Status:"
systemctl status coolify-mcp --no-pager -l

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Useful commands:"
echo "   sudo systemctl status coolify-mcp   - Check status"
echo "   sudo systemctl stop coolify-mcp     - Stop service"
echo "   sudo systemctl start coolify-mcp    - Start service"
echo "   sudo systemctl restart coolify-mcp  - Restart service"
echo "   sudo journalctl -u coolify-mcp -f   - View logs"
echo ""
