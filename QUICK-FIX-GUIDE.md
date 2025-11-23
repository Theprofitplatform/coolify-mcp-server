# 🚀 Quick Fix Guide - Hardcoded Credentials

**For Impatient People Who Want to Fix This Fast**

---

## ⚡ TL;DR - Execute These Commands

```bash
# 1. IMMEDIATE: Rotate credentials (do this FIRST!)
# - Go to Qdrant console: Generate new API key
# - Go to Coolify dashboard: Generate new API token
# - Update production .env with new credentials
# - Revoke old credentials

# 2. Fix code (automated script)
./scripts/fix-hardcoded-credentials.sh

# 3. Verify fixes
./scripts/verify-no-credentials.sh

# 4. Build and test
npm run build
npm test

# 5. Commit fixes
git add .
git commit -m "fix: remove hardcoded credentials (v1.0.2)"

# 6. Clean git history (COORDINATE WITH TEAM FIRST!)
# Download BFG: wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
java -jar bfg-1.14.0.jar --replace-text /tmp/credentials.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all

# 7. Done!
```

---

## 🎯 What This Fixes

**6 Critical Issues** (CVSS 9.1):
1. ❌ Hardcoded Qdrant API key in `src/qdrant/client.ts`
2. ❌ Production token in `coolify-mcp.service`
3. ❌ Production token in `claude-config.json`
4. ❌ Production token in `claude-desktop-config.json`
5. ❌ Production tokens in `n8n-examples/*.json`
6. ❌ API key in `qdrant-docker.sh`

---

## 📋 Prerequisites

- [ ] Backup repository: `git clone --mirror . ../backup`
- [ ] Access to Qdrant console
- [ ] Access to Coolify dashboard
- [ ] Access to production .env files
- [ ] Team coordinated for git history rewrite

---

## 🔑 Step 1: Rotate Credentials (30 minutes)

### Rotate Qdrant API Key

```bash
# 1. Login to Qdrant console
open https://qdrant.theprofitplatform.com.au

# 2. Generate new key: Settings > API Keys > Generate

# 3. Test new key
export NEW_QDRANT_KEY="your-new-key-here"
curl -H "api-key: $NEW_QDRANT_KEY" \
  https://qdrant.theprofitplatform.com.au:443/collections

# 4. Update production
ssh production
sudo nano /opt/coolify-mcp/.env
# Change QDRANT_API_KEY
sudo systemctl restart coolify-mcp

# 5. Revoke old key in Qdrant console
```

### Rotate Coolify API Token

```bash
# 1. Login to Coolify
open https://coolify.theprofitplatform.com.au

# 2. Generate new token: Settings > API > Create Token

# 3. Test new token
export NEW_COOLIFY_TOKEN="your-new-token-here"
curl -H "Authorization: Bearer $NEW_COOLIFY_TOKEN" \
  https://coolify.theprofitplatform.com.au/api/v1/version

# 4. Update production
ssh production
sudo nano /opt/coolify-mcp/.env
# Change COOLIFY_TOKEN
sudo systemctl restart coolify-mcp

# 5. Revoke old token in Coolify dashboard
```

---

## 🔧 Step 2: Fix Code (5 minutes)

### Automated Fix

```bash
# Run automated fix script
./scripts/fix-hardcoded-credentials.sh

# Review changes
git diff

# If satisfied, continue. If not, manual fix below.
```

### Manual Fix (if needed)

<details>
<summary>Click to expand manual fix instructions</summary>

#### Fix src/qdrant/client.ts

```typescript
// Replace line 17:
// OLD: const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '***REMOVED***';

// NEW:
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

if (!QDRANT_API_KEY) {
  throw new Error('QDRANT_API_KEY environment variable is required');
}
```

#### Fix coolify-mcp.service

```bash
# Rename to .example
mv coolify-mcp.service coolify-mcp.service.example

# Edit .example to use EnvironmentFile
# Add to .gitignore
echo "coolify-mcp.service" >> .gitignore
```

#### Fix config files

```bash
# Create .example versions with placeholders
cp claude-config.json claude-config.example.json
cp claude-desktop-config.json claude-desktop-config.example.json

# Replace credentials with placeholders
sed -i 's/***REMOVED***/YOUR_COOLIFY_API_TOKEN_HERE/g' \
  claude-config.example.json claude-desktop-config.example.json

# Add to .gitignore
echo "claude-config.json" >> .gitignore
echo "claude-desktop-config.json" >> .gitignore
```

#### Fix N8N examples

```bash
# Replace in all files
find n8n-examples -name "*.json" -exec \
  sed -i 's/***REMOVED***/YOUR_COOLIFY_API_TOKEN_HERE/g' {} \;
```

#### Fix qdrant-docker.sh

```bash
# Add env var check at top of script
cat > qdrant-docker.sh <<'EOF'
#!/bin/bash

if [ -z "$QDRANT_API_KEY" ]; then
  echo "ERROR: QDRANT_API_KEY required"
  exit 1
fi

# ... rest of script
EOF
```

</details>

---

## ✅ Step 3: Verify (2 minutes)

```bash
# Run verification script
./scripts/verify-no-credentials.sh

# Should output: "ALL CHECKS PASSED"
# If not, fix issues and re-run
```

---

## 🧪 Step 4: Test (5 minutes)

```bash
# Build
npm run build

# Test
npm test

# Expected: 98/102 passing (4 require live instance)
```

---

## 💾 Step 5: Commit (2 minutes)

```bash
# Stage changes
git add .

# Commit
git commit -m "fix: remove all hardcoded production credentials (v1.0.2)

SECURITY FIXES (CRITICAL):
- Remove hardcoded Qdrant API key from src/qdrant/client.ts
- Remove production tokens from service and config files
- Replace with environment variable requirements
- Create .example templates with placeholders

BREAKING CHANGES:
- Users must create config files from .example templates
- QDRANT_API_KEY environment variable required (no fallback)

See: SECURITY-REMEDIATION-PLAN.md for details

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 🗑️ Step 6: Clean Git History (1-2 hours)

**⚠️ WARNING: This rewrites history. Coordinate with team!**

```bash
# 1. Create credentials list
cat > /tmp/credentials.txt <<'EOF'
***REMOVED***
***REMOVED***
EOF

# 2. Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# 3. Run BFG
java -jar bfg-1.14.0.jar --replace-text /tmp/credentials.txt

# 4. Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Verify
git log --all -S "***REMOVED***"  # Should be empty

# 6. Force push (COORDINATE FIRST!)
git push origin --force --all
git push origin --force --tags

# 7. Team must re-clone
# Everyone: git clone <repository-url>
```

---

## 🎯 Success Checklist

After completion:

- [ ] Old credentials rotated and revoked
- [ ] Automated fix script ran successfully
- [ ] Verification script passed all checks
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Code committed: no hardcoded credentials
- [ ] Git history cleaned (no credentials in any commit)
- [ ] Team re-cloned repository
- [ ] Production running with new credentials

---

## 📊 Expected Timeline

| Step | Time | Total |
|------|------|-------|
| 1. Rotate credentials | 30 min | 30 min |
| 2. Fix code | 5 min | 35 min |
| 3. Verify | 2 min | 37 min |
| 4. Test | 5 min | 42 min |
| 5. Commit | 2 min | 44 min |
| 6. Clean history | 1-2 hours | 2-3 hours |
| **TOTAL** | **2-3 hours** | |

---

## 🆘 If Something Goes Wrong

### Build Fails

```bash
# Restore from backup
cd ..
rm -rf coolify-mcp
cp -r backup coolify-mcp
cd coolify-mcp
```

### Tests Fail

```bash
# Check environment variables
echo $QDRANT_API_KEY  # Should be set
echo $COOLIFY_TOKEN   # Should be set

# Run specific test
npm test -- tests/security/injection-prevention.test.ts
```

### Git History Cleanup Fails

```bash
# Restore from backup
cd ..
git clone backup coolify-mcp-restored
cd coolify-mcp-restored
git push origin --force --all
```

---

## 📚 Full Documentation

For complete details, see:

- **SECURITY-REMEDIATION-PLAN.md** - Complete step-by-step plan (20+ pages)
- **CRITICAL-REVIEW-FINDINGS.md** - Security review findings
- **scripts/fix-hardcoded-credentials.sh** - Automated fix script
- **scripts/verify-no-credentials.sh** - Verification script

---

## ✅ Done!

After completing all steps:

1. ✅ All hardcoded credentials removed
2. ✅ Code requires environment variables
3. ✅ Git history cleaned
4. ✅ Production using new credentials
5. ✅ Security rating: D+ → A-

**Status**: Production Ready (after credential rotation)

---

**Need help?** See `SECURITY-REMEDIATION-PLAN.md` for detailed instructions.
