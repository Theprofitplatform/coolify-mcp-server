# ⚠️ SECURITY WARNING

## Before Using These Examples

All example workflows contain placeholder credentials:
- `YOUR_COOLIFY_API_TOKEN_HERE`

**NEVER commit files with real credentials to git!**

## Setup Instructions

1. Copy example workflow to N8N
2. Replace `YOUR_COOLIFY_API_TOKEN_HERE` with your actual Coolify API token
3. Save in N8N (do not commit to git)
4. Test workflow

## Best Practices

- Use N8N credentials system for sensitive data
- Never hardcode API tokens in workflows
- Use environment variables when possible
- Review workflows before sharing
- Never commit real credentials to version control

## If You Accidentally Commit Credentials

1. Rotate the credential immediately
2. Remove from git history using BFG Repo-Cleaner
3. Force push the cleaned repository
4. Notify your team

See: ../SECURITY-REMEDIATION-PLAN.md for details
