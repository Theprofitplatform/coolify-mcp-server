# Release Plan: v1.0.2 - Critical Security Patch

**Release Date**: TBD (After credential rotation)
**Version**: 1.0.2
**Type**: CRITICAL SECURITY PATCH
**Priority**: URGENT
**Severity**: CVSS 9.1 (Critical)

---

## Executive Summary

This release addresses 6 critical credential exposure vulnerabilities discovered in post-v1.0.1 security review. **All exposed production credentials must be rotated BEFORE this release is deployed.**

### What This Release Fixes

- ❌ **Issue #1**: Hardcoded Qdrant API key in `src/qdrant/client.ts`
- ❌ **Issue #2**: Production Coolify token in `coolify-mcp.service`
- ❌ **Issue #3**: Production Coolify token in `claude-config.json`
- ❌ **Issue #4**: Production Coolify token in `claude-desktop-config.json`
- ❌ **Issue #5**: Production Coolify tokens in `n8n-examples/*.json` (3 files)
- ❌ **Issue #6**: Hardcoded Qdrant API key in `qdrant-docker.sh`

### Security Impact

**Before v1.0.2**: Security Rating D+ (Critical credential exposure)
**After v1.0.2**: Security Rating A- (Production ready)

---

## Release Objectives

### Primary Objectives

1. **Remove ALL hardcoded production credentials from codebase**
2. **Require environment variables for ALL sensitive configuration**
3. **Clean git history to remove exposed credentials from all commits**
4. **Create template files with placeholders for user configuration**
5. **Add .gitignore entries to prevent future credential exposure**

### Secondary Objectives

6. **Add pre-commit hooks to prevent credential commits**
7. **Add security documentation for credential management**
8. **Update README with security best practices**
9. **Create verification tools for credential scanning**

---

## Pre-Release Requirements

### 1. Credential Rotation (CRITICAL - Must complete FIRST)

⚠️ **DO NOT SKIP THIS STEP** ⚠️

All exposed credentials MUST be rotated before deploying v1.0.2:

#### Qdrant API Key Rotation

```bash
# 1. Login to Qdrant console
open https://qdrant.theprofitplatform.com.au

# 2. Generate new API key
# - Settings > API Keys > Generate New Key
# - Copy new key: QDRANT_NEW_KEY

# 3. Test new key
export QDRANT_NEW_KEY="your-new-key-here"
curl -H "api-key: $QDRANT_NEW_KEY" \
  https://qdrant.theprofitplatform.com.au:443/collections

# 4. Update production .env
ssh production
sudo nano /opt/coolify-mcp/.env
# Update: QDRANT_API_KEY=new-key-here
sudo systemctl restart coolify-mcp

# 5. Verify service starts successfully
sudo systemctl status coolify-mcp
sudo journalctl -u coolify-mcp -n 50

# 6. Revoke old key in Qdrant console
# - Settings > API Keys > Revoke old key
```

**Estimated Time**: 30 minutes

#### Coolify API Token Rotation

```bash
# 1. Login to Coolify dashboard
open https://coolify.theprofitplatform.com.au

# 2. Generate new token
# - Settings > API > Create New Token
# - Permissions: Full access
# - Copy new token: COOLIFY_NEW_TOKEN

# 3. Test new token
export COOLIFY_NEW_TOKEN="your-new-token-here"
curl -H "Authorization: Bearer $COOLIFY_NEW_TOKEN" \
  https://coolify.theprofitplatform.com.au/api/v1/version

# 4. Update production .env
ssh production
sudo nano /opt/coolify-mcp/.env
# Update: COOLIFY_TOKEN=new-token-here
sudo systemctl restart coolify-mcp

# 5. Verify service functionality
# Test a few MCP tools to confirm

# 6. Revoke old token in Coolify dashboard
# - Settings > API > Revoke old token
```

**Estimated Time**: 30 minutes

**Total Credential Rotation Time**: 1 hour

### 2. Team Coordination (REQUIRED for git history cleanup)

```bash
# Send notification to all team members:

Subject: [ACTION REQUIRED] Git History Rewrite - Coolify MCP Server

Team,

We will be performing a git history rewrite to remove exposed credentials
from the Coolify MCP Server repository.

Timeline:
- Date: [TBD]
- Duration: 2-3 hours
- Downtime: None (only affects git repository)

What you need to do:
1. Commit and push all your work BEFORE the scheduled time
2. After history rewrite, you MUST re-clone the repository:

   cd ~/projects/coolify
   mv coolify-mcp coolify-mcp-old-backup
   git clone [repository-url] coolify-mcp
   cd coolify-mcp
   npm install

3. Copy your local .env file from backup:

   cp ../coolify-mcp-old-backup/.env .env

4. DO NOT try to pull/merge - you must re-clone

Questions? Reply to this email.

Thanks,
Security Team
```

**Estimated Time**: 2-3 hours (includes coordination)

### 3. Backup Current Repository

```bash
# Create full repository backup
cd ~/projects/coolify
git clone --mirror coolify-mcp coolify-mcp-backup-$(date +%Y%m%d)

# Verify backup
cd coolify-mcp-backup-$(date +%Y%m%d)
git log --oneline | head -20
cd ..

# Create production .env backup
ssh production
sudo cp /opt/coolify-mcp/.env /opt/coolify-mcp/.env.backup.$(date +%Y%m%d)
```

**Estimated Time**: 15 minutes

---

## Release Process

### Phase 1: Code Remediation (Automated)

**Duration**: 10 minutes

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Run automated fix script
./scripts/fix-hardcoded-credentials.sh

# 3. Review changes
git diff

# 4. Verify no credentials remain
./scripts/verify-no-credentials.sh

# 5. Run build
npm run build

# 6. Run tests
npm test

# 7. Remove tracked files from git
git rm --cached coolify-mcp.service
git rm --cached claude-config.json
git rm --cached claude-desktop-config.json

# 8. Commit changes
git add .
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
```

**Verification Checklist**:
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Verification script passes: `./scripts/verify-no-credentials.sh`
- [ ] No credentials in working directory
- [ ] .gitignore includes sensitive files
- [ ] Sensitive files not tracked in git

### Phase 2: Git History Cleanup (Destructive Operation)

**Duration**: 1-2 hours
**⚠️ WARNING**: This rewrites git history. Team must re-clone repository.

```bash
# 1. Create credentials replacement file
cat > /tmp/credentials.txt <<'EOF'
***REMOVED***==>***REMOVED-QDRANT-API-KEY***
***REMOVED***==>***REMOVED-COOLIFY-TOKEN***
EOF

# 2. Download BFG Repo-Cleaner
cd ~/projects/coolify/coolify-mcp
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# 3. Run BFG to replace credentials in ALL commits
java -jar bfg-1.14.0.jar --replace-text /tmp/credentials.txt

# 4. Clean up git internals
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Verify credentials removed from history
git log --all -S "***REMOVED***" --pretty=format:"%H"
# Should return EMPTY (no results)

git log --all -S "***REMOVED***" --pretty=format:"%H"
# Should return EMPTY (no results)

# 6. Check repository size (should be smaller)
du -sh .git

# 7. Force push (COORDINATE WITH TEAM FIRST!)
git push origin --force --all
git push origin --force --tags

# 8. Notify team to re-clone
# Send email with re-clone instructions
```

**Verification Checklist**:
- [ ] BFG execution completed successfully
- [ ] No credentials found in history (verified with git log)
- [ ] Repository size reduced
- [ ] Force push completed
- [ ] Team notified to re-clone

### Phase 3: Update Documentation

**Duration**: 30 minutes

```bash
# 1. Update version in package.json
npm version patch -m "chore: bump version to 1.0.2 for security release"

# 2. Update README.md
# - Update version badge to 1.0.2
# - Update security rating badge to A-
# - Add security changelog entry

# 3. Create CHANGELOG entry
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
- Service file must be created from .example template

### Added
- coolify-mcp.service.example - systemd service template
- claude-config.example.json - Claude config template
- claude-desktop-config.example.json - Claude Desktop config template
- credentials.env.example - credentials template
- n8n-examples/SECURITY-WARNING.md - security guide for examples
- scripts/fix-hardcoded-credentials.sh - automated fix script
- scripts/verify-no-credentials.sh - verification script
- SECURITY-REMEDIATION-PLAN.md - complete remediation guide
- CRITICAL-REVIEW-FINDINGS.md - security review report
- QUICK-FIX-GUIDE.md - quick reference guide

### Changed
- .gitignore - added sensitive config files
- src/qdrant/client.ts - require environment variable
- qdrant-docker.sh - require explicit API key
- n8n-examples/*.json - replaced credentials with placeholders

### Security Impact
- BEFORE: Security Rating D+ (Critical credential exposure)
- AFTER: Security Rating A- (Production ready)
- CVSS Score: Fixed 6 critical vulnerabilities (CVSS 9.1)

See SECURITY-REMEDIATION-PLAN.md for complete details.
EOF

# 4. Commit documentation updates
git add package.json README.md CHANGELOG.md
git commit -m "docs: update documentation for v1.0.2 security release"
```

### Phase 4: Create GitHub Release

```bash
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

# 3. Create GitHub release
gh release create v1.0.2 \
  --title "v1.0.2 - Critical Security Patch" \
  --notes-file RELEASE-NOTES-v1.0.2.md \
  --target main

# Or create release manually in GitHub UI:
# - Go to Releases > Create new release
# - Tag: v1.0.2
# - Title: v1.0.2 - Critical Security Patch
# - Description: [Use RELEASE-NOTES-v1.0.2.md content]
```

---

## Testing Procedures

### Pre-Release Testing

**1. Build Verification**

```bash
# Clean build
rm -rf build node_modules
npm install
npm run build

# Verify build output
ls -lah build/
# Should show compiled JavaScript files
```

**Expected Result**: Build completes without errors

**2. Security Test Suite**

```bash
# Run all tests
npm test

# Run security tests specifically
npm test tests/security/injection-prevention.test.ts
```

**Expected Results**:
- ✅ SQL Injection Prevention: 7/7 tests passing
- ✅ Command Injection Prevention: 8/8 tests passing
- ✅ Total: 15/15 security tests passing

**3. Credential Verification**

```bash
# Run verification script
./scripts/verify-no-credentials.sh

# Run with git history check
./scripts/verify-no-credentials.sh --check-history
```

**Expected Result**: "ALL CHECKS PASSED - No credentials found!"

**4. Environment Variable Requirements**

```bash
# Test that code requires environment variables
export QDRANT_API_KEY=""
npm run build && node build/index.js
```

**Expected Result**: Error thrown: "QDRANT_API_KEY environment variable is required"

```bash
# Test with valid environment variables
export QDRANT_API_KEY="test-key"
export COOLIFY_TOKEN="test-token"
export COOLIFY_BASE_URL="https://test.example.com"
npm run build && node build/index.js
```

**Expected Result**: Server starts successfully

**5. Configuration File Templates**

```bash
# Verify .example files exist
ls -lah coolify-mcp.service.example
ls -lah claude-config.example.json
ls -lah claude-desktop-config.example.json
ls -lah credentials.env.example

# Verify no real credentials in .example files
grep -r "***REMOVED***" *.example* || echo "✅ No credentials"
grep -r "***REMOVED***" *.example* || echo "✅ No credentials"
```

**Expected Result**: All .example files present with placeholders only

### Post-Release Testing

**1. Production Deployment Test**

```bash
# SSH to production server
ssh production

# Navigate to deployment directory
cd /opt/coolify-mcp

# Pull latest release
git fetch --all --tags
git checkout v1.0.2

# Install dependencies
npm install

# Build
npm run build

# Verify .env file (should already exist with rotated credentials)
cat .env | grep QDRANT_API_KEY  # Should show NEW key
cat .env | grep COOLIFY_TOKEN   # Should show NEW token

# Restart service
sudo systemctl restart coolify-mcp

# Check status
sudo systemctl status coolify-mcp

# Check logs
sudo journalctl -u coolify-mcp -n 100 --no-pager
```

**Expected Results**:
- ✅ Service starts successfully
- ✅ No credential-related errors in logs
- ✅ MCP server accepts connections

**2. Integration Testing**

```bash
# Test MCP tools functionality
# Use Claude Desktop or MCP client to test:

# Test 1: List applications
# Should return applications list

# Test 2: Get deployment logs
# Should return deployment logs

# Test 3: Server command execution
# Should execute safe commands, block dangerous ones

# Test 4: Environment variable operations
# Should read/write env vars successfully
```

**Expected Result**: All core MCP tools function correctly with new credentials

**3. Security Verification**

```bash
# Verify no credentials in codebase
cd /opt/coolify-mcp
./scripts/verify-no-credentials.sh

# Verify no credentials in git history
./scripts/verify-no-credentials.sh --check-history
```

**Expected Result**: All checks pass, no credentials found

**4. Performance Testing**

```bash
# Monitor resource usage
top -p $(pgrep -f coolify-mcp)

# Check memory usage
ps aux | grep coolify-mcp

# Monitor for memory leaks (run for 1 hour)
watch -n 60 'ps aux | grep coolify-mcp'
```

**Expected Result**: Stable memory usage, no performance degradation

---

## Rollback Procedures

### Rollback Scenario 1: Build Failures

**If build fails after applying v1.0.2 code changes:**

```bash
# 1. Restore from backup
cd ~/projects/coolify
rm -rf coolify-mcp
cp -r coolify-mcp-backup-$(date +%Y%m%d) coolify-mcp
cd coolify-mcp

# 2. Rebuild
npm install
npm run build

# 3. Restart service
ssh production
sudo systemctl restart coolify-mcp
```

### Rollback Scenario 2: Service Startup Failures

**If service fails to start with new credentials:**

```bash
# 1. Check logs
sudo journalctl -u coolify-mcp -n 100 --no-pager

# 2. Verify .env file
cat /opt/coolify-mcp/.env

# 3. Restore old .env if needed
sudo cp /opt/coolify-mcp/.env.backup.$(date +%Y%m%d) /opt/coolify-mcp/.env

# 4. Restart service
sudo systemctl restart coolify-mcp

# 5. If still failing, checkout previous version
cd /opt/coolify-mcp
git checkout v1.0.1
npm install
npm run build
sudo systemctl restart coolify-mcp
```

### Rollback Scenario 3: Git History Cleanup Failures

**If BFG Repo-Cleaner fails or causes issues:**

```bash
# 1. Restore from mirror backup
cd ~/projects/coolify
rm -rf coolify-mcp
git clone coolify-mcp-backup-$(date +%Y%m%d) coolify-mcp

# 2. Force push to restore old history
cd coolify-mcp
git push origin --force --all
git push origin --force --tags

# 3. Notify team
# Send email: "Git history cleanup failed, repository restored to previous state"
```

### Rollback Scenario 4: Production Service Failure

**If production service fails after v1.0.2 deployment:**

```bash
# EMERGENCY ROLLBACK

# 1. SSH to production
ssh production

# 2. Navigate to deployment
cd /opt/coolify-mcp

# 3. Checkout previous stable version
git checkout v1.0.1

# 4. Install dependencies
npm install

# 5. Build
npm run build

# 6. Restart service
sudo systemctl restart coolify-mcp

# 7. Verify service is running
sudo systemctl status coolify-mcp

# 8. Monitor logs
sudo journalctl -u coolify-mcp -f
```

**Estimated Rollback Time**: 5-10 minutes

---

## Post-Release Verification

### Immediate Verification (0-1 hour after release)

**Checklist**:

- [ ] **Production service running**
  ```bash
  ssh production
  sudo systemctl status coolify-mcp
  ```

- [ ] **No errors in logs**
  ```bash
  sudo journalctl -u coolify-mcp -n 100 --no-pager | grep -i error
  ```

- [ ] **MCP tools functional**
  - Test in Claude Desktop
  - Verify tool list loads
  - Execute 3-5 sample tools

- [ ] **New credentials working**
  - Verify Qdrant connectivity
  - Verify Coolify API access

- [ ] **No credential errors**
  ```bash
  ./scripts/verify-no-credentials.sh
  ./scripts/verify-no-credentials.sh --check-history
  ```

- [ ] **Git history clean**
  ```bash
  git log --all -S "***REMOVED***" || echo "✅ Clean"
  git log --all -S "***REMOVED***" || echo "✅ Clean"
  ```

### 24-Hour Verification

**Checklist**:

- [ ] **Service stability**
  - No crashes or restarts
  - Memory usage stable
  - CPU usage normal

- [ ] **Monitoring alerts**
  - No security alerts triggered
  - No error alerts from Coolify
  - No uptime issues

- [ ] **User feedback**
  - Check for any user-reported issues
  - Verify MCP tools still working for all users

- [ ] **Credential rotation complete**
  - Old Qdrant key revoked
  - Old Coolify token revoked
  - No authentication errors

### 7-Day Verification

**Checklist**:

- [ ] **Long-term stability**
  - Service running continuously
  - No memory leaks detected
  - Performance metrics normal

- [ ] **Security scan results**
  - No credentials detected in scans
  - No new vulnerabilities reported
  - Git history clean across all branches

- [ ] **Team feedback**
  - All team members successfully re-cloned
  - No development workflow issues
  - Pre-commit hooks functioning

---

## Timeline and Milestones

### Full Release Timeline

| Phase | Task | Duration | Cumulative |
|-------|------|----------|------------|
| **Pre-Release** | | | |
| 1.1 | Rotate Qdrant API key | 30 min | 30 min |
| 1.2 | Rotate Coolify token | 30 min | 1 hour |
| 1.3 | Coordinate team for history rewrite | 15 min | 1h 15m |
| 1.4 | Create repository backup | 15 min | 1h 30m |
| **Release** | | | |
| 2.1 | Run automated fix script | 5 min | 1h 35m |
| 2.2 | Verify changes and run tests | 5 min | 1h 40m |
| 2.3 | Commit code changes | 2 min | 1h 42m |
| 2.4 | Run BFG Repo-Cleaner | 30 min | 2h 12m |
| 2.5 | Verify history cleanup | 10 min | 2h 22m |
| 2.6 | Force push cleaned repository | 5 min | 2h 27m |
| 2.7 | Update documentation | 15 min | 2h 42m |
| 2.8 | Create GitHub release | 5 min | 2h 47m |
| **Post-Release** | | | |
| 3.1 | Deploy to production | 10 min | 2h 57m |
| 3.2 | Verify production deployment | 15 min | 3h 12m |
| 3.3 | Monitor for issues | 30 min | 3h 42m |
| 3.4 | Team re-clone notification | 5 min | 3h 47m |

**Total Estimated Time**: 4 hours

### Critical Path

The following tasks are on the critical path and must be completed in order:

1. **Credential Rotation** (BLOCKING) - Must complete before ANY code changes
2. **Code Remediation** - Must complete before git history cleanup
3. **Git History Cleanup** - Must complete before team re-clones
4. **Force Push** - Must complete before production deployment

### Recommended Schedule

**Option 1: Single Day Release (Recommended)**

```
Day 1 (Release Day):
- 09:00 AM: Start credential rotation
- 10:00 AM: Credential rotation complete
- 10:05 AM: Run automated fix script
- 10:15 AM: Commit code changes
- 10:20 AM: Start BFG git history cleanup
- 11:00 AM: Git history cleanup complete
- 11:05 AM: Force push cleaned repository
- 11:10 AM: Update documentation and create release
- 11:30 AM: Deploy to production
- 12:00 PM: Notify team to re-clone
- 12:00 PM - 5:00 PM: Monitor and assist team
```

**Option 2: Phased Release (Conservative)**

```
Day 1:
- Rotate credentials (1 hour)
- Apply code fixes (15 minutes)
- Test thoroughly (2 hours)
- Commit and push code changes

Day 2:
- Coordinate team for history rewrite
- Run BFG git history cleanup (1 hour)
- Force push cleaned repository
- Create GitHub release

Day 3:
- Deploy to production
- Team re-clones
- Monitor for issues
```

---

## Success Criteria

### Release Success Criteria

The v1.0.2 release is considered successful when ALL of the following criteria are met:

#### Code Quality
- [x] All 6 hardcoded credential issues fixed
- [x] Build passes without errors
- [x] All 15 security tests passing
- [x] Verification script passes all checks
- [x] No credentials in working directory
- [x] No credentials in .example templates

#### Git Repository
- [ ] Credentials removed from git history (ALL commits)
- [ ] Force push completed successfully
- [ ] All branches updated
- [ ] All tags updated
- [ ] Repository size reduced

#### Configuration
- [ ] .gitignore includes all sensitive files
- [ ] Template files created (.example variants)
- [ ] credentials.env.example created
- [ ] Security warning added to n8n-examples

#### Credentials
- [ ] Old Qdrant API key revoked
- [ ] Old Coolify token revoked
- [ ] New credentials working in production
- [ ] No authentication errors

#### Production Deployment
- [ ] Service deployed to production
- [ ] Service running without errors
- [ ] All MCP tools functional
- [ ] Integration tests passing
- [ ] No performance degradation

#### Team Coordination
- [ ] Team notified of history rewrite
- [ ] All team members re-cloned repository
- [ ] No development workflow issues
- [ ] Pre-commit hooks installed

#### Documentation
- [ ] CHANGELOG.md updated
- [ ] README.md updated
- [ ] Version bumped to 1.0.2
- [ ] GitHub release created
- [ ] Security documentation complete

### Quality Gates

**Gate 1: Pre-Release Quality Gate**
- Must pass before starting release process
- Credentials rotated ✅
- Team coordinated ✅
- Backup created ✅

**Gate 2: Code Quality Gate**
- Must pass before git history cleanup
- Build passes ✅
- Tests pass ✅
- Verification script passes ✅

**Gate 3: Repository Quality Gate**
- Must pass before production deployment
- Git history clean ✅
- Force push successful ✅
- No credentials in any commit ✅

**Gate 4: Production Quality Gate**
- Must pass before release sign-off
- Production service running ✅
- MCP tools functional ✅
- No errors in logs ✅

---

## Risk Assessment and Mitigation

### High-Risk Items

**Risk 1: Git History Rewrite Breaks Team Workflows**

- **Probability**: Medium
- **Impact**: High (team productivity loss)
- **Mitigation**:
  - Send clear communication with step-by-step re-clone instructions
  - Provide support during re-clone process
  - Schedule during low-activity period
  - Create detailed rollback procedure
- **Contingency**: Restore from mirror backup and retry

**Risk 2: Credential Rotation Causes Service Disruption**

- **Probability**: Low
- **Impact**: High (production downtime)
- **Mitigation**:
  - Test new credentials before applying to production
  - Keep old credentials active during transition
  - Have rollback credentials ready
  - Monitor service closely during rotation
- **Contingency**: Rollback to old credentials immediately

**Risk 3: BFG Repo-Cleaner Corrupts Git History**

- **Probability**: Low
- **Impact**: Critical (repository corruption)
- **Mitigation**:
  - Create mirror backup before running BFG
  - Test BFG on backup first
  - Verify history integrity after cleanup
  - Document exact BFG commands used
- **Contingency**: Restore from mirror backup

**Risk 4: Production Deployment Fails with Environment Variable Issues**

- **Probability**: Low
- **Impact**: Medium (deployment rollback required)
- **Mitigation**:
  - Test environment variable requirements locally
  - Verify .env file exists on production
  - Document exact environment variable format
  - Test startup before full deployment
- **Contingency**: Rollback to v1.0.1

### Medium-Risk Items

**Risk 5: Team Members Don't Re-clone Properly**

- **Probability**: Medium
- **Impact**: Medium (individual productivity loss)
- **Mitigation**:
  - Provide clear re-clone instructions
  - Offer real-time support during re-clone
  - Create FAQ document
- **Contingency**: Individual support sessions

**Risk 6: CI/CD Pipeline Breaks with New Environment Variable Requirements**

- **Probability**: Medium
- **Impact**: Low (CI/CD temporary failure)
- **Mitigation**:
  - Update CI/CD secrets before deployment
  - Test CI/CD pipeline with new requirements
  - Document CI/CD environment variable setup
- **Contingency**: Update CI/CD configuration and retry

### Low-Risk Items

**Risk 7: Documentation Out of Sync**

- **Probability**: Low
- **Impact**: Low (documentation update needed)
- **Mitigation**: Review all documentation during release
- **Contingency**: Update documentation post-release

**Risk 8: Performance Regression**

- **Probability**: Very Low
- **Impact**: Low (no code logic changes)
- **Mitigation**: Monitor performance metrics
- **Contingency**: Investigate and optimize if needed

---

## Communication Plan

### Pre-Release Communication

**Email 1: 48 Hours Before Release**

```
Subject: [SCHEDULED] Coolify MCP Server v1.0.2 Security Release

Team,

We will be releasing v1.0.2 (critical security patch) on [DATE] at [TIME].

What's changing:
- Removal of hardcoded credentials from codebase
- Git history rewrite to remove exposed credentials
- New environment variable requirements

Impact:
- Git repository history will be rewritten
- All team members MUST re-clone the repository
- No production downtime expected

Timeline:
- [DATE] [TIME]: Start release process
- [DATE] [TIME+3h]: Release complete
- [DATE] [TIME+3h]: Team re-clone window opens

Action required:
1. Commit and push all your work BEFORE [DATE] [TIME]
2. After release, you will receive re-clone instructions
3. Follow re-clone instructions carefully

More details: [Link to release plan]

Questions? Reply to this email.
```

**Email 2: 24 Hours Before Release**

```
Subject: [REMINDER] Coolify MCP Server v1.0.2 Release Tomorrow

Team,

Reminder: v1.0.2 security release tomorrow at [TIME].

Final checklist:
- [ ] All your work committed and pushed
- [ ] No local uncommitted changes
- [ ] Ready to re-clone repository after release

Timeline tomorrow:
- [TIME]: Release starts
- [TIME+3h]: Release complete, re-clone instructions sent
- [TIME+3h to TIME+5h]: Team support available

See you tomorrow!
```

### During-Release Communication

**Slack/Teams Updates** (during release process):

```
[TIME] 🚀 v1.0.2 release started
[TIME+1h] ✅ Credentials rotated
[TIME+1.5h] ✅ Code fixes applied
[TIME+2h] ⏳ Git history cleanup in progress...
[TIME+2.5h] ✅ Git history cleaned
[TIME+2.7h] ✅ Production deployed
[TIME+3h] ✅ Release complete - re-clone instructions sent
```

### Post-Release Communication

**Email 3: Re-clone Instructions**

```
Subject: [ACTION REQUIRED] Re-clone Coolify MCP Server Repository

Team,

v1.0.2 has been successfully released! 🎉

The git history has been rewritten. You MUST re-clone the repository.

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

Common issues:
- If git pull/merge fails: DO NOT FORCE - you must re-clone
- If .env file is missing: Copy from coolify-mcp-old/.env
- If build fails: Run npm install again

Need help? Reach out in #coolify-mcp-support channel.

Thank you!
```

**Email 4: 24-Hour Post-Release Update**

```
Subject: Coolify MCP Server v1.0.2 - 24 Hour Update

Team,

v1.0.2 has been running in production for 24 hours. Status update:

✅ Production service: Running smoothly
✅ No errors reported
✅ All MCP tools functional
✅ Credentials secure

Team re-clone status:
- [X/Y] team members completed re-clone
- [Pending]: [Names] - please complete today

If you haven't re-cloned yet, please do so today.

Next steps:
- Continue monitoring for 7 days
- Schedule pre-commit hook installation next week

Questions? Reply to this email.
```

---

## Preventive Measures (Post-Release)

### 1. Pre-commit Hooks Installation

**Schedule**: Week 1 after v1.0.2 release

```bash
# Install git-secrets
brew install git-secrets  # macOS
# OR
sudo apt-get install git-secrets  # Ubuntu

# Initialize git-secrets
cd ~/projects/coolify/coolify-mcp
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'QEoT[A-Za-z0-9]{28}'  # Qdrant key pattern
git secrets --add 'vzn[A-Za-z0-9]{40}'   # Coolify token pattern

# Test
echo "QDRANT_API_KEY=***REMOVED***" > test.txt
git add test.txt
# Should reject commit
```

**Alternative: Husky + custom hook**

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Create pre-commit hook
cat > .husky/pre-commit <<'EOF'
#!/bin/sh

# Scan for credentials
if git diff --cached | grep -E "(QEoT|vznm)[A-Za-z0-9]{28,}"; then
  echo "❌ ERROR: Possible credential detected in commit!"
  echo "Please remove credentials before committing."
  exit 1
fi

# Scan for sensitive files
if git diff --cached --name-only | grep -E "^(\.env|credentials\.env|.*\.service)$"; then
  echo "❌ ERROR: Sensitive file in commit!"
  echo "Files like .env should not be committed."
  exit 1
fi

echo "✅ Pre-commit checks passed"
EOF

chmod +x .husky/pre-commit
```

### 2. CI/CD Secret Scanning

**GitHub Actions Workflow** (`.github/workflows/security-scan.yml`):

```yaml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for scanning

      - name: TruffleHog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD

      - name: GitLeaks Scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Custom Credential Scan
        run: |
          if grep -r "QEoT" --exclude-dir=node_modules --exclude-dir=.git .; then
            echo "❌ Qdrant credential pattern found!"
            exit 1
          fi
          if grep -r "vznm" --exclude-dir=node_modules --exclude-dir=.git .; then
            echo "❌ Coolify credential pattern found!"
            exit 1
          fi
          echo "✅ No credentials detected"
```

### 3. Quarterly Security Audits

**Schedule**: Every 3 months

```bash
# Automated quarterly scan script
cat > scripts/quarterly-security-audit.sh <<'EOF'
#!/bin/bash

echo "🔍 Quarterly Security Audit - $(date)"

# Scan for credentials
echo "1. Scanning for hardcoded credentials..."
./scripts/verify-no-credentials.sh --check-history

# Check .gitignore
echo "2. Verifying .gitignore coverage..."
if ! grep -q "^.env$" .gitignore; then
  echo "❌ .env missing from .gitignore"
fi

# Run security tests
echo "3. Running security test suite..."
npm test tests/security/

# Check dependencies for vulnerabilities
echo "4. Scanning dependencies..."
npm audit

# Generate report
echo "5. Generating audit report..."
cat > SECURITY-AUDIT-$(date +%Y-%m-%d).md <<REPORT
# Security Audit Report - $(date +%Y-%m-%d)

## Credential Scan
$(./scripts/verify-no-credentials.sh --check-history 2>&1)

## Security Tests
$(npm test tests/security/ 2>&1)

## Dependency Audit
$(npm audit 2>&1)

## Recommendations
- Review and rotate credentials if needed
- Update dependencies with vulnerabilities
- Review access control policies
REPORT

echo "✅ Audit complete: SECURITY-AUDIT-$(date +%Y-%m-%d).md"
EOF

chmod +x scripts/quarterly-security-audit.sh
```

### 4. Security Training

**Schedule**: Week 2 after v1.0.2 release

**Training Topics**:
- Why hardcoded credentials are dangerous
- How to use environment variables
- How to use .example templates
- What not to commit to git
- How pre-commit hooks work
- What to do if you accidentally commit credentials

**Materials**:
- Create `docs/SECURITY-TRAINING.md`
- Record training video
- Create credential management checklist

---

## Monitoring and Alerts

### Post-Release Monitoring

**Metrics to Monitor**:

```bash
# Service uptime
systemctl status coolify-mcp

# Error rate
journalctl -u coolify-mcp --since "1 hour ago" | grep -i error | wc -l

# Memory usage
ps aux | grep coolify-mcp | awk '{print $6}'

# Response time (sample MCP tool calls)
time curl -X POST [mcp-endpoint]

# Log volume
journalctl -u coolify-mcp --since "1 hour ago" | wc -l
```

**Alerting Rules**:

```yaml
# Example: Prometheus alerting rules

groups:
  - name: coolify_mcp_alerts
    rules:
      - alert: ServiceDown
        expr: up{job="coolify-mcp"} == 0
        for: 5m
        annotations:
          summary: "Coolify MCP service is down"

      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 10
        annotations:
          summary: "High error rate detected"

      - alert: CredentialError
        expr: log_match{pattern=".*credential.*", level="error"} > 0
        annotations:
          summary: "Credential-related error detected"

      - alert: HighMemoryUsage
        expr: memory_usage_bytes > 1e9
        annotations:
          summary: "Memory usage above 1GB"
```

---

## Release Checklist

Use this checklist during the release process:

### Pre-Release Checklist

- [ ] Credentials rotated (Qdrant + Coolify)
- [ ] Old credentials revoked
- [ ] New credentials tested
- [ ] Team coordinated for history rewrite
- [ ] Repository backup created
- [ ] Local testing completed
- [ ] Security tests passing
- [ ] Build passing
- [ ] Documentation reviewed

### Release Execution Checklist

- [ ] Automated fix script executed
- [ ] Changes reviewed and verified
- [ ] Tests passing
- [ ] Sensitive files removed from tracking
- [ ] Code changes committed
- [ ] BFG Repo-Cleaner executed
- [ ] Git history verified clean
- [ ] Force push completed
- [ ] Documentation updated
- [ ] GitHub release created

### Post-Release Checklist

- [ ] Production deployment successful
- [ ] Service running without errors
- [ ] MCP tools functional
- [ ] Integration tests passing
- [ ] Team notified to re-clone
- [ ] Re-clone instructions sent
- [ ] Monitoring alerts configured
- [ ] 24-hour stability verified
- [ ] Team re-clone status tracked
- [ ] Post-release retrospective scheduled

### Long-Term Checklist

- [ ] Pre-commit hooks installed (Week 1)
- [ ] CI/CD secret scanning added (Week 1)
- [ ] Security training completed (Week 2)
- [ ] 7-day stability verified
- [ ] 30-day stability verified
- [ ] Quarterly security audit scheduled
- [ ] Lessons learned documented
- [ ] Release process improvements identified

---

## Contact and Escalation

### Release Team

**Release Manager**: [Name]
- Responsibilities: Overall release coordination, timeline management
- Contact: [Email/Slack]

**Security Lead**: [Name]
- Responsibilities: Credential rotation, security verification
- Contact: [Email/Slack]

**Infrastructure Lead**: [Name]
- Responsibilities: Production deployment, monitoring
- Contact: [Email/Slack]

**Development Lead**: [Name]
- Responsibilities: Code changes, testing, rollback
- Contact: [Email/Slack]

### Escalation Path

**Level 1: Release Team** (0-30 minutes)
- For standard release issues
- Contact release manager first

**Level 2: Engineering Manager** (30-60 minutes)
- If release is blocked or at risk
- If rollback decision needed

**Level 3: CTO/VP Engineering** (1+ hour)
- If production impact or data breach
- If major security incident

### Emergency Contacts

**Production Issues**:
- On-call: [Phone]
- Slack: #incidents
- Email: incidents@company.com

**Security Issues**:
- Security team: security@company.com
- PagerDuty: [Link]
- Slack: #security-incidents

---

## Appendices

### Appendix A: Environment Variable Reference

```bash
# Required Environment Variables (v1.0.2+)
COOLIFY_BASE_URL=https://coolify.theprofitplatform.com.au
COOLIFY_TOKEN=your-coolify-api-token-here
QDRANT_HOST=qdrant.theprofitplatform.com.au
QDRANT_PORT=443
QDRANT_API_KEY=your-qdrant-api-key-here

# Optional Environment Variables
N8N_URL=https://n8n.theprofitplatform.com.au
COOLIFY_API_TIMEOUT=60000
COOLIFY_API_MAX_RETRIES=5
COOLIFY_API_RETRY_DELAY=2000
```

### Appendix B: File Template Reference

**coolify-mcp.service.example**:
```ini
[Unit]
Description=Coolify MCP Server
After=network.target

[Service]
Type=simple
User=coolify-mcp
WorkingDirectory=/opt/coolify-mcp
EnvironmentFile=/etc/coolify-mcp/credentials.env
ExecStart=/usr/bin/node /opt/coolify-mcp/build/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**credentials.env.example**:
```bash
# Coolify Configuration
COOLIFY_BASE_URL=https://your-coolify-instance.com
COOLIFY_TOKEN=your-coolify-api-token-here

# Qdrant Configuration
QDRANT_HOST=your-qdrant-host.com
QDRANT_PORT=443
QDRANT_API_KEY=your-qdrant-api-key-here
```

### Appendix C: BFG Command Reference

```bash
# Basic usage
java -jar bfg.jar --replace-text passwords.txt

# Replace specific strings
java -jar bfg.jar --replace-text /tmp/credentials.txt

# Delete files
java -jar bfg.jar --delete-files credentials.env

# Strip blobs larger than 100MB
java -jar bfg.jar --strip-blobs-bigger-than 100M

# Clean up after BFG
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Appendix D: Git Commands Reference

```bash
# Search for string in history
git log --all -S "search-string"

# Search for string with context
git log --all -p -S "search-string"

# Search in specific file
git log --all -p -- path/to/file

# Force push (DANGEROUS)
git push origin --force --all
git push origin --force --tags

# Verify repository integrity
git fsck --full
```

---

## Conclusion

This release plan provides a comprehensive roadmap for deploying v1.0.2, addressing all 6 critical credential exposure vulnerabilities discovered in the post-v1.0.1 security review.

**Key Success Factors**:
1. **Credential rotation FIRST** - Must complete before any code changes
2. **Team coordination** - Clear communication for git history rewrite
3. **Automated tooling** - Use scripts for consistent execution
4. **Thorough testing** - Verify at each stage
5. **Rollback readiness** - Be prepared to revert if needed

**Security Impact**:
- **Before v1.0.2**: Rating D+ (6 critical vulnerabilities)
- **After v1.0.2**: Rating A- (Production ready)
- **Risk Reduction**: CVSS 9.1 critical vulnerabilities eliminated

**Timeline**: 4 hours for full release (including git history cleanup)

**Next Steps**: Review this plan, coordinate team, schedule release date, and execute.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-23
**Release Plan Status**: READY FOR EXECUTION

---

*This release plan was created as part of the comprehensive security remediation effort following the discovery of hardcoded production credentials in the Coolify MCP Server codebase. See CRITICAL-REVIEW-FINDINGS.md and SECURITY-REMEDIATION-PLAN.md for complete context.*
