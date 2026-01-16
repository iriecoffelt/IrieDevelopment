# Troubleshoot: env-config.js 404 with GitHub Actions

## Current Status ✅

- ✅ GitHub Pages Source: **GitHub Actions** (correct)
- ✅ Workflow deploys to: `gh-pages` branch
- ✅ File exists in `gh-pages`: `env-config.js` (378 bytes, updated Jan 15 20:25)
- ❌ Live site returns: 404 for `env-config.js`

## Possible Causes

### 1. GitHub Pages Cache Delay ⏰
GitHub Pages can take **2-5 minutes** to update after deployment.

**Solution:**
- Wait 2-5 minutes after the last workflow run
- Try accessing: https://www.irie-development.com/env-config.js
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### 2. Workflow Not Running Recently 🔄
The file was last updated Jan 15 20:25. Check if the workflow has run since then.

**Check:**
1. Go to: https://github.com/iriecoffelt/IrieDevelopment/actions
2. Look for the latest "Deploy Website" workflow run
3. Check if it completed successfully

**If workflow hasn't run recently:**
- Push a new commit to `main` branch to trigger deployment
- Or manually trigger: Actions → Deploy Website → Run workflow

### 3. GitHub Pages Build Delay 🏗️
Even with GitHub Actions, GitHub Pages needs to rebuild.

**Check build status:**
1. Go to: https://github.com/iriecoffelt/IrieDevelopment/settings/pages
2. Look for "Workflow details" section
3. Check if there's a recent build/deployment

### 4. File Path Issue 📁
Verify the file is at the root of `gh-pages` branch.

**Verify:**
```bash
git checkout gh-pages
ls -la env-config.js  # Should be at root
```

## Quick Fixes

### Fix 1: Force Rebuild
1. Go to: https://github.com/iriecoffelt/IrieDevelopment/settings/pages
2. Click **"Save"** (even if nothing changed) - this forces a rebuild
3. Wait 2-3 minutes
4. Test: https://www.irie-development.com/env-config.js

### Fix 2: Trigger New Deployment
```bash
# Make an empty commit to trigger workflow
git commit --allow-empty -m "Trigger deployment to fix env-config.js"
git push origin main
```

Then wait 2-5 minutes for GitHub Pages to update.

### Fix 3: Check Workflow Logs
1. Go to: https://github.com/iriecoffelt/IrieDevelopment/actions
2. Click on the latest workflow run
3. Check the "Verify env-config.js deployment" step
4. Verify it shows: `✅ SUCCESS: env-config.js is in gh-pages branch`

## Verify File in gh-pages Branch

The file should exist and contain:
```javascript
window.ENV_CONFIG = {
  emailjsUserId: 'zRYVGu1o6DDmrdc4f',
  emailjsServiceId: 'service_ju06a1p',
  emailjsTemplateId: 'template_925ze9i'
};
```

## Test Commands

```bash
# Check if file exists in gh-pages
git checkout gh-pages
ls -la env-config.js

# Check file content
cat env-config.js

# Test live site (wait 2-5 min after deployment)
curl https://www.irie-development.com/env-config.js
```

## Expected Behavior

With GitHub Actions as the source:
- Workflow runs → Deploys to `gh-pages` → GitHub Pages serves from `gh-pages`
- File should be accessible at: https://www.irie-development.com/env-config.js
- Should return JavaScript, not HTML 404

## If Still Not Working

1. **Check GitHub Pages build logs:**
   - Settings → Pages → Scroll to "Workflow details"
   - Look for any errors

2. **Verify CNAME file:**
   - Make sure `CNAME` file exists in `gh-pages` branch
   - Should contain: `www.irie-development.com`

3. **Check domain DNS:**
   - Verify DNS is pointing to GitHub Pages
   - Can take up to 24 hours for DNS changes

4. **Try direct GitHub Pages URL:**
   - https://iriecoffelt.github.io/IrieDevelopment/env-config.js
   - If this works, it's a CNAME/DNS issue
