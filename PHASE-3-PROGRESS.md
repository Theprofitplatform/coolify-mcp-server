# 🏗️ Phase 3 Progress - Architecture Refactoring

**Date:** 2025-11-13
**Phase:** 3 of 4 (IN PROGRESS)
**Status:** 🟡 **FOUNDATION COMPLETE - MIGRATION IN PROGRESS**

---

## 📊 What We're Building

### Phase 3 Goal: Transform Monolithic Code into Modular Architecture

**Before:** Single 1552-line `index.ts` file with all 45 tools
**After:** Clean, modular architecture with separated concerns

---

## ✅ Completed So Far

### 1. **Zod Validation Library** ✅
```bash
✅ Installed: zod@3.24.3
✅ Zero vulnerabilities
✅ Ready for schema validation
```

### 2. **New Directory Structure** ✅
```
src/
├── tools/                    # Tool implementations
│   ├── base.ts              # ✅ Base tool class
│   ├── registry.ts          # ✅ Tool registry system
│   ├── servers/             # ✅ Server tools (2 migrated)
│   │   ├── list-servers.ts
│   │   └── get-server-resources.ts
│   ├── projects/            # 📋 TODO
│   ├── applications/        # 📋 TODO
│   ├── services/            # 📋 TODO
│   ├── deployments/         # 📋 TODO
│   ├── teams/               # 📋 TODO
│   ├── environments/        # 📋 TODO
│   └── keys/                # 📋 TODO
│
├── schemas/                 # Validation schemas
│   ├── server.schemas.ts    # ✅ Server validation
│   └── [more schemas]       # 📋 TODO
│
├── utils/                   # Utility functions
│   ├── errors.ts            # ✅ Error handling
│   ├── logger.ts            # ✅ Structured logging
│   └── validators.ts        # ✅ Input validation
│
├── types/                   # TypeScript types
│   └── tool.ts              # ✅ Tool interfaces
│
└── index.ts                 # 📋 TODO: Update to use registry
```

### 3. **Core Infrastructure** ✅

#### **Base Tool Class** (`src/tools/base.ts`)
- ✅ Abstract base for all tools
- ✅ Built-in validation
- ✅ Error handling
- ✅ Logging
- ✅ API client methods
- ✅ Feature version checking

**Features:**
```typescript
abstract class BaseTool {
  abstract get name(): string;
  abstract get description(): string;
  abstract get inputSchema(): z.ZodSchema;
  abstract execute(args: any): Promise<string>;

  // Built-in methods:
  - run(args): Validates and executes with error handling
  - apiGet/Post/Put/Delete: HTTP methods with error handling
  - formatResponse: Consistent output formatting
  - isFeatureAvailable: Version checking
}
```

#### **Error Handling** (`src/utils/errors.ts`)
- ✅ CoolifyApiError
- ✅ ValidationError
- ✅ RateLimitError
- ✅ AuthenticationError
- ✅ ResourceNotFoundError
- ✅ handleApiError: Converts Axios errors
- ✅ formatError: User-friendly messages

#### **Logging** (`src/utils/logger.ts`)
- ✅ Structured logging with context
- ✅ Log levels: debug, info, warn, error
- ✅ Timestamp and context tracking
- ✅ DEBUG mode support

#### **Validation** (`src/utils/validators.ts`)
- ✅ Input validation with Zod
- ✅ Common schemas (UUID, URL, IP, port, etc.)
- ✅ Sanitization functions
- ✅ Security helpers

#### **Tool Registry** (`src/tools/registry.ts`)
- ✅ Centralized tool management
- ✅ Auto-registration system
- ✅ Tool lookup and execution
- ✅ Definition generation for MCP

### 4. **Example Tool Implementations** ✅

Two tools fully migrated to demonstrate the pattern:

**List Servers** (`src/tools/servers/list-servers.ts`)
```typescript
export class ListServersTool extends BaseTool {
  get name() { return 'list_servers'; }
  get description() { return '...'; }
  get inputSchema() { return ListServersSchema; }
  async execute(args) {
    const servers = await this.apiGet('/servers');
    return this.formatResponse(servers);
  }
}
```

**Get Server Resources** (`src/tools/servers/get-server-resources.ts`)
```typescript
export class GetServerResourcesTool extends BaseTool {
  get name() { return 'get_server_resources'; }
  get description() { return '...'; }
  get inputSchema() { return GetServerResourcesSchema; }
  async execute(args) {
    const resources = await this.apiGet(
      `/servers/${args.server_uuid}/resources`
    );
    return this.formatResponse(resources);
  }
}
```

### 5. **Validation Schemas** ✅

Server schemas created (`src/schemas/server.schemas.ts`):
- ✅ ListServersSchema
- ✅ GetServerResourcesSchema
- ✅ ValidateServerSchema
- ✅ GetServerDomainsSchema
- ✅ CreateServerSchema

---

## 📋 Remaining Work

### Tool Migration Status

| Category | Tools | Status | Migrated |
|----------|-------|--------|----------|
| **Servers** | 5 | 🟡 In Progress | 2/5 (40%) |
| **Projects** | 3 | ⏳ Pending | 0/3 (0%) |
| **Environments** | 2 | ⏳ Pending | 0/2 (0%) |
| **Services** | 5 | ⏳ Pending | 0/5 (0%) |
| **Applications** | 7 | ⏳ Pending | 0/7 (0%) |
| **Deployments** | 2 | ⏳ Pending | 0/2 (0%) |
| **Teams** | 4 | ⏳ Pending | 0/4 (0%) |
| **Private Keys** | 2 | ⏳ Pending | 0/2 (0%) |
| **Health** | 2 | ⏳ Pending | 0/2 (0%) |
| **TOTAL** | **45** | **4.4% Complete** | **2/45** |

### Remaining Tasks

1. **Migrate Remaining Tools** (43 tools)
   - [ ] Complete server tools (3 remaining)
   - [ ] Projects (3 tools)
   - [ ] Environments (2 tools)
   - [ ] Services (5 tools)
   - [ ] Applications (7 tools)
   - [ ] Deployments (2 tools)
   - [ ] Teams (4 tools)
   - [ ] Private Keys (2 tools)
   - [ ] Health/Version (2 tools)

2. **Create Validation Schemas**
   - [ ] project.schemas.ts
   - [ ] application.schemas.ts
   - [ ] service.schemas.ts
   - [ ] deployment.schemas.ts
   - [ ] team.schemas.ts
   - [ ] environment.schemas.ts
   - [ ] key.schemas.ts
   - [ ] health.schemas.ts

3. **Refactor Main Index**
   - [ ] Update index.ts to use ToolRegistry
   - [ ] Remove old monolithic code
   - [ ] Integrate new architecture
   - [ ] Test with MCP protocol

4. **Update Tests**
   - [ ] Create unit tests for base classes
   - [ ] Test tool registry
   - [ ] Test individual tools
   - [ ] Update integration tests

5. **Documentation**
   - [ ] Complete Phase 3 guide
   - [ ] Update API documentation
   - [ ] Migration examples
   - [ ] Architecture diagrams

---

## 🎯 Benefits of New Architecture

### Before (Monolithic)
```typescript
// Single 1552-line file
class CoolifyServer {
  // All 45 tools defined here
  // Massive switch statement
  // Mixed concerns
  // Hard to test
  // Difficult to maintain
}
```

### After (Modular)
```typescript
// Clean separation
src/tools/servers/list-servers.ts    // ~30 lines
src/tools/servers/create-server.ts   // ~50 lines
src/schemas/server.schemas.ts        // ~20 lines

// Easy to test
test('ListServersTool', () => {
  const tool = new ListServersTool(mockClient);
  expect(await tool.execute({})).toBeDefined();
});

// Easy to maintain
// Easy to extend
// Type-safe with Zod
```

### Advantages

1. **Modularity**
   - One file per tool (easier to find and edit)
   - Clear separation of concerns
   - Reusable components

2. **Testability**
   - Easy to mock dependencies
   - Test tools in isolation
   - Better coverage possible

3. **Type Safety**
   - Zod validation at runtime
   - TypeScript checks at compile time
   - Prevents invalid inputs

4. **Maintainability**
   - Clear code organization
   - Easy to add new tools
   - Simple to modify existing ones

5. **Error Handling**
   - Consistent error messages
   - Centralized error types
   - User-friendly formatting

6. **Logging**
   - Structured logs with context
   - Easy debugging
   - Production-ready

---

## 🚀 How It Works

### Tool Execution Flow

```
1. User Request
   ↓
2. MCP Protocol (index.ts)
   ↓
3. Tool Registry
   ↓
4. BaseTool.run()
   ├── Validate input (Zod)
   ├── Execute tool
   ├── Handle errors
   └── Format response
   ↓
5. Return to user
```

### Example: List Servers

```typescript
// 1. Tool is registered
const registry = new ToolRegistry(apiClient);

// 2. Tool is called
const result = await registry.executeTool('list_servers', {});

// 3. Under the hood:
//    - Registry finds ListServersTool
//    - BaseTool.run() validates input
//    - ListServersTool.execute() fetches data
//    - Response is formatted
//    - Result returned

// 4. User receives formatted server list
```

---

## 📊 Progress Metrics

### Files Created
- ✅ 11 new files
- ✅ Clean directory structure
- ✅ Organized by feature

### Code Quality
- ✅ TypeScript strict mode
- ✅ Zod validation
- ✅ Error handling
- ✅ Structured logging

### Documentation
- ✅ Comprehensive comments
- ✅ Type definitions
- ✅ Usage examples

---

## 🎯 Next Steps

### Immediate (Continue Phase 3)

1. **Migrate More Tools**
   - Complete server tools (3 remaining)
   - Start on projects (3 tools)
   - Then applications (7 tools)

2. **Update Main Index**
   - Integrate ToolRegistry
   - Test with existing tests
   - Ensure backwards compatibility

3. **Testing**
   - Write unit tests for new tools
   - Update integration tests
   - Test coverage reports

### This Week

1. **Complete Tool Migration**
   - All 45 tools in new architecture
   - All schemas created
   - Registry fully populated

2. **Test & Verify**
   - All existing tests passing
   - New tests for new code
   - Integration testing

3. **Documentation**
   - Complete Phase 3 guide
   - Update user documentation
   - Migration notes

---

## 💡 Pattern Template

For anyone adding new tools:

### 1. Create Schema
```typescript
// src/schemas/feature.schemas.ts
import { z } from 'zod';

export const MyToolSchema = z.object({
  param1: z.string(),
  param2: z.number().optional(),
});
```

### 2. Create Tool
```typescript
// src/tools/feature/my-tool.ts
import { BaseTool } from '../base.js';
import { MyToolSchema } from '../../schemas/feature.schemas.js';

export class MyTool extends BaseTool {
  get name() { return 'my_tool'; }
  get description() { return 'Does something useful'; }
  get inputSchema() { return MyToolSchema; }

  async execute(args: z.infer<typeof MyToolSchema>) {
    const result = await this.apiGet('/endpoint');
    return this.formatResponse(result);
  }
}
```

### 3. Register Tool
```typescript
// src/tools/registry.ts
import { MyTool } from './feature/my-tool.js';

// Add to toolClasses array:
const toolClasses = [
  // ...
  MyTool,
];
```

---

## ✅ Phase 3 Checklist

- [x] Install Zod
- [x] Create directory structure
- [x] Build base tool class
- [x] Create error handling utilities
- [x] Create logging utilities
- [x] Create validation utilities
- [x] Build tool registry
- [x] Migrate 2 example tools
- [x] Create server schemas
- [ ] Migrate remaining 43 tools
- [ ] Create all schemas
- [ ] Update main index.ts
- [ ] Update tests
- [ ] Complete documentation
- [ ] Test everything
- [ ] Commit Phase 3

---

## 🎉 Current Status

**Foundation:** ✅ Complete
**Example Tools:** ✅ 2/45 migrated
**Infrastructure:** ✅ Ready for migration
**Next:** Continue migrating tools

**Progress:** 4.4% (2/45 tools)

The foundation is solid and ready. Now it's a matter of systematically migrating the remaining 43 tools using the established pattern.

---

**Want to continue? Say "continue" and I'll migrate more tools!**

*Phase 3 is 10% complete - foundation built, migration in progress.*
