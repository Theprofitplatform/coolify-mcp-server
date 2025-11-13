# Coolify MCP Server - Setup Guide

**Generated:** 2025-11-13
**Instance:** https://coolify.theprofitplatform.com.au

---

## ✅ Installation Complete!

Your Coolify MCP server is ready to use. Here's what we've set up:

### 📦 What's Installed

```
/home/avi/projects/coolify/coolify-mcp/
├── build/                  # Compiled TypeScript
├── src/                    # Source code
├── .env                    # Your API credentials (secured)
├── coolify-mcp.service     # Systemd service file
├── install-service.sh      # Service installer script
├── test-connection.js      # API connection tester
└── SETUP-GUIDE.md          # This file
```

### 🔌 Your Coolify Instance

- **URL:** https://coolify.theprofitplatform.com.au
- **Status:** ✅ Connected and verified
- **Resources:**
  - 1 Team
  - 2 Servers
  - 12 Projects
  - 11 Services
  - 0 Applications (ready to deploy!)

---

## 🚀 Quick Start Options

### Option 1: Use with Claude Desktop (Recommended)

1. **Open Claude Desktop config:**
   ```bash
   # On Linux
   nano ~/.config/Claude/claude_desktop_config.json

   # On Mac
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Add this configuration:**
   ```json
   {
     "mcpServers": {
       "coolify": {
         "command": "node",
         "args": ["/home/avi/projects/coolify/coolify-mcp/build/index.js"],
         "env": {
           "COOLIFY_BASE_URL": "https://coolify.theprofitplatform.com.au",
           "COOLIFY_TOKEN": "***REMOVED***"
         },
         "disabled": false
       }
     }
   }
   ```

3. **Restart Claude Desktop**

4. **Test it:** Ask Claude "List my Coolify servers"

---

### Option 2: Run as Systemd Service

**Install the service:**
```bash
cd /home/avi/projects/coolify/coolify-mcp
sudo ./install-service.sh
```

**Manage the service:**
```bash
# Check status
sudo systemctl status coolify-mcp

# View logs
sudo journalctl -u coolify-mcp -f

# Restart service
sudo systemctl restart coolify-mcp

# Stop service
sudo systemctl stop coolify-mcp
```

---

### Option 3: Run Manually

```bash
cd /home/avi/projects/coolify/coolify-mcp
node build/index.js
```

---

## 🧪 Testing

### Test API Connection

```bash
cd /home/avi/projects/coolify/coolify-mcp
node test-connection.js
```

Expected output:
```
✅ Passed: 6/6
🎉 All tests passed! Coolify API is working correctly.
```

### Test MCP Tools (via Claude)

Once configured in Claude Desktop, try these commands:

1. **"List all my Coolify servers"**
   - Tests: `list_servers`

2. **"What projects do I have in Coolify?"**
   - Tests: `list_projects`

3. **"Show me my Coolify services"**
   - Tests: `list_services`

4. **"Deploy my application"**
   - Tests: `deploy_application`

---

## 📚 Available Tools (45 total)

### Version & Health
- `get_version` - Get Coolify version
- `health_check` - Check API health

### Teams Management
- `list_teams` - List all teams
- `get_team` - Get team details
- `get_current_team` - Get current team
- `get_current_team_members` - List team members

### Servers
- `list_servers` - List all servers
- `create_server` - Create new server
- `validate_server` - Validate server config
- `get_server_resources` - Check CPU/memory/disk
- `get_server_domains` - List server domains

### Projects
- `list_projects` - List all projects
- `get_project` - Get project details
- `create_project` - Create new project

### Environments
- `list_environments` - List environments
- `create_environment` - Create environment

### Services
- `list_services` - List all services
- `create_service` - Deploy new service (WordPress, MySQL, etc.)
- `start_service` - Start a service
- `stop_service` - Stop a service
- `restart_service` - Restart a service

### Applications
- `list_applications` - List all applications
- `create_application` - Create new application
- `start_application` - Start application
- `stop_application` - Stop application
- `restart_application` - Restart application
- `execute_command_application` - Run command in container
- `get_application_logs` - View application logs

### Deployments
- `list_deployments` - List all deployments
- `get_deployment` - Get deployment details

### Private Keys
- `list_private_keys` - List SSH keys
- `create_private_key` - Add SSH key

---

## 🔗 N8N Integration

### Webhook Example

Create an N8N workflow that deploys to Coolify:

**1. HTTP Request Node:**
```javascript
// Deploy application via Coolify API
{
  "method": "POST",
  "url": "https://coolify.theprofitplatform.com.au/api/v1/applications/{{$node.Webhook.json.app_id}}/deploy",
  "headers": {
    "Authorization": "Bearer ***REMOVED***",
    "Content-Type": "application/json"
  },
  "body": {
    "force_rebuild": true
  }
}
```

**2. Webhook Trigger:**
```
URL: https://n8n.theprofitplatform.com.au/webhook/coolify-deploy
Method: POST
Body: { "app_id": "your-app-uuid" }
```

**3. Response:**
```javascript
{
  "status": "success",
  "deployment_id": "uuid",
  "message": "Deployment started"
}
```

### Common N8N Workflows

1. **GitHub Push → Deploy to Test Environment**
   - Trigger: GitHub webhook on push to `develop` branch
   - Action: Deploy to test.theprofitplatform.com.au

2. **Scheduled Backup**
   - Trigger: Cron schedule (daily at 2 AM)
   - Action: Backup all databases

3. **Health Monitoring**
   - Trigger: Every 5 minutes
   - Action: Check application health, alert if down

---

## 🏗️ Development Workflow

### For Your Projects

**Test Deployment:**
```bash
# Deploy to test.theprofitplatform.com.au
1. Create project in Coolify
2. Create environment "staging"
3. Set domain: test.theprofitplatform.com.au
4. Deploy application
```

**Production Deployment:**
```bash
# Deploy to theprofitplatform.com.au
1. Use existing project
2. Environment: "production"
3. Domain: theprofitplatform.com.au
4. Enable SSL via Coolify
```

### Auto-Configuration for New Services

Use Claude to automate deployments:

```
"Create a new Next.js application in Coolify:
- Project: my-project
- Environment: production
- Domain: myapp.theprofitplatform.com.au
- GitHub: github.com/user/repo
- Enable SSL
- Deploy immediately"
```

Claude will use the MCP tools to:
1. Create the application
2. Configure domain
3. Enable SSL
4. Trigger deployment

---

## 🔐 Security Notes

### API Token Security

✅ **Secured:**
- Token stored in `.env` (gitignored)
- Not exposed in logs
- Only accessible by `avi` user

⚠️ **Important:**
- Never commit `.env` to git
- Rotate token if exposed
- Use systemd service for production (secure)

### Firewall Configuration

Ensure Coolify is accessible:
```bash
# Check if port 443 is open
sudo ufw status

# Allow HTTPS if needed
sudo ufw allow 443/tcp
```

---

## 🐛 Troubleshooting

### Connection Fails

```bash
# Test API directly
curl -H "Authorization: Bearer ***REMOVED***" \
     https://coolify.theprofitplatform.com.au/api/v1/version
```

### Service Won't Start

```bash
# Check logs
sudo journalctl -u coolify-mcp -n 50 --no-pager

# Check permissions
ls -la /home/avi/projects/coolify/coolify-mcp/build/

# Rebuild
cd /home/avi/projects/coolify/coolify-mcp
npm run build
```

### Claude Desktop Not Seeing MCP

1. Check config file location is correct
2. Restart Claude Desktop completely
3. Check Claude logs for errors
4. Verify node path: `which node`

---

## 📈 Next Steps

### Phase 2: Add Testing (Week 2)

```bash
# Install testing tools
npm install --save-dev jest @types/jest

# Run tests
npm test
```

### Phase 3: Refactor Architecture (Week 3)

Extract tools into modules:
```
src/
├── tools/
│   ├── servers/
│   ├── projects/
│   ├── applications/
│   └── services/
```

### Phase 4: Custom Features (Week 4)

Add your custom tools:
- Batch operations
- Auto-domain configuration
- N8N helper endpoints
- Monitoring dashboard

---

## 📞 Support

### Resources

- **Coolify Docs:** https://coolify.io/docs
- **MCP Docs:** https://modelcontextprotocol.io
- **Original Repo:** https://github.com/wrediam/coolify-mcp-server

### Quick Commands Reference

```bash
# Test connection
node test-connection.js

# Install service
sudo ./install-service.sh

# View logs
sudo journalctl -u coolify-mcp -f

# Rebuild
npm run build

# Update from git
git pull origin main
npm install
npm run build
sudo systemctl restart coolify-mcp
```

---

## ✅ Checklist

- [x] Repository cloned
- [x] Dependencies installed
- [x] Environment configured
- [x] API connection tested
- [x] Built successfully
- [ ] Systemd service installed (optional)
- [ ] Claude Desktop configured (optional)
- [ ] N8N workflows created (optional)
- [ ] Custom features added (future)

---

**🎉 You're all set! Your Coolify MCP server is ready to use.**

Try it now in Claude Desktop: *"Hey Claude, show me my Coolify servers!"*
