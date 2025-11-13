# Application Tools - Code Reference

Quick reference for all implemented application tools.

## Schema File Location
`/home/avi/projects/coolify/coolify-mcp/src/schemas/application.schemas.ts`

## Tool Files Location
`/home/avi/projects/coolify/coolify-mcp/src/tools/applications/`

---

## 1. List Applications Tool

**File**: `list-applications.ts`
**Tool Name**: `list_applications`
**Endpoint**: `GET /resources`

```typescript
import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListApplicationsSchema } from '../../schemas/application.schemas.js';

export class ListApplicationsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_applications';
  }

  get description(): string {
    return 'List all applications across your Coolify instance. Applications are deployable units sourced from Git repositories.';
  }

  get inputSchema(): z.ZodSchema {
    return ListApplicationsSchema;
  }

  async execute(_args: z.infer<typeof ListApplicationsSchema>): Promise<string> {
    this.logger.info('Fetching all applications');
    const resources = await this.apiGet('/resources');
    if (!Array.isArray(resources) || resources.length === 0) {
      return 'No applications found.';
    }
    this.logger.info(`Found ${resources.length} application(s)`);
    return this.formatResponse(resources);
  }
}
```

---

## 2. Create Application Tool

**File**: `create-application.ts`
**Tool Name**: `create_application`
**Endpoint**: `POST /applications`

```typescript
import { z } from 'zod';
import { BaseTool } from '../base.js';
import { CreateApplicationSchema } from '../../schemas/application.schemas.js';

export class CreateApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_application';
  }

  get description(): string {
    return 'Create a new application in Coolify. Applications are deployable units that can be sourced from Git repositories.';
  }

  get inputSchema(): z.ZodSchema {
    return CreateApplicationSchema;
  }

  async execute(args: z.infer<typeof CreateApplicationSchema>): Promise<string> {
    this.logger.info('Creating application', {
      project_uuid: args.project_uuid,
      environment_name: args.environment_name
    });
    const application = await this.apiPost('/applications', args);
    this.logger.info('Application created successfully', { application });
    return this.formatResponse(application);
  }
}
```

---

## 3. Stop Application Tool

**File**: `stop-application.ts`
**Tool Name**: `stop_application`
**Endpoint**: `GET /applications/{uuid}/stop`

```typescript
import { z } from 'zod';
import { BaseTool } from '../base.js';
import { StopApplicationSchema } from '../../schemas/application.schemas.js';

export class StopApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'stop_application';
  }

  get description(): string {
    return 'Stop a running application. This will gracefully shut down the application container.';
  }

  get inputSchema(): z.ZodSchema {
    return StopApplicationSchema;
  }

  async execute(args: z.infer<typeof StopApplicationSchema>): Promise<string> {
    this.logger.info('Stopping application', { uuid: args.uuid });
    const result = await this.apiGet(`/applications/${args.uuid}/stop`);
    this.logger.info('Application stopped successfully', { uuid: args.uuid });
    return this.formatResponse(result);
  }
}
```

---

## 4. Restart Application Tool

**File**: `restart-application.ts`
**Tool Name**: `restart_application`
**Endpoint**: `GET /applications/{uuid}/restart`

```typescript
import { z } from 'zod';
import { BaseTool } from '../base.js';
import { RestartApplicationSchema } from '../../schemas/application.schemas.js';

export class RestartApplicationTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'restart_application';
  }

  get description(): string {
    return 'Restart an application by stopping and starting it again. Useful for applying configuration changes or recovering from issues.';
  }

  get inputSchema(): z.ZodSchema {
    return RestartApplicationSchema;
  }

  async execute(args: z.infer<typeof RestartApplicationSchema>): Promise<string> {
    this.logger.info('Restarting application', { uuid: args.uuid });
    const result = await this.apiGet(`/applications/${args.uuid}/restart`);
    this.logger.info('Application restarted successfully', { uuid: args.uuid });
    return this.formatResponse(result);
  }
}
```

---

## 5. Get Application Logs Tool

**File**: `get-application-logs.ts`
**Tool Name**: `get_application_logs`
**Endpoint**: `GET /applications/{uuid}/logs?lines={lines}`

```typescript
import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetApplicationLogsSchema } from '../../schemas/application.schemas.js';

export class GetApplicationLogsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_application_logs';
  }

  get description(): string {
    return 'Get application logs by UUID. Essential for debugging and monitoring application behavior, errors, and performance issues.';
  }

  get inputSchema(): z.ZodSchema {
    return GetApplicationLogsSchema;
  }

  async execute(args: z.infer<typeof GetApplicationLogsSchema>): Promise<string> {
    this.logger.info('Fetching application logs', {
      uuid: args.uuid,
      lines: args.lines || 100
    });
    const queryParams = args.lines ? `?lines=${args.lines}` : '?lines=100';
    const logs = await this.apiGet(`/applications/${args.uuid}/logs${queryParams}`);
    this.logger.info('Application logs retrieved successfully', { uuid: args.uuid });
    return this.formatResponse(logs);
  }
}
```

---

## Schema Definitions

**File**: `/home/avi/projects/coolify/coolify-mcp/src/schemas/application.schemas.ts`

```typescript
import { z } from 'zod';
import { commonSchemas } from '../utils/validators.js';

export const ListApplicationsSchema = z.object({});

export const CreateApplicationSchema = z.object({
  project_uuid: commonSchemas.uuid,
  environment_name: commonSchemas.nonEmptyString,
  environment_uuid: commonSchemas.uuid.optional(),
  git_repository: z.string().url('Invalid Git repository URL').optional(),
  ports_exposes: z.string().optional(),
  destination_uuid: commonSchemas.uuid,
});

export const StopApplicationSchema = z.object({
  uuid: commonSchemas.uuid,
});

export const RestartApplicationSchema = z.object({
  uuid: commonSchemas.uuid,
});

export const GetApplicationLogsSchema = z.object({
  uuid: commonSchemas.uuid,
  lines: commonSchemas.positiveInteger.default(100).optional(),
});
```

---

## Common Patterns Used

### 1. Tool Structure
```typescript
export class ToolNameTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();  // Always initialize logger
  }

  get name(): string { return 'tool_name'; }
  get description(): string { return 'Tool description'; }
  get inputSchema(): z.ZodSchema { return Schema; }
  
  async execute(args: z.infer<typeof Schema>): Promise<string> {
    this.logger.info('Action description', { args });
    const result = await this.apiGet('/endpoint');
    return this.formatResponse(result);
  }
}
```

### 2. API Calls
- **GET**: `this.apiGet('/endpoint')`
- **POST**: `this.apiPost('/endpoint', data)`
- **GET with params**: `this.apiGet(\`/endpoint/\${id}/action\`)`
- **Query params**: `this.apiGet(\`/endpoint?param=\${value}\`)`

### 3. Validation
- **UUID**: `commonSchemas.uuid`
- **String**: `commonSchemas.nonEmptyString`
- **Number**: `commonSchemas.positiveInteger`
- **URL**: `z.string().url()`
- **Optional**: `.optional()`
- **Default**: `.default(value)`

### 4. Logging
```typescript
this.logger.info('Message', { data });
this.logger.error('Error message', error);
```

### 5. Response Formatting
```typescript
return this.formatResponse(data);  // Handles arrays, objects, strings
```

---

## Quick Commands

```bash
# Build
npm run build

# Lint
npm run lint

# Test (if tests exist)
npm test

# Check compiled files
ls -la build/tools/applications/
ls -la build/schemas/application.schemas.js
```

---

**Reference Date**: 2025-11-13
**Version**: v0.2.0
**Status**: Production Ready
