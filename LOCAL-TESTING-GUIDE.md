# Local Testing Guide

Complete guide for testing the Coolify MCP Server locally before deploying to production.

## Quick Start

```bash
# 1. Run all tests
./test-local.sh

# 2. Run specific test types
./test-local.sh unit
./test-local.sh integration
./test-local.sh coverage

# 3. Watch mode (auto-rerun on changes)
./test-local.sh watch
```

## Setup

### 1. Environment Files

**For Local Testing (Safe - No Real API Calls)**
```bash
# Uses .env.test (already created)
# Contains mock credentials
# Safe to commit
```

**For Integration Testing (Real API)**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your real Coolify credentials
nano .env
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

## Test Types

### Unit Tests

**What they test:**
- Individual functions and modules
- Input validation
- Error handling
- Business logic

**How to run:**
```bash
./test-local.sh unit
```

**Characteristics:**
- ✅ Fast (< 1 second)
- ✅ No external dependencies
- ✅ Use mocked API responses
- ✅ Safe to run anytime

### Integration Tests

**What they test:**
- Real API connectivity
- End-to-end workflows
- Actual Coolify responses

**How to run:**
```bash
# Requires real Coolify credentials in .env
./test-local.sh integration
```

**Characteristics:**
- ⚠️ Slower (depends on network)
- ⚠️ Requires real Coolify instance
- ⚠️ May affect real resources
- ⚠️ Run carefully in production

### Coverage Tests

**What they show:**
- Code coverage percentage
- Untested code paths
- Branch coverage

**How to run:**
```bash
./test-local.sh coverage
```

**View results:**
```bash
# Terminal output shows summary
# Open detailed HTML report:
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
```

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── fixtures/
│   └── mock-responses.ts       # Mock API data
├── helpers/
│   └── mock-api.ts            # Mock API client
├── unit/
│   ├── api-client.test.ts     # API client tests
│   ├── validation.test.ts     # Input validation tests
│   └── example.test.ts        # Basic examples
└── integration/
    └── api.test.ts            # Real API tests
```

## Writing New Tests

### Unit Test Example

```typescript
// tests/unit/my-feature.test.ts
import { createMockAPI } from '../helpers/mock-api.js';

describe('My Feature', () => {
  let mockAPI;

  beforeEach(() => {
    mockAPI = createMockAPI();
  });

  test('should do something', async () => {
    const result = await mockAPI.someMethod();
    expect(result.status).toBe(200);
  });
});
```

### Integration Test Example

```typescript
// tests/integration/my-integration.test.ts
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const shouldRun = process.env.COOLIFY_BASE_URL &&
                  process.env.COOLIFY_TOKEN;

describe('My Integration', () => {
  (shouldRun ? test : test.skip)('should work', async () => {
    // Real API test here
  });
});
```

## NPM Scripts

```bash
# Run all tests
npm test

# Watch mode (auto-rerun)
npm run test:watch

# Coverage report
npm run test:coverage

# Test API connection
npm run test:api

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Best Practices

### 1. Test Isolation

Each test should be independent:

```typescript
describe('Feature', () => {
  beforeEach(() => {
    // Fresh setup for each test
  });

  afterEach(() => {
    // Cleanup after each test
  });
});
```

### 2. Descriptive Test Names

```typescript
// ❌ Bad
test('it works', () => {});

// ✅ Good
test('should restart application when given valid UUID', () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
test('should calculate total', () => {
  // Arrange
  const items = [10, 20, 30];

  // Act
  const result = calculateTotal(items);

  // Assert
  expect(result).toBe(60);
});
```

### 4. Mock External Dependencies

```typescript
// Use the mock API instead of real HTTP calls
import { createMockAPI } from '../helpers/mock-api.js';

const mockAPI = createMockAPI();
```

### 5. Test Edge Cases

```typescript
describe('Input Validation', () => {
  test('should handle empty string', () => {});
  test('should handle null value', () => {});
  test('should handle undefined', () => {});
  test('should handle special characters', () => {});
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm test
      - run: npm run test:coverage
```

## Debugging Tests

### 1. Run Single Test File

```bash
npm test -- tests/unit/api-client.test.ts
```

### 2. Run Single Test

```bash
npm test -- -t "should authenticate with valid token"
```

### 3. Enable Verbose Output

```bash
npm test -- --verbose
```

### 4. Use Debugger

```typescript
test('debug this test', () => {
  debugger; // Add breakpoint
  const result = myFunction();
  expect(result).toBe(expected);
});
```

Then run:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Common Issues

### Issue: Tests failing with "Cannot find module"

**Solution:**
```bash
npm run build
```

### Issue: "Unexpected token 'export'"

**Solution:**
Make sure jest.config.js has ESM configuration:
```javascript
preset: 'ts-jest/presets/default-esm',
extensionsToTreatAsEsm: ['.ts'],
```

### Issue: Integration tests skipped

**Solution:**
Create `.env` file with real Coolify credentials:
```bash
cp .env.example .env
# Edit .env with real values
```

### Issue: Tests timeout

**Solution:**
Increase timeout in test:
```typescript
test('long running test', async () => {
  // ...
}, 30000); // 30 second timeout
```

## Coverage Goals

Current thresholds (in jest.config.js):
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

Aim for:
- **Unit Tests**: > 80% coverage
- **Integration Tests**: Cover all critical paths
- **Edge Cases**: All error scenarios tested

## Next Steps

1. **Run tests locally**: `./test-local.sh`
2. **Check coverage**: `./test-local.sh coverage`
3. **Add more tests**: Write tests for your tools in `src/tools/`
4. **Set up CI/CD**: Add GitHub Actions workflow
5. **Monitor coverage**: Track coverage over time

## Resources

- [Jest Documentation](https://jestjs.io/)
- [TypeScript Jest Guide](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Questions?** Check the test files in `tests/` for examples!
