# AI Agent Troubleshooting Guide - Coolify MCP
**For AI Assistants Using Coolify MCP Server**  
**Version:** 0.2.0  
**Last Updated:** November 16, 2025

---

## 🎯 Purpose

This guide helps AI agents effectively diagnose and resolve Coolify deployment issues using the MCP server and supplementary techniques.

---

## 🚨 Known Limitations (RESOLVED ✅)

### 1. **Deployment Logs Now Accessible via MCP** ✅

**Status:** **FIXED** - Deployment logs are now accessible through MCP tools!

**New Tools Available:**
- `coolify_get_deployment_logs(deployment_uuid, filter_errors?)` - Get detailed deployment logs
- `coolify_get_application_deployment_history(application_uuid, limit?)` - Get deployment history

**How It Works:**
These tools use a database-backed approach since the Coolify API doesn't expose deployment logs via REST endpoints. The tools execute PostgreSQL queries against the Coolify database to retrieve log data.

**Previous Limitation (Historical):**
The original MCP tools couldn't access deployment logs because the Coolify API endpoint `/deployments/{uuid}/logs` doesn't exist. This has been resolved by implementing direct database access within the MCP tools.

---

## 🛠️ Debugging Toolkit

### Level 1: MCP Tools (Complete Debugging) ✅

```javascript
// 1. List all applications to find unhealthy ones
const apps = await coolify_list_applications();
const unhealthy = apps.filter(app => 
  app.status.includes('unhealthy') || 
  app.status.includes('exited') ||
  app.status.includes('failed')
);

// 2. Get application details
const app = await coolify_get_application('app-uuid');
console.log('Status:', app.status);
console.log('Last online:', app.last_online_at);
console.log('Git branch:', app.git_branch);
console.log('Git commit:', app.git_commit_sha);

// 3. Get deployment history ⭐ NEW!
const history = await coolify_get_application_deployment_history('app-uuid', 10);
console.log('Recent deployments:', history.deployments);
console.log('Stats:', history.stats);

// 4. Get detailed logs for failed deployment ⭐ NEW!
const failedDeployment = history.deployments.find(d => d.status === 'failed');
if (failedDeployment) {
  const logs = await coolify_get_deployment_logs(failedDeployment.deployment_uuid, true);
  console.log('Error logs:', logs.logs); // Only errors when filter_errors=true
}

// 5. Check health check configuration
console.log('Health check:', {
  enabled: app.health_check_enabled,
  path: app.health_check_path,
  interval: app.health_check_interval,
  retries: app.health_check_retries,
  timeout: app.health_check_timeout
});
```

**Capability:** This tells you WHAT failed AND WHY! ✅

---

### Level 2: Docker Container Inspection

```bash
# List containers for the application
docker ps -a --format "{{.Names}}\t{{.Status}}" | grep "app-uuid"

# Check if container exists but exited
docker ps -a | grep "app-name"

# View container logs (if container still exists)
docker logs container-name 2>&1 | tail -100

# Inspect container state
docker inspect container-name --format='{{.State.Status}} - {{.State.Error}}'
```

**Use Case:** Identifies if the container started and crashed, or never started.

---

### Level 3: Database Access (Deployment Logs)

**⚠️ CRITICAL TECHNIQUE** - This is the ONLY way to get detailed deployment logs.

#### Step 1: Access Coolify Database

```bash
# Connect to database container
docker exec coolify-db psql -U coolify -d coolify
```

#### Step 2: Find Recent Deployments

```sql
-- List recent deployments
SELECT id, deployment_uuid, status, created_at, updated_at 
FROM application_deployment_queues 
ORDER BY created_at DESC 
LIMIT 10;

-- Find deployments for specific application
SELECT id, deployment_uuid, status, created_at 
FROM application_deployment_queues 
WHERE application_id = 'app-uuid' 
ORDER BY created_at DESC 
LIMIT 5;
```

**Note:** `application_id` is VARCHAR, not INTEGER. Use single quotes.

#### Step 3: Extract Deployment Logs

```sql
-- Get logs for specific deployment (JSON format)
SELECT logs 
FROM application_deployment_queues 
WHERE deployment_uuid = 'deployment-uuid';
```

#### Step 4: Parse JSON Logs

The logs are stored as JSON array. Each entry has:
```json
{
  "command": "docker exec ...",
  "output": "Error message or output",
  "type": "stdout|stderr",
  "timestamp": "2025-11-16T01:05:54.963509Z",
  "hidden": false,
  "batch": 1,
  "order": 1
}
```

**Quick Filter for Errors:**
```bash
docker exec coolify-db psql -U coolify -d coolify -t -c \
  "SELECT logs FROM application_deployment_queues WHERE deployment_uuid = 'xxx';" | \
  python3 -c "
import sys, json
logs = json.loads(sys.stdin.read().strip())
for entry in logs:
    if 'error' in entry.get('type', '').lower() or \
       'error' in entry.get('output', '').lower() or \
       'failed' in entry.get('output', '').lower():
        print(f\"{entry.get('timestamp')}: {entry.get('output')}\")"
```

---

### Level 4: Repository Structure Verification

When Dockerfile-related errors occur, verify the repository structure:

```bash
# Check repository contents via GitHub API
curl -s "https://api.github.com/repos/owner/repo/contents" | \
  jq -r '.[] | "\(.type)\t\(.name)"'

# Find Dockerfiles
curl -s "https://api.github.com/repos/owner/repo/contents" | \
  jq -r '.[] | select(.name | contains("Docker")) | .name'

# Check specific subdirectory
curl -s "https://api.github.com/repos/owner/repo/contents/subdirectory" | \
  jq -r '.[] | .name'
```

---

## 📊 Common Deployment Failure Patterns

### Pattern 1: Git Commit SHA Not Found

**Symptoms:**
```
fatal: couldn't find remote ref 32f10c3
```

**Root Cause:**
- Application config has short commit SHA stored (e.g., `32f10c3`)
- `git clone --depth=1` (shallow clone) doesn't have full history
- Short commit references can't be resolved

**Fix:**
```sql
UPDATE applications 
SET git_commit_sha = 'HEAD' 
WHERE uuid = 'app-uuid';
```

**Then trigger redeployment:**
```javascript
await coolify_start_application('app-uuid', { force_rebuild: true });
```

---

### Pattern 2: Dockerfile Not Found

**Symptoms:**
```
ERROR: failed to read dockerfile: open Dockerfile.production: no such file or directory
```

**Root Cause Options:**

**A) Incorrect Path Configuration**
```sql
-- Check current config
SELECT base_directory, dockerfile_location 
FROM applications 
WHERE uuid = 'app-uuid';

-- Common mistakes:
-- dockerfile_location = '/subdir/Dockerfile' but subdir doesn't exist
-- base_directory = '/app' but should be '/'
```

**B) Dockerfile Uses Wrong Paths**
- Dockerfile tries to COPY from paths that don't exist
- Example: `COPY repair-dashboard/. .` but no `repair-dashboard/` dir exists

**Investigation:**
1. Check repository structure (see Level 4 above)
2. Review Dockerfile COPY statements
3. Verify paths match actual repository layout

**Fix:**
- Update Coolify config if path wrong
- OR update Dockerfile if COPY paths wrong
- OR restructure repository if needed

---

### Pattern 3: NODE_ENV=production Build Failures

**Symptoms:**
```
⚠️ Build-time environment variable warning: NODE_ENV=production
npm install --frozen-lockfile
ERROR: devDependencies not installed
```

**Root Cause:**
- NODE_ENV=production causes npm to skip devDependencies
- TypeScript, webpack, build tools are often devDependencies
- Build fails because tools are missing

**Fix Options:**

**Option A: Change Build-Time NODE_ENV**
```sql
-- In Coolify UI, edit environment variables
-- Set NODE_ENV to "Runtime Only" (not available at build time)
-- Or create separate NODE_ENV for build (value: "development")
```

**Option B: Use Multi-Stage Docker Build**
```dockerfile
# Build stage (can use development mode)
FROM node:18-alpine AS builder
ENV NODE_ENV=development
RUN npm install
RUN npm run build

# Runtime stage (use production mode)
FROM node:18-alpine AS runner
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
```

---

### Pattern 4: Health Check Failures

**Symptoms:**
- Build succeeds
- Container starts
- Status: "exited:unhealthy"
- Container restarts repeatedly

**Root Cause Options:**

**A) Health Check Endpoint Not Implemented**
```javascript
// Application must respond to health check
// Example: /api/health should return 200 OK
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

**B) Health Check Too Aggressive**
```javascript
// Check configuration
const app = await coolify_get_application('app-uuid');
console.log({
  start_period: app.health_check_start_period,  // Time before checks start
  interval: app.health_check_interval,           // Time between checks
  timeout: app.health_check_timeout,             // Max time per check
  retries: app.health_check_retries              // Failed checks before unhealthy
});
```

**Fix:**
- Increase `start_period` if app needs more time to start
- Increase `timeout` if health check endpoint is slow
- Implement proper health check endpoint in application

---

### Pattern 5: Prisma/Database Connection Issues

**Symptoms:**
```
Error: Prisma Client not found
ERROR: Cannot connect to database
```

**Common Causes:**

**A) Prisma Client Not Generated**
```dockerfile
# Missing in Dockerfile:
RUN npx prisma generate

# Should be in build stage:
COPY prisma ./prisma
RUN npx prisma generate
```

**B) Prisma Files Not Copied to Runtime**
```dockerfile
# Build stage
RUN npx prisma generate

# Runtime stage - MUST copy Prisma files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
```

**C) Missing OpenSSL in Alpine Images**
```dockerfile
# Install openssl for Prisma
RUN apk add --no-cache openssl
```

---

## 🔍 Systematic Debugging Process

### Step 1: Identify the Issue

```javascript
// Get application status
const app = await coolify_get_application('app-uuid');

console.log('Quick Status Check:');
console.log('- Current status:', app.status);
console.log('- Last online:', app.last_online_at);
console.log('- Build pack:', app.build_pack);
console.log('- Dockerfile:', app.dockerfile_location);
console.log('- Base dir:', app.base_directory);
console.log('- Health check enabled:', app.health_check_enabled);
```

### Step 2: Trigger a Test Deployment

```javascript
// Start new deployment with force rebuild
const result = await coolify_start_application('app-uuid', {
  force_rebuild: true
});

console.log('Deployment UUID:', result.deployment_uuid);

// Wait for deployment to complete (60-120 seconds typically)
await sleep(90000);
```

### Step 3: Get Deployment Logs

```bash
# Access database and extract logs
docker exec coolify-db psql -U coolify -d coolify -t -c \
  "SELECT logs FROM application_deployment_queues \
   WHERE deployment_uuid = 'deployment-uuid';"
```

### Step 4: Analyze Logs for Patterns

Look for these key indicators:

**Git Clone Issues:**
- `fatal: couldn't find remote ref`
- `Permission denied (publickey)`

**Dockerfile Issues:**
- `failed to read dockerfile`
- `no such file or directory`

**Build Issues:**
- `ERROR: failed to build`
- `npm ERR!`
- `COPY ... not found`

**Runtime Issues:**
- `Error: Cannot find module`
- `ECONNREFUSED`
- `Health check failed`

### Step 5: Apply Targeted Fix

Based on pattern identified, apply appropriate fix from sections above.

### Step 6: Verify Fix

```javascript
// Check new status
const app = await coolify_get_application('app-uuid');
console.log('New status:', app.status);

// Check if container is running
// docker ps | grep app-uuid

// Test application endpoint
// curl https://app-domain.com/api/health
```

---

## 📚 Database Schema Reference

### Key Tables

**applications**
```sql
\d applications

Important columns:
- id (bigint) - Internal ID
- uuid (varchar) - Public identifier
- name (varchar) - Application name
- status (varchar) - Current status
- git_repository (varchar)
- git_branch (varchar)
- git_commit_sha (varchar)
- base_directory (varchar)
- dockerfile_location (varchar)
- build_pack (varchar)
- health_check_enabled (boolean)
- health_check_path (varchar)
```

**application_deployment_queues**
```sql
\d application_deployment_queues

Important columns:
- id (bigint)
- application_id (varchar) - References applications.uuid
- deployment_uuid (varchar) - Unique deployment ID
- status (varchar) - queued|in_progress|finished|failed
- logs (text) - JSON array of log entries
- created_at (timestamp)
- updated_at (timestamp)
- finished_at (timestamp)
```

---

## 💡 Best Practices

### 1. Always Get Deployment UUID

When starting a deployment, save the UUID:

```javascript
const result = await coolify_start_application('app-uuid');
const deploymentUuid = result.deployment_uuid;

// Use this to track and get logs later
console.log('Track deployment:', deploymentUuid);
```

### 2. Wait Appropriately

Different applications take different times to build:

- **Simple static sites:** 30-60 seconds
- **Node.js applications:** 60-120 seconds
- **Full-stack with DB:** 120-180 seconds

```javascript
// Don't check immediately
await sleep(90000); // 90 seconds

// Then check status
```

### 3. Check Multiple Sources

```javascript
// 1. API status
const app = await coolify_get_application('uuid');

// 2. Docker container
// docker ps -a | grep app-name

// 3. Deployment logs
// database query for logs

// 4. Container logs if running
// docker logs container-name
```

### 4. Document Configuration

When you fix an issue, document the configuration:

```javascript
console.log('Working Configuration:');
console.log('- dockerfile_location:', app.dockerfile_location);
console.log('- base_directory:', app.base_directory);
console.log('- git_commit_sha:', app.git_commit_sha);
console.log('- build_pack:', app.build_pack);
```

### 5. Test Locally First

Before debugging in Coolify, try building locally:

```bash
git clone https://github.com/owner/repo
cd repo
docker build -f Dockerfile.production -t test .
docker run -p 3000:3000 test
curl http://localhost:3000/api/health
```

---

## 🚀 Quick Reference Commands

### Database Access
```bash
# Connect
docker exec coolify-db psql -U coolify -d coolify

# List recent deployments
docker exec coolify-db psql -U coolify -d coolify -c \
  "SELECT deployment_uuid, status, created_at FROM application_deployment_queues ORDER BY created_at DESC LIMIT 10;"

# Get specific deployment logs
docker exec coolify-db psql -U coolify -d coolify -t -c \
  "SELECT logs FROM application_deployment_queues WHERE deployment_uuid = 'xxx';"

# Update application config
docker exec coolify-db psql -U coolify -d coolify -c \
  "UPDATE applications SET git_commit_sha = 'HEAD' WHERE uuid = 'xxx';"
```

### Docker Inspection
```bash
# List all containers
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

# Find app containers
docker ps -a | grep "app-uuid"

# Check logs
docker logs container-name 2>&1 | tail -50

# Inspect state
docker inspect container-name --format='{{json .State}}' | jq
```

### GitHub API
```bash
# List repository contents
curl -s "https://api.github.com/repos/owner/repo/contents" | jq

# Check specific file
curl -s "https://api.github.com/repos/owner/repo/contents/Dockerfile" | jq

# Get file content
curl -s "https://api.github.com/repos/owner/repo/contents/path" | \
  jq -r '.content' | base64 -d
```

---

## ⚠️ Important Notes

### 1. MCP Tool Limitations

The current MCP server (v0.2.0) does NOT have:
- `get_deployment_logs(deployment_uuid)` ❌
- `get_application_logs(application_uuid)` ❌
- `get_deployment_history(application_uuid)` ❌

**Recommendation:** Add these tools in future versions.

### 2. Data Type Awareness

```sql
-- ❌ WRONG - will fail
SELECT * FROM application_deployment_queues WHERE application_id = 123;

-- ✅ CORRECT - application_id is VARCHAR
SELECT * FROM application_deployment_queues WHERE application_id = '123';
```

### 3. Log Parsing

Deployment logs are JSON arrays. Each entry can be:
- Hidden debug commands
- Public user-facing messages
- Errors and warnings

Filter by `hidden: false` for user-facing logs.

### 4. Timing Matters

Don't check deployment status too quickly:
- Deployment might not have started yet
- Build might be in progress
- Container might be starting

Wait at least 60-90 seconds before checking.

---

## 📞 Getting Help

### When Stuck:

1. **Extract full deployment logs** and search for error patterns
2. **Check repository structure** matches Dockerfile expectations
3. **Test Docker build locally** to isolate Coolify vs Docker issues
4. **Review this guide** for similar patterns
5. **Document the issue** for future reference

### Useful Resources:

- Coolify API Docs: https://coolify.io/docs/api
- Docker Build Errors: https://docs.docker.com/engine/reference/builder/
- Prisma Docker: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

---

## 🎯 Success Checklist

When deployment works, you should see:
- ✅ Status: `running` (not exited:unhealthy)
- ✅ Container in `docker ps` (not just `docker ps -a`)
- ✅ Health check passing
- ✅ Application accessible at FQDN
- ✅ No restart loops

---

**Last Updated:** November 16, 2025  
**By:** AI Assistant (Droid)  
**Based On:** Real deployment debugging session  
**MCP Version:** 0.2.0
