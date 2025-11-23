# 🧪 Testing & Best Practices Guide

**Comprehensive testing strategies and production best practices for Coolify MCP.**

---

## 📋 Table of Contents

1. [Testing Workflows](#1-testing-workflows)
2. [Production Best Practices](#2-production-best-practices)
3. [Security Guidelines](#3-security-guidelines)
4. [Performance Optimization](#4-performance-optimization)
5. [Monitoring & Alerting](#5-monitoring--alerting)
6. [Disaster Recovery](#6-disaster-recovery)
7. [Cost Optimization](#7-cost-optimization)
8. [Troubleshooting Guide](#8-troubleshooting-guide)

---

## 1. Testing Workflows

### Test 1: Basic Connectivity

**Purpose**: Verify Coolify MCP is working

```bash
# Test basic connection
get_version
# Expected: Returns Coolify version (e.g., "4.0.0-beta.442")

health_check
# Expected: Returns health status

list_teams
# Expected: Returns your teams

list_servers
# Expected: Returns your servers
```

**Success Criteria**:
- ✅ All commands return without errors
- ✅ Data matches your Coolify instance
- ✅ Response time < 2 seconds

### Test 2: Deploy Simple Application

**Purpose**: End-to-end deployment test

```bash
# 1. Create test application
APP_UUID=$(create_application \
  --name "Test App" \
  --project-uuid "your-project-uuid" \
  --environment-name "staging" \
  --server-uuid "your-server-uuid" \
  --git-repository "https://github.com/user/simple-app" \
  --git-branch "main" \
  | jq -r '.uuid')

echo "Created app: $APP_UUID"

# 2. Set environment variables
update_application_environment_variables \
  --uuid "$APP_UUID" \
  --env-vars '{"NODE_ENV":"production","PORT":"3000"}'

# 3. Deploy
deploy_application --uuid "$APP_UUID"

# 4. Monitor deployment
DEPLOY_UUID=$(list_deployments --uuid "$APP_UUID" | jq -r '.[0].uuid')

# Wait for deployment
while true; do
  STATUS=$(get_deployment --uuid "$DEPLOY_UUID" | jq -r '.status')
  echo "Deployment status: $STATUS"
  
  if [ "$STATUS" = "finished" ]; then
    echo "✅ Deployment succeeded!"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ Deployment failed!"
    get_deployment_logs --uuid "$DEPLOY_UUID"
    exit 1
  fi
  
  sleep 10
done

# 5. Verify deployment
get_application --uuid "$APP_UUID"
get_application_logs --uuid "$APP_UUID" --lines 100

# 6. Clean up
delete_application --uuid "$APP_UUID"
```

**Success Criteria**:
- ✅ Application created successfully
- ✅ Deployment completes without errors
- ✅ Application is running
- ✅ Logs show application started

### Test 3: SSL Certificate Generation

**Purpose**: Test SSL/TLS functionality

```bash
# 1. Create application with domain
APP_UUID=$(create_application \
  --name "SSL Test App" \
  --project-uuid "your-project-uuid" \
  --environment-name "staging" \
  --server-uuid "your-server-uuid" \
  --git-repository "https://github.com/user/app" \
  --git-branch "main" \
  | jq -r '.uuid')

# 2. Add custom domain
update_application_domains \
  --uuid "$APP_UUID" \
  --domains '["test.yourdomain.com"]'

# 3. Generate SSL certificate
generate_ssl_certificate \
  --domain "test.yourdomain.com" \
  --email "admin@yourdomain.com"

# 4. Verify certificate
CERT=$(get_ssl_certificate --domain "test.yourdomain.com")
echo "$CERT" | jq '.'

# Check expiration
EXPIRES=$(echo "$CERT" | jq -r '.expires_at')
echo "Certificate expires: $EXPIRES"

# 5. Deploy application
deploy_application --uuid "$APP_UUID"

# 6. Test HTTPS endpoint (after DNS is configured)
# curl -I https://test.yourdomain.com

# 7. Clean up
delete_ssl_certificate --uuid "$(echo "$CERT" | jq -r '.uuid')"
delete_application --uuid "$APP_UUID"
```

**Success Criteria**:
- ✅ SSL certificate generated successfully
- ✅ Certificate has valid expiration date (90 days)
- ✅ Application accessible via HTTPS
- ✅ No SSL warnings

### Test 4: Batch Operations

**Purpose**: Test batch operations performance

```bash
# Create 3 test applications
APP_UUIDS=()

for i in 1 2 3; do
  UUID=$(create_application \
    --name "Batch Test App $i" \
    --project-uuid "your-project-uuid" \
    --environment-name "staging" \
    --server-uuid "your-server-uuid" \
    --git-repository "https://github.com/user/app" \
    --git-branch "main" \
    | jq -r '.uuid')
  
  APP_UUIDS+=("$UUID")
  echo "Created app $i: $UUID"
done

# Deploy all at once (measure time)
START_TIME=$(date +%s)

# Convert array to JSON
APPS_JSON=$(printf '%s\n' "${APP_UUIDS[@]}" | jq -R . | jq -s .)

batch_restart_applications --application-uuids "$APPS_JSON"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "✅ Batch operation completed in $DURATION seconds"

# Clean up
for UUID in "${APP_UUIDS[@]}"; do
  delete_application --uuid "$UUID"
done
```

**Success Criteria**:
- ✅ All operations succeed
- ✅ Batch operation faster than individual calls
- ✅ No errors or failures

### Test 5: Database Backup & Restore

**Purpose**: Verify data protection

```bash
# 1. Create test database
DB_UUID=$(create_database \
  --name "test-backup-db" \
  --type "postgresql" \
  --version "16" \
  --project-uuid "your-project-uuid" \
  --environment-name "staging" \
  --server-uuid "your-server-uuid" \
  | jq -r '.uuid')

# 2. Configure and start
update_database \
  --uuid "$DB_UUID" \
  --postgres-password "test-password" \
  --postgres-db "testdb"

start_database --uuid "$DB_UUID"

# Wait for database to start
sleep 30

# 3. Create backup
echo "Creating backup..."
backup_database --uuid "$DB_UUID" --destination "s3"

# Wait for backup to complete
sleep 60

# 4. Verify backup exists
DB_INFO=$(get_database --uuid "$DB_UUID")
BACKUP_COUNT=$(echo "$DB_INFO" | jq -r '.backup_count')

echo "Backup count: $BACKUP_COUNT"

# 5. Clean up
delete_database --uuid "$DB_UUID"
```

**Success Criteria**:
- ✅ Database created and started
- ✅ Backup created successfully
- ✅ Backup count increased
- ✅ No errors during process

### Test 6: Monitoring & Webhooks

**Purpose**: Test notification system

```bash
# 1. Create Discord notification channel
NOTIF_UUID=$(create_notification_channel \
  --name "Test Alerts" \
  --type "discord" \
  --webhook-url "YOUR_DISCORD_WEBHOOK_URL" \
  | jq -r '.uuid')

# 2. Test notification
test_notification_channel --uuid "$NOTIF_UUID"

# Check Discord for test message

# 3. Create webhook
WEBHOOK_UUID=$(create_webhook \
  --name "Test Webhook" \
  --url "YOUR_WEBHOOK_URL" \
  --resource-type "application" \
  --resource-uuid "your-app-uuid" \
  --events '["deployment_finished"]' \
  | jq -r '.uuid')

# 4. Trigger event (deploy application)
deploy_application --uuid "your-app-uuid"

# Wait and check if webhook was called

# 5. Clean up
delete_webhook --uuid "$WEBHOOK_UUID"
delete_notification_channel --uuid "$NOTIF_UUID"
```

**Success Criteria**:
- ✅ Test notification received
- ✅ Webhook triggered on deployment
- ✅ Notification contains correct data

---

## 2. Production Best Practices

### Resource Organization

**Tag Everything**:
```bash
# Tag by environment
tag_resource --resource-type "application" --resource-uuid "app-1" --tags '["production"]'
tag_resource --resource-type "application" --resource-uuid "app-2" --tags '["staging"]'

# Tag by team/project
tag_resource --resource-type "application" --resource-uuid "app-1" --tags '["team-api", "project-main"]'

# Tag by criticality
tag_resource --resource-type "application" --resource-uuid "app-1" --tags '["critical", "high-priority"]'
```

**Benefits**:
- Quick filtering: `list_resources_by_tag --tag "production"`
- Easy management: Update all production resources at once
- Clear organization: Know what's what at a glance

### Naming Conventions

**Use Consistent Naming**:
```bash
# Good naming
- prod-api-backend
- staging-web-frontend
- dev-worker-queue

# Bad naming
- app1
- test
- mynewapp
```

**Pattern**: `{environment}-{component}-{function}`

### Environment Variables

**Always Use Environment-Specific Values**:
```bash
# Production
update_application_environment_variables \
  --uuid "prod-app" \
  --env-vars '{
    "NODE_ENV": "production",
    "LOG_LEVEL": "error",
    "DATABASE_POOL_SIZE": "20"
  }'

# Staging
update_application_environment_variables \
  --uuid "staging-app" \
  --env-vars '{
    "NODE_ENV": "staging",
    "LOG_LEVEL": "debug",
    "DATABASE_POOL_SIZE": "5"
  }'
```

### Deployment Strategy

**Use Staging First**:
```bash
# 1. Deploy to staging
deploy_application --uuid "staging-app"

# 2. Run tests
./run-integration-tests.sh https://staging.example.com

# 3. If tests pass, deploy to production
trigger_git_deployment \
  --uuid "prod-app" \
  --commit-sha "$(get_application --uuid staging-app | jq -r '.git_commit_sha')"

# 4. Monitor production
get_application_logs --uuid "prod-app" --lines 500

# 5. If issues, rollback immediately
rollback_deployment --uuid "prod-app"
```

### Resource Limits

**Set Appropriate Limits**:
```bash
# Check current resource usage
get_server_resources --uuid "srv-123"

# Configure server settings
update_server_settings \
  --uuid "srv-123" \
  --concurrent-builds 3 \
  --cleanup-after-days 7
```

---

## 3. Security Guidelines

### API Token Management

**Use Scoped Tokens**:
```bash
# Create CI/CD token (read + deploy only)
create_api_token \
  --name "GitHub Actions" \
  --permissions '["read", "deploy"]' \
  --expires-at "2026-12-31"

# Create monitoring token (read only)
create_api_token \
  --name "Datadog Integration" \
  --permissions '["read"]' \
  --expires-at "2026-12-31"

# Never use admin token in CI/CD!
```

### Security Settings

**Enable HTTPS and IP Restrictions**:
```bash
# Update security settings
update_security_settings \
  --force-https true \
  --allowed-ips '["1.2.3.4", "5.6.7.8"]'

# Get current settings
get_security_settings
```

### Secrets Management

**Never Commit Secrets**:
```bash
# ❌ Bad - Don't do this
git commit -m "Add API key: sk_live_abc123"

# ✅ Good - Use environment variables
set_application_environment_variable \
  --uuid "app-123" \
  --key "API_KEY" \
  --value "$API_KEY"

# Use secret rotation
./rotate-api-keys.sh
```

### SSH Keys

**Rotate Keys Regularly**:
```bash
# Create new private key
NEW_KEY_UUID=$(create_private_key \
  --name "Production Server Key (2025)" \
  --private-key "$(cat ~/.ssh/new_production_key)" \
  | jq -r '.uuid')

# Update server to use new key
update_server --uuid "srv-123" --private-key-uuid "$NEW_KEY_UUID"

# Test connection
validate_server --uuid "srv-123"

# Delete old key
delete_private_key --uuid "old-key-uuid"
```

---

## 4. Performance Optimization

### Build Optimization

**Optimize Build Settings**:
```bash
# Use fast package manager
update_deployment_settings \
  --uuid "app-123" \
  --install-command "pnpm install --frozen-lockfile"

# Use build cache
update_deployment_settings \
  --uuid "app-123" \
  --build-command "pnpm run build --cache"

# Optimize base image
update_deployment_settings \
  --uuid "app-123" \
  --build-pack "nixpacks"
```

### Server Optimization

**Configure Concurrent Builds**:
```bash
# Check server resources
RESOURCES=$(get_server_resources --uuid "srv-123")
CPU_COUNT=$(echo "$RESOURCES" | jq -r '.cpu_count')

# Set concurrent builds based on CPU count
CONCURRENT=$((CPU_COUNT / 2))

update_server_settings \
  --uuid "srv-123" \
  --concurrent-builds $CONCURRENT
```

### Database Optimization

**Use Connection Pooling**:
```bash
# Configure PostgreSQL
update_database \
  --uuid "db-123" \
  --postgres-max-connections 100 \
  --postgres-shared-buffers "256MB"

# Add connection pooling in application
set_application_environment_variable \
  --uuid "app-123" \
  --key "DATABASE_POOL_SIZE" \
  --value "20"
```

### Caching Strategy

**Add Redis for Caching**:
```bash
# Create Redis service
create_service \
  --name "app-cache" \
  --type "redis" \
  --server-uuid "srv-123" \
  --project-uuid "proj-123" \
  --environment-name "production"

# Configure application
set_application_environment_variable \
  --uuid "app-123" \
  --key "REDIS_URL" \
  --value "redis://redis:6379"

set_application_environment_variable \
  --uuid "app-123" \
  --key "CACHE_TTL" \
  --value "3600"
```

---

## 5. Monitoring & Alerting

### Set Up Comprehensive Monitoring

**Multi-Channel Alerts**:
```bash
# Critical alerts → PagerDuty/Phone
create_notification_channel \
  --name "Critical Alerts" \
  --type "email" \
  --email-address "oncall@company.com"

# General alerts → Slack
create_notification_channel \
  --name "General Alerts" \
  --type "slack" \
  --webhook-url "https://hooks.slack.com/..."

# Configure thresholds
update_notification_settings \
  --deployment-failure true \
  --server-unreachable true \
  --disk-usage-threshold 80 \
  --memory-usage-threshold 85 \
  --cpu-usage-threshold 90
```

### Log Aggregation

**Centralize Logs**:
```bash
# Create webhook for log aggregation
create_webhook \
  --name "Datadog Logs" \
  --url "https://http-intake.logs.datadoghq.com/api/v2/logs" \
  --resource-type "application" \
  --resource-uuid "app-123" \
  --events '["application_log"]'

# Get logs programmatically
get_application_logs --uuid "app-123" --lines 1000 | jq '.'
```

### Health Checks

**Monitor Resource Health**:
```bash
#!/bin/bash
# health-check.sh

check_application() {
  local UUID="$1"
  local STATUS=$(get_application --uuid "$UUID" | jq -r '.status')
  
  if [ "$STATUS" != "running" ]; then
    echo "⚠️  Application $UUID is $STATUS"
    # Send alert
    return 1
  fi
  
  return 0
}

# Check all production applications
PROD_APPS=$(list_resources_by_tag --tag "production" | jq -r '.applications[].uuid')

for APP in $PROD_APPS; do
  check_application "$APP"
done
```

---

## 6. Disaster Recovery

### Backup Strategy

**Automated Daily Backups**:
```bash
#!/bin/bash
# backup-all-databases.sh

# Get all production databases
PROD_DBS=$(list_resources_by_tag --tag "production" | jq -r '.databases[].uuid')

for DB_UUID in $PROD_DBS; do
  echo "Backing up $DB_UUID..."
  
  backup_database \
    --uuid "$DB_UUID" \
    --destination "s3"
  
  # Verify backup
  DB_INFO=$(get_database --uuid "$DB_UUID")
  LAST_BACKUP=$(echo "$DB_INFO" | jq -r '.last_backup_at')
  
  echo "Last backup: $LAST_BACKUP"
done

# Schedule in cron
# 0 3 * * * /path/to/backup-all-databases.sh
```

### Recovery Testing

**Test Recovery Quarterly**:
```bash
# 1. Create test environment
create_environment \
  --project-uuid "proj-123" \
  --name "recovery-test"

# 2. Restore backup to test environment
restore_database \
  --uuid "test-db-uuid" \
  --backup-id "latest-backup-id"

# 3. Verify data integrity
# Run data validation queries

# 4. Clean up
delete_environment \
  --project-uuid "proj-123" \
  --name "recovery-test"
```

### Failover Plan

**Document Failover Procedure**:
```bash
# 1. Assess damage
get_system_status
list_servers

# 2. Create new server if needed
create_server \
  --name "Failover Server" \
  --ip "new.ip.address" \
  --user "root" \
  --port 22 \
  --private-key-uuid "key-uuid"

# 3. Restore databases
restore_database --uuid "new-db-uuid" --backup-id "backup-id"

# 4. Redeploy applications
deploy_application --uuid "app-uuid"

# 5. Update DNS
# (External DNS provider)

# 6. Verify recovery
get_application_logs --uuid "app-uuid" --lines 500
```

---

## 7. Cost Optimization

### Resource Cleanup

**Regular Cleanup**:
```bash
#!/bin/bash
# cleanup-resources.sh

# Clean up old deployments (runs on all servers)
SERVERS=$(list_servers | jq -r '.[].uuid')

for SERVER in $SERVERS; do
  cleanup_server --uuid "$SERVER"
done

# Delete unused volumes
VOLUMES=$(list_volumes | jq -c '.[] | select(.in_use == false)')

echo "$VOLUMES" | while read -r VOLUME; do
  NAME=$(echo "$VOLUME" | jq -r '.name')
  SERVER_UUID=$(echo "$VOLUME" | jq -r '.server_uuid')
  
  echo "Deleting unused volume: $NAME"
  delete_volume --name "$NAME" --server-uuid "$SERVER_UUID"
done

# Stop staging environments after hours
# (saves costs)
if [ "$(date +%H)" -ge 18 ]; then
  STAGING_APPS=$(list_resources_by_tag --tag "staging" | jq -r '.applications[].uuid')
  APP_ARRAY=$(echo "$STAGING_APPS" | jq -R -s -c 'split("\n")[:-1]')
  batch_stop_applications --application-uuids "$APP_ARRAY"
fi
```

### Resource Monitoring

**Track Usage**:
```bash
# Check server resources daily
get_server_resources --uuid "srv-123" | jq '{
  cpu_usage,
  memory_usage,
  disk_usage,
  disk_free
}'

# Identify underutilized resources
# Consider downsizing or consolidating
```

---

## 8. Troubleshooting Guide

### Common Issues & Solutions

**Issue 1: Deployment Fails**
```bash
# Check deployment logs
get_deployment_logs --uuid "deploy-uuid"

# Check application logs
get_application_logs --uuid "app-uuid" --lines 500

# Common fixes:
# 1. Check environment variables
get_application_environment_variables --uuid "app-uuid"

# 2. Check build settings
get_deployment_settings --uuid "app-uuid"

# 3. Verify Git repository access
get_git_branches --uuid "app-uuid"

# 4. Rollback if needed
rollback_deployment --uuid "app-uuid"
```

**Issue 2: Application Won't Start**
```bash
# Check application status
get_application --uuid "app-uuid"

# Check logs for errors
get_application_logs --uuid "app-uuid" --lines 1000

# Common fixes:
# 1. Restart application
restart_application --uuid "app-uuid"

# 2. Check server resources
get_server_resources --uuid "srv-uuid"

# 3. Verify environment variables
get_application_environment_variables --uuid "app-uuid"

# 4. Check database connectivity
get_database --uuid "db-uuid"
```

**Issue 3: SSL Certificate Errors**
```bash
# Check certificate status
get_ssl_certificate --domain "app.example.com"

# List all certificates
list_ssl_certificates

# Common fixes:
# 1. Regenerate certificate
delete_ssl_certificate --uuid "cert-uuid"
generate_ssl_certificate \
  --domain "app.example.com" \
  --email "admin@example.com"

# 2. Verify DNS is pointing to correct server
# (Check external DNS)

# 3. Wait for DNS propagation (up to 48 hours)
```

**Issue 4: High Resource Usage**
```bash
# Check server metrics
get_server_metrics --uuid "srv-uuid"
get_server_resources --uuid "srv-uuid"

# Common fixes:
# 1. Clean up old deployments
cleanup_server --uuid "srv-uuid"

# 2. Check for memory leaks in application logs
get_application_logs --uuid "app-uuid" --lines 2000

# 3. Optimize database queries
get_database_logs --uuid "db-uuid" --lines 1000

# 4. Add caching layer
create_service --name "redis" --type "redis" ...
```

**Issue 5: Database Connection Errors**
```bash
# Check database status
get_database --uuid "db-uuid"

# Check database logs
get_database_logs --uuid "db-uuid" --lines 500

# Common fixes:
# 1. Restart database
restart_database --uuid "db-uuid"

# 2. Check connection string
get_application_environment_variables --uuid "app-uuid" | jq '.DATABASE_URL'

# 3. Verify network connectivity
# (Check Coolify network settings)

# 4. Check max connections
get_database --uuid "db-uuid" | jq '.config.max_connections'
```

---

## 🎯 Testing Checklist

Before going to production, test:

- [ ] ✅ Basic connectivity (get_version, health_check)
- [ ] ✅ Application deployment end-to-end
- [ ] ✅ SSL certificate generation
- [ ] ✅ Batch operations
- [ ] ✅ Database backup & restore
- [ ] ✅ Monitoring & webhooks
- [ ] ✅ Rollback procedure
- [ ] ✅ Resource cleanup
- [ ] ✅ Failover scenario
- [ ] ✅ Performance under load

---

## 🏆 Production Checklist

Before launching:

- [ ] ✅ All resources tagged properly
- [ ] ✅ Monitoring & alerting configured
- [ ] ✅ SSL certificates for all domains
- [ ] ✅ Automated backups scheduled
- [ ] ✅ Security settings enabled
- [ ] ✅ API tokens scoped appropriately
- [ ] ✅ Disaster recovery plan documented
- [ ] ✅ Team access configured
- [ ] ✅ Cost optimization enabled
- [ ] ✅ Documentation updated

---

**Happy Testing!** 🧪

Follow these practices to ensure a smooth, secure, and efficient Coolify deployment!
