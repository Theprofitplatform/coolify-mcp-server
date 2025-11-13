# N8N Integration Examples for Coolify MCP

This directory contains ready-to-use N8N workflow examples for automating Coolify deployments and monitoring.

## 🚀 Available Workflows

### 1. Deploy Webhook (`deploy-webhook.json`)

**Purpose:** Simple webhook endpoint to trigger Coolify deployments

**How to use:**
1. Import into N8N: https://n8n.theprofitplatform.com.au
2. Activate the workflow
3. Test with curl:

```bash
curl -X POST https://n8n.theprofitplatform.com.au/webhook/coolify-deploy \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "your-application-uuid",
    "force_rebuild": true,
    "commit_sha": "abc123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "deployment_id": "uuid",
  "message": "Deployment started"
}
```

---

### 2. GitHub → Coolify Deploy (`github-to-coolify.json`)

**Purpose:** Auto-deploy to Coolify when code is pushed to GitHub

**Setup:**
1. Import workflow into N8N
2. Get webhook URL from N8N
3. Add webhook to GitHub repository:
   - Go to: Settings → Webhooks → Add webhook
   - URL: `https://n8n.theprofitplatform.com.au/webhook/github-deploy`
   - Content type: `application/json`
   - Events: Push events
   - Add app_id as query parameter or configure in workflow

**Features:**
- ✅ Only deploys on `main` branch pushes
- ✅ Passes commit SHA to Coolify
- ✅ Sends Slack notification after deployment
- ✅ Force rebuilds on every push

**Configuration:**
```javascript
// Edit the workflow to add your app_id mapping
const appMapping = {
  "my-repo-name": "coolify-app-uuid",
  "another-repo": "another-app-uuid"
};
```

---

### 3. Health Monitor (`health-monitor.json`)

**Purpose:** Monitor application health and auto-restart if needed

**Features:**
- ✅ Checks all applications every 5 minutes
- ✅ Detects down/stopped applications
- ✅ Auto-restarts unhealthy apps
- ✅ Sends Slack alerts to #alerts channel

**Setup:**
1. Import workflow into N8N
2. Configure Slack credentials
3. Adjust check interval if needed (default: 5 minutes)
4. Activate workflow

**Monitoring Logic:**
```javascript
// Checks for status !== 'running'
// Auto-restarts and alerts team
if (app.status !== 'running') {
  // 1. Restart application
  // 2. Send alert to Slack
}
```

---

## 🔧 Configuration

All workflows use the same Coolify credentials:

```javascript
{
  "baseURL": "https://coolify.theprofitplatform.com.au",
  "token": "***REMOVED***"
}
```

### Security Note
In production, store credentials in N8N's Credentials Manager instead of hardcoding them.

---

## 📋 Common Use Cases

### 1. Deploy Test Environment on Push

```javascript
// Trigger: GitHub push to 'develop' branch
// Action: Deploy to test.theprofitplatform.com.au

if (branch === 'develop') {
  deploy_to_env('staging');
} else if (branch === 'main') {
  deploy_to_env('production');
}
```

### 2. Scheduled Database Backups

```javascript
// Trigger: Daily at 2 AM
// Action: Backup all databases

schedule('0 2 * * *', async () => {
  const databases = await coolify.listDatabases();
  for (const db of databases) {
    await coolify.backupDatabase(db.id);
  }
});
```

### 3. Resource Monitoring

```javascript
// Trigger: Every 10 minutes
// Action: Check server resources

const servers = await coolify.listServers();
for (const server of servers) {
  const resources = await coolify.getServerResources(server.id);

  if (resources.cpu > 90) {
    alert('High CPU usage on ' + server.name);
  }

  if (resources.memory > 90) {
    alert('High memory usage on ' + server.name);
  }
}
```

### 4. Auto-Scale Applications

```javascript
// Trigger: Every 5 minutes
// Action: Scale based on metrics

const app = await coolify.getApplication(appId);
const metrics = await coolify.getMetrics(appId);

if (metrics.requests_per_minute > 1000) {
  await coolify.scaleApplication(appId, {
    instances: app.instances + 1
  });
}
```

---

## 🎯 Integration with Your Setup

### Domain Configuration

Automatically set domains for new services:

```javascript
// When creating a service
const service = await coolify.createService({
  type: 'postgres',
  name: 'my-database'
});

// Auto-configure domain
await coolify.configureDomain(service.id, {
  domain: `${service.name}.theprofitplatform.com.au`,
  ssl: true
});
```

### Test Environment Workflow

```javascript
// Create test deployment
const app = await coolify.createApplication({
  name: 'my-app-test',
  environment: 'staging',
  domain: 'test.theprofitplatform.com.au',
  git_repository: 'github.com/user/repo',
  git_branch: 'develop'
});

await coolify.deployApplication(app.id);
```

---

## 🔗 Webhook URLs

After importing to N8N (https://n8n.theprofitplatform.com.au):

- **Deploy Webhook:** `/webhook/coolify-deploy`
- **GitHub Webhook:** `/webhook/github-deploy`

---

## 🐛 Troubleshooting

### Workflow Not Triggering

```bash
# Check N8N logs
docker logs n8n_container_name -f

# Test webhook manually
curl -X POST https://n8n.theprofitplatform.com.au/webhook/test
```

### Authentication Errors

```javascript
// Verify token is valid
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://coolify.theprofitplatform.com.au/api/v1/version
```

### Deployment Fails

```javascript
// Check application logs in Coolify
const logs = await coolify.getApplicationLogs(appId);
console.log(logs);
```

---

## 📚 Resources

- **N8N Instance:** https://n8n.theprofitplatform.com.au
- **Coolify Instance:** https://coolify.theprofitplatform.com.au
- **N8N Docs:** https://docs.n8n.io
- **Coolify API Docs:** https://coolify.io/docs/api

---

## 🚀 Next Steps

1. **Import workflows** to N8N
2. **Configure Slack notifications** (optional)
3. **Set up GitHub webhooks** for auto-deploy
4. **Test each workflow** before activating
5. **Monitor execution logs** in N8N

---

**Happy Automating! 🎉**
