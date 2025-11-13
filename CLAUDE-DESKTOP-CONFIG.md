# Claude Desktop Configuration for Coolify MCP

## 📍 Configuration File Location

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

To open:
1. Press `Win + R`
2. Type: `%APPDATA%\Claude`
3. Open or create `claude_desktop_config.json`

## 📝 Configuration to Add

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "ssh",
      "args": [
        "tpp-vps",
        "node",
        "/home/avi/projects/coolify/coolify-mcp/build/index.js"
      ],
      "env": {
        "COOLIFY_BASE_URL": "https://coolify.theprofitplatform.com.au",
        "COOLIFY_TOKEN": "***REMOVED***"
      }
    }
  }
}
```

## 🔄 If You Already Have Other MCP Servers

Merge like this:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "coolify": {
      "command": "ssh",
      "args": [
        "tpp-vps",
        "node",
        "/home/avi/projects/coolify/coolify-mcp/build/index.js"
      ],
      "env": {
        "COOLIFY_BASE_URL": "https://coolify.theprofitplatform.com.au",
        "COOLIFY_TOKEN": "***REMOVED***"
      }
    }
  }
}
```

## ✅ Verification Steps

1. **Save** the config file
2. **Restart** Claude Desktop completely (close and reopen)
3. **Check** that "coolify" appears in available MCP tools
4. **Test** with: "Use get_version to check my Coolify version"

## 🧪 Test Commands

Once configured, try these in Claude Desktop:

### Basic Tests
```
Use get_version to check my Coolify version
```

```
Use list_servers to show all my Coolify servers
```

```
Use list_applications to show all my applications
```

### Advanced Tests
```
Use get_server_resources to check resource usage
```

```
Use list_databases to show all databases
```

## 🐛 Troubleshooting

### Issue: MCP server not appearing

**Check:**
- File is named exactly `claude_desktop_config.json`
- JSON syntax is valid (use JSONLint.com to validate)
- Claude Desktop was fully restarted
- SSH key `tpp-vps` is configured in `~/.ssh/config`

### Issue: Connection errors

**Check:**
- SSH connection works: `ssh tpp-vps "echo ok"`
- Node is in PATH on VPS: `ssh tpp-vps "which node"`
- Build exists: `ssh tpp-vps "ls /home/avi/projects/coolify/coolify-mcp/build/index.js"`

### Issue: Authentication errors

**Check:**
- COOLIFY_TOKEN is correct
- Token has read, write, deploy permissions
- Coolify URL is accessible

## 📊 What You'll Get

Once configured, you'll have access to **37 Coolify tools**:

### Application Tools (8)
- list_applications, get_application, create_application
- update_application, delete_application, start_application
- stop_application, restart_application

### Service Tools (8)  
- list_services, get_service, start_service
- stop_service, restart_service, update_service
- delete_service, batch_restart_services

### Database Tools (8)
- list_databases, get_database, create_database
- start_database, stop_database, delete_database
- backup_database, restore_database

### Server Tools (4)
- list_servers, get_server, get_server_resources
- update_server

### Deployment Tools (4)
- deploy_application, list_deployments
- get_deployment, cancel_deployment

### Environment Tools (3)
- get_environment_variables, set_environment_variable
- delete_environment_variable

### Batch Operations (2)
- batch_restart_applications
- batch_update_environment_variables

## 🚀 Next Steps

1. Configure Claude Desktop
2. Restart Claude Desktop
3. Test basic commands
4. Explore all 35 tools!

---

**Created:** 2025-11-14
**Server:** tpp-vps
**Status:** Ready to use
