# Testing Quick Reference

## One-Command Testing

```bash
# Quick test - runs all unit tests (fast, safe)
npm test

# Full test with coverage
npm run test:coverage

# Watch mode (auto-rerun on file changes)
npm run test:watch

# Test script (recommended)
./test-local.sh
```

## Test Types

| Command | What It Tests | Speed | Safe? |
|---------|---------------|-------|-------|
| `./test-local.sh unit` | Unit tests only | ⚡ Fast | ✅ Yes |
| `./test-local.sh integration` | Real API | 🐌 Slow | ⚠️ Careful |
| `./test-local.sh coverage` | All + coverage | ⚡ Fast | ✅ Yes |
| `./test-local.sh watch` | Watch mode | ⚡ Fast | ✅ Yes |

## File Structure

```
tests/
├── setup.ts              # Test environment setup
├── fixtures/             # Mock data
├── helpers/              # Test utilities
├── unit/                 # Unit tests (fast, safe)
└── integration/          # Integration tests (slow, careful)
```

## Writing a Test

```typescript
import { createMockAPI } from '../helpers/mock-api.js';

describe('My Feature', () => {
  test('should do something', async () => {
    // Arrange
    const mockAPI = createMockAPI();

    // Act
    const result = await mockAPI.someMethod();

    // Assert
    expect(result.status).toBe(200);
  });
});
```

## Common Commands

```bash
# Development workflow
npm run build              # Build TypeScript
npm test                   # Run tests
npm run lint              # Check code quality
npm run format            # Format code

# Before committing
npm run build && npm test && npm run lint

# Testing specific files
npm test -- tests/unit/api-client.test.ts

# Testing with pattern
npm test -- -t "should authenticate"

# Verbose output
npm test -- --verbose
```

## Coverage Targets

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Environment Variables

**Unit Tests** (uses `.env.test` - safe defaults)
```bash
COOLIFY_BASE_URL=http://localhost:8000
COOLIFY_TOKEN=test-token-12345
```

**Integration Tests** (uses `.env` - real credentials)
```bash
COOLIFY_BASE_URL=https://coolify.theprofitplatform.com.au
COOLIFY_TOKEN=<your-real-token>
```

## Pre-Commit Checklist

- [ ] `npm run build` - Builds successfully
- [ ] `npm test` - All tests pass
- [ ] `npm run lint` - No lint errors
- [ ] `npm run test:coverage` - Coverage > 70%
- [ ] Manual smoke test if touching critical code

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm run build` |
| "Unexpected token export" | Check jest.config.js |
| Tests timeout | Increase timeout in test |
| Integration tests skip | Add .env with real credentials |

## CI/CD Integration

GitHub Actions will automatically run:
```bash
npm install
npm run build
npm test
npm run test:coverage
```

---

**Need more details?** See [LOCAL-TESTING-GUIDE.md](./LOCAL-TESTING-GUIDE.md)
