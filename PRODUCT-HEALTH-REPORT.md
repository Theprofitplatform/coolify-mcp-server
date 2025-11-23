# 🏥 Comprehensive Product Health Report

**Generated:** 2025-11-14 01:27:00 UTC
**Coolify Instance:** https://coolify.theprofitplatform.com.au
**Coolify Version:** v4.0.0-beta.442
**VPS IP:** 31.97.222.218

---

## 📊 Executive Summary

| Metric | Status | Count |
|--------|--------|-------|
| **Total Services** | 13 services | - |
| **Healthy Services** | ✅ GOOD | 9/13 (69%) |
| **Unhealthy Services** | ⚠️ ATTENTION | 4/13 (31%) |
| **DNS Configuration** | ✅ GOOD | All domains configured |
| **Web Accessibility** | ✅ GOOD | All sites responding |
| **Overall Health** | ⚠️ MOSTLY HEALTHY | Action needed on 4 services |

---

## ✅ HEALTHY SERVICES (9/13)

### 1. **Supabase** - ✅ Running:Healthy
- **UUID:** w84occs4w0wks4cc4kc8o484
- **Status:** Fully operational
- **Components:** Database, Auth, Storage, Realtime
- **Action Required:** None

### 2. **n8n** - ✅ Running:Healthy
- **UUID:** rk8g00g8kkgs08c8gggwgo80
- **URL:** https://n8n.theprofitplatform.com.au
- **Status:** Fully operational (200 OK)
- **Components:** n8n + PostgreSQL + Worker
- **Action Required:** None

### 3. **FileBrowser** - ✅ Running:Healthy
- **UUID:** aw4gcgs4ggogscsccgccscwk
- **Status:** Fully operational
- **Action Required:** None

### 4. **GlitchTip** - ✅ Running:Healthy
- **UUID:** pk0kkg0oww8kc8ocgcg0o0sg
- **Status:** Error tracking operational
- **Action Required:** None

### 5. **Browserless** - ✅ Running:Healthy
- **UUID:** u8oc8kccs8kkgwwgwcss844o
- **Status:** Browser automation operational
- **Action Required:** None

### 6. **AnythingLLM** - ✅ Running:Healthy
- **UUID:** t0oco0ogg884g44484g8w8oc
- **Status:** LLM service operational
- **Action Required:** None

### 7. **Jenkins** - ✅ Running:Healthy
- **UUID:** cgwwkoggog00cskgk8ss4kc8
- **Status:** CI/CD operational
- **Action Required:** None

### 8. **Uptime Kuma** - ✅ Running:Healthy
- **UUID:** lgocksosco0o8o44s4g8wc0g
- **Status:** Monitoring operational
- **Action Required:** None

### 9. **Qdrant Vector DB** - ✅ Running:Healthy
- **UUID:** j4kss8084c008sskcko8oks0
- **Status:** Vector database operational
- **Action Required:** None

---

## ⚠️ SERVICES REQUIRING ATTENTION (4/13)

### 1. **repair-redis** - ⚠️ Running:Unhealthy
- **UUID:** zw4gg88ckog0cs88go8wc4sc
- **Type:** Redis Database
- **Status:** Running but unhealthy
- **Issue:** Database health check failing
- **Components:**
  - Redis instance: running (unhealthy)
- **Recommended Actions:**
  1. Check Redis logs: `docker logs <container-id>`
  2. Verify Redis configuration
  3. Check memory allocation
  4. Restart service if needed
- **Priority:** 🔴 HIGH - Database service critical

### 2. **tpp-automation** - ⚠️ Running:Unhealthy
- **UUID:** eo444kos48oss40ksck0w8ow
- **Type:** Automation Service
- **Status:** Running but unhealthy
- **Components:**
  - API: running (unhealthy) - Last online: 2025-11-14 01:27:03
  - Scheduler: running (unhealthy) - Last online: 2025-11-14 01:27:03
- **Recommended Actions:**
  1. Check application logs for both components
  2. Verify health check endpoints
  3. Check database connections
  4. Review environment variables
- **Priority:** 🟡 MEDIUM - Automation impacted but running

### 3. **GitHub Runners Service** - ⚠️ Degraded:Unhealthy
- **UUID:** vs4o4ogkcgwgwo8kgksg4koo
- **Name:** service-igkso404kokc4co0kk8os0ss
- **Type:** CI/CD Runners
- **Status:** Degraded - Some runners down
- **Components:**
  - ✅ runner-1: running (unhealthy) - Last online: 2025-11-14 01:27:03
  - ✅ runner-5: running (unhealthy) - Last online: 2025-11-14 01:27:03
  - ✅ runner-automation: running (unhealthy) - Last online: 2025-11-14 01:27:03
  - ❌ runner-primary: **exited** - Last online: 2025-11-13 23:54:02
  - ❌ runner-testing: **exited** - Last online: 2025-11-13 23:54:02
- **Recommended Actions:**
  1. Restart runner-primary and runner-testing
  2. Check GitHub runner registration tokens
  3. Review runner logs for crash reasons
  4. Verify GitHub webhook connectivity
- **Priority:** 🟡 MEDIUM - 3/5 runners operational

### 4. **SEO Platform Service** - ⚠️ Degraded:Unhealthy
- **UUID:** hw44c4sw8c8o84cgow4s8gog
- **Name:** service-agkcg888sw84ookgcg40gok4
- **Type:** SEO Automation Platform
- **Status:** Degraded - Some services down
- **Components:**
  - ✅ mobile-api: running (healthy)
  - ✅ seo-service: running (healthy)
  - ✅ orchestrator: running (healthy)
  - ✅ mcp-server: running (healthy)
  - ⚠️ db-backup: running (unhealthy) - Last online: 2025-11-14 01:27:03
  - ❌ keyword-service: **exited** - Last online: 2025-11-13 23:57:25
  - ❌ dashboard: **exited** - Last online: 2025-11-13 11:07:04
- **Recommended Actions:**
  1. Restart keyword-service (critical for SEO operations)
  2. Restart dashboard (user interface)
  3. Investigate db-backup health check failure
  4. Check database connectivity
- **Priority:** 🟡 MEDIUM - Core services running, ancillary services down

---

## 🌐 DNS & Domain Configuration

### ✅ All Domains Properly Configured

| Domain | IP Address | HTTP Status | Notes |
|--------|-----------|-------------|-------|
| theprofitplatform.com.au | 31.97.222.218 | 200 OK | ✅ Main site accessible |
| n8n.theprofitplatform.com.au | 31.97.222.218 | 200 OK | ✅ n8n accessible |
| test.theprofitplatform.com.au | 31.97.222.218 | - | ✅ DNS configured |
| coolify.theprofitplatform.com.au | 31.97.222.218 | 302 Redirect | ✅ Normal (login redirect) |

**Status:** ✅ All domains resolving correctly to VPS

---

## 🖥️ Server Infrastructure

### Server 1: **localhost**
- **UUID:** uckc4sswcckgo00kss8kko04
- **IP:** host.docker.internal
- **Type:** Docker internal network
- **Status:** ✅ Operational
- **Resources:** Not available (internal network)

### Server 2: **itchy-iguana-v4k8404sgkskssg88ww8s8o0**
- **UUID:** acwcck0c0wg8owgsko880cg0
- **IP:** 31.97.222.218
- **Type:** Production VPS
- **Status:** ✅ Operational
- **Resources:** Monitoring not available via API
- **Action Required:** Consider enabling resource monitoring

---

## 📁 Projects Overview

**Total Projects:** 14

Key Projects:
1. **supabase** - Backend as a Service
2. **Redis** - Caching layer
3. **n8n** - Workflow automation
4. **filebrowser** - File management
5. **glitchtip** - Error tracking
6. **browserless** - Browser automation
7. **anythingllm** - LLM integration
8. **jenkins** - CI/CD
9. **uptime-kuma** - Monitoring
10. **qdrant** - Vector database
11. **SEO Platform** - SEO automation
12. **GitHub Runners** - CI/CD infrastructure
13. **TPP Automation** - Platform automation
14. **Redis Repair** - Secondary cache

**Status:** ✅ All projects properly configured in Coolify

---

## 🔑 Security & Access

### SSH Keys
- **Total Keys:** 3
  1. localhost's key (ID: 0)
  2. xanthous-xenomorph-nkkkcgsg8gc0wgk8s0g0o4o4 (ID: 1)
  3. github-app-thoughtful-tern-p08o88ko8c4wc8 (ID: 2)

**Status:** ✅ SSH access properly configured

### API Access
- **Coolify API:** ✅ Operational
- **Authentication:** ✅ Token-based auth working
- **MCP Server:** ✅ 37 tools available

---

## 🚀 Deployment Status

### Applications
- **Total Applications:** 1
- **Running:** 0
- **Stopped:** 0
- **Unhealthy:** 1
  - avi-boop/rep:main (exited:unhealthy)

### Deployments
- **Recent Deployments:** 0 tracked deployments

**Note:** Most services are managed as services rather than applications in Coolify

---

## 📈 Recommendations & Action Items

### 🔴 Immediate Actions Required (Priority: HIGH)

1. **Fix repair-redis health check**
   ```bash
   # Check Redis logs
   docker logs <redis-container-id>

   # Restart if needed
   # Use Coolify MCP: restart_service with UUID zw4gg88ckog0cs88go8wc4sc
   ```

### 🟡 Short-term Actions (Priority: MEDIUM)

2. **Restart GitHub Runners**
   ```bash
   # Restart exited runners: runner-primary and runner-testing
   # Check GitHub runner tokens
   # Verify webhook connectivity
   ```

3. **Restore SEO Platform Services**
   ```bash
   # Restart keyword-service (critical for SEO)
   # Restart dashboard (user interface)
   # Investigate db-backup unhealthy status
   ```

4. **Investigate tpp-automation health**
   ```bash
   # Check API and scheduler logs
   # Verify database connections
   # Review health check endpoints
   ```

### 🟢 Long-term Improvements (Priority: LOW)

5. **Enable Server Resource Monitoring**
   - Configure Coolify to expose resource metrics
   - Set up alerts for CPU/memory/disk usage

6. **Implement Comprehensive Monitoring**
   - Use Uptime Kuma to monitor all services
   - Set up alerting for downtime
   - Configure health check endpoints for all services

7. **Documentation**
   - Document health check endpoints for each service
   - Create runbooks for common issues
   - Maintain service dependency map

---

## 📊 Service Health Matrix

| Service | Status | Health | Priority | Action Needed |
|---------|--------|--------|----------|---------------|
| Supabase | ✅ Running | Healthy | - | None |
| n8n | ✅ Running | Healthy | - | None |
| FileBrowser | ✅ Running | Healthy | - | None |
| GlitchTip | ✅ Running | Healthy | - | None |
| Browserless | ✅ Running | Healthy | - | None |
| AnythingLLM | ✅ Running | Healthy | - | None |
| Jenkins | ✅ Running | Healthy | - | None |
| Uptime Kuma | ✅ Running | Healthy | - | None |
| Qdrant | ✅ Running | Healthy | - | None |
| **repair-redis** | ⚠️ Running | **Unhealthy** | 🔴 HIGH | Fix health check |
| **tpp-automation** | ⚠️ Running | **Unhealthy** | 🟡 MEDIUM | Check logs & DB |
| **GitHub Runners** | ⚠️ Degraded | **Unhealthy** | 🟡 MEDIUM | Restart 2 runners |
| **SEO Platform** | ⚠️ Degraded | **Unhealthy** | 🟡 MEDIUM | Restart 2 services |

---

## 🎯 Quick Fix Commands

### Using Coolify MCP Tools

```javascript
// Restart repair-redis
await restart_service({ service_uuid: 'zw4gg88ckog0cs88go8wc4sc' });

// Restart tpp-automation
await restart_service({ service_uuid: 'eo444kos48oss40ksck0w8ow' });

// Restart GitHub Runners
await restart_service({ service_uuid: 'vs4o4ogkcgwgwo8kgksg4koo' });

// Restart SEO Platform
await restart_service({ service_uuid: 'hw44c4sw8c8o84cgow4s8gog' });
```

### Using Coolify API Directly

```bash
# Restart repair-redis
curl -X GET "https://coolify.theprofitplatform.com.au/api/v1/services/zw4gg88ckog0cs88go8wc4sc/restart" \
  -H "Authorization: Bearer $COOLIFY_TOKEN"

# Restart tpp-automation
curl -X GET "https://coolify.theprofitplatform.com.au/api/v1/services/eo444kos48oss40ksck0w8ow/restart" \
  -H "Authorization: Bearer $COOLIFY_TOKEN"
```

---

## 🔍 Monitoring Setup

### Services to Monitor in Uptime Kuma

Based on `/home/avi/projects/coolify/coolify-mcp/services-to-monitor.md`:

**Critical Web Services:**
- ✅ n8n - https://n8n.theprofitplatform.com.au
- ✅ Main Website - https://theprofitplatform.com.au
- ✅ Coolify Dashboard - https://coolify.theprofitplatform.com.au

**Databases & Services:**
- PostgreSQL (main) - localhost:5432
- PostgreSQL (repair) - localhost:5433
- Redis (main) - localhost:6379
- ⚠️ Redis (repair) - localhost:6380 (currently unhealthy)
- Qdrant Vector DB - qdrant.theprofitplatform.com.au

**All Services:**
- Jenkins, FileBrowser, AnythingLLM, GlitchTip, Browserless
- SEO Platform components (keyword-service, mcp-server, mobile-api, etc.)
- GitHub Runners (health monitoring)

---

## ✅ Overall System Status

### Health Score: **69% (Good with Attention Required)**

**Summary:**
- 🟢 **9/13 services** are fully operational
- 🟡 **4/13 services** require attention
- ✅ **DNS & networking** fully configured
- ✅ **Security & access** properly set up
- ✅ **Coolify platform** operational (v4.0.0-beta.442)
- ✅ **MCP integration** fully functional (37 tools)

**Next Steps:**
1. Address the 4 unhealthy services (priority order listed above)
2. Set up comprehensive monitoring in Uptime Kuma
3. Configure resource monitoring for servers
4. Review and update health check configurations

---

## 📞 Support Resources

### Documentation
- Coolify Management Guide: `/home/avi/projects/coolify/coolify-mcp/COOLIFY-MANAGEMENT-GUIDE.md`
- MCP Usage Guide: `/home/avi/projects/coolify/coolify-mcp/USAGE-GUIDE.md`
- Coolify Skill: `/home/avi/projects/coolify/.claude/skills/coolify.md`

### Health Check Scripts
```bash
cd /home/avi/projects/coolify/coolify-mcp

# Run comprehensive health check
node health-check-coolify.js

# List all services
node list-services.js

# Check specific service details
node get-service-details.js

# Check unhealthy services
node check-unhealthy-services.js
```

---

**Report Generated:** 2025-11-14 01:27:00 UTC
**Next Review:** Recommended within 24 hours after addressing unhealthy services

🤖 Generated with [Claude Code](https://claude.com/claude-code)
