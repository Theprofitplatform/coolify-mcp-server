# Security Remediation Execution Checklist

**Purpose**: Step-by-step execution guide for v1.0.2 security remediation
**Estimated Time**: 4 hours total
**Status**: Ready for execution

---

## 📋 Quick Navigation

- [Prerequisites](#prerequisites)
- [Phase 1: Credential Rotation](#phase-1-credential-rotation-1-hour)
- [Phase 2: Code Remediation](#phase-2-code-remediation-15-minutes)
- [Phase 3: Git History Cleanup](#phase-3-git-history-cleanup-2-hours)
- [Phase 4: Production Deployment](#phase-4-production-deployment-30-minutes)
- [Verification](#final-verification)

---

## Prerequisites

### Before Starting

- [ ] Read SECURITY-REMEDIATION-PLAN.md (full context)
- [ ] Read CRITICAL-REVIEW-FINDINGS.md (understand vulnerabilities)
- [ ] Read RELEASE-PLAN-v1.0.2.md (complete release plan)
- [ ] Coordinate with team for git history rewrite
- [ ] Schedule 4-hour execution window
- [ ] Ensure you have access to:
  - [ ] Qdrant console (for API key generation)
  - [ ] Coolify dashboard (for token generation)
  - [ ] Production server (SSH access)
  - [ ] Git repository (push access)

### Create Backup

```bash
# 1. Create repository mirror backup
cd ~/projects/coolify
git clone --mirror coolify-mcp coolify-mcp-backup-$(date +%Y%m%d-%H%M%S)

# 2. Create working directory backup
cp -r coolify-mcp coolify-mcp-backup-working-$(date +%Y%m%d-%H%M%S)

# 3. Verify backups
ls -lh coolify-mcp-backup-*

# 4. Create production .env backup
ssh production "sudo cp /opt/coolify-mcp/.env /opt/coolify-mcp/.env.backup.\$(date +%Y%m%d-%H%M%S)"
```

**Time**: 15 minutes

---

## Phase 1: Credential Rotation (1 hour)

### Step 1.1: Rotate Qdrant API Key

**Time**: 30 minutes

```bash
# ✅ Task: Generate new Qdrant API key

# 1. Open Qdrant console
open https://qdrant.theprofitplatform.com.au

# 2. Login and navigate to Settings > API Keys

# 3. Generate new API key
#    - Click "Generate New Key"
#    - Copy new key to secure location
#    - DO NOT CLOSE browser tab yet

# 4. Test new key
export QDRANT_NEW_KEY="paste-new-key-here"

curl -H "api-key: $QDRANT_NEW_KEY" \
  https://qdrant.theprofitplatform.com.au:443/collections

# Expected: JSON response with collections list

# 5. If test successful, save new key
echo "QDRANT_NEW_KEY=$QDRANT_NEW_KEY" >> ~/.secure-credentials-temp
```

**Checkpoint**:
- [ ] New Qdrant key generated
- [ ] New key tested successfully
- [ ] New key saved securely
- [ ] Browser tab still open (for revocation later)

### Step 1.2: Rotate Coolify API Token

**Time**: 30 minutes

```bash
# ✅ Task: Generate new Coolify API token

# 1. Open Coolify dashboard
open https://coolify.theprofitplatform.com.au

# 2. Login and navigate to Settings > API

# 3. Generate new token
#    - Click "Create New Token"
#    - Name: "coolify-mcp-v1.0.2"
#    - Permissions: Full access
#    - Copy token to secure location
#    - DO NOT CLOSE browser tab yet

# 4. Test new token
export COOLIFY_NEW_TOKEN="paste-new-token-here"

curl -H "Authorization: Bearer $COOLIFY_NEW_TOKEN" \
  https://coolify.theprofitplatform.com.au/api/v1/version

# Expected: {"version": "4.x.x"}

# 5. If test successful, save new token
echo "COOLIFY_NEW_TOKEN=$COOLIFY_NEW_TOKEN" >> ~/.secure-credentials-temp
```

**Checkpoint**:
- [ ] New Coolify token generated
- [ ] New token tested successfully
- [ ] New token saved securely
- [ ] Browser tab still open (for revocation later)

### Step 1.3: Update Production Environment

**Time**: 15 minutes

```bash
# ✅ Task: Update production .env with new credentials

# 1. SSH to production server
ssh production

# 2. Backup current .env
sudo cp /opt/coolify-mcp/.env /opt/coolify-mcp/.env.pre-v1.0.2-backup

# 3. Update .env with new credentials
sudo nano /opt/coolify-mcp/.env

# Update these lines:
# QDRANT_API_KEY=<paste-new-qdrant-key>
# COOLIFY_TOKEN=<paste-new-coolify-token>

# 4. Verify changes
sudo cat /opt/coolify-mcp/.env | grep QDRANT_API_KEY
sudo cat /opt/coolify-mcp/.env | grep COOLIFY_TOKEN

# 5. Restart service with new credentials
sudo systemctl restart coolify-mcp

# 6. Check service status
sudo systemctl status coolify-mcp

# 7. Check logs for errors
sudo journalctl -u coolify-mcp -n 50 --no-pager

# 8. Test MCP tools (basic functionality check)
# Use Claude Desktop to test a simple tool

# 9. Exit SSH
exit
```

**Checkpoint**:
- [ ] Production .env backed up
- [ ] Production .env updated with new credentials
- [ ] Service restarted successfully
- [ ] No errors in logs
- [ ] MCP tools functional with new credentials

### Step 1.4: Revoke Old Credentials

**Time**: 10 minutes

```bash
# ✅ Task: Revoke old credentials (IMPORTANT!)

# 1. Revoke old Qdrant key
#    - Go back to Qdrant console browser tab
#    - Settings > API Keys
#    - Find old key (not the new one!)
#    - Click "Revoke"
#    - Confirm revocation

# 2. Revoke old Coolify token
#    - Go back to Coolify dashboard browser tab
#    - Settings > API
#    - Find old token (not the new one!)
#    - Click "Revoke"
#    - Confirm revocation

# 3. Verify old credentials no longer work
export OLD_QDRANT_KEY="***REMOVED***"
export OLD_COOLIFY_TOKEN="***REMOVED***"

curl -H "api-key: $OLD_QDRANT_KEY" \
  https://qdrant.theprofitplatform.com.au:443/collections
# Expected: 401 Unauthorized or similar error

curl -H "Authorization: Bearer $OLD_COOLIFY_TOKEN" \
  https://coolify.theprofitplatform.com.au/api/v1/version
# Expected: 401 Unauthorized

# 4. Clean up
rm ~/.secure-credentials-temp
unset QDRANT_NEW_KEY COOLIFY_NEW_TOKEN OLD_QDRANT_KEY OLD_COOLIFY_TOKEN
```

**Checkpoint**:
- [ ] Old Qdrant key revoked
- [ ] Old Coolify token revoked
- [ ] Verified old credentials don't work
- [ ] Production service still running with new credentials

**✅ Phase 1 Complete**: Credentials rotated (1 hour elapsed)

---

## Phase 2: Code Remediation (15 minutes)

### Step 2.1: Run Automated Fix Script

**Time**: 5 minutes

```bash
# ✅ Task: Remove hardcoded credentials from code

cd ~/projects/coolify/coolify-mcp

# 1. Ensure on main branch
git checkout main
git pull origin main

# 2. Run automated fix script
./scripts/fix-hardcoded-credentials.sh

# 3. Review changes
git status
git diff

# Expected changes:
# - src/qdrant/client.ts (hardcoded key removed)
# - qdrant-docker.sh (env var required)
# - n8n-examples/*.json (credentials replaced with placeholders)
# - .gitignore (sensitive files added)
# - New .example files created
```

**Checkpoint**:
- [ ] Script executed without errors
- [ ] Changes reviewed
- [ ] No unexpected modifications

### Step 2.2: Verify and Test

**Time**: 5 minutes

```bash
# ✅ Task: Verify no credentials remain

# 1. Run verification script
./scripts/verify-no-credentials.sh

# Expected output: "ALL CHECKS PASSED - No credentials found!"

# 2. Build project
npm run build

# Expected: Build completes without errors

# 3. Run tests
npm test

# Expected: 98/102 tests passing (4 require live instance)

# 4. Run security tests specifically
npm test tests/security/injection-prevention.test.ts

# Expected: 15/15 security tests passing
```

**Checkpoint**:
- [ ] Verification script passed
- [ ] Build successful
- [ ] Tests passing
- [ ] Security tests passing

### Step 2.3: Commit Code Changes

**Time**: 5 minutes

```bash
# ✅ Task: Commit remediation changes

# 1. Remove tracked sensitive files
git rm --cached coolify-mcp.service 2>/dev/null || true
git rm --cached claude-config.json 2>/dev/null || true
git rm --cached claude-desktop-config.json 2>/dev/null || true

# 2. Stage all changes
git add .

# 3. Commit
git commit -m "fix: remove all hardcoded production credentials (v1.0.2)

SECURITY FIXES (CRITICAL):
- Remove hardcoded Qdrant API key from src/qdrant/client.ts
- Remove production tokens from service and config files
- Replace with environment variable requirements
- Create .example templates with placeholders
- Add .gitignore entries for sensitive files

BREAKING CHANGES:
- Users must create config files from .example templates
- QDRANT_API_KEY environment variable required (no fallback)
- COOLIFY_TOKEN must be provided via environment

Files modified:
- src/qdrant/client.ts (remove hardcoded API key)
- qdrant-docker.sh (require env var)
- n8n-examples/*.json (replace with placeholders)
- .gitignore (add sensitive files)

Files created:
- coolify-mcp.service.example (template)
- claude-config.example.json (template)
- claude-desktop-config.example.json (template)
- credentials.env.example (template)
- n8n-examples/SECURITY-WARNING.md

See: SECURITY-REMEDIATION-PLAN.md for complete details
Ref: CRITICAL-REVIEW-FINDINGS.md

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Verify commit
git log -1 --stat
```

**Checkpoint**:
- [ ] Sensitive files removed from git tracking
- [ ] Changes committed
- [ ] Commit message complete
- [ ] Commit verified

**✅ Phase 2 Complete**: Code remediation (1h 15m elapsed)

---

## Phase 3: Git History Cleanup (2 hours)

⚠️ **WARNING**: This phase rewrites git history. Team must re-clone repository after this phase.

### Step 3.1: Team Coordination

**Time**: 15 minutes

```bash
# ✅ Task: Notify team of history rewrite

# 1. Send team notification email
# Subject: [ACTION REQUIRED] Git History Rewrite - Coolify MCP Server
# Body: See RELEASE-PLAN-v1.0.2.md "Team Coordination" section

# 2. Wait for all team members to:
#    - Commit and push their work
#    - Acknowledge readiness

# 3. Set execution time
#    - Coordinate time when all team members are available
#    - Block 2-3 hours
```

**Checkpoint**:
- [ ] Team notified
- [ ] All team members ready
- [ ] Execution time scheduled
- [ ] All pending work committed and pushed

### Step 3.2: Download BFG Repo-Cleaner

**Time**: 5 minutes

```bash
# ✅ Task: Download BFG tool

cd ~/projects/coolify/coolify-mcp

# Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Verify download
ls -lh bfg-1.14.0.jar

# Test Java installation
java -version

# If Java not installed:
# Ubuntu: sudo apt-get install default-jre
# macOS: brew install openjdk
```

**Checkpoint**:
- [ ] BFG downloaded
- [ ] Java installed and working
- [ ] Ready to run BFG

### Step 3.3: Create Credentials Replacement File

**Time**: 5 minutes

```bash
# ✅ Task: Create credentials replacement patterns

cat > /tmp/credentials.txt <<'EOF'
***REMOVED***==>***REMOVED-QDRANT-API-KEY***
***REMOVED***==>***REMOVED-COOLIFY-TOKEN***
EOF

# Verify file created
cat /tmp/credentials.txt
```

**Checkpoint**:
- [ ] Replacement file created
- [ ] Patterns verified

### Step 3.4: Run BFG Repo-Cleaner

**Time**: 30 minutes

```bash
# ✅ Task: Clean git history

cd ~/projects/coolify/coolify-mcp

# 1. Run BFG
java -jar bfg-1.14.0.jar --replace-text /tmp/credentials.txt

# 2. Clean up git internals
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. Review BFG report
# BFG will show which commits were modified
```

**Checkpoint**:
- [ ] BFG completed without errors
- [ ] Git cleanup completed
- [ ] Report reviewed

### Step 3.5: Verify Credentials Removed

**Time**: 15 minutes

```bash
# ✅ Task: Verify no credentials in history

# 1. Search for Qdrant key in history
git log --all -S "***REMOVED***" --pretty=format:"%H"

# Expected: EMPTY output (no results)

# 2. Search for Coolify token in history
git log --all -S "***REMOVED***" --pretty=format:"%H"

# Expected: EMPTY output (no results)

# 3. Run verification script with history check
./scripts/verify-no-credentials.sh --check-history

# Expected: "ALL CHECKS PASSED - No credentials found!"

# 4. Check repository size
du -sh .git

# Should be smaller than before (credentials removed)
```

**Checkpoint**:
- [ ] Qdrant key NOT found in history
- [ ] Coolify token NOT found in history
- [ ] Verification script passed
- [ ] Repository size reduced

### Step 3.6: Force Push (DANGEROUS!)

**Time**: 10 minutes

⚠️ **CRITICAL WARNING**: This step is destructive. Team must re-clone after this.

```bash
# ✅ Task: Force push cleaned history

# 1. FINAL CHECK - Verify team is ready
echo "Team ready for force push? (yes/no)"
read TEAM_READY

if [ "$TEAM_READY" != "yes" ]; then
  echo "Aborting. Coordinate with team first."
  exit 1
fi

# 2. Force push all branches
git push origin --force --all

# 3. Force push all tags
git push origin --force --tags

# 4. Verify push successful
git log -1
```

**Checkpoint**:
- [ ] Team confirmed ready
- [ ] Force push completed
- [ ] All branches pushed
- [ ] All tags pushed

### Step 3.7: Send Re-clone Instructions

**Time**: 10 minutes

```bash
# ✅ Task: Notify team to re-clone

# Send email with subject: [ACTION REQUIRED] Re-clone Coolify MCP Server Repository

# Body (see RELEASE-PLAN-v1.0.2.md "Post-Release Communication" section):

Subject: [ACTION REQUIRED] Re-clone Coolify MCP Server Repository

Team,

Git history has been cleaned. You MUST re-clone the repository now.

Step-by-step instructions:

1. Backup your local .env file:
   cd ~/projects/coolify/coolify-mcp
   cp .env ~/.env.coolify.backup

2. Delete your current repository:
   cd ~/projects/coolify
   mv coolify-mcp coolify-mcp-old

3. Re-clone the repository:
   git clone [repository-url] coolify-mcp
   cd coolify-mcp

4. Restore your .env file:
   cp ~/.env.coolify.backup .env

5. Install dependencies and build:
   npm install
   npm run build

6. Verify it works:
   npm test

7. Clean up:
   rm -rf ~/projects/coolify/coolify-mcp-old

DO NOT try to git pull/merge - you MUST re-clone.

Reply when done.
```

**Checkpoint**:
- [ ] Re-clone instructions sent to all team members
- [ ] Instructions clear and complete
- [ ] Support channel ready for questions

**✅ Phase 3 Complete**: Git history cleaned (3h 15m elapsed)

---

## Phase 4: Production Deployment (30 minutes)

### Step 4.1: Update Documentation

**Time**: 10 minutes

```bash
# ✅ Task: Update version and documentation

cd ~/projects/coolify/coolify-mcp

# 1. Update version in package.json
npm version patch -m "chore: bump version to 1.0.2 for security release"

# 2. Update CHANGELOG.md
cat >> CHANGELOG.md <<'EOF'

## [1.0.2] - $(date +%Y-%m-%d)

### Security Fixes (CRITICAL)
- **[CRITICAL]** Remove hardcoded Qdrant API key from src/qdrant/client.ts
- **[CRITICAL]** Remove production Coolify tokens from service files
- **[CRITICAL]** Remove production credentials from config files
- **[CRITICAL]** Remove production credentials from N8N examples
- **[CRITICAL]** Remove hardcoded API key from qdrant-docker.sh
- **[CRITICAL]** Clean git history to remove all exposed credentials

### Breaking Changes
- QDRANT_API_KEY environment variable now required (no fallback)
- Users must create config files from .example templates

### Added
- coolify-mcp.service.example - systemd service template
- claude-config.example.json - Claude config template
- credentials.env.example - credentials template
- scripts/fix-hardcoded-credentials.sh - automated fix script
- scripts/verify-no-credentials.sh - verification script
- SECURITY-REMEDIATION-PLAN.md - complete remediation guide
- CRITICAL-REVIEW-FINDINGS.md - security review report
- QUICK-FIX-GUIDE.md - quick reference guide
- RELEASE-PLAN-v1.0.2.md - comprehensive release plan
- RELEASE-NOTES-v1.0.2.md - release notes

### Security Impact
- BEFORE: Security Rating D+ (Critical credential exposure)
- AFTER: Security Rating A- (Production ready)
- CVSS Score: Fixed 6 critical vulnerabilities (CVSS 9.1)

See SECURITY-REMEDIATION-PLAN.md for complete details.
EOF

# 3. Commit documentation updates
git add package.json CHANGELOG.md
git commit -m "docs: update documentation for v1.0.2 security release

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Push changes
git push origin main
```

**Checkpoint**:
- [ ] Version bumped to 1.0.2
- [ ] CHANGELOG.md updated
- [ ] Changes committed and pushed

### Step 4.2: Create GitHub Release

**Time**: 10 minutes

```bash
# ✅ Task: Create GitHub release

# 1. Tag the release
git tag -a v1.0.2 -m "Critical Security Patch - Credential Exposure Fixes

This release addresses 6 critical credential exposure vulnerabilities:
- Hardcoded API keys in source code
- Production tokens in configuration files
- Credentials in git history

BREAKING CHANGES:
- QDRANT_API_KEY environment variable required (no fallback)
- Config files must be created from .example templates

Security Impact:
- Fixes CVSS 9.1 critical vulnerabilities
- Improves security rating from D+ to A-

See SECURITY-REMEDIATION-PLAN.md for complete details."

# 2. Push tag
git push origin v1.0.2

# 3. Create GitHub release (if gh CLI installed)
gh release create v1.0.2 \
  --title "v1.0.2 - Critical Security Patch" \
  --notes-file RELEASE-NOTES-v1.0.2.md \
  --target main

# OR create release manually in GitHub UI
# - Go to Releases > Create new release
# - Tag: v1.0.2
# - Title: v1.0.2 - Critical Security Patch
# - Description: Paste content from RELEASE-NOTES-v1.0.2.md
```

**Checkpoint**:
- [ ] Git tag created
- [ ] Tag pushed
- [ ] GitHub release created

### Step 4.3: Deploy to Production

**Time**: 10 minutes

```bash
# ✅ Task: Deploy v1.0.2 to production

# 1. SSH to production
ssh production

# 2. Navigate to deployment directory
cd /opt/coolify-mcp

# 3. Fetch latest
git fetch --all --tags

# 4. Checkout v1.0.2
git checkout v1.0.2

# 5. Verify .env file (should have rotated credentials from Phase 1)
cat .env | grep QDRANT_API_KEY | grep -v "***REMOVED***"
# Should show NEW key, not old one

cat .env | grep COOLIFY_TOKEN | grep -v "***REMOVED***"
# Should show NEW token, not old one

# 6. Install dependencies
npm install

# 7. Build
npm run build

# 8. Restart service
sudo systemctl restart coolify-mcp

# 9. Check status
sudo systemctl status coolify-mcp

# 10. Check logs
sudo journalctl -u coolify-mcp -n 100 --no-pager

# 11. Exit
exit
```

**Checkpoint**:
- [ ] v1.0.2 checked out on production
- [ ] .env file has NEW credentials (rotated in Phase 1)
- [ ] Build successful
- [ ] Service started successfully
- [ ] No errors in logs

**✅ Phase 4 Complete**: Production deployment (3h 45m elapsed)

---

## Final Verification

### Immediate Verification (Right After Deployment)

**Time**: 15 minutes

```bash
# ✅ Task: Verify deployment success

# 1. Service health check
ssh production "sudo systemctl status coolify-mcp"

# Expected: active (running)

# 2. Log check for errors
ssh production "sudo journalctl -u coolify-mcp -n 100 --no-pager | grep -i error"

# Expected: No critical errors

# 3. MCP tools functionality test
# - Open Claude Desktop
# - Verify Coolify MCP server connected
# - Test 3-5 basic tools:
#   - list_applications
#   - get_servers
#   - get_deployment_logs (sample deployment)

# 4. Local verification
cd ~/projects/coolify/coolify-mcp

./scripts/verify-no-credentials.sh
# Expected: "ALL CHECKS PASSED"

./scripts/verify-no-credentials.sh --check-history
# Expected: "ALL CHECKS PASSED" + "No credentials in git history"

# 5. Build and test
npm run build
npm test

# Expected: Build successful, 98/102 tests passing
```

**Final Checkpoint**:
- [ ] Production service running
- [ ] No errors in logs
- [ ] MCP tools functional
- [ ] Verification scripts pass
- [ ] Build and tests pass
- [ ] No credentials in codebase or history

---

## Post-Deployment Monitoring

### 24-Hour Monitoring

```bash
# Schedule checks for next 24 hours

# Hour 1:
ssh production "sudo systemctl status coolify-mcp"
ssh production "sudo journalctl -u coolify-mcp -n 50 --no-pager | tail -20"

# Hour 4:
# Check for memory leaks
ssh production "ps aux | grep coolify-mcp | grep -v grep"

# Hour 8:
# Verify service still running
ssh production "sudo systemctl status coolify-mcp"

# Hour 24:
# Full health check
ssh production "sudo systemctl status coolify-mcp"
ssh production "sudo journalctl -u coolify-mcp --since '24 hours ago' | grep -i error | wc -l"
# Expected: 0 errors
```

### Week 1 Tasks

- [ ] Day 1: Install pre-commit hooks (see RELEASE-PLAN-v1.0.2.md "Preventive Measures")
- [ ] Day 2: Add CI/CD secret scanning
- [ ] Day 3: Verify team has re-cloned successfully
- [ ] Day 7: Schedule security training
- [ ] Day 7: Conduct post-release retrospective

---

## Success Criteria

The remediation is considered successful when ALL of the following are true:

### Code Quality
- [x] All 6 hardcoded credential issues fixed
- [x] Build passes without errors
- [x] All 15 security tests passing
- [x] Verification script passes all checks
- [x] No credentials in working directory
- [x] No credentials in .example templates

### Git Repository
- [ ] Credentials removed from git history (ALL commits)
- [ ] Force push completed successfully
- [ ] All team members re-cloned successfully
- [ ] Repository size reduced
- [ ] No credentials found in any commit

### Credentials
- [ ] Old Qdrant API key revoked
- [ ] Old Coolify token revoked
- [ ] New credentials working in production
- [ ] No authentication errors
- [ ] Old credentials verified non-functional

### Production Deployment
- [ ] Service deployed to production (v1.0.2)
- [ ] Service running without errors
- [ ] All MCP tools functional
- [ ] No performance degradation
- [ ] 24-hour stability verified

### Documentation
- [ ] CHANGELOG.md updated
- [ ] Version bumped to 1.0.2
- [ ] GitHub release created
- [ ] Release notes published
- [ ] Team notified

---

## Rollback Procedures

### If Phase 1 Fails (Credential Rotation)

```bash
# Rollback: Restore old credentials

# 1. SSH to production
ssh production

# 2. Restore backup .env
sudo cp /opt/coolify-mcp/.env.pre-v1.0.2-backup /opt/coolify-mcp/.env

# 3. Restart service
sudo systemctl restart coolify-mcp

# 4. Verify service running
sudo systemctl status coolify-mcp
```

### If Phase 2 Fails (Code Remediation)

```bash
# Rollback: Restore from backup

cd ~/projects/coolify
rm -rf coolify-mcp
cp -r coolify-mcp-backup-working-$(date +%Y%m%d)* coolify-mcp
cd coolify-mcp

# Reset to pre-remediation state
git reset --hard origin/main
```

### If Phase 3 Fails (Git History Cleanup)

```bash
# Rollback: Restore from mirror backup

cd ~/projects/coolify
rm -rf coolify-mcp
git clone coolify-mcp-backup-$(date +%Y%m%d)* coolify-mcp
cd coolify-mcp

# Force push to restore old history
git push origin --force --all
git push origin --force --tags

# Notify team: "Git history cleanup failed, restored to previous state"
```

### If Phase 4 Fails (Production Deployment)

```bash
# Rollback: Deploy previous version

ssh production
cd /opt/coolify-mcp
git checkout v1.0.1
npm install
npm run build
sudo systemctl restart coolify-mcp
sudo systemctl status coolify-mcp
```

---

## Troubleshooting

### Common Issues

**Issue**: BFG fails with "java.lang.OutOfMemoryError"

```bash
# Solution: Increase Java heap size
java -Xmx2g -jar bfg-1.14.0.jar --replace-text /tmp/credentials.txt
```

**Issue**: Service fails to start after credential rotation

```bash
# Solution: Verify .env file format
ssh production
cat /opt/coolify-mcp/.env
# Check for:
# - Correct variable names
# - No quotes around values (unless needed)
# - No extra whitespace
# - Unix line endings (LF, not CRLF)
```

**Issue**: Team member cannot re-clone (permission denied)

```bash
# Solution: Verify git credentials
git config --global user.name
git config --global user.email
ssh -T git@github.com
# or
https://github.com/[username]/[repo].git (use personal access token)
```

**Issue**: Verification script reports credentials in history

```bash
# Solution: BFG may need to run again
java -jar bfg-1.14.0.jar --replace-text /tmp/credentials.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all --force-with-lease
```

---

## Contact Information

### During Execution

**If you encounter issues during execution**:

1. **Stop immediately** - Don't proceed if unsure
2. **Document the issue** - Capture error messages
3. **Consult the detailed guides**:
   - SECURITY-REMEDIATION-PLAN.md (comprehensive)
   - QUICK-FIX-GUIDE.md (troubleshooting)
   - RELEASE-PLAN-v1.0.2.md (rollback procedures)
4. **Use backups** - Restore from backup if needed

### Support Resources

- **Full Remediation Guide**: SECURITY-REMEDIATION-PLAN.md
- **Quick Reference**: QUICK-FIX-GUIDE.md
- **Release Plan**: RELEASE-PLAN-v1.0.2.md
- **Security Findings**: CRITICAL-REVIEW-FINDINGS.md
- **Operations Guide**: OPERATIONS-GUIDE.md

---

## Completion

When all phases are complete and all checkpoints passed:

✅ **CONGRATULATIONS!**

You have successfully:
- Rotated all exposed credentials
- Removed hardcoded credentials from code
- Cleaned git history
- Deployed v1.0.2 to production
- Improved security rating from D+ to A-
- Eliminated 6 critical vulnerabilities (CVSS 9.1)

**Next Steps**:
1. Monitor production for 24 hours
2. Verify team has re-cloned successfully
3. Install preventive measures (Week 1)
4. Conduct post-release retrospective
5. Schedule quarterly security audits

**Security Status**: ✅ PRODUCTION READY

---

**Document Version**: 1.0
**Last Updated**: 2025-11-23
**Execution Status**: READY

---

*This execution checklist is part of the comprehensive security remediation effort for the Coolify MCP Server v1.0.2 release. Follow all steps carefully and verify each checkpoint before proceeding.*
