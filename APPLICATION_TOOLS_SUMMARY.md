# Application Tools Implementation Summary

## Overview
Successfully created application tool schemas and implementations following the established Coolify MCP pattern.

## Files Created

### Schema File
- **Location**: `/home/avi/projects/coolify/coolify-mcp/src/schemas/application.schemas.ts`
- **Schemas**:
  - `ListApplicationsSchema`: Empty object (no parameters required)
  - `CreateApplicationSchema`: Requires project_uuid, environment_name, destination_uuid; Optional: environment_uuid, git_repository, ports_exposes
  - `StopApplicationSchema`: Requires uuid
  - `RestartApplicationSchema`: Requires uuid
  - `GetApplicationLogsSchema`: Requires uuid; Optional: lines (default 100)

### Tool Files (in `/home/avi/projects/coolify/coolify-mcp/src/tools/applications/`)

1. **list-applications.ts**
   - Tool name: `list_applications`
   - Endpoint: GET `/resources` (Note: uses /resources not /applications)
   - Purpose: Retrieves all applications across the Coolify instance

2. **create-application.ts**
   - Tool name: `create_application`
   - Endpoint: POST `/applications`
   - Purpose: Creates a new application with specified configuration

3. **stop-application.ts**
   - Tool name: `stop_application`
   - Endpoint: GET `/applications/{uuid}/stop`
   - Purpose: Gracefully stops a running application

4. **restart-application.ts**
   - Tool name: `restart_application`
   - Endpoint: GET `/applications/{uuid}/restart`
   - Purpose: Restarts an application (stop and start)

5. **get-application-logs.ts**
   - Tool name: `get_application_logs`
   - Endpoint: GET `/applications/{uuid}/logs?lines={lines}`
   - Purpose: Retrieves application logs with optional line limit

## Implementation Details

### Pattern Adherence
All tools follow the established pattern:
- Extend `BaseTool` class
- Initialize logger in constructor using `this.initLogger()`
- Use `commonSchemas.uuid` for UUID validation
- Use `commonSchemas.nonEmptyString` for name validation
- Use `commonSchemas.positiveInteger` for numeric values
- Implement required methods: `name`, `description`, `inputSchema`, `execute`
- Use helper methods: `apiGet()`, `apiPost()`, `formatResponse()`

### Validation
- All schemas use Zod for type-safe validation
- Common schemas imported from `../utils/validators.js`
- UUID format: `^[a-zA-Z0-9]+$`
- Git repository URLs validated using Zod's `.url()` method

### API Endpoints
Following Coolify API v1 specification:
- List: `/resources` (not `/applications` as per API docs)
- Create: `/applications` (POST with body)
- Stop: `/applications/{uuid}/stop` (GET)
- Restart: `/applications/{uuid}/restart` (GET)
- Logs: `/applications/{uuid}/logs?lines={lines}` (GET with query param)

## Build Status
✅ TypeScript compilation successful
✅ All files compiled to `/build/` directory
✅ No syntax or type errors

## Next Steps
The tools are now ready to be:
1. Registered in the tool registry
2. Integrated with the MCP server
3. Tested with actual Coolify instance

## File Locations Summary
```
src/
  schemas/
    application.schemas.ts          (892 bytes)
  tools/
    applications/
      list-applications.ts          (1112 bytes)
      create-application.ts         (1099 bytes)
      stop-application.ts           (982 bytes)
      restart-application.ts        (1044 bytes)
      get-application-logs.ts       (1186 bytes)

build/
  schemas/
    application.schemas.js          (906 bytes)
  tools/
    applications/
      list-applications.js          (1050 bytes)
      create-application.js         (1039 bytes)
      stop-application.js           (908 bytes)
      restart-application.js        (967 bytes)
      get-application-logs.js       (1129 bytes)
```

## Notes
- The `list_applications` tool uses `/resources` endpoint as specified in the API documentation
- Query parameters are properly formatted for the logs endpoint
- All UUID validations use the common schema pattern
- Error handling is inherited from `BaseTool` class
- Logging is consistent with other tools in the codebase
