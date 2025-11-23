# Operations & Deployment Guide - Coolify MCP Server

**Version**: 1.0.1
**Security Rating**: A- (Production Ready)
**Last Updated**: November 23, 2025

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Production Deployment](#production-deployment)
3. [Security Checklist](#security-checklist)
4. [Monitoring & Maintenance](#monitoring--maintenance)
5. [Server Patch Management](#server-patch-management)
6. [Troubleshooting](#troubleshooting)
7. [Backup & Recovery](#backup--recovery)
8. [Performance Optimization](#performance-optimization)

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm or yarn
- Coolify instance with API access
- Qdrant vector database (optional, for AI features)
- N8N instance (optional, for workflow automation)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd coolify-mcp

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Build
npm run build

# Test
npm test

# Run
npm start
```

### Environment Configuration

**Required Variables:**
```env
COOLIFY_BASE_URL=https://your-coolify-instance.com
COOLIFY_TOKEN=your-api-token-here
```

**Optional Variables:**
```env
# Qdrant (for vector search)
QDRANT_HOST=your-qdrant-host.com
QDRANT_PORT=443
QDRANT_API_KEY=your-qdrant-key

# N8N (for workflows)
N8N_URL=https://your-n8n-instance.com

# API Configuration
COOLIFY_API_TIMEOUT=60000
COOLIFY_API_MAX_RETRIES=5
COOLIFY_API_RETRY_DELAY=2000
```

---

## 🏭 Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing (98/102 minimum)
- [ ] Security audit reviewed
- [ ] Environment variables configured
- [ ] SSL/TLS certificates in place
- [ ] Firewall rules configured
- [ ] Monitoring setup
- [ ] Backup procedures tested
- [ ] Rollback plan documented

### Deployment Steps

#### 1. Prepare Environment

```bash
# Create production directory
mkdir -p /opt/coolify-mcp
cd /opt/coolify-mcp

# Clone/copy code
git clone <repository-url> .

# Install production dependencies
npm ci --production

# Build TypeScript
npm run build
```

#### 2. Configure Environment

```bash
# Create production .env
cat > .env <<EOF
COOLIFY_BASE_URL=https://coolify.production.com
COOLIFY_TOKEN=${PRODUCTION_TOKEN}
NODE_ENV=production
EOF

# Secure permissions
chmod 600 .env
chown coolify-mcp:coolify-mcp .env
```

#### 3. Setup Systemd Service

```bash
# Create service file
sudo tee /etc/systemd/system/coolify-mcp.service <<EOF
[Unit]
Description=Coolify MCP Server
After=network.target

[Service]
Type=simple
User=coolify-mcp
WorkingDirectory=/opt/coolify-mcp
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /opt/coolify-mcp/build/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable coolify-mcp
sudo systemctl start coolify-mcp

# Check status
sudo systemctl status coolify-mcp
```

#### 4. Setup Nginx Reverse Proxy (Optional)

```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/coolify-mcp <<EOF
server {
    listen 80;
    server_name mcp.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/coolify-mcp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d mcp.your-domain.com
```

#### 5. Verify Deployment

```bash
# Check service
sudo systemctl status coolify-mcp

# Check logs
sudo journalctl -u coolify-mcp -f

# Test API
curl http://localhost:3000/health

# Run integration tests
npm run test:integration
```

---

## 🔒 Security Checklist

### Post-v1.0.1 Security Validation

All critical vulnerabilities have been fixed. Verify your deployment:

- [ ] **Version Check**: Running v1.0.1 or later
  ```bash
  grep version package.json  # Should show 1.0.1
  ```

- [ ] **Security Tests**: All passing
  ```bash
  npm test -- tests/security/injection-prevention.test.ts
  # Expected: 15/15 passing
  ```

- [ ] **No Exposed Credentials**: Check .env.example
  ```bash
  grep -i "api" .env.example  # Should only show placeholders
  ```

- [ ] **SQL Injection Protection**: Verified in code
  - ✅ get-deployment-logs.ts (line 47-54)
  - ✅ get-application-deployment-history.ts (line 47-76)
  - ✅ update-env-var-bulk.ts (line 144-194)

- [ ] **Command Injection Protection**: Verified in code
  - ✅ execute-server-command.ts (line 48-117)

### Additional Security Measures

#### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

#### API Token Security

```bash
# Generate strong API token
openssl rand -base64 32

# Store securely in environment
echo "COOLIFY_TOKEN=$(openssl rand -base64 32)" >> .env
chmod 600 .env
```

#### Rate Limiting (Optional)

```nginx
# Add to Nginx config
limit_req_zone $binary_remote_addr zone=mcp_limit:10m rate=10r/s;

server {
    location / {
        limit_req zone=mcp_limit burst=20 nodelay;
        # ... rest of config
    }
}
```

---

## 📊 Monitoring & Maintenance

### Health Monitoring

#### System Health Check

```bash
# MCP Server health
curl http://localhost:3000/health

# Systemd service status
sudo systemctl status coolify-mcp

# Resource usage
docker stats  # If running in container
top -p $(pgrep -f "node.*coolify-mcp")
```

#### Log Monitoring

```bash
# Real-time logs
sudo journalctl -u coolify-mcp -f

# Last 100 lines
sudo journalctl -u coolify-mcp -n 100

# Errors only
sudo journalctl -u coolify-mcp -p err

# Today's logs
sudo journalctl -u coolify-mcp --since today
```

### Performance Monitoring

```bash
# API response times
tail -f /var/log/nginx/access.log | grep mcp

# Memory usage
ps aux | grep coolify-mcp

# CPU usage
top -p $(pgrep -f "node.*coolify-mcp")
```

### Automated Monitoring (Optional)

Setup monitoring with your preferred tool:

**Prometheus Example:**
```yaml
scrape_configs:
  - job_name: 'coolify-mcp'
    static_configs:
      - targets: ['localhost:3000']
```

**Alert Rules:**
```yaml
groups:
  - name: coolify-mcp
    rules:
      - alert: MCPServerDown
        expr: up{job="coolify-mcp"} == 0
        for: 5m
        annotations:
          summary: "MCP Server is down"
```

---

## 🔧 Server Patch Management

### Current Server Status

**Server**: itchy-iguana-v4k8404sgkskssg88ww8s8o0
**Updates Available**: 41 packages
**Critical Updates**: 6 packages (require restart)

### Quick Patch Commands

```bash
# Check available patches
node check-server-patches.js

# Test patch procedure (dry-run)
sudo ./apply-server-patches.sh --dry-run

# Apply patches with full safety checks
sudo ./apply-server-patches.sh

# Apply without backups (NOT RECOMMENDED)
sudo ./apply-server-patches.sh --skip-backup --auto-yes
```

### Critical Updates Overview

| Package | Current | New | Priority |
|---------|---------|-----|----------|
| containerd.io | 1.7.28 | 2.1.5 | HIGH |
| docker-ce-cli | 28.5.1 | 29.0.2 | MEDIUM |
| cloud-init | 24.1.3 | 25.2 | LOW |

**📖 See [SERVER-PATCHES-SUMMARY.md](SERVER-PATCHES-SUMMARY.md) for details**
**📖 See [SERVER-PATCH-ANALYSIS.md](SERVER-PATCH-ANALYSIS.md) for full analysis**

### Patch Schedule Recommendation

- **Frequency**: Monthly or when critical updates available
- **Timing**: Low-traffic periods (e.g., Sunday 2-6 AM)
- **Duration**: 2-4 hours maintenance window
- **Team**: 2-3 people available for monitoring

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MCP Server Won't Start

**Symptoms**: Service fails to start, error in logs

**Diagnosis:**
```bash
# Check logs
sudo journalctl -u coolify-mcp -n 50

# Check configuration
node -e "require('dotenv').config(); console.log(process.env)"

# Verify build
npm run build
```

**Solutions:**
- Verify environment variables are set
- Check .env file permissions (should be 600)
- Ensure Node.js >= 18
- Rebuild: `npm run build`

#### 2. API Connection Errors

**Symptoms**: Cannot connect to Coolify API

**Diagnosis:**
```bash
# Test API directly
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  $COOLIFY_BASE_URL/api/v1/version

# Check network
ping $(echo $COOLIFY_BASE_URL | sed 's/https\?:\/\///')

# Test SSL
openssl s_client -connect your-coolify:443 -servername your-coolify
```

**Solutions:**
- Verify COOLIFY_BASE_URL is correct
- Check API token validity
- Ensure firewall allows outbound HTTPS
- Check SSL certificate validity

#### 3. Database Connection Issues

**Symptoms**: Cannot access deployment logs, deployment history

**Diagnosis:**
```bash
# Test database connection
docker exec coolify-db psql -U coolify -d coolify -c "SELECT version();"

# Check database container
docker ps | grep coolify-db
docker logs coolify-db
```

**Solutions:**
- Verify Docker is running
- Check coolify-db container status
- Ensure database credentials are correct
- Review database logs for errors

#### 4. Permission Errors

**Symptoms**: Cannot read/write files, execute commands

**Diagnosis:**
```bash
# Check file permissions
ls -la /opt/coolify-mcp

# Check user
whoami
id coolify-mcp
```

**Solutions:**
```bash
# Fix ownership
sudo chown -R coolify-mcp:coolify-mcp /opt/coolify-mcp

# Fix permissions
sudo chmod 755 /opt/coolify-mcp
sudo chmod 600 /opt/coolify-mcp/.env
```

---

## 💾 Backup & Recovery

### What to Backup

1. **Application Code**
   ```bash
   tar czf coolify-mcp-backup-$(date +%Y%m%d).tar.gz \
     --exclude=node_modules \
     --exclude=build \
     /opt/coolify-mcp
   ```

2. **Configuration Files**
   ```bash
   # Backup .env (encrypted recommended)
   gpg -c /opt/coolify-mcp/.env
   ```

3. **Systemd Service**
   ```bash
   cp /etc/systemd/system/coolify-mcp.service \
     ~/backups/coolify-mcp.service.backup
   ```

4. **Nginx Configuration**
   ```bash
   cp /etc/nginx/sites-available/coolify-mcp \
     ~/backups/nginx-coolify-mcp.conf
   ```

### Backup Schedule

- **Daily**: Configuration files (.env, service files)
- **Weekly**: Full application backup
- **Before Updates**: Complete system snapshot
- **Retention**: 30 days minimum

### Recovery Procedures

#### Quick Recovery (Service Issues)

```bash
# Stop service
sudo systemctl stop coolify-mcp

# Restore from backup
tar xzf coolify-mcp-backup-20251123.tar.gz -C /opt/

# Restart service
sudo systemctl start coolify-mcp
sudo systemctl status coolify-mcp
```

#### Full Recovery (System Failure)

```bash
# 1. Restore application
tar xzf coolify-mcp-backup-latest.tar.gz -C /opt/

# 2. Restore configuration
gpg -d .env.gpg > /opt/coolify-mcp/.env
chmod 600 /opt/coolify-mcp/.env

# 3. Restore systemd service
cp ~/backups/coolify-mcp.service.backup \
  /etc/systemd/system/coolify-mcp.service
sudo systemctl daemon-reload

# 4. Install dependencies
cd /opt/coolify-mcp
npm ci --production

# 5. Rebuild
npm run build

# 6. Start service
sudo systemctl start coolify-mcp

# 7. Verify
sudo systemctl status coolify-mcp
npm test
```

---

## ⚡ Performance Optimization

### Node.js Optimization

```bash
# Increase memory limit if needed
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable production mode
export NODE_ENV=production
```

### PM2 Alternative (Instead of Systemd)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start build/index.js --name coolify-mcp

# Enable startup
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs coolify-mcp
```

### Nginx Caching

```nginx
# Add to Nginx config
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=mcp_cache:10m max_size=100m inactive=60m;

location / {
    proxy_cache mcp_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key $request_uri;
    # ... rest of config
}
```

### Database Query Optimization

The MCP server uses direct PostgreSQL queries for some operations. Optimize:

```bash
# Analyze slow queries
docker exec coolify-db psql -U coolify -d coolify -c \
  "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## 📈 Metrics & Analytics

### Key Performance Indicators

Monitor these metrics:

1. **Availability**: Target 99.9%
2. **Response Time**: < 200ms average
3. **Error Rate**: < 0.1%
4. **API Success Rate**: > 99%
5. **Test Pass Rate**: > 95% (98/102 currently)

### Logging Best Practices

```javascript
// Application logs
- INFO: Normal operations
- WARN: Potential issues
- ERROR: Failures requiring attention
- DEBUG: Detailed troubleshooting (production: off)
```

### Audit Trail

Important operations to log:
- API authentication
- Configuration changes
- Deployment operations
- Security events
- System errors

---

## 📚 Additional Resources

### Documentation

- [README.md](README.md) - Main documentation
- [SECURITY-AUDIT-REPORT.md](SECURITY-AUDIT-REPORT.md) - Security audit
- [SECURITY-FIXES-SUMMARY.md](SECURITY-FIXES-SUMMARY.md) - Security fix details
- [SERVER-PATCHES-SUMMARY.md](SERVER-PATCHES-SUMMARY.md) - Server patch management
- [V1.0.1-RELEASE.md](V1.0.1-RELEASE.md) - Release notes

### External Links

- [Coolify Documentation](https://coolify.io/docs)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📞 Support & Contacts

### Getting Help

1. **Check Documentation**: Review relevant docs above
2. **Search Issues**: Check GitHub issues
3. **Community**: Join Coolify community
4. **Commercial Support**: Contact maintainers

### Emergency Contacts

For production issues:
- **System Administrator**: [Your contact]
- **DevOps Team**: [Your contact]
- **On-Call Engineer**: [Your contact]

---

## ✅ Production Readiness Checklist

Before going live, verify:

- [ ] All tests passing (98/102 minimum)
- [ ] Security audit reviewed and A- rating confirmed
- [ ] Environment variables configured and secured
- [ ] SSL/TLS certificates installed and valid
- [ ] Firewall rules configured
- [ ] Monitoring and alerting setup
- [ ] Backup procedures tested and automated
- [ ] Rollback plan documented and tested
- [ ] Team trained on operations procedures
- [ ] Documentation reviewed and updated
- [ ] Performance benchmarks met
- [ ] Load testing completed
- [ ] Disaster recovery plan in place

---

**Version**: 1.0.1
**Security Status**: A- (Production Ready)
**Last Updated**: November 23, 2025
