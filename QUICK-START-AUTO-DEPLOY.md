# 🚀 Quick Start: Auto-Deploy Setup

**Get auto-deploy running in 5 minutes!**

---

## 📦 What You Get

✅ **Automatic deployments** when you push to GitHub
✅ **Branch-specific environments** (main = prod, develop = staging)
✅ **Health checks** after every deployment
✅ **Automatic rollback** on failure
✅ **Slack notifications** (optional)

---

## ⚡ 5-Minute Setup

### Step 1: Run Setup Script (2 minutes)

```bash
cd /home/avi/projects/coolify/coolify-mcp

# Run the setup helper
./scripts/setup-auto-deploy.sh

# Follow the prompts:
# 1. Enter your application name
# 2. Enter staging UUID (optional)
# 3. Enter target directory (where your app code is)
```

This will:
- ✅ Test Coolify API connection
- ✅ Find your application UUID
- ✅ Create `.coolify/deploy.json` config
- ✅ Show you the next steps

---

### Step 2: Import N8N Workflow (1 minute)

1. **Open N8N:** https://n8n.theprofitplatform.com.au

2. **Import workflow:**
   - Click: `+` → `Import from File`
   - Choose: **Simple** or **Advanced**
     - **Simple:** `n8n-examples/github-to-coolify.json`
     - **Advanced:** `n8n-examples/advanced-auto-deploy.json` (has health checks & rollback)

3. **Update the workflow:**
   - Click on "Deploy to Coolify" node
   - Replace `YOUR-APP-UUID` with your actual UUID
   - Check the authorization token is correct

4. **Activate:**
   - Toggle "Active" switch at top right

5. **Copy webhook URL:**
   - Should be: `https://n8n.theprofitplatform.com.au/webhook/github-deploy`

---

### Step 3: Configure GitHub Webhook (1 minute)

1. **Go to your GitHub repository**

2. **Settings → Webhooks → Add webhook**

3. **Configure:**
   ```
   Payload URL: https://n8n.theprofitplatform.com.au/webhook/github-deploy
   Content type: application/json
   Events: Just the push event
   Active: ✓ Checked
   ```

4. **Save** → GitHub will send a test ping

---

### Step 4: Test It! (1 minute)

```bash
# Make a small change
echo "# Auto-deploy test" >> README.md

# Commit and push
git add README.md
git commit -m "test: auto-deploy"
git push origin main  # or develop for staging
```

**Watch it work:**
- 📊 **N8N:** https://n8n.theprofitplatform.com.au → Executions
- 🚀 **Coolify:** https://coolify.theprofitplatform.com.au → Your app → Deployments
- ✅ **Your site:** https://app.theprofitplatform.com.au (or test subdomain)

---

## 🎯 What You Created

### Files Created

```
your-app-repo/
└── .coolify/
    └── deploy.json          # Deployment configuration

coolify-mcp/
├── templates/
│   └── deploy-config-template.json    # Template for new apps
├── scripts/
│   └── setup-auto-deploy.sh           # Setup helper script
└── n8n-examples/
    ├── github-to-coolify.json         # Simple workflow
    └── advanced-auto-deploy.json      # Advanced workflow with health checks
```

### N8N Workflow (Simple)

```
GitHub Push
    ↓
Webhook
    ↓
Filter Branch (main/develop)
    ↓
Deploy to Coolify
    ↓
Notify Slack (optional)
    ↓
Done ✅
```

### N8N Workflow (Advanced)

```
GitHub Push
    ↓
Webhook
    ↓
Parse Data
    ↓
Pre-Deploy Health Check
    ↓
Deploy to Coolify
    ↓
Wait 30 seconds
    ↓
Post-Deploy Health Check
    ↓
Success? ─Yes→ Notify Success ✅
    │
    └─No→ Rollback → Notify Failure ❌
```

---

## 🔧 Configuration Options

### Deployment Config (`.coolify/deploy.json`)

```json
{
  "environments": {
    "production": {
      "branch": "main",
      "domain": "app.theprofitplatform.com.au",
      "coolify_app_id": "your-uuid",
      "force_rebuild": true,        // Full rebuild on deploy
      "run_tests": true,            // Run tests before deploy
      "health_check": true          // Check health after deploy
    }
  }
}
```

**Key Options:**
- `force_rebuild: true` - Always rebuild from scratch (slower but safer)
- `force_rebuild: false` - Use cached layers (faster)
- `run_tests: true` - Run test suite before deploying
- `health_check: true` - Verify app is healthy after deploy

---

## 📊 Monitoring

### Check Deployment Status

**N8N Dashboard:**
```
https://n8n.theprofitplatform.com.au
→ Executions
→ See all workflow runs
```

**Coolify Dashboard:**
```
https://coolify.theprofitplatform.com.au
→ Your Application
→ Deployments tab
→ View logs
```

### Common Status Messages

| Status | Meaning |
|--------|---------|
| 🟢 Green | Deployment successful |
| 🔴 Red | Deployment failed |
| 🟡 Yellow | Deployment in progress |

---

## 🐛 Troubleshooting

### Webhook Not Triggering?

**Check:**
```bash
# Test webhook manually
curl -X POST https://n8n.theprofitplatform.com.au/webhook/github-deploy \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","repository":{"name":"test"}}'
```

**Fix:**
- ✅ Workflow is active in N8N
- ✅ Webhook URL matches in GitHub
- ✅ GitHub webhook shows green checkmark

---

### Deployment Fails?

**Check:**
```bash
# Verify API connection
curl -H "Authorization: Bearer vznmZXqYMofVoZn6SjWCVOOmPa7pm1fd3CSz6GSqf8c6f674" \
     https://coolify.theprofitplatform.com.au/api/v1/applications/YOUR-UUID
```

**Fix:**
- ✅ Application UUID is correct
- ✅ API token has deploy permissions
- ✅ Application is not already deploying
- ✅ Check Coolify deployment logs

---

### Health Check Fails?

**Check your app has `/health` endpoint:**

```javascript
// Express.js example
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

**Or disable health checks:**
```json
{
  "environments": {
    "production": {
      "health_check": false
    }
  }
}
```

---

## 🎓 Next Steps

### Add Slack Notifications

1. **Get Slack webhook URL:**
   - Go to: https://api.slack.com/apps
   - Create app → Incoming Webhooks
   - Copy webhook URL

2. **Update deployment config:**
   ```json
   {
     "notifications": {
       "slack_webhook": "https://hooks.slack.com/...",
       "enabled": true
     }
   }
   ```

3. **Enable in N8N:**
   - Edit workflow
   - Enable "Notify Slack" node
   - Configure with your webhook

---

### Add Multiple Environments

**Create separate apps in Coolify:**
```bash
# Production
https://app.theprofitplatform.com.au

# Staging
https://test.theprofitplatform.com.au

# Development
https://dev.theprofitplatform.com.au
```

**Update deploy config:**
```json
{
  "environments": {
    "production": { "branch": "main", ... },
    "staging": { "branch": "develop", ... },
    "development": { "branch": "dev", ... }
  }
}
```

---

### Add Database Migrations

**Update N8N workflow to run migrations:**

1. Add "Execute Command" node after deployment
2. Configure:
   ```
   POST /api/v1/applications/{uuid}/execute
   Body: { "command": "npm run migrate" }
   ```

---

## 📚 More Information

**Full documentation:** `AUTO-DEPLOY-SETUP.md`

**Setup script help:**
```bash
./scripts/setup-auto-deploy.sh --help
```

**N8N workflows:**
- Simple: `n8n-examples/github-to-coolify.json`
- Advanced: `n8n-examples/advanced-auto-deploy.json`

**Coolify API docs:** https://coolify.io/docs/api

---

## ✅ Success Checklist

- [ ] Setup script completed successfully
- [ ] N8N workflow imported and active
- [ ] GitHub webhook configured
- [ ] Test deployment successful
- [ ] Health checks passing
- [ ] Notifications working (if enabled)

---

## 💬 Need Help?

**Common issues and solutions:** See `AUTO-DEPLOY-SETUP.md` → Troubleshooting section

**Test your setup:**
```bash
# Run the setup script again to verify configuration
./scripts/setup-auto-deploy.sh
```

---

**🎉 Congratulations! Your auto-deploy is ready!**

Push code → Automatic deployment → Your app is live! 🚀
