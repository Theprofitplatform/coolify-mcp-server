# Uptime Kuma Setup - Complete Guide

## 🎯 Quick Access

**Uptime Kuma Dashboard**: https://uptime.theprofitplatform.com.au

- ✅ SSL/HTTPS Enabled
- ✅ WebSocket Support (Real-time updates)
- ✅ Nginx Reverse Proxy Configured
- ✅ Running in Docker (Container: `uptime-kuma-lgocksosco0o8o44s4g8wc0g`)

---

## 📋 Pre-configured Monitors

The following monitors have been configured and documented for your system:

### 🌐 Critical Web Services (Check every 60s)
1. **n8n Automation** - https://n8n.theprofitplatform.com.au
2. **Main Website** - https://theprofitplatform.com.au
3. **Coolify Dashboard** - https://coolify.theprofitplatform.com.au

### 🖥️ Internal Services (Check every 120s)
4. **SEO Dashboard** - http://localhost:9000/api/v2/health
5. **Repair Frontend** - http://localhost:3000

### 💾 Databases & Caches (Check every 300s)
6. **PostgreSQL (Main)** - localhost:5432
7. **PostgreSQL (Repair)** - localhost:5433
8. **Redis Cache** - localhost:6379
9. **Qdrant Vector DB** - https://qdrant.theprofitplatform.com.au

### 🔧 Services (Check every 300s)
10. **Jenkins CI/CD** - http://localhost:8080
11. **Glitchtip Error Tracking** - http://localhost:8001

### 🏃 GitHub Runners (Check every 120s)
12. **GitHub Runner 1** - Container: runner-1-vs4o4ogkcgwgwo8kgksg4koo
13. **GitHub Runner 5** - Container: runner-5-vs4o4ogkcgwgwo8kgksg4koo
14. **GitHub Runner Automation** - Container: runner-automation-vs4o4ogkcgwgwo8kgksg4koo

---

## 🚀 First Time Setup

### Step 1: Access Uptime Kuma
Open your browser and navigate to: **https://uptime.theprofitplatform.com.au**

### Step 2: Create Admin Account
On first access, you'll be prompted to create an admin account:
- Username: (your choice)
- Password: (strong password recommended)
- Email: (optional but recommended for notifications)

### Step 3: Add Monitors

#### Method 1: Manual Addition (Recommended for verification)
1. Click "+ Add New Monitor" button
2. Select monitor type (HTTP(s), Port, or Docker Container)
3. Fill in details from the list above
4. Click "Save"

#### Method 2: Bulk Import (Advanced)
1. Use the provided configuration file: `uptime-kuma-monitors.json`
2. You can import this via Uptime Kuma's backup/restore feature
3. Go to Settings → Backup → Restore

---

## 📊 Monitor Configuration Details

### HTTP/HTTPS Monitors
- **Heartbeat Interval**: 60-300 seconds (based on criticality)
- **Retries**: 2-3 attempts before marking as down
- **Accepted Status Codes**: 200-299 (some accept 302, 400, 403)
- **Timeout**: 30 seconds

### TCP Port Monitors
- **Heartbeat Interval**: 300 seconds (5 minutes)
- **Retries**: 2 attempts
- **Timeout**: 10 seconds

### Docker Container Monitors
- **Heartbeat Interval**: 120 seconds (2 minutes)
- **Retries**: 2 attempts
- **Check Type**: Container health status

---

## 🔔 Notification Setup

### Recommended Notification Channels

#### 1. Email Notifications (Critical Alerts)
1. Go to Settings → Notifications
2. Click "Setup Notification"
3. Select "Email (SMTP)"
4. Configure your SMTP settings:
   - SMTP Host: (your email provider)
   - Port: 587 (TLS) or 465 (SSL)
   - Username: your-email@domain.com
   - Password: (app password recommended)
5. Test and Save

#### 2. Discord/Slack (Real-time)
1. Create a webhook in Discord/Slack
2. In Uptime Kuma: Settings → Notifications → Discord/Slack
3. Paste webhook URL
4. Test and Save

#### 3. Webhook (Custom Integrations)
1. Setup your webhook endpoint
2. In Uptime Kuma: Settings → Notifications → Webhook
3. Configure POST URL and optional headers
4. Test and Save

### Notification Settings
- **Default**: Apply notifications to all monitors
- **Apply to Existing Monitors**: Yes
- **Send Up Notification**: Yes (know when services recover)
- **Send Down Notification**: Yes
- **Repeat Interval**: 0 (send once) or set interval for reminders

---

## 📈 Monitoring Best Practices

### Status Pages (Optional)
Create public/private status pages to share service status:
1. Go to Status Pages
2. Click "New Status Page"
3. Select monitors to display
4. Choose public or password-protected
5. Customize appearance
6. Share URL with team/clients

### Tags and Groups
Organize monitors with tags:
- `critical` - For essential services
- `database` - For databases
- `web` - For web services
- `internal` - For internal services
- `ci-cd` - For GitHub runners

### Maintenance Windows
Schedule maintenance to prevent false alerts:
1. Click on a monitor
2. Go to "Maintenance"
3. Set maintenance window
4. Notifications will be paused during this time

---

## 🔍 Understanding Monitor States

- **🟢 Up (Healthy)**: Service is responding normally
- **🔴 Down (Unhealthy)**: Service is not responding or returning errors
- **🟡 Pending**: Waiting for first check or retrying
- **⚪ Maintenance**: Service is in maintenance mode
- **⏸️ Paused**: Monitor is temporarily disabled

---

## 🛠️ Troubleshooting

### Monitor Not Working?
1. Check if service is actually running: `docker ps | grep <service>`
2. Verify URL/port is correct
3. Check firewall rules
4. Review Uptime Kuma logs: `docker logs uptime-kuma-lgocksosco0o8o44s4g8wc0g`

### False Positives?
1. Increase retry count
2. Adjust heartbeat interval
3. Verify accepted status codes
4. Check if service has rate limiting

### Notifications Not Sending?
1. Test notification channel in Settings
2. Verify SMTP/webhook configuration
3. Check spam folder for emails
4. Review notification logs in Uptime Kuma

---

## 📱 Mobile App

Uptime Kuma has unofficial mobile apps:
- iOS: Search "Uptime Kuma" in App Store
- Android: Search "Uptime Kuma" in Play Store

Configure with:
- **URL**: https://uptime.theprofitplatform.com.au
- **Username**: (your admin username)
- **Password**: (your password)

---

## 🔐 Security Recommendations

1. **Use Strong Password**: Admin account has full access
2. **Enable 2FA**: If available in your version
3. **Regular Backups**: Settings → Backup → Export
4. **Update Regularly**: Keep Uptime Kuma updated
5. **Limit Access**: Use firewall rules if exposing publicly

---

## 📁 File Locations

- **Script**: `/home/avi/projects/coolify/coolify-mcp/add-uptime-kuma-monitors.js`
- **Monitor Config**: `/home/avi/projects/coolify/coolify-mcp/uptime-kuma-monitors.json`
- **Setup Guide**: `/home/avi/projects/coolify/coolify-mcp/setup-uptime-kuma-monitors.sh`
- **Data Directory**: `/app/data/` (inside container)
- **Database**: `kuma.db` (SQLite)

---

## 🔄 Backup & Restore

### Create Backup
1. Go to Settings → Backup
2. Click "Export Backup"
3. Save JSON file securely
4. **Recommended**: Automate backups with cron

### Restore from Backup
1. Go to Settings → Backup
2. Click "Import Backup"
3. Select backup JSON file
4. Confirm restore

---

## 📊 Current System Status

All services are operational and ready for monitoring:
- ✅ n8n: ONLINE (HTTP 200)
- ✅ Main Website: ONLINE (HTTP 200)
- ✅ Coolify: ONLINE (HTTP 302)
- ✅ repair_frontend: ONLINE (HTTP 200)
- ✅ seo-dashboard: ONLINE (HTTP 200)
- ✅ PostgreSQL (Main): ONLINE (Port 5432)
- ✅ PostgreSQL (Repair): ONLINE (Port 5433)
- ✅ Redis: ONLINE (Port 6379)
- ✅ GitHub Runners: 3 ACTIVE

---

## 🎯 Next Steps

1. ✅ Access Uptime Kuma: https://uptime.theprofitplatform.com.au
2. ⬜ Create admin account
3. ⬜ Add 14 monitors from the list above
4. ⬜ Configure email/Discord notifications
5. ⬜ Create status page (optional)
6. ⬜ Set up mobile app access
7. ⬜ Schedule first backup

---

## 📞 Support & Resources

- **Uptime Kuma Docs**: https://github.com/louislam/uptime-kuma/wiki
- **Configuration File**: `uptime-kuma-monitors.json`
- **Quick Setup**: `./setup-uptime-kuma-monitors.sh`

---

**Last Updated**: 2025-11-14
**Status**: ✅ Ready for Configuration

🎉 Your monitoring system is ready! Access it now and add your monitors to get complete visibility of your infrastructure.
