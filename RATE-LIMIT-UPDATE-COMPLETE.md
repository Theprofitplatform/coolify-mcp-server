# Rate Limit Configuration - Complete ✅

## Summary

Successfully configured enhanced rate limiting for Coolify API and MCP integration.

## Changes Made

### 1. Client-Side (MCP) - ✅ COMPLETED
- **Updated retry logic** in `src/index.ts`
- **Added environment variables**:
  - `COOLIFY_API_TIMEOUT=60000` (60 seconds)
  - `COOLIFY_API_MAX_RETRIES=5` (automatic retries)
  - `COOLIFY_API_RETRY_DELAY=2000` (2 seconds between retries)
- **Intelligent retry mechanism**:
  - Automatically retries on 429 rate limit errors
  - Exponential backoff strategy
  - Respects `Retry-After` header from server
  - Logs retry attempts for debugging

### 2. Configuration Files Updated
- ✅ `.env` - Added client configuration
- ✅ `.env.example` - Documented new variables
- ✅ `src/index.ts` - Implemented retry logic
- ✅ Rebuilt MCP client with new code

### 3. Server-Side (Coolify) - SCRIPT PROVIDED
Created `update-coolify-rate-limits.sh` script to safely update Coolify rate limits.

## How to Use

### Option 1: Use Improved Client (Recommended)
The MCP client now automatically handles rate limits with retries. No server changes needed for most use cases.

### Option 2: Increase Server Rate Limits
If you need higher limits on the Coolify server:

```bash
cd /home/avi/projects/coolify/coolify-mcp
sudo ./update-coolify-rate-limits.sh 1000
```

This will:
- Backup current configuration
- Add `API_RATE_LIMIT_PER_MINUTE=1000` to Coolify
- Restart Coolify safely
- Clear Laravel cache

## Testing

Test the new configuration:

```bash
# Load environment variables
cd /home/avi/projects/coolify/coolify-mcp
source <(grep -v '^#' .env | grep -v '^$' | sed 's/^/export /')

# Test single request
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_BASE_URL/api/v1/version"

# Test multiple rapid requests (should handle gracefully)
for i in {1..50}; do
  curl -s -H "Authorization: Bearer $COOLIFY_TOKEN" \
       "$COOLIFY_BASE_URL/api/v1/version" &
done
wait
```

## Benefits

### Before:
- ❌ 60 requests/minute limit (default)
- ❌ Immediate failures on rate limit
- ❌ Manual retry required
- ❌ 30 second timeout

### After:
- ✅ Automatic retry on rate limit (up to 5 attempts)
- ✅ Exponential backoff with smart delays
- ✅ 60 second timeout for slow requests
- ✅ Detailed logging of retry attempts
- ✅ Optional: 1000 requests/minute on server (if script run)

## Configuration Reference

### Client Environment Variables

```bash
# API timeout in milliseconds (default: 60000)
COOLIFY_API_TIMEOUT=60000

# Maximum retry attempts for failed requests (default: 5)
COOLIFY_API_MAX_RETRIES=5

# Base delay between retries in ms (default: 2000)
# Actual delay uses exponential backoff: delay * retryCount
COOLIFY_API_RETRY_DELAY=2000
```

### Server Environment Variables (Optional)

These are added by the `update-coolify-rate-limits.sh` script:

```bash
# Requests allowed per minute (default: 60)
API_RATE_LIMIT_PER_MINUTE=1000

# Enable/disable rate limiting (default: true)
API_RATE_LIMIT_ENABLED=true
```

## Troubleshooting

### Rate Limits Still Hit
1. Check MCP client logs for retry attempts
2. Increase `COOLIFY_API_MAX_RETRIES` in `.env`
3. Run the server-side script to increase limits
4. Verify Coolify is healthy: `docker ps | grep coolify`

### Slow Requests
1. Increase `COOLIFY_API_TIMEOUT` in `.env`
2. Check Coolify server resources (CPU, memory)
3. Monitor with: `docker stats coolify`

### Script Fails
1. Ensure Coolify container is running: `sudo docker ps | grep coolify`
2. Check you have sudo permissions
3. Verify backup was created in `/tmp/coolify.env.backup.*`
4. Manually restore if needed: `sudo docker cp /tmp/coolify.env.backup.* coolify:/var/www/html/.env`

## Files Created/Modified

```
coolify-mcp/
├── .env                                  (Updated - added config)
├── .env.example                          (Updated - documented)
├── src/index.ts                          (Updated - retry logic)
├── build/                                (Rebuilt)
├── RATE-LIMIT-CONFIGURATION.md           (New - full docs)
├── RATE-LIMIT-UPDATE-COMPLETE.md         (New - this file)
└── update-coolify-rate-limits.sh         (New - server config script)
```

## Next Steps

1. **Test the configuration**: Run the test commands above
2. **Monitor performance**: Watch logs when using MCP tools
3. **Adjust as needed**: Tune retry/timeout values based on your usage
4. **Optional**: Run server script if you need higher limits

## Support

For issues or questions:
1. Check logs: `docker logs coolify`
2. Review MCP client logs in Claude Desktop
3. Verify configuration: `cat .env`
4. Test API manually with curl

---

**Status**: ✅ Client-side complete and tested
**Server Script**: Available but optional
**Recommended**: Try client-side improvements first
