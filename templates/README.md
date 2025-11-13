# 📁 Deployment Templates

This directory contains templates for setting up automated deployments with Coolify.

---

## 📄 Available Templates

### `deploy-config-template.json`

**Purpose:** Deployment configuration for applications managed by Coolify

**Usage:**
```bash
# Automatically via setup script
./scripts/setup-auto-deploy.sh my-app

# Or manually copy to your application
cp templates/deploy-config-template.json /path/to/your/app/.coolify/deploy.json
```

**Then edit the config:**
- Replace `YOUR-PRODUCTION-APP-UUID` with your actual UUID
- Replace `YOUR-STAGING-APP-UUID` with your staging UUID
- Update domains to match your setup
- Configure notification settings

---

## 🎯 Template Structure

```json
{
  "environments": {
    "production": {
      "branch": "main",                     // Git branch to deploy
      "domain": "app.example.com",          // Production domain
      "coolify_app_id": "uuid-here",        // Coolify application UUID
      "force_rebuild": true,                // Rebuild from scratch?
      "run_tests": true,                    // Run tests before deploy?
      "health_check": true                  // Check health after deploy?
    }
  }
}
```

---

## 🔧 Configuration Options

### Environment Settings

| Option | Type | Description |
|--------|------|-------------|
| `branch` | string | Git branch name |
| `domain` | string | Application domain |
| `coolify_app_id` | string | UUID from Coolify |
| `force_rebuild` | boolean | Full rebuild vs cached |
| `run_tests` | boolean | Run test suite |
| `health_check` | boolean | Verify health after deploy |
| `health_check_url` | string | Custom health endpoint |

### Deployment Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | 600 | Max deployment time (seconds) |
| `max_retries` | number | 3 | Retry attempts on failure |
| `health_check_delay` | number | 30 | Wait before health check (seconds) |

### Notifications

| Option | Type | Description |
|--------|------|-------------|
| `slack_webhook` | string | Slack webhook URL |
| `enabled` | boolean | Enable notifications |

### Rollback

| Option | Type | Description |
|--------|------|-------------|
| `auto_rollback_on_failure` | boolean | Auto rollback on deploy failure |
| `keep_previous_versions` | number | How many versions to keep |

---

## 💡 Usage Examples

### Basic Setup

```json
{
  "environments": {
    "production": {
      "branch": "main",
      "domain": "app.theprofitplatform.com.au",
      "coolify_app_id": "abc-123-def",
      "force_rebuild": true,
      "health_check": true
    }
  }
}
```

### Multi-Environment Setup

```json
{
  "environments": {
    "production": {
      "branch": "main",
      "domain": "app.theprofitplatform.com.au",
      "coolify_app_id": "prod-uuid",
      "force_rebuild": true
    },
    "staging": {
      "branch": "develop",
      "domain": "test.theprofitplatform.com.au",
      "coolify_app_id": "staging-uuid",
      "force_rebuild": false
    },
    "development": {
      "branch": "dev",
      "domain": "dev.theprofitplatform.com.au",
      "coolify_app_id": "dev-uuid",
      "force_rebuild": false
    }
  }
}
```

### With Slack Notifications

```json
{
  "environments": {
    "production": {
      "branch": "main",
      "coolify_app_id": "uuid",
      "health_check": true
    }
  },
  "notifications": {
    "slack_webhook": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "enabled": true
  }
}
```

### Custom Health Check

```json
{
  "environments": {
    "production": {
      "branch": "main",
      "coolify_app_id": "uuid",
      "health_check": true,
      "health_check_url": "https://app.theprofitplatform.com.au/api/health"
    }
  },
  "healthChecks": {
    "enabled": true,
    "endpoint": "/api/health",
    "timeout": 30,
    "retry_count": 5,
    "retry_delay": 5
  }
}
```

---

## 🚀 Quick Start

1. **Run setup script:**
   ```bash
   ./scripts/setup-auto-deploy.sh my-app
   ```

2. **Review generated config:**
   ```bash
   cat /path/to/your/app/.coolify/deploy.json
   ```

3. **Commit to your repo:**
   ```bash
   git add .coolify/deploy.json
   git commit -m "feat: add Coolify deployment config"
   git push
   ```

4. **Set up N8N workflow** (see `QUICK-START-AUTO-DEPLOY.md`)

5. **Configure GitHub webhook** (see `QUICK-START-AUTO-DEPLOY.md`)

---

## 📚 Documentation

- **Quick Start:** `../QUICK-START-AUTO-DEPLOY.md`
- **Full Guide:** `../AUTO-DEPLOY-SETUP.md`
- **Setup Script:** `../scripts/setup-auto-deploy.sh`
- **N8N Workflows:** `../n8n-examples/`

---

## 🎯 Best Practices

### Production Deployments

✅ **Use `force_rebuild: true`**
- Ensures clean build environment
- Prevents cached dependency issues
- More reliable but slower

✅ **Enable health checks**
- Verify application is working
- Catch deployment issues early
- Enable auto-rollback on failure

✅ **Keep multiple versions**
- Set `keep_previous_versions: 5`
- Allows quick rollback
- Useful for debugging

### Staging Deployments

✅ **Use `force_rebuild: false`**
- Faster deployments
- Good for testing
- Cache helps with iteration speed

✅ **Auto-deploy on push**
- No manual approval needed
- Test features quickly
- Validate before production

### Development Deployments

✅ **Minimal checks**
- Skip tests if not needed
- No health checks
- Fast feedback loop

---

## 🔄 Updating Templates

To update the template for all future applications:

```bash
# Edit the template
nano templates/deploy-config-template.json

# New applications will use updated template
./scripts/setup-auto-deploy.sh new-app
```

---

## 💬 Need Help?

**Setup issues?** Run the setup script with verbose output:
```bash
DEBUG=1 ./scripts/setup-auto-deploy.sh
```

**More documentation:**
- Quick Start: `../QUICK-START-AUTO-DEPLOY.md`
- Full Guide: `../AUTO-DEPLOY-SETUP.md`
- Project Status: `../PROJECT-STATUS.md`

---

**Template version:** 1.0.0
**Last updated:** 2025-11-13
