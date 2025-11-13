# 🚀 Phase 4 Plan - Batch Operations

**Status:** 🔄 **IN PROGRESS**
**Date Started:** 2025-11-13
**Estimated Time:** 2-3 hours
**Feature:** Batch Operations for Multi-Resource Management

---

## 🎯 Objective

Implement batch operation tools to manage multiple Coolify resources simultaneously, saving time and reducing repetitive commands.

### Why Batch Operations First?

✅ **Quick Win** - Fastest Phase 4 feature to implement (2-3 hours)
✅ **High Value** - Saves significant time when managing multiple resources
✅ **Builds on Existing** - Leverages our 32 existing tools
✅ **Easy to Test** - Clear success criteria
✅ **Immediate Benefits** - Practical use case from day 1

---

## 📦 Features to Implement

### 1. Batch Restart Applications
**Tool:** `batch_restart_applications`
**Purpose:** Restart multiple applications in one command
**Use Case:** Deploy updates across multiple apps simultaneously

**Input:**
```json
{
  "application_uuids": ["uuid-1", "uuid-2", "uuid-3"],
  "parallel": true,
  "wait_for_completion": false
}
```

**Output:**
```json
{
  "total": 3,
  "successful": 3,
  "failed": 0,
  "results": [
    {"uuid": "uuid-1", "status": "restarted", "name": "app-1"},
    {"uuid": "uuid-2", "status": "restarted", "name": "app-2"},
    {"uuid": "uuid-3", "status": "restarted", "name": "app-3"}
  ]
}
```

---

### 2. Batch Stop Applications
**Tool:** `batch_stop_applications`
**Purpose:** Stop multiple applications at once
**Use Case:** Maintenance mode, cost reduction, testing

**Input:**
```json
{
  "application_uuids": ["uuid-1", "uuid-2"],
  "force": false
}
```

**Output:**
```json
{
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {"uuid": "uuid-1", "status": "stopped", "name": "app-1"},
    {"uuid": "uuid-2", "status": "stopped", "name": "app-2"}
  ]
}
```

---

### 3. Batch Start Services
**Tool:** `batch_start_services`
**Purpose:** Start multiple services simultaneously
**Use Case:** Environment startup, disaster recovery

**Input:**
```json
{
  "service_uuids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Output:**
```json
{
  "total": 3,
  "successful": 3,
  "failed": 0,
  "results": [
    {"uuid": "uuid-1", "status": "started", "name": "service-1"},
    {"uuid": "uuid-2", "status": "started", "name": "service-2"},
    {"uuid": "uuid-3", "status": "started", "name": "service-3"}
  ]
}
```

---

### 4. Batch Update Environment Variables
**Tool:** `batch_update_env_vars`
**Purpose:** Update environment variables across multiple applications
**Use Case:** API key rotation, configuration updates

**Input:**
```json
{
  "application_uuids": ["uuid-1", "uuid-2"],
  "env_vars": {
    "API_KEY": "new-key-value",
    "DATABASE_URL": "new-db-url"
  },
  "restart_after_update": true
}
```

**Output:**
```json
{
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "uuid": "uuid-1",
      "status": "updated",
      "name": "app-1",
      "vars_updated": 2,
      "restarted": true
    },
    {
      "uuid": "uuid-2",
      "status": "updated",
      "name": "app-2",
      "vars_updated": 2,
      "restarted": true
    }
  ]
}
```

---

## 🏗️ Implementation Plan

### Step 1: Create Batch Schemas ✓
**File:** `src/schemas/batch.schemas.ts`

```typescript
export const BatchRestartApplicationsSchema = z.object({
  application_uuids: z.array(commonSchemas.uuid).min(1),
  parallel: z.boolean().default(true),
  wait_for_completion: z.boolean().default(false),
});

export const BatchStopApplicationsSchema = z.object({
  application_uuids: z.array(commonSchemas.uuid).min(1),
  force: z.boolean().default(false),
});

export const BatchStartServicesSchema = z.object({
  service_uuids: z.array(commonSchemas.uuid).min(1),
});

export const BatchUpdateEnvVarsSchema = z.object({
  application_uuids: z.array(commonSchemas.uuid).min(1),
  env_vars: z.record(z.string(), z.string()),
  restart_after_update: z.boolean().default(false),
});
```

### Step 2: Create Batch Tools Directory
**Location:** `src/tools/batch/`

Files to create:
- `batch-restart-applications.ts`
- `batch-stop-applications.ts`
- `batch-start-services.ts`
- `batch-update-env-vars.ts`

### Step 3: Implement Each Tool
Each tool follows the established pattern:
```typescript
export class BatchRestartApplicationsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string { return 'batch_restart_applications'; }
  get description(): string { return 'Restart multiple applications'; }
  get inputSchema(): z.ZodSchema { return BatchRestartApplicationsSchema; }

  async execute(args: z.infer<typeof BatchRestartApplicationsSchema>): Promise<string> {
    this.logger.info('Batch restarting applications', { count: args.application_uuids.length });

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const uuid of args.application_uuids) {
      try {
        await this.apiPatch(`/applications/${uuid}/restart`);
        results.push({ uuid, status: 'restarted' });
        successful++;
      } catch (error) {
        results.push({ uuid, status: 'failed', error: this.formatError(error) });
        failed++;
      }
    }

    return this.formatResponse({
      total: args.application_uuids.length,
      successful,
      failed,
      results,
    });
  }
}
```

### Step 4: Register Tools in Registry
**File:** `src/tools/registry.ts`

Add imports:
```typescript
// Batch operation tools
import { BatchRestartApplicationsTool } from './batch/batch-restart-applications.js';
import { BatchStopApplicationsTool } from './batch/batch-stop-applications.js';
import { BatchStartServicesTool } from './batch/batch-start-services.js';
import { BatchUpdateEnvVarsTool } from './batch/batch-update-env-vars.js';
```

Add to `toolClasses` array:
```typescript
// Batch operations (4)
BatchRestartApplicationsTool,
BatchStopApplicationsTool,
BatchStartServicesTool,
BatchUpdateEnvVarsTool,
```

### Step 5: Build and Test
```bash
npm run build
# Test with actual Coolify instance
```

### Step 6: Documentation
Create `PHASE4-BATCH-OPERATIONS-COMPLETE.md`

---

## 📊 Expected Results

### Tool Count
- Before Phase 4: 32 tools
- After Phase 4: 36 tools (+4 batch operations)

### Code Metrics
- New files: 5 (4 tools + 1 schema)
- Lines of code: ~200 lines
- Build time: ~3 seconds
- Test coverage: Manual testing

### User Benefits
- **Time Savings:** 10x faster for managing multiple resources
- **Error Reduction:** Single command instead of multiple
- **Consistency:** All operations use same credentials/context
- **Efficiency:** Parallel execution where applicable

---

## 🎯 Success Criteria

✅ All 4 batch operation tools implemented
✅ Schemas validate input correctly
✅ Tools registered in ToolRegistry
✅ Build passes with zero errors
✅ Tools handle errors gracefully
✅ Partial success reported correctly (e.g., 3/5 succeeded)
✅ Logging shows clear progress
✅ Documentation complete

---

## 🚧 Implementation Notes

### Error Handling Strategy

**Partial Success:** If 3 out of 5 operations succeed:
```json
{
  "total": 5,
  "successful": 3,
  "failed": 2,
  "results": [
    {"uuid": "1", "status": "success"},
    {"uuid": "2", "status": "success"},
    {"uuid": "3", "status": "failed", "error": "Not found"},
    {"uuid": "4", "status": "success"},
    {"uuid": "5", "status": "failed", "error": "Permission denied"}
  ]
}
```

### Parallel vs Sequential

**Parallel (default):** Fast but uses more resources
**Sequential:** Slower but more predictable

Implement parallel by default, add sequential option later if needed.

### API Considerations

**Coolify API Endpoints Used:**
- `PATCH /applications/{uuid}/restart` - restart application
- `POST /applications/{uuid}/stop` - stop application
- `POST /services/{uuid}/start` - start service
- `POST /services/{uuid}/stop` - stop service
- `POST /applications/{uuid}/envs` - update env vars

**Rate Limiting:** Batch operations may trigger rate limits
- Solution: Add delay between operations if needed
- Fallback: Sequential execution

---

## 🔄 Future Enhancements (Not in this phase)

### Phase 4.1 (Later)
- `batch_deploy_applications` - deploy multiple apps
- `batch_delete_applications` - delete multiple apps (dangerous!)
- `batch_clone_applications` - clone apps with new names

### Phase 4.2 (Later)
- Progress tracking for long-running batch operations
- Webhook notifications on completion
- Scheduled batch operations
- Rollback on batch failure

---

## 📅 Timeline

```
Hour 0-1:  Create schemas + batch tools directory
Hour 1-2:  Implement 4 batch operation tools
Hour 2-3:  Register tools, build, test, document
```

**Current Status:** Starting implementation...

---

**Started:** 2025-11-13
**Target Completion:** 2025-11-13 (same day)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
