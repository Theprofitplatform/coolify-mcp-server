#!/bin/bash
# Coolify MCP Server - Security Fix Script
# Fixes exposed API token in systemd service file
#
# Usage: sudo ./scripts/fix-security.sh
#
# This script:
# 1. Creates secure environment file at /etc/default/coolify-mcp
# 2. Updates systemd service to use EnvironmentFile
# 3. Removes hardcoded secrets from service file
# 4. Restarts the service

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

ENV_FILE="/etc/default/coolify-mcp"
SERVICE_FILE="/etc/systemd/system/coolify-mcp.service"
PROJECT_DIR="/home/avi/projects/coolify/coolify-mcp"
SOURCE_ENV="${PROJECT_DIR}/.env"

log_info "Starting Coolify MCP Security Fix..."

# Step 1: Check if .env exists and has required values
if [[ ! -f "$SOURCE_ENV" ]]; then
    log_error "Source .env file not found at $SOURCE_ENV"
    log_info "Please create .env from .env.example first"
    exit 1
fi

# Step 2: Create secure environment file
log_info "Creating secure environment file at $ENV_FILE..."

# Extract values from existing .env
COOLIFY_BASE_URL=$(grep -E "^COOLIFY_BASE_URL=" "$SOURCE_ENV" | cut -d'=' -f2- || echo "")
COOLIFY_TOKEN=$(grep -E "^COOLIFY_TOKEN=" "$SOURCE_ENV" | cut -d'=' -f2- || echo "")

if [[ -z "$COOLIFY_BASE_URL" ]] || [[ -z "$COOLIFY_TOKEN" ]]; then
    log_error "COOLIFY_BASE_URL or COOLIFY_TOKEN not found in $SOURCE_ENV"
    exit 1
fi

# Create environment file with restricted permissions
cat > "$ENV_FILE" << EOF
# Coolify MCP Server Environment Configuration
# This file contains sensitive credentials - DO NOT COMMIT TO GIT
# Permissions: 600 (root only)
# Generated: $(date)

# Coolify API Configuration
COOLIFY_BASE_URL=${COOLIFY_BASE_URL}
COOLIFY_TOKEN=${COOLIFY_TOKEN}

# API Settings
COOLIFY_API_TIMEOUT=60000
COOLIFY_API_MAX_RETRIES=5
COOLIFY_API_RETRY_DELAY=2000

# Runtime Configuration
NODE_ENV=production
DEBUG=false
EOF

# Set strict permissions
chmod 600 "$ENV_FILE"
chown root:root "$ENV_FILE"

log_info "Environment file created with secure permissions (600)"

# Step 3: Create updated systemd service file
log_info "Creating secure systemd service file..."

cat > "$SERVICE_FILE" << 'EOF'
[Unit]
Description=Coolify MCP Server
Documentation=https://github.com/Theprofitplatform/coolify-mcp-server
After=network.target

[Service]
Type=simple
User=avi
Group=avi
WorkingDirectory=/home/avi/projects/coolify/coolify-mcp

# Load environment from secure file (NOT hardcoded!)
EnvironmentFile=/etc/default/coolify-mcp

# Start the MCP server
ExecStart=/usr/bin/node /home/avi/projects/coolify/coolify-mcp/build/index.js

# Restart configuration
Restart=always
RestartSec=10

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=coolify-mcp

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/avi/projects/coolify/coolify-mcp

[Install]
WantedBy=multi-user.target
EOF

log_info "Systemd service file updated"

# Step 4: Reload systemd and restart service
log_info "Reloading systemd daemon..."
systemctl daemon-reload

log_info "Restarting coolify-mcp service..."
systemctl restart coolify-mcp

# Wait a moment for service to start
sleep 3

# Step 5: Verify service is running
if systemctl is-active --quiet coolify-mcp; then
    log_info "Service is running successfully!"
else
    log_error "Service failed to start. Check logs with: journalctl -u coolify-mcp -n 50"
    exit 1
fi

# Step 6: Verify no secrets in service file
if grep -qi "token" "$SERVICE_FILE" 2>/dev/null | grep -v "EnvironmentFile"; then
    log_warn "Warning: Token reference still found in service file"
else
    log_info "Verified: No hardcoded secrets in service file"
fi

# Print summary
echo ""
echo "=========================================="
echo -e "${GREEN}Security Fix Complete!${NC}"
echo "=========================================="
echo ""
echo "Changes made:"
echo "  1. Created secure env file: $ENV_FILE (mode 600)"
echo "  2. Updated service file to use EnvironmentFile"
echo "  3. Removed hardcoded credentials from service"
echo "  4. Restarted coolify-mcp service"
echo ""
echo "Verify with:"
echo "  sudo systemctl status coolify-mcp"
echo "  sudo journalctl -u coolify-mcp -f"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC} Remember to rotate your API token in Coolify dashboard!"
echo ""
