# 📊 Comprehensive Monitoring Setup Guide

**Created:** 2025-11-14 02:00:00 UTC
**Uptime Kuma URL:** https://uptime.theprofitplatform.com.au
**Status:** ✅ System Ready - Manual Monitor Addition Required

---

## 🎯 Quick Start

### Access Uptime Kuma
1. Open browser: https://uptime.theprofitplatform.com.au
2. Login or create admin account (first time)
3. Add monitors from the list below

### Why Manual Addition?
Uptime Kuma doesn't have a reliable API for bulk monitor creation. You'll need to add these monitors manually through the web UI. This guide makes it easy with copy-paste ready configurations.

---

## 📋 All Monitors to Configure (25 Total)

### 🌐 Category 1: Critical Web Services (5 monitors)
**Check Interval:** 60 seconds | **Priority:** 🔴 Critical

#### 1. n8n Workflow Automation
```
Type: HTTP(s)
Name: n8n Automation
URL: https://n8n.theprofitplatform.com.au
Interval: 60
Retry: 3
Accepted Status: 200-299
Description: n8n workflow automation platform
```

#### 2. Main Website
```
Type: HTTP(s)
Name: Main Website
URL: https://theprofitplatform.com.au
Interval: 60
Retry: 3
Accepted Status: 200-299
Description: The Profit Platform main website
```

#### 3. Coolify Dashboard
```
Type: HTTP(s)
Name: Coolify Dashboard
URL: https://coolify.theprofitplatform.com.au
Interval: 60
Retry: 3
Accepted Status: 200-299, 302
Description: Coolify deployment management dashboard
```

#### 4. Test Domain
```
Type: HTTP(s)
Name: Test Domain
URL: https://test.theprofitplatform.com.au
Interval: 120
Retry: 2
Accepted Status: 200-299, 404
Description: Testing subdomain
```

#### 5. Qdrant Vector Database
```
Type: HTTP(s)
Name: Qdrant Vector DB
URL: https://qdrant.theprofitplatform.com.au
Interval: 120
Retry: 2
Accepted Status: 200-299
Description: Vector database for AI/ML operations
```

---

### 💾 Category 2: Databases & Storage (4 monitors)
**Check Interval:** 300 seconds (5 min) | **Priority:** 🔴 Critical

#### 6. PostgreSQL Main
```
Type: Port
Name: PostgreSQL (Main)
Hostname: localhost
Port: 5432
Interval: 300
Retry: 2
Description: Main PostgreSQL database server
```

#### 7. PostgreSQL Repair
```
Type: Port
Name: PostgreSQL (Repair)
Hostname: localhost
Port: 5433
Interval: 300
Retry: 2
Description: Repair service PostgreSQL database
```

#### 8. Redis Cache (Main)
```
Type: Port
Name: Redis Cache (Main)
Hostname: localhost
Port: 6379
Interval: 300
Retry: 2
Description: Main Redis cache server
```

#### 9. Redis Repair
```
Type: Port
Name: Redis Cache (Repair)
Hostname: localhost
Port: 6380
Interval: 300
Retry: 2
Description: Repair service Redis cache
```

---

### 🛠️ Category 3: Development & CI/CD Services (9 monitors)
**Check Interval:** 180 seconds (3 min) | **Priority:** 🟡 High

#### 10. Jenkins
```
Type: HTTP(s)
Name: Jenkins CI/CD
URL: http://localhost:8080
Interval: 180
Retry: 2
Accepted Status: 200-299, 302, 403
Description: Jenkins automation and CI/CD server
```

#### 11. FileBrowser
```
Type: Docker
Name: FileBrowser
Container: Check "docker ps" for exact name
Interval: 180
Retry: 2
Description: File management interface
```

#### 12. GlitchTip
```
Type: HTTP(s)
Name: Glitchtip Error Tracking
URL: http://localhost:8001
Interval: 180
Retry: 2
Accepted Status: 200-299, 400
Description: Error tracking and monitoring
```

#### 13. Browserless
```
Type: Docker
Name: Browserless
Container: browserless-u8oc8kccs8kkgwwgwcss844o
Interval: 180
Retry: 2
Description: Headless browser automation service
```

#### 14. AnythingLLM
```
Type: Docker
Name: AnythingLLM
Container: Check container name via docker ps
Interval: 180
Retry: 2
Description: LLM interaction service
```

#### 15. Supabase
```
Type: Docker
Name: Supabase
Container: Check Supabase containers via docker ps
Interval: 180
Retry: 2
Description: Backend as a Service platform
```

#### 16. GitHub Runner 1
```
Type: Docker
Name: GitHub Runner 1
Container: runner-1-vs4o4ogkcgwgwo8kgksg4koo
Interval: 120
Retry: 2
Description: GitHub Actions runner #1
```

#### 17. GitHub Runner 5
```
Type: Docker
Name: GitHub Runner 5
Container: runner-5-vs4o4ogkcgwgwo8kgksg4koo
Interval: 120
Retry: 2
Description: GitHub Actions runner #5
```

#### 18. GitHub Runner Automation
```
Type: Docker
Name: GitHub Runner Automation
Container: runner-automation-vs4o4ogkcgwgwo8kgksg4koo
Interval: 120
Retry: 2
Description: GitHub Actions automation runner
```

---

### 📱 Category 4: SEO & Automation Platform (7 monitors)
**Check Interval:** 180 seconds (3 min) | **Priority:** 🟡 High

#### 19. SEO Dashboard
```
Type: HTTP(s)
Name: SEO Dashboard
URL: http://localhost:9000
Interval: 180
Retry: 2
Accepted Status: 200-299
Description: SEO automation dashboard interface
```

#### 20. Keyword Service
```
Type: Docker
Name: Keyword Service
Container: keyword-service-hw44c4sw8c8o84cgow4s8gog
Interval: 180
Retry: 2
Description: SEO keyword research service
```

#### 21. Mobile API
```
Type: Docker
Name: Mobile API
Container: mobile-api-hw44c4sw8c8o84cgow4s8gog
Interval: 180
Retry: 2
Description: Mobile application API
```

#### 22. SEO Service
```
Type: Docker
Name: SEO Service
Container: seo-service-hw44c4sw8c8o84cgow4s8gog
Interval: 180
Retry: 2
Description: Core SEO analysis service
```

#### 23. MCP Server
```
Type: Docker
Name: MCP Server
Container: mcp-server-hw44c4sw8c8o84cgow4s8gog
Interval: 180
Retry: 2
Description: Model Context Protocol server
```

#### 24. Orchestrator
```
Type: Docker
Name: Orchestrator
Container: orchestrator-hw44c4sw8c8o84cgow4s8gog
Interval: 180
Retry: 2
Description: Service orchestration and coordination
```

#### 25. Database Backup Service
```
Type: Docker
Name: DB Backup Service
Container: db-backup-hw44c4sw8c8o84cgow4s8gog
Interval: 300
Retry: 2
Description: Automated database backup service
```

---

## 🔧 Additional Services (Optional Monitoring)

### TPP Automation
```
Type: HTTP(s)
Name: TPP Automation API
URL: http://localhost:3000
Interval: 180
Retry: 2
Accepted Status: 200-299
Description: Platform automation API
```

### Repair Frontend
```
Type: HTTP(s)
Name: Repair Frontend
URL: http://localhost:3000 (verify port)
Interval: 180
Retry: 2
Accepted Status: 200-299
Description: Mobile repair service frontend
```

---

## 📝 Step-by-Step Setup Instructions

### Step 1: Access Uptime Kuma
1. Open browser to: https://uptime.theprofitplatform.com.au
2. If first time:
   - Create admin account
   - Choose strong password
   - Save credentials securely
3. If returning: Login with credentials

### Step 2: Add Critical Services First
Start with Category 1 (Critical Web Services):
1. Click "+ Add New Monitor" button
2. Select monitor type (HTTP(s), Port, or Docker)
3. Copy configuration from above
4. Paste values into form
5. Click "Save"
6. Verify monitor shows "Up" status
7. Repeat for all 5 critical services

### Step 3: Add Databases
Add Category 2 (Databases & Storage):
- Use "Port" type for PostgreSQL and Redis
- These are critical for data persistence
- Lower check frequency (5 min) to reduce load

### Step 4: Add Development Services
Add Category 3 (Dev & CI/CD):
- Use "Docker" type for most services
- Monitors container health directly
- Includes all GitHub runners

### Step 5: Add SEO Platform
Add Category 4 (SEO & Automation):
- All 7 components of SEO platform
- Mix of HTTP and Docker monitors
- Medium priority but important for operations

### Step 6: Configure Notifications
1. Go to Settings → Notifications
2. Click "Setup Notification"
3. Choose notification type:
   - **Email** (recommended for critical alerts)
   - **Discord/Slack** (real-time team alerts)
   - **Webhook** (custom integrations)
4. Configure and test
5. Apply to all monitors or select specific ones

---

## 🎨 Recommended Organization

### Tags to Use
Create these tags for easy filtering:
- `critical` - Essential services (n8n, Coolify, databases)
- `web` - Web-accessible services
- `database` - All database services
- `ci-cd` - Jenkins and GitHub runners
- `seo` - SEO platform components
- `internal` - Internal-only services

### Groups
Organize monitors into groups:
1. **Production Services** - Critical web services
2. **Data Layer** - Databases and caches
3. **Development Tools** - CI/CD and dev services
4. **SEO Platform** - All SEO components
5. **Infrastructure** - Coolify, monitoring, etc.

---

## 🔔 Notification Strategy

### Alert Levels

**🔴 Critical (Immediate Response)**
- Main website down
- n8n down
- PostgreSQL down
- Redis down
- Notify: Email + Discord/Slack

**🟡 High (Response within 1 hour)**
- GitHub runners down
- Jenkins down
- SEO services down
- Notify: Discord/Slack

**🟢 Medium (Response within 4 hours)**
- FileBrowser down
- Backup services down
- Optional services down
- Notify: Email only

### Notification Settings
```
Critical Services:
- Send immediately on down
- Send recovery notification
- No repeat interval

High Priority:
- Send after 2 failed checks
- Send recovery notification
- Repeat every 30 minutes if still down

Medium Priority:
- Send after 3 failed checks
- Send recovery notification
- No repeat interval
```

---

## 📊 Dashboard Configuration

### Create Status Pages
1. Public Status Page (for clients/users):
   - Include: Main website, n8n, public services
   - Exclude: Internal services, databases

2. Internal Status Page (for team):
   - Include: All monitors
   - Show detailed metrics
   - Add incident history

### Widgets to Add
- Uptime percentage (90 days)
- Response time graph
- Recent incidents timeline
- Services by category

---

## 🔍 Monitor Health Checks

### HTTP/HTTPS Monitors
- **Success**: 2xx status codes (or custom defined)
- **Failure**: 4xx, 5xx, timeout, connection refused
- **Timeout**: 30 seconds default

### Port Monitors
- **Success**: Port accepting connections
- **Failure**: Connection refused, timeout
- **Timeout**: 10 seconds default

### Docker Monitors
- **Success**: Container running (or healthy if health check exists)
- **Failure**: Container stopped, exited, unhealthy
- **Check**: Direct Docker API query

---

## 🛠️ Troubleshooting

### Monitor Shows Down But Service is Up

**Check 1: Verify service is actually running**
```bash
# For HTTP services
curl -I https://n8n.theprofitplatform.com.au

# For ports
nc -zv localhost 5432

# For Docker
docker ps | grep container-name
```

**Check 2: Review accepted status codes**
- Some services return 302 (redirects) - add to accepted codes
- Some return 403 (forbidden) on root path - adjust URL or codes

**Check 3: Adjust retry settings**
- Increase retry count if service is slow to respond
- Increase interval if service has rate limiting

### False Positives

**Issue: Monitor frequently switches between up/down**
- **Solution**: Increase interval (give service more time)
- **Solution**: Increase retry count (more attempts before marking down)
- **Solution**: Adjust timeout (longer timeout for slow services)

### Missing Monitors

**Issue: Can't find container name for Docker monitors**
```bash
# List all containers
docker ps -a

# Find specific service
docker ps | grep service-name
```

---

## 📈 Monitoring Best Practices

### 1. Start Small, Grow Gradually
- ✅ Week 1: Add critical services (5 monitors)
- ✅ Week 2: Add databases and caches (4 monitors)
- ✅ Week 3: Add development services (9 monitors)
- ✅ Week 4: Add SEO platform (7 monitors)

### 2. Fine-tune Over Time
- Monitor for false positives
- Adjust intervals based on service criticality
- Review notification settings weekly

### 3. Regular Maintenance
- Weekly: Review monitor status, address false positives
- Monthly: Backup Uptime Kuma configuration
- Quarterly: Review and update monitor configurations

### 4. Documentation
- Document all custom monitors
- Maintain list of accepted status codes
- Keep track of maintenance windows

---

## 🔐 Security & Backup

### Backup Configuration
1. Go to Settings → Backup
2. Click "Export Backup"
3. Save JSON file with date: `uptime-kuma-backup-2025-11-14.json`
4. Store securely (encrypted cloud storage)

### Automated Backups
```bash
# Add to crontab (daily backup at 2 AM)
0 2 * * * docker exec uptime-kuma-lgocksosco0o8o44s4g8wc0g sqlite3 /app/data/kuma.db ".backup '/app/data/backup.db'" && docker cp uptime-kuma-lgocksosco0o8o44s4g8wc0g:/app/data/backup.db /backups/uptime-kuma-$(date +\%Y\%m\%d).db
```

### Access Control
- Use strong admin password
- Enable 2FA if available
- Limit access to monitoring dashboard
- Use status pages for external visibility

---

## 📱 Mobile Access

### Official/Unofficial Apps
- iOS: "Uptime Kuma Mobile" in App Store
- Android: "Uptime Kuma" in Play Store

### Configuration
```
Server URL: https://uptime.theprofitplatform.com.au
Username: (your admin username)
Password: (your password)
```

### Features
- Real-time status updates
- Push notifications
- Incident acknowledgment
- Quick service checks

---

## 🎯 Success Metrics

### After Setup, You Should Have:
- ✅ 25 monitors configured and running
- ✅ At least 1 notification channel configured
- ✅ Tags/groups for organization
- ✅ Status page created (optional but recommended)
- ✅ First backup exported
- ✅ Mobile app configured (optional)

### Monitor Health Goals:
- **Critical services**: 99.9% uptime
- **High priority**: 99.5% uptime
- **Medium priority**: 99% uptime

---

## 📞 Quick Reference

### Uptime Kuma Access
- **URL**: https://uptime.theprofitplatform.com.au
- **Container**: uptime-kuma-lgocksosco0o8o44s4g8wc0g
- **Data**: /app/data/ (inside container)
- **Database**: kuma.db (SQLite)

### Restart Uptime Kuma
```bash
docker restart uptime-kuma-lgocksosco0o8o44s4g8wc0g
```

### View Logs
```bash
docker logs uptime-kuma-lgocksosco0o8o44s4g8wc0g
```

### Check Status
```bash
docker ps | grep uptime-kuma
```

---

## 📚 Additional Resources

- **Uptime Kuma GitHub**: https://github.com/louislam/uptime-kuma
- **Documentation**: https://github.com/louislam/uptime-kuma/wiki
- **Configuration File**: `/home/avi/projects/coolify/coolify-mcp/uptime-kuma-monitors.json`
- **Setup Scripts**: `/home/avi/projects/coolify/coolify-mcp/setup-uptime-kuma-monitors.sh`

---

## ✅ Setup Checklist

Use this checklist as you configure:

- [ ] Access Uptime Kuma dashboard
- [ ] Create/login to admin account
- [ ] Add 5 critical web service monitors
- [ ] Add 4 database/cache monitors
- [ ] Add 9 development service monitors
- [ ] Add 7 SEO platform monitors
- [ ] Configure at least 1 notification channel
- [ ] Test notifications
- [ ] Create tags for organization
- [ ] Create status page (optional)
- [ ] Export first backup
- [ ] Set up mobile app (optional)
- [ ] Document custom configurations

---

**Last Updated:** 2025-11-14 02:00:00 UTC
**Status:** ✅ Ready for Manual Configuration
**Total Monitors:** 25 (Core) + extras (Optional)

🎉 **Your monitoring system is configured and ready!** Just add the monitors manually through the UI following this guide.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
