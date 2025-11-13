# 🔌 Qdrant Access Setup

**Quick Guide to Connect to Your Qdrant Instance**

---

## Current Situation

Your Qdrant is running but **port 6333 is not publicly exposed**.

**Qdrant Details:**
- Container: `qdrant-j4kss8084c008sskcko8oks0`
- Internal DNS: `qdrant-j4kss8084c008sskcko8oks0.31.97.222.218.sslip.io`
- Port: 6333 (not exposed)
- API Key: `***REMOVED***`

---

## Solution Options

### Option 1: SSH Port Forward (Recommended - Secure)

**From your local machine:**

```bash
# Forward Qdrant port through SSH
ssh -L 6333:qdrant-j4kss8084c008sskcko8oks0:6333 avi@31.97.222.218

# Keep this terminal open, then in another terminal:
cd /home/avi/projects/coolify/coolify-mcp

# Update .env to use localhost
echo "QDRANT_HOST=localhost" > .env.qdrant
echo "QDRANT_PORT=6333" >> .env.qdrant
echo "QDRANT_API_KEY=***REMOVED***" >> .env.qdrant

# Use the forwarded connection
npm run qdrant:map
npm run qdrant:stats
```

**Pros:**
- ✅ Secure (encrypted SSH tunnel)
- ✅ No firewall changes needed
- ✅ Works immediately

**Cons:**
- ❌ Need SSH connection open
- ❌ Local machine only

---

### Option 2: Expose Port in Coolify (Easy - Public Access)

**In Coolify UI:**

1. Go to **Services** → **Qdrant**
2. Find **Port Mappings** section
3. Add mapping: `6333:6333`
4. Click **Save**
5. **Restart** the service

**Then update .env:**

```bash
# Use the public DNS
QDRANT_HOST=qdrant-j4kss8084c008sskcko8oks0.31.97.222.218.sslip.io
QDRANT_PORT=6333
QDRANT_API_KEY=***REMOVED***
```

**Pros:**
- ✅ Works from anywhere
- ✅ Simple configuration
- ✅ Persistent

**Cons:**
- ⚠️ Publicly accessible (use firewall if needed)
- ⚠️ Requires Coolify restart

---

### Option 3: Use Custom Domain (Best - Production Ready)

**Setup in Coolify:**

1. Go to **Services** → **Qdrant**
2. Add **Domain**: `qdrant.theprofitplatform.com.au`
3. Enable **SSL/HTTPS**
4. Save and restart

**Update DNS:**
```bash
# Add A record:
qdrant.theprofitplatform.com.au → 31.97.222.218
```

**Update .env:**
```bash
QDRANT_HOST=qdrant.theprofitplatform.com.au
QDRANT_PORT=443  # or 6333 if not using SSL
QDRANT_API_KEY=***REMOVED***
```

**Pros:**
- ✅ Professional domain
- ✅ SSL/HTTPS support
- ✅ Easy to remember
- ✅ Production ready

**Cons:**
- ⚠️ DNS propagation time
- ⚠️ Requires domain setup

---

### Option 4: Docker Network (Server-Side Only)

**Run on VPS server:**

```bash
# This only works when running ON the VPS server
cd /home/avi/projects/coolify/coolify-mcp

# Use Docker network directly
docker run --rm \
  --network j4kss8084c008sskcko8oks0 \
  -v $(pwd):/app \
  -w /app \
  -e QDRANT_HOST=qdrant-j4kss8084c008sskcko8oks0 \
  -e QDRANT_PORT=6333 \
  -e QDRANT_API_KEY=***REMOVED*** \
  -e COOLIFY_BASE_URL=https://coolify.theprofitplatform.com.au \
  -e COOLIFY_TOKEN=$COOLIFY_TOKEN \
  node:20-alpine \
  sh -c "npm install && npm run qdrant:map"
```

**Pros:**
- ✅ No port exposure needed
- ✅ Works immediately on VPS
- ✅ Secure (internal network)

**Cons:**
- ❌ Only works on VPS
- ❌ Complex command
- ❌ Not for local development

---

## Quick Start (Recommended Path)

### For Local Development:

**Step 1: SSH Port Forward**
```bash
# On local machine
ssh -L 6333:qdrant-j4kss8084c008sskcko8oks0:6333 avi@31.97.222.218 -N
```

**Step 2: Update .env**
```bash
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=***REMOVED***
```

**Step 3: Test**
```bash
npm run qdrant:stats
```

### For Production:

**Step 1: Expose in Coolify**
- Services → Qdrant → Port Mappings → Add `6333:6333`

**Step 2: Use DNS**
```bash
QDRANT_HOST=qdrant-j4kss8084c008sskcko8oks0.31.97.222.218.sslip.io
QDRANT_PORT=6333
QDRANT_API_KEY=***REMOVED***
```

**Step 3: Map Infrastructure**
```bash
npm run qdrant:map
```

---

## Current Configuration

Your `.env` is currently set to:

```bash
QDRANT_HOST=qdrant-j4kss8084c008sskcko8oks0.31.97.222.218.sslip.io
QDRANT_PORT=6333
QDRANT_API_KEY=***REMOVED***
```

**This will work once you expose the port in Coolify!**

---

## Testing Connection

### Test 1: Check DNS Resolution
```bash
nslookup qdrant-j4kss8084c008sskcko8oks0.31.97.222.218.sslip.io
# Should return: 31.97.222.218
```

### Test 2: Check Port Access
```bash
nc -zv qdrant-j4kss8084c008sskcko8oks0.31.97.222.218.sslip.io 6333
# Should say: Connection succeeded (if port is exposed)
```

### Test 3: Test API
```bash
curl -H "api-key: ***REMOVED***" \
     http://qdrant-j4kss8084c008sskcko8oks0.31.97.222.218.sslip.io:6333/collections
# Should return: JSON with collections
```

### Test 4: Test with CLI
```bash
npm run qdrant:stats
# Should show: Connected to Qdrant, statistics
```

---

## Troubleshooting

### Error: Connection Refused

**Cause:** Port 6333 not exposed

**Fix:**
1. Go to Coolify UI
2. Services → Qdrant
3. Add port mapping `6333:6333`
4. Restart service

### Error: Cannot connect to Qdrant

**Cause:** DNS not resolving or firewall blocking

**Fix:**
1. Test DNS: `nslookup <qdrant-dns>`
2. Test port: `nc -zv <qdrant-dns> 6333`
3. Check firewall rules
4. Try SSH port forward as alternative

### Error: API key required

**Cause:** API key not set or incorrect

**Fix:**
1. Get key from container:
   ```bash
   docker inspect qdrant-j4kss8084c008sskcko8oks0 | grep QDRANT__SERVICE__API_KEY
   ```
2. Update `.env` with correct key
3. Restart: `npm run qdrant:stats`

---

## Security Recommendations

### If Exposing Port Publicly:

1. **Use Firewall Rules**
   ```bash
   # Only allow from specific IPs
   ufw allow from <your-ip> to any port 6333
   ```

2. **Use Strong API Key**
   - Current key is good, but rotate periodically

3. **Monitor Access**
   ```bash
   # Check Qdrant logs
   docker logs qdrant-j4kss8084c008sskcko8oks0
   ```

4. **Consider VPN**
   - Use Tailscale or Wireguard for secure access

### If Using SSH Forward:

1. **Use SSH Keys** (not passwords)
2. **Disable Password Auth** in SSH config
3. **Keep SSH connection alive**:
   ```
   # In ~/.ssh/config
   Host vps
       HostName 31.97.222.218
       User avi
       LocalForward 6333 qdrant-j4kss8084c008sskcko8oks0:6333
       ServerAliveInterval 60
   ```

---

## Next Steps

**Choose your path:**

### Path A: Quick & Secure (SSH Forward)
1. Start SSH tunnel
2. Update `.env` to use `localhost`
3. Run `npm run qdrant:map`

### Path B: Production Setup (Expose Port)
1. Expose port in Coolify
2. Keep DNS configuration
3. Run `npm run qdrant:map`

### Path C: Professional (Custom Domain)
1. Add domain in Coolify
2. Update DNS records
3. Enable SSL
4. Run `npm run qdrant:map`

---

## Summary

**Your Qdrant is running and ready!**

**To use it, you need to:**
1. ✅ Either expose port 6333 in Coolify
2. ✅ Or use SSH port forwarding
3. ✅ Then run `npm run qdrant:map`

**Recommended:** Expose port in Coolify (5 minutes)

**Alternative:** SSH port forward (instant, but temporary)

---

**Guide Created:** 2025-11-13
**Status:** Qdrant running, port not exposed
**Action Required:** Choose access method and expose/forward port

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
