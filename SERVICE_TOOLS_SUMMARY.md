# Service Tools Implementation Summary

## Created Files

### 1. Schema Definitions
**File:** `/home/avi/projects/coolify/coolify-mcp/src/schemas/service.schemas.ts`

Created comprehensive Zod validation schemas for all service operations:
- `ListServicesSchema`: Empty object (no parameters required)
- `CreateServiceSchema`: Full service configuration with validation
  - Required fields: name, server_uuid, project_uuid, environment_name
  - Optional fields: description, environment_uuid, type, docker_compose_raw
  - Custom validation: Enforces that either `type` OR `docker_compose_raw` must be provided (mutually exclusive)
- `StartServiceSchema`: Requires uuid
- `StopServiceSchema`: Requires uuid
- `RestartServiceSchema`: Requires uuid

### 2. Tool Implementations
**Directory:** `/home/avi/projects/coolify/coolify-mcp/src/tools/services/`

Created 5 service management tools following the established BaseTool pattern:

#### a) `list-services.ts`
- **Endpoint:** GET `/api/v1/services`
- **Purpose:** Retrieve all services across the Coolify instance
- **Returns:** Array of service objects or "No services found" message

#### b) `create-service.ts`
- **Endpoint:** POST `/api/v1/services`
- **Purpose:** Create a new containerized service
- **Accepts:** Service configuration (name, server, project, environment, type/compose)
- **Returns:** Created service object

#### c) `start-service.ts`
- **Endpoint:** GET `/api/v1/services/{uuid}/start`
- **Purpose:** Start a stopped service
- **Accepts:** Service UUID
- **Returns:** Operation result

#### d) `stop-service.ts`
- **Endpoint:** GET `/api/v1/services/{uuid}/stop`
- **Purpose:** Stop a running service
- **Accepts:** Service UUID
- **Returns:** Operation result

#### e) `restart-service.ts`
- **Endpoint:** GET `/api/v1/services/{uuid}/restart`
- **Purpose:** Restart a service (stop + start)
- **Accepts:** Service UUID
- **Returns:** Operation result

### 3. Index Export
**File:** `/home/avi/projects/coolify/coolify-mcp/src/tools/services/index.ts`

Central export point for all service tools, enabling clean imports:
```typescript
export { ListServicesTool } from './list-services.js';
export { CreateServiceTool } from './create-service.js';
export { StartServiceTool } from './start-service.js';
export { StopServiceTool } from './stop-service.js';
export { RestartServiceTool } from './restart-service.js';
```

## Implementation Pattern

All tools follow the established architecture:

```typescript
export class ServiceTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string { return 'tool_name'; }
  get description(): string { return 'Description'; }
  get inputSchema(): z.ZodSchema { return Schema; }

  async execute(args: z.infer<typeof Schema>): Promise<string> {
    this.logger.info('Operation', args);
    const result = await this.apiGet/apiPost(...);
    this.logger.info('Operation complete');
    return this.formatResponse(result);
  }
}
```

## Key Features

1. **Type Safety**: Full TypeScript typing with Zod validation
2. **Logging**: Structured logging via Winston for all operations
3. **Error Handling**: Inherited from BaseTool with proper error propagation
4. **Consistent API**: All tools follow same patterns as application tools
5. **Documentation**: Inline JSDoc comments for all tools
6. **UUID Validation**: Uses common validators for Coolify UUID format
7. **Mutual Exclusivity**: CreateServiceSchema enforces type XOR docker_compose_raw

## Build Status

✅ **TypeScript compilation successful**
✅ **All files generated in build/ directory**
✅ **No type errors or warnings**

## File Locations

### Source Files
- Schemas: `/home/avi/projects/coolify/coolify-mcp/src/schemas/service.schemas.ts`
- Tools: `/home/avi/projects/coolify/coolify-mcp/src/tools/services/*.ts`

### Built Files
- Schemas: `/home/avi/projects/coolify/coolify-mcp/build/schemas/service.schemas.js`
- Tools: `/home/avi/projects/coolify/coolify-mcp/build/tools/services/*.js`

## Next Steps

To integrate these tools into the MCP server:

1. Import the service tools in `src/index.ts`:
   ```typescript
   import {
     ListServicesTool,
     CreateServiceTool,
     StartServiceTool,
     StopServiceTool,
     RestartServiceTool
   } from './tools/services/index.js';
   ```

2. Register tools in the tool registry:
   ```typescript
   new ListServicesTool(this.axiosInstance, this.coolifyVersion),
   new CreateServiceTool(this.axiosInstance, this.coolifyVersion),
   new StartServiceTool(this.axiosInstance, this.coolifyVersion),
   new StopServiceTool(this.axiosInstance, this.coolifyVersion),
   new RestartServiceTool(this.axiosInstance, this.coolifyVersion),
   ```

3. Test each tool with actual Coolify API endpoints

## API Endpoint Reference

From `src/index.ts` analysis:

- **List Services:** `GET /services`
- **Create Service:** `POST /services` (with args)
- **Start Service:** `GET /services/{uuid}/start`
- **Stop Service:** `GET /services/{uuid}/stop`
- **Restart Service:** `GET /services/{uuid}/restart`

## Validation Rules

### CreateServiceSchema Validation
- `name`: Non-empty string (required)
- `description`: String (optional)
- `server_uuid`: Valid UUID matching Coolify format (required)
- `project_uuid`: Valid UUID matching Coolify format (required)
- `environment_name`: Non-empty string (required)
- `environment_uuid`: Valid UUID matching Coolify format (optional)
- `type`: String for predefined service types (optional, mutually exclusive with docker_compose_raw)
- `docker_compose_raw`: String for custom Docker Compose config (optional, mutually exclusive with type)

### Lifecycle Operation Schemas
All start/stop/restart operations require only:
- `uuid`: Valid UUID matching Coolify format (required)

## Testing Recommendations

1. **List Services**: Test with empty and populated instances
2. **Create Service**: Test both `type` and `docker_compose_raw` modes
3. **Start/Stop/Restart**: Test with valid and invalid UUIDs
4. **Error Cases**: Verify validation errors are properly formatted
5. **Edge Cases**: Test mutual exclusivity enforcement in CreateServiceSchema
