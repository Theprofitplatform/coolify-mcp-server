# 🚀 Coolify MCP Quick Start Guide

**Welcome!** This guide will get you up and running with the Coolify MCP in minutes.

---

## 📋 Prerequisites

- Coolify instance running
- API token from Coolify (Settings → API Tokens)
- Droid or Claude Code configured

---

## ⚡ 5-Minute Quick Start

### 1. Verify Connection

```bash
# Check Coolify version and health
get_version
health_check

# View your teams
list_teams
```

### 2. List Your Resources

```bash
# See all servers
list_servers

# See all applications
list_applications

# See all databases
list_databases
```

### 3. Deploy Your First App

```bash
# Create application
create_application \
  --name "My API" \
  --project-uuid "proj-123" \
  --environment-name "production" \
  --server-uuid "srv-456" \
  --git-repository "https://github.com/user/repo" \
  --git-branch "main"

# Deploy it
deploy_application --uuid "app-789"

# Watch deployment
get_deployment --uuid "deploy-xyz"

# View logs
get_application_logs --uuid "app-789"
```

---

## 🎯 Common Workflows

### Deploy Application with Custom Domain + SSL

```bash
# 1. Create application
create_application \
  --name "Production API" \
  --project-uuid "proj-123" \
  --environment-name "production" \
  --server-uuid "srv-456" \
  --git-repository "https://github.com/user/api" \
  --git-branch "main"

# 2. Add custom domain
update_application_domains \
  --uuid "app-789" \
  --domains '["api.example.com"]'

# 3. Generate SSL certificate
generate_ssl_certificate \
  --domain "api.example.com" \
  --email "admin@example.com"

# 4. Deploy
deploy_application --uuid "app-789"

# 5. Verify
get_application --uuid "app-789"
get_ssl_certificate --domain "api.example.com"
```

### Set Up Database with Backups

```bash
# 1. Create PostgreSQL database
create_database \
  --name "prod-db" \
  --type "postgresql" \
  --version "16" \
  --project-uuid "proj-123" \
  --environment-name "production" \
  --server-uuid "srv-456"

# 2. Configure environment variables
update_database \
  --uuid "db-123" \
  --postgres-password "secure-password"

# 3. Start database
start_database --uuid "db-123"

# 4. Create backup
backup_database \
  --uuid "db-123" \
  --destination "s3"

# 5. List backups
# (Use get_database to see backup info)
get_database --uuid "db-123"
```

### Set Up Monitoring & Alerts

```bash
# 1. Create Discord notification channel
create_notification_channel \
  --name "Production Alerts" \
  --type "discord" \
  --webhook-url "https://discord.com/api/webhooks/..."

# 2. Configure notification settings
update_notification_settings \
  --deployment-failure true \
  --server-unreachable true \
  --disk-usage-threshold 90

# 3. Test notification
test_notification_channel --uuid "notif-123"

# 4. Get system status
get_system_status
```

### Environment Variable Management

```bash
# 1. View current env vars
get_application_environment_variables --uuid "app-789"

# 2. Set individual var
set_application_environment_variable \
  --uuid "app-789" \
  --key "API_KEY" \
  --value "secret-key"

# 3. Bulk update multiple vars
update_application_environment_variables \
  --uuid "app-789" \
  --env-vars '{"DATABASE_URL":"postgresql://...","REDIS_URL":"redis://..."}' \
  --restart-after-update true

# 4. Delete old var
delete_application_environment_variable \
  --uuid "app-789" \
  --key "OLD_CONFIG"
```

---

## 🔥 Advanced Workflows

### CI/CD Pipeline

```bash
# 1. List available branches
get_git_branches --uuid "app-789"

# 2. View recent commits
get_git_commits \
  --uuid "app-789" \
  --branch "main" \
  --limit 10

# 3. Deploy specific commit
trigger_git_deployment \
  --uuid "app-789" \
  --commit-sha "abc123def456"

# 4. Watch deployment
list_deployments --uuid "app-789"

# 5. Rollback if needed
rollback_deployment \
  --uuid "app-789" \
  --version "v1.2.3"
```

### Webhook Integration

```bash
# 1. Create webhook for deployment events
create_webhook \
  --name "Slack Notifications" \
  --url "https://hooks.slack.com/..." \
  --resource-type "application" \
  --resource-uuid "app-789" \
  --events '["deployment_started", "deployment_finished", "deployment_failed"]'

# 2. List all webhooks
list_webhooks

# 3. Update webhook
update_webhook \
  --uuid "webhook-123" \
  --enabled true

# 4. Delete webhook
delete_webhook --uuid "webhook-123"
```

### Resource Organization

```bash
# 1. Tag production resources
tag_resource \
  --resource-type "application" \
  --resource-uuid "app-789" \
  --tags '["production", "critical", "api"]'

tag_resource \
  --resource-type "database" \
  --resource-uuid "db-123" \
  --tags '["production", "critical", "postgres"]'

# 2. List all production resources
list_resources_by_tag --tag "production"

# 3. Search for specific resources
search_resources --query "postgres production"
```

### Batch Operations

```bash
# 1. Restart all staging applications
batch_restart_applications \
  --application-uuids '["app-1", "app-2", "app-3"]'

# 2. Update env vars across multiple apps
batch_update_env_vars \
  --application-uuids '["app-1", "app-2"]' \
  --env-vars '{"API_KEY":"new-key"}' \
  --restart-after-update true

# 3. Stop all test services
batch_stop_services \
  --service-uuids '["srv-1", "srv-2", "srv-3"]'
```

---

## 🎨 Best Practices

### 1. Use Tags for Organization

```bash
# Tag by environment
tag_resource --resource-type "application" --resource-uuid "app-1" --tags '["production"]'
tag_resource --resource-type "application" --resource-uuid "app-2" --tags '["staging"]'
tag_resource --resource-type "application" --resource-uuid "app-3" --tags '["development"]'

# Tag by team
tag_resource --resource-type "application" --resource-uuid "app-1" --tags '["team-api"]'
tag_resource --resource-type "application" --resource-uuid "app-2" --tags '["team-web"]'

# Tag by criticality
tag_resource --resource-type "application" --resource-uuid "app-1" --tags '["critical"]'
```

### 2. Always Check Before Deploy

```bash
# 1. Check current status
get_application --uuid "app-789"

# 2. View recent deployments
list_deployments --uuid "app-789"

# 3. Check environment variables
get_application_environment_variables --uuid "app-789"

# 4. Deploy
deploy_application --uuid "app-789"

# 5. Monitor
get_deployment_logs --uuid "deploy-xyz"
```

### 3. Set Up Monitoring First

```bash
# Before deploying to production:
# 1. Set up notification channels
create_notification_channel --name "Alerts" --type "discord" --webhook-url "..."

# 2. Configure alert thresholds
update_notification_settings \
  --deployment-failure true \
  --server-unreachable true \
  --disk-usage-threshold 85

# 3. Create webhooks for external monitoring
create_webhook --name "Datadog" --url "https://..."

# 4. Test everything
test_notification_channel --uuid "notif-123"
```

### 4. Use Batch Operations

```bash
# Instead of individual restarts:
restart_application --uuid "app-1"
restart_application --uuid "app-2"
restart_application --uuid "app-3"

# Use batch operations (10x faster!):
batch_restart_applications \
  --application-uuids '["app-1", "app-2", "app-3"]'
```

---

## 🔍 Troubleshooting

### Deployment Failed

```bash
# 1. Check deployment logs
get_deployment_logs --uuid "deploy-xyz"

# 2. Check application logs
get_application_logs --uuid "app-789" --lines 500

# 3. Check deployment settings
get_deployment_settings --uuid "app-789"

# 4. Rollback if needed
rollback_deployment --uuid "app-789"
```

### Database Not Starting

```bash
# 1. Check database status
get_database --uuid "db-123"

# 2. View database logs
get_database_logs --uuid "db-123" --lines 200

# 3. Check server resources
get_server_resources --uuid "srv-456"

# 4. Restart database
restart_database --uuid "db-123"
```

### SSL Certificate Issues

```bash
# 1. Check certificate status
get_ssl_certificate --domain "app.example.com"

# 2. List all certificates
list_ssl_certificates

# 3. Check domain configuration
get_application_domains --uuid "app-789"

# 4. Regenerate if needed
delete_ssl_certificate --uuid "cert-123"
generate_ssl_certificate --domain "app.example.com" --email "admin@example.com"
```

### Can't Find Resources

```bash
# 1. Search across all resources
search_resources --query "your-search-term"

# 2. List by tag
list_resources_by_tag --tag "production"

# 3. List by type
list_applications
list_databases
list_services
```

---

## 📚 Next Steps

### Learn More:
- Read **USAGE-EXAMPLES.md** for detailed scenarios
- Check **WORKFLOW-TUTORIALS.md** for step-by-step guides
- Review **AUTOMATION-SCRIPTS.md** for automation examples
- See **BEST-PRACTICES.md** for production tips

### Get Help:
- Check tool documentation in **README.md**
- View all 125 tools and their parameters
- Test tools in a non-production environment first

### Automate:
- Create shell scripts with these tools
- Build CI/CD pipelines
- Set up monitoring dashboards
- Automate routine tasks

---

**Happy Deploying!** 🚀

You now have access to 125 powerful tools to automate your entire Coolify infrastructure!
