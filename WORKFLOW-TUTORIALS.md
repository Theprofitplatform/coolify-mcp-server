# 🎯 Coolify MCP Workflow Tutorials

**Complete step-by-step tutorials for common workflows.**

---

## 📖 Table of Contents

1. [Deploy Full-Stack Application](#1-deploy-full-stack-application)
2. [Set Up Production Environment](#2-set-up-production-environment)
3. [Configure Monitoring & Alerts](#3-configure-monitoring--alerts)
4. [Implement CI/CD Pipeline](#4-implement-cicd-pipeline)
5. [Database Migration Workflow](#5-database-migration-workflow)
6. [Team Onboarding](#6-team-onboarding)
7. [Disaster Recovery](#7-disaster-recovery)
8. [Performance Optimization](#8-performance-optimization)

---

## 1. Deploy Full-Stack Application

**Goal**: Deploy a complete application with frontend, backend, database, and Redis.

### Step 1: Create Project & Environment

```bash
# Create project
create_project \
  --name "MyApp" \
  --description "Full-stack application"

# Create production environment
create_environment \
  --project-uuid "proj-123" \
  --name "production"
```

### Step 2: Create Database

```bash
# Create PostgreSQL database
create_database \
  --name "myapp-db" \
  --type "postgresql" \
  --version "16" \
  --project-uuid "proj-123" \
  --environment-name "production" \
  --server-uuid "srv-456"

# Configure database
update_database \
  --uuid "db-123" \
  --postgres-password "secure-password" \
  --postgres-db "myapp_prod"

# Start database
start_database --uuid "db-123"

# Verify running
get_database --uuid "db-123"
```

### Step 3: Create Redis Service

```bash
# Create Redis service
create_service \
  --name "myapp-redis" \
  --type "redis" \
  --server-uuid "srv-456" \
  --project-uuid "proj-123" \
  --environment-name "production"

# Start Redis
start_service --uuid "redis-789"
```

### Step 4: Deploy Backend API

```bash
# Create backend application
create_application \
  --name "MyApp API" \
  --project-uuid "proj-123" \
  --environment-name "production" \
  --server-uuid "srv-456" \
  --git-repository "https://github.com/user/myapp-api" \
  --git-branch "main"

# Configure environment variables
update_application_environment_variables \
  --uuid "backend-123" \
  --env-vars '{
    "DATABASE_URL": "postgresql://user:pass@db:5432/myapp_prod",
    "REDIS_URL": "redis://redis:6379",
    "NODE_ENV": "production",
    "API_PORT": "3000"
  }'

# Add custom domain
update_application_domains \
  --uuid "backend-123" \
  --domains '["api.myapp.com"]'

# Generate SSL
generate_ssl_certificate \
  --domain "api.myapp.com" \
  --email "admin@myapp.com"

# Deploy
deploy_application --uuid "backend-123"

# Monitor deployment
get_deployment --uuid "deploy-xyz"
get_deployment_logs --uuid "deploy-xyz"
```

### Step 5: Deploy Frontend

```bash
# Create frontend application
create_application \
  --name "MyApp Frontend" \
  --project-uuid "proj-123" \
  --environment-name "production" \
  --server-uuid "srv-456" \
  --git-repository "https://github.com/user/myapp-web" \
  --git-branch "main"

# Configure build settings
update_deployment_settings \
  --uuid "frontend-456" \
  --build-pack "nixpacks" \
  --install-command "npm ci" \
  --build-command "npm run build" \
  --start-command "npm start"

# Set environment variables
update_application_environment_variables \
  --uuid "frontend-456" \
  --env-vars '{
    "NEXT_PUBLIC_API_URL": "https://api.myapp.com",
    "NODE_ENV": "production"
  }'

# Add domain + SSL
update_application_domains \
  --uuid "frontend-456" \
  --domains '["myapp.com", "www.myapp.com"]'

generate_ssl_certificate \
  --domain "myapp.com" \
  --email "admin@myapp.com"

# Deploy
deploy_application --uuid "frontend-456"
```

### Step 6: Tag & Organize

```bash
# Tag all production resources
tag_resource --resource-type "application" --resource-uuid "backend-123" --tags '["production", "api"]'
tag_resource --resource-type "application" --resource-uuid "frontend-456" --tags '["production", "web"]'
tag_resource --resource-type "database" --resource-uuid "db-123" --tags '["production", "postgres"]'
tag_resource --resource-type "service" --resource-uuid "redis-789" --tags '["production", "cache"]'

# View all production resources
list_resources_by_tag --tag "production"
```

### Step 7: Verify Everything

```bash
# Check all resources
get_application --uuid "backend-123"
get_application --uuid "frontend-456"
get_database --uuid "db-123"
get_service --uuid "redis-789"

# Check SSL certificates
list_ssl_certificates

# View logs
get_application_logs --uuid "backend-123"
get_application_logs --uuid "frontend-456"
```

**✅ Result**: Complete full-stack application deployed with SSL, monitoring, and organization!

---

## 2. Set Up Production Environment

**Goal**: Configure a production-ready environment with monitoring, backups, and security.

### Step 1: Server Setup

```bash
# View server details
get_server --uuid "srv-456"

# Update server settings
update_server_settings \
  --uuid "srv-456" \
  --cleanup-after-days 7 \
  --concurrent-builds 3 \
  --unreachable-notification-delay 5

# Check server metrics
get_server_metrics --uuid "srv-456"
```

### Step 2: Notification Channels

```bash
# Create Discord channel
create_notification_channel \
  --name "Production Alerts" \
  --type "discord" \
  --webhook-url "https://discord.com/api/webhooks/..."

# Create Email channel
create_notification_channel \
  --name "Email Alerts" \
  --type "email" \
  --email-address "team@company.com"

# Configure notification settings
update_notification_settings \
  --deployment-success false \
  --deployment-failure true \
  --server-unreachable true \
  --disk-usage-threshold 85 \
  --memory-usage-threshold 90

# Test notifications
test_notification_channel --uuid "notif-123"
```

### Step 3: Webhook Integration

```bash
# Create webhook for Datadog
create_webhook \
  --name "Datadog Monitoring" \
  --url "https://webhook-intake.datadoghq.com/..." \
  --resource-type "application" \
  --resource-uuid "app-123" \
  --events '["deployment_started", "deployment_finished", "deployment_failed"]'

# Create webhook for Slack
create_webhook \
  --name "Slack Deployments" \
  --url "https://hooks.slack.com/..." \
  --resource-type "application" \
  --resource-uuid "app-123" \
  --events '["deployment_finished", "deployment_failed"]'
```

### Step 4: Database Backups

```bash
# Create backup for main database
backup_database \
  --uuid "db-123" \
  --destination "s3"

# Set up automated backups
# (Configure in Coolify UI or via API if available)
```

### Step 5: Security Configuration

```bash
# Get current security settings
get_security_settings

# Update security settings
update_security_settings \
  --allowed-ips '["1.2.3.4", "5.6.7.8"]' \
  --force-https true

# Create API token for CI/CD
create_api_token \
  --name "CI/CD Pipeline" \
  --permissions '["read", "write", "deploy"]' \
  --expires-at "2026-12-31"

# List all API tokens
list_api_tokens
```

### Step 6: Volume Management

```bash
# Create persistent volume for uploads
create_volume \
  --name "app-uploads" \
  --server-uuid "srv-456"

# Create volume for logs
create_volume \
  --name "app-logs" \
  --server-uuid "srv-456"

# List all volumes
list_volumes --server-uuid "srv-456"
```

### Step 7: Monitoring Dashboard

```bash
# Get system status
get_system_status

# Get server resources
get_server_resources --uuid "srv-456"

# Get server logs
get_server_logs --uuid "srv-456" --lines 500

# Monitor specific application
get_application_logs --uuid "app-123" --lines 1000
```

**✅ Result**: Production environment with monitoring, backups, security, and alerts!

---

## 3. Configure Monitoring & Alerts

**Goal**: Set up comprehensive monitoring for all resources.

### Step 1: Create Notification Channels

```bash
# Discord for urgent alerts
create_notification_channel \
  --name "Urgent Alerts" \
  --type "discord" \
  --webhook-url "https://discord.com/api/webhooks/urgent"

# Slack for general notifications
create_notification_channel \
  --name "General Notifications" \
  --type "slack" \
  --webhook-url "https://hooks.slack.com/services/..."

# Email for critical issues
create_notification_channel \
  --name "Critical Issues" \
  --type "email" \
  --email-address "oncall@company.com"

# Telegram for mobile alerts
create_notification_channel \
  --name "Mobile Alerts" \
  --type "telegram" \
  --bot-token "your-bot-token" \
  --chat-id "your-chat-id"
```

### Step 2: Configure Alert Rules

```bash
# Configure deployment alerts
update_notification_settings \
  --deployment-success false \
  --deployment-failure true \
  --server-unreachable true \
  --disk-usage-threshold 80 \
  --memory-usage-threshold 85 \
  --cpu-usage-threshold 90

# Get current notification settings
get_notification_settings
```

### Step 3: Set Up Webhooks for External Monitoring

```bash
# Datadog webhook
create_webhook \
  --name "Datadog" \
  --url "https://webhook-intake.datadoghq.com/api/v2/webhook" \
  --resource-type "server" \
  --resource-uuid "srv-456" \
  --events '["server_unreachable", "disk_full", "high_cpu"]'

# PagerDuty webhook
create_webhook \
  --name "PagerDuty" \
  --url "https://events.pagerduty.com/v2/enqueue" \
  --resource-type "application" \
  --resource-uuid "app-123" \
  --events '["deployment_failed", "application_crashed"]'
```

### Step 4: Test All Notifications

```bash
# Test each channel
test_notification_channel --uuid "discord-notif-1"
test_notification_channel --uuid "slack-notif-2"
test_notification_channel --uuid "email-notif-3"
test_notification_channel --uuid "telegram-notif-4"
```

### Step 5: Monitor Resources

```bash
# Check server health
get_server_resources --uuid "srv-456"

# Get system status
get_system_status

# View application metrics
get_application --uuid "app-123"

# Check database health
get_database --uuid "db-123"
```

**✅ Result**: Complete monitoring setup with multiple alert channels!

---

## 4. Implement CI/CD Pipeline

**Goal**: Automated deployment pipeline with Git integration.

### Step 1: Set Up Git Integration

```bash
# List connected repositories
list_git_repositories

# Get available branches
get_git_branches --uuid "app-123"

# View recent commits
get_git_commits \
  --uuid "app-123" \
  --branch "main" \
  --limit 20
```

### Step 2: Configure Deployment Settings

```bash
# Get current deployment settings
get_deployment_settings --uuid "app-123"

# Optimize build settings
update_deployment_settings \
  --uuid "app-123" \
  --build-pack "nixpacks" \
  --install-command "pnpm install --frozen-lockfile" \
  --build-command "pnpm run build" \
  --start-command "pnpm start" \
  --base-directory "./" \
  --publish-directory "./dist"
```

### Step 3: Set Up Staging Environment

```bash
# Create staging environment
create_environment \
  --project-uuid "proj-123" \
  --name "staging"

# Clone production config to staging
clone_environment \
  --project-uuid "proj-123" \
  --from-environment "production" \
  --to-environment "staging"

# Create staging application
create_application \
  --name "MyApp Staging" \
  --project-uuid "proj-123" \
  --environment-name "staging" \
  --server-uuid "srv-456" \
  --git-repository "https://github.com/user/myapp" \
  --git-branch "develop"
```

### Step 4: Deploy to Staging First

```bash
# Deploy staging
deploy_application --uuid "staging-app-123"

# Monitor deployment
get_deployment --uuid "deploy-xyz"
get_deployment_logs --uuid "deploy-xyz"

# Check logs
get_application_logs --uuid "staging-app-123" --lines 500
```

### Step 5: Promote to Production

```bash
# If staging looks good, deploy specific commit to production
trigger_git_deployment \
  --uuid "prod-app-456" \
  --commit-sha "abc123def456"

# Monitor production deployment
list_deployments --uuid "prod-app-456"
get_deployment_logs --uuid "prod-deploy-xyz"
```

### Step 6: Rollback if Needed

```bash
# If issues detected
get_application_logs --uuid "prod-app-456" --lines 1000

# Rollback to previous version
rollback_deployment \
  --uuid "prod-app-456" \
  --version "v1.2.3"

# Or redeploy previous commit
trigger_git_deployment \
  --uuid "prod-app-456" \
  --commit-sha "previous-good-commit"
```

### Step 7: Automated Webhook Notifications

```bash
# Create webhook for CI/CD notifications
create_webhook \
  --name "CI/CD Status" \
  --url "https://your-ci-system.com/webhook" \
  --resource-type "application" \
  --resource-uuid "app-123" \
  --events '["deployment_started", "deployment_finished", "deployment_failed"]'
```

**✅ Result**: Complete CI/CD pipeline with staging and production!

---

## 5. Database Migration Workflow

**Goal**: Safely migrate database to new version or server.

### Step 1: Create Backup

```bash
# Backup current database
backup_database \
  --uuid "old-db-123" \
  --destination "s3"

# Verify backup completed
get_database --uuid "old-db-123"
# Check backup_count field
```

### Step 2: Create New Database

```bash
# Create new database with latest version
create_database \
  --name "myapp-db-new" \
  --type "postgresql" \
  --version "17" \
  --project-uuid "proj-123" \
  --environment-name "production" \
  --server-uuid "srv-456"

# Configure new database
update_database \
  --uuid "new-db-456" \
  --postgres-password "secure-password" \
  --postgres-db "myapp_prod"

# Start new database
start_database --uuid "new-db-456"
```

### Step 3: Restore Data

```bash
# Restore backup to new database
restore_database \
  --uuid "new-db-456" \
  --backup-id "backup-789"

# Verify restore
get_database_logs --uuid "new-db-456" --lines 200
```

### Step 4: Update Application

```bash
# Get current env vars
get_application_environment_variables --uuid "app-123"

# Update DATABASE_URL to point to new database
set_application_environment_variable \
  --uuid "app-123" \
  --key "DATABASE_URL" \
  --value "postgresql://user:pass@new-db:5432/myapp_prod"

# Restart application
restart_application --uuid "app-123"
```

### Step 5: Verify & Clean Up

```bash
# Test application with new database
get_application_logs --uuid "app-123" --lines 500

# If everything works, stop old database
stop_database --uuid "old-db-123"

# Keep for a few days, then delete
delete_database --uuid "old-db-123"
```

**✅ Result**: Safe database migration with zero downtime!

---

## 6. Team Onboarding

**Goal**: Onboard new team member with proper access.

### Step 1: Get Team Info

```bash
# View current team
get_current_team

# List team members
get_current_team_members
```

### Step 2: Invite New Member

```bash
# Invite team member
invite_team_member \
  --email "newdev@company.com" \
  --role "member"
```

### Step 3: Create Project for Team Member

```bash
# Create new project
create_project \
  --name "Dev Playground" \
  --description "Development environment for new team member"

# Create development environment
create_environment \
  --project-uuid "proj-new-123" \
  --name "development"
```

### Step 4: Set Up Development Resources

```bash
# Create test database
create_database \
  --name "dev-db" \
  --type "postgresql" \
  --version "16" \
  --project-uuid "proj-new-123" \
  --environment-name "development" \
  --server-uuid "srv-456"

# Create test application
create_application \
  --name "Dev App" \
  --project-uuid "proj-new-123" \
  --environment-name "development" \
  --server-uuid "srv-456" \
  --git-repository "https://github.com/user/learning-app" \
  --git-branch "main"

# Tag resources
tag_resource \
  --resource-type "application" \
  --resource-uuid "dev-app-123" \
  --tags '["development", "training"]'
```

### Step 5: Create API Token for Team Member

```bash
# Create limited API token
create_api_token \
  --name "Dev Token - newdev@company.com" \
  --permissions '["read", "deploy"]' \
  --expires-at "2026-06-30"
```

**✅ Result**: New team member onboarded with development environment!

---

## 7. Disaster Recovery

**Goal**: Recover from server failure or data loss.

### Step 1: Assess Damage

```bash
# Check system status
get_system_status

# Check all servers
list_servers

# Check specific server
get_server --uuid "failed-srv-456"
get_server_resources --uuid "failed-srv-456"
```

### Step 2: Create New Server (if needed)

```bash
# Create replacement server
create_server \
  --name "Recovery Server" \
  --ip "new.server.ip.address" \
  --user "root" \
  --port 22 \
  --private-key-uuid "key-123"

# Validate new server
validate_server --uuid "new-srv-789"
```

### Step 3: Restore Databases

```bash
# List backup for critical database
get_database --uuid "db-123"

# Create new database on recovery server
create_database \
  --name "recovered-db" \
  --type "postgresql" \
  --version "16" \
  --project-uuid "proj-123" \
  --environment-name "production" \
  --server-uuid "new-srv-789"

# Restore from backup
restore_database \
  --uuid "recovered-db-456" \
  --backup-id "backup-789"
```

### Step 4: Redeploy Applications

```bash
# Create application on new server
create_application \
  --name "Recovered App" \
  --project-uuid "proj-123" \
  --environment-name "production" \
  --server-uuid "new-srv-789" \
  --git-repository "https://github.com/user/app" \
  --git-branch "main"

# Clone environment variables from old app
# (Export from old app, import to new app)
get_application_environment_variables --uuid "old-app-123"

update_application_environment_variables \
  --uuid "recovered-app-456" \
  --env-vars '{ ... }'

# Deploy
deploy_application --uuid "recovered-app-456"
```

### Step 5: Update DNS & SSL

```bash
# Add domain to recovered app
update_application_domains \
  --uuid "recovered-app-456" \
  --domains '["app.example.com"]'

# Generate new SSL certificate
generate_ssl_certificate \
  --domain "app.example.com" \
  --email "admin@example.com"

# Update DNS to point to new server IP
# (Done externally at DNS provider)
```

### Step 6: Verify Recovery

```bash
# Check application
get_application --uuid "recovered-app-456"

# Check logs
get_application_logs --uuid "recovered-app-456" --lines 500

# Check database
get_database --uuid "recovered-db-456"

# Test functionality
# (Manual testing or automated tests)
```

**✅ Result**: Services recovered and running on new infrastructure!

---

## 8. Performance Optimization

**Goal**: Optimize application performance and resource usage.

### Step 1: Analyze Current Performance

```bash
# Check server metrics
get_server_metrics --uuid "srv-456"

# Check server resources
get_server_resources --uuid "srv-456"

# Review deployment settings
get_deployment_settings --uuid "app-123"
```

### Step 2: Optimize Build Process

```bash
# Update deployment settings for faster builds
update_deployment_settings \
  --uuid "app-123" \
  --build-pack "nixpacks" \
  --install-command "pnpm install --frozen-lockfile" \
  --build-command "pnpm run build --parallel" \
  --base-directory "./" \
  --publish-directory "./dist"

# Enable concurrent builds on server
update_server_settings \
  --uuid "srv-456" \
  --concurrent-builds 5
```

### Step 3: Optimize Resources

```bash
# Create volumes for better disk I/O
create_volume \
  --name "app-cache" \
  --server-uuid "srv-456"

create_volume \
  --name "app-tmp" \
  --server-uuid "srv-456"

# Configure application to use volumes
# (Update docker compose or environment variables)
```

### Step 4: Database Optimization

```bash
# Check database logs for slow queries
get_database_logs --uuid "db-123" --lines 1000

# Update database configuration
update_database \
  --uuid "db-123" \
  --postgres-max-connections 200 \
  --postgres-shared-buffers "256MB"

# Restart database
restart_database --uuid "db-123"
```

### Step 5: Add Caching Layer

```bash
# Create Redis for caching
create_service \
  --name "app-cache-redis" \
  --type "redis" \
  --server-uuid "srv-456" \
  --project-uuid "proj-123" \
  --environment-name "production"

# Start Redis
start_service --uuid "redis-789"

# Update application to use Redis
set_application_environment_variable \
  --uuid "app-123" \
  --key "REDIS_URL" \
  --value "redis://redis:6379"

# Restart application
restart_application --uuid "app-123"
```

### Step 6: Monitor Improvements

```bash
# Check metrics after optimization
get_server_metrics --uuid "srv-456"
get_server_resources --uuid "srv-456"

# Compare deployment times
list_deployments --uuid "app-123"

# Check application logs for errors
get_application_logs --uuid "app-123" --lines 500
```

### Step 7: Clean Up Resources

```bash
# Clean up old deployments
cleanup_server --uuid "srv-456"

# Delete unused volumes
list_volumes --server-uuid "srv-456"
delete_volume --name "unused-volume" --server-uuid "srv-456"

# Delete old databases
list_databases
delete_database --uuid "old-db-123"
```

**✅ Result**: Optimized performance with faster builds and better resource usage!

---

## 🎓 Additional Resources

- **QUICK-START-GUIDE.md** - Get started in 5 minutes
- **AUTOMATION-SCRIPTS.md** - Ready-to-use automation scripts
- **BEST-PRACTICES.md** - Production best practices
- **README.md** - Complete tool documentation

---

**Happy Automating!** 🚀

These workflows cover the most common scenarios you'll encounter with Coolify MCP!
