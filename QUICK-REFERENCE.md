# 🚀 Coolify MCP Server - Quick Reference

**Fast reference for daily usage**

---

## ⚡ Super Quick Start (VPS)

### You're on VPS RIGHT NOW!

```bash
# 1. Run automated setup (EASIEST!)
cd /home/avi/projects/coolify/coolify-mcp
./setup-vps.sh

# 2. Or manual setup:
cp .env.example .env
nano .env  # Add your Coolify token
npm install
npm run build
pm2 start npm --name coolify-mcp -- start

# 3. Configure Claude Desktop on LOCAL machine
# See "Claude Desktop Config" section below
```

---

## 🎯 Claude Desktop Configuration

**On your LOCAL machine**, edit:
```
~/.config/Claude/claude_desktop_config.json
```

**Add this:**
```json
{
  "mcpServers": {
    "coolify": {
      "command": "ssh",
      "args": [
        "avi@31.97.222.218",
        "cd /home/avi/projects/coolify/coolify-mcp && node build/index.js"
      ],
      "env": {}
    }
  }
}
```

**Then:**
1. Set up SSH key: `ssh-copy-id avi@31.97.222.218`
2. Restart Claude Desktop
3. Test: "Use get_version to check Coolify"

---

## 📍 Important Paths

### On VPS:
```
Project:     /home/avi/projects/coolify/coolify-mcp
Coolify:     https://coolify.theprofitplatform.com.au
N8N:         https://n8n.theprofitplatform.com.au
Config:      /home/avi/projects/coolify/coolify-mcp/.env
```

### On Local Machine:
```
Claude Config:  ~/.config/Claude/claude_desktop_config.json
Claude Logs:    ~/.config/Claude/logs/mcp-*.log
```

---

## 🔑 Get Coolify API Token

1. Open: https://coolify.theprofitplatform.com.au
2. Settings → Security → API Tokens
3. Create New Token
4. Name: "MCP Server"
5. Permissions: ☑️ read, ☑️ write, ☑️ deploy
6. Copy token → Paste in `.env` file

---

## 🛠️ Common Commands (VPS)

### PM2 Commands (Recommended):
```bash
pm2 start npm --name coolify-mcp -- start  # Start
pm2 stop coolify-mcp                       # Stop
pm2 restart coolify-mcp                    # Restart
pm2 logs coolify-mcp                       # View logs
pm2 status coolify-mcp                     # Status
pm2 monit                                  # Monitor
pm2 save                                   # Save config
pm2 startup                                # Enable auto-start
```

### systemd Commands:
```bash
sudo systemctl start coolify-mcp    # Start
sudo systemctl stop coolify-mcp     # Stop
sudo systemctl restart coolify-mcp  # Restart
sudo systemctl status coolify-mcp   # Status
sudo journalctl -u coolify-mcp -f   # Logs
sudo systemctl enable coolify-mcp   # Enable auto-start
```

### Manual Commands:
```bash
cd /home/avi/projects/coolify/coolify-mcp
npm start                    # Start server
./quick-start.sh            # Quick start
./test-connection.sh        # Test API connection
npm run build               # Rebuild
```

---

## 🧪 Testing in Claude Desktop

### Basic Tests:
```
1. "Use get_version to check my Coolify version"
2. "List all my Coolify servers"
3. "Show all my applications"
4. "Check resource usage on my servers"
```

### Batch Operations (10x Faster!):
```
1. "Restart applications: uuid-1, uuid-2, uuid-3"
2. "Stop all my dev applications"
3. "Start all my dev services"
4. "Update API_KEY=new-value across all production apps and restart"
```

---

## 📊 All 35 Tools

### Health (2):
- `get_version` - Coolify version
- `health_check` - System health

### Servers (5):
- `list_servers` - List all servers
- `create_server` - Create server
- `validate_server` - Validate config
- `get_server_resources` - Resource usage
- `get_server_domains` - Server domains

### Projects (3):
- `list_projects` - List projects
- `get_project` - Project details
- `create_project` - Create project

### Teams (4):
- `list_teams` - List teams
- `get_team` - Team details
- `get_current_team` - Current team
- `get_current_team_members` - Team members

### Environments (2):
- `list_environments` - List environments
- `create_environment` - Create environment

### Deployments (2):
- `list_deployments` - List deployments
- `get_deployment` - Deployment details

### Private Keys (2):
- `list_private_keys` - List SSH keys
- `create_private_key` - Create SSH key

### Applications (5):
- `list_applications` - List apps
- `create_application` - Create app
- `stop_application` - Stop app
- `restart_application` - Restart app
- `get_application_logs` - View logs

### Services (5):
- `list_services` - List services
- `create_service` - Create service
- `start_service` - Start service
- `stop_service` - Stop service
- `restart_service` - Restart service

### ⚡ Batch Operations (5):
- `batch_restart_applications` - Parallel restarts
- `batch_stop_applications` - Parallel stops
- `batch_start_services` - Parallel starts
- `batch_stop_services` - Parallel stops
- `batch_update_env_vars` - Bulk updates

---

## 🚨 Troubleshooting

### Server Not Responding:
```bash
# Check if running
pm2 status coolify-mcp
# OR
sudo systemctl status coolify-mcp

# View logs
pm2 logs coolify-mcp --lines 50
# OR
sudo journalctl -u coolify-mcp -f

# Restart
pm2 restart coolify-mcp
```

### Connection Issues:
```bash
# Test Coolify API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://coolify.theprofitplatform.com.au/api/v1/version

# Test SSH (from LOCAL)
ssh avi@31.97.222.218

# Should connect without password!
```

### Build Errors:
```bash
cd /home/avi/projects/coolify/coolify-mcp
rm -rf node_modules build
npm install
npm run build
```

### Claude Desktop Not Connecting:
1. Check SSH key: `ssh avi@31.97.222.218` (no password!)
2. Check config path is absolute
3. Restart Claude Desktop completely
4. Check Claude logs: `tail -f ~/.config/Claude/logs/mcp-*.log`

---

## 💡 Daily Workflows

### Morning Startup:
```
"Start all my development services and applications"
```

### Evening Shutdown:
```
"Stop all dev apps and services to save resources"
```

### After Code Deploy:
```
"Restart staging apps: app-1, app-2, app-3"
```

### API Key Rotation:
```
"Update API_KEY to 'new-key' across all production apps and restart"
```

### Health Check:
```
"Check health and resource usage on all servers"
```

### View Logs:
```
"Show me logs for application xyz from last 30 minutes"
```

---

## 🔐 Security Checklist

- ✅ API token in `.env` (never commit!)
- ✅ `.env` in `.gitignore`
- ✅ SSH key authentication (no passwords)
- ✅ Limited token permissions (read/write/deploy only)
- ✅ Rotate tokens every 90 days
- ✅ Keep server updated
- ✅ Monitor logs regularly

---

## 📱 Quick Actions

### Check Status:
```bash
pm2 status coolify-mcp
```

### View Logs:
```bash
pm2 logs coolify-mcp
```

### Restart Service:
```bash
pm2 restart coolify-mcp
```

### Test Connection:
```bash
./test-connection.sh
```

### Rebuild:
```bash
npm run build && pm2 restart coolify-mcp
```

---

## 🎯 Performance Tips

1. **Use Batch Operations**
   - 10x faster than individual operations
   - Parallel execution by default

2. **Keep Service Running**
   - Use PM2 or systemd
   - Enable auto-start on boot

3. **Monitor Logs**
   - Check for errors regularly
   - Use `pm2 monit` for real-time monitoring

4. **Optimize Queries**
   - Be specific with UUIDs
   - Use filters when listing resources

---

## 📞 Quick Help

### View Full Guide:
```bash
cat /home/avi/projects/coolify/coolify-mcp/USAGE-GUIDE.md
```

### View README:
```bash
cat /home/avi/projects/coolify/coolify-mcp/README.md
```

### View Setup Guide:
```bash
cat /home/avi/projects/coolify/coolify-mcp/LOCAL-SETUP-GUIDE.md
```

### Run Setup Script:
```bash
./setup-vps.sh
```

---

## ✨ You're All Set!

**VPS Setup:** ✅ Ready
**Claude Desktop:** ✅ Configured
**35 Tools:** ✅ Available
**Batch Ops:** ✅ 10x Faster

**Start using:**
```
Open Claude Desktop → "List all my Coolify applications"
```

---

**Version:** 0.2.0
**Updated:** 2025-11-13

🤖 Generated with [Claude Code](https://claude.com/claude-code)
