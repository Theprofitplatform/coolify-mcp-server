#!/bin/bash
#
# Test Suite for setup-auto-deploy.sh
# Tests syntax, functions, and basic functionality
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
SETUP_SCRIPT="$PROJECT_ROOT/scripts/setup-auto-deploy.sh"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test functions
pass_test() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
    ((TESTS_RUN++))
}

fail_test() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
    ((TESTS_RUN++))
}

warn_test() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Start tests
echo "========================================"
echo "Testing: setup-auto-deploy.sh"
echo "========================================"
echo ""

# Test 1: Script exists
if [ -f "$SETUP_SCRIPT" ]; then
    pass_test "Script file exists"
else
    fail_test "Script file not found"
    exit 1
fi

# Test 2: Script is executable
if [ -x "$SETUP_SCRIPT" ]; then
    pass_test "Script is executable"
else
    fail_test "Script is not executable"
fi

# Test 3: Bash syntax check
if bash -n "$SETUP_SCRIPT" 2>/dev/null; then
    pass_test "Bash syntax is valid"
else
    fail_test "Bash syntax errors detected"
fi

# Test 4: ShellCheck (if available)
if command -v shellcheck &> /dev/null; then
    if shellcheck -x "$SETUP_SCRIPT" 2>/dev/null; then
        pass_test "ShellCheck passed"
    else
        warn_test "ShellCheck found issues (non-fatal)"
    fi
else
    warn_test "ShellCheck not installed (skipping)"
fi

# Test 5: Script has required functions
REQUIRED_FUNCTIONS=("check_dependencies" "check_environment" "test_connection" "create_deploy_config" "show_help")
for func in "${REQUIRED_FUNCTIONS[@]}"; do
    if grep -q "^$func()" "$SETUP_SCRIPT"; then
        pass_test "Function exists: $func"
    else
        fail_test "Function missing: $func"
    fi
done

# Test 6: Script has --help flag
if grep -q "\-h|--help" "$SETUP_SCRIPT"; then
    pass_test "Help flag implemented"
else
    fail_test "Help flag not found"
fi

# Test 7: Script has --dry-run flag
if grep -q "\-d|--dry-run" "$SETUP_SCRIPT"; then
    pass_test "Dry-run flag implemented"
else
    fail_test "Dry-run flag not found"
fi

# Test 8: Script has --verbose flag
if grep -q "--verbose" "$SETUP_SCRIPT"; then
    pass_test "Verbose flag implemented"
else
    fail_test "Verbose flag not found"
fi

# Test 9: Script loads .env file
if grep -q "source.*\.env" "$SETUP_SCRIPT"; then
    pass_test "Script loads .env file"
else
    fail_test "Script doesn't load .env file"
fi

# Test 10: No hardcoded API tokens
if grep -q "***REMOVED***" "$SETUP_SCRIPT"; then
    fail_test "Hardcoded API token found (security issue)"
else
    pass_test "No hardcoded API tokens"
fi

# Test 11: Error handling present
if grep -q "set -euo pipefail" "$SETUP_SCRIPT"; then
    pass_test "Proper error handling (set -euo pipefail)"
else
    fail_test "Missing error handling"
fi

# Test 12: Version defined
if grep -q "VERSION=" "$SETUP_SCRIPT"; then
    pass_test "Version number defined"
else
    warn_test "Version number not defined"
fi

# Test 13: Help output works
if DRY_RUN=true "$SETUP_SCRIPT" --help &>/dev/null; then
    pass_test "Help flag works"
else
    warn_test "Help flag may have issues"
fi

# Summary
echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
echo "Tests run:    $TESTS_RUN"
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
else
    echo -e "Tests failed: ${GREEN}$TESTS_FAILED${NC}"
fi
echo ""

# Exit code
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
