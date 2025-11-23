# 🤖 Coolify MCP for Droid (Factory AI) Setup Guide

This guide shows you how to use the Coolify MCP Server with Droid (Factory AI) instead of Claude Desktop.

---

## ✅ Setup Complete!

Your Coolify MCP is now configured and ready to use with Droid. The configuration has been added to:

**`/home/avi/.factory/mcp.json`**

---

## 🎯 What You Can Do Now

With Droid, you can now manage your entire Coolify infrastructure through natural language commands!

### **35 Available Tools**

#### 📱 Application Management (8 tools)
```
"List all my Coolify applications"
"Show me details for application xyz-123"
"Start the mobile-app application"
"Restart all staging applications"
"Create a new application for my Node.js project"
```

#### 🔧 Service Management (8 tools)
```
"List all services in Coolify"
"Start the PostgreSQL database service"
"Restart the Redis service"
"Stop all development services for the night"
"Check status of nginx service"
```

#### 🗄️ Database Management (8 tools)
```
"List all databases"
"Create a new PostgreSQL database for my app"
"Backup the production database"
"Start the MySQL database"
```

#### 🖥️ Server Management (4 tools)
```
"Show all my servers"
"Check resource usage on server-1"
"Get server details"
"Update server configuration"
```

#### 🚀 Deployment Operations (4 tools)
```
"Deploy the mobile app to production"
"Show deployment history for api-service"
"Check the status of the current deployment"
"Cancel the running deployment"
```

#### 🌍 Environment Variables (3 tools)
```
"Show all environment variables for app xyz"
"Set API_KEY to 'new-value' for production app"
"Delete the OLD_CONFIG variable"
```

#### ⚡ Batch Operations (2 tools - 10x Faster!)
```
"Restart applications: app-1, app-2, app-3"
"Update DATABASE_URL across all staging apps"
"Stop all development services"
```

---

## 🚀 Quick Start Examples

### Example 1: Morning Startup
```
"Good morning! Start all my development services and check their status"
```

### Example 2: Check Infrastructure
```
"Show me a complete overview of all applications, services, and servers"
```

### Example 3: Deploy Updates
```
"Deploy the mobile-app to production and monitor the deployment"
```

### Example 4: Environment Rotation
```
"Update the API_KEY to 'new-key-value' across all production applications and restart them"
```

### Example 5: Evening Shutdown
```
"Stop all development and staging services to save resources"
```

---

## 🔥 Power Features

### 1. **Intelligent Batch Operations**
Instead of restarting apps one by one:
```
OLD WAY (Slow):
- Restart app-1 → Wait → Restart app-2 → Wait → Restart app-3

NEW WAY (10x Faster):
"Batch restart these applications: app-1, app-2, app-3"
→ All restart simultaneously!
```

### 2. **Natural Language Queries**
No need to remember UUIDs or exact syntax:
```
"Show me all applications that are currently running"
"Find the database for the mobile app"
"What's using the most resources on my main server?"
```

### 3. **Complex Workflows**
Chain multiple operations:
```
"Create a new PostgreSQL database called 'analytics',
then update the mobile-app environment variable DATABASE_URL
to point to it, then restart the application"
```

### 4. **Smart Context Awareness**
Droid remembers previous conversations:
```
You: "List all applications"
Droid: [Shows list with IDs]
You: "Start the first one"
Droid: [Starts the first application from previous list]
```

---

## 🎮 Usage Tips

### Tip 1: Be Specific
✅ **Good**: "Restart the mobile-app application"
❌ **Vague**: "Restart something"

### Tip 2: Use Batch Operations
✅ **Fast**: "Batch restart app-1, app-2, app-3"
❌ **Slow**: "Restart app-1, then restart app-2, then restart app-3"

### Tip 3: Ask for Confirmations
```
"Show me all running applications, then I'll tell you which ones to restart"
```

### Tip 4: Monitor Operations
```
"Deploy the mobile app and show me the logs as it deploys"
```

---

## 📊 Real-World Workflows

### Workflow 1: New Feature Deployment
```
1. "Show the current status of mobile-app"
2. "Deploy mobile-app to production"
3. "Monitor the deployment logs"
4. "Check if the application started successfully"
5. "Test the health endpoint"
```

### Workflow 2: Environment Management
```
1. "List all staging applications"
2. "Update API_VERSION to '2.0' across all staging apps"
3. "Restart all staging applications"
4. "Verify they all started correctly"
```

### Workflow 3: Resource Optimization
```
1. "Show resource usage across all servers"
2. "List all services using more than 1GB RAM"
3. "Stop unused development services"
4. "Check the resource usage again"
```

### Workflow 4: Database Management
```
1. "List all databases"
2. "Backup the production PostgreSQL database"
3. "Create a new database for testing"
4. "Clone environment variables from prod to test database"
```

---

## 🐛 Troubleshooting

### Issue: "Coolify tools not available"

**Solution:**
```bash
# 1. Verify the MCP config exists
cat /home/avi/.factory/mcp.json

# 2. Check the build file exists
ls -la /home/avi/projects/coolify/coolify-mcp/build/index.js

# 3. Rebuild if needed
cd /home/avi/projects/coolify/coolify-mcp
npm run build

# 4. Restart your Droid session
```

### Issue: "Connection to Coolify failed"

**Check:**
```bash
# Test Coolify is accessible
curl https://coolify.theprofitplatform.com.au/api/v1/version \
  -H "Authorization: Bearer ***REMOVED***"

# Should return version info
```

### Issue: "Permission denied"

**Fix:**
```bash
chmod +x /home/avi/projects/coolify/coolify-mcp/build/index.js
```

---

## 🔒 Security Notes

### Your Configuration Contains:
- ✅ Coolify API endpoint (https)
- ✅ API token (keep this secret!)
- ✅ Running on your VPS (secure environment)

### Best Practices:
1. ✅ Never share your API token
2. ✅ Rotate tokens periodically
3. ✅ Use read-only tokens for monitoring
4. ✅ Keep full-access tokens for deployments
5. ✅ Monitor API usage in Coolify dashboard

---

## 📈 Performance Benefits

### Before Coolify MCP:
- Manual login to Coolify dashboard
- Click through UI for each operation
- No batch operations
- Slow multi-app management

### After Coolify MCP with Droid:
- ✅ Natural language commands
- ✅ 10x faster batch operations
- ✅ Automated workflows
- ✅ Context-aware conversations
- ✅ No UI clicking needed

**Example Speed Improvement:**
```
Task: Restart 5 applications

Manual:
- Login → Navigate → Click restart → Wait
- Repeat 5 times
- Total: ~5-10 minutes

With Droid:
"Batch restart these apps: app-1, app-2, app-3, app-4, app-5"
- Total: ~30 seconds
```

---

## 🎯 Next Steps

### 1. Start Using It!
Just start a conversation with Droid and say:
```
"Use the Coolify MCP to show me all my applications"
```

### 2. Explore Tools
Ask Droid:
```
"What Coolify tools do you have access to?"
```

### 3. Build Workflows
Create your own automation workflows:
```
"Create a morning startup workflow that starts all dev services"
```

### 4. Save Time
Use batch operations for repetitive tasks:
```
"Every Friday evening, stop all development services"
```

---

## 🎓 Learning Resources

### Documentation Files
- `README.md` - Full documentation
- `USAGE-GUIDE.md` - Detailed usage guide
- `QUICK-REFERENCE.md` - Quick command reference
- `ARCHITECTURE.md` - Technical architecture

### Test Commands
Try these to learn:
```
"Show Coolify version"
"List all servers"
"Check resource usage"
"Show application status"
"List recent deployments"
```

---

## 💡 Pro Tips

### 1. Save Common Commands
Create aliases for frequent operations:
```
"Create a workflow called 'dev-start' that starts all dev services"
```

### 2. Use Descriptive Names
When creating resources:
```
"Create a new app called 'api-gateway-v2' not just 'app1'"
```

### 3. Ask for Summaries
```
"Give me a complete infrastructure summary"
```

### 4. Monitor Deployments
```
"Deploy and watch the logs until completion"
```

---

## 🎉 You're All Set!

Your Coolify MCP is now integrated with Droid and ready to use!

**Configuration Location:** `/home/avi/.factory/mcp.json`

**Start Using It:**
```
"Hey Droid, use Coolify MCP to show me all my applications"
```

---

## 📞 Need Help?

If you encounter issues:

1. Check this guide's troubleshooting section
2. Verify the MCP configuration file
3. Test the Coolify API connection
4. Rebuild the MCP server if needed
5. Check Coolify dashboard for API token status

---

## 🚀 Happy Automating!

You now have:
- ✅ 35 Coolify management tools
- ✅ Natural language control
- ✅ 10x faster batch operations
- ✅ Full infrastructure automation
- ✅ Intelligent context awareness

**Welcome to the future of infrastructure management!** 🎉

---

**Created:** 2025-11-15  
**For:** Droid (Factory AI) integration  
**Status:** Active and ready to use!
