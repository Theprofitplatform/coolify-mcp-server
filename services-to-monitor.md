# Services to Monitor in Uptime Kuma

## Critical Web Services
1. **n8n** - https://n8n.theprofitplatform.com.au
2. **Main Website** - https://theprofitplatform.com.au
3. **Coolify Dashboard** - https://coolify.theprofitplatform.com.au
4. **repair_frontend** - http://localhost:3000 (internal)
5. **seo-dashboard** - http://localhost:9000 (internal)

## Databases & Caches
6. **PostgreSQL (main)** - localhost:5432
7. **PostgreSQL (repair)** - localhost:5433
8. **Redis (main)** - localhost:6379
9. **Redis (repair)** - localhost:6380 (check actual port)
10. **Qdrant Vector DB** - https://qdrant.theprofitplatform.com.au

## Services
11. **Jenkins** - jenkins.theprofitplatform.com.au
12. **FileBrowser** - filebrowser.theprofitplatform.com.au
13. **AnythingLLM** - anythingllm.theprofitplatform.com.au
14. **Glitchtip** - glitchtip.theprofitplatform.com.au
15. **Browserless** - browserless.theprofitplatform.com.au

## SEO Platform Services (Internal)
16. **Keyword Service** - http://localhost:5000
17. **MCP Server** - http://localhost:5001
18. **Mobile API** - http://localhost:3001
19. **SEO Service** - http://localhost:5002 (check actual port)
20. **Orchestrator** - http://localhost:5003 (check actual port)

## GitHub Runners (Docker Health)
21. **runner-1** - Docker container health
22. **runner-5** - Docker container health
23. **runner-automation** - Docker container health

## Monitoring
24. **Uptime Kuma** - http://localhost:3001 (self-monitor)
