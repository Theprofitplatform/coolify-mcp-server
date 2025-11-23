# 🔴 CRITICAL REVIEW FINDINGS - Coolify MCP Server

**Review Date**: November 23, 2025
**Reviewer**: Claude Code Security Review
**Scope**: Complete codebase review post-v1.0.1
**Status**: 🚨 **CRITICAL ISSUES FOUND**

---

## 🚨 EXECUTIVE SUMMARY

### Overall Assessment: **CRITICAL SECURITY ISSUES REMAIN**

While the v1.0.1 security fixes addressed SQL injection, command injection, and sanitized `.env.example`, a **comprehensive review has uncovered ADDITIONAL CRITICAL credential exposure issues** that were NOT addressed in the security fixes.

### Critical Findings: **6 NEW ISSUES**
### Severity: **CRITICAL (CVSS 9.1+)**
### Immediate Action Required: **YES**

**RECOMMENDATION**: **DO NOT DEPLOY TO PRODUCTION** until ALL exposed credentials are removed from git-tracked files.

---

## 🔴 CRITICAL SECURITY ISSUE #1: Hardcoded API Key in Source Code

### File: `src/qdrant/client.ts`

**Severity**: 🔴 **CRITICAL**
**CVSS Score**: 9.1 (Critical)
**CWE**: CWE-798 (Use of Hard-coded Credentials)

**Vulnerable Code** (Line 17):
```typescript
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '***REMOVED***';
```

**Issue**:
- Real production Qdrant API key hardcoded as fallback
- File is tracked in git (committed to repository)
- Key provides full access to production vector database
- Even worse than .env.example because it's in SOURCE CODE

**Impact**:
- ✗ **Data Breach**: Complete access to Qdrant vector database
- ✗ **Code Repository**: Exposed in all commits, branches, forks
- ✗ **Search Engine Indexing**: May be indexed if repo is public
- ✗ **Shared with All Developers**: Anyone with repo access has key

**Fix Required**:
```typescript
// SECURE - No hardcoded fallback
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

if (!QDRANT_API_KEY) {
  throw new Error('QDRANT_API_KEY environment variable is required');
}
```

---

## 🔴 CRITICAL SECURITY ISSUE #2: Production Credentials in Service Files

### Files:
- `coolify-mcp.service`
- `claude-config.json`
- `claude-desktop-config.json`

**Severity**: 🔴 **CRITICAL**
**CVSS Score**: 9.1 (Critical)
**CWE**: CWE-798 (Use of Hard-coded Credentials)

**Vulnerable Code** (coolify-mcp.service):
```ini
Environment="COOLIFY_TOKEN=***REMOVED***"
```

**Vulnerable Code** (claude-config.json, claude-desktop-config.json):
```json
{
  "mcpServers": {
    "coolify": {
      "env": {
        "COOLIFY_TOKEN": "***REMOVED***"
      }
    }
  }
}
```

**Issue**:
- Real production Coolify API token in configuration files
- All files tracked in git
- Token provides full administrative access to Coolify
- Visible in commit history

**Impact**:
- ✗ **Full Coolify Access**: Complete control of all deployments
- ✗ **Infrastructure Compromise**: Can deploy/delete any application
- ✗ **Data Access**: Can access all environment variables, secrets
- ✗ **Credential Theft**: Can extract other credentials from Coolify

**Fix Required**:
```ini
# coolify-mcp.service
Environment="COOLIFY_TOKEN=%i"  # Use systemd instance variable
# Or read from /etc/coolify-mcp/credentials

# claude-config.json
{
  "mcpServers": {
    "coolify": {
      "env": {
        "COOLIFY_TOKEN": "${COOLIFY_TOKEN}"  # Reference from environment
      }
    }
  }
}
```

---

## 🔴 CRITICAL SECURITY ISSUE #3: Credentials in Example Files

### Files:
- `n8n-examples/deploy-webhook.json`
- `n8n-examples/github-to-coolify.json`
- `n8n-examples/health-monitor.json`

**Severity**: 🔴 **CRITICAL**
**CVSS Score**: 9.1 (Critical)
**CWE**: CWE-798 (Use of Hard-coded Credentials)

**Vulnerable Code** (Multiple files):
```json
{
  "value": "Bearer ***REMOVED***"
}
```

**Issue**:
- Production API tokens in "example" N8N workflow files
- Files tracked in git as examples for users
- Users may copy these examples with real credentials

**Impact**:
- ✗ **Example Files**: Users copy production credentials
- ✗ **Workflow Exposure**: N8N workflows may be shared publicly
- ✗ **Documentation Risk**: Examples used in tutorials with real keys

**Fix Required**:
```json
{
  "value": "Bearer YOUR_COOLIFY_API_TOKEN_HERE"
}
```

**Add Warning**:
```json
{
  "notes": "⚠️ SECURITY WARNING: Replace YOUR_COOLIFY_API_TOKEN_HERE with your actual token. NEVER commit real credentials to git!"
}
```

---

## 🔴 CRITICAL SECURITY ISSUE #4: Credentials in Shell Scripts

### File: `qdrant-docker.sh`

**Severity**: 🔴 **CRITICAL**
**CVSS Score**: 9.1 (Critical)
**CWE**: CWE-798 (Use of Hard-coded Credentials)

**Vulnerable Code** (Line 24):
```bash
-e QDRANT_API_KEY="${QDRANT_API_KEY:-***REMOVED***}" \
```

**Issue**:
- Real Qdrant API key as default fallback
- File tracked in git
- Script may be executed without setting environment variable

**Impact**:
- ✗ **Script Execution**: Runs with production key by default
- ✗ **Container Deployment**: Production key in container environment
- ✗ **Accidental Use**: Users may run script without realizing

**Fix Required**:
```bash
# No default - require explicit environment variable
if [ -z "$QDRANT_API_KEY" ]; then
  echo "ERROR: QDRANT_API_KEY environment variable is required"
  exit 1
fi

-e QDRANT_API_KEY="$QDRANT_API_KEY" \
```

---

## 🔴 CRITICAL SECURITY ISSUE #5: Git History Contains Credentials

**Severity**: 🔴 **CRITICAL**
**CVSS Score**: 9.1 (Critical)
**CWE**: CWE-312 (Cleartext Storage of Sensitive Information)

**Issue**:
All the above files are in git history, meaning credentials are exposed in:
- Current commit
- All previous commits
- All branches
- All tags
- All forks (if repo is forked)
- GitHub/GitLab search (if public)

**Impact**:
- ✗ **Permanent Record**: Even if files are fixed now, history remains
- ✗ **Search Engines**: May be indexed by search engines
- ✗ **Credential Scanners**: Detected by automated tools
- ✗ **Fork Network**: Exposed in all forks of repository

**Fix Required**:
1. **Immediate**: Rotate ALL exposed credentials
2. **Clean History**: Use BFG Repo-Cleaner or git-filter-repo
3. **Force Push**: Rewrite history (coordinate with team!)
4. **Verify**: Scan history to confirm removal

**Commands**:
```bash
# Option 1: BFG Repo-Cleaner (recommended)
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Option 2: git-filter-repo
git filter-repo --path src/qdrant/client.ts --invert-paths
git filter-repo --path coolify-mcp.service --invert-paths
# ... repeat for all files

# Force push (DANGEROUS - coordinate with team!)
git push origin --force --all
git push origin --force --tags
```

---

## 🔴 CRITICAL SECURITY ISSUE #6: .env File Exists with Production Credentials

**Severity**: 🔴 **CRITICAL**
**CVSS Score**: 9.1 (Critical)
**CWE**: CWE-312 (Cleartext Storage of Sensitive Information)

**Issue**:
While `.env` is in `.gitignore` (good!), the file still exists with production credentials:
```env
COOLIFY_TOKEN=***REMOVED***
QDRANT_API_KEY=***REMOVED***
```

**Risks**:
- ✗ **Accidental Commit**: Easy to accidentally remove from .gitignore
- ✗ **Backup Exposure**: File may be in backups or snapshots
- ✗ **File Sharing**: May be shared via other means (zip, copy, etc.)
- ✗ **Development Risk**: Developers may use production credentials locally

**Best Practice**:
```bash
# Delete production .env from repository
rm .env

# Create .env.local for development
cat > .env.local <<EOF
COOLIFY_BASE_URL=https://localhost:8000  # Local Coolify
COOLIFY_TOKEN=dev-token-here
QDRANT_API_KEY=dev-key-here
EOF

# Update .gitignore
cat >> .gitignore <<EOF
.env
.env.local
.env.production
.env.*.local
EOF
```

---

## 🟡 MEDIUM SEVERITY ISSUES

### 1. Missing .gitignore Entries

**Files Missing from .gitignore**:
- `coolify-mcp.service` - Should use template with placeholders
- `claude-config.json` - Should use .example variant
- `claude-desktop-config.json` - Should use .example variant

**Recommendation**:
```bash
# Add to .gitignore
coolify-mcp.service
claude-config.json
claude-desktop-config.json

# Create template versions
mv coolify-mcp.service coolify-mcp.service.example
mv claude-config.json claude-config.example.json
mv claude-desktop-config.json claude-desktop-config.example.json

# Replace credentials with placeholders in .example files
```

### 2. Test File Contains Real Credential Check

**File**: `tests/auto-deploy/test-setup-script.sh`

**Issue** (Line check):
```bash
if grep -q "***REMOVED***" "$SETUP_SCRIPT"; then
```

**Fix**:
```bash
# Use regex pattern instead of actual credential
if grep -q "COOLIFY_TOKEN=.{40,}" "$SETUP_SCRIPT"; then
```

---

## ✅ POSITIVE FINDINGS

### What Was Done Well:

1. ✅ **SQL Injection Fixes**: Properly implemented
   - Zod validation with regex
   - SQL string escaping
   - Defensive validation

2. ✅ **Command Injection Protection**: Comprehensive
   - Shell metacharacter blocking
   - Dangerous command blacklist
   - Path traversal prevention

3. ✅ **.env.example**: Properly sanitized
   - All credentials replaced with placeholders
   - Good example for users

4. ✅ **Security Tests**: Excellent coverage
   - 15/15 tests passing
   - SQL injection scenarios
   - Command injection scenarios
   - Edge cases covered

5. ✅ **Documentation**: Comprehensive
   - 9,000+ lines of documentation
   - Clear security warnings
   - Detailed procedures

6. ✅ **.gitignore**: Includes .env
   - Production .env file is ignored
   - Won't be committed accidentally

---

## 📊 SECURITY RATING REASSESSMENT

### Before v1.0.1:
- **Rating**: C+ (NEEDS IMPROVEMENT)
- **Issues**: 5 critical vulnerabilities

### After v1.0.1 (Initial Assessment):
- **Rating**: A- (PRODUCTION READY)
- **Issues**: 0 critical (believed to be fixed)

### After Comprehensive Review (ACTUAL):
- **Rating**: **D+ (CRITICAL ISSUES REMAIN)**
- **Issues**: **6 CRITICAL credential exposures**

### Breakdown:

| Category | Score | Notes |
|----------|-------|-------|
| SQL Injection Protection | A | ✅ Properly fixed |
| Command Injection Protection | A | ✅ Comprehensive |
| Input Validation | A | ✅ Defense-in-depth |
| **Credential Management** | **F** | ❌ **CRITICAL: Hardcoded credentials** |
| Error Handling | B+ | ✅ Good sanitization |
| Testing | A | ✅ 15/15 security tests |
| Documentation | A+ | ✅ Comprehensive |

**Overall**: **D+** (Dragged down by critical credential exposure)

---

## 🚨 IMMEDIATE ACTIONS REQUIRED

### Priority 1: URGENT (Within 24 hours)

1. **Rotate ALL Exposed Credentials**:
   ```bash
   # Generate new Qdrant API key
   # Generate new Coolify API token
   # Update production systems
   ```

2. **Remove Hardcoded Credentials**:
   - [ ] Fix `src/qdrant/client.ts` (remove fallback key)
   - [ ] Fix `coolify-mcp.service` (use placeholder)
   - [ ] Fix `claude-config.json` (use placeholder)
   - [ ] Fix `claude-desktop-config.json` (use placeholder)
   - [ ] Fix `n8n-examples/*.json` (use placeholders)
   - [ ] Fix `qdrant-docker.sh` (require env var)

3. **Commit Security Fixes**:
   ```bash
   git add src/qdrant/client.ts coolify-mcp.service claude*.json n8n-examples/*.json qdrant-docker.sh
   git commit -m "fix: remove all hardcoded production credentials"
   ```

### Priority 2: HIGH (Within 48 hours)

4. **Clean Git History**:
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   # Remove credentials from ALL commits
   # Force push (coordinate with team!)
   ```

5. **Update .gitignore**:
   ```bash
   # Add sensitive config files
   echo "coolify-mcp.service" >> .gitignore
   echo "claude-config.json" >> .gitignore
   echo "claude-desktop-config.json" >> .gitignore
   ```

6. **Create Template Files**:
   ```bash
   # Rename existing files to .example
   # Add placeholders instead of real credentials
   # Document how to create actual config files
   ```

### Priority 3: MEDIUM (Within 1 week)

7. **Add Pre-commit Hooks**:
   ```bash
   # Install git-secrets or similar
   npm install --save-dev husky
   npx husky install
   npx husky add .husky/pre-commit "git secrets --scan"
   ```

8. **Add CI/CD Secret Scanning**:
   ```yaml
   # GitHub Actions example
   - name: Scan for secrets
     uses: trufflesecurity/trufflehog@main
   ```

9. **Security Documentation**:
   - [ ] Update SECURITY.md with credential management
   - [ ] Add section on credential rotation
   - [ ] Document what NOT to commit

---

## 📝 CORRECTED v1.0.1 RELEASE STATUS

### What v1.0.1 Actually Fixed:
- ✅ SQL injection in 3 files
- ✅ Command injection in server commands
- ✅ .env.example credential exposure
- ✅ Input sanitization utilities
- ✅ Error message sanitization

### What v1.0.1 DID NOT Fix:
- ❌ Hardcoded credentials in source code
- ❌ Production credentials in service files
- ❌ Production credentials in config files
- ❌ Production credentials in example files
- ❌ Production credentials in shell scripts
- ❌ Credentials in git history

### Required Additional Release:

**v1.0.2 (CRITICAL SECURITY PATCH)** - REQUIRED
- Fix all 6 critical credential exposures
- Clean git history
- Add pre-commit hooks
- Update security documentation

---

## 🎯 RECOMMENDATION

**CURRENT STATUS**: **NOT PRODUCTION READY**

**REQUIRED BEFORE PRODUCTION**:
1. ✅ v1.0.1 security fixes (already done)
2. ❌ **v1.0.2 credential removal** (CRITICAL - not done)
3. ❌ **Credential rotation** (URGENT - not done)
4. ❌ **Git history cleanup** (HIGH - not done)
5. ✅ Security tests passing (already done)
6. ✅ Documentation complete (already done)

**TIMELINE**:
- **Immediate** (24h): Remove credentials, rotate keys
- **Short-term** (48h): Clean git history
- **Medium-term** (1 week): Add preventive measures

**REVISED SECURITY RATING AFTER v1.0.2**:
- Expected: **A-** (Production Ready)
- Current: **D+** (Critical Issues Remain)

---

## 📞 ESCALATION

This review has identified **CRITICAL SECURITY ISSUES** that were not addressed in v1.0.1.

**Severity**: CRITICAL
**Impact**: HIGH (Full infrastructure compromise possible)
**Urgency**: IMMEDIATE (Credentials already exposed in git)
**Action**: Rotate credentials and fix code within 24 hours

---

**Review Status**: 🔴 **CRITICAL ISSUES FOUND**
**Production Ready**: ❌ **NO**
**Required Action**: **IMMEDIATE CREDENTIAL ROTATION + CODE FIXES**

---

*This review represents an independent, comprehensive security audit post-v1.0.1 and has uncovered additional critical issues that require immediate remediation before production deployment.*
