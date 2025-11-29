# Contributing to Coolify MCP Server

Thank you for your interest in contributing to the Coolify MCP Server! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Adding New Tools](#adding-new-tools)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report issues responsibly

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20.x)
- npm 9+
- Git
- Access to a Coolify instance (for integration testing)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Theprofitplatform/coolify-mcp-server.git
cd coolify-mcp-server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your Coolify credentials in .env
nano .env

# Build the project
npm run build

# Run tests
npm test

# Start in development mode
npm run dev
```

---

## Development Setup

### Using Docker (Recommended)

```bash
# Start development environment with mock API
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f coolify-mcp

# Stop environment
docker-compose -f docker-compose.dev.yml down
```

### Local Development

```bash
# Install dependencies
npm ci

# Start TypeScript watch mode
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `COOLIFY_BASE_URL` | Yes | Your Coolify instance URL |
| `COOLIFY_TOKEN` | Yes | API token from Coolify |
| `COOLIFY_API_TIMEOUT` | No | Request timeout (default: 60000) |
| `NODE_ENV` | No | Environment mode (development/production) |

---

## Adding New Tools

### Step 1: Create Tool File

Create a new file in the appropriate category under `src/tools/<category>/`:

```typescript
// src/tools/applications/my-new-tool.ts
import { z } from 'zod';
import { BaseTool } from '../base.js';

// Define input schema
const MyNewToolSchema = z.object({
  uuid: z.string().uuid().describe('Application UUID'),
  option: z.string().optional().describe('Optional parameter'),
});

export class MyNewTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'my_new_tool';
  }

  get description(): string {
    return 'Description of what this tool does';
  }

  get inputSchema(): z.ZodSchema {
    return MyNewToolSchema;
  }

  async execute(args: z.infer<typeof MyNewToolSchema>): Promise<string> {
    this.logger.info('Executing my_new_tool', { uuid: args.uuid });

    try {
      const response = await this.apiGet(`/applications/${args.uuid}/something`);
      return JSON.stringify(response.data, null, 2);
    } catch (error) {
      this.logger.error('Failed to execute', error);
      throw error;
    }
  }
}
```

### Step 2: Register the Tool

Add your tool to `src/tools/registry.ts`:

```typescript
import { MyNewTool } from './applications/my-new-tool.js';

// In the tools array:
new MyNewTool(apiClient, version),
```

### Step 3: Add Tests

Create tests in `tests/unit/`:

```typescript
// tests/unit/my-new-tool.test.ts
import { describe, it, expect, jest } from '@jest/globals';
import { MyNewTool } from '../../src/tools/applications/my-new-tool';

describe('MyNewTool', () => {
  const mockClient = {
    get: jest.fn().mockResolvedValue({ data: { success: true } }),
  };

  const tool = new MyNewTool(mockClient);

  it('should have correct name', () => {
    expect(tool.name).toBe('my_new_tool');
  });

  it('should execute successfully', async () => {
    const result = await tool.execute({ uuid: '123e4567-e89b-12d3-a456-426614174000' });
    expect(JSON.parse(result)).toHaveProperty('success');
  });
});
```

### Step 4: Update Documentation

Add your tool to the README.md under the appropriate category.

---

## Code Standards

### TypeScript

- Use strict mode (`strict: true` in tsconfig.json)
- Define proper types for all parameters and return values
- Use Zod schemas for input validation
- Avoid `any` type when possible

### Naming Conventions

- **Tool names**: snake_case (e.g., `deploy_application`)
- **Class names**: PascalCase (e.g., `DeployApplicationTool`)
- **File names**: kebab-case (e.g., `deploy-application.ts`)
- **Variables/functions**: camelCase (e.g., `deployApplication`)

### Error Handling

```typescript
try {
  const result = await this.apiGet('/endpoint');
  return JSON.stringify(result.data, null, 2);
} catch (error) {
  this.logger.error('Operation failed', { error, context: args });
  throw new Error(`Failed to perform operation: ${error.message}`);
}
```

### Logging

Use the built-in Winston logger:

```typescript
this.logger.info('Starting operation', { uuid });
this.logger.debug('Detailed info', { data });
this.logger.warn('Warning condition', { issue });
this.logger.error('Operation failed', { error });
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests (requires Coolify)
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Requirements

- Minimum 70% code coverage for new code
- All new tools must have unit tests
- Integration tests should use mocks when possible
- Security-sensitive code requires security tests

### Writing Good Tests

```typescript
describe('ToolName', () => {
  describe('execute', () => {
    it('should handle valid input', async () => {
      // Test happy path
    });

    it('should validate required parameters', async () => {
      // Test validation
    });

    it('should handle API errors gracefully', async () => {
      // Test error handling
    });
  });
});
```

---

## Pull Request Process

### Before Submitting

1. **Create a feature branch**:
   ```bash
   git checkout -b feat/my-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following the code standards

3. **Run quality checks**:
   ```bash
   npm run lint
   npm run format
   npm test
   npm run build
   ```

4. **Commit with conventional messages**:
   ```bash
   git commit -m "feat: add new tool for X"
   git commit -m "fix: correct validation in Y"
   git commit -m "docs: update README with Z"
   ```

### PR Requirements

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] New features include tests
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities
- [ ] Conventional commit messages

### Review Process

1. Submit PR with clear description
2. CI checks must pass
3. At least one approval required
4. Address review feedback
5. Squash and merge when approved

---

## Security

### Reporting Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security concerns privately
2. Include detailed description
3. Provide steps to reproduce
4. Allow time for fix before disclosure

### Security Guidelines

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Validate all inputs with Zod schemas
- Sanitize outputs to prevent injection
- Follow OWASP best practices

### Code Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation on all parameters
- [ ] SQL injection prevention (if applicable)
- [ ] Command injection prevention
- [ ] Error messages don't leak sensitive info

---

## Questions?

- Open a GitHub issue for questions
- Check existing documentation first
- Be specific about your question
- Include relevant context

Thank you for contributing!
