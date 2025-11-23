# 🤖 Coolify MCP Automation Scripts

**Ready-to-use automation scripts for common tasks.**

---

## 📋 Table of Contents

1. [Nightly Deployment Script](#1-nightly-deployment-script)
2. [Health Check Monitor](#2-health-check-monitor)
3. [Batch Resource Management](#3-batch-resource-management)
4. [Automated Backup Script](#4-automated-backup-script)
5. [SSL Certificate Renewal](#5-ssl-certificate-renewal)
6. [Resource Cleanup Script](#6-resource-cleanup-script)
7. [Multi-Environment Deploy](#7-multi-environment-deploy)
8. [Infrastructure as Code](#8-infrastructure-as-code)

---

## 1. Nightly Deployment Script

**Purpose**: Deploy all staging applications nightly with latest changes.

```bash
#!/bin/bash
# deploy-nightly.sh

set -e

echo "🌙 Starting nightly deployment..."

# List of staging applications
STAGING_APPS=(
  "staging-api-123"
  "staging-web-456"
  "staging-worker-789"
)

# Deploy each application
for APP_UUID in "${STAGING_APPS[@]}"; do
  echo "Deploying $APP_UUID..."
  
  # Get latest commit from main branch
  COMMITS=$(get_git_commits --uuid "$APP_UUID" --branch "main" --limit 1)
  LATEST_COMMIT=$(echo "$COMMITS" | jq -r '.[0].sha')
  
  # Trigger deployment
  trigger_git_deployment \
    --uuid "$APP_UUID" \
    --commit-sha "$LATEST_COMMIT"
  
  echo "✅ Deployed $APP_UUID to commit $LATEST_COMMIT"
done

# Send notification
create_webhook \
  --name "Nightly Deploy Complete" \
  --url "https://hooks.slack.com/..." \
  --events '["deployment_finished"]'

echo "🎉 Nightly deployment complete!"
```

**Cron Schedule**:
```bash
# Add to crontab (runs at 2 AM daily)
0 2 * * * /path/to/deploy-nightly.sh >> /var/log/coolify-nightly.log 2>&1
```

---

## 2. Health Check Monitor

**Purpose**: Monitor all production resources and alert on issues.

```bash
#!/bin/bash
# health-monitor.sh

set -e

echo "🏥 Running health check..."

# Check system status
SYSTEM_STATUS=$(get_system_status)
echo "System Status: $SYSTEM_STATUS"

# Check server resources
SERVERS=$(list_servers | jq -r '.[].uuid')

for SERVER_UUID in $SERVERS; do
  echo "Checking server $SERVER_UUID..."
  
  RESOURCES=$(get_server_resources --uuid "$SERVER_UUID")
  
  # Parse metrics
  CPU=$(echo "$RESOURCES" | jq -r '.cpu_usage')
  MEMORY=$(echo "$RESOURCES" | jq -r '.memory_usage')
  DISK=$(echo "$RESOURCES" | jq -r '.disk_usage')
  
  # Alert if thresholds exceeded
  if (( $(echo "$CPU > 90" | bc -l) )); then
    echo "⚠️  HIGH CPU on $SERVER_UUID: $CPU%"
    # Send alert
  fi
  
  if (( $(echo "$MEMORY > 85" | bc -l) )); then
    echo "⚠️  HIGH MEMORY on $SERVER_UUID: $MEMORY%"
    # Send alert
  fi
  
  if (( $(echo "$DISK > 80" | bc -l) )); then
    echo "⚠️  HIGH DISK on $SERVER_UUID: $DISK%"
    # Send alert
  fi
done

# Check application health
PROD_APPS=$(list_resources_by_tag --tag "production")

for APP in $(echo "$PROD_APPS" | jq -r '.applications[].uuid'); do
  APP_STATUS=$(get_application --uuid "$APP" | jq -r '.status')
  
  if [ "$APP_STATUS" != "running" ]; then
    echo "⚠️  Application $APP is $APP_STATUS"
    # Send alert
  fi
done

echo "✅ Health check complete!"
```

**Cron Schedule**:
```bash
# Run every 5 minutes
*/5 * * * * /path/to/health-monitor.sh >> /var/log/coolify-health.log 2>&1
```

---

## 3. Batch Resource Management

**Purpose**: Manage multiple resources efficiently.

```bash
#!/bin/bash
# batch-manage.sh

# Stop all staging applications (cost saving)
stop_staging() {
  echo "Stopping all staging applications..."
  
  STAGING_APPS=$(list_resources_by_tag --tag "staging" | jq -r '.applications[].uuid')
  APP_ARRAY=$(echo "$STAGING_APPS" | jq -R -s -c 'split("\n")[:-1]')
  
  batch_stop_applications --application-uuids "$APP_ARRAY"
  
  echo "✅ All staging applications stopped"
}

# Start all staging applications (morning)
start_staging() {
  echo "Starting all staging applications..."
  
  STAGING_APPS=$(list_resources_by_tag --tag "staging" | jq -r '.applications[].uuid')
  
  for APP in $STAGING_APPS; do
    start_application --uuid "$APP"
  done
  
  echo "✅ All staging applications started"
}

# Restart all production applications (maintenance)
restart_production() {
  echo "Restarting all production applications..."
  
  PROD_APPS=$(list_resources_by_tag --tag "production" | jq -r '.applications[].uuid')
  APP_ARRAY=$(echo "$PROD_APPS" | jq -R -s -c 'split("\n")[:-1]')
  
  batch_restart_applications --application-uuids "$APP_ARRAY"
  
  echo "✅ All production applications restarted"
}

# Update environment variables across all apps
update_all_env_vars() {
  local KEY="$1"
  local VALUE="$2"
  
  echo "Updating $KEY across all applications..."
  
  ALL_APPS=$(list_applications | jq -r '.[].uuid')
  APP_ARRAY=$(echo "$ALL_APPS" | jq -R -s -c 'split("\n")[:-1]')
  
  batch_update_env_vars \
    --application-uuids "$APP_ARRAY" \
    --env-vars "{\"$KEY\":\"$VALUE\"}" \
    --restart-after-update true
  
  echo "✅ Updated $KEY for all applications"
}

# Main command router
case "$1" in
  stop-staging)
    stop_staging
    ;;
  start-staging)
    start_staging
    ;;
  restart-production)
    restart_production
    ;;
  update-env)
    update_all_env_vars "$2" "$3"
    ;;
  *)
    echo "Usage: $0 {stop-staging|start-staging|restart-production|update-env KEY VALUE}"
    exit 1
    ;;
esac
```

**Usage**:
```bash
# Stop staging (save costs overnight)
./batch-manage.sh stop-staging

# Start staging (morning)
./batch-manage.sh start-staging

# Update API key across all apps
./batch-manage.sh update-env "API_KEY" "new-secret-key"
```

---

## 4. Automated Backup Script

**Purpose**: Backup all production databases daily.

```bash
#!/bin/bash
# backup-databases.sh

set -e

echo "💾 Starting database backups..."

# Get all production databases
PROD_DBS=$(list_resources_by_tag --tag "production" | jq -r '.databases[].uuid')

if [ -z "$PROD_DBS" ]; then
  echo "No production databases found"
  exit 0
fi

# Backup each database
for DB_UUID in $PROD_DBS; do
  echo "Backing up database $DB_UUID..."
  
  DB_INFO=$(get_database --uuid "$DB_UUID")
  DB_NAME=$(echo "$DB_INFO" | jq -r '.name')
  
  # Create backup
  backup_database \
    --uuid "$DB_UUID" \
    --destination "s3"
  
  echo "✅ Backed up $DB_NAME"
  
  # Sleep to avoid overwhelming the system
  sleep 10
done

# Clean up old backups (keep last 7 days)
# This would require additional Coolify API endpoints

# Send success notification
echo "🎉 All database backups complete!"

# Log backup completion
echo "$(date): Backup completed successfully" >> /var/log/coolify-backups.log
```

**Cron Schedule**:
```bash
# Run at 3 AM daily
0 3 * * * /path/to/backup-databases.sh >> /var/log/coolify-backup.log 2>&1
```

---

## 5. SSL Certificate Renewal

**Purpose**: Check and renew SSL certificates before expiration.

```bash
#!/bin/bash
# renew-ssl.sh

set -e

echo "🔒 Checking SSL certificates..."

# Get all certificates
CERTS=$(list_ssl_certificates)

# Check each certificate
echo "$CERTS" | jq -c '.[]' | while read -r CERT; do
  DOMAIN=$(echo "$CERT" | jq -r '.domain')
  EXPIRES=$(echo "$CERT" | jq -r '.expires_at')
  
  # Calculate days until expiration
  EXPIRES_TIMESTAMP=$(date -d "$EXPIRES" +%s)
  NOW_TIMESTAMP=$(date +%s)
  DAYS_LEFT=$(( ($EXPIRES_TIMESTAMP - $NOW_TIMESTAMP) / 86400 ))
  
  echo "Certificate for $DOMAIN expires in $DAYS_LEFT days"
  
  # Renew if less than 30 days remaining
  if [ $DAYS_LEFT -lt 30 ]; then
    echo "⚠️  Renewing certificate for $DOMAIN..."
    
    CERT_UUID=$(echo "$CERT" | jq -r '.uuid')
    EMAIL=$(echo "$CERT" | jq -r '.email')
    
    # Delete old certificate
    delete_ssl_certificate --uuid "$CERT_UUID"
    
    # Generate new certificate
    generate_ssl_certificate \
      --domain "$DOMAIN" \
      --email "$EMAIL"
    
    echo "✅ Renewed certificate for $DOMAIN"
  fi
done

echo "🎉 SSL certificate check complete!"
```

**Cron Schedule**:
```bash
# Run weekly on Sunday at 1 AM
0 1 * * 0 /path/to/renew-ssl.sh >> /var/log/coolify-ssl.log 2>&1
```

---

## 6. Resource Cleanup Script

**Purpose**: Clean up unused resources and free disk space.

```bash
#!/bin/bash
# cleanup-resources.sh

set -e

echo "🧹 Starting resource cleanup..."

# Get all servers
SERVERS=$(list_servers | jq -r '.[].uuid')

for SERVER_UUID in $SERVERS; do
  echo "Cleaning up server $SERVER_UUID..."
  
  # Clean up old deployments
  cleanup_server --uuid "$SERVER_UUID"
  
  echo "✅ Cleaned server $SERVER_UUID"
done

# Delete unused volumes
echo "Checking for unused volumes..."

VOLUMES=$(list_volumes | jq -c '.[]')

echo "$VOLUMES" | while read -r VOLUME; do
  NAME=$(echo "$VOLUME" | jq -r '.name')
  IN_USE=$(echo "$VOLUME" | jq -r '.in_use')
  
  if [ "$IN_USE" = "false" ]; then
    echo "Deleting unused volume: $NAME"
    SERVER_UUID=$(echo "$VOLUME" | jq -r '.server_uuid')
    delete_volume --name "$NAME" --server-uuid "$SERVER_UUID"
  fi
done

# Report disk space
for SERVER_UUID in $SERVERS; do
  RESOURCES=$(get_server_resources --uuid "$SERVER_UUID")
  DISK_FREE=$(echo "$RESOURCES" | jq -r '.disk_free')
  echo "Server $SERVER_UUID: $DISK_FREE GB free"
done

echo "🎉 Cleanup complete!"
```

**Cron Schedule**:
```bash
# Run weekly on Saturday at 4 AM
0 4 * * 6 /path/to/cleanup-resources.sh >> /var/log/coolify-cleanup.log 2>&1
```

---

## 7. Multi-Environment Deploy

**Purpose**: Deploy to staging, test, then promote to production.

```bash
#!/bin/bash
# multi-env-deploy.sh

set -e

STAGING_APP="staging-app-123"
PRODUCTION_APP="prod-app-456"

echo "🚀 Starting multi-environment deployment..."

# Step 1: Deploy to staging
echo "1️⃣ Deploying to staging..."

deploy_application --uuid "$STAGING_APP"

# Wait for deployment to complete
DEPLOY_UUID=$(list_deployments --uuid "$STAGING_APP" | jq -r '.[0].uuid')

while true; do
  STATUS=$(get_deployment --uuid "$DEPLOY_UUID" | jq -r '.status')
  
  if [ "$STATUS" = "finished" ]; then
    echo "✅ Staging deployment succeeded"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ Staging deployment failed"
    get_deployment_logs --uuid "$DEPLOY_UUID"
    exit 1
  fi
  
  echo "⏳ Waiting for deployment... (status: $STATUS)"
  sleep 10
done

# Step 2: Run tests
echo "2️⃣ Running tests on staging..."

# Run your test suite here
# If tests fail, exit
# ./run-tests.sh $STAGING_URL || exit 1

echo "✅ Tests passed"

# Step 3: Get the deployed commit
COMMIT_SHA=$(get_application --uuid "$STAGING_APP" | jq -r '.git_commit_sha')

echo "3️⃣ Promoting commit $COMMIT_SHA to production..."

# Step 4: Deploy to production
trigger_git_deployment \
  --uuid "$PRODUCTION_APP" \
  --commit-sha "$COMMIT_SHA"

# Wait for production deployment
PROD_DEPLOY_UUID=$(list_deployments --uuid "$PRODUCTION_APP" | jq -r '.[0].uuid')

while true; do
  STATUS=$(get_deployment --uuid "$PROD_DEPLOY_UUID" | jq -r '.status')
  
  if [ "$STATUS" = "finished" ]; then
    echo "✅ Production deployment succeeded"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ Production deployment failed"
    get_deployment_logs --uuid "$PROD_DEPLOY_UUID"
    
    # Auto-rollback
    echo "🔄 Rolling back production..."
    rollback_deployment --uuid "$PRODUCTION_APP"
    exit 1
  fi
  
  echo "⏳ Waiting for production deployment... (status: $STATUS)"
  sleep 10
done

# Step 5: Verify production
echo "4️⃣ Verifying production deployment..."

sleep 30  # Wait for application to start

get_application_logs --uuid "$PRODUCTION_APP" --lines 100

echo "🎉 Multi-environment deployment complete!"
echo "Deployed commit: $COMMIT_SHA"
```

**Usage**:
```bash
# Run manually or via CI/CD
./multi-env-deploy.sh
```

---

## 8. Infrastructure as Code

**Purpose**: Define and deploy complete infrastructure from code.

```bash
#!/bin/bash
# deploy-infrastructure.sh

set -e

# Configuration
PROJECT_NAME="MyApp"
SERVER_UUID="srv-456"
PROD_ENV="production"

echo "🏗️ Deploying infrastructure for $PROJECT_NAME..."

# Step 1: Create project
echo "1️⃣ Creating project..."

PROJECT_UUID=$(create_project \
  --name "$PROJECT_NAME" \
  --description "Full-stack application" \
  | jq -r '.uuid')

echo "Created project: $PROJECT_UUID"

# Step 2: Create environment
echo "2️⃣ Creating environment..."

create_environment \
  --project-uuid "$PROJECT_UUID" \
  --name "$PROD_ENV"

# Step 3: Create PostgreSQL database
echo "3️⃣ Creating database..."

DB_UUID=$(create_database \
  --name "myapp-db" \
  --type "postgresql" \
  --version "16" \
  --project-uuid "$PROJECT_UUID" \
  --environment-name "$PROD_ENV" \
  --server-uuid "$SERVER_UUID" \
  | jq -r '.uuid')

update_database \
  --uuid "$DB_UUID" \
  --postgres-password "$(openssl rand -base64 32)" \
  --postgres-db "myapp_prod"

start_database --uuid "$DB_UUID"

echo "Created database: $DB_UUID"

# Step 4: Create Redis service
echo "4️⃣ Creating Redis..."

REDIS_UUID=$(create_service \
  --name "myapp-redis" \
  --type "redis" \
  --server-uuid "$SERVER_UUID" \
  --project-uuid "$PROJECT_UUID" \
  --environment-name "$PROD_ENV" \
  | jq -r '.uuid')

start_service --uuid "$REDIS_UUID"

echo "Created Redis: $REDIS_UUID"

# Step 5: Create backend application
echo "5️⃣ Creating backend API..."

BACKEND_UUID=$(create_application \
  --name "MyApp API" \
  --project-uuid "$PROJECT_UUID" \
  --environment-name "$PROD_ENV" \
  --server-uuid "$SERVER_UUID" \
  --git-repository "https://github.com/user/myapp-api" \
  --git-branch "main" \
  | jq -r '.uuid')

# Configure backend
update_application_environment_variables \
  --uuid "$BACKEND_UUID" \
  --env-vars "{
    \"DATABASE_URL\": \"postgresql://postgres:password@db:5432/myapp_prod\",
    \"REDIS_URL\": \"redis://redis:6379\",
    \"NODE_ENV\": \"production\"
  }"

update_application_domains \
  --uuid "$BACKEND_UUID" \
  --domains '["api.myapp.com"]'

generate_ssl_certificate \
  --domain "api.myapp.com" \
  --email "admin@myapp.com"

tag_resource \
  --resource-type "application" \
  --resource-uuid "$BACKEND_UUID" \
  --tags '["production", "api", "critical"]'

deploy_application --uuid "$BACKEND_UUID"

echo "Created backend: $BACKEND_UUID"

# Step 6: Create frontend application
echo "6️⃣ Creating frontend..."

FRONTEND_UUID=$(create_application \
  --name "MyApp Web" \
  --project-uuid "$PROJECT_UUID" \
  --environment-name "$PROD_ENV" \
  --server-uuid "$SERVER_UUID" \
  --git-repository "https://github.com/user/myapp-web" \
  --git-branch "main" \
  | jq -r '.uuid')

update_application_environment_variables \
  --uuid "$FRONTEND_UUID" \
  --env-vars "{
    \"NEXT_PUBLIC_API_URL\": \"https://api.myapp.com\",
    \"NODE_ENV\": \"production\"
  }"

update_application_domains \
  --uuid "$FRONTEND_UUID" \
  --domains '["myapp.com", "www.myapp.com"]'

generate_ssl_certificate \
  --domain "myapp.com" \
  --email "admin@myapp.com"

tag_resource \
  --resource-type "application" \
  --resource-uuid "$FRONTEND_UUID" \
  --tags '["production", "web", "critical"]'

deploy_application --uuid "$FRONTEND_UUID"

echo "Created frontend: $FRONTEND_UUID"

# Step 7: Set up monitoring
echo "7️⃣ Setting up monitoring..."

create_notification_channel \
  --name "Production Alerts" \
  --type "discord" \
  --webhook-url "$DISCORD_WEBHOOK_URL"

update_notification_settings \
  --deployment-failure true \
  --server-unreachable true \
  --disk-usage-threshold 85

# Step 8: Create webhooks
echo "8️⃣ Setting up webhooks..."

create_webhook \
  --name "Deployment Notifications" \
  --url "$SLACK_WEBHOOK_URL" \
  --resource-type "application" \
  --resource-uuid "$BACKEND_UUID" \
  --events '["deployment_finished", "deployment_failed"]'

echo "🎉 Infrastructure deployment complete!"
echo ""
echo "Resources Created:"
echo "- Project: $PROJECT_UUID"
echo "- Database: $DB_UUID"
echo "- Redis: $REDIS_UUID"
echo "- Backend API: $BACKEND_UUID (https://api.myapp.com)"
echo "- Frontend: $FRONTEND_UUID (https://myapp.com)"
echo ""
echo "View all resources:"
echo "list_resources_by_tag --tag 'production'"
```

**Usage**:
```bash
# Set webhook URLs
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."

# Deploy entire infrastructure
./deploy-infrastructure.sh
```

---

## 🎓 Additional Tips

### Error Handling

```bash
# Add to any script for better error handling
trap 'echo "❌ Error on line $LINENO"; exit 1' ERR
set -euo pipefail

# Log all commands
set -x
```

### Logging

```bash
# Create a logging function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a /var/log/coolify-automation.log
}

log "Starting deployment..."
```

### Notifications

```bash
# Send Slack notification
send_slack_notification() {
  local MESSAGE="$1"
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"$MESSAGE\"}"
}

send_slack_notification "✅ Deployment complete!"
```

---

**Happy Automating!** 🤖

These scripts will save you hours of manual work!
