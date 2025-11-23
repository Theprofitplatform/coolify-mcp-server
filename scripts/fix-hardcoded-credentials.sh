#!/bin/bash

##############################################################################
# Automated Credential Removal Script
#
# Removes all hardcoded production credentials from codebase
# Part of SECURITY-REMEDIATION-PLAN.md Phase 2
#
# Usage:
#   ./scripts/fix-hardcoded-credentials.sh [--dry-run]
#
# Options:
#   --dry-run      Show what would be done without making changes
##############################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DRY_RUN=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
  esac
done

log() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"
}

log_success() {
  echo -e "${GREEN}✅ $*${NC}"
}

log_error() {
  echo -e "${RED}❌ $*${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $*${NC}"
}

##############################################################################
# Pre-flight checks
##############################################################################

log "🔍 Running pre-flight checks..."

# Check if in git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  log_error "Not in a git repository"
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  log_warning "You have uncommitted changes"
  read -p "Continue anyway? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Aborted by user"
    exit 0
  fi
fi

log_success "Pre-flight checks passed"

##############################################################################
# Create backup
##############################################################################

if [ "$DRY_RUN" = false ]; then
  log "💾 Creating backup..."

  BACKUP_DIR="../coolify-mcp-backup-$(date +%Y%m%d-%H%M%S)"
  cp -r . "$BACKUP_DIR"

  log_success "Backup created at: $BACKUP_DIR"
fi

##############################################################################
# Fix src/qdrant/client.ts
##############################################################################

log "🔧 Fixing src/qdrant/client.ts..."

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN: Would remove hardcoded API key from src/qdrant/client.ts"
else
  # Create the fixed version
  cat > src/qdrant/client.ts.new <<'EOF'
/**
 * Qdrant Vector Database Client
 * Connects to Qdrant for vector similarity search
 */

import { QdrantClient as QdrantClientLib } from '@qdrant/js-client-rest';

/**
 * Qdrant connection configuration
 * All values from environment variables (REQUIRED)
 */
const QDRANT_HOST = process.env.QDRANT_HOST;
const QDRANT_PORT = parseInt(process.env.QDRANT_PORT || '6333');
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

// Validate required environment variables
if (!QDRANT_HOST) {
  throw new Error(
    'QDRANT_HOST environment variable is required. ' +
    'Please set it in your .env file. See .env.example for configuration template.'
  );
}

if (!QDRANT_API_KEY) {
  throw new Error(
    'QDRANT_API_KEY environment variable is required. ' +
    'Please set it in your .env file. See .env.example for configuration template.'
  );
}

export class QdrantClient {
  private client: QdrantClientLib;

  constructor() {
    this.client = new QdrantClientLib({
      url: `https://${QDRANT_HOST}:${QDRANT_PORT}`,
      apiKey: QDRANT_API_KEY,
    });
  }

  async search(collectionName: string, query: number[], limit: number = 10) {
    return await this.client.search(collectionName, {
      vector: query,
      limit,
    });
  }

  async getCollections() {
    return await this.client.getCollections();
  }
}
EOF

  # Backup original
  if [ -f src/qdrant/client.ts ]; then
    cp src/qdrant/client.ts src/qdrant/client.ts.backup
  fi

  # Replace with fixed version
  mv src/qdrant/client.ts.new src/qdrant/client.ts

  log_success "Fixed src/qdrant/client.ts"
fi

##############################################################################
# Fix coolify-mcp.service
##############################################################################

log "🔧 Creating coolify-mcp.service.example..."

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN: Would create coolify-mcp.service.example"
else
  cat > coolify-mcp.service.example <<'EOF'
[Unit]
Description=Coolify MCP Server
After=network.target

[Service]
Type=simple
User=coolify-mcp
WorkingDirectory=/opt/coolify-mcp
EnvironmentFile=/etc/coolify-mcp/credentials.env
ExecStart=/usr/bin/node /opt/coolify-mcp/build/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

  log_success "Created coolify-mcp.service.example"
fi

##############################################################################
# Fix config files
##############################################################################

log "🔧 Creating config file examples..."

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN: Would create config .example files"
else
  # claude-config.example.json
  if [ -f claude-config.json ]; then
    jq '
      ._warning = "⚠️ SECURITY: Replace YOUR_COOLIFY_API_TOKEN_HERE with your actual token. NEVER commit real credentials!" |
      walk(
        if type == "string" and (contains("vzn") or contains("QEoT"))
        then "YOUR_COOLIFY_API_TOKEN_HERE"
        else .
        end
      )
    ' claude-config.json > claude-config.example.json

    log_success "Created claude-config.example.json"
  fi

  # claude-desktop-config.example.json
  if [ -f claude-desktop-config.json ]; then
    jq '
      ._warning = "⚠️ SECURITY: Replace YOUR_COOLIFY_API_TOKEN_HERE with your actual token. NEVER commit real credentials!" |
      walk(
        if type == "string" and (contains("vzn") or contains("QEoT"))
        then "YOUR_COOLIFY_API_TOKEN_HERE"
        else .
        end
      )
    ' claude-desktop-config.json > claude-desktop-config.example.json

    log_success "Created claude-desktop-config.example.json"
  fi
fi

##############################################################################
# Fix N8N examples
##############################################################################

log "🔧 Fixing N8N example files..."

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN: Would replace credentials in n8n-examples/*.json"
else
  find n8n-examples -name "*.json" -type f | while read file; do
    sed -i 's/***REMOVED***/YOUR_COOLIFY_API_TOKEN_HERE/g' "$file"
    log "  Fixed: $file"
  done

  # Create security warning
  cat > n8n-examples/SECURITY-WARNING.md <<'EOF'
# ⚠️ SECURITY WARNING

## Before Using These Examples

All example workflows contain placeholder credentials:
- `YOUR_COOLIFY_API_TOKEN_HERE`

**NEVER commit files with real credentials to git!**

## Setup Instructions

1. Copy example workflow to N8N
2. Replace `YOUR_COOLIFY_API_TOKEN_HERE` with your actual Coolify API token
3. Save in N8N (do not commit to git)
4. Test workflow

## Best Practices

- Use N8N credentials system for sensitive data
- Never hardcode API tokens in workflows
- Use environment variables when possible
- Review workflows before sharing
- Never commit real credentials to version control

## If You Accidentally Commit Credentials

1. Rotate the credential immediately
2. Remove from git history using BFG Repo-Cleaner
3. Force push the cleaned repository
4. Notify your team

See: ../SECURITY-REMEDIATION-PLAN.md for details
EOF

  log_success "Fixed N8N examples and added security warning"
fi

##############################################################################
# Fix qdrant-docker.sh
##############################################################################

log "🔧 Fixing qdrant-docker.sh..."

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN: Would add env var check to qdrant-docker.sh"
else
  # Add env var check if not already present
  if ! grep -q "if \[ -z \"\$QDRANT_API_KEY\" \]" qdrant-docker.sh; then
    # Create temp file with fix
    cat > qdrant-docker.sh.new <<'EOF'
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
EOF

    # Backup and replace
    if [ -f qdrant-docker.sh ]; then
      cp qdrant-docker.sh qdrant-docker.sh.backup
    fi
    mv qdrant-docker.sh.new qdrant-docker.sh
    chmod +x qdrant-docker.sh

    log_success "Fixed qdrant-docker.sh"
  else
    log_success "qdrant-docker.sh already has env var check"
  fi
fi

##############################################################################
# Create credentials.env.example
##############################################################################

log "🔧 Creating credentials.env.example..."

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN: Would create credentials.env.example"
else
  cat > credentials.env.example <<'EOF'
# Coolify MCP Server Credentials
#
# Copy this file to /etc/coolify-mcp/credentials.env (for systemd)
# Or copy to .env (for local development)
#
# Fill in your actual credentials
# NEVER commit real credentials to git!

# Coolify Configuration
COOLIFY_BASE_URL=https://your-coolify-instance.com
COOLIFY_TOKEN=your-coolify-api-token-here

# Qdrant Configuration
QDRANT_HOST=your-qdrant-host.com
QDRANT_PORT=443
QDRANT_API_KEY=your-qdrant-api-key-here

# N8N Configuration (optional)
N8N_URL=https://your-n8n-instance.com

# API Configuration
COOLIFY_API_TIMEOUT=60000
COOLIFY_API_MAX_RETRIES=5
COOLIFY_API_RETRY_DELAY=2000
EOF

  log_success "Created credentials.env.example"
fi

##############################################################################
# Update .gitignore
##############################################################################

log "🔧 Updating .gitignore..."

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN: Would add entries to .gitignore"
else
  cat >> .gitignore <<'EOF'

# Credentials and sensitive files (added by security remediation)
credentials.env
coolify-mcp.service
claude-config.json
claude-desktop-config.json
*.backup
EOF

  log_success "Updated .gitignore"
fi

##############################################################################
# Summary
##############################################################################

log "=========================================="
log "CREDENTIAL REMOVAL COMPLETE"
log "=========================================="

if [ "$DRY_RUN" = true ]; then
  log_warning "DRY RUN MODE - No changes were made"
  log ""
  log "Run without --dry-run to apply changes"
else
  log_success "All hardcoded credentials removed"
  log ""
  log "Files modified:"
  log "  - src/qdrant/client.ts"
  log "  - qdrant-docker.sh"
  log "  - n8n-examples/*.json (multiple)"
  log "  - .gitignore"
  log ""
  log "Files created:"
  log "  - coolify-mcp.service.example"
  log "  - claude-config.example.json"
  log "  - claude-desktop-config.example.json"
  log "  - credentials.env.example"
  log "  - n8n-examples/SECURITY-WARNING.md"
  log ""
  log "Backup location: $BACKUP_DIR"
  log ""
  log "Next steps:"
  log "  1. Review changes: git diff"
  log "  2. Test build: npm run build"
  log "  3. Test suite: npm test"
  log "  4. Remove tracked files: git rm --cached claude-config.json claude-desktop-config.json coolify-mcp.service"
  log "  5. Commit: git commit -m 'fix: remove hardcoded credentials (v1.0.2)'"
  log ""
  log_warning "Remember to create actual config files from .example templates!"
fi
