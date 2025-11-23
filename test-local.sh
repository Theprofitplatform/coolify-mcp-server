#!/bin/bash

###############################################################################
# Local Testing Script for Coolify MCP Server
#
# This script helps you run tests locally with proper environment setup
###############################################################################

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check if .env.test exists
if [ ! -f ".env.test" ]; then
    print_warning ".env.test not found. This is OK - using safe defaults."
fi

# Parse command line arguments
TEST_TYPE="${1:-all}"
WATCH_MODE="${2:-}"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         Coolify MCP Server - Local Testing                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Build if needed
if [ ! -d "build" ]; then
    print_info "Building project..."
    npm run build
    print_success "Build complete"
fi

echo ""
print_info "Running tests: ${TEST_TYPE}"
echo ""

# Run tests based on type
case $TEST_TYPE in
    "unit")
        print_info "Running unit tests only..."
        if [ "$WATCH_MODE" = "--watch" ]; then
            npm run test:watch -- --testPathPattern=tests/unit
        else
            npm test -- --testPathPattern=tests/unit
        fi
        ;;

    "integration")
        # Check if real credentials are available
        if [ -f ".env" ] && grep -q "COOLIFY_TOKEN=" .env && ! grep -q "test-token" .env; then
            print_warning "Running integration tests with REAL Coolify instance"
            print_warning "Make sure you're OK with this before proceeding!"
            read -p "Continue? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Aborted"
                exit 0
            fi
            npm test -- --testPathPattern=tests/integration
        else
            print_warning "No real credentials found. Integration tests will be skipped."
            print_info "To run integration tests, create a .env file with real Coolify credentials"
            npm test -- --testPathPattern=tests/integration
        fi
        ;;

    "coverage")
        print_info "Running tests with coverage report..."
        npm run test:coverage
        echo ""
        print_success "Coverage report generated in ./coverage/"
        print_info "Open ./coverage/lcov-report/index.html to view detailed report"
        ;;

    "watch")
        print_info "Running tests in watch mode..."
        npm run test:watch
        ;;

    "api")
        print_info "Testing API connection..."
        if [ -f ".env" ]; then
            npm run test:api
        else
            print_error "No .env file found. Create one with COOLIFY_BASE_URL and COOLIFY_TOKEN"
            exit 1
        fi
        ;;

    "all")
        print_info "Running all tests..."
        if [ "$WATCH_MODE" = "--watch" ]; then
            npm run test:watch
        else
            npm test
        fi
        ;;

    "help"|"--help"|"-h")
        echo "Usage: ./test-local.sh [TYPE] [--watch]"
        echo ""
        echo "Types:"
        echo "  all          Run all tests (default)"
        echo "  unit         Run only unit tests"
        echo "  integration  Run only integration tests"
        echo "  coverage     Run tests with coverage report"
        echo "  watch        Run tests in watch mode"
        echo "  api          Test API connection only"
        echo "  help         Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./test-local.sh              # Run all tests"
        echo "  ./test-local.sh unit         # Run unit tests"
        echo "  ./test-local.sh all --watch  # Watch mode"
        echo "  ./test-local.sh coverage     # Generate coverage"
        echo ""
        exit 0
        ;;

    *)
        print_error "Unknown test type: ${TEST_TYPE}"
        echo "Run './test-local.sh help' for usage information"
        exit 1
        ;;
esac

echo ""
print_success "Testing complete!"
