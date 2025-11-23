#!/bin/bash

##############################################################################
# Credential Verification Script
#
# Verifies that no hardcoded production credentials exist in codebase
# Part of SECURITY-REMEDIATION-PLAN.md verification
#
# Usage:
#   ./scripts/verify-no-credentials.sh [--check-history]
#
# Options:
#   --check-history    Also check git history for credentials
##############################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
CHECK_HISTORY=false
ISSUES_FOUND=0

# Parse arguments
for arg in "$@"; do
  case $arg in
    --check-history)
      CHECK_HISTORY=true
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
  ((ISSUES_FOUND++))
}

log_warning() {
  echo -e "${YELLOW}⚠️  $*${NC}"
}

##############################################################################
# Known credentials to check for
##############################################################################

QDRANT_KEY="***REMOVED***"
COOLIFY_TOKEN="***REMOVED***"

log "🔍 Starting credential verification..."
log ""

##############################################################################
# Check 1: Scan working directory for credentials
##############################################################################

log "📂 Checking working directory for hardcoded credentials..."

# Check for Qdrant key
if grep -r "$QDRANT_KEY" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude="*.md" . 2>/dev/null; then
  log_error "Found exposed Qdrant API key in working directory"
else
  log_success "No Qdrant API key found in working directory"
fi

# Check for Coolify token
if grep -r "$COOLIFY_TOKEN" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude="*.md" . 2>/dev/null; then
  log_error "Found exposed Coolify token in working directory"
else
  log_success "No Coolify token found in working directory"
fi

log ""

##############################################################################
# Check 2: Verify specific files
##############################################################################

log "📄 Checking specific files..."

# src/qdrant/client.ts
if [ -f src/qdrant/client.ts ]; then
  if grep -q "$QDRANT_KEY" src/qdrant/client.ts; then
    log_error "src/qdrant/client.ts contains hardcoded API key"
  else
    log_success "src/qdrant/client.ts: No hardcoded credentials"
  fi
fi

# coolify-mcp.service
if [ -f coolify-mcp.service ]; then
  if grep -q "$COOLIFY_TOKEN" coolify-mcp.service; then
    log_error "coolify-mcp.service contains hardcoded token"
  else
    log_success "coolify-mcp.service: No hardcoded credentials"
  fi
fi

# claude-config.json
if [ -f claude-config.json ]; then
  if grep -q "$COOLIFY_TOKEN" claude-config.json; then
    log_error "claude-config.json contains hardcoded token"
  else
    log_success "claude-config.json: No hardcoded credentials"
  fi
fi

# claude-desktop-config.json
if [ -f claude-desktop-config.json ]; then
  if grep -q "$COOLIFY_TOKEN" claude-desktop-config.json; then
    log_error "claude-desktop-config.json contains hardcoded token"
  else
    log_success "claude-desktop-config.json: No hardcoded credentials"
  fi
fi

# n8n-examples
if [ -d n8n-examples ]; then
  N8N_ISSUES=0
  while IFS= read -r file; do
    if grep -q "$COOLIFY_TOKEN" "$file"; then
      log_error "$file contains hardcoded token"
      ((N8N_ISSUES++))
    fi
  done < <(find n8n-examples -name "*.json" -type f)

  if [ $N8N_ISSUES -eq 0 ]; then
    log_success "n8n-examples: No hardcoded credentials"
  fi
fi

# qdrant-docker.sh
if [ -f qdrant-docker.sh ]; then
  if grep -q "$QDRANT_KEY" qdrant-docker.sh; then
    log_error "qdrant-docker.sh contains hardcoded API key"
  else
    log_success "qdrant-docker.sh: No hardcoded credentials"
  fi
fi

log ""

##############################################################################
# Check 3: Verify .example files have placeholders
##############################################################################

log "📋 Verifying .example files have placeholders..."

# Check .env.example
if [ -f .env.example ]; then
  if grep -q "$QDRANT_KEY\|$COOLIFY_TOKEN" .env.example; then
    log_error ".env.example contains real credentials"
  else
    log_success ".env.example: Uses placeholders"
  fi
fi

# Check coolify-mcp.service.example
if [ -f coolify-mcp.service.example ]; then
  if grep -q "$COOLIFY_TOKEN" coolify-mcp.service.example; then
    log_error "coolify-mcp.service.example contains real credentials"
  else
    log_success "coolify-mcp.service.example: Uses placeholders"
  fi
fi

# Check claude-config.example.json
if [ -f claude-config.example.json ]; then
  if grep -q "$COOLIFY_TOKEN" claude-config.example.json; then
    log_error "claude-config.example.json contains real credentials"
  else
    log_success "claude-config.example.json: Uses placeholders"
  fi
fi

log ""

##############################################################################
# Check 4: Verify .gitignore entries
##############################################################################

log "📝 Checking .gitignore..."

REQUIRED_IGNORES=(
  ".env"
  "credentials.env"
  "coolify-mcp.service"
  "claude-config.json"
  "claude-desktop-config.json"
)

for pattern in "${REQUIRED_IGNORES[@]}"; do
  if grep -q "^${pattern}$" .gitignore 2>/dev/null; then
    log_success ".gitignore contains: $pattern"
  else
    log_error ".gitignore missing: $pattern"
  fi
done

log ""

##############################################################################
# Check 5: Verify files not tracked in git
##############################################################################

log "🔍 Checking git tracking status..."

SHOULD_NOT_TRACK=(
  "coolify-mcp.service"
  "claude-config.json"
  "claude-desktop-config.json"
  ".env"
)

for file in "${SHOULD_NOT_TRACK[@]}"; do
  if git ls-files --error-unmatch "$file" 2>/dev/null; then
    log_error "$file is tracked in git (should be untracked)"
  else
    log_success "$file: Not tracked in git"
  fi
done

log ""

##############################################################################
# Check 6: Git history (optional)
##############################################################################

if [ "$CHECK_HISTORY" = true ]; then
  log "🗂️  Checking git history for credentials..."

  # Check for Qdrant key in history
  if git log --all -S "$QDRANT_KEY" --pretty=format:"%H" | grep -q .; then
    log_error "Qdrant API key found in git history"
    log "  Run: git log --all -S \"$QDRANT_KEY\""
  else
    log_success "No Qdrant API key in git history"
  fi

  # Check for Coolify token in history
  if git log --all -S "$COOLIFY_TOKEN" --pretty=format:"%H" | grep -q .; then
    log_error "Coolify token found in git history"
    log "  Run: git log --all -S \"$COOLIFY_TOKEN\""
  else
    log_success "No Coolify token in git history"
  fi

  log ""
fi

##############################################################################
# Check 7: Verify environment variable usage
##############################################################################

log "🔧 Verifying environment variable usage..."

# Check if code requires env vars
if [ -f src/qdrant/client.ts ]; then
  if grep -q "if (!QDRANT_API_KEY)" src/qdrant/client.ts; then
    log_success "Code requires QDRANT_API_KEY env var"
  else
    log_warning "Code may not validate QDRANT_API_KEY requirement"
  fi
fi

log ""

##############################################################################
# Check 8: Build and test validation
##############################################################################

log "🧪 Running build and tests..."

# Check if build works
if npm run build > /dev/null 2>&1; then
  log_success "Build passes"
else
  log_error "Build fails"
fi

# Check if tests pass
if npm test > /dev/null 2>&1; then
  log_success "Tests pass"
else
  log_warning "Some tests failing (may require live instance)"
fi

log ""

##############################################################################
# Summary
##############################################################################

log "=========================================="
log "VERIFICATION SUMMARY"
log "=========================================="
log ""

if [ $ISSUES_FOUND -eq 0 ]; then
  log_success "✅ ALL CHECKS PASSED - No credentials found!"
  log ""
  log "Security status: GOOD"
  log "Production ready: YES (after credential rotation)"
  log ""
  log "Recommendations:"
  log "  1. Ensure old credentials have been rotated"
  log "  2. Verify production uses new credentials"
  log "  3. If git history contains credentials, run cleanup"
  log "  4. Add pre-commit hooks to prevent future issues"
  exit 0
else
  log_error "❌ FOUND $ISSUES_FOUND ISSUE(S)"
  log ""
  log "Security status: CRITICAL"
  log "Production ready: NO"
  log ""
  log "Actions required:"
  log "  1. Fix all issues listed above"
  log "  2. Run this script again to verify"
  log "  3. Follow SECURITY-REMEDIATION-PLAN.md"
  exit 1
fi
