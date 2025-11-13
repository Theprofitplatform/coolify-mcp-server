#!/bin/bash
#
# Auto-Deploy Setup Helper Script
# Sets up automated deployment from GitHub to Coolify via N8N
#
# Usage: ./scripts/setup-auto-deploy.sh [OPTIONS] [app-name]
#
# Version: 1.0.0
#

set -euo pipefail

# Script version
VERSION="1.0.0"

# Flags
DRY_RUN=false
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COOLIFY_BASE_URL="${COOLIFY_BASE_URL:-https://coolify.theprofitplatform.com.au}"
COOLIFY_TOKEN="${COOLIFY_TOKEN:-}"
N8N_URL="${N8N_URL:-https://n8n.theprofitplatform.com.au}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    # shellcheck disable=SC1090
    source "$PROJECT_ROOT/.env"
fi

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

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# Show help message
show_help() {
    cat << EOF
Auto-Deploy Setup Helper Script v${VERSION}

USAGE:
    $0 [OPTIONS] [APP_NAME]

DESCRIPTION:
    Sets up automated deployment from GitHub to Coolify via N8N.
    Creates deployment configuration, validates API connection, and
    provides step-by-step instructions for webhook setup.

OPTIONS:
    -h, --help          Show this help message
    -v, --version       Show script version
    -d, --dry-run       Preview changes without creating files
    --verbose           Enable verbose debug output

ARGUMENTS:
    APP_NAME            Name of the Coolify application (optional)
                       If not provided, script will prompt interactively

ENVIRONMENT VARIABLES:
    COOLIFY_TOKEN       Coolify API token (required)
    COOLIFY_BASE_URL    Coolify instance URL (required)
    N8N_URL            N8N instance URL (optional)

EXAMPLES:
    # Interactive mode
    $0

    # With app name
    $0 my-application

    # Dry run to preview
    $0 --dry-run my-application

    # Verbose mode for debugging
    $0 --verbose my-application

    # Set environment variables inline
    COOLIFY_TOKEN=xxx $0 my-app

SETUP:
    1. Set environment variables (see .env.example)
    2. Run this script with your app name
    3. Import N8N workflow from n8n-examples/
    4. Configure GitHub webhook
    5. Test with git push

DOCUMENTATION:
    Quick Start: QUICK-START-AUTO-DEPLOY.md
    Full Guide:  AUTO-DEPLOY-SETUP.md
    Templates:   templates/README.md

For more information, visit:
    https://coolify.io/docs/api
EOF
    exit 0
}

# Show version
show_version() {
    echo "Auto-Deploy Setup Helper v${VERSION}"
    exit 0
}

# Parse command line arguments
parse_args() {
    APP_NAME=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                ;;
            -v|--version)
                show_version
                ;;
            -d|--dry-run)
                DRY_RUN=true
                log_info "Dry run mode enabled - no files will be created"
                shift
                ;;
            --verbose)
                VERBOSE=true
                log_info "Verbose mode enabled"
                shift
                ;;
            -*)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
            *)
                APP_NAME="$1"
                shift
                ;;
        esac
    done

    export APP_NAME
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

# Check required environment variables
check_environment() {
    local missing=0

    if [ -z "$COOLIFY_TOKEN" ]; then
        log_error "COOLIFY_TOKEN environment variable is required"
        missing=1
    fi

    if [ -z "$COOLIFY_BASE_URL" ]; then
        log_error "COOLIFY_BASE_URL environment variable is required"
        missing=1
    fi

    if [ $missing -eq 1 ]; then
        log_error "Please set required environment variables:"
        log_info "  export COOLIFY_TOKEN='your-token-here'"
        log_info "  export COOLIFY_BASE_URL='https://coolify.example.com'"
        log_info ""
        log_info "Or create a .env file in: $PROJECT_ROOT/.env"
        log_info "  COOLIFY_TOKEN=your-token-here"
        log_info "  COOLIFY_BASE_URL=https://coolify.example.com"
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
    log_verbose "App: $app_name, Prod UUID: $prod_uuid, Staging UUID: $staging_uuid"

    # Copy template and replace values
    local template="$PROJECT_ROOT/templates/deploy-config-template.json"
    local output="$target_dir/.coolify/deploy.json"

    if [ ! -f "$template" ]; then
        log_error "Template not found: $template"
        return 1
    fi

    if [ "$DRY_RUN" = true ]; then
        log_warning "[DRY RUN] Would create: $output"
        log_info "[DRY RUN] Config preview:"
        sed -e "s/YOUR-PRODUCTION-APP-UUID/$prod_uuid/g" \
            -e "s/YOUR-STAGING-APP-UUID/$staging_uuid/g" \
            "$template" | head -20
        echo "  ... (truncated)"
    else
        # Create .coolify directory if it doesn't exist
        mkdir -p "$target_dir/.coolify"

        # Replace placeholders
        sed -e "s/YOUR-PRODUCTION-APP-UUID/$prod_uuid/g" \
            -e "s/YOUR-STAGING-APP-UUID/$staging_uuid/g" \
            "$template" > "$output"

        log_success "Created deployment config: $output"
        log_info "Please review and update the configuration as needed"
    fi

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

    # Check environment variables
    check_environment

    # Test connection
    if ! test_connection; then
        log_error "Cannot continue without API connection"
        exit 1
    fi

    echo ""

    # Get app name from parsed arguments or prompt
    local app_name="$APP_NAME"
    if [ -z "$app_name" ]; then
        log_info "Available applications:"
        list_applications
        echo ""
        read -p "Enter application name: " app_name
    fi

    log_verbose "Selected application: $app_name"

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

# Parse command line arguments
parse_args "$@"

# Run main function
main
