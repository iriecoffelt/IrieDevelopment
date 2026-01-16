# Security Audit - Exposed Secrets

## 🔴 CRITICAL ISSUES FOUND

### 1. JSONBin Access Key Hardcoded in Multiple Files
**Risk Level: HIGH** ⚠️

**Files with hardcoded JSONBin Access Key:**
- `newsletter.js` (line 18) - Hardcoded fallback: `$2a$10$.tte9gaAB5LnvRsH2dUz4OFuloHrp3GWDQsCdpRmgcfZ3uf4TYbsq`
- `admin.html` (multiple lines) - Hardcoded in 8+ places
- These files are **committed to GitHub** (public repository)

**Impact:**
- Anyone can read your JSONBin access key from your GitHub repo
- They can access/modify your subscriber data
- They can read/write to your JSONBin bins

### 2. JSONBin Secrets in env-config.js (Deployed to GitHub Pages)
**Risk Level: HIGH** ⚠️

**Issue:**
- `env-config.js` contains JSONBin access key and bin ID
- This file is deployed to **public GitHub Pages**
- Anyone can view: `https://www.irie-development.com/env-config.js`

**Current content:**
```javascript
window.ENV_CONFIG = {
  emailjsUserId: '...',           // ✅ OK (public key)
  emailjsServiceId: '...',        // ✅ OK (public key)
  emailjsTemplateId: '...',       // ✅ OK (public key)
  jsonbinAccessKey: '...',        // ❌ SECRET - Should NOT be here!
  jsonbinBinId: '...'             // ⚠️ Should be kept private
};
```

### 3. Old newsletter.js Still Contains Secrets
**Risk Level: MEDIUM** ⚠️

- `newsletter.js` has hardcoded JSONBin secrets as fallbacks
- This file is still being used (should use `newsletter-serverless.js` instead)
- Committed to GitHub repo

## ✅ WHAT'S SECURE

1. **Vercel Serverless Functions** ✅
   - JSONBin secrets stored in Vercel environment variables
   - Never exposed to browser
   - Only accessible server-side

2. **GitHub Secrets** ✅
   - Stored securely in GitHub
   - Masked in workflow logs
   - Not accessible from browser

3. **EmailJS Values** ✅
   - These are public keys (safe to expose)
   - User ID, Service ID, Template ID are meant to be public

## 🔧 REQUIRED FIXES

### Fix 1: Remove JSONBin Secrets from env-config.js
Since you're using serverless functions, JSONBin secrets should NOT be in `env-config.js`.

### Fix 2: Remove Hardcoded Secrets from newsletter.js
Remove the hardcoded JSONBin fallback values.

### Fix 3: Update admin.html
Remove hardcoded JSONBin access keys, use serverless API instead.

### Fix 4: Rotate JSONBin Access Key
Since the key is exposed, generate a new one in JSONBin.io and update it in Vercel.

## 📋 ACTION ITEMS

- [x] Remove JSONBin secrets from `env-config.js` generation ✅
- [x] Remove hardcoded secrets from `newsletter.js` ✅
- [x] Update `admin.html` to use serverless API ✅
- [ ] **ROTATE JSONBin access key in JSONBin.io** ⚠️ **CRITICAL - DO THIS NOW**
- [ ] Update Vercel environment variables with new key
- [ ] Verify no secrets in GitHub repo history (consider using git-secrets or BFG Repo-Cleaner)

## ✅ FIXES COMPLETED

### 1. Removed JSONBin Secrets from env-config.js ✅
- Updated `.github/workflows/deploy.yml` to only include EmailJS (public keys)
- JSONBin secrets are no longer exposed in deployed `env-config.js`

### 2. Removed Hardcoded Secrets from newsletter.js ✅
- Removed hardcoded JSONBin access key fallback
- Removed hardcoded JSONBin bin ID fallback
- File now requires `env-config.js` or serverless API (no secrets exposed)

### 3. Updated admin.html to Use Serverless API ✅
- Replaced all hardcoded JSONBin calls with serverless API calls
- Subscriber operations now use `/api/subscribers` and `/api/subscribers-save`
- Apps data functions now require access key from localStorage (no hardcoded fallback)
- All 10+ hardcoded secret instances removed

## ⚠️ CRITICAL NEXT STEPS

### 1. Rotate Your JSONBin Access Key (REQUIRED)
The old key (`$2a$10$.tte9gaAB5LnvRsH2dUz4OFuloHrp3GWDQsCdpRmgcfZ3uf4TYbsq`) is still exposed in:
- Your GitHub repository commit history
- Any deployed versions of `env-config.js` (if cached)
- Documentation files (examples)

**Steps:**
1. Go to https://jsonbin.io/app/account/api-keys
2. Generate a **new** access key
3. **Delete** the old access key
4. Update the new key in Vercel environment variables

### 2. Update Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `JSONBIN_ACCESS_KEY` with the new key
3. Redeploy your Vercel functions (or wait for auto-deploy)

### 3. Clean Git History (Optional but Recommended)
The old key is still in your Git history. Consider:
- Using `git-secrets` to prevent future commits
- Using BFG Repo-Cleaner to remove secrets from history (if repository is private)
- Or accept that the old key is compromised and ensure it's deleted from JSONBin.io
