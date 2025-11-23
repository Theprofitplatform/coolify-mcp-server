# Coolify API Rate Limit Configuration

## Overview
This guide explains how to increase rate limits for Coolify API when using it for personal use and MCP integration.

## Understanding Coolify Rate Limits

Coolify is built on Laravel and uses Laravel's `RateLimiter` middleware. The default API rate limit is typically:
- **60 requests per minute** per IP address/token

For personal use and MCP integration, this can be increased significantly.

## Server-Side Configuration (Coolify Instance)

### Option 1: Add Custom Rate Limit Environment Variable

Add these variables to your Coolify `.env` file:

```bash
# Custom API Rate Limits
API_RATE_LIMIT_PER_MINUTE=1000
API_RATE_LIMIT_ENABLED=true
```

Execute this command to add the configuration:

```bash
sudo docker exec coolify sh -c "echo '' >> /var/www/html/.env && \
echo '# Custom API Rate Limits for MCP Integration' >> /var/www/html/.env && \
echo 'API_RATE_LIMIT_PER_MINUTE=1000' >> /var/www/html/.env && \
echo 'API_RATE_LIMIT_ENABLED=true' >> /var/www/html/.env"
```

### Option 2: Disable Rate Limiting (Personal Use Only)

If you're the only user and want to completely disable rate limiting:

```bash
sudo docker exec coolify sh -c "echo 'API_RATE_LIMIT_ENABLED=false' >> /var/www/html/.env"
```

### Apply Changes

After modifying the `.env` file, restart Coolify:

```bash
sudo docker restart coolify
```

## Client-Side Configuration (MCP)

### Update MCP .env File

Add these settings to configure client-side retry and timeout behavior:

```bash
# API Request Configuration
COOLIFY_API_TIMEOUT=60000
COOLIFY_API_MAX_RETRIES=3
COOLIFY_API_RETRY_DELAY=2000
```

### Implementation

Update your MCP client to:
1. Increase request timeout
2. Add retry logic for rate limit errors
3. Add exponential backoff

## Verification

Test the new rate limits:

```bash
# Run multiple API calls in quick succession
for i in {1..100}; do
  curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
       "$COOLIFY_BASE_URL/api/v1/version" &
done
wait
```

## Recommended Settings

### For Personal Use:
- **Rate Limit**: 500-1000 requests/minute
- **Timeout**: 60 seconds
- **Retries**: 3 attempts with exponential backoff

### For MCP Integration:
- **Rate Limit**: 1000+ requests/minute (since it's automated)
- **Timeout**: 60 seconds
- **Retries**: 5 attempts with longer delays

## Security Considerations

⚠️ **Important**: 
- Only increase rate limits on personally managed instances
- Use IP whitelisting if exposing the API publicly
- Monitor API usage to detect abuse
- Keep your API token secure

## Troubleshooting

### Rate Limit Still Triggered
1. Verify `.env` changes were applied
2. Restart Coolify container
3. Clear Laravel cache: `sudo docker exec coolify php artisan config:clear`

### Performance Issues
If high rate limits cause performance problems:
1. Monitor server resources (CPU, RAM)
2. Adjust rate limits based on server capacity
3. Consider horizontal scaling for production use

## Alternative: Modify Coolify Source

For advanced users, you can modify Coolify's rate limiting directly in the source code:

```php
// In Laravel RouteServiceProvider or routes/api.php
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(env('API_RATE_LIMIT_PER_MINUTE', 60))
        ->by($request->user()?->id ?: $request->ip());
});
```

This requires rebuilding the Coolify Docker image with your custom configuration.
