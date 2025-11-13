# Service Tools Quick Reference

## Overview
Service tools enable management of containerized applications (services) in Coolify through the MCP interface.

## Tools

### 1. list_services
**Purpose:** List all services across the Coolify instance

**Parameters:** None

**Example:**
```json
{}
```

**Returns:** Array of service objects with details including UUID, name, status, server, and configuration

---

### 2. create_service
**Purpose:** Create a new service on a server

**Required Parameters:**
- `name` (string): Unique service name
- `server_uuid` (string): Target server UUID
- `project_uuid` (string): Parent project UUID
- `environment_name` (string): Environment (e.g., "production", "staging")

**Optional Parameters:**
- `description` (string): Service description
- `environment_uuid` (string): Existing environment UUID
- `type` (string): Predefined service type (mysql, redis, postgresql, mongodb, etc.)
- `docker_compose_raw` (string): Custom Docker Compose YAML

**Validation Rules:**
- Must provide EITHER `type` OR `docker_compose_raw` (not both)
- UUIDs must match Coolify format: `^[a-zA-Z0-9]+$`

**Example with Type:**
```json
{
  "name": "mysql-production",
  "description": "Production MySQL database",
  "server_uuid": "sg4gsws44wksg040o4ok80ww",
  "project_uuid": "p4w8gk4s0c8c4o0ksw80ok4w",
  "environment_name": "production",
  "type": "mysql"
}
```

**Example with Docker Compose:**
```json
{
  "name": "custom-nginx",
  "server_uuid": "sg4gsws44wksg040o4ok80ww",
  "project_uuid": "p4w8gk4s0c8c4o0ksw80ok4w",
  "environment_name": "production",
  "docker_compose_raw": "version: '3.8'\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - '80:80'"
}
```

**Returns:** Created service object with UUID

---

### 3. start_service
**Purpose:** Start a stopped service

**Parameters:**
- `uuid` (string, required): Service UUID

**Example:**
```json
{
  "uuid": "s4w8gk4s0c8c4o0ksw80ok4w"
}
```

**Returns:** Operation status

---

### 4. stop_service
**Purpose:** Stop a running service

**Parameters:**
- `uuid` (string, required): Service UUID

**Example:**
```json
{
  "uuid": "s4w8gk4s0c8c4o0ksw80ok4w"
}
```

**Returns:** Operation status

---

### 5. restart_service
**Purpose:** Restart a service (stop then start)

**Parameters:**
- `uuid` (string, required): Service UUID

**Example:**
```json
{
  "uuid": "s4w8gk4s0c8c4o0ksw80ok4w"
}
```

**Returns:** Operation status

---

## Common Workflows

### Workflow 1: Create and Start a MySQL Service
```typescript
// Step 1: List servers to get server_uuid
await callTool('list_servers');

// Step 2: List projects to get project_uuid
await callTool('list_projects');

// Step 3: Create service
const service = await callTool('create_service', {
  name: 'mysql-prod',
  server_uuid: 'sg4gsws44wksg040o4ok80ww',
  project_uuid: 'p4w8gk4s0c8c4o0ksw80ok4w',
  environment_name: 'production',
  type: 'mysql'
});

// Step 4: Start the service
await callTool('start_service', {
  uuid: service.uuid
});
```

### Workflow 2: Create Custom Service with Docker Compose
```typescript
// Step 1: Prepare Docker Compose configuration
const composeConfig = `
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
volumes:
  redis_data:
`;

// Step 2: Create service
const service = await callTool('create_service', {
  name: 'redis-cache',
  server_uuid: 'sg4gsws44wksg040o4ok80ww',
  project_uuid: 'p4w8gk4s0c8c4o0ksw80ok4w',
  environment_name: 'production',
  docker_compose_raw: composeConfig
});

// Step 3: Start the service
await callTool('start_service', { uuid: service.uuid });
```

### Workflow 3: Restart All Services
```typescript
// Step 1: Get all services
const services = await callTool('list_services');

// Step 2: Restart each service
for (const service of services) {
  await callTool('restart_service', {
    uuid: service.uuid
  });
}
```

## API Endpoints

| Tool | Method | Endpoint | Description |
|------|--------|----------|-------------|
| list_services | GET | `/api/v1/services` | List all services |
| create_service | POST | `/api/v1/services` | Create new service |
| start_service | GET | `/api/v1/services/{uuid}/start` | Start service |
| stop_service | GET | `/api/v1/services/{uuid}/stop` | Stop service |
| restart_service | GET | `/api/v1/services/{uuid}/restart` | Restart service |

## Predefined Service Types

Common service types supported by the `type` parameter:
- `mysql` - MySQL database
- `postgresql` - PostgreSQL database
- `mongodb` - MongoDB database
- `redis` - Redis cache
- `mariadb` - MariaDB database
- `memcached` - Memcached
- `elasticsearch` - Elasticsearch
- `rabbitmq` - RabbitMQ message broker
- `minio` - MinIO object storage

(Check Coolify documentation for complete list)

## Error Handling

### Common Errors

**Validation Error: Missing required field**
```
Error: "name" is required
```
**Solution:** Ensure all required fields are provided

**Validation Error: Mutual exclusivity**
```
Error: Either 'type' or 'docker_compose_raw' must be provided, but not both
```
**Solution:** Choose either type OR docker_compose_raw, not both

**Invalid UUID format**
```
Error: UUID must match pattern ^[a-zA-Z0-9]+$
```
**Solution:** Use valid Coolify UUID from list_servers or list_projects

**Service not found**
```
Error: Service not found
```
**Solution:** Verify UUID with list_services

## Related Tools

- `list_servers` - Get available servers for service deployment
- `list_projects` - Get projects for service organization
- `create_environment` - Create environments for service isolation
- `list_applications` - List related applications

## Tips

1. **Always list resources first:** Use list_servers and list_projects before creating services
2. **Use descriptive names:** Service names should be clear and unique
3. **Environment segregation:** Use different environment names for dev/staging/prod
4. **Docker Compose validation:** Validate YAML syntax before submitting docker_compose_raw
5. **Service dependencies:** Some services may depend on others being running first
6. **Resource limits:** Check server resources before deploying resource-intensive services

## Implementation Details

**Base Class:** `BaseTool`
**Schema Validation:** Zod schemas with custom refinements
**Logging:** Winston structured logging
**Error Handling:** Automatic error propagation from BaseTool
**Response Formatting:** JSON formatting via formatResponse method

## File Locations

**Source:**
- Schemas: `src/schemas/service.schemas.ts`
- Tools: `src/tools/services/*.ts`

**Built:**
- Schemas: `build/schemas/service.schemas.js`
- Tools: `build/tools/services/*.js`
