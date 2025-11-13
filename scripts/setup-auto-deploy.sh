#!/bin/bash
#
# Auto-Deploy Setup Helper Script
# Sets up automated deployment from GitHub to Coolify via N8N
#
# Usage: ./scripts/setup-auto-deploy.sh [app-name]
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COOLIFY_BASE_URL="${COOLIFY_BASE_URL:-https://coolify.theprofitplatform.com.au}"
COOLIFY_TOKEN="${COOLIFY_TOKEN:-***REMOVED***}"
N8N_URL="https://n8n.theprofitplatform.com.au"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if required commands exist
check_dependencies() {
    local missing=0

    for cmd in curl jq; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Required command not found: $cmd"
            missing=1
        fi
    done

    if [ $missing -eq 1 ]; then
        log_error "Please install missing dependencies:"
        log_info "  sudo apt-get install curl jq"
        exit 1
    fi
}

# Test Coolify API connection
test_connection() {
    log_info "Testing Coolify API connection..."

    local response
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $COOLIFY_TOKEN" \
        "$COOLIFY_BASE_URL/api/v1/version")

    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "200" ]; then
        log_success "Connected to Coolify API successfully"
        return 0
    else
        log_error "Failed to connect to Coolify API (HTTP $http_code)"
        return 1
    fi
}

# List all applications
list_applications() {
    log_info "Fetching applications from Coolify..."

    local response
    response=$(curl -s \
        -H "Authorization: Bearer $COOLIFY_TOKEN" \
        "$COOLIFY_BASE_URL/api/v1/applications")

    if [ -n "$response" ]; then
        echo "$response" | jq -r '.[] | "  • \(.name) [\(.uuid)]"'
        return 0
    else
        log_error "Failed to fetch applications"
        return 1
    fi
}

# Get application UUID by name
get_app_uuid() {
    local app_name="$1"

    local response
    response=$(curl -s \
        -H "Authorization: Bearer $COOLIFY_TOKEN" \
        "$COOLIFY_BASE_URL/api/v1/applications")

    local uuid
    uuid=$(echo "$response" | jq -r ".[] | select(.name == \"$app_name\") | .uuid")

    echo "$uuid"
}

# Create deployment configuration
create_deploy_config() {
    local app_name="$1"
    local prod_uuid="$2"
    local staging_uuid="$3"
    local target_dir="$4"

    log_info "Creating deployment configuration..."

    # Create .coolify directory if it doesn't exist
    mkdir -p "$target_dir/.coolify"

    # Copy template and replace values
    local template="$PROJECT_ROOT/templates/deploy-config-template.json"
    local output="$target_dir/.coolify/deploy.json"

    if [ ! -f "$template" ]; then
        log_error "Template not found: $template"
        return 1
    fi

    # Replace placeholders
    sed -e "s/YOUR-PRODUCTION-APP-UUID/$prod_uuid/g" \
        -e "s/YOUR-STAGING-APP-UUID/$staging_uuid/g" \
        "$template" > "$output"

    log_success "Created deployment config: $output"
    log_info "Please review and update the configuration as needed"

    return 0
}

# Display webhook setup instructions
show_webhook_instructions() {
    local n8n_webhook_url="$N8N_URL/webhook/github-deploy"

    echo ""
    log_info "=========================================="
    log_info "GitHub Webhook Setup Instructions"
    log_info "=========================================="
    echo ""
    echo "1. Go to your GitHub repository"
    echo "2. Click: Settings → Webhooks → Add webhook"
    echo ""
    echo "3. Configure webhook:"
    echo "   Payload URL: $n8n_webhook_url"
    echo "   Content type: application/json"
    echo "   Secret: (leave empty or set one)"
    echo "   Events: Just the push event"
    echo "   Active: ✓ Checked"
    echo ""
    echo "4. Click 'Add webhook'"
    echo ""
    log_info "=========================================="
    echo ""
}

# Display N8N setup instructions
show_n8n_instructions() {
    local app_uuid="$1"

    echo ""
    log_info "=========================================="
    log_info "N8N Workflow Setup Instructions"
    log_info "=========================================="
    echo ""
    echo "1. Open N8N: $N8N_URL"
    echo ""
    echo "2. Import workflow:"
    echo "   Click: + → Import from File"
    echo "   File: $PROJECT_ROOT/n8n-examples/github-to-coolify.json"
    echo ""
    echo "3. Update 'Deploy to Coolify' node:"
    echo "   URL: $COOLIFY_BASE_URL/api/v1/applications/$app_uuid/deploy"
    echo "   Authorization: Bearer $COOLIFY_TOKEN"
    echo ""
    echo "4. Activate workflow"
    echo "   Toggle 'Active' switch at top right"
    echo ""
    log_info "=========================================="
    echo ""
}

# Main setup flow
main() {
    echo ""
    log_info "🚀 Coolify Auto-Deploy Setup"
    echo ""

    # Check dependencies
    check_dependencies

    # Test connection
    if ! test_connection; then
        log_error "Cannot continue without API connection"
        exit 1
    fi

    echo ""

    # Get app name from argument or prompt
    local app_name="$1"
    if [ -z "$app_name" ]; then
        log_info "Available applications:"
        list_applications
        echo ""
        read -p "Enter application name: " app_name
    fi

    # Get application UUIDs
    log_info "Looking up application: $app_name"
    local prod_uuid
    prod_uuid=$(get_app_uuid "$app_name")

    if [ -z "$prod_uuid" ]; then
        log_error "Application not found: $app_name"
        log_info "Available applications:"
        list_applications
        exit 1
    fi

    log_success "Found application: $app_name [$prod_uuid]"

    # Ask for staging UUID (optional)
    echo ""
    read -p "Enter staging app UUID (or press Enter to skip): " staging_uuid
    staging_uuid="${staging_uuid:-$prod_uuid}"

    # Ask for target directory
    echo ""
    read -p "Enter target directory for config (default: current dir): " target_dir
    target_dir="${target_dir:-.}"

    # Create deployment configuration
    if create_deploy_config "$app_name" "$prod_uuid" "$staging_uuid" "$target_dir"; then
        log_success "Deployment configuration created"
    else
        log_error "Failed to create deployment configuration"
        exit 1
    fi

    # Show setup instructions
    show_n8n_instructions "$prod_uuid"
    show_webhook_instructions

    # Summary
    echo ""
    log_success "=========================================="
    log_success "Auto-Deploy Setup Complete!"
    log_success "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Review deployment config: $target_dir/.coolify/deploy.json"
    echo "2. Set up N8N workflow (see instructions above)"
    echo "3. Configure GitHub webhook (see instructions above)"
    echo "4. Test with: git push origin main"
    echo ""
    log_info "Documentation: $PROJECT_ROOT/AUTO-DEPLOY-SETUP.md"
    echo ""
}

# Run main function with arguments
main "${1:-}"
