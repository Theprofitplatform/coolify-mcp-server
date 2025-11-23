# 🔧 Service Recovery Plan

**Created:** 2025-11-14 01:30:00 UTC
**Target:** Fix 4 unhealthy services (13 components)
**Expected Duration:** 30-45 minutes
**Priority:** HIGH to MEDIUM

---

## 📋 Executive Summary

**Services to Fix:**
- 🔴 **HIGH Priority:** 1 service (repair-redis)
- 🟡 **MEDIUM Priority:** 3 services (tpp-automation, GitHub Runners, SEO Platform)

**Total Components Affected:** 13
- 1 Redis database
- 2 automation services
- 5 GitHub runners
- 7 SEO platform components

**Recovery Strategy:** Sequential fix with verification after each service

---

## 🎯 Recovery Approach

### Methodology
1. **Investigate** - Check logs to understand root cause
2. **Fix** - Apply appropriate solution (restart, config fix, etc.)
3. **Verify** - Confirm service is healthy before moving to next
4. **Monitor** - Set up monitoring to prevent recurrence

### Tools We'll Use
- Coolify MCP Server (37 tools available)
- Docker CLI for log inspection
- Coolify API for service management
- Health check scripts

---

## 🔴 PHASE 1: Fix repair-redis (HIGH PRIORITY)

**Service:** repair-redis
**UUID:** zw4gg88ckog0cs88go8wc4sc
**Status:** Running:Unhealthy
**Impact:** Secondary Redis cache unavailable
**Estimated Time:** 5-10 minutes

### Steps

#### 1.1 Investigate
```bash
# Get service details
node get-service-details.js

# Check Redis logs
docker ps | grep redis
docker logs <redis-container-id> --tail 100

# Check Redis connectivity
redis-cli -p 6380 ping  # If accessible
```

**Look for:**
- Connection refused errors
- Memory issues
- Configuration errors
- Port conflicts

#### 1.2 Fix
```bash
# Option A: Restart service (most common fix)
node restart-service.js zw4gg88ckog0cs88go8wc4sc

# Option B: If restart doesn't work, check via Coolify UI
# Navigate to service and check:
# - Environment variables
# - Port mappings
# - Memory limits
# - Health check configuration
```

#### 1.3 Verify
```bash
# Wait 30 seconds then check status
sleep 30
node list-services.js | grep -A 2 "repair-redis"

# Verify Redis is responding
redis-cli -p 6380 ping
```

**Expected Result:** Status should change to "running:healthy"

**Rollback Plan:** If restart fails, document error and move to next service

---

## 🟡 PHASE 2: Fix tpp-automation (MEDIUM PRIORITY)

**Service:** tpp-automation
**UUID:** eo444kos48oss40ksck0w8ow
**Status:** Running:Unhealthy
**Impact:** Platform automation delayed/failing
**Estimated Time:** 10-15 minutes

### Components
1. **API** - running:unhealthy
2. **Scheduler** - running:unhealthy

### Steps

#### 2.1 Investigate API
```bash
# Get detailed service info
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  https://coolify.theprofitplatform.com.au/api/v1/services/eo444kos48oss40ksck0w8ow

# Check API logs
docker ps | grep tpp-automation.*api
docker logs <api-container-id> --tail 100
```

**Look for:**
- Database connection errors
- Missing environment variables
- API endpoint failures
- Authentication issues

#### 2.2 Investigate Scheduler
```bash
# Check scheduler logs
docker ps | grep tpp-automation.*scheduler
docker logs <scheduler-container-id> --tail 100
```

**Look for:**
- Cron job failures
- Database connection errors
- Resource exhaustion
- Task queue issues

#### 2.3 Common Issues & Fixes

**Issue: Database Connection Failed**
```bash
# Verify database service is running
docker ps | grep postgres

# Check connection string in environment variables
# Via Coolify UI: Navigate to service → Environment
```

**Issue: Missing Environment Variables**
```bash
# Check required env vars are set
# Compare with documentation or .env.example
```

#### 2.4 Fix
```bash
# Restart the service
node restart-service.js eo444kos48oss40ksck0w8ow

# Wait for both components to start
sleep 45
```

#### 2.5 Verify
```bash
# Check both components are healthy
node list-services.js | grep -A 3 "tpp-automation"

# Verify API endpoint (if accessible)
curl -I http://localhost:<api-port>/health

# Check scheduler is processing tasks
docker logs <scheduler-container-id> --tail 20
```

**Expected Result:** Both API and Scheduler showing "running:healthy"

**Rollback Plan:** Document errors, check environment variables in Coolify UI

---

## 🟡 PHASE 3: Fix GitHub Runners (MEDIUM PRIORITY)

**Service:** GitHub Runners
**UUID:** vs4o4ogkcgwgwo8kgksg4koo
**Status:** Degraded:Unhealthy
**Impact:** CI/CD pipelines may fail
**Estimated Time:** 10-15 minutes

### Components Status
- ✅ runner-1: running (unhealthy)
- ✅ runner-5: running (unhealthy)
- ✅ runner-automation: running (unhealthy)
- ❌ runner-primary: **EXITED** ⚠️
- ❌ runner-testing: **EXITED** ⚠️

### Steps

#### 3.1 Investigate Failed Runners
```bash
# Check runner-primary logs
docker ps -a | grep runner-primary
docker logs <runner-primary-container-id> --tail 100

# Check runner-testing logs
docker ps -a | grep runner-testing
docker logs <runner-testing-container-id> --tail 100
```

**Look for:**
- GitHub token expiration
- Registration failures
- Network connectivity issues
- Resource limits exceeded
- Runner name conflicts

#### 3.2 Common GitHub Runner Issues

**Issue: Token Expired**
- GitHub runner tokens expire after a period
- Need to regenerate tokens in GitHub repo settings
- Update tokens in Coolify environment variables

**Issue: Runner Already Registered**
- Runner name already exists in GitHub
- Either remove old runner from GitHub or use different name

**Issue: Network Issues**
- Verify GitHub webhook connectivity
- Check firewall rules
- Verify DNS resolution

#### 3.3 Fix
```bash
# Restart the entire service
node restart-service.js vs4o4ogkcgwgwo8kgksg4koo

# This will restart all 5 runners
# Wait 60 seconds for registration
sleep 60
```

#### 3.4 Verify
```bash
# Check all 5 runners
node list-services.js | grep -A 6 "service-igkso404"

# Verify in GitHub
# Go to: GitHub Repository → Settings → Actions → Runners
# Should see all 5 runners as "Active"

# Check runner logs
docker logs <runner-primary-container-id> --tail 20
docker logs <runner-testing-container-id> --tail 20
```

**Expected Result:** All 5 runners showing "running:healthy"

**If Runners Still Unhealthy:**
1. Check GitHub for runner registration status
2. Regenerate runner tokens if expired
3. Update environment variables in Coolify
4. Restart service again

**Rollback Plan:** At least 3 runners should be operational for basic CI/CD

---

## 🟡 PHASE 4: Fix SEO Platform (MEDIUM PRIORITY)

**Service:** SEO Platform
**UUID:** hw44c4sw8c8o84cgow4s8gog
**Status:** Degraded:Unhealthy
**Impact:** SEO automation features unavailable
**Estimated Time:** 10-15 minutes

### Components Status
- ✅ mobile-api: running:healthy
- ✅ seo-service: running:healthy
- ✅ orchestrator: running:healthy
- ✅ mcp-server: running:healthy
- ⚠️ db-backup: running:unhealthy
- ❌ keyword-service: **EXITED** ⚠️
- ❌ dashboard: **EXITED** ⚠️

### Steps

#### 4.1 Investigate keyword-service (Critical)
```bash
# Get service details
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  https://coolify.theprofitplatform.com.au/api/v1/services/hw44c4sw8c8o84cgow4s8gog | jq '.applications[] | select(.name=="keyword-service")'

# Check logs
docker ps -a | grep keyword-service
docker logs <keyword-service-container-id> --tail 100
```

**Look for:**
- Database connection errors
- API key issues
- Memory/resource limits
- Dependency failures (Redis, PostgreSQL)

#### 4.2 Investigate dashboard (User Interface)
```bash
# Check dashboard logs
docker ps -a | grep dashboard
docker logs <dashboard-container-id> --tail 100
```

**Look for:**
- API connection errors
- Port conflicts
- Build failures
- Missing environment variables

#### 4.3 Investigate db-backup (Low Priority)
```bash
# Check db-backup logs
docker ps | grep db-backup
docker logs <db-backup-container-id> --tail 50
```

**Look for:**
- Backup schedule issues
- Storage/permission errors
- Database connection failures

#### 4.4 Common SEO Platform Issues

**Issue: Database Not Ready**
- Services may start before database is ready
- Restart after ensuring dependencies are up

**Issue: API Keys Missing/Invalid**
- Check environment variables for API keys
- Verify keys are valid and not expired

**Issue: Port Conflicts**
- Verify each service has unique port
- Check for port conflicts with other services

#### 4.5 Fix
```bash
# Restart the entire SEO platform service
node restart-service.js hw44c4sw8c8o84cgow4s8gog

# This will restart all 7 components
# Wait 60 seconds for all services to initialize
sleep 60
```

#### 4.6 Verify
```bash
# Check all 7 components
node list-services.js | grep -A 8 "service-agkcg888"

# Verify critical services
# keyword-service (port 5000)
curl -I http://localhost:5000/health

# dashboard (UI - check specific port)
curl -I http://localhost:<dashboard-port>

# Check db-backup is running
docker logs <db-backup-container-id> --tail 10
```

**Expected Result:**
- keyword-service: running:healthy
- dashboard: running:healthy
- db-backup: running:healthy
- All other components remain healthy

**Partial Success Acceptable:**
- As long as keyword-service and core services are up
- db-backup can be investigated separately if still unhealthy

**Rollback Plan:** Core services (mobile-api, seo-service, orchestrator, mcp-server) must remain healthy

---

## ✅ PHASE 5: Final Verification & Monitoring

**Estimated Time:** 5-10 minutes

### Steps

#### 5.1 Run Comprehensive Health Check
```bash
cd /home/avi/projects/coolify/coolify-mcp

# Run full health check
node health-check-coolify.js

# List all services
node list-services.js
```

#### 5.2 Verify Each Fixed Service
```bash
# Create verification script
cat << 'EOF' > verify-all-fixes.js
import 'dotenv/config';

const COOLIFY_BASE_URL = process.env.COOLIFY_BASE_URL;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN;

const FIXED_SERVICES = {
  'repair-redis': 'zw4gg88ckog0cs88go8wc4sc',
  'tpp-automation': 'eo444kos48oss40ksck0w8ow',
  'GitHub Runners': 'vs4o4ogkcgwgwo8kgksg4koo',
  'SEO Platform': 'hw44c4sw8c8o84cgow4s8gog'
};

async function verifyFixes() {
  console.log('\n✅ VERIFICATION REPORT\n');
  console.log('═══════════════════════════════════════\n');

  let allHealthy = true;

  for (const [name, uuid] of Object.entries(FIXED_SERVICES)) {
    console.log(`Checking ${name}...`);

    try {
      const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/services/${uuid}`, {
        headers: { 'Authorization': `Bearer ${COOLIFY_TOKEN}` }
      });

      const service = await response.json();

      // Check overall status
      let healthy = true;
      let unhealthyCount = 0;

      if (service.applications) {
        service.applications.forEach(app => {
          if (app.status.includes('unhealthy') || app.status.includes('exited')) {
            healthy = false;
            unhealthyCount++;
            console.log(`  ⚠️  ${app.name}: ${app.status}`);
          }
        });
      }

      if (service.databases) {
        service.databases.forEach(db => {
          if (db.status.includes('unhealthy') || db.status.includes('exited')) {
            healthy = false;
            unhealthyCount++;
            console.log(`  ⚠️  ${db.name}: ${db.status}`);
          }
        });
      }

      if (healthy) {
        console.log(`  ✅ ${name}: All components healthy`);
      } else {
        console.log(`  ⚠️  ${name}: ${unhealthyCount} unhealthy component(s)`);
        allHealthy = false;
      }

    } catch (error) {
      console.log(`  ❌ ${name}: Error - ${error.message}`);
      allHealthy = false;
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════\n');

  if (allHealthy) {
    console.log('🎉 SUCCESS: All services are healthy!\n');
  } else {
    console.log('⚠️  PARTIAL: Some services still need attention\n');
  }
}

verifyFixes();
EOF

node verify-all-fixes.js
```

#### 5.3 Set Up Monitoring (Uptime Kuma)
```bash
# Service list already created at:
# /home/avi/projects/coolify/coolify-mcp/services-to-monitor.md

# Uptime Kuma setup script exists:
# /home/avi/projects/coolify/coolify-mcp/setup-uptime-kuma-monitors.sh

# Run monitoring setup
./setup-uptime-kuma-monitors.sh
```

#### 5.4 Document Results
```bash
# Create final status report
cat << EOF > SERVICE-RECOVERY-RESULTS.md
# Service Recovery Results

**Date:** $(date)
**Services Fixed:** 4

## Results

### repair-redis
- Status: [HEALTHY/PARTIAL/FAILED]
- Notes: [Any issues encountered]

### tpp-automation
- Status: [HEALTHY/PARTIAL/FAILED]
- Notes: [Any issues encountered]

### GitHub Runners
- Status: [HEALTHY/PARTIAL/FAILED]
- Runners Online: [X/5]
- Notes: [Any issues encountered]

### SEO Platform
- Status: [HEALTHY/PARTIAL/FAILED]
- Components Online: [X/7]
- Notes: [Any issues encountered]

## Next Steps
[List any remaining issues or follow-up actions]

EOF
```

---

## 🚨 Troubleshooting Guide

### If a Service Won't Start

**1. Check Dependencies**
```bash
# Ensure dependent services are running
docker ps | grep postgres
docker ps | grep redis
```

**2. Check Resource Usage**
```bash
# Check if server is out of resources
docker stats --no-stream
df -h
free -h
```

**3. Check for Port Conflicts**
```bash
# See what's using ports
netstat -tulpn | grep LISTEN
```

**4. Check Environment Variables**
- Navigate to service in Coolify UI
- Go to Environment tab
- Verify all required variables are set

**5. Check Logs in Real-Time**
```bash
# Follow logs as service starts
docker logs -f <container-id>
```

### If Restart Doesn't Fix It

**Option A: Stop then Start**
```bash
# Stop service
curl -X GET "https://coolify.theprofitplatform.com.au/api/v1/services/${UUID}/stop" \
  -H "Authorization: Bearer $COOLIFY_TOKEN"

# Wait 30 seconds
sleep 30

# Start service
curl -X GET "https://coolify.theprofitplatform.com.au/api/v1/services/${UUID}/start" \
  -H "Authorization: Bearer $COOLIFY_TOKEN"
```

**Option B: Rebuild Service**
- Navigate to service in Coolify UI
- Check for "Rebuild" or "Redeploy" option
- This may be needed if configuration changed

**Option C: Check Service Definition**
- Verify docker-compose.yml or service configuration
- Check image tags are valid
- Verify volume mounts exist

---

## 📊 Success Criteria

### Minimum Success (Acceptable)
- ✅ repair-redis: healthy OR documented as non-critical
- ✅ tpp-automation: at least API healthy
- ✅ GitHub Runners: at least 3/5 runners healthy
- ✅ SEO Platform: keyword-service + core services healthy

### Full Success (Target)
- ✅ All 4 services showing "running:healthy"
- ✅ All components within each service healthy
- ✅ No exited containers
- ✅ Monitoring configured

### Metrics
- **Before:** 9/13 services healthy (69%)
- **Target:** 13/13 services healthy (100%)
- **Minimum:** 12/13 services healthy (92%)

---

## 📝 Post-Recovery Tasks

### Immediate (After Recovery)
1. ✅ Run final health check
2. ✅ Document any persistent issues
3. ✅ Set up monitoring in Uptime Kuma
4. ✅ Create SERVICE-RECOVERY-RESULTS.md

### Short-term (Within 24 hours)
1. Monitor services for stability
2. Review logs for recurring errors
3. Optimize health check configurations
4. Update documentation with lessons learned

### Long-term (Within 1 week)
1. Implement automated health checks
2. Set up alerting for service failures
3. Create runbooks for common issues
4. Review and optimize resource allocation

---

## 🔗 Quick Reference

### Service UUIDs
```bash
REPAIR_REDIS="zw4gg88ckog0cs88go8wc4sc"
TPP_AUTOMATION="eo444kos48oss40ksck0w8ow"
GITHUB_RUNNERS="vs4o4ogkcgwgwo8kgksg4koo"
SEO_PLATFORM="hw44c4sw8c8o84cgow4s8gog"
```

### Restart Commands
```bash
# Restart repair-redis
node restart-service.js zw4gg88ckog0cs88go8wc4sc

# Restart tpp-automation
node restart-service.js eo444kos48oss40ksck0w8ow

# Restart GitHub Runners
node restart-service.js vs4o4ogkcgwgwo8kgksg4koo

# Restart SEO Platform
node restart-service.js hw44c4sw8c8o84cgow4s8gog
```

### Health Check Commands
```bash
# Comprehensive health check
node health-check-coolify.js

# List all services
node list-services.js

# Check specific service
node get-service-details.js

# Check unhealthy services
node check-unhealthy-services.js
```

---

## ✅ Execution Checklist

Use this checklist during recovery:

- [ ] **Phase 1: repair-redis**
  - [ ] Investigate logs
  - [ ] Restart service
  - [ ] Verify healthy status

- [ ] **Phase 2: tpp-automation**
  - [ ] Check API logs
  - [ ] Check Scheduler logs
  - [ ] Verify database connectivity
  - [ ] Restart service
  - [ ] Verify both components healthy

- [ ] **Phase 3: GitHub Runners**
  - [ ] Check failed runner logs
  - [ ] Verify GitHub tokens
  - [ ] Restart service
  - [ ] Verify all 5 runners (minimum 3)

- [ ] **Phase 4: SEO Platform**
  - [ ] Check keyword-service logs
  - [ ] Check dashboard logs
  - [ ] Check db-backup status
  - [ ] Restart service
  - [ ] Verify critical components healthy

- [ ] **Phase 5: Verification**
  - [ ] Run comprehensive health check
  - [ ] Verify each fixed service
  - [ ] Set up Uptime Kuma monitoring
  - [ ] Document results

---

**Plan Created:** 2025-11-14 01:30:00 UTC
**Status:** Ready for execution
**Expected Completion:** 30-45 minutes

🤖 Generated with [Claude Code](https://claude.com/claude-code)
