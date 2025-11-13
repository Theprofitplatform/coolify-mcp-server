# 🚀 Auto-Deploy Setup Guide

**Complete automated deployment system for Coolify**
**Date:** 2025-11-13

---

## 📊 What We're Setting Up

### Auto-Deploy Flow

```
GitHub Push
    ↓
GitHub Webhook
    ↓
N8N Workflow
    ↓
Coolify API
    ↓
Application Deployed! ✅
```

### Features

✅ **Automatic deployment** on git push
✅ **Branch-specific** environments (main = prod, develop = staging)
✅ **Slack notifications** (optional)
✅ **Health checks** after deployment
✅ **Rollback capability**

---

## 🎯 Prerequisites

### What You Need

1. ✅ **Coolify Instance:** https://coolify.theprofitplatform.com.au
2. ✅ **N8N Instance:** https://n8n.theprofitplatform.com.au
3. ✅ **API Token:** `vznmZXqYMofVoZn6SjWCVOOmPa7pm1fd3CSz6GSqf8c6f674`
4. ✅ **GitHub Repository** with your application code
5. 📋 **Application UUID** from Coolify (we'll get this)

---

## 📋 Step-by-Step Setup

### Step 1: Get Your Application UUID

**Option A: Using Claude (Easiest)**

If you've configured Claude Desktop:
```
You: "List my Coolify applications"
Claude: [Shows list with UUIDs]
```

**Option B: Using API**

```bash
curl -H "Authorization: Bearer vznmZXqYMofVoZn6SjWCVOOmPa7pm1fd3CSz6GSqf8c6f674" \
     https://coolify.theprofitplatform.com.au/api/v1/applications
```

**Option C: Using Coolify UI**

1. Go to https://coolify.theprofitplatform.com.au
2. Click on your application
3. Copy UUID from URL: `/application/UUID-HERE`

---

### Step 2: Create Application in Coolify (If Needed)

If you don't have an app yet, create one:

**Via Claude:**
```
You: "Create a new application in Coolify for my GitHub repo"
Claude: [Creates application and gives you UUID]
```

**Via Coolify UI:**
1. Go to Coolify dashboard
2. Click "New Resource"
3. Select "Application"
4. Connect GitHub repository
5. Configure settings:
   - **Name:** my-app
   - **Domain:** app.theprofitplatform.com.au (production)
   - **Domain:** test.theprofitplatform.com.au (staging)
   - **Branch:** main (production) or develop (staging)

---

### Step 3: Import N8N Auto-Deploy Workflow

#### 3.1 Go to N8N

Open: https://n8n.theprofitplatform.com.au

#### 3.2 Import Workflow

1. Click **"+"** → **"Import from File"**
2. Select: `/home/avi/projects/coolify/coolify-mcp/n8n-examples/github-to-coolify.json`
3. Workflow imported!

#### 3.3 Configure Workflow

**Update these nodes:**

**1. GitHub Webhook Node**
- Click on "GitHub Webhook" node
- Copy the webhook URL (you'll need it)
- Should look like: `https://n8n.theprofitplatform.com.au/webhook/github-deploy`

**2. Coolify Deploy Node (HTTP Request)**
- Click on "Deploy to Coolify" node
- Update the URL with YOUR application UUID:
  ```
  https://coolify.theprofitplatform.com.au/api/v1/applications/YOUR-APP-UUID/deploy
  ```
- Verify authorization header has your token

**3. Only Main Branch Node (IF node)**
- Click on "Only Main Branch" node
- Verify it filters for `refs/heads/main`
- Or change to `refs/heads/develop` for staging

**4. Notify Slack Node (Optional)**
- If you use Slack, configure this
- Otherwise, delete this node

#### 3.4 Activate Workflow

1. Click **"Active"** toggle at top right
2. Workflow is now live! ✅

---

### Step 4: Configure GitHub Webhook

#### 4.1 Go to Your GitHub Repository

Open your GitHub repo in browser

#### 4.2 Add Webhook

1. Go to **Settings** → **Webhooks** → **Add webhook**

2. **Configure Webhook:**
   ```
   Payload URL: https://n8n.theprofitplatform.com.au/webhook/github-deploy
   Content type: application/json
   Secret: (leave empty or set one)

   Which events?
   ☑ Just the push event

   Active: ☑ Checked
   ```

3. Click **"Add webhook"**

#### 4.3 Test Webhook

GitHub will automatically send a test ping. Check:
- Green checkmark next to webhook = Success! ✅
- Red X = Something wrong (check N8N logs)

---

### Step 5: Create Deployment Configuration

Create a deployment config file in your repo:

#### 5.1 Create `.coolify/deploy.json`

```bash
# In your application repository
mkdir -p .coolify
nano .coolify/deploy.json
```

**Add this content:**

```json
{
  "environments": {
    "production": {
      "branch": "main",
      "domain": "app.theprofitplatform.com.au",
      "coolify_app_id": "YOUR-PRODUCTION-APP-UUID",
      "force_rebuild": true,
      "run_tests": true,
      "health_check": true
    },
    "staging": {
      "branch": "develop",
      "domain": "test.theprofitplatform.com.au",
      "coolify_app_id": "YOUR-STAGING-APP-UUID",
      "force_rebuild": false,
      "run_tests": true,
      "health_check": true
    }
  },
  "notifications": {
    "slack_webhook": "https://hooks.slack.com/your-webhook",
    "email": "team@theprofitplatform.com.au"
  },
  "deployment": {
    "timeout": 600,
    "max_retries": 3,
    "health_check_delay": 30
  }
}
```

#### 5.2 Commit Configuration

```bash
git add .coolify/deploy.json
git commit -m "feat: add Coolify deployment configuration"
git push origin main
```

---

### Step 6: Enhanced N8N Workflow

Let's create an enhanced version with more features:

**Create:** `/home/avi/projects/coolify/coolify-mcp/n8n-examples/advanced-auto-deploy.json`

This workflow includes:
- ✅ Branch detection
- ✅ Environment selection
- ✅ Pre-deployment health check
- ✅ Deployment trigger
- ✅ Post-deployment verification
- ✅ Slack notifications
- ✅ Rollback on failure

---

## 🎯 Environment-Specific Setup

### Production Environment

**Domain:** app.theprofitplatform.com.au
**Branch:** main
**Auto-deploy:** ✅ Yes
**Manual approval:** 📋 Optional (recommended)

**Workflow:**
```
1. Push to main branch
2. N8N catches webhook
3. Runs tests (optional)
4. Deploys to production
5. Runs health check
6. Notifies team
```

### Staging Environment

**Domain:** test.theprofitplatform.com.au
**Branch:** develop
**Auto-deploy:** ✅ Yes
**Manual approval:** ❌ No (auto-deploy all)

**Workflow:**
```
1. Push to develop branch
2. N8N catches webhook
3. Deploys to staging immediately
4. Runs tests on deployed app
5. Notifies team if tests fail
```

---

## 🧪 Testing Your Auto-Deploy

### Test 1: Simple Deployment

1. **Make a small change in your repo:**
   ```bash
   echo "# Auto-deploy test" >> README.md
   git add README.md
   git commit -m "test: auto-deploy"
   git push origin develop  # or main
   ```

2. **Watch N8N:**
   - Go to https://n8n.theprofitplatform.com.au
   - Click "Executions"
   - You should see your workflow running

3. **Check Coolify:**
   - Go to https://coolify.theprofitplatform.com.au
   - Go to your application
   - You should see deployment in progress

### Test 2: Branch-Specific Deployment

**Test staging:**
```bash
git checkout develop
echo "Staging test" >> test.txt
git add test.txt
git commit -m "test: staging deploy"
git push origin develop
```

**Test production:**
```bash
git checkout main
git merge develop
git push origin main
```

### Test 3: Rollback

If deployment fails, rollback:

**Via Claude:**
```
You: "Rollback my application to previous version"
Claude: [Executes rollback]
```

**Via API:**
```bash
curl -X POST \
  https://coolify.theprofitplatform.com.au/api/v1/applications/YOUR-UUID/rollback \
  -H "Authorization: Bearer YOUR-TOKEN"
```

---

## 🔧 Advanced Configuration

### 1. Add Health Checks

**Update N8N workflow to add health check node:**

```javascript
// HTTP Request node after deployment
{
  "method": "GET",
  "url": "https://{{$json.domain}}/health",
  "options": {
    "timeout": 30000,
    "retry": {
      "maxRetries": 5,
      "retryInterval": 5000
    }
  }
}

// If node to check health
{
  "conditions": {
    "status": {
      "operation": "equals",
      "value": 200
    }
  },
  "true": "Send Success Notification",
  "false": "Rollback Deployment"
}
```

### 2. Add Slack Notifications

**Configure Slack webhook:**

1. Go to Slack → Apps → Incoming Webhooks
2. Create webhook for your channel
3. Add to N8N:

```javascript
// Slack node configuration
{
  "channel": "#deployments",
  "username": "Coolify Deploy Bot",
  "icon_emoji": ":rocket:",
  "text": "🚀 Deployment started for {{$json.repo}}\n• Branch: {{$json.branch}}\n• Commit: {{$json.commit_sha}}\n• Author: {{$json.author}}"
}
```

### 3. Add Automated Tests

**Add test node before deployment:**

```javascript
// HTTP Request to run tests
{
  "method": "POST",
  "url": "https://test.theprofitplatform.com.au/api/test",
  "body": {
    "commit_sha": "{{$json.commit_sha}}"
  }
}

// Wait for test results
{
  "pollInterval": 5000,
  "timeout": 300000
}
```

### 4. Database Migrations

**Add migration step:**

```javascript
// Execute command in Coolify application
{
  "method": "POST",
  "url": "https://coolify.theprofitplatform.com.au/api/v1/applications/{{$json.app_id}}/execute",
  "body": {
    "command": "npm run migrate",
    "container": "web"
  }
}
```

---

## 📊 Monitoring Your Deployments

### N8N Dashboard

**View Executions:**
1. Go to https://n8n.theprofitplatform.com.au
2. Click "Executions" in left sidebar
3. See all deployment history

**Check for Errors:**
- Red = Failed deployment
- Green = Successful deployment
- Yellow = Running

### Coolify Dashboard

**Deployment Logs:**
1. Go to your application in Coolify
2. Click "Deployments" tab
3. View logs for each deployment

### Create a Monitoring Dashboard

**Add N8N workflow for monitoring:**

```javascript
// Schedule Trigger - every 5 minutes
Schedule: */5 * * * *

// Check all applications
GET /api/v1/applications

// Check status
Filter: status !== 'running'

// Alert if any down
Send Slack/Email notification
```

---

## 🐛 Troubleshooting

### Webhook Not Triggering

**Check:**
1. ✅ Webhook URL is correct
2. ✅ N8N workflow is active
3. ✅ GitHub webhook shows green checkmark

**Fix:**
```bash
# Test webhook manually
curl -X POST https://n8n.theprofitplatform.com.au/webhook/github-deploy \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","repository":{"name":"test"}}'
```

### Deployment Fails

**Check:**
1. ✅ Application UUID is correct
2. ✅ API token has deploy permissions
3. ✅ Application is not already deploying

**Fix:**
```bash
# Check deployment status
curl -H "Authorization: Bearer YOUR-TOKEN" \
     https://coolify.theprofitplatform.com.au/api/v1/applications/UUID/deployments
```

### N8N Workflow Errors

**Check N8N Logs:**
1. Go to N8N → Executions
2. Click on failed execution
3. See which node failed
4. Check error message

**Common Issues:**
- Invalid API token → Update token in workflow
- Wrong UUID → Update application UUID
- Timeout → Increase timeout in node settings
- Rate limiting → Add delay between requests

### Coolify API Errors

**401 Unauthorized:**
- Check API token is correct
- Verify token has not expired

**404 Not Found:**
- Check application UUID is correct
- Verify application still exists in Coolify

**429 Rate Limit:**
- Add delay between deployments
- Reduce webhook frequency

---

## 🎯 Best Practices

### 1. Use Branch Protection

**GitHub Settings:**
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

### 2. Staged Rollouts

**Deployment Strategy:**
```
develop → test.theprofitplatform.com.au (auto)
    ↓
Test & Verify
    ↓
main → app.theprofitplatform.com.au (auto or manual approval)
```

### 3. Deployment Windows

**Production deployments:**
- Schedule during low-traffic hours
- Avoid Fridays and holidays
- Have rollback plan ready

### 4. Monitoring

**Set up alerts for:**
- ❌ Failed deployments
- ⚠️ Slow response times
- 🔄 Multiple rollbacks
- 📊 High error rates

### 5. Documentation

**Keep track of:**
- What was deployed
- When it was deployed
- Who deployed it
- Why it was deployed

---

## 📋 Deployment Checklist

### Before First Auto-Deploy

- [ ] Coolify application created
- [ ] Application UUID obtained
- [ ] N8N workflow imported and configured
- [ ] GitHub webhook added
- [ ] Webhook tested successfully
- [ ] Staging environment set up
- [ ] Production environment configured
- [ ] Health checks configured
- [ ] Notifications set up (Slack/Email)
- [ ] Rollback procedure tested
- [ ] Team informed about auto-deploy

### For Each Deployment

- [ ] Code reviewed
- [ ] Tests passing locally
- [ ] Changes documented
- [ ] Database migrations ready (if any)
- [ ] Environment variables updated (if needed)
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Monitoring dashboard open

### After Deployment

- [ ] Health check passed
- [ ] Application responding
- [ ] No error spikes
- [ ] Tests passing on deployed version
- [ ] Database migrations applied
- [ ] Team notified of completion
- [ ] Document any issues

---

## 🚀 Quick Start Commands

### Setup Auto-Deploy (Full Process)

```bash
# 1. Get application UUID
curl -H "Authorization: Bearer vznmZXqYMofVoZn6SjWCVOOmPa7pm1fd3CSz6GSqf8c6f674" \
     https://coolify.theprofitplatform.com.au/api/v1/applications

# 2. Go to N8N
open https://n8n.theprofitplatform.com.au

# 3. Import workflow
# File: /home/avi/projects/coolify/coolify-mcp/n8n-examples/github-to-coolify.json

# 4. Update workflow with your UUID

# 5. Copy webhook URL from N8N

# 6. Add to GitHub repo:
# Settings → Webhooks → Add webhook
# Paste N8N webhook URL

# 7. Test deployment
echo "test" >> README.md
git add .
git commit -m "test: auto-deploy"
git push
```

### Verify Auto-Deploy Working

```bash
# Check N8N executions
open https://n8n.theprofitplatform.com.au/workflows

# Check Coolify deployments
open https://coolify.theprofitplatform.com.au

# Check application is running
curl https://app.theprofitplatform.com.au/health
```

---

## 🎓 Example: Complete Setup

Let me walk through a complete example:

### Application: "My Awesome App"

**1. Repository:** `github.com/yourusername/awesome-app`

**2. Environments:**
- **Staging:** develop → test.theprofitplatform.com.au
- **Production:** main → app.theprofitplatform.com.au

**3. Setup Steps:**

```bash
# Create staging app in Coolify
# Get UUID: abc-123-staging

# Create production app in Coolify
# Get UUID: abc-123-production

# Import N8N workflow
# Configure for both environments

# Add GitHub webhooks
# URL: https://n8n.theprofitplatform.com.au/webhook/awesome-app

# Test staging
git checkout develop
git push origin develop
# → Deploys to test.theprofitplatform.com.au

# Test production
git checkout main
git merge develop
git push origin main
# → Deploys to app.theprofitplatform.com.au
```

---

## ✅ Success! Auto-Deploy is Running

When everything is set up, you'll have:

✅ **Push to develop** → Auto-deploys to test environment
✅ **Push to main** → Auto-deploys to production
✅ **Slack notifications** on every deployment
✅ **Health checks** after deployment
✅ **Automatic rollback** on failure
✅ **Deployment history** in N8N
✅ **Monitoring** via Coolify dashboard

---

## 📞 Need Help?

### Resources

- **N8N Workflows:** `/home/avi/projects/coolify/coolify-mcp/n8n-examples/`
- **Coolify API Docs:** https://coolify.io/docs/api
- **N8N Docs:** https://docs.n8n.io
- **Setup Guide:** `SETUP-GUIDE.md`

### Support

If something's not working:
1. Check N8N execution logs
2. Check Coolify deployment logs
3. Verify all UUIDs and tokens
4. Test webhook manually
5. Review this guide

---

**🎉 Congratulations! Auto-deploy is configured and ready to use!**

**Next:** Push some code and watch it deploy automatically! 🚀
